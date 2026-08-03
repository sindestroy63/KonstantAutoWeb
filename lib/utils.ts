export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_-]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

/**
 * Приводит ввод к маске росс. номера "+7 (999) 123-45-67".
 * Работает по "сырым" цифрам, поэтому одинаково корректно обрабатывает
 * посимвольную печать и вставку из буфера в любом формате
 * (79991234567, 8 999 123 45 67, +7-999-123-45-67 и т.д.).
 */
export function formatRuPhone(rawValue: string): string {
  const digitsOnly = rawValue.replace(/\D/g, "");
  if (!digitsOnly) return "";

  let national = digitsOnly;
  if (national[0] === "8") {
    national = `7${national.slice(1)}`;
  } else if (national[0] !== "7") {
    national = `7${national}`;
  }
  national = national.slice(0, 11);

  const rest = national.slice(1);
  let formatted = "+7";
  if (rest.length > 0) formatted += ` (${rest.slice(0, 3)}`;
  if (rest.length >= 3) formatted += ")";
  if (rest.length > 3) formatted += ` ${rest.slice(3, 6)}`;
  if (rest.length > 6) formatted += `-${rest.slice(6, 8)}`;
  if (rest.length > 8) formatted += `-${rest.slice(8, 10)}`;

  return formatted;
}
