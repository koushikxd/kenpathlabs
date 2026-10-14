// Attention as a switchboard patch bay: four query jacks on the top row, each corded to a key jack
// below, one cord (the strongest link) lit, with its indicator lamp breathing.
import * as k from "../kit/iso-kit.mjs";
import * as G from "../kit/lathe.mjs";
import { HEIGHT, WIDTH, writeFigure } from "../common.mjs";

const PLATE = { x: -74, y: -28, w: 148, d: 68, r: 6 };
const PLATE_H = 7;
const FOOT_H = 4;

// The console is a prism along x. Its side profile in (y, z): flat back, sloped panel, short front.
const BODY_X = 60;
const PROFILE = [
  [-16, 0],
  [22, 0],
  [22, 8],
  [-6, 46],
  [-16, 46],
];
const CHEEK = [
  [-17.5, 0],
  [23.5, 0],
  [23.5, 8.5],
  [-5.6, 48],
  [-17.5, 48],
];

// The slope: o is its front edge, d runs up it, n is its outward normal.
const SLOPE_O = [0, 22, 8];
const D = [0, -28 / 47.2, 38 / 47.2];
const N = [0, 38 / 47.2, 28 / 47.2];
const FACE = 1.2;
const RAIL = 0.7;
const on = (x, t, h = 0) => [
  x + SLOPE_O[0],
  SLOPE_O[1] + D[1] * t + N[1] * h,
  SLOPE_O[2] + D[2] * t + N[2] * h,
];
const frameAt = (x, t) => G.frameOf(on(x, t), N, [1, 0, 0], D);

const LAMP_T = 41;
const TOP_T = 31;
const LOW_T = 13;
const TOP = [-36, -12, 12, 36];
const LOW = [-48, -24, 0, 24, 48];
// Which key each query is corded to. Key 4 stays free so one bare socket shows.
const LINKS = [1, 3, 0, 2];
const STRONG = 1;
const SAG = [9, 16, 12, 10];

const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
    ...k.boxCorners({ x: -64, y: -17.5, w: 128, d: 41, r: 0 }, 0, 48),
  ],
  WIDTH,
  HEIGHT,
  { pad: 14, azimuth: 60 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const dots = (points, style) => k.dotsSvg(points.map(at), style);
const byDepth = (points) =>
  [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const sideFrame = G.frameOf([0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]);

function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 12))) {
    out.push(S(k.cylinder(x, y, 5.5, -PLATE_H - FOOT_H, 1.4, P, 24), { tone: "lo" }));
    out.push(
      S(k.cylinder(x, y, 4.2, -PLATE_H - FOOT_H + 1.4, FOOT_H - 1.4, P, 24), { tone: "lo" }),
    );
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 6, 1.2), { tone: "lo" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 10), 0, P), { tone: "faint" }));
  const screws = k.corners(PLATE, 5);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(
    dots(
      screws.map(([x, y]) => [x, y, 0]),
      { size: 0.55 },
    ),
  );
  return out.join("");
}

function console_() {
  const out = [];
  out.push(S(G.prismOf(sideFrame, CHEEK, -BODY_X - 4, -BODY_X, P), { tone: "mid" }));
  out.push(S(G.prismOf(sideFrame, PROFILE, -BODY_X, BODY_X, P), { tone: "mid" }));
  out.push(S(G.prismOf(sideFrame, CHEEK, BODY_X, BODY_X + 4, P), { tone: "mid" }));
  // Two vent slots on the flat top, closed outlines.
  for (const x of [-30, 30])
    out.push(
      L(k.planOutline({ x: x - 16, y: -12.2, w: 32, d: 2.4, r: 1.2 }, 46, P, 3), { tone: "faint" }),
    );
  // Faceplate on the slope.
  const plateFrame = G.frameOf(on(0, 0), N, [1, 0, 0], D);
  const plate = k.ringOf({ x: -55, y: 3, w: 110, d: 42.5, r: 2 }, 3);
  out.push(S(G.prismOf(plateFrame, plate, 0, FACE, P), { tone: "mid" }));
  out.push(
    dots(
      [
        [-52, 6],
        [52, 6],
        [-52, 42.5],
        [52, 42.5],
      ].map(([x, t]) => on(x, t, FACE)),
      { size: 0.55, tone: "hi" },
    ),
  );
  // Designation strip between the rows.
  const strip = k.ringOf({ x: -50, y: 21, w: 100, d: 2.6, r: 1 }, 2);
  out.push(S(G.prismOf(plateFrame, strip, FACE, FACE + 0.5, P), { tone: "lo", crease: "none" }));
  // Lamp rail along the top of the faceplate.
  const rail = { x: -46, y: LAMP_T - 3.4, w: 92, d: 6.8, r: 1.6 };
  out.push(S(G.prismOf(plateFrame, k.ringOf(rail, 3), FACE, FACE + RAIL, P), { tone: "lo" }));
  out.push(
    dots(
      [-43, 43].map((x) => on(x, LAMP_T, FACE + RAIL)),
      { size: 0.5, tone: "hi" },
    ),
  );
  return out.join("");
}

