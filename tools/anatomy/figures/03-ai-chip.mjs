import * as k from "../kit/iso-kit.mjs";
import { HEIGHT, WIDTH, writeFigure } from "../common.mjs";

// An accelerator module: a PCB on standoffs carrying one package (substrate, lidded compute die,
// four HBM stacks, capacitor rows) inside a stiffener frame, with VRM parts and gold fingers.
const PCB_H = 2.4;
const STANDOFF_H = 8;
const BOARD = { x: -90, y: -45, w: 180, d: 90, r: 0 };
const TAB = { x0: -55, x1: 55, y: 45, d: 8 };
const NOTCH = { x0: 20, x1: 24, depth: 5 };

const FRAME = { x: -50, y: -38, w: 100, d: 76, r: 1.5 };
const BAR = 6;
const FRAME_H = 4;
const SUB = { x: -43, y: -31, w: 86, d: 62, r: 1.5 };
const SUB_H = 2.6;
const ON_SUB = PCB_H + SUB_H;
const LID_FOOT = { x: -17, y: -19, w: 34, d: 38, r: 1.5 };
const LID = { x: -14.5, y: -16.5, w: 29, d: 33, r: 1.5 };
const LID_TOP = ON_SUB + 6.4;
const HBM_LAYERS = 4;
const HBM_LAYER = 1.5;
const HBM = [-36, 24].flatMap((x) => [-18, 2].map((y) => ({ x, y, w: 12, d: 16, r: 0.6 })));

