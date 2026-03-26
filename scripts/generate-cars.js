const fs = require("fs");
const path = require("path");

const brands = [
  { brand: "Toyota", models: ["Camry", "Corolla", "RAV4", "Land Cruiser", "Hilux", "Highlander", "Crown", "Alphard"] },
  { brand: "BMW", models: ["3 Series", "5 Series", "X1", "X3", "X5"] },
  { brand: "Mercedes-Benz", models: ["C-Class", "E-Class", "GLC", "GLE"] },
  { brand: "Lexus", models: ["ES", "RX", "NX", "LX"] },
  { brand: "Honda", models: ["Accord", "CR-V", "Civic", "Pilot"] },
  { brand: "Hyundai", models: ["Sonata", "Tucson", "Santa Fe", "Palisade", "Creta"] },
  { brand: "Kia", models: ["K5", "Sportage", "Sorento", "Seltos", "Carnival"] },
  { brand: "Volkswagen", models: ["Tiguan", "Passat", "Polo", "Touareg"] },
  { brand: "Audi", models: ["A4", "A6", "Q5", "Q7"] },
  { brand: "Geely", models: ["Coolray", "Atlas", "Monjaro", "Tugella"] },
  { brand: "Haval", models: ["F7", "Jolion", "M6", "H6"] },
  { brand: "Chery", models: ["Tiggo 8", "Tiggo 7", "Tiggo 4"] },
  { brand: "Mazda", models: ["CX-5", "CX-30", "6", "3"] },
  { brand: "Nissan", models: ["X-Trail", "Qashqai", "Murano", "Patrol"] },
  { brand: "Ford", models: ["Explorer", "Mustang", "F-150", "Bronco"] },
];

const bodyByModel = {
  "Camry": "Седан", "Corolla": "Седан", "Crown": "Седан", "Accord": "Седан",
  "Civic": "Хэтчбек", "Sonata": "Седан", "K5": "Седан", "Passat": "Седан",
  "Polo": "Хэтчбек", "A4": "Седан", "A6": "Седан", "3 Series": "Седан",
  "5 Series": "Седан", "C-Class": "Седан", "E-Class": "Седан", "ES": "Седан",
  "RAV4": "Кроссовер", "Highlander": "Кроссовер", "X1": "Кроссовер",
  "X3": "Кроссовер", "GLC": "Кроссовер", "RX": "Кроссовер", "NX": "Кроссовер",
  "CR-V": "Кроссовер", "Tucson": "Кроссовер", "Sportage": "Кроссовер",
  "Tiguan": "Кроссовер", "Q5": "Кроссовер", "Coolray": "Кроссовер",
  "Jolion": "Кроссовер", "Tiggo 7": "Кроссовер", "CX-5": "Кроссовер",
  "CX-30": "Кроссовер", "Qashqai": "Кроссовер", "Creta": "Кроссовер",
  "Seltos": "Кроссовер", "Tiggo 4": "Кроссовер",
  "Land Cruiser": "Внедорожник", "LX": "Внедорожник", "Pilot": "Внедорожник",
  "Santa Fe": "Внедорожник", "Palisade": "Внедорожник", "Sorento": "Внедорожник",
  "Touareg": "Внедорожник", "Q7": "Внедорожник", "Atlas": "Внедорожник",
  "M6": "Внедорожник", "H6": "Внедорожник", "Tiggo 8": "Внедорожник",
  "Monjaro": "Внедорожник", "Tugella": "Внедорожник", "X5": "Внедорожник",
  "GLE": "Внедорожник", "Murano": "Внедорожник", "Patrol": "Внедорожник",
  "Explorer": "Внедорожник", "Bronco": "Внедорожник", "F7": "Кроссовер",
  "Hilux": "Пикап", "F-150": "Пикап", "Carnival": "Кроссовер", "Alphard": "Седан",
  "6": "Седан", "3": "Седан", "X-Trail": "Кроссовер", "Mustang": "Седан",
};

const countries = ["Китай", "Корея", "Япония", "США", "Европа", "ОАЭ"];
const budgets = [
  [800000, 1500000], [1200000, 2200000], [1800000, 3200000], [2500000, 4500000],
  [3500000, 6000000], [5000000, 9000000],
];

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_-]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

let id = 0;
const cars = [];
const seen = new Set();

for (const { brand, models } of brands) {
  for (const model of models) {
    const bodyType = bodyByModel[model] || "Седан";
    const [bMin, bMax] = budgets[id % budgets.length];
    const savingsUpTo = Math.round((bMax - bMin) * 0.12 + Math.random() * 180000);
    const country = countries[id % countries.length];
    let slug = slugify(`${brand}_${model}`).replace(/-/g, "_");
    if (seen.has(slug)) slug = slug + "_" + id;
    seen.add(slug);
    id++;
    cars.push({
      slug,
      brand,
      model,
      bodyType,
      country,
      budgetMin: bMin,
      budgetMax: bMax,
      savingsUpTo: Math.round(savingsUpTo / 10000) * 10000,
    });
  }
}

// Pad to 150 with variants (different country/budget)
while (cars.length < 150) {
  const c = cars[cars.length % 85];
  const suffix = "a" + cars.length;
  cars.push({
    ...c,
    slug: c.slug + "_" + suffix,
    country: countries[cars.length % countries.length],
    budgetMin: c.budgetMin + (cars.length % 4) * 50000,
    budgetMax: c.budgetMax + (cars.length % 3) * 50000,
    savingsUpTo: c.savingsUpTo + (cars.length % 6) * 25000,
  });
}

const out = cars.slice(0, 150);
const outPath = path.join(__dirname, "..", "data", "cars.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(out, null, 2), "utf8");
console.log("Generated", out.length, "cars to data/cars.json");
