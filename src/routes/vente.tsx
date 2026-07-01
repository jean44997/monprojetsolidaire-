import { createFileRoute, notFound } from "@tanstack/react-router";
import { PropertyListing } from "@/components/PropertyListing";
import { CATEGORIES, type Category } from "@/data/properties";

export const Route = createFileRoute("/vente")({
  head: () => ({
    meta: [
      { title: "Vente immobilier Abidjan — Atlantis Groupe" },
      { name: "description", content: "Achat immobilier à Abidjan : terrains, maisons et appartements à vendre. Atlantis Groupe vous accompagne." },
      { property: "og:title", content: "Biens à vendre — Atlantis Groupe" },
    ],
  }),
  component: () => <PropertyListing offer="vente" />,
});
