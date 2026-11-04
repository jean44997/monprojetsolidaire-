import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "authorization, apikey, x-client-info, content-type",
  "access-control-max-age": "86400",
};
const providerNames: Record<string, string> = {
  wave: "wave",
  orange: "orange_money",
  mtn: "mtn_momo",
  moov: "moov_money",
  djamo: "djamo",
};
const providerMethods: Record<string, string> = Object.fromEntries(
  Object.entries(providerNames).map(([method, provider]) => [provider, method]),
);

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const secretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const jekoApiKey = Deno.env.get("JEKO_API_KEY");
  const jekoApiKeyId = Deno.env.get("JEKO_API_KEY_ID");
  const storeId = Deno.env.get("JEKO_STORE_ID");
  if (!secretKeys || !supabaseUrl || !jekoApiKey || !jekoApiKeyId || !storeId) return json({ error: "server_configuration_error" }, 503);
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  const reference = typeof body.reference === "string" ? body.reference : "";
  if (!/^MPS-[0-9a-f-]{36}$/i.test(reference)) return json({ error: "invalid_reference" }, 400);
  let keys: Record<string, string>;
  try {
    keys = JSON.parse(secretKeys);
  } catch {
    return json({ error: "server_configuration_error" }, 503);
  }
  if (!keys.default) return json({ error: "server_configuration_error" }, 503);
  const supabase = createClient(supabaseUrl, keys.default, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data, error } = await supabase
    .from("contributions")
    .select("id, status, amount, fundraiser_id, payment_provider, payment_provider_request_id")
    .eq("provider_reference", reference)
    .maybeSingle();
  if (error) return json({ error: "payment_status_unavailable" }, 503);
  if (!data) return json({ error: "payment_not_found" }, 404);

  if (data.status === "pending" && data.payment_provider_request_id && providerMethods[data.payment_provider]) {
    try {
      const providerResponse = await fetch(
        `https://api.jeko.africa/partner_api/payment_requests/${encodeURIComponent(data.payment_provider_request_id)}`,
        {
          headers: { "X-API-KEY": jekoApiKey, "X-API-KEY-ID": jekoApiKeyId },
          signal: AbortSignal.timeout(8_000),
        },
      );
      if (providerResponse.ok) {
        const requestState = await providerResponse.json();
        const samePayment = requestState.reference === reference && requestState.storeId === storeId &&
          requestState.paymentMethod === providerMethods[data.payment_provider];
        if (!samePayment) return json({ error: "payment_status_mismatch" }, 409);

        if (requestState.status === "success") {
          const confirmedAmount = requestState.transaction?.amount?.amount;
          const confirmedCurrency = requestState.transaction?.amount?.currency;
          if (confirmedAmount !== Number(data.amount) * 100 || confirmedCurrency !== "XOF") {
            return json({ error: "payment_amount_mismatch" }, 409);
          }
          const { error: confirmError } = await supabase.from("contributions")
            .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
            .eq("id", data.id).eq("status", "pending");
          if (confirmError) return json({ error: "payment_status_unavailable" }, 503);
          data.status = "confirmed";
        } else if (requestState.status === "error") {
          const { error: failError } = await supabase.from("contributions")
            .update({ status: "failed" })
            .eq("id", data.id).eq("status", "pending");
          if (failError) return json({ error: "payment_status_unavailable" }, 503);
          data.status = "failed";
        }
      }
    } catch {
      // A temporary provider outage does not change a pending contribution.
    }
  }

  return json({ status: data.status, amount: data.amount, fundraiserId: data.fundraiser_id });
});
