import { Link, Outlet } from "@tanstack/react-router";
import { MessageCircle, Menu, X, Phone, Mail, MapPin } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.jpeg";
import { WHATSAPP_NUMBER, PHONE_1, PHONE_2 } from "@/data/properties";

const navItems = [
  { to: "/", label: "Accueil" },
  { to: "/vente", label: "Vente" },
  { to: "/locations", label: "Locations" },
  { to: "/about", label: "À propos" },
  { to: "/contact", label: "Contact" },
] as const;

export function Layout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Atlantis Groupe" className="h-10 w-10 rounded object-cover" />
            <div className="leading-tight">
              <div className="font-bold text-primary">Atlantis Groupe</div>
              <div className="text-xs text-muted-foreground">Immobilier à Abidjan</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
                activeProps={{ className: "text-primary font-semibold" }}
              >
                {n.label}
              </Link>
            ))}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Nous contacter
            </a>
          </nav>
          <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <div className="md:hidden border-t bg-background">
            <div className="container mx-auto flex flex-col px-4 py-3 gap-3">
              {navItems.map((n) => (
                <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="text-sm font-medium py-2">
                  {n.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-secondary mt-16 border-t">
        <div className="container mx-auto px-4 py-12 grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src={logo} alt="" className="h-8 w-8 rounded object-cover" />
              <span className="font-bold text-primary">Atlantis Groupe</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Votre partenaire immobilier à Abidjan : vente et location de terrains, maisons et appartements.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Navigation</h3>
            <ul className="space-y-2 text-sm">
              {navItems.map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className="text-muted-foreground hover:text-primary">{n.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> {PHONE_1}</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> {PHONE_2}</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Abidjan, Côte d'Ivoire</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> contact@atlantisgroupe.ci</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Discutons</h3>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-[var(--whatsapp)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
        <div className="border-t py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Atlantis Groupe. Tous droits réservés.
        </div>
      </footer>

      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Contacter sur WhatsApp"
        className="fixed bottom-6 right-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--whatsapp)] text-white shadow-lg hover:scale-105 transition-transform"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    </div>
  );
}
