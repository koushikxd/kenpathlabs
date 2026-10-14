// Polygraph: chart paper feeds under three still pens. Two write calm waves, one spikes.
import * as k from "../kit/iso-kit.mjs";
import * as G from "../kit/lathe.mjs";
import { HEIGHT, WIDTH, writeFigure } from "../common.mjs";

const PLATE = { x: -77, y: -41, w: 158, d: 89, r: 6 };
const PLATE_H = 5;
const FOOT_H = 3.5;
const CASE = { x: -72, y: -36, w: 148, d: 79, r: 4 };
const DECK = 10;
const PAPER_T = 0.4;
const SHEET = DECK + PAPER_T;
const PAPER_Y = [-18, 30];
const FEED = [-56, 63]; // paper visible from the supply roll to the take-up roll
const PERIOD = 40; // one loop of the feed, in world units along +x
const PAPER_X = [FEED[0] - PERIOD, 64];

const SUPPLY = { x: -56, r: 8.5 };
const TAKEUP = { x: 63, r: 6.5 };
const GUIDE = { x: -38, r: 2.4 };
const MOTOR_Y = -27;
const ARM_Z = DECK + 7;
const PENS = [
  {
    x: -20,
    lane: -6,
    wave: (u) => 2.2 * Math.sin((2 * Math.PI * u) / 20) + 0.6 * Math.sin((2 * Math.PI * u) / 10),
  },
  { x: -6, lane: 6, wave: (u) => 1.2 * Math.sin((2 * Math.PI * u) / 20) + spike(u), lit: true },
  {
    x: 8,
    lane: 18,
    wave: (u) =>
      1.9 * Math.sin((2 * Math.PI * u) / (PERIOD / 3)) + 0.8 * Math.sin((2 * Math.PI * u) / PERIOD),
  },
];
const ZIG = [
  [20, 0],
  [22, 5.8],
  [23.5, -4.6],
  [25, 5.2],
  [26.5, -3],
  [28, 2],
  [30, 0],
];
function spike(u) {
  const t = ((u % PERIOD) + PERIOD) % PERIOD;
  for (let i = 1; i < ZIG.length; i++) {
    const [x0, y0] = ZIG[i - 1];
    const [x1, y1] = ZIG[i];
    if (t >= x0 && t <= x1) return y0 + ((t - x0) / (x1 - x0)) * (y1 - y0);
  }
  return 0;
}

