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