function lamp(x, lit) {
  const F = frameAt(x, LAMP_T);
  const z = FACE + RAIL;
  const out = [S(G.disc(z, z + 0.9, 2.6, F, P), { tone: "mid" })];
  out.push(S(G.disc(z + 0.9, z + 2.1, 1.9, F, P), { tone: "hi", lit }));
  out.push(S(G.disc(z + 2.1, z + 2.7, 1.3, F, P), { tone: "hi", lit }));
  if (lit)
    out.push(`<path class="pb-glow" data-part="lamp" d="${G.circleOf(F, z + 2.7, 1.3, P, 24)}"/>`);
  return out.join("");
}

function jack(x, t, plug) {
  const F = frameAt(x, t);
  const out = [S(G.disc(FACE, FACE + 1.4, 3.2, F, P), { tone: "mid" })];
  if (!plug) {
    out.push(`<path class="pb-hole" d="${G.circleOf(F, FACE + 1.4, 1.5, P, 24)}"/>`);
    return out.join("");
  }
  const lit = plug === "lit";
  out.push(S(G.disc(FACE + 1.4, FACE + 4.6, 2, F, P), { tone: "hi", lit }));
  out.push(S(G.disc(FACE + 4.6, FACE + 6.2, 1.4, F, P), { tone: "hi", lit }));
  return out.join("");
}

const tail = (x, t) => on(x, t, FACE + 6.2);

// A cord leaves each plug along the panel normal and sags down and forward between them.
function cord(q) {
  const a = tail(TOP[q], TOP_T);
  const b = tail(LOW[LINKS[q]], LOW_T);
  const sag = SAG[q];
  const lift = (p, by) => [p[0] + N[0] * by, p[1] + N[1] * by + sag * 0.6, p[2] + N[2] * by - sag];
  const c1 = lift(a, 5);
  const c2 = lift(b, 5);
  const points = [];
  for (let i = 0; i <= 24; i++) {
    const s = i / 24;
    const w = [(1 - s) ** 3, 3 * s * (1 - s) ** 2, 3 * s * s * (1 - s), s ** 3];
    points.push(
      [0, 1, 2].map((axis) => w[0] * a[axis] + w[1] * c1[axis] + w[2] * c2[axis] + w[3] * b[axis]),
    );
  }
  const clearance = Math.min(
    ...points.map((p) => (p[1] - SLOPE_O[1]) * N[1] + (p[2] - SLOPE_O[2]) * N[2]),
  );
  if (clearance < 2) console.warn(`cord ${q} comes within ${clearance.toFixed(1)} of the panel`);
  const screen = points.map(at);
  const tone = q === STRONG ? "lit" : "mid";
  // A paper-coloured casing under each cord, so a cord crossing in front cuts the one behind.
  return `<g class="pb-cord"><path class="pb-casing" d="${k.pathOf(screen.slice(3, -3))}"/>${k.wireSvg(screen[0], screen[screen.length - 1], { via: screen.slice(1, -1), tone, size: 0.9 })}</g>`;
}

function panel() {
  const items = [
    ...TOP.map((x, q) => ({ at: on(x, LAMP_T), svg: lamp(x, q === STRONG) })),
    ...TOP.map((x, q) => ({
      at: on(x, TOP_T),
      svg: jack(x, TOP_T, q === STRONG ? "lit" : "plug"),
    })),
    ...LOW.map((x, key) => {
      const q = LINKS.indexOf(key);
      return {
        at: on(x, LOW_T),
        svg: jack(x, LOW_T, q < 0 ? null : q === STRONG ? "lit" : "plug"),
      };
    }),
  ];
  return items
    .sort((a, b) => k.depthOf(a.at, P) - k.depthOf(b.at, P))
    .map((item) => item.svg)
    .join("");
}

const cords = TOP.map((_, q) => q)
  .sort((a, b) => SAG[a] - SAG[b])
  .map(cord)
  .join("");

const css = `
.pb-glow{fill:var(--anatomy-lit);stroke:none}
.pb-hole{fill:var(--anatomy-halo);stroke:var(--anatomy-lo);stroke-width:var(--anatomy-weight)}
.pb-cord .iso-line{stroke-width:1.6}
.pb-casing{fill:none;stroke:var(--anatomy-paper);stroke-width:3.6;stroke-linecap:round}
@media (prefers-reduced-motion: no-preference){
  .pb-glow{animation:pb-pulse 6s ease-in-out infinite}
  @keyframes pb-pulse{0%,30%{opacity:1}55%{opacity:.25}80%,100%{opacity:1}}
}`;

writeFigure("02-patch-bay", {
  label:
    "A switchboard patch bay on a base: four jacks on the top row are each corded to a jack on the row below, and one cord, the strongest link, is lit while its indicator lamp glows.",
  body: [base(), console_(), panel(), cords],
  css,
});
