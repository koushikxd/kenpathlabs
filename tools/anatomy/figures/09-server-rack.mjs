import * as k from "../kit/iso-kit.mjs";
import * as G from "../kit/lathe.mjs";
import { HEIGHT, WIDTH, writeFigure } from "../common.mjs";

// A short open-frame rack on casters, four servers between the posts. Front faces +y.
const RACK = { x: -55, y: -25, w: 110, d: 50, r: 1.2 };
const POST = 5;
const CASTER_TOP = 8;
const PLINTH_TOP = 13;
const PITCH = 9; // one rack unit
const UNITS = [2, 1, 1, 1]; // bottom to top
const FIRST = PLINTH_TOP + 1;
const POST_TOP = FIRST + PITCH * UNITS.reduce((sum, u) => sum + u, 0);
const FRAME_TOP = POST_TOP + 3;
const FACE = RACK.y + RACK.d; // front face of the posts
const BEZEL_FRONT = FACE + 1.5;
const INNER = RACK.x + POST; // inside face of the left posts
const LIT = 2; // server whose activity LED is the accent

const P = k.fitProjection(k.boxCorners({ ...RACK, d: RACK.d + 1.5 }, 0, FRAME_TOP), WIDTH, HEIGHT, {
  pad: 14,
  azimuth: 58,
});

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const pathOf = (points) =>
  `M${points
    .map((p) =>
      at(p)
        .map((v) => v.toFixed(1))
        .join(" "),
    )
    .join("L")}Z`;
// A closed rounded slot on a face of constant y: vents, drive latches, LED windows.
const slotOnFront = (x, z, w, h, y) =>
  pathOf(k.ringOf({ x, y: z, w, d: h, r: Math.min(w, h) / 2 }, 4).map(([a, b]) => [a, y, b]));

const servers = [];
UNITS.reduce((z, units, index) => {
  servers.push({ index, z, h: units * PITCH - 1, units });
  return z + units * PITCH;
}, FIRST);

function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(RACK, 0, PLINTH_TOP, P)}"/>`];
  const wheels = k
    .corners(RACK, 7)
    .sort((a, b) => k.depthOf([...a, 0], P) - k.depthOf([...b, 0], P));
  for (const [cx, cy] of wheels) {
    const cheek = (y) =>
      S(k.slabOf({ x: cx - 2.2, y, w: 4.4, d: 0.8, r: 0.2 }, 2, 4.4, P, 2), {
        tone: "mid",
        crease: "none",
      });
    out.push(cheek(cy - 2.2));
    out.push(S(G.disc(0, 2.6, 3, G.frameAlong([cx, cy - 1.3, 3], [0, 1, 0]), P), { tone: "lo" }));
    out.push(cheek(cy + 1.4));
    out.push(D([at([cx, cy + 2.2, 3])], { size: 0.55, tone: "hi" }));
    out.push(
      S(k.slabOf({ x: cx - 2.6, y: cy - 2.6, w: 5.2, d: 5.2, r: 0.6 }, 6.4, 0.7, P, 2), {
        tone: "mid",
        crease: "none",
      }),
    );
    out.push(S(k.cylinder(cx, cy, 2.4, 7.1, 0.9, P, 20), { tone: "mid" }));
  }
  const plinth = k.slabOf(RACK, CASTER_TOP, PLINTH_TOP - CASTER_TOP, P, 3, 0.6);
  const vents = [-30, -22, -14, 14, 22, 30]
    .map((x) => slotOnFront(x - 3, CASTER_TOP + 1.8, 6, 1.4, FACE))
    .join("");
  out.push(S(plinth, { tone: "lo", inner: L(vents, { tone: "faint" }) }));
  out.push(
    D(
      [-50, -40, 40, 50].map((x) => at([x, FACE, (CASTER_TOP + PLINTH_TOP) / 2])),
      { size: 0.5 },
    ),
  );
  return out.join("");
}

function post(x, y) {
  const plan = { x, y, w: POST, d: POST, r: 0.5 };
  const out = [S(k.slabOf(plan, PLINTH_TOP, POST_TOP - PLINTH_TOP, P, 2, 0.4), { tone: "mid" })];
  // Square-hole mounting rows, three to a rack unit, on the faces you can see.
  const holes = [];
  for (let z = PLINTH_TOP + 1.5; z < POST_TOP - 0.5; z += PITCH / 3) {
    if (x > 0) holes.push(at([x + POST, y + POST / 2, z]));
    if (y > 0) holes.push(at([x + POST / 2, y + POST, z]));
  }
  out.push(D(holes, { size: 0.45, tone: "lo" }));
  return out.join("");
}

function ear(server, left) {
  const x = left ? RACK.x + 0.5 : RACK.x + RACK.w - POST - 0.5;
  const plan = { x, y: FACE, w: POST, d: 1, r: 0.3 };
  const out = [S(k.slabOf(plan, server.z, server.h, P, 2), { tone: "mid", crease: "none" })];
  const screws =
    server.units > 1 ? [server.z + 2.5, server.z + server.h - 2.5] : [server.z + server.h / 2];
  out.push(
    D(
      screws.map((z) => at([x + POST / 2, FACE + 1, z])),
      { size: 0.6, tone: "hi" },
    ),
  );
  return out.join("");
}

