import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page introuvable</h2>
        <p className="mt-2 text-sm text-muted-foreground">Le lien n’existe pas ou a été déplacé.</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Retour à l’accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { name: "googlebot", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { title: "Monprojetsolidaire — Cagnottes solidaires" },
      { name: "description", content: "Créez une cagnotte solidaire en Côte d’Ivoire et mobilisez vos proches." },
      { name: "author", content: "Monprojetsolidaire" },
      { name: "theme-color", content: "#139d51" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "Monprojetsolidaire" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "application-name", content: "Monprojetsolidaire" },
      { property: "og:title", content: "Monprojetsolidaire — La solidarité en mouvement" },
      { property: "og:description", content: "Créez une cagnotte solidaire et invitez vos proches à participer sans compte." },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "fr_CI" },
      { property: "og:site_name", content: "Monprojetsolidaire" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Monprojetsolidaire — La solidarité en mouvement" },
      { name: "twitter:description", content: "Créez une cagnotte solidaire et invitez vos proches à participer sans compte." },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico", sizes: "any" },
      { rel: "apple-touch-icon", href: "/icons/icon-192.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr-CI">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Monprojetsolidaire",
              areaServed: ["Côte d’Ivoire"],
              description: "Monprojetsolidaire permet de créer et partager des cagnottes solidaires.",
            }),
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { MonprojetsolidaireApp } from "@/components/MonprojetsolidaireApp";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";

function RootComponent() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      if (import.meta.env.DEV) {
        navigator.serviceWorker.getRegistrations().then((registrations) => registrations.forEach((registration) => registration.unregister())).catch(() => undefined);
        caches.keys().then((keys) => keys.filter((key) => key.startsWith("monprojetsolidaire-")).forEach((key) => caches.delete(key))).catch(() => undefined);
      } else {
        navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).catch(() => undefined);
      }
    }
  }, []);
  return (
    <AuthProvider>
      <MonprojetsolidaireApp />
      <Toaster />
    </AuthProvider>
  );
}