const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
    [SUPPLY.x - SUPPLY.r, PAPER_Y[0] - 3, SHEET + 2 * SUPPLY.r],
    [SUPPLY.x + SUPPLY.r, PAPER_Y[1] + 3, SHEET + 2 * SUPPLY.r],
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
const alongY = (x, y, z) => G.frameAlong([x, y, z], [0, 1, 0]);
const hullPath = (points) =>
  `M${G.hullOf(points.map(at))
    .map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`)
    .join("L")}Z`;
const boxHull = (x0, x1, y0, y1, z0, z1) =>
  hullPath(
    [x0, x1].flatMap((x) =>
      [y0, y1].flatMap((y) => [
        [x, y, z0],
        [x, y, z1],
      ]),
    ),
  );

function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 14))) {
    out.push(S(k.cylinder(x, y, 6, -PLATE_H - FOOT_H, 1.4, P, 24), { tone: "lo" }));
    out.push(
      S(k.cylinder(x, y, 4.6, -PLATE_H - FOOT_H + 1.4, FOOT_H - 1.4, P, 24), { tone: "lo" }),
    );
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 6, 1.2), { tone: "lo" }));
  const screws = [k.corners(PLATE, 4)[1], k.corners(PLATE, 4)[2], k.corners(PLATE, 4)[3]];
  out.push(
    D(
      screws.map(([x, y]) => at([x, y, 0])),
      { size: 0.5 },
    ),
  );
  return out.join("");
}

function body() {
  const out = [];
  const seam = k.sideSeam(CASE, 3.5, P, 6);
  out.push(S(k.slabOf(CASE, 0, DECK, P, 6, 1), { tone: "mid", inner: L(seam, { tone: "faint" }) }));
  out.push(
    D(
      k.corners(CASE, 3.5).map(([x, y]) => at([x, y, DECK])),
      { size: 0.5 },
    ),
  );
  return out.join("");
}

// A roll of chart paper on a spindle between two cheeks; the paper leaves or joins it at its bottom.
function spool({ x, r }) {
  const z = SHEET + r;
  const y0 = PAPER_Y[0] - 1;
  const y1 = PAPER_Y[1] + 1;
  const F = alongY(x, y0, z);
  const cheek = (y) =>
    S(k.slabOf({ x: x - 3, y, w: 6, d: 2.4, r: 0.6 }, DECK, r + 2.4, P, 2, 0.4), { tone: "mid" });
  const back = cheek(y0 - 3.4);
  const front = [
    S(G.disc(-1.6, 0, 2.4, F, P), { tone: "mid" }),
    S(G.disc(0, y1 - y0, r, F, P), { tone: "hi" }),
    L([r * 0.66, r * 0.4].map((ring) => G.circleOf(F, y1 - y0, ring, P)).join(""), {
      tone: "faint",
    }),
    S(G.disc(y1 - y0, y1 - y0 + 1.4, 2.2, F, P), { tone: "mid" }),
    cheek(y1 + 1.4),
    S(G.disc(0, 1.2, 1.6, alongY(x, y1 + 3.8, z), P), { tone: "mid" }),
  ].join("");
  return { back, front };
}

// Behind the paper: the spools' far cheeks, the guide roller's far bearing and the pen motors on their mount.
function backParts() {
  const out = [spool(SUPPLY).back, spool(TAKEUP).back];
  out.push(
    S(
      k.slabOf(
        { x: GUIDE.x - 2.5, y: PAPER_Y[0] - 3.4, w: 5, d: 2.4, r: 0.6 },
        DECK,
        4.4,
        P,
        2,
        0.4,
      ),
      { tone: "mid" },
    ),
  );
  const mount = { x: -29, y: MOTOR_Y - 6.5, w: 46, d: 13, r: 1.4 };
  out.push(S(k.slabOf(mount, DECK, 1, P, 3, 0.4), { tone: "lo" }));
  out.push(
    D(
      [
        [mount.x + 2.5, mount.y + 2.5],
        [mount.x + mount.w - 2.5, mount.y + 2.5],
        [mount.x + 2.5, mount.y + mount.d - 2.5],
        [mount.x + mount.w - 2.5, mount.y + mount.d - 2.5],
      ].map(([x, y]) => at([x, y, DECK + 1])),
      { size: 0.45 },
    ),
  );
  for (const pen of PENS) {
    out.push(
      S(k.cylinder(pen.x, MOTOR_Y, 5, DECK + 1, 3.6, P, 28), {
        tone: "mid",
        inner: L(k.sideArc(pen.x, MOTOR_Y, 5, DECK + 2.8, P, 20), { tone: "faint" }),
      }),
    );
    out.push(S(k.cylinder(pen.x, MOTOR_Y, 3.2, DECK + 4.6, 1.2, P, 20), { tone: "mid" }));
    out.push(
      S(k.cylinder(pen.x, MOTOR_Y, 1.6, DECK + 5.8, ARM_Z - DECK - 5.8, P, 16), {
        tone: pen.lit ? "hi" : "mid",
        lit: pen.lit,
      }),
    );
  }
  return out.join("");
}

// The paper and everything printed on it scroll together, clipped to the deck.
function paper() {
  const sheet = {
    x: PAPER_X[0],
    y: PAPER_Y[0],
    w: PAPER_X[1] - PAPER_X[0],
    d: PAPER_Y[1] - PAPER_Y[0],
    r: 0,
  };
  const grid = [];
  const major = [];
  for (let x = PAPER_X[0] + 5; x < PAPER_X[1]; x += 5)
    (Math.round(x - PAPER_X[0]) % 20 === 0 ? major : grid).push(
      k.lineOnTop([x, PAPER_Y[0]], [x, PAPER_Y[1]], SHEET, P),
    );
  const lanes = PENS.flatMap((pen) => [pen.lane - 6, pen.lane + 6]).filter(
    (y, i, all) => all.indexOf(y) === i,
  );
  // The rulings go under the sheet's outline, so they never notch its edge.
  const rulings = [
    L(grid.join(""), { tone: "faint" }),
    L(major.join(""), { tone: "lo" }),
    L(lanes.map((y) => k.lineOnTop([PAPER_X[0], y], [PAPER_X[1], y], SHEET, P)).join(""), {
      tone: "lo",
    }),
  ].join("");
  const sheetSvg = S(k.slabOf(sheet, DECK, PAPER_T, P, 1), {
    tone: "hi",
    crease: "none",
    inner: rulings,
  });
  const out = [`<g clip-path="url(#pg-paper)"><g class="pg-feed">${sheetSvg}</g></g>`];
  // Each trace starts at its pen; upstream of the tip the paper is still blank.
  for (const [i, pen] of PENS.entries()) {
    const points = [];
    for (let x = PAPER_X[0]; x <= PAPER_X[1] + 1e-9; x += 0.5)
      points.push([x, pen.lane + pen.wave(x - pen.x)]);
    const trace = `<path class="iso-line" data-tone="${pen.lit ? "lit" : "hi"}" style="stroke-width:${pen.lit ? 1.1 : 0.8}" d="${k.onTop(points, SHEET, P)}"/>`;
    out.push(`<g clip-path="url(#pg-trace${i})"><g class="pg-feed">${trace}</g></g>`);
  }
  return out.join("");
}

function clips() {
  const paperClip = boxHull(
    FEED[0],
    FEED[1],
    PAPER_Y[0] - 1,
    PAPER_Y[1] + 1,
    DECK - 0.2,
    SHEET + 0.1,
  );
  const traceClips = PENS.map(
    (pen, i) =>
      `<clipPath id="pg-trace${i}"><path d="${boxHull(pen.x, FEED[1], pen.lane - 6, pen.lane + 6, SHEET - 0.1, SHEET + 0.1)}"/></clipPath>`,
  );
  return `<defs><clipPath id="pg-paper"><path d="${paperClip}"/></clipPath>${traceClips.join("")}</defs>`;
}

function guide() {
  const out = [];
  const y0 = PAPER_Y[0] - 1;
  const y1 = PAPER_Y[1] + 1;
  out.push(
    S(G.disc(0, y1 - y0, GUIDE.r, alongY(GUIDE.x, y0, SHEET + GUIDE.r), P), { tone: "mid" }),
  );
  out.push(
    S(k.slabOf({ x: GUIDE.x - 2.5, y: y1, w: 5, d: 2.4, r: 0.6 }, DECK, 4.4, P, 2, 0.4), {
      tone: "mid",
    }),
  );
  out.push(D([at([GUIDE.x, y1 + 2.4, SHEET + GUIDE.r])], { size: 0.5 }));
  return out.join("");
}

function pens() {
  const out = [];
  for (const pen of [...PENS].sort(
    (a, b) => k.depthOf([a.x, a.lane, 0], P) - k.depthOf([b.x, b.lane, 0], P),
  )) {
    const tone = pen.lit ? "hi" : "mid";
    out.push(S(k.cylinder(pen.x, pen.lane, 1.4, SHEET, 0.6, P, 16), { tone, lit: pen.lit }));
    out.push(
      S(k.cylinder(pen.x, pen.lane, 0.7, SHEET + 0.6, ARM_Z - SHEET - 0.6, P, 12), {
        tone,
        crease: "none",
        lit: pen.lit,
      }),
    );
    out.push(
      S(
        k.slabOf(
          { x: pen.x - 1.3, y: MOTOR_Y - 3.4, w: 2.6, d: pen.lane - MOTOR_Y + 4.8, r: 1.1 },
          ARM_Z,
          1.4,
          P,
          3,
          0.3,
        ),
        { tone, lit: pen.lit },
      ),
    );
    out.push(D([at([pen.x, MOTOR_Y, ARM_Z + 1.4])], { size: 0.5, tone: pen.lit ? "hi" : "mid" }));
  }
  return out.join("");
}

// One gain knob per pen on a raised panel along the front of the deck.
function controls() {
  const panel = { x: -46, y: 32, w: 112, d: 9, r: 1.5 };
  const top = DECK + 1.6;
  const out = [S(k.slabOf(panel, DECK, 1.6, P, 3, 0.4), { tone: "mid" })];
  out.push(
    D(
      [
        [panel.x + 2.5, panel.y + panel.d / 2],
        [panel.x + panel.w - 2.5, panel.y + panel.d / 2],
      ].map(([x, y]) => at([x, y, top])),
      { size: 0.5 },
    ),
  );
  for (const pen of PENS) {
    const [x, y] = [pen.x, panel.y + panel.d / 2];
    out.push(
      S(k.cylinder(x, y, 3.2, top, 3, P, 24), {
        tone: "mid",
        inner: L(k.knurl(x, y, 3.2, top, top + 3, 20, P), { tone: "lo" }),
      }),
    );
    out.push(L(k.lineOnTop([x, y], [x, y - 2.6], top + 3, P), { tone: "hi", free: "end" }));
  }
  const label = { x: 26, y: panel.y + 1.5, w: 34, d: 6, r: 0.8 };
  out.push(S(k.slabOf(label, top, 0.5, P, 3), { tone: "lo", crease: "none" }));
  out.push(
    L(
      [
        [2, 22],
        [4, 16],
      ]
        .map(([dy, len]) =>
          k.lineOnTop([label.x + 3, label.y + dy], [label.x + 3 + len, label.y + dy], top + 0.5, P),
        )
        .join(""),
      { tone: "lo", free: true },
    ),
  );
  return out.join("");
}

const [dx, dy] = k.axisVector(P, [PERIOD, 0, 0]);
const css = `
@media (prefers-reduced-motion: no-preference) {
  .pg-feed { animation: pg-feed 6s ease-in-out infinite; }
  @keyframes pg-feed {
    0%, 15% { transform: translate(0px, 0px); }
    85%, 100% { transform: translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px); }
  }
}`;

writeFigure("10-polygraph", {
  label:
    "A polygraph: chart paper feeds from one roll to another under three pens, two drawing calm waves and one drawing sudden spikes.",
  body: [
    clips(),
    base(),
    body(),
    backParts(),
    paper(),
    guide(),
    spool(SUPPLY).front,
    spool(TAKEUP).front,
    pens(),
    controls(),
  ],
  css,
});
