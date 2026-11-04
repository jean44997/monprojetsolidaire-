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

### Paiements Jèko

`POST https://sgulsvbzwzrqahvaozwm.supabase.co/functions/v1/payment-webhook`

Les paiements sont créés côté serveur par `jeko-checkout`, puis le visiteur est redirigé vers la page sécurisée Jèko. Les contributions ne passent à `confirmed` qu'après vérification de la notification signée ou consultation de statut auprès de Jèko. Le retour navigateur seul ne confirme jamais un paiement. Le statut public est servi par `jeko-payment-status`.

Dans le tableau de bord Jèko, section API et Webhooks, configurer cette URL comme webhook de la boutique utilisée. Sélectionner l'événement de transaction terminée. Jèko signe le corps brut avec HMAC-SHA256 dans l'en-tête `Jeko-Signature`; la fonction vérifie aussi la boutique, la référence, le montant, la devise et le moyen de paiement. La clé webhook, la clé API, l'identifiant de clé et l'identifiant boutique sont des secrets Edge Functions Supabase, jamais des variables `VITE_` ni des valeurs à committer.

Les méthodes configurées sont Wave, Orange Money, MTN MoMo, Moov Money et Djamo. Les appels de création transitent par Jèko en production. Jèko ne fournit pas de mode sandbox pour cette intégration : ne pas simuler un paiement en appelant l'API de création. Vérifier les parcours de paiement avec une transaction réelle de faible montant seulement quand le propriétaire du compte l'aura explicitement décidé.
