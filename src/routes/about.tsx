import { createFileRoute } from "@tanstack/react-router";
import { Heart, ShieldCheck, Users, Wallet } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "À propos — Monprojetsolidaire" },
      { name: "description", content: "Découvrez Monprojetsolidaire, une plateforme simple pour créer et partager des cagnottes solidaires." },
      { property: "og:title", content: "À propos — Monprojetsolidaire" },
      { property: "og:description", content: "La solidarité avance quand chacun peut participer." },
    ],
  }),
  component: About,
});

function About() {
  const values = [
    { icon: Heart, title: "L’entraide", text: "Donner à chacun un moyen simple de demander ou d’offrir un coup de main." },
    { icon: ShieldCheck, title: "La confiance", text: "Présenter clairement les collectes, les contributions et les demandes de retrait." },
    { icon: Users, title: "La communauté", text: "Inviter ses proches à soutenir un projet, même sans créer de compte." },
    { icon: Wallet, title: "La transparence", text: "Suivre les fonds reçus et les opérations depuis l’espace organisateur." },
  ];
  return (
    <main className="container mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[.16em] text-primary">Notre mission</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-5xl">La solidarité avance quand chacun peut participer.</h1>
        <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
          Monprojetsolidaire aide les organisateurs à raconter leur projet, fixer un objectif et partager un lien unique. Les contributeurs peuvent découvrir la cagnotte et participer sans créer de compte.
        </p>
        <a href="/cagnotte/create" className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Créer une cagnotte</a>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {values.map(({ icon: Icon, title, text }) => (
          <article key={title} className="rounded-2xl border bg-card p-5 sm:p-6">
            <Icon className="h-7 w-7 text-primary" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
