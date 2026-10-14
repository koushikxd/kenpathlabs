import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import * as k from "./kit/iso-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(HERE, "../../apps/web/public/anatomy");
const OUT = join(HERE, "out");

// One frame for the whole set, so the figures share a scale on the round screen.
export const WIDTH = 360;
export const HEIGHT = 200;

// `css` is extra CSS for the figure's idle motion. It is embedded in the SVG, because the app
// shows the file through <img>, which cannot see page styles.
export function writeFigure(slug, { label, body, css = "" }) {
  const svg = k
    .figureSvg({ width: WIDTH, height: HEIGHT, label, body, standalone: "dark" })
    .replace("</style>", `${css}</style>`);
  mkdirSync(PUBLIC, { recursive: true });
  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(PUBLIC, `${slug}.svg`), svg);
  // A preview page for capture.mjs and lines.mjs. Not shipped.
  writeFileSync(
    join(OUT, `${slug}.html`),
    k.pageHtml({
      title: slug,
      theme: "dark",
      body: `<div class="iso-stage">${svg}</div>`,
      width: 420,
    }),
  );
  console.log("wrote", slug);
}
