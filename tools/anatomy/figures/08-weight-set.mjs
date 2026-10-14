import * as k from "../kit/iso-kit.mjs";
import * as G from "../kit/lathe.mjs";
import { HEIGHT, WIDTH, writeFigure } from "../common.mjs";

// A calibration weight set: a fitted case with its lid standing open, five weights in pockets,
// small to large, and tweezers in a slot. The largest weight lifts out of its pocket and settles.

const CASE = { x: -96, y: -29, w: 192, d: 58, r: 4 };
const CH = 18; // case top
const FOOT_H = 4;
const LID_T = 6;
const LID_H = CASE.d; // the lid stands up as tall as the case is deep
const DEPTH = 4; // pocket depth
const LIFT = 8;

// Largest at the back-left end, by the lid; smaller toward the near end.
const RADII = [13.5, 10.5, 8, 6, 4.6];
const ROW_Y = -5;
const MARGIN = 12;
const GAP =
  (CASE.w - 2 * MARGIN - RADII.reduce((sum, r) => sum + 2 * (r + 1.4), 0)) / (RADII.length - 1);
const WEIGHTS = [];
{
  let x = CASE.x + MARGIN;
  for (const r of RADII) {
    const R = r + 1.4;
    WEIGHTS.push({ x: x + R, y: ROW_Y, r, R, h: 1.55 * r });
    x += 2 * R + GAP;
  }
}
const BIG = WEIGHTS[0];
const SLOT = { x: CASE.x + 24, y: 15, w: 144, d: 7, r: 3.5 };

