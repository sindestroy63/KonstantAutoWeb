import "server-only";

import { existsSync } from "node:fs";
import { join } from "node:path";

const HERO_MEDIA = {
  desktop: {
    src: "/hero-cars/hero-desktop.webp",
    width: 1672,
    height: 941,
  },
  mobile: {
    src: "/hero-cars/hero-mobile.webp",
    width: 1024,
    height: 1536,
  },
} as const;

export type HeroMedia = typeof HERO_MEDIA;

/**
 * Hero media is intentionally independent from vehicle catalog media.
 * Both responsive assets must exist before the image layer is enabled.
 */
export function getHeroMedia(): HeroMedia | null {
  const desktopExists = existsSync(join(process.cwd(), "public", "hero-cars", "hero-desktop.webp"));
  const mobileExists = existsSync(join(process.cwd(), "public", "hero-cars", "hero-mobile.webp"));

  return desktopExists && mobileExists ? HERO_MEDIA : null;
}
