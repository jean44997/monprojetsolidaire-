import { createClient } from "npm:@supabase/supabase-js@2";

const encoder = new TextEncoder();
const providerNames: Record<string, string> = {
  wave: "wave",
  orange: "orange_money",
  mtn: "mtn_momo",
  moov: "moov_money",
  djamo: "djamo",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

async function hmac(secret: string, body: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const webhookSecret = Deno.env.get("JEKO_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const secretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (!webhookSecret || !supabaseUrl || !secretKeys) return json({ error: "webhook_not_configured" }, 503);

  const rawBody = await request.text();
  if (rawBody.length > 32_768) return json({ error: "payload_too_large" }, 413);
  const suppliedSignature = request.headers.get("Jeko-Signature") ?? "";
  if (!/^[a-f0-9]{64}$/i.test(suppliedSignature)) return json({ error: "invalid_signature" }, 401);
  if (!safeEqual(await hmac(webhookSecret, rawBody), suppliedSignature.toLowerCase())) {
    return json({ error: "invalid_signature" }, 401);
  }

  const eventName = request.headers.get("Jeko-Event");
  let transaction: Record<string, any>;
  try {
    transaction = JSON.parse(rawBody);
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  // A business-level webhook may also deliver transfers and other events.
  if (eventName !== "TRANSACTION_COMPLETED") return json({ received: true, ignored: true });
  if (transaction.transactionType !== "payment" || transaction.status !== "success") {
    return json({ received: true, ignored: true });
  }

  const amountCents = transaction.amount?.amount;
  const currency = transaction.amount?.currency;
  const reference = transaction.transactionDetails?.reference;
  const paymentProvider = providerNames[transaction.paymentMethod];
  const expectedStore = Deno.env.get("JEKO_STORE_ID");
  if (
    !Number.isSafeInteger(amountCents) || amountCents <= 0 || amountCents % 100 !== 0 || currency !== "XOF" ||
    typeof reference !== "string" || reference.length < 5 || !paymentProvider ||
    !expectedStore || transaction.storeId !== expectedStore
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

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: contribution, error: lookupError } = await supabase
    .from("contributions")
    .select("id, amount, status, payment_provider, payment_provider_request_id")
    .eq("provider_reference", reference)
    .maybeSingle();
  if (lookupError) return json({ error: "payment_lookup_failed" }, 503);
  if (!contribution) return json({ error: "payment_intent_not_found" }, 404);
  if (Number(contribution.amount) !== amountCents / 100 || contribution.payment_provider !== paymentProvider) {
    return json({ error: "payment_mismatch" }, 409);
  }
  if (contribution.payment_provider_request_id && contribution.payment_provider_request_id !== transaction.transactionDetails?.id) {
    return json({ error: "payment_request_mismatch" }, 409);
  }
  if (contribution.status === "confirmed") return json({ received: true, duplicate: true });
  if (contribution.status !== "pending") return json({ received: true, ignored: true });

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
  if (latest?.status === "confirmed" && Number(latest.amount) === amountCents / 100 && latest.payment_provider === paymentProvider) {
    return json({ received: true, duplicate: true });
  }
  return json({ error: "payment_not_confirmed" }, 409);
});
