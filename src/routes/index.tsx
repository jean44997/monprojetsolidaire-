import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Monprojetsolidaire — Cagnottes solidaires" },
      { name: "description", content: "Créez une cagnotte solidaire en Côte d’Ivoire et mobilisez vos proches simplement." },
      { property: "og:title", content: "Monprojetsolidaire — La solidarité en mouvement" },
      { property: "og:description", content: "Créez une cagnotte solidaire et invitez vos proches à participer sans compte." },
    ],
  }),
  component: () => null,
});
