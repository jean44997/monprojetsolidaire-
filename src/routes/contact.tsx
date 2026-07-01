import { createFileRoute } from "@tanstack/react-router";
import { Phone, MessageCircle, MapPin, Mail } from "lucide-react";
import { BookingForm } from "@/components/BookingForm";
import { WHATSAPP_NUMBER, PHONE_1, PHONE_2 } from "@/data/properties";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Atlantis Groupe" },
      { name: "description", content: "Contactez Atlantis Groupe pour acheter, vendre ou louer un bien immobilier à Abidjan. Réponse rapide par WhatsApp." },
      { property: "og:title", content: "Contact — Atlantis Groupe" },
      { property: "og:description", content: "Parlons de votre projet immobilier à Abidjan." },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold">Contactez-nous</h1>
        <p className="mt-3 text-muted-foreground">Une question, une visite, un projet ? Notre équipe vous répond rapidement.</p>
      </div>

      <div className="mt-10 grid lg:grid-cols-3 gap-8">
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-primary" /><div><div className="text-xs text-muted-foreground">Téléphone</div><a href={`tel:${PHONE_1.replace(/\s/g, "")}`} className="font-medium hover:text-primary">{PHONE_1}</a></div></div>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-primary" /><div><div className="text-xs text-muted-foreground">Téléphone</div><a href={`tel:${PHONE_2.replace(/\s/g, "")}`} className="font-medium hover:text-primary">{PHONE_2}</a></div></div>
          </div>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="block rounded-xl p-5 bg-[var(--whatsapp)] text-white hover:opacity-90">
            <div className="flex items-center gap-3"><MessageCircle className="h-5 w-5" /><div><div className="text-xs opacity-80">WhatsApp</div><div className="font-medium">Discuter maintenant</div></div></div>
          </a>
          <div className="rounded-xl border bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-primary" /><div><div className="text-xs text-muted-foreground">Zone</div><div className="font-medium">Abidjan, Côte d'Ivoire</div></div></div>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-primary" /><div><div className="text-xs text-muted-foreground">Email</div><div className="font-medium">contact@atlantisgroupe.ci</div></div></div>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border bg-card p-6 shadow-[var(--shadow-card)]">
          <h2 className="text-xl font-semibold mb-4">Envoyez-nous un message</h2>
          <BookingForm />
        </div>
      </div>
    </div>
  );
}
