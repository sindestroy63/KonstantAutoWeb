import fs from "node:fs/promises";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import world from "world-atlas/land-110m.json" with { type: "json" };

const width = 760;
const height = 360;
const land = feature(world, world.objects.land);
const projection = geoNaturalEarth1().fitExtent([[8, 8], [width - 8, height - 8]], { type: "Sphere" });
const path = geoPath(projection)(land);

const locations = {
  usa: { label: "США", coordinates: [-98, 38] },
  europe: { label: "Европа", coordinates: [10, 50] },
  uae: { label: "ОАЭ", coordinates: [54.37, 24.45] },
  china: { label: "Китай", coordinates: [104, 35] },
  korea: { label: "Южная Корея", shortLabel: "Корея", coordinates: [127.8, 36] },
  japan: { label: "Япония", coordinates: [138, 37] },
  samara: { label: "Самара", coordinates: [50.15, 53.2] },
};

const points = Object.fromEntries(Object.entries(locations).map(([key, value]) => {
  const [x, y] = projection(value.coordinates);
  return [key, { ...value, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 }];
}));

const output = `// Generated from Natural Earth 1:110m via world-atlas. Do not edit manually.\n` +
  `export const WORLD_MAP_VIEWBOX = "0 0 ${width} ${height}";\n` +
  `export const WORLD_MAP_PATH = ${JSON.stringify(path)};\n` +
  `export const WORLD_MAP_POINTS = ${JSON.stringify(points, null, 2)} as const;\n`;

await fs.writeFile("data/worldMap.generated.ts", output);
console.log(`Generated map path with ${path.length} characters.`);