function server(s) {
  const { z, h } = s;
  const top = z + h;
  const chassis = { x: INNER, y: RACK.y + 2, w: RACK.w - 2 * POST, d: RACK.d - 3, r: 0.4 };
  const out = [];
  let lid = L(k.sideSeam(chassis, top - 1.6, P, 2), { tone: "faint" });
  if (s.index === UNITS.length - 1) {
    // The only lid you can see: a split seam and a closed vent field behind it.
    lid += L(k.lineOnTop([-6, chassis.y], [-6, FACE - 1], top, P), { tone: "lo" });
    const vents = [];
    for (let x = 4; x <= 40; x += 3)
      vents.push(k.planOutline({ x, y: -14, w: 1.4, d: 12, r: 0.7 }, top, P, 3));
    lid += L(vents.join(""), { tone: "faint" });
  }
  out.push(S(k.slabOf(chassis, z, h, P, 2, 0.4), { tone: "hi", crease: "lo", inner: lid }));
  const bezelPlan = {
    x: INNER + 0.5,
    y: FACE - 1,
    w: RACK.w - 2 * POST - 1,
    d: BEZEL_FRONT - FACE + 1,
    r: 0.5,
  };
  const y = BEZEL_FRONT;
  const lines = [];
  // Vent slots, closed, over the left third.
  for (let x = -40; x <= -16; x += 2.4) lines.push(slotOnFront(x, z + 1.4, 1.1, h - 2.8, y));
  // Drive bays: seams run the full face height so they end on the bezel's edges.
  const bays = s.units > 1 ? [-8, 6, 20, 34] : [-8, 10, 28];
  const bayEnd = 46;
  for (const x of bays) lines.push(k.segment([x, y, z], [x, y, top], P));
  if (s.units > 1) lines.push(k.segment([bays[0], y, z + h / 2], [bayEnd, y, z + h / 2], P));
  lines.push(k.segment([bayEnd, y, z], [bayEnd, y, top], P));
  const rows = s.units > 1 ? [z + h / 4, z + (3 * h) / 4] : [z + h / 2];
  const latches = [];
  bays.forEach((x, i) => {
    const next = bays[i + 1] ?? bayEnd;
    for (const row of rows) latches.push(slotOnFront(next - 6, row - 0.6, 4, 1.2, y));
  });
  out.push(
    S(k.slabOf(bezelPlan, z, h, P, 2, 0.3), {
      tone: "hi",
      crease: "lo",
      inner: L(lines.join(""), { tone: "lo" }) + L(latches.join(""), { tone: "faint" }),
    }),
  );
  // Status: a power LED (steady) and an activity LED (blinks).
  const ledZ = s.units > 1 ? top - 2.2 : z + h / 2;
  out.push(L(slotOnFront(-47.4, ledZ - 1.2, 5.2, 2.4, y), { tone: "lo" }));
  out.push(D([at([-46, y, ledZ])], { size: 0.8, tone: "lo" }));
  const activity = at([-44, y, ledZ]);
  out.push(
    s.index === LIT
      ? `<g data-part="led-${s.index}" class="rk-led"><g class="iso-dots rk-lit"><circle cx="${activity[0].toFixed(1)}" cy="${activity[1].toFixed(1)}" r="1.3"/></g></g>`
      : `<g data-part="led-${s.index}" class="rk-led">${D([activity], { size: 0.8, tone: "hi" })}</g>`,
  );
  return out.join("");
}

function topFrame() {
  const bar = (plan) =>
    S(k.slabOf(plan, POST_TOP, FRAME_TOP - POST_TOP, P, 2, 0.4), { tone: "mid" });
  const { x, y, w, d } = RACK;
  const out = [
    bar({ x, y, w: POST, d, r: 0.5 }),
    bar({ x: x + POST, y, w: w - 2 * POST, d: POST, r: 0.3 }),
    bar({ x: x + POST, y: y + d - POST, w: w - 2 * POST, d: POST, r: 0.3 }),
    bar({ x: x + w - POST, y, w: POST, d, r: 0.5 }),
  ];
  const screws = k.corners(RACK, POST / 2).map(([sx, sy]) => at([sx, sy, FRAME_TOP]));
  out.push(D(screws, { size: 0.55 }));
  return out.join("");
}

const { x: X0, y: Y0, w: W, d: DEPTH } = RACK;
const body = [
  base(),
  post(X0, Y0),
  post(X0, Y0 + DEPTH - POST),
  ...servers.map((s) => ear(s, true)),
  ...servers.map(server),
  post(X0 + W - POST, Y0),
  post(X0 + W - POST, Y0 + DEPTH - POST),
  ...servers.map((s) => ear(s, false)),
  topFrame(),
];

const css = `
.rk-lit circle{fill:var(--anatomy-lit);stroke:none;opacity:1}
@media (prefers-reduced-motion: no-preference){
@keyframes rk-blink{0%,100%{opacity:1}6%{opacity:.12}12%{opacity:1}18%{opacity:.12}24%{opacity:1}}
.rk-led{animation:rk-blink 6s ease-in-out infinite}
[data-part="led-1"]{animation-delay:.5s}
[data-part="led-2"]{animation-delay:1s}
[data-part="led-3"]{animation-delay:1.5s}
}`;

writeFigure("09-server-rack", {
  label:
    "A short open-frame server rack on casters holding four servers, their status lights blinking one after another.",
  body,
  css,
});
