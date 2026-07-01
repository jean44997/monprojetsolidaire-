import terrainImg from "@/assets/terrain.jpg";
import immeubleR4 from "@/assets/immeuble-r4.jpeg";
import immeubleBingerville500 from "@/assets/immeuble-bingerville-500.jpeg";
import terrainBingervilleAghien1 from "@/assets/terrain-bingerville-aghien-1.jpeg";
import terrainBingervilleAghien2 from "@/assets/terrain-bingerville-aghien-2.jpeg";
import terrainBingervilleAghien3 from "@/assets/terrain-bingerville-aghien-3.jpeg";
import terrainBingervilleAghienPlan1 from "@/assets/terrain-bingerville-aghien-plan1.jpeg";
import terrainBingervilleAghienPlan2 from "@/assets/terrain-bingerville-aghien-plan2.jpeg";
import terrainDjorobite from "@/assets/terrain-djorobite.jpeg";
import studioAngre1 from "@/assets/studio-angre-1.jpeg";
import studioPalmeraie1 from "@/assets/studio-palmeraie-1.jpeg";
import studioPalmeraie2 from "@/assets/studio-palmeraie-2.jpeg";
import studioPalmeraie3 from "@/assets/studio-palmeraie-3.jpeg";
import studioPalmeraie4 from "@/assets/studio-palmeraie-4.jpeg";
import maisonImg from "@/assets/maison.jpg";
import appartImg from "@/assets/appartement.jpg";
import res1 from "@/assets/res1.jpg";
import res2 from "@/assets/res2.jpg";
import res3 from "@/assets/res3.jpg";
import res4 from "@/assets/res4.jpg";

export type Category = "terrains" | "maisons" | "appartements";
export type Offer = "vente" | "location";

export type Property = {
  id: string;
  title: string;
  category: Category;
  offer: Offer;
  location: string;
  price: number; // FCFA (total for vente, monthly for location)
  surface?: string;
  bedrooms?: number;
  image: string;
  images?: string[];
  short: string;
  features: string[];
  priceUnit?: "mois" | "jour";
};

export const CATEGORIES: { key: Category; label: string; image: string; description: string }[] = [
  {
    key: "terrains",
    label: "Terrains",
    image: immeubleR4,
    description: "Parcelles viabilisées et titrées dans des zones en pleine expansion à Abidjan.",
  },
  {
    key: "maisons",
    label: "Maisons",
    image: maisonImg,
    description: "Maisons familiales modernes, dans des quartiers calmes et sécurisés.",
  },
  {
    key: "appartements",
    label: "Appartements",
    image: appartImg,
    description: "Appartements bien situés, prêts à habiter, à louer ou à acheter.",
  },
];

