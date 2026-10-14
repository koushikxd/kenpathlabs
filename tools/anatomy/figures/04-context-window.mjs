import * as k from "../kit/iso-kit.mjs";
import { HEIGHT, WIDTH, writeFigure } from "../common.mjs";

// A reading bench: a strip of equal token blocks on a grooved bed, and a carriage on two rails
// that carries a viewing frame over four of them. The frame is the context window.

const PLATE = { x: -124, y: -32, w: 248, d: 80, r: 6 };
const PLATE_H = 8;
const FOOT_H = 4;

const PITCH = 12;
const BLOCKS = 15;
const BLOCK = { w: 10, d: 22, h: 6 };
const BED = { x: -96, y: -14, w: 192, d: 28, r: 2 };
const BED_TOP = 3;

const RAIL_YS = [-22, 17];
const RAIL = { x: -110, w: 220, d: 5, h: 3 };
const STOP = { w: 6, y: -26, d: 52, h: 8, r: 1.2 };
const RULER = { x: -96, y: 33, w: 192, d: 7, r: 1 };

// The carriage is built centred on x = C0 and slides three pitches to C0 + 3 * PITCH.
const C0 = -18;
const TRAVEL = 3 * PITCH;
const SPAN = 4 * PITCH;
const RIM = 4;
const FRAME_Z = 11;
const FRAME_H = 3;
const FRAME_TOP = FRAME_Z + FRAME_H;
const SHOE_Z = 1;
const SHOE_H = 4;
const KNOB = { dx: 8, y: 27, r: 2.6, h: 5 };

const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
    ...k.boxCorners({ x: C0 - 28, y: -24, w: 56 + TRAVEL, d: 54, r: 0 }, 0, FRAME_TOP + KNOB.h),
  ],
  WIDTH,
  HEIGHT,
  { pad: 14, azimuth: 55 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const byDepth = (points) =>
  [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 16))) {
    out.push(S(k.cylinder(x, y, 6, -PLATE_H - FOOT_H, 1.4, P, 24), { tone: "lo" }));
    out.push(
      S(k.cylinder(x, y, 4.6, -PLATE_H - FOOT_H + 1.4, FOOT_H - 1.4, P, 24), { tone: "lo" }),
    );
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 6, 1.4), { tone: "lo" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 4), 0, P), { tone: "faint" }));
  const screws = k.corners(PLATE, 8);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(
    D(
      screws.map(([x, y]) => at([x, y, 0])),
      { size: 0.5 },
    ),
  );
  return out.join("");
}

const stop = (x) =>
  S(k.slabOf({ x, y: STOP.y, w: STOP.w, d: STOP.d, r: STOP.r }, 0, STOP.h, P, 3, 0.5), {
    tone: "mid",
  }) +
  D([at([x + STOP.w / 2, STOP.y + 4, STOP.h]), at([x + STOP.w / 2, STOP.y + STOP.d - 4, STOP.h])], {
    size: 0.5,
  });

const rail = (y) =>
  S(k.slabOf({ x: RAIL.x, y, w: RAIL.w, d: RAIL.d, r: 1 }, 0, RAIL.h, P, 3, 0.4), { tone: "mid" }) +
  D(
    [RAIL.x + 5, RAIL.x + RAIL.w - 5].map((x) => at([x, y + RAIL.d / 2, RAIL.h])),
    { size: 0.45 },
  );

function bed() {
  const out = [S(k.slabOf(BED, 0, BED_TOP, P, 3, 0.6), { tone: "mid" })];
  out.push(L(k.planOutline(k.insetPlan(BED, 1.5), BED_TOP, P, 3), { tone: "faint" }));
  for (let index = 0; index < BLOCKS; index++) {
    const cx = (index - (BLOCKS - 1) / 2) * PITCH;
    const plan = { x: cx - BLOCK.w / 2, y: -BLOCK.d / 2, w: BLOCK.w, d: BLOCK.d, r: 1 };
    out.push(S(k.slabOf(plan, BED_TOP, BLOCK.h, P, 3, 0.5), { tone: "hi", crease: "lo" }));
  }
  return out.join("");
}

function ruler() {
  const out = [S(k.slabOf(RULER, 0, 0.6, P, 3), { tone: "lo", crease: "none" })];
  const ticks = k.topTicks(
    RULER.x + 4,
    RULER.x + RULER.w - 4,
    3,
    4,
    RULER.y + 0.8,
    0.6,
    [2, 3.6],
    P,
  );
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  return out.join("");
}

