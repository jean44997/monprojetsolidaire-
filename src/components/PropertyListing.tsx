import { Link } from "@tanstack/react-router";
import { MapPin, Home, Building2, Trees } from "lucide-react";
import { CATEGORIES, properties, formatPrice, type Category, type Offer, type Property } from "@/data/properties";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const catIcon = { terrains: Trees, maisons: Home, appartements: Building2 } as const;

export function PropertyListing({
  offer,
  category,
}: {
  offer: Offer;
  category?: Category;
}) {
  const basePath = offer === "vente" ? "/vente" : "/locations";
  const title = offer === "vente" ? "Biens à vendre" : "Biens à louer";
  const subtitle =
    offer === "vente"
      ? "Terrains, maisons et appartements à acquérir à Abidjan."
      : "Terrains, maisons et appartements disponibles à la location.";

  const list = properties.filter(
    (p) => p.offer === offer && (!category || p.category === category),
  );

  const currentLabel = category
    ? CATEGORIES.find((c) => c.key === category)?.label
    : "Tous les biens";

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold">{title}</h1>
        <p className="mt-3 text-muted-foreground">{subtitle}</p>
      </div>

      {/* Sub-navigation */}
      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          to={basePath}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            !category ? "bg-primary text-primary-foreground border-primary" : "hover:bg-secondary"
          }`}
        >
          Tous
        </Link>
        {CATEGORIES.map((c) => {
          const Icon = catIcon[c.key];
          const active = category === c.key;
          return (
            <Link
              key={c.key}
              to={offer === "vente" ? "/vente/$category" : "/locations/$category"}
              params={{ category: c.key }}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                active ? "bg-primary text-primary-foreground border-primary" : "hover:bg-secondary"
              }`}
            >
              <Icon className="h-4 w-4" /> {c.label}
            </Link>
          );
        })}
      </div>

      <h2 className="sr-only">{currentLabel}</h2>

      {list.length === 0 ? (
        <div className="mt-12 rounded-xl border bg-card p-10 text-center text-muted-foreground">
          Aucun bien dans cette catégorie pour le moment. Contactez-nous pour une recherche personnalisée.
        </div>
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((p) => (
            <article key={p.id} className="rounded-xl overflow-hidden border bg-card shadow-[var(--shadow-card)] flex flex-col">
              <PropertyMedia property={p} />
              <div className="p-5 flex-1 flex flex-col">
                <div className="text-xs uppercase tracking-wide text-primary font-medium">
                  {p.offer === "vente" ? "À vendre" : "À louer"} · {CATEGORIES.find((c) => c.key === p.category)?.label}
                </div>
                <h3 className="mt-1 font-semibold">{p.title}</h3>
                <div className="flex items-center text-xs text-muted-foreground gap-1 mt-1">
                  <MapPin className="h-3 w-3" />
                  {p.location}
                </div>
                <p className="text-sm text-muted-foreground mt-2 flex-1">{p.short}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {p.surface && <span className="text-xs rounded-full bg-secondary px-2 py-0.5">{p.surface}</span>}
                  {p.bedrooms != null && <span className="text-xs rounded-full bg-secondary px-2 py-0.5">{p.bedrooms} ch.</span>}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="font-bold text-primary">{formatPrice(p)}</div>
                  <Link to="/contact" className="text-sm font-medium text-primary hover:underline">
                    Contacter →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function PropertyMedia({ property }: { property: Property }) {
  const imgs = property.images && property.images.length > 1 ? property.images : null;
  if (!imgs) {
    return (
      <div className="aspect-[4/3] overflow-hidden">
        <img src={property.image} alt={property.title} loading="lazy" width={1024} height={768} className="h-full w-full object-cover" />
      </div>
    );
  }
  return (
    <Carousel opts={{ loop: true }} className="relative">
      <CarouselContent>
        {imgs.map((src, i) => (
          <CarouselItem key={i}>
            <div className="aspect-[4/3] overflow-hidden">
              <img src={src} alt={`${property.title} — photo ${i + 1}`} loading="lazy" width={1024} height={768} className="h-full w-full object-cover" />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2" />
      <CarouselNext className="right-2" />
    </Carousel>
  );
}
