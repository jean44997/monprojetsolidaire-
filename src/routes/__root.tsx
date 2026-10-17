import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
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
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "google-site-verification", content: "fJB3YtwRCrS0KZ4t3ywdHHx9FmpXEN0fNxaIZqGqLSY" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { name: "googlebot", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { title: "Atlantis Groupe — Immobilier à Abidjan" },
      { name: "description", content: "Atlantis Groupe : agence immobilière à Abidjan. Vente et location de terrains, maisons et appartements." },
      { name: "author", content: "Atlantis Groupe" },
      { property: "og:title", content: "Atlantis Groupe — Immobilier à Abidjan" },
      { property: "og:description", content: "Vente et location de terrains, maisons et appartements à Abidjan." },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "fr_CI" },
      { property: "og:site_name", content: "Atlantis Groupe" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Atlantis Groupe — Immobilier à Abidjan" },
      { name: "twitter:description", content: "Vente et location de biens immobiliers à Abidjan." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/8VaNPhMjqEMeocuGTI1Gy4hfHHr2/social-images/social-1778021556073-WhatsApp_Image_2026-04-30_at_23.10.39.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/8VaNPhMjqEMeocuGTI1Gy4hfHHr2/social-images/social-1778021556073-WhatsApp_Image_2026-04-30_at_23.10.39.webp" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
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
              "@type": "RealEstateAgent",
              name: "Atlantis Groupe",
              url: "https://atlantisgroupe.ci",
              email: "contact@atlantisgroupe.ci",
              areaServed: ["Abidjan", "Côte d’Ivoire"],
              description: "Agence immobilière à Abidjan spécialisée dans la vente et la location de terrains, maisons et appartements.",
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

import { Layout } from "@/components/Layout";
import { Toaster } from "@/components/ui/sonner";

function RootComponent() {
  return (
    <>
      <Layout />
      <Toaster />
    </>
  );
}