const X0 = C0 - SPAN / 2 - RIM / 2;
const X1 = C0 + SPAN / 2 - RIM / 2;
const POST_XS = [X0 + RIM / 2, X1 + RIM / 2];

// A low shoe on each rail, the full width of the frame, with a post under each frame corner.
const shoe = (y, d) => {
  const plan = { x: X0 - 1, y, w: SPAN + 2 * RIM + 2, d, r: 1.5 };
  return (
    S(k.slabOf(plan, SHOE_Z, SHOE_H, P, 3, 0.5), { tone: "mid" }) +
    L(k.sideSeam(plan, SHOE_Z + 1.5, P, 3), { tone: "faint" })
  );
};
const posts = (y) =>
  POST_XS.map((x) =>
    S(k.cylinder(x, y, 1.6, SHOE_Z + SHOE_H, FRAME_Z - SHOE_Z - SHOE_H, P, 16), { tone: "mid" }),
  ).join("");
const bar = (plan) => S(k.slabOf(plan, FRAME_Z, FRAME_H, P, 3, 0.5), { tone: "hi", lit: true });

function carriageBack() {
  return shoe(-24, 9) + posts(-19.5);
}

function carriageFront() {
  const out = [shoe(15, 15)];
  out.push(
    D(
      [X0 + 3, X1 + 1].map((x) => at([x, 27, SHOE_Z + SHOE_H])),
      { size: 0.45 },
    ),
  );
  // Index pointer over the ruler.
  out.push(
    S(k.slabOf({ x: C0 - 1.5, y: 30, w: 3, d: 6, r: 0.6 }, 3.6, 1.4, P, 2), {
      tone: "mid",
      crease: "none",
    }),
  );
  out.push(L(k.lineOnTop([C0, 30], [C0, 36], 5, P), { tone: "hi" }));
  // The window, back to front: back bar, side bars, front posts, front bar.
  const width = SPAN + 2 * RIM;
  out.push(bar({ x: X0, y: -24, w: width, d: 8, r: 1 }));
  out.push(
    bar({ x: X0, y: -16, w: RIM, d: 32, r: 0.6 }),
    bar({ x: X1, y: -16, w: RIM, d: 32, r: 0.6 }),
  );
  out.push(posts(19.5));
  out.push(bar({ x: X0, y: 16, w: width, d: 8, r: 1 }));
  out.push(
    D(
      [
        [X0 + 2, -20],
        [X1 + 2, -20],
        [X0 + 2, 20],
        [X1 + 2, 20],
      ].map(([x, y]) => at([x, y, FRAME_TOP])),
      { size: 0.5, tone: "lo" },
    ),
  );
  // Lock knob on the front ledge.
  const kx = C0 + KNOB.dx;
  const top = SHOE_Z + SHOE_H;
  out.push(S(k.cylinder(kx, KNOB.y, KNOB.r, top, KNOB.h, P, 24), { tone: "mid" }));
  out.push(L(k.knurl(kx, KNOB.y, KNOB.r, top, top + KNOB.h, 20, P), { tone: "lo" }));
  out.push(D([at([kx, KNOB.y, top + KNOB.h])], { size: 0.5, tone: "hi" }));
  return out.join("");
}

const [dx, dy] = k.axisVector(P, [PITCH, 0, 0]).map((value) => Math.round(value * 100) / 100);
const step = (n) => `transform: translate(${(dx * n).toFixed(2)}px, ${(dy * n).toFixed(2)}px)`;
const css = `
@media (prefers-reduced-motion: no-preference) {
  [data-part^="carriage"] { animation: cw-slide 8s infinite; animation-timing-function: ease-in-out; }
  @keyframes cw-slide {
    0%, 10% { ${step(0)}; }
    20%, 32% { ${step(1)}; }
    42%, 54% { ${step(2)}; }
    64%, 76% { ${step(3)}; }
    94%, 100% { ${step(0)}; }
  }
}`;

writeFigure("04-context-window", {
  label:
    "A reading bench: a row of equal token blocks on a grooved bed, and a carriage on two rails carrying a window frame that shows only four blocks at a time as it slides along.",
  body: [
    base(),
    stop(-RAIL.w / 2 - STOP.w),
    rail(RAIL_YS[0]),
    `<g data-part="carriage-back">${carriageBack()}</g>`,
    bed(),
    rail(RAIL_YS[1]),
    ruler(),
    `<g data-part="carriage-front">${carriageFront()}</g>`,
    stop(RAIL.w / 2),
  ],
  css,
});
