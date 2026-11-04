import { requireSupabase } from "@/lib/supabase";

export type Contribution = { id: string; amount: number; name: string; method: string; createdAt: string };
export type Withdrawal = { id: string; amount: number; destination: string; status: string; createdAt: string };
export type Fundraiser = {
  id: string; slug: string; title: string; description: string; category: string; goal: number;
  minimum: number; freeAmount: boolean; deadline: string; visibility: string; beneficiary: string; beneficiaryName: string;
  cover: string; organizer: string; status: "active" | "closed"; createdAt: string;
  contributions: Contribution[]; withdrawals: Withdrawal[]; collectedTotal?: number; contributionCount?: number;
};

type DbFundraiser = Record<string, any>;

function mapContribution(row: DbFundraiser): Contribution {
  return { id: row.id, amount: Number(row.amount), name: row.public_name || "Contributeur anonyme", method: row.payment_provider || "", createdAt: row.created_at };
}

function mapWithdrawal(row: DbFundraiser): Withdrawal {
  return { id: row.id, amount: Number(row.amount), destination: row.destination, status: row.status, createdAt: row.created_at };
}

async function mapFundraiser(row: DbFundraiser): Promise<Fundraiser> {
  const contributions = (row.contributions || row.public_contribution_feed || []).filter((item: DbFundraiser) => !item.status || item.status === "confirmed").map(mapContribution);
  const withdrawals = (row.withdrawals || []).map(mapWithdrawal);
  let cover = row.cover || "";
  if (cover && !/^https?:\/\//i.test(cover) && !cover.startsWith("data:")) {
    const { data } = await requireSupabase().storage.from("fundraiser-covers").createSignedUrl(cover, 3600);
    cover = data?.signedUrl || "";
  }
  return {
    id: row.id, slug: row.slug, title: row.title, description: row.description, category: row.category,
    goal: Number(row.goal), minimum: Number(row.minimum), freeAmount: row.free_amount, deadline: row.deadline || "",
    visibility: row.visibility, beneficiary: row.beneficiary, beneficiaryName: row.beneficiary_name,
    cover, organizer: row.organizer || "Organisateur Monprojetsolidaire", status: row.status,
    createdAt: row.created_at, contributions, withdrawals,
    collectedTotal: row.collected_total === undefined ? undefined : Number(row.collected_total),
    contributionCount: row.contribution_count === undefined ? contributions.length : Number(row.contribution_count),
  };
}

function slugify(title: string) {
  return title.toLocaleLowerCase("fr").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "cagnotte";
}

export async function listFundraisers(): Promise<Fundraiser[]> {
  const client = requireSupabase();
  const { data: { user }, error: userError } = await client.auth.getUser();
  if (userError) throw userError;
  if (!user) return [];
  const { data, error } = await client.from("fundraisers")
    .select("*, contributions(id, amount, public_name, payment_provider, created_at, status), withdrawals(id, amount, destination, status, created_at)")
    .eq("owner_id", user.id).is("deleted_at", null).order("created_at", { ascending: false });
  if (error) throw error;
  return Promise.all((data || []).map(mapFundraiser));
}

export async function listPublicFundraisers(): Promise<Fundraiser[]> {
  const { data, error } = await requireSupabase().from("public_fundraiser_catalog")
    .select("*").eq("status", "active").order("created_at", { ascending: false });
  if (error) throw error;
  return Promise.all((data || []).map(mapFundraiser));
}

export async function findFundraiser(slug: string): Promise<Fundraiser | null> {
  const client = requireSupabase();
  const isId = /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(slug);
  const { data, error } = await client.from("public_fundraiser_catalog").select("*")
    .eq(isId ? "id" : "slug", slug).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const { data: support, error: supportError } = await client.from("public_contribution_feed")
    .select("id, amount, public_name, created_at").eq("fundraiser_id", data.id)
    .order("created_at", { ascending: false }).limit(8);
  if (supportError) throw supportError;
  return mapFundraiser({ ...data, public_contribution_feed: support || [] });
}

