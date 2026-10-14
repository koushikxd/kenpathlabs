// Tokenizers: a desk paper-tape punch that cuts a running tape into equal pieces.
import * as k from "../kit/iso-kit.mjs";
import * as G from "../kit/lathe.mjs";
import { HEIGHT, WIDTH, writeFigure } from "../common.mjs";

const PITCH = 22; // one token: piece length plus the kerf
const KERF = 2.4;
const TAPE_W = 12;
const TAPE_T = 0.8;

const PLATE = { x: -94, y: -23, w: 194, d: 46, r: 6 };
const PLATE_H = 6;
const FOOT_H = 3;

const BED = { x: -61, y: -14, w: 105, d: 28, r: 2 };
const BED_TOP = 7;
const TAPE_TOP = BED_TOP + TAPE_T;
const DIE_X = 0;
const BED_END = DIE_X + 2 * PITCH; // a kerf lands exactly on the bed end at rest

const SPOOL_X = -70;
const ROLL_R = 14;
const FLANGE_R = 16;
const SPOOL_Z = BED_TOP + ROLL_R; // tape leaves the bottom of the roll flat onto the bed line

const POST_Y = 11;
const BRIDGE_Z = 24;
const BRIDGE_H = 5;
const BRIDGE_TOP = BRIDGE_Z + BRIDGE_H;
const DIE_TOP = TAPE_TOP + 4.4;
const GRIP = [30, 0];

const TRAY = { x: 48, y: -17, w: 38, d: 34, r: 1.5 };
const TRAY_FLOOR = 1;
const TRAY_TOP = 4.5;
const WALL = 1.4;

const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
    [SPOOL_X, 0, SPOOL_Z + FLANGE_R],
    [GRIP[0], GRIP[1], 40],
    [0, -14, BRIDGE_TOP],
  ],
  WIDTH,
  HEIGHT,
  { pad: 14, azimuth: 58 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const byDepth = (points) =>
  [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const alongY = (x, z) => G.frameAlong([x, 0, z], [0, 1, 0]);

// Feed holes sit at the same places in every token, so the tape pattern repeats every PITCH.
const holesIn = (from, to, z) => {
  const out = [];
  for (let n = Math.floor((from - DIE_X) / PITCH) - 1; n * PITCH + DIE_X < to; n++) {
    for (let j = 0; j < 4; j++) {
      const x = DIE_X + (n + (j + 0.5) / 4) * PITCH;
      if (x > from + 1 && x < to - 1) out.push(at([x, 0, z]));
    }
  }
  return out;
};

const tapeSlab = (x0, x1) =>
  S(k.slabOf({ x: x0, y: -TAPE_W / 2, w: x1 - x0, d: TAPE_W, r: 0.3 }, BED_TOP, TAPE_T, P, 2), {
    tone: "hi",
    crease: "lo",
  });

function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 16))) {
    out.push(S(k.cylinder(x, y, 5, -PLATE_H - FOOT_H, 1.2, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 4, -PLATE_H - FOOT_H + 1.2, FOOT_H - 1.2, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.2), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 4), 0, P), { tone: "faint" }));
  const screws = k.corners(PLATE, 8);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 1.8, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(
    D(
      screws.map(([x, y]) => at([x, y, 0])),
      { size: 0.55 },
    ),
  );
  // Ruler along the front, a major tick at every token boundary.
  const strip = { x: -56, y: 15.5, w: 100, d: 4.5, r: 0.8 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(
    strip.x + 1,
    strip.x + strip.w - 1,
    PITCH / 4,
    4,
    strip.y + 0.6,
    0.6,
    [1.6, 3.2],
    P,
  );
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  return out.join("");
}

function bracket(y0) {
  const out = [];
  out.push(
    S(k.slabOf({ x: SPOOL_X - 6, y: y0 - 0.8, w: 12, d: 4, r: 0.8 }, 0, 1.4, P, 3), { tone: "lo" }),
  );
  out.push(
    S(
      k.slabOf({ x: SPOOL_X - 4, y: y0, w: 8, d: 2.4, r: 0.6 }, 1.4, SPOOL_Z + 4 - 1.4, P, 3, 0.4),
      { tone: "mid" },
    ),
  );
  out.push(
    D([at([SPOOL_X - 4.6, y0 + 1.2, 1.4]), at([SPOOL_X + 4.6, y0 + 1.2, 1.4])], { size: 0.5 }),
  );
  return out.join("");
}

function bed() {
  const out = [
    S(k.slabOf(BED, 0, BED_TOP, P, 4, 0.8), {
      tone: "mid",
      inner: L(k.sideSeam(BED, 2.4, P, 4), { tone: "faint" }),
    }),
  ];
  out.push(
    D(
      [
        at([BED.x + 3, -12.6, BED_TOP]),
        at([BED.x + 3, 12.6, BED_TOP]),
        at([BED_END - 3, -12.6, BED_TOP]),
        at([BED_END - 3, 12.6, BED_TOP]),
      ],
      { size: 0.5 },
    ),
  );
  return out.join("");
}

