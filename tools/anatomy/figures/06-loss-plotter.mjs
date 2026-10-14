import * as k from "../kit/iso-kit.mjs";
import { HEIGHT, WIDTH, writeFigure } from "../common.mjs";

// A flatbed pen plotter. The gantry runs along x on two rails; its pen has printed a loss curve
// on the clamped sheet behind it: epochs along +x, loss along -y.
const PLATE = { x: -92, y: -62, w: 184, d: 124, r: 6 };
const PLATE_H = 8;
const FOOT_H = 4;

const PAPER = { x: -68, y: -44, w: 128, d: 80, r: 0.5 };
const PAPER_Z = 0.6;

const RAIL_Y = [-54, 48];
const RAIL_W = 6;
const RAIL_H = 4;
const RAIL_FROM = -86;
const RAIL_TO = 86;

// Plot on the sheet: origin, axis lengths and the curve loss(e) = FLOOR + DROP * exp(-e / TAU).
const ORIGIN = [-58, 20];
const AXIS_E = 110;
const AXIS_L = 58;
const FLOOR = 6;
const DROP = 46;
const TAU = 14;
const E_END = 80;
const lossAt = (e) => FLOOR + DROP * Math.exp(-e / TAU);
const plotAt = (e) => [ORIGIN[0] + e, ORIGIN[1] - lossAt(e)];

const PEN = plotAt(E_END);
const PEN_DX = 10; // the pen sits this far in front (+x) of the beam's centre line
const GX = PEN[0] - PEN_DX;
const TRAVEL = 14;

const TRUCK_Z = RAIL_H;
const TRUCK_H = 5;
const POST_TOP = 20;
const BEAM_H = 7;
const BEAM_TOP = POST_TOP + BEAM_H;
const BEAM = { x: GX - 5, y: RAIL_Y[0] - 2, w: 10, d: RAIL_Y[1] - RAIL_Y[0] + RAIL_W + 4, r: 1.5 };

const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
    [GX, BEAM.y, BEAM_TOP + 8],
    [GX + TRAVEL, BEAM.y + BEAM.d, BEAM_TOP],
  ],
  WIDTH,
  HEIGHT,
  { pad: 14, azimuth: 60 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const byDepth = (points) =>
  [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 14))) {
    out.push(S(k.cylinder(x, y, 6, -PLATE_H - FOOT_H, FOOT_H, P, 24), { tone: "lo" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 6, 1.2), { tone: "lo" }));
  const screws = k.corners(PLATE, 5);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 1.8, 0, P, 14)).join(""), { tone: "lo" }));
  out.push(
    D(
      screws.map(([x, y]) => at([x, y, 0])),
      { size: 0.5 },
    ),
  );
  // Ruler strip beside the near rail: the gantry's position scale.
  const strip = {
    x: RAIL_FROM + 8,
    y: RAIL_Y[1] + RAIL_W + 1.5,
    w: RAIL_TO - RAIL_FROM - 16,
    d: 5,
    r: 0.8,
  };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 6, 5, strip.y, 0.6, [1.8, 3.4], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  return out.join("");
}

