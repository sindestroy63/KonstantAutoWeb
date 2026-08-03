import type { Car, PublicCar } from "@/types/catalog";
import {
  BRAND,
  PHONE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  VK_URL,
} from "@/lib/constants";

export const organizationJsonLd: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: new URL(BRAND.logoHeader, SITE_URL).toString(),
  description: SITE_DESCRIPTION,
  telephone: PHONE,
  areaServed: ["Россия", "Республика Беларусь"],
  sameAs: [VK_URL],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: PHONE,
    contactType: "customer service",
    availableLanguage: "Russian",
  },
};

export const websiteJsonLd: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  inLanguage: "ru-RU",
  publisher: { "@id": `${SITE_URL}/#organization` },
};

type BreadcrumbItem = {
  name: string;
  path: string;
};

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: new URL(item.path, SITE_URL).toString(),
    })),
  };
}

export function buildVehicleJsonLd(
  car: Pick<Car, "slug" | "brand" | "model" | "bodyType" | "country" | "image"> | PublicCar,
  imageSrc?: string
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    "@id": `${SITE_URL}/catalog/${car.slug}#vehicle`,
    name: `${car.brand} ${car.model}`,
    url: `${SITE_URL}/catalog/${car.slug}`,
    ...(imageSrc ? { image: new URL(imageSrc, SITE_URL).toString() } : {}),
    description: `${car.brand} ${car.model}, ${car.bodyType.toLowerCase()}, вариант под заказ из ${car.country}.`,
    brand: { "@type": "Brand", name: car.brand },
    model: car.model,
    bodyType: car.bodyType,
    countryOfOrigin: { "@type": "Country", name: car.country },
  };
}
