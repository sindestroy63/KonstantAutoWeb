import manifestRaw from "@/public/images/catalog/manifest.json";

type ManifestImage = {
  file: string;
  status: string;
};

type Manifest = {
  images: Record<string, ManifestImage>;
};

const manifest = manifestRaw as Manifest;

export type ProductionAiImage = {
  src: string;
  source: "production-ai";
};

export function getProductionAiImage(slug: string): ProductionAiImage | null {
  const entry = manifest.images[slug];
  if (!entry || entry.status !== "production" || !/^[a-z0-9-]+\.webp$/i.test(entry.file)) {
    return null;
  }

  return {
    src: `/images/catalog/${entry.file}`,
    source: "production-ai",
  };
}

export function getProductionAiImages(slug: string): ProductionAiImage[] {
  const image = getProductionAiImage(slug);
  return image ? [image] : [];
}
