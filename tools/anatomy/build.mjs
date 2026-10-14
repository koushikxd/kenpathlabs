// Builds every figure: node tools/anatomy/build.mjs
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const FIGURES = join(dirname(fileURLToPath(import.meta.url)), "figures");
for (const file of readdirSync(FIGURES)
  .filter((f) => f.endsWith(".mjs"))
  .sort()) {
  await import(pathToFileURL(join(FIGURES, file)).href);
}
