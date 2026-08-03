import type { MetadataRoute } from "next";
import { getCars } from "@/lib/catalog";
import { SITE_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const cars = getCars();
  const catalogUrls = cars.map((car) => ({
    url: `${SITE_URL}/catalog/${car.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/catalog`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/tracking`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/contacts`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];

  return [...staticPages, ...catalogUrls];
}
