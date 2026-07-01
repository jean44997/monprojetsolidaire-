import { createFileRoute } from "@tanstack/react-router";
import { PropertyListing } from "@/components/PropertyListing";

export const Route = createFileRoute("/locations")({
  head: () => ({
    meta: [
      { title: "Location immobilier Abidjan — Atlantis Groupe" },
      { name: "description", content: "Location à Abidjan : appartements, maisons, terrains. Court séjour, location meublée et longue durée." },
      { property: "og:title", content: "Locations — Atlantis Groupe" },
    ],
  }),
  component: () => <PropertyListing offer="location" />,
});
