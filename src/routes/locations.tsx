import { createFileRoute } from "@tanstack/react-router";
import { PropertyListing } from "@/components/PropertyListing";

export const Route = createFileRoute("/locations")({
  head: () => ({
    meta: [
      { title: "Cagnottes solidaires à découvrir — Monprojetsolidaire" },
      { name: "description", content: "Parcourez les cagnottes solidaires, découvrez des projets et contribuez sans créer de compte." },
      { property: "og:title", content: "Explorer les cagnottes — Monprojetsolidaire" },
    ],
  }),
  component: () => <PropertyListing offer="location" />,
});