const P = k.fitProjection(
  [...k.boxCorners({ ...BOARD, d: BOARD.d + TAB.d }, -STANDOFF_H - 1.2, PCB_H + 9)],
  WIDTH,
  HEIGHT,
  { pad: 14, azimuth: 40 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const depth = (x, y) => k.depthOf([x, y, 0], P);
const centre = (plan) => [plan.x + plan.w / 2, plan.y + plan.d / 2];
const sorted = (items) => [...items].sort((a, b) => a.depth - b.depth).map((item) => item.svg);
const STANDOFFS = k.corners(BOARD, 8);

function board() {
  const out = [
    `<path class="iso-halo" d="${k.haloOf({ ...BOARD, d: BOARD.d + TAB.d }, -STANDOFF_H - 1.2, STANDOFF_H, P)}"/>`,
  ];
  for (const [x, y] of [...STANDOFFS].sort((a, b) => depth(...a) - depth(...b))) {
    out.push(S(k.cylinder(x, y, 4.6, -STANDOFF_H - 1.2, 1.2, P, 24), { tone: "lo" }));
    out.push(
      S(k.cylinder(x, y, 3, -STANDOFF_H, STANDOFF_H, P, 20), { tone: "mid", crease: "none" }),
    );
  }
  const { x, y, w, d } = BOARD;
  const edge = TAB.y + TAB.d;
  const ring = [
    [x, y],
    [x + w, y],
    [x + w, y + d],
    [TAB.x1, y + d],
    [TAB.x1, edge],
    [NOTCH.x1, edge],
    [NOTCH.x1, edge - NOTCH.depth],
    [NOTCH.x0, edge - NOTCH.depth],
    [NOTCH.x0, edge],
    [TAB.x0, edge],
    [TAB.x0, y + d],
    [x, y + d],
  ];
  out.push(S(k.extrude(ring, 0, PCB_H, P, { convex: false }), { tone: "lo" }));
  // Gold fingers: pads running to the tab edge, skipping the key notch.
  const fingers = [];
  for (let fx = TAB.x0 + 3; fx + 2.4 <= TAB.x1 - 2; fx += 4) {
    if (fx + 2.4 > NOTCH.x0 - 1 && fx < NOTCH.x1 + 1) continue;
    fingers.push(
      S(k.slabOf({ x: fx, y: TAB.y + 1, w: 2.4, d: TAB.d - 1, r: 0 }, PCB_H, 0.3, P, 1), {
        tone: "hi",
        flat: true,
        crease: "none",
      }),
    );
  }
  out.push(...fingers);
  // Silkscreen keep-out around the package and the VRM.
  out.push(L(k.planOutline(k.insetPlan(FRAME, -3), PCB_H, P, 3), { tone: "faint" }));
  out.push(
    L(k.planOutline({ x: -84, y: -40, w: 28, d: 80, r: 2 }, PCB_H, P, 3), { tone: "faint" }),
  );
  return out.join("");
}

function screwHead(x, y, z) {
  return (
    S(k.cylinder(x, y, 2, z, 0.9, P, 18), { tone: "mid", crease: "none" }) +
    D([at([x, y, z + 0.9])], { size: 0.55, tone: "hi" })
  );
}

function hbm(plan) {
  const out = [];
  for (let i = 0; i < HBM_LAYERS; i++) {
    out.push(
      S(k.slabOf(plan, ON_SUB + i * HBM_LAYER, HBM_LAYER, P, 2), { tone: "hi", crease: "lo" }),
    );
  }
  return out.join("");
}

function cap(x, y, z) {
  return S(k.slabOf({ x: x - 1.6, y: y - 1, w: 3.2, d: 2, r: 0.3 }, z, 1.3, P, 1), {
    tone: "mid",
    crease: "none",
  });
}

function lid() {
  const out = [];
  out.push(S(k.slabOf(LID_FOOT, ON_SUB, 1.4, P, 3), { tone: "hi", lit: true }));
  out.push(
    S(k.slabOf(LID, ON_SUB + 1.4, LID_TOP - ON_SUB - 1.4, P, 3, 0.6), { tone: "hi", lit: true }),
  );
  out.push(L(k.planOutline(k.insetPlan(LID, 4), LID_TOP, P, 3), { tone: "faint" }));
  return out.join("");
}

function pkg() {
  const top = PCB_H + FRAME_H;
  const back = { x: FRAME.x, y: FRAME.y, w: FRAME.w, d: BAR, r: 1.5 };
  const front = { x: FRAME.x, y: FRAME.y + FRAME.d - BAR, w: FRAME.w, d: BAR, r: 1.5 };
  const left = { x: FRAME.x, y: FRAME.y + BAR, w: BAR, d: FRAME.d - 2 * BAR, r: 0 };
  const right = {
    x: FRAME.x + FRAME.w - BAR,
    y: FRAME.y + BAR,
    w: BAR,
    d: FRAME.d - 2 * BAR,
    r: 0,
  };
  const bar = (plan) => S(k.slabOf(plan, PCB_H, FRAME_H, P, 2, 0.4), { tone: "mid" });
  const screws = (plan) =>
    [plan.x + 3, plan.x + plan.w - 3].map((x) => screwHead(x, plan.y + BAR / 2, top)).join("");

  const out = [bar(back), screws(back), bar(left)];
  out.push(S(k.slabOf(SUB, PCB_H, SUB_H, P, 3, 0.4), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(SUB, 2), ON_SUB, P, 3), { tone: "faint" }));

  const parts = [{ depth: depth(0, 0), svg: lid() }];
  for (const plan of HBM) parts.push({ depth: depth(...centre(plan)), svg: hbm(plan) });
  for (const y of [SUB.y + 3.5, SUB.y + SUB.d - 3.5]) {
    for (let x = -31.5; x <= 31.5; x += 9)
      parts.push({ depth: depth(x, y), svg: cap(x, y, ON_SUB) });
  }
  out.push(...sorted(parts));
  out.push(bar(right), bar(front), screws(front));
  return out.join("");
}

function vrm() {
  const items = [];
  for (const y of [-33, -15, 3, 21]) {
    const choke = { x: -81, y, w: 11, d: 11, r: 1 };
    items.push({
      depth: depth(-75.5, y + 5.5),
      svg:
        S(k.slabOf(choke, PCB_H, 7, P, 2, 0.4), { tone: "mid" }) +
        L(k.planOutline(k.insetPlan(choke, 2.4), PCB_H + 7, P, 2), { tone: "faint" }),
    });
    items.push({
      depth: depth(-62, y + 5.5),
      svg:
        S(k.cylinder(-62, y + 5.5, 3, PCB_H, 6, P, 20), { tone: "mid" }) +
        L(k.ring(-62, y + 5.5, 1.6, PCB_H + 6, P, 16), { tone: "lo" }),
    });
  }
  return items;
}

function connector() {
  const plan = { x: 64, y: -38, w: 18, d: 10, r: 1 };
  const z = PCB_H + 8;
  const holes = [];
  for (let i = 0; i < 4; i++) {
    for (const row of [0, 1])
      holes.push(
        k.planOutline(
          { x: plan.x + 2.2 + i * 3.6, y: plan.y + 2 + row * 3.4, w: 2.4, d: 2.4, r: 0.4 },
          z,
          P,
          1,
        ),
      );
  }
  return {
    depth: depth(73, -33),
    svg:
      S(k.slabOf(plan, PCB_H, 8, P, 2, 0.4), { tone: "mid" }) + L(holes.join(""), { tone: "lo" }),
  };
}

// The board controller and its flash chip, on the open right side of the board.
function controller() {
  const chip = (plan, h) =>
    S(k.slabOf(plan, PCB_H, h, P, 2, 0.3), { tone: "mid" }) +
    L(k.planOutline(k.insetPlan(plan, 1.6), PCB_H + h, P, 2), { tone: "faint" });
  const bmc = { x: 62, y: -12, w: 14, d: 14, r: 0.8 };
  const flash = { x: 64, y: 10, w: 10, d: 6, r: 0.5 };
  return [
    {
      depth: depth(...centre(bmc)),
      svg:
        chip(bmc, 1.8) +
        D([at([bmc.x + 2.6, bmc.y + 2.6, PCB_H + 1.8])], { size: 0.5, tone: "lo" }),
    },
    { depth: depth(...centre(flash)), svg: chip(flash, 1.4) },
    ...[-10, -4, 2].map((y) => ({ depth: depth(82, y), svg: cap(82, y, PCB_H) })),
  ];
}

function led() {
  const [x, y] = [68, 34];
  const z = PCB_H + 1.2;
  return {
    depth: depth(x, y),
    svg:
      S(k.slabOf({ x: x - 2.4, y: y - 1.6, w: 4.8, d: 3.2, r: 0.4 }, PCB_H, 1.2, P, 1), {
        tone: "mid",
        crease: "none",
      }) +
      S(k.slabOf({ x: x - 9, y: y - 1, w: 3.2, d: 2, r: 0.3 }, PCB_H, 1, P, 1), {
        tone: "mid",
        crease: "none",
      }) +
      `<g data-part="led">${D([at([x, y, z])], { size: 2.8, tone: "lo" })}${D([at([x, y, z])], { size: 1.4, tone: "hi" })}</g>`,
  };
}

const onBoard = [
  { depth: depth(0, 0), svg: pkg() },
  ...vrm(),
  connector(),
  ...controller(),
  led(),
  ...STANDOFFS.map(([x, y]) => ({ depth: depth(x, y), svg: screwHead(x, y, PCB_H) })),
];

const css = `
@media (prefers-reduced-motion: no-preference) {
  [data-part="led"] { animation: led-blink 6s ease-in-out infinite; }
  @keyframes led-blink { 0%, 30% { opacity: 1; } 42%, 88% { opacity: 0.12; } 100% { opacity: 1; } }
}`;

writeFigure("03-ai-chip", {
  label:
    "An AI accelerator module: a circuit board on standoffs carrying a chip package, with a lidded compute die between four stacks of memory, rows of capacitors, a stiffener frame, power parts and gold connector fingers, while a status light blinks.",
  body: [board(), ...sorted(onBoard)],
  css,
});
