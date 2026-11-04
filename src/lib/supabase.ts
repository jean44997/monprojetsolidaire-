import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const env = import.meta.env as Record<string, string | undefined>;
const url = env.VITE_SUPABASE_URL?.trim();
const publicKey = (env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY)?.trim();

export const supabaseConfigured = Boolean(url && publicKey);
export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(url!, publicKey!, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
        persistSession: true,
        storageKey: "monprojetsolidaire-auth-v1",
      },
    })
  : null;

export function requireSupabase(): SupabaseClient {
  if (!supabase) throw new Error("SUPABASE_NOT_CONFIGURED");
  return supabase;
}

export function publicSupabaseError(error: unknown): string {
  const code = error instanceof Error ? error.message : String(error ?? "");
  if (code === "SUPABASE_NOT_CONFIGURED") return "La base sécurisée n’est pas encore configurée.";
  if (code.includes("Invalid login credentials")) return "E-mail ou mot de passe incorrect.";
  if (code.includes("User already registered")) return "Un compte existe déjà avec cette adresse e-mail.";
  if (code.includes("Password should be at least")) return "Choisissez un mot de passe plus long.";
  if (code.includes("Email not confirmed")) return "La configuration Supabase bloque la connexion sans confirmation e-mail.";
  if (code.includes("Invalid email")) return "Saisissez une adresse e-mail valide.";
  if (code.includes("rate limit")) return "Trop de tentatives. Réessayez un peu plus tard.";
  return "Une erreur est survenue. Vérifiez vos informations puis réessayez.";
}
