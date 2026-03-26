/** Реальные имена файлов в public/brand/ (без пробелов; опечатка white-horizonta тоже поддерживается) */
const BRAND_ASSETS = {
  logoHeader: "black-horizontal.png",
  logoFooter: "white-horizontal.png",
  logoFooterAlt: "white-horizonta.png",
  signBlack: "sign-black.png",
  signWhite: "sign-white.png",
} as const;

export const BRAND = {
  logoHeader: `/brand/${BRAND_ASSETS.logoHeader}`,
  logoFooter: `/brand/${BRAND_ASSETS.logoFooter}`,
  logoFooterAlt: `/brand/${BRAND_ASSETS.logoFooterAlt}`,
  signBlack: `/brand/${BRAND_ASSETS.signBlack}`,
  signWhite: `/brand/${BRAND_ASSETS.signWhite}`,
} as const;

/** Путь к бренд-ассету по имени */
export function getBrandAsset(name: keyof typeof BRAND): string {
  return BRAND[name as keyof typeof BRAND];
}

export const BOT_URL = "https://t.me/KONSTANTAutobot";
export const CHANNEL_URL = "https://t.me/+BrmEHe0MHWtkOWFi";
/** Для копирования: ссылка-приглашение в канал */
export const CHANNEL_DISPLAY = "https://t.me/+BrmEHe0MHWtkOWFi";
export const PHONE = "+79277198887";
export const PHONE_DISPLAY = "+7 927 719 8887";
export const VK_URL = "https://vk.com/konstantauto";
export const MAX_URL =
  "https://max.ru/join/oTFAUZG9r0IART4x5z2A6R_neQqj7xy1GPfj42wnR0U";

export const BOT_START = {
  quiz: `${BOT_URL}?start=site_quiz`,
  consult: `${BOT_URL}?start=site_consult`,
  tracking: `${BOT_URL}?start=site_tracking`,
  catalog: (slug: string) => `${BOT_URL}?start=catalog_${slug}`,
} as const;

export const COUNTRIES = [
  "Китай",
  "Корея",
  "Япония",
  "США",
  "Европа",
  "ОАЭ",
] as const;

export const BODY_TYPES = [
  "Седан",
  "Кроссовер",
  "Внедорожник",
  "Пикап",
  "Хэтчбек",
] as const;
