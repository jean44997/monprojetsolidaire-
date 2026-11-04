import { createFileRoute, notFound } from "@tanstack/react-router";
import { PropertyListing } from "@/components/PropertyListing";
import { CATEGORIES, type Category } from "@/data/properties";

export const Route = createFileRoute("/vente")({
  head: () => ({
    meta: [
      { title: "Créer une cagnotte solidaire — Monprojetsolidaire" },
      { name: "description", content: "Créez une cagnotte solidaire, définissez votre objectif et partagez son lien avec vos proches." },
      { property: "og:title", content: "Créer une cagnotte — Monprojetsolidaire" },
    ],
  }),
  component: () => <PropertyListing offer="vente" />,
});
