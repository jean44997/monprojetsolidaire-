import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, CircleHelp, FileText, HeartHandshake } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Aide et contact — Monprojetsolidaire" },
      { name: "description", content: "Trouvez de l’aide pour créer, partager ou contribuer à une cagnotte Monprojetsolidaire." },
      { property: "og:title", content: "Aide et contact — Monprojetsolidaire" },
      { property: "og:description", content: "Des réponses aux questions fréquentes sur les cagnottes solidaires." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const helpLinks = [
    { icon: CircleHelp, title: "Questions fréquentes", text: "Créer une cagnotte, contribuer ou suivre une opération.", href: "/faq", action: "Consulter la FAQ" },
    { icon: FileText, title: "Guide de cagnotte", text: "Présenter son projet et le partager avec sa communauté.", href: "/guide", action: "Lire le guide" },
    { icon: HeartHandshake, title: "Un projet solidaire ?", text: "Commencez une collecte et partagez son lien.", href: "/cagnotte/create", action: "Créer une cagnotte" },
  ];
  return (
    <main className="container mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[.16em] text-primary">Centre d’aide</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-5xl">Comment pouvons-nous vous aider ?</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">Choisissez le sujet qui correspond à votre besoin. Les paiements et retraits restent soumis aux étapes de vérification affichées dans votre espace.</p>
      </div>
      <div className="mt-9 grid grid-cols-1 gap-4 md:grid-cols-3">
        {helpLinks.map(({ icon: Icon, title, text, href, action }) => (
          <a key={title} href={href} className="group flex min-h-52 flex-col rounded-2xl border bg-card p-5 transition hover:-translate-y-1 hover:shadow-lg sm:p-6">
            <Icon className="h-7 w-7 text-primary" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-semibold">{title}</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{text}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">{action}<ArrowRight size={16}/></span>
          </a>
        ))}
      </div>
    </main>
  );
}