function sheet() {
  const out = [S(k.slabOf(PAPER, 0, PAPER_Z, P, 2), { tone: "hi", crease: "none" })];
  // Corner clips holding the sheet, each with its screw.
  for (const [x, y] of byDepth(k.corners(PAPER, 2))) {
    out.push(
      S(k.slabOf({ x: x - 4, y: y - 4, w: 8, d: 8, r: 1.2 }, PAPER_Z, 1.6, P, 3, 0.4), {
        tone: "mid",
      }),
    );
    out.push(D([at([x, y, PAPER_Z + 1.6])], { size: 0.55, tone: "lo" }));
  }
  // Axis pair, with ticks printed outside the plot.
  const [ox, oy] = ORIGIN;
  out.push(
    L(
      k.onTop(
        [
          [ox, oy - AXIS_L],
          [ox, oy],
          [ox + AXIS_E, oy],
        ],
        PAPER_Z,
        P,
      ),
      { tone: "mid" },
    ),
  );
  out.push(
    D([at([ox, oy - AXIS_L, PAPER_Z]), at([ox + AXIS_E, oy, PAPER_Z])], { size: 0.6, tone: "mid" }),
  );
  const ticks = [];
  for (let e = 15; e < AXIS_E; e += 15)
    ticks.push(k.lineOnTop([ox + e, oy], [ox + e, oy + 3], PAPER_Z, P));
  for (let l = 15; l < AXIS_L; l += 15)
    ticks.push(k.lineOnTop([ox, oy - l], [ox - 3, oy - l], PAPER_Z, P));
  out.push(L(ticks.join(""), { tone: "lo", free: "end" }));
  // The loss curve: falls fast, then flattens.
  const curve = [];
  for (let e = 0; e < E_END; e += 1.5) curve.push(plotAt(e));
  curve.push(plotAt(E_END));
  out.push(
    `<path class="iso-line" data-tone="hi" d="${k.onTop(curve, PAPER_Z, P)}" style="stroke-width:1.3"/>`,
  );
  out.push(D([at([...plotAt(0), PAPER_Z]), at([...PEN, PAPER_Z])], { size: 0.9, tone: "hi" }));
  return out.join("");
}

function rails() {
  return RAIL_Y.map((y) =>
    S(
      k.slabOf({ x: RAIL_FROM, y, w: RAIL_TO - RAIL_FROM, d: RAIL_W, r: 1 }, 0, RAIL_H, P, 3, 0.4),
      { tone: "mid" },
    ),
  ).join("");
}

// Plotter controller on the far end of the bed: a box with a knurled knob and its screws.
function controller() {
  const box = { x: -86, y: -30, w: 13, d: 34, r: 1.5 };
  const out = [
    S(k.slabOf(box, 0, 9, P, 3, 0.6), {
      tone: "mid",
      inner: L(k.sideSeam(box, 6, P, 3), { tone: "faint" }),
    }),
  ];
  out.push(
    D(
      k.corners(box, 2.5).map(([x, y]) => at([x, y, 9])),
      { size: 0.5, tone: "lo" },
    ),
  );
  out.push(S(k.cylinder(-79.5, -4, 3.6, 9, 3.5, P, 24), { tone: "mid" }));
  out.push(L(k.knurl(-79.5, -4, 3.6, 9, 12.5, 20, P), { tone: "lo" }));
  out.push(L(k.planOutline({ x: -83, y: -26, w: 7, d: 14, r: 1 }, 9, P, 3), { tone: "faint" }));
  return out.join("");
}

// A rack of spare pens on the near end of the bed.
function penRack() {
  const rack = { x: 68, y: -24, w: 10, d: 36, r: 1.5 };
  const out = [S(k.slabOf(rack, 0, 6, P, 3, 0.5), { tone: "mid" })];
  for (const y of [-16, -6, 4]) {
    out.push(L(k.ring(73, y, 2.3, 6, P, 16), { tone: "lo" }));
    out.push(S(k.cylinder(73, y, 1.9, 6, 6, P, 16), { tone: "mid", crease: "none" }));
    out.push(S(k.cylinder(73, y, 2.1, 12, 2.5, P, 16), { tone: "mid" }));
  }
  return out.join("");
}

// End stops: the far pair paints before the gantry, the near pair after.
function stops(x) {
  return RAIL_Y.map((y) => {
    const plan = { x, y: y - 1.5, w: 5, d: RAIL_W + 3, r: 1 };
    return (
      S(k.slabOf(plan, 0, RAIL_H + 4, P, 3, 0.4), { tone: "mid" }) +
      D([at([x + 2.5, y + RAIL_W / 2, RAIL_H + 4])], { size: 0.5 })
    );
  }).join("");
}

function upright(y) {
  const out = [];
  const truck = { x: GX - 9, y: y - 2, w: 18, d: RAIL_W + 4, r: 1.5 };
  out.push(
    `<path class="iso-halo" d="${k.haloOf(truck, TRUCK_Z, 0.1, P)}" style="filter:blur(3px)"/>`,
  );
  out.push(S(k.slabOf(truck, TRUCK_Z, TRUCK_H, P, 3, 0.5), { tone: "mid" }));
  out.push(
    D(
      [GX - 6, GX + 6].map((x) => at([x, y + RAIL_W / 2, TRUCK_Z + TRUCK_H])),
      { size: 0.5, tone: "lo" },
    ),
  );
  const post = { x: GX - 4, y, w: 8, d: RAIL_W, r: 1 };
  out.push(
    S(k.slabOf(post, TRUCK_Z + TRUCK_H, POST_TOP - TRUCK_Z - TRUCK_H, P, 3, 0.4), { tone: "mid" }),
  );
  return out.join("");
}

