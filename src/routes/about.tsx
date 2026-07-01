import { createFileRoute } from "@tanstack/react-router";
import { Heart, Shield, Star, Users } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "À propos — Atlantis Groupe" },
      { name: "description", content: "Atlantis Groupe : agence immobilière à Abidjan. Nos valeurs : sérieux, transparence, accessibilité." },
      { property: "og:title", content: "À propos d'Atlantis Groupe" },
      { property: "og:description", content: "Notre mission : faciliter votre projet immobilier à Abidjan." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold">À propos d'Atlantis Groupe</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Atlantis Groupe est une entreprise ivoirienne spécialisée dans l'immobilier à Abidjan : vente
          et location de terrains, maisons et appartements. Nous accompagnons particuliers, familles,
          investisseurs et expatriés dans tous leurs projets immobiliers.
        </p>
        <p className="mt-4 text-foreground/80">
          Notre objectif : vous offrir une expérience claire, transparente et rassurante, à des prix
          accessibles. Chaque bien est vérifié et présenté avec honnêteté pour que vous puissiez
          décider sereinement.
        </p>
      </div>

      <div className="mt-12 grid md:grid-cols-4 gap-6">
        {[
          { icon: Heart, title: "Proximité", text: "Une équipe à votre écoute, disponible et réactive." },
          { icon: Shield, title: "Sécurité", text: "Documents vérifiés, accompagnement juridique." },
          { icon: Star, title: "Qualité", text: "Sélection rigoureuse de biens en bon état." },
          { icon: Users, title: "Transparence", text: "Des prix justes et des conseils honnêtes." },
        ].map((v) => (
          <div key={v.title} className="rounded-xl border bg-card p-6 shadow-[var(--shadow-card)]">
            <v.icon className="h-8 w-8 text-primary" />
            <h3 className="mt-3 font-semibold">{v.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{v.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
