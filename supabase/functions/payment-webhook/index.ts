import { createClient } from "npm:@supabase/supabase-js@2";

const encoder = new TextEncoder();
const maxSkewSeconds = 300;
const allowedProviders = new Set([
  "wave",
  "djamo",
  "orange_money",
  "mtn_momo",
  "moov_money",
]);

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

async function hmac(secret: string, message: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const webhookSecret = Deno.env.get("PAYMENT_WEBHOOK_HMAC_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const secretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (!webhookSecret || !supabaseUrl || !secretKeys) {
    return json({ error: "webhook_not_configured" }, 503);
  }

  const timestamp = request.headers.get("x-mps-timestamp") ?? "";
  const suppliedSignature = (request.headers.get("x-mps-signature") ?? "").replace(/^sha256=/i, "");
  const timestampSeconds = Number(timestamp);
  if (!/^\d{10}$/.test(timestamp) || !/^[a-f0-9]{64}$/i.test(suppliedSignature)) {
    return json({ error: "invalid_signature_headers" }, 401);
  }
  if (Math.abs(Math.floor(Date.now() / 1000) - timestampSeconds) > maxSkewSeconds) {
    return json({ error: "expired_signature" }, 401);
  }

  const rawBody = await request.text();
  if (rawBody.length > 32_768) return json({ error: "payload_too_large" }, 413);
  const expectedSignature = await hmac(webhookSecret, `${timestamp}.${rawBody}`);
  if (!safeEqual(expectedSignature, suppliedSignature.toLowerCase())) {
    return json({ error: "invalid_signature" }, 401);
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const eventId = typeof payload.event_id === "string" ? payload.event_id : "";
  const eventType = payload.event_type;
  const provider = typeof payload.provider === "string" ? payload.provider : "";
  const providerReference = typeof payload.provider_reference === "string" ? payload.provider_reference : "";
  const amount = payload.amount;
  const currency = payload.currency;
  if (
    !eventId || eventId.length > 160 || eventType !== "payment.succeeded" ||
    !allowedProviders.has(provider) || !providerReference || providerReference.length > 200 ||
    !Number.isSafeInteger(amount) || Number(amount) <= 0 || currency !== "XOF"
  ) {
    return json({ error: "invalid_payment_event" }, 400);
  }

  let keys: Record<string, string>;
  try {
    keys = JSON.parse(secretKeys);
  } catch {
    return json({ error: "server_configuration_error" }, 503);
  }
  const serviceKey = keys.default;
  if (!serviceKey) return json({ error: "server_configuration_error" }, 503);

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: contribution, error: lookupError } = await supabase
    .from("contributions")
    .select("id, amount, status, payment_provider")
    .eq("provider_reference", providerReference)
    .maybeSingle();

  if (lookupError) return json({ error: "payment_lookup_failed" }, 503);
  if (!contribution) return json({ error: "payment_intent_not_found" }, 404);
  if (Number(contribution.amount) !== amount || contribution.payment_provider !== provider) {
    return json({ error: "payment_mismatch" }, 409);
  }
  if (contribution.status === "confirmed") {
    return json({ received: true, duplicate: true });
  }
  if (contribution.status !== "pending") {
    return json({ error: "payment_not_pending" }, 409);
  }

  const { data: updated, error: updateError } = await supabase
    .from("contributions")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
    .eq("id", contribution.id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (updateError) return json({ error: "payment_confirmation_failed" }, 503);
  if (updated) return json({ received: true, duplicate: false });

  const { data: latest, error: latestError } = await supabase
    .from("contributions")
    .select("status, amount, payment_provider")
    .eq("id", contribution.id)
    .maybeSingle();
  if (latestError) return json({ error: "payment_confirmation_failed" }, 503);
  if (latest?.status === "confirmed" && Number(latest.amount) === amount && latest.payment_provider === provider) {
    return json({ received: true, duplicate: true });
  }
  return json({ error: "payment_not_confirmed" }, 409);
});