function beam() {
  const out = [];
  const beltZ = POST_TOP + BEAM_H / 2;
  const ends = [BEAM.y + 4, BEAM.y + BEAM.d - 4];
  out.push(S(k.slabOf(BEAM, POST_TOP, BEAM_H, P, 3, 0.6), { tone: "mid" }));
  // The belt along the beam's near face, between its two pulley pins.
  out.push(L(k.segment([GX + 5, ends[0], beltZ], [GX + 5, ends[1], beltZ], P), { tone: "lo" }));
  out.push(
    D(
      ends.map((y) => at([GX + 5, y, beltZ])),
      { size: 0.6, tone: "mid" },
    ),
  );
  // Stepper motor on the far end of the beam.
  const motor = { x: GX - 5, y: RAIL_Y[0] - 1, w: 10, d: 10, r: 1.2 };
  out.push(
    S(k.slabOf(motor, BEAM_TOP, 6, P, 3, 0.4), {
      tone: "mid",
      inner: L(k.sideSeam(motor, BEAM_TOP + 2, P, 3), { tone: "lo" }),
    }),
  );
  out.push(S(k.cylinder(GX, motor.y + 5, 2.2, BEAM_TOP + 6, 1.4, P, 16), { tone: "mid" }));
  return out.join("");
}

function penCarriage() {
  const out = [];
  const [px, py] = PEN;
  const block = { x: GX + 5, y: py - 6, w: 8, d: 12, r: 1.2 };
  out.push(S(k.slabOf(block, POST_TOP - 6, BEAM_H + 8, P, 3, 0.5), { tone: "mid" }));
  out.push(
    D(
      [py - 3.5, py + 3.5].map((y) => at([GX + 13, y, POST_TOP + 5])),
      { size: 0.5, tone: "lo" },
    ),
  );
  // Pen holder collar under the block, its thumb screw, the pen down to the paper and its cap above.
  out.push(S(k.cylinder(px, py, 3.2, POST_TOP - 10, 4, P, 20), { tone: "mid" }));
  out.push(S(k.cylinder(px + 4, py, 1.3, POST_TOP - 9, 2, P, 12), { tone: "mid" }));
  out.push(S(k.cylinder(px, py, 1.9, 4, POST_TOP - 14, P, 16), { tone: "hi", crease: "none" }));
  out.push(S(k.cylinder(px, py, 1, PAPER_Z, 3.4, P, 14), { tone: "hi", lit: true }));
  out.push(S(k.cylinder(px, py, 1.9, BEAM_TOP + 2, 3, P, 16), { tone: "hi" }));
  return out.join("");
}

const [dx, dy] = k.axisVector(P, [TRAVEL, 0, 0]).map((v) => Math.round(v * 100) / 100);

writeFigure("06-loss-plotter", {
  label:
    "A small flatbed pen plotter: a gantry on two rails carries a pen across a clamped sheet on which it has drawn a loss curve that falls fast and then flattens.",
  body: [
    base(),
    sheet(),
    rails(),
    stops(RAIL_FROM - 5),
    controller(),
    `<g data-part="gantry">${upright(RAIL_Y[0])}${upright(RAIL_Y[1])}${beam()}${penCarriage()}</g>`,
    penRack(),
    stops(RAIL_TO),
  ],
  css: `
@media (prefers-reduced-motion: no-preference) {
  [data-part="gantry"] { animation: gantry 7s ease-in-out infinite; }
  @keyframes gantry {
    0%, 22% { transform: translate(0px, 0px); }
    50%, 72% { transform: translate(${dx}px, ${dy}px); }
    100% { transform: translate(0px, 0px); }
  }
}`,
});
