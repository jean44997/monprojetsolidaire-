# Deploiement Vercel

Ce projet utilise TanStack Start avec Nitro. Pour Vercel, le build dedie est:

```bash
npm run build:vercel
```

Le fichier `vercel.json` configure Vercel avec:

- Framework Preset: Other
- Install Command: `npm install`
- Build Command: `npm run build:vercel`
- Dev Command: `npm run dev`
- Output Directory: laisser vide, Nitro genere `.vercel/output`

Le runtime Vercel est fixe en Node.js 22 via `package.json` et `nitro.config.ts`.

## Deploiement via Vercel Dashboard

1. Importer le projet Git dans Vercel.
2. Garder les reglages detectes depuis `vercel.json`.
3. Verifier que la version Node.js est `22.x`.
4. Lancer le deploiement.

## Deploiement via CLI

```bash
npm install
npm run build:vercel
npx vercel login
npx vercel --prod
```

Pour deployer le build local deja genere:

```bash
npm run build:vercel
npx vercel deploy --prebuilt --prod
```

## Supabase

Le schema et les regles RLS sont dans `supabase/migrations`. L'application refuse l'acces aux espaces organisateur si les variables Supabase ne sont pas configurees.

1. Creer un projet Supabase, puis appliquer les migrations avec `supabase db push`.
2. Dans Authentication, autoriser les inscriptions e-mail, desactiver la confirmation e-mail a l'inscription (aucun OTP a l'inscription) et desactiver les inscriptions SMS/anonymes.
3. Configurer un SMTP d'envoi fiable et autoriser les URL de retour `https://monprojetsolidaire.vercel.app/**` et `http://localhost:5180/**`. Les retraits utilisent un lien magique e-mail recent; le SQL refuse la confirmation sans preuve recente de connexion par e-mail.
4. Ajouter sur Vercel `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY` pour Preview et Production. La cle publishable/anon est faite pour le navigateur; ne jamais y mettre la cle `service_role`, une cle `sb_secret_...`, le mot de passe SQL ni le jeton personnel Supabase.

Les contributions ne peuvent pas etre ajoutees par le navigateur. Une fois un prestataire de paiement integre, seul son webhook serveur devra creer une contribution confirmee. Les demandes de retrait sont enregistrees comme `pending`; aucun versement automatique n'est actif.
