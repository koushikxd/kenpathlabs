// Retrieval as a library card catalog: a cabinet of six drawers on short legs, one drawer pulled
// out with its row of index cards, and one card (the retrieved result) raised out of the row.
import * as k from "../kit/iso-kit.mjs";
import * as G from "../kit/lathe.mjs";
import { HEIGHT, WIDTH, writeFigure } from "../common.mjs";

// The cabinet front faces +x. Columns run along y, rows up z.
const D = 30;
const RAIL = 3;
const CW = 34;
const RH = 20;
const W = CW * 3 + RAIL * 4;
const CASE = { x: 0, y: -W / 2, w: D, d: W, r: 1 };
const LEG_H = 8;
const CASE_Z = 12;
const CASE_TOP = CASE_Z + RAIL * 3 + RH * 2;
const TOP_H = 3;
const FRONT_T = 1.6;

const colY = (i) => CASE.y + RAIL + i * (CW + RAIL);
const rowZ = (j) => CASE_Z + RAIL + j * (RH + RAIL);

// The open drawer: middle column, top row, pulled out by OUT.
const OPEN = { i: 1, j: 1 };
const OUT = 28;
const BOX_D = 34;
const WALL_H = 10;
const CARD_H = 15;
const CARD_T = 0.7;
const CARDS = [2.6, 5.3, 8, 10.7, 13.4, 16.1, 18.8, 21.5];
const PICK = 3;
const TABS = [0, 6];
const RAISE = 9;

const oy = colY(OPEN.i);
const oz = rowZ(OPEN.j);
const FLOOR_TOP = oz + 1.4;