// Side guides that keep the tape straight; split around the die.
const fence = (side, x0, x1) => {
  const y = side < 0 ? -TAPE_W / 2 - 5.1 : TAPE_W / 2 + 3.5;
  return (
    S(k.slabOf({ x: x0, y, w: x1 - x0, d: 1.6, r: 0.5 }, BED_TOP, 1.2, P, 2), { tone: "mid" }) +
    D([at([x0 + 2, y + 0.8, BED_TOP + 1.2]), at([x1 - 2, y + 0.8, BED_TOP + 1.2])], {
      size: 0.45,
      tone: "lo",
    })
  );
};
const FENCE_A = [-52, -4];
const FENCE_B = [4, BED_END];

// The moving tape: one continuous strip fed from the roll, and cut pieces after the die.
// Each is clipped to its stretch of bed, and both slide one PITCH and snap back.
function clipOf(x0, x1) {
  const corners = [];
  for (const x of [x0, x1])
    for (const y of [-20, 20])
      for (const z of [BED_TOP - 1, TAPE_TOP + 1]) corners.push(at([x, y, z]));
  return k.pathOf(G.hullOf(corners), true);
}
function tape() {
  const strip =
    tapeSlab(SPOOL_X - PITCH, DIE_X - KERF / 2) +
    D(holesIn(SPOOL_X - PITCH, DIE_X - KERF / 2, TAPE_TOP), { size: 0.55, tone: "lo" });
  let pieces = "";
  for (let n = -1; n < 2; n++) {
    const x0 = DIE_X + n * PITCH + KERF / 2;
    const x1 = x0 + PITCH - KERF;
    pieces += tapeSlab(x0, x1) + D(holesIn(x0, x1, TAPE_TOP), { size: 0.55, tone: "lo" });
  }
  return [
    `<clipPath id="tp-in"><path d="${clipOf(SPOOL_X, DIE_X)}"/></clipPath>`,
    `<clipPath id="tp-out"><path d="${clipOf(DIE_X, BED_END)}"/></clipPath>`,
    `<g clip-path="url(#tp-in)"><g data-part="tape">${strip}</g></g>`,
    `<g clip-path="url(#tp-out)"><g data-part="tape">${pieces}</g></g>`,
  ].join("");
}

function spool() {
  const F = alongY(SPOOL_X, SPOOL_Z);
  const out = [];
  out.push(S(G.disc(-7.4, -6.2, FLANGE_R, F, P), { tone: "mid" }));
  out.push(S(G.disc(-6.2, 6.2, ROLL_R, F, P), { tone: "hi", crease: "lo" }));
  const holes = [0, 1, 2].map((i) => {
    const a = (i / 3) * Math.PI * 2 + 0.5;
    return G.circleOf(
      G.frameAlong([SPOOL_X + Math.cos(a) * 10, 0, SPOOL_Z + Math.sin(a) * 10], [0, 1, 0]),
      7.4,
      2.6,
      P,
      24,
    );
  });
  out.push(
    S(G.disc(6.2, 7.4, FLANGE_R, F, P), {
      tone: "mid",
      inner: L(holes.join("") + G.circleOf(F, 7.4, 6, P, 32), { tone: "lo" }),
    }),
  );
  out.push(S(G.disc(7.4, 8.4, 4, F, P), { tone: "mid" }));
  out.push(S(G.disc(8.4, 9.6, 1.6, F, P), { tone: "mid", crease: "none" }));
  return out.join("");
}

function frontSpool() {
  const F = alongY(SPOOL_X, SPOOL_Z);
  return (
    bracket(9.6) +
    S(G.disc(12, 13, 4, F, P), { tone: "mid" }) +
    S(G.disc(13, 14.4, 2.6, F, P), { tone: "mid" }) +
    D([at([SPOOL_X, 14.4, SPOOL_Z])], { size: 0.55, tone: "hi" })
  );
}

const post = (y) =>
  S(k.cylinder(0, y, 2.6, BED_TOP, 1.6, P, 24), { tone: "mid" }) +
  S(k.cylinder(0, y, 1.8, BED_TOP + 1.6, BRIDGE_Z - BED_TOP - 1.6, P, 24), {
    tone: "mid",
    crease: "none",
    inner: L(k.sideArc(0, y, 1.8, 16, P, 12), { tone: "faint" }),
  });

function die() {
  const plan = { x: -3, y: -8, w: 6, d: 16, r: 1 };
  return (
    S(k.slabOf(plan, TAPE_TOP, DIE_TOP - TAPE_TOP, P, 3, 0.5), {
      tone: "hi",
      crease: "lo",
      lit: true,
    }) +
    D([at([0, -5, DIE_TOP]), at([0, 5, DIE_TOP])], { size: 0.5, tone: "lo" }) +
    S(k.cylinder(0, 0, 1.8, DIE_TOP, BRIDGE_Z - 2 - DIE_TOP, P, 20), {
      tone: "mid",
      crease: "none",
    }) +
    S(k.cylinder(0, 0, 3, BRIDGE_Z - 2, 2, P, 24), { tone: "mid" })
  );
}

