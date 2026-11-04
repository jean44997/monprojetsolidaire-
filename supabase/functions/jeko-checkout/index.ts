import { createClient } from "npm:@supabase/supabase-js@2";

const providerNames: Record<string, string> = {
  wave: "wave",
  orange: "orange_money",
  mtn: "mtn_momo",
  moov: "moov_money",
  djamo: "djamo",
};
const allowedMethods = new Set(Object.keys(providerNames));
const siteUrl = "https://monprojetsolidaire.vercel.app";
const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "authorization, apikey, x-client-info, content-type",
  "access-control-max-age": "86400",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

async function fingerprint(secret: string, value: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return json({ error: "application_json_required" }, 415);
  }

  const jekoApiKey = Deno.env.get("JEKO_API_KEY");
  const jekoApiKeyId = Deno.env.get("JEKO_API_KEY_ID");
  const storeId = Deno.env.get("JEKO_STORE_ID");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const secretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (!jekoApiKey || !jekoApiKeyId || !storeId || !supabaseUrl || !secretKeys) {
    return json({ error: "payment_provider_not_configured" }, 503);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  const fundraiserId = typeof body.fundraiserId === "string" ? body.fundraiserId : "";
  const amount = body.amount;
  const method = typeof body.paymentMethod === "string" ? body.paymentMethod : "";
  const publicName = typeof body.contributorName === "string" ? body.contributorName.trim().slice(0, 100) : "";
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(fundraiserId) ||
    !Number.isSafeInteger(amount) || Number(amount) <= 0 || Number(amount) > 2_000_000 ||
    !allowedMethods.has(method)
  ) {
    return json({ error: "invalid_payment_request" }, 400);
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

  const clientIp = request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const ipHash = await fingerprint(jekoApiKey, clientIp);
  const { data: allowed, error: rateLimitError } = await supabase.rpc("claim_payment_request", { p_ip_hash: ipHash });
  if (rateLimitError) return json({ error: "payment_rate_limit_unavailable" }, 503);
  if (!allowed) return json({ error: "too_many_payment_attempts" }, 429);

  const { data: fundraiser, error: fundraiserError } = await supabase
    .from("fundraisers")
    .select("id, goal, minimum, free_amount, status, visibility, deleted_at")
    .eq("id", fundraiserId)
    .maybeSingle();
  if (fundraiserError) return json({ error: "fundraiser_lookup_failed" }, 503);
  if (!fundraiser || fundraiser.deleted_at || fundraiser.visibility !== "Publique") {
    return json({ error: "fundraiser_not_found" }, 404);
  }
  if (fundraiser.status !== "active") return json({ error: "fundraiser_closed" }, 409);
  if (!fundraiser.free_amount && Number(amount) < Number(fundraiser.minimum)) {
    return json({ error: "below_minimum", minimum: fundraiser.minimum }, 400);
  }

  const reference = `MPS-${crypto.randomUUID()}`;
  const { data: contribution, error: insertError } = await supabase
    .from("contributions")
    .insert({
      fundraiser_id: fundraiserId,
      amount: Number(amount),
      currency: "XOF",
      public_name: publicName,
      status: "pending",
      payment_provider: providerNames[method],
      provider_reference: reference,
    })
    .select("id")
    .single();
  if (insertError || !contribution) return json({ error: "payment_intent_creation_failed" }, 503);

  let providerResponse: Response;
  try {
    providerResponse = await fetch("https://api.jeko.africa/partner_api/payment_requests", {
      method: "POST",
      headers: {
        "X-API-KEY": jekoApiKey,
        "X-API-KEY-ID": jekoApiKeyId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        storeId,
        amountCents: Number(amount) * 100,
        currency: "XOF",
        reference,
        paymentDetails: {
          type: "redirect",
          data: {
            paymentMethod: method,
            successUrl: `${siteUrl}/cagnotte/${fundraiserId}?payment=return&reference=${encodeURIComponent(reference)}`,
            errorUrl: `${siteUrl}/cagnotte/${fundraiserId}?payment=return&reference=${encodeURIComponent(reference)}`,
          },
        },
      }),
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    return json({ error: "payment_provider_unavailable" }, 502);
  }

  let paymentRequest: Record<string, unknown>;
  try {
    paymentRequest = await providerResponse.json();
  } catch {
    return json({ error: "payment_provider_invalid_response" }, 502);
  }
  const redirectUrl = typeof paymentRequest.redirectUrl === "string" ? paymentRequest.redirectUrl : "";
  let destination: URL | null = null;
  try {
    destination = new URL(redirectUrl);
  } catch {
    destination = null;
  }
  if (!providerResponse.ok || paymentRequest.status !== "pending" || !destination || destination.protocol !== "https:" || !destination.hostname.endsWith(".jeko.africa")) {
    if (providerResponse.status >= 400 && providerResponse.status < 500) {
      await supabase.from("contributions").update({ status: "failed" }).eq("id", contribution.id).eq("status", "pending");
    }
    return json({ error: "payment_provider_rejected_request" }, 502);
  }

  if (typeof paymentRequest.id === "string") {
    await supabase.from("contributions")
      .update({ payment_provider_request_id: paymentRequest.id })
      .eq("id", contribution.id)
      .eq("status", "pending");
  }

  return json({ redirectUrl, reference, contributionId: contribution.id });
});
