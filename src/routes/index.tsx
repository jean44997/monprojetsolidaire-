import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Sparkles, Wallet, MapPin, Home, Building2, Trees } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { CATEGORIES, properties, formatPrice } from "@/data/properties";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Atlantis Groupe — Immobilier à Abidjan : vente & location" },
      { name: "description", content: "Atlantis Groupe : agence immobilière à Abidjan. Vente et location de terrains, maisons et appartements. Sérieux, sécurité et bon rapport qualité/prix." },
      { property: "og:title", content: "Atlantis Groupe — Immobilier Abidjan" },
      { property: "og:description", content: "Vente et location de biens immobiliers à Abidjan." },
    ],
  }),
  component: Home_,
});

const catIcon = { terrains: Trees, maisons: Home, appartements: Building2 } as const;

function Home_() {
  const featured = properties.slice(0, 3);
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={hero} alt="Immobilier Abidjan" className="h-full w-full object-cover" width={1600} height={1024} />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/85 to-primary/50" />
        </div>
        <div className="relative container mx-auto px-4 py-24 md:py-32 text-primary-foreground">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight max-w-3xl">
            Trouvez votre bien immobilier ou résidence meublée en Côte d'Ivoire
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl text-primary-foreground/90">
            Terrains, maisons et appartements à vendre ou à louer. Une équipe sérieuse pour vous accompagner à chaque étape.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/vente" className="rounded-md bg-background text-primary px-6 py-3 font-medium hover:bg-background/90">
              Voir les biens à vendre
            </Link>
            <Link to="/locations" className="rounded-md border border-primary-foreground/40 px-6 py-3 font-medium hover:bg-primary-foreground/10">
              Voir les locations
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: Sparkles, title: "Biens vérifiés", text: "Documents contrôlés et visites organisées avec sérieux." },
            { icon: Shield, title: "Sécurité juridique", text: "Accompagnement sur les titres et formalités." },
            { icon: Wallet, title: "Bon rapport qualité/prix", text: "Des prix justes, sans frais cachés." },
            { icon: MapPin, title: "Connaissance d'Abidjan", text: "Cocody, Marcory, Plateau, Bingerville, Bassam…" },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border bg-card p-6 shadow-[var(--shadow-card)]">
              <f.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold">Nos catégories</h2>
        <p className="text-muted-foreground">Explorez nos biens par type.</p>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {CATEGORIES.map((c) => {
            const Icon = catIcon[c.key];
            return (
              <Link
                key={c.key}
                to="/vente/$category"
                params={{ category: c.key }}
                className="group rounded-xl overflow-hidden border bg-card shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)] transition-shadow"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={c.image} alt={c.label} loading="lazy" width={1024} height={768} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-primary"><Icon className="h-5 w-5" /><h3 className="font-semibold">{c.label}</h3></div>
                  <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Sélection de biens</h2>
            <p className="text-muted-foreground">Quelques opportunités du moment.</p>
          </div>
          <Link to="/vente" className="hidden sm:inline text-primary font-medium hover:underline">Voir tout →</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {featured.map((p) => (
            <div key={p.id} className="group rounded-xl overflow-hidden border bg-card shadow-[var(--shadow-card)]">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={p.image} alt={p.title} loading="lazy" width={1024} height={768} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="p-5">
                <div className="text-xs uppercase tracking-wide text-primary font-medium">{p.offer === "vente" ? "À vendre" : "À louer"}</div>
                <h3 className="mt-1 font-semibold">{p.title}</h3>
                <div className="flex items-center text-xs text-muted-foreground gap-1 mt-1"><MapPin className="h-3 w-3" />{p.location}</div>
                <p className="text-sm text-muted-foreground mt-2">{p.short}</p>
                <div className="mt-3 font-bold text-primary">{formatPrice(p)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary mt-12">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold">Un projet immobilier à Abidjan ?</h2>
          <p className="mt-2 text-muted-foreground max-w-xl mx-auto">Parlons-en. Notre équipe vous répond rapidement par WhatsApp ou téléphone.</p>
          <Link to="/contact" className="inline-block mt-6 rounded-md bg-primary text-primary-foreground px-6 py-3 font-medium hover:opacity-90">
            Nous contacter
          </Link>
        </div>
      </section>
    </div>
  );
}