const P = k.fitProjection(
  [
    ...k.boxCorners(CASE, -FOOT_H, CH),
    ...k.boxCorners({ ...CASE, y: CASE.y - LID_T, d: LID_T }, CH, CH + LID_H),
    [BIG.x, BIG.y, CH - DEPTH + BIG.h + 0.6 * BIG.r + LIFT],
  ],
  WIDTH,
  HEIGHT,
  { pad: 14, azimuth: 58 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const poly = (points) =>
  `M${points
    .map((p) =>
      at(p)
        .map((v) => v.toFixed(1))
        .join(" "),
    )
    .join("L")}Z`;
const circle = (x, y, r, z, steps = 48) =>
  k.circleRing(x, y, r, steps).map(([px, py]) => [px, py, z]);
const fill = (d, shade) => `<path class="iso-shade" data-shade="${shade}" d="${d}"/>`;
const dark = (d) => `<path d="${d}" style="fill:var(--anatomy-halo)"/>`;

// Everything above a pocket's rim line, plus its opening: what a part standing in the pocket may show.
function rimClip(id, ring) {
  const pts = ring.map(at);
  const left = pts.reduce((best, p, i) => (p[0] < pts[best][0] ? i : best), 0);
  const right = pts.reduce((best, p, i) => (p[0] > pts[best][0] ? i : best), 0);
  // The two arcs from the right extreme to the left one; keep the one hanging below.
  const walk = (from, to, step) => {
    const list = [];
    for (let i = from; ; i = (i + step + pts.length) % pts.length) {
      list.push(pts[i]);
      if (i === to) return list;
    }
  };
  const meanY = (list) => list.reduce((s, p) => s + p[1], 0) / list.length;
  const [a, b] = [walk(right, left, 1), walk(right, left, -1)];
  const below = meanY(a) > meanY(b) ? a : b;
  const d = `M${pts[left][0].toFixed(1)} -50L${pts[right][0].toFixed(1)} -50L${below.map((p) => p.map((v) => v.toFixed(1)).join(" ")).join("L")}Z`;
  return `<clipPath id="${id}"><path d="${d}"/></clipPath>`;
}

function lid() {
  const plan = { x: CASE.x, y: CASE.y - LID_T, w: CASE.w, d: LID_T, r: 2 };
  const out = [S(k.slabOf(plan, CH, LID_H, P, 3, 0.6), { tone: "mid" })];
  const face = CASE.y;
  const inset = 5;
  const x0 = CASE.x + inset,
    x1 = CASE.x + CASE.w - inset,
    z0 = CH + inset,
    z1 = CH + LID_H - inset;
  // The lining panel, its edge a closed outline on the lid's inner face.
  out.push(
    L(
      poly([
        [x0, face, z0],
        [x1, face, z0],
        [x1, face, z1],
        [x0, face, z1],
      ]),
      { tone: "lo" },
    ),
  );
  // Certificate card tucked into the lining, with printed rule lines.
  const cx0 = CASE.x + CASE.w - 58,
    cx1 = CASE.x + CASE.w - 18,
    cz0 = CH + 22,
    cz1 = CH + 52;
  out.push(
    fill(
      poly([
        [cx0, face, cz0],
        [cx1, face, cz0],
        [cx1, face, cz1],
        [cx0, face, cz1],
      ]),
      3,
    ),
  );
  out.push(
    L(
      poly([
        [cx0, face, cz0],
        [cx1, face, cz0],
        [cx1, face, cz1],
        [cx0, face, cz1],
      ]),
      { tone: "mid" },
    ),
  );
  out.push(
    L(
      poly([
        [cx0 + 3, face, cz1 - 9],
        [cx1 - 3, face, cz1 - 9],
        [cx1 - 3, face, cz1 - 3],
        [cx0 + 3, face, cz1 - 3],
      ]),
      { tone: "lo" },
    ),
  );
  for (const [z, len] of [
    [cz1 - 15, 30],
    [cz1 - 20, 24],
    [cz1 - 25, 27],
  ]) {
    out.push(
      L(k.segment([cx0 + 4, face, z], [cx0 + 4 + len, face, z], P), { tone: "lo", free: true }),
    );
  }
  // Retaining strap across the lining, riveted at both ends.
  const sx0 = CASE.x + 22,
    sx1 = CASE.x + 36;
  out.push(
    fill(
      poly([
        [sx0, face, z0],
        [sx1, face, z0],
        [sx1, face, z1],
        [sx0, face, z1],
      ]),
      2,
    ),
  );
  out.push(
    L(
      k.segment([sx0, face, z0], [sx0, face, z1], P) +
        k.segment([sx1, face, z0], [sx1, face, z1], P),
      { tone: "lo" },
    ),
  );
  out.push(
    D([at([(sx0 + sx1) / 2, face, z0 + 4]), at([(sx0 + sx1) / 2, face, z1 - 4])], { size: 0.5 }),
  );
  out.push(
    D(
      [
        [x0 - 2.5, z1 + 2.5],
        [x1 + 2.5, z1 + 2.5],
        [x1 + 2.5, z0 - 2.5],
      ].map(([x, z]) => at([x, face, z])),
      { size: 0.45 },
    ),
  );
  return out.join("");
}

function hinges() {
  const F = G.frameOf([0, CASE.y - 1.2, CH], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  return [CASE.x + 24, CASE.x + CASE.w - 40]
    .map(
      (x) =>
        S(G.disc(x, x + 16, 2, F, P), { tone: "mid" }) + L(G.arcOf(F, x + 8, 2, P), { tone: "lo" }),
    )
    .join("");
}

function body() {
  const out = [`<path class="iso-halo" d="${k.haloOf(CASE, -FOOT_H, CH, P)}"/>`];
  for (const [x, y] of k
    .corners(CASE, 7)
    .sort((a, b) => k.depthOf([...a, 0], P) - k.depthOf([...b, 0], P))) {
    out.push(S(k.cylinder(x, y, 4.5, -FOOT_H, FOOT_H, P, 20), { tone: "lo" }));
  }
  out.push(
    S(k.slabOf(CASE, 0, CH, P, 6, 1), {
      tone: "mid",
      inner: L(k.sideSeam(CASE, 4, P, 6), { tone: "faint" }),
    }),
  );
  out.push(L(k.planOutline(k.insetPlan(CASE, 5), CH, P, 6), { tone: "faint" }));
  out.push(
    D(
      k.corners(CASE, 2.6).map(([x, y]) => at([x, y, CH])),
      { size: 0.5 },
    ),
  );
  // Two draw latches on the front face, each a plate with a hook and a pivot.
  const front = CASE.y + CASE.d;
  for (const x of [CASE.x + 30, CASE.x + CASE.w - 38]) {
    out.push(S(k.slabOf({ x, y: front, w: 8, d: 1.2, r: 0.4 }, 6, 10, P, 2), { tone: "mid" }));
    out.push(
      S(k.slabOf({ x: x + 2, y: front + 1.2, w: 4, d: 1, r: 0.3 }, 12, 6, P, 2), {
        tone: "hi",
        crease: "lo",
      }),
    );
    out.push(D([at([x + 4, front + 1.2, 9])], { size: 0.55, tone: "hi" }));
  }
  // Maker's plate, centred on the front, with its border and two screws.
  const plate = { x: -16, y: front, w: 32, d: 0.8, r: 0.4 };
  const face = front + 0.8;
  out.push(S(k.slabOf(plate, 6, 8, P, 2), { tone: "mid", crease: "none" }));
  out.push(
    L(
      poly([
        [-13, face, 8],
        [13, face, 8],
        [13, face, 12],
        [-13, face, 12],
      ]),
      { tone: "lo" },
    ),
  );
  out.push(D([at([-14.6, face, 10]), at([14.6, face, 10])], { size: 0.45 }));
  return out.join("");
}

function pocket({ x, y, R }) {
  const rim = circle(x, y, R, CH);
  const floor = circle(x, y, R, CH - DEPTH);
  const id = `pk${Math.round(x)}`;
  return [
    `<clipPath id="${id}o"><path d="${poly(rim)}"/></clipPath>`,
    fill(poly(rim), 3),
    `<g clip-path="url(#${id}o)">${dark(poly(floor))}</g>`,
    L(poly(rim), { tone: "lo" }),
  ].join("");
}

function slot() {
  const rim = k.ringOf(SLOT, 6).map(([px, py]) => [px, py, CH]);
  const floor = k.ringOf(SLOT, 6).map(([px, py]) => [px, py, CH - 2]);
  const out = [`<clipPath id="slot"><path d="${poly(rim)}"/></clipPath>`, fill(poly(rim), 3)];
  out.push(`<g clip-path="url(#slot)">${dark(poly(floor))}`);
  // Tweezers: two tapered blades joined at the heel, lying on the slot floor.
  const z = CH - 2,
    x0 = SLOT.x + 5,
    x1 = SLOT.x + SLOT.w - 6,
    yc = SLOT.y + SLOT.d / 2;
  const blade = (side) => [
    [x0, yc + side * 0.2],
    [x1, yc + side * 1.6],
    [x1 + 1.2, yc + side * 2.1],
    [x1, yc + side * 2.6],
    [x0, yc + side * 1.9],
  ];
  for (const side of [-1, 1])
    out.push(S(k.extrude(blade(side), z, 1.2, P), { tone: "hi", crease: "lo" }));
  out.push(
    S(k.slabOf({ x: x0 - 3, y: yc - 2, w: 9, d: 4, r: 1.5 }, z, 1.4, P, 3), {
      tone: "hi",
      crease: "lo",
    }),
  );
  out.push(
    L(
      k.segment([x0 + 22, yc - 1.3, z + 1.2], [x0 + 22, yc - 2.3, z + 1.2], P) +
        k.segment([x0 + 26, yc - 1.4, z + 1.2], [x0 + 26, yc - 2.4, z + 1.2], P),
      { tone: "lo" },
    ),
  );
  out.push("</g>", L(poly(rim), { tone: "lo" }));
  return out.join("");
}

function weight({ x, y, r, h }, lit) {
  const F = G.frameOf([x, y, CH - DEPTH], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  // Body with a chamfered shoulder, a short neck, then a domed knob: three stacked turned parts.
  const c = 0.12 * r,
    neck = h + 0.16 * r;
  const style = { tone: "hi", crease: "lo", lit };
  const band = L(G.arcOf(F, h - c - 0.22 * r, r, P), { tone: lit ? "mid" : "faint" });
  return [
    S(
      G.solidOf(
        [
          [0, r - 0.5],
          [0.5, r],
          [h - c, r],
          [h, r - c],
        ],
        F,
        P,
      ),
      { ...style, inner: band },
    ),
    S(G.disc(h, neck, 0.28 * r, F, P), style),
    S(
      G.solidOf(
        [
          [neck, 0.46 * r],
          [neck + 0.08 * r, 0.56 * r, 1],
          [neck + 0.24 * r, 0.54 * r, 1],
          [neck + 0.38 * r, 0.36 * r, 1],
          [neck + 0.44 * r, 0.14 * r, 1],
        ],
        F,
        P,
      ),
      style,
    ),
  ].join("");
}

const parts = [lid(), hinges(), body(), ...WEIGHTS.map(pocket), slot()];
for (const w of [...WEIGHTS].sort(
  (a, b) => k.depthOf([a.x, a.y, 0], P) - k.depthOf([b.x, b.y, 0], P),
)) {
  const id = `seat${Math.round(w.x)}`;
  const lit = w === BIG;
  const art = weight(w, lit);
  parts.push(rimClip(id, circle(w.x, w.y, w.R, CH)));
  parts.push(`<g clip-path="url(#${id})">${lit ? `<g data-part="lift">${art}</g>` : art}</g>`);
}

const [dx, dy] = k.axisVector(P, [0, 0, LIFT]);
const css = `
@media (prefers-reduced-motion: no-preference) {
  [data-part="lift"] { animation: lift 6.5s cubic-bezier(.45,0,.55,1) infinite; }
  @keyframes lift {
    0%, 22% { transform: translate(0px, 0px); }
    42%, 58% { transform: translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px); }
    78%, 100% { transform: translate(0px, 0px); }
  }
}`;

writeFigure("08-weight-set", {
  label:
    "A calibration weight set: an open case with five weights standing in pockets from small to large and tweezers in a slot, the largest weight lifting out of its pocket and settling back.",
  body: parts,
  css,
});
