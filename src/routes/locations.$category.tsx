import { createFileRoute, notFound } from "@tanstack/react-router";
import { PropertyListing } from "@/components/PropertyListing";
import { CATEGORIES, type Category } from "@/data/properties";

const validCats: Category[] = ["terrains", "maisons", "appartements"];

export const Route = createFileRoute("/locations/$category")({
  head: ({ params }) => {
    const cat = CATEGORIES.find((c) => c.key === params.category);
    const label = cat?.label ?? "Location";
    return {
      meta: [
        { title: `${label} à louer Abidjan — Atlantis Groupe` },
        { name: "description", content: `${label} à louer à Abidjan. Location meublée, court ou long séjour avec Atlantis Groupe.` },
      ],
    };
  },
  beforeLoad: ({ params }) => {
    if (!validCats.includes(params.category as Category)) throw notFound();
  },
  notFoundComponent: () => (
    <div className="container mx-auto px-4 py-16 text-center">Catégorie introuvable.</div>
  ),
  errorComponent: ({ error }) => (
    <div className="container mx-auto px-4 py-16 text-center text-destructive">{error.message}</div>
  ),
  component: Page,
});

function Page() {
  const { category } = Route.useParams();
  return <PropertyListing offer="location" category={category as Category} />;
}