const P = k.fitProjection(
  [
    ...k.boxCorners(k.insetPlan(CASE, -1.5), 0, CASE_TOP + TOP_H),
    ...k.boxCorners({ x: D + OUT, y: oy, w: FRONT_T, d: CW, r: 0 }, oz, oz + RH),
    [D + CARDS[PICK], oy + 2, FLOOR_TOP + CARD_H + RAISE],
  ],
  WIDTH,
  HEIGHT,
  { pad: 14, azimuth: 35 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const face = (points) => k.pathOf(points.map(at), true);
const byDepth = (points) =>
  [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const alongX = (point) => G.frameAlong(point, [1, 0, 0]);

function stand() {
  const out = [`<path class="iso-halo" d="${k.haloOf(k.insetPlan(CASE, 2), 0, 2, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(CASE, 4.5))) {
    out.push(S(k.cylinder(x, y, 2.4, 0, 1.2, P, 20), { tone: "lo" }));
    out.push(
      S(k.slabOf({ x: x - 2.2, y: y - 2.2, w: 4.4, d: 4.4, r: 0.6 }, 1.2, LEG_H - 1.2, P, 2), {
        tone: "lo",
        crease: "none",
      }),
    );
  }
  out.push(S(k.slabOf(k.insetPlan(CASE, 0.6), LEG_H, CASE_Z - LEG_H, P, 3, 0.4), { tone: "lo" }));
  return out.join("");
}

function body() {
  const out = [S(k.slabOf(CASE, CASE_Z, CASE_TOP - CASE_Z, P, 3), { tone: "mid" })];
  // A fielded panel on the visible side.
  const y = CASE.y + CASE.d;
  out.push(
    L(
      face([
        [5, y, CASE_Z + 5],
        [D - 5, y, CASE_Z + 5],
        [D - 5, y, CASE_TOP - 5],
        [5, y, CASE_TOP - 5],
      ]),
      { tone: "faint" },
    ),
  );
  const top = k.insetPlan(CASE, -1.5);
  out.push(S(k.slabOf(top, CASE_TOP, TOP_H, P, 3, 0.8), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(top, 4), CASE_TOP + TOP_H, P, 3), { tone: "faint" }));
  out.push(
    k.dotsSvg(
      k.corners(top, 2.2).map(([px, py]) => at([px, py, CASE_TOP + TOP_H])),
      { size: 0.5 },
    ),
  );
  return out.join("");
}

// A drawer front at x, with its label holder and pull ring.
function front(x, y0, z0) {
  const yc = y0 + CW / 2;
  const fx = x + FRONT_T;
  const out = [
    S(k.slabOf({ x, y: y0 + 0.4, w: FRONT_T, d: CW - 0.8, r: 0.5 }, z0 + 0.4, RH - 0.8, P, 2), {
      tone: "mid",
    }),
  ];
  const lz = z0 + RH - 8.2;
  out.push(
    S(k.slabOf({ x: fx, y: yc - 7, w: 0.7, d: 14, r: 0.4 }, lz, 4.6, P, 2), {
      tone: "mid",
      crease: "none",
    }),
  );
  out.push(
    L(
      face([
        [fx + 0.7, yc - 5.6, lz + 1],
        [fx + 0.7, yc + 5.6, lz + 1],
        [fx + 0.7, yc + 5.6, lz + 3.6],
        [fx + 0.7, yc - 5.6, lz + 3.6],
      ]),
      { tone: "lo" },
    ),
  );
  out.push(
    `<path class="iso-line" data-tone="mid" style="stroke-width:.9" d="${k.sideRing([fx + 0.5, yc, lz - 4.6], 2.3, "x", P, 28)}"/>`,
  );
  out.push(S(G.disc(0, 1.2, 1.3, alongX([fx, yc, lz - 2.4]), P), { tone: "mid" }));
  return out.join("");
}

function fronts() {
  const slots = [];
  for (let j = 0; j < 2; j++)
    for (let i = 0; i < 3; i++) if (i !== OPEN.i || j !== OPEN.j) slots.push([i, j]);
  slots.sort(
    ([ia, ja], [ib, jb]) =>
      k.depthOf([D, colY(ia), rowZ(ja)], P) - k.depthOf([D, colY(ib), rowZ(jb)], P),
  );
  return slots.map(([i, j]) => front(D, colY(i), rowZ(j))).join("");
}

function card(x, { tab = false, lit = false, lift = 0 } = {}) {
  const plan = { x: D + x, y: oy + 2.2, w: CARD_T, d: CW - 4.4, r: 0.2 };
  const out = [
    S(k.slabOf(plan, FLOOR_TOP + lift, CARD_H, P, 2), {
      tone: tab ? "mid" : "hi",
      crease: "none",
      lit,
    }),
  ];
  if (tab)
    out.push(
      S(k.slabOf({ ...plan, y: plan.y + 6, d: 9 }, FLOOR_TOP + CARD_H, 2.4, P, 2), {
        tone: "mid",
        crease: "none",
      }),
    );
  if (lit) {
    // Typed lines on the raised card's face.
    const fx = plan.x + CARD_T;
    const top = FLOOR_TOP + lift + CARD_H;
    out.push(
      L(
        [
          [3, 20],
          [3, 14],
          [3, 24],
        ]
          .map(([dz, len], n) =>
            k.segment(
              [fx, plan.y + 3, top - 2.4 - n * dz],
              [fx, plan.y + 3 + len, top - 2.4 - n * dz],
              P,
            ),
          )
          .join(""),
        { tone: "mid", free: true },
      ),
    );
  }
  return out.join("");
}

function openDrawer() {
  const z0 = oz;
  const opening = face([
    [D, oy, z0],
    [D, oy + CW, z0],
    [D, oy + CW, z0 + RH],
    [D, oy, z0 + RH],
  ]);
  const box = { x: D + OUT - BOX_D, y: oy + 0.4, w: BOX_D, d: CW - 0.8, r: 0.4 };
  const outer = k.slabOf({ ...box, x: D, w: OUT }, z0 + 0.4, WALL_H, P, 2).fill;
  const wall = (y) => S(k.slabOf({ ...box, y, d: 1.2 }, z0 + 0.4, WALL_H, P, 2), { tone: "mid" });
  const out = [
    `<clipPath id="cc-opening"><path d="${opening}"/></clipPath>`,
    `<clipPath id="cc-box"><path d="${opening}"/><path d="${outer}"/></clipPath>`,
    `<path class="iso-shade" data-shade="0" d="${opening}"/>`,
    // The far jamb of the opening, seen through it.
    `<g clip-path="url(#cc-opening)"><path class="iso-shade" data-shade="2" d="${face([
      [D, oy, z0],
      [D, oy, z0 + RH],
      [D - 12, oy, z0 + RH],
      [D - 12, oy, z0],
    ])}"/></g>`,
    L(opening, { tone: "lo" }),
    `<g clip-path="url(#cc-box)">`,
    S(k.slabOf(box, z0 + 0.4, 1, P, 2), { tone: "mid", crease: "none" }),
    wall(box.y),
    `</g>`,
    // The follower block that keeps the cards standing.
    S(k.slabOf({ x: D + 0.4, y: oy + 6, w: 1.6, d: CW - 12, r: 0.4 }, FLOOR_TOP, 7, P, 2), {
      tone: "mid",
    }),
  ];
  CARDS.forEach((x, n) => {
    if (n === PICK) out.push(`<g data-part="result">${card(x, { lit: true, lift: RAISE })}</g>`);
    else out.push(card(x, { tab: TABS.includes(n) }));
  });
  out.push(`<g clip-path="url(#cc-box)">${wall(box.y + box.d - 1.2)}</g>`);
  out.push(front(D + OUT, oy, z0));
  return out.join("");
}

// At rest the card stands RAISE above the row; the loop lowers it into the row and lifts it back.
const [dx, dy] = k.axisVector(P, [0, 0, -RAISE]);

const css = `
@media (prefers-reduced-motion: no-preference) {
  [data-part="result"] { animation: cc-retrieve 6s cubic-bezier(.45,0,.55,1) infinite; }
  @keyframes cc-retrieve {
    0%, 30% { transform: translate(0px, 0px); }
    48%, 66% { transform: translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px); }
    84%, 100% { transform: translate(0px, 0px); }
  }
}`;

writeFigure("05-card-catalog", {
  label:
    "A library card catalog cabinet with one drawer pulled out, its index cards standing in a row and one card lifted above the rest.",
  body: [stand(), body(), fronts(), openDrawer()],
  css,
});
