export type Contribution = { id: string; amount: number; name: string; method: string; createdAt: string };
export type Withdrawal = { id: string; amount: number; destination: string; status: "En attente"; createdAt: string };
export type Fundraiser = {
  id: string; slug: string; title: string; description: string; category: string; goal: number;
  minimum: number; freeAmount: boolean; deadline: string; visibility: string; beneficiary: string; beneficiaryName: string;
  cover: string; organizer: string; status: "active" | "closed"; createdAt: string;
  contributions: Contribution[]; withdrawals: Withdrawal[];
};
const KEY = "monprojetsolidaire-local-fundraisers-v1";
function read(): Fundraiser[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]") as Fundraiser[]; } catch { return []; }
}
function write(items: Fundraiser[]) { localStorage.setItem(KEY, JSON.stringify(items)); window.dispatchEvent(new Event("monprojetsolidaire-fundraisers")); }
export const listFundraisers = () => read();
export const findFundraiser = (slug: string) => read().find((item) => item.slug === slug || item.id === slug);
export function saveFundraiser(data: Omit<Fundraiser, "id" | "slug" | "createdAt" | "contributions" | "withdrawals" | "status">) {
  const id = crypto.randomUUID();
  const base = data.title.toLocaleLowerCase("fr").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 46) || "cagnotte";
  const all = read(); let slug = base; let suffix = 2;
  while (all.some((item) => item.slug === slug)) slug = `${base}-${suffix++}`;
  const item: Fundraiser = { ...data, id, slug, createdAt: new Date().toISOString(), status: "active", contributions: [], withdrawals: [] };
  write([item, ...all]); return item;
}
export function addContribution(id: string, data: Omit<Contribution, "id" | "createdAt">) {
  const all = read(); const item = all.find((x) => x.id === id); if (!item || item.status !== "active") return false;
  item.contributions.unshift({ ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }); write(all); return true;
}
export function requestWithdrawal(id: string, amount: number, destination: string) {
  const all = read(); const item = all.find((x) => x.id === id); if (!item) return false;
  const collected = item.contributions.reduce((sum, c) => sum + c.amount, 0);
  const reserved = item.withdrawals.reduce((sum, w) => sum + w.amount, 0);
  if (amount <= 0 || amount > collected - reserved || !destination.trim()) return false;
  item.withdrawals.unshift({ id: crypto.randomUUID(), amount, destination, status: "En attente", createdAt: new Date().toISOString() }); write(all); return true;
}
export function closeFundraiser(id: string) { const all = read(); const item = all.find((x) => x.id === id); if (item) { item.status = "closed"; write(all); } }
export function deleteFundraiser(id: string) {
  const all = read(); const item = all.find((x) => x.id === id);
  if (!item || item.status !== "closed") return false;
  write(all.filter((x) => x.id !== id)); return true;
}
export function updateFundraiser(id: string, changes: Partial<Pick<Fundraiser, "title" | "description" | "goal" | "minimum" | "freeAmount" | "deadline" | "visibility" | "beneficiary" | "beneficiaryName" | "cover">>) {
  const all = read(); const item = all.find((x) => x.id === id); if (!item || item.status !== "active") return false;
  const collected = collectedAmount(item);
  const title = changes.title === undefined ? item.title : changes.title.trim();
  const description = changes.description === undefined ? item.description : changes.description.trim();
  const goal = changes.goal ?? item.goal;
  const minimum = changes.freeAmount === true ? 0 : changes.minimum ?? item.minimum;
  if (!title || !description || goal < collected || goal <= 0 || minimum < 0 || (!changes.freeAmount && minimum === 0)) return false;
  Object.assign(item, changes, { title, description, goal, minimum }); write(all); return true;
}
export const collectedAmount = (item: Fundraiser) => item.contributions.reduce((sum, c) => sum + c.amount, 0);
export const availableAmount = (item: Fundraiser) => Math.max(0, collectedAmount(item) - item.withdrawals.reduce((sum, w) => sum + w.amount, 0));