export async function saveFundraiser(data: Omit<Fundraiser, "id" | "slug" | "createdAt" | "contributions" | "withdrawals" | "status" | "collectedTotal" | "contributionCount">) {
  const client = requireSupabase();
  const { data: { user }, error: userError } = await client.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error("AUTH_REQUIRED");
  const id = crypto.randomUUID();
  const baseSlug = slugify(data.title);
  const slug = `${baseSlug}-${id.slice(0, 8)}`;
  let cover = data.cover;
  let uploadedPath: string | null = null;

  if (cover.startsWith("data:image/")) {
    const blob = await (await fetch(cover)).blob();
    const ext = ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" } as Record<string, string>)[blob.type];
    if (!ext || blob.size > 1_258_291) throw new Error("INVALID_COVER");
    uploadedPath = `${user.id}/${id}.${ext}`;
    const { error: uploadError } = await client.storage.from("fundraiser-covers").upload(uploadedPath, blob, { contentType: blob.type, upsert: false });
    if (uploadError) throw uploadError;
    cover = uploadedPath;
  }

  const payload = {
    id, slug, owner_id: user.id, title: data.title.trim(), description: data.description.trim(), category: data.category,
    goal: data.goal, minimum: data.freeAmount ? 0 : data.minimum, free_amount: data.freeAmount,
    deadline: data.deadline || null, visibility: data.visibility, beneficiary: data.beneficiary,
    beneficiary_name: data.beneficiaryName.trim(), cover, organizer: data.organizer.trim() || "Organisateur Monprojetsolidaire",
  };
  const { data: row, error } = await client.from("fundraisers").insert(payload).select("*").single();
  if (error) {
    if (uploadedPath) await client.storage.from("fundraiser-covers").remove([uploadedPath]);
    throw error;
  }
  return mapFundraiser(row);
}

export async function closeFundraiser(id: string) {
  const { data, error } = await requireSupabase().from("fundraisers").update({ status: "closed" })
    .eq("id", id).select("id").maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function deleteFundraiser(id: string) {
  const { data, error } = await requireSupabase().from("fundraisers").delete()
    .eq("id", id).select("id").maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function updateFundraiser(id: string, changes: Partial<Pick<Fundraiser, "title" | "description" | "goal" | "minimum" | "freeAmount" | "deadline" | "visibility" | "beneficiary" | "beneficiaryName" | "cover">>) {
  const client = requireSupabase();
  const { data: current, error: currentError } = await client.from("fundraisers").select("id, free_amount, contributions(amount, status)").eq("id", id).single();
  if (currentError) throw currentError;
  const collected = (current.contributions || []).filter((c: DbFundraiser) => c.status === "confirmed").reduce((sum: number, c: DbFundraiser) => sum + Number(c.amount), 0);
  const freeAmount = changes.freeAmount ?? current.free_amount;
  if (changes.goal !== undefined && changes.goal < collected) return false;
  const payload: DbFundraiser = {};
  if (changes.title !== undefined) payload.title = changes.title.trim();
  if (changes.description !== undefined) payload.description = changes.description.trim();
  if (changes.goal !== undefined) payload.goal = changes.goal;
  if (changes.minimum !== undefined || changes.freeAmount !== undefined) {
    payload.minimum = freeAmount ? 0 : changes.minimum;
    payload.free_amount = freeAmount;
  }
  if (changes.deadline !== undefined) payload.deadline = changes.deadline || null;
  if (changes.visibility !== undefined) payload.visibility = changes.visibility;
  if (changes.beneficiary !== undefined) payload.beneficiary = changes.beneficiary;
  if (changes.beneficiaryName !== undefined) payload.beneficiary_name = changes.beneficiaryName.trim();
  if (changes.cover !== undefined) payload.cover = changes.cover;
  const { data, error } = await client.from("fundraisers").update(payload).eq("id", id).select("id").maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function prepareWithdrawal(id: string, amount: number, destination: string) {
  const { data, error } = await requireSupabase().rpc("prepare_withdrawal", {
    p_fundraiser_id: id, p_amount: amount, p_destination: destination.trim(),
  });
  if (error) throw error;
  return data as string;
}

export async function confirmWithdrawal(intentId: string) {
  const { data, error } = await requireSupabase().rpc("confirm_withdrawal", { p_intent_id: intentId });
  if (error) throw error;
  return data as string;
}

export const collectedAmount = (item: Fundraiser) => item.collectedTotal ?? item.contributions.reduce((sum, contribution) => sum + contribution.amount, 0);
export const availableAmount = (item: Fundraiser) => Math.max(0, collectedAmount(item) - item.withdrawals.filter((withdrawal) => ["pending", "processing", "paid"].includes(withdrawal.status)).reduce((sum, withdrawal) => sum + withdrawal.amount, 0));