export const properties: Property[] = [
  // VENTE
  {
    id: "terrain-cocody-djorobite",
    title: "Terrain 660m² Cocody Angré Djorobité 1",
    category: "terrains",
    offer: "vente",
    location: "Cocody Angré Djorobité 1 (après la Station Total Énergie et l'EPP Djorobité 1)",
    price: 150000000,
    surface: "660 m²",
    image: terrainDjorobite,
    short: "Terrain de 660 m² avec ACD individuel, bien situé à Cocody Angré Djorobité 1.",
    features: ["ACD individuel", "660 m²", "Quartier résidentiel", "Proche école & station-service"],
  },
  {
    id: "terrain-bingerville-aghien-1200",
    title: "2 Terrains 600m² Bingerville Aghien (1200m²)",
    category: "terrains",
    offer: "vente",
    location: "Bingerville Aghien (à l'angle)",
    price: 140000000,
    surface: "1 200 m² (2 x 600 m²)",
    image: immeubleR4,
    short: "2 terrains contigus de 600m² à l'angle, avec ACD et permis de construire R+4.",
    features: ["ACD", "Permis de construire R+4", "Position d'angle", "1 200 m² au total", "Zone résidentielle Aghien"],
  },
  {
    id: "terrain-bingerville",
    title: "Terrain 500m² Bingerville",
    category: "terrains",
    offer: "vente",
    location: "Bingerville",
    price: 15000000,
    surface: "500 m²",
    image: immeubleBingerville500,
    short: "Parcelle viabilisée, ACD disponible, quartier en plein essor.",
    features: ["ACD", "Viabilisé", "Accès goudronné", "Eau & électricité"],
  },
  {
    id: "terrain-songon",
    title: "Terrain 600m² Songon",
    category: "terrains",
    offer: "vente",
    location: "Songon",
    price: 9000000,
    surface: "600 m²",
    image: immeubleR4,
    short: "Beau terrain résidentiel, idéal pour villa familiale.",
    features: ["Lettre d'attribution", "Zone résidentielle", "Proche école"],
  },
  {
    id: "maison-cocody-vente",
    title: "Maison 4 pièces Cocody",
    category: "maisons",
    offer: "vente",
    location: "Cocody Angré",
    price: 75000000,
    surface: "180 m²",
    bedrooms: 4,
    image: maisonImg,
    short: "Villa moderne avec jardin, dans une zone calme et sécurisée.",
    features: ["Garage", "Jardin", "Cuisine équipée", "Sécurité 24/7"],
  },
  {
    id: "maison-bassam-vente",
    title: "Villa 3 chambres Bassam",
    category: "maisons",
    offer: "vente",
    location: "Grand-Bassam",
    price: 55000000,
    surface: "150 m²",
    bedrooms: 3,
    image: res4,
    short: "Villa proche de la mer, parfaite pour résidence secondaire.",
    features: ["Cour", "Parking", "Eau & électricité", "Proximité plage"],
  },
  {
    id: "appart-marcory-vente",
    title: "Appartement 3 pièces Marcory",
    category: "appartements",
    offer: "vente",
    location: "Marcory Résidentiel",
    price: 35000000,
    surface: "85 m²",
    bedrooms: 2,
    image: appartImg,
    short: "Appartement lumineux dans une résidence sécurisée.",
    features: ["Ascenseur", "Parking", "Sécurité", "Balcon"],
  },
  // LOCATION
  {
    id: "maison-riviera-loc",
    title: "Maison 4 pièces Riviera",
    category: "maisons",
    offer: "location",
    location: "Cocody Riviera",
    price: 450000,
    surface: "160 m²",
    bedrooms: 3,
    image: res2,
    short: "Maison familiale spacieuse, calme et bien desservie.",
    features: ["Jardin", "Garage", "Cuisine équipée", "Sécurité"],
  },
  {
    id: "studio-angre-cgk",
    title: "Résidence Studio meublé Cocody Angré 9ème",
    category: "appartements",
    offer: "location",
    location: "Cocody Angré 9ème tranche (derrière l'immeuble CGK)",
    price: 20000,
    surface: "Studio",
    bedrooms: 1,
    image: studioAngre1,
    short: "Studio meublé au rez-de-chaussée avec salle d'attente pour visite. Tarif journalier 20 000 FCFA / 24h.",
    features: ["Meublé", "Rez-de-chaussée", "Salle d'attente pour visite", "Climatisation", "Cuisine équipée", "Tarif journalier 24h"],
    priceUnit: "jour",
  },
  {
    id: "studio-palmeraie",
    title: "Studio meublé Cocody Riviera Palmeraie",
    category: "appartements",
    offer: "location",
    location: "Cocody Riviera Palmeraie, Abidjan",
    price: 0,
    surface: "Studio",
    bedrooms: 1,
    image: studioPalmeraie1,
    images: [studioPalmeraie1, studioPalmeraie2, studioPalmeraie3, studioPalmeraie4],
    short: "Studio meublé moderne et lumineux à Cocody Riviera Palmeraie, idéal court ou long séjour.",
    features: ["Meublé", "Climatisation", "TV & Wi-Fi", "Cuisine équipée", "Faux plafond LED", "Sécurité"],
    priceUnit: "jour",
  },
  {
    id: "appart-cocody-loc",
    title: "Studio meublé Cocody",
    category: "appartements",
    offer: "location",
    location: "Cocody",
    price: 200000,
    surface: "35 m²",
    bedrooms: 1,
    image: res1,
    short: "Studio meublé moderne, idéal court ou long séjour.",
    features: ["Meublé", "Wi-Fi", "Climatisation", "Sécurité 24/7"],
  },
  {
    id: "appart-plateau-loc",
    title: "Appartement 3 chambres Plateau",
    category: "appartements",
    offer: "location",
    location: "Plateau",
    price: 600000,
    surface: "110 m²",
    bedrooms: 3,
    image: res3,
    short: "Au cœur du quartier d'affaires, idéal pour professionnels.",
    features: ["Ascenseur", "Climatisation", "Parking", "Sécurité"],
  },
  {
    id: "terrain-loc-yopougon",
    title: "Terrain à louer Yopougon",
    category: "terrains",
    offer: "location",
    location: "Yopougon",
    price: 250000,
    surface: "400 m²",
    image: immeubleR4,
    short: "Terrain clôturé, idéal activité commerciale ou stockage.",
    features: ["Clôturé", "Accès direct route", "Eau"],
  },
];

export const WHATSAPP_NUMBER = "2250140551993";
export const PHONE_1 = "+225 0140551993";
export const PHONE_2 = "+225 0715030390";

export function formatPrice(p: Property) {
  if (!p.price) return "Prix sur demande";
  const v = p.price.toLocaleString("fr-FR");
  if (p.offer !== "location") return `${v} FCFA`;
  const unit = p.priceUnit ?? "mois";
  return `${v} FCFA / ${unit}`;
}