function head() {
  const out = [];
  const bridge = { x: -5, y: -14, w: 10, d: 28, r: 1.5 };
  out.push(S(k.slabOf(bridge, BRIDGE_Z, BRIDGE_H, P, 4, 0.6), { tone: "mid" }));
  for (const y of [-POST_Y, POST_Y])
    out.push(S(k.cylinder(0, y, 2.4, BRIDGE_TOP, 1.4, P, 6), { tone: "mid" }));
  out.push(
    D(
      [-POST_Y, POST_Y].map((y) => at([0, y, BRIDGE_TOP + 1.4])),
      { size: 0.5, tone: "lo" },
    ),
  );
  const lug = (y) =>
    S(k.slabOf({ x: -3, y, w: 6, d: 1.4, r: 0.4 }, BRIDGE_TOP, 5, P, 2), { tone: "mid" });
  out.push(lug(-3.4));
  out.push(
    S(
      k.slabOf(
        { x: -2, y: -1.6, w: GRIP[0] + 2, d: 3.2, r: 1.2 },
        BRIDGE_TOP + 1.5,
        2.5,
        P,
        3,
        0.4,
      ),
      { tone: "mid" },
    ),
  );
  out.push(lug(2));
  out.push(S(G.disc(3.4, 4.4, 1.2, alongY(0, BRIDGE_TOP + 2.75), P), { tone: "mid" }));
  const gz = BRIDGE_TOP + 4;
  out.push(S(k.cylinder(GRIP[0], GRIP[1], 2.6, gz, 6, P, 24), { tone: "mid" }));
  out.push(L(k.knurl(GRIP[0], GRIP[1], 2.6, gz, gz + 6, 18, P), { tone: "lo" }));
  out.push(S(k.cylinder(GRIP[0], GRIP[1], 3, gz + 6, 1.2, P, 24, 0.4), { tone: "mid" }));
  return out.join("");
}

// Spent tokens in the tray, each with its own feed holes.
function token([cx, cy], angle, z) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const len = PITCH - KERF;
  const ring = k
    .roundedPlan({ x: -len / 2, y: -TAPE_W / 2, w: len, d: TAPE_W, r: 0.3 }, 2)
    .map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c]);
  const holes = [0, 1, 2, 3].map((j) => {
    const u = -len / 2 - KERF / 2 + ((j + 0.5) / 4) * PITCH;
    return at([cx + u * c, cy + u * s, z + TAPE_T]);
  });
  return (
    S(k.extrude(ring, z, TAPE_T, P), { tone: "hi", crease: "lo" }) +
    D(holes, { size: 0.55, tone: "lo" })
  );
}

function tray() {
  const out = [S(k.slabOf(TRAY, 0, TRAY_FLOOR, P, 3), { tone: "lo" })];
  const wall = (plan) =>
    S(k.slabOf(plan, TRAY_FLOOR, TRAY_TOP - TRAY_FLOOR, P, 2, 0.3), { tone: "mid" });
  out.push(wall({ x: TRAY.x, y: TRAY.y, w: TRAY.w, d: WALL, r: 0.5 }));
  out.push(wall({ x: TRAY.x, y: TRAY.y + WALL, w: WALL, d: TRAY.d - 2 * WALL, r: 0.3 }));
  const tokens = [
    [[60, -8.5], 0.06],
    [[77, -5], Math.PI / 2 + 0.1],
    [[60, 7.4], -0.07],
  ];
  for (const [centre, angle] of [...tokens].sort(
    (a, b) => k.depthOf([...a[0], 0], P) - k.depthOf([...b[0], 0], P),
  ))
    out.push(token(centre, angle, TRAY_FLOOR));
  out.push(
    wall({ x: TRAY.x + TRAY.w - WALL, y: TRAY.y + WALL, w: WALL, d: TRAY.d - 2 * WALL, r: 0.3 }),
  );
  out.push(wall({ x: TRAY.x, y: TRAY.y + TRAY.d - WALL, w: TRAY.w, d: WALL, r: 0.5 }));
  return out.join("");
}

const [dx, dy] = k.axisVector(P, [PITCH, 0, 0]).map((v) => Math.round(v * 1000) / 1000);
const css = `
@media (prefers-reduced-motion: no-preference) {
  [data-part="tape"] { animation: tp-feed 5s ease-in-out infinite; }
  @keyframes tp-feed {
    0%, 55% { transform: translate(0px, 0px); }
    80%, 100% { transform: translate(${dx}px, ${dy}px); }
  }
}`;

writeFigure("01-token-press", {
  label:
    "A desk tape punch feeds paper tape off a spool under a lit die, which cuts it into equal-length pieces that collect in a tray.",
  body: [
    plate(),
    bracket(-12),
    bed(),
    fence(-1, ...FENCE_A),
    fence(-1, ...FENCE_B),
    tape(),
    fence(1, ...FENCE_A),
    spool(),
    frontSpool(),
    post(-POST_Y),
    die(),
    fence(1, ...FENCE_B),
    post(POST_Y),
    head(),
    tray(),
  ],
  css,
});
