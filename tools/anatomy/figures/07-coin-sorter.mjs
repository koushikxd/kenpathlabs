import * as k from "../kit/iso-kit.mjs";
import * as G from "../kit/lathe.mjs";
import { HEIGHT, WIDTH, writeFigure } from "../common.mjs";

// A desktop coin sorter. Coins leave the hopper, slide down a sloped chute and drop through the
// one open slot, held there by the router gate, into one of four clear tubes (the experts).

const BASE = { x: -78, y: -16, w: 152, d: 32, r: 4 };
const BASE_H = 6;
const FOOT_H = 3;

const TUBES = [-50, -28, -6, 16];
const STACKS = [5, 7, 3, 6];
const ACTIVE = 1;
const GLASS_R = 8;
const COLLAR_R = 9.8;
const SOCKET_H = 3;
const GLASS_TOP = 30;
const COLLAR_TOP = 32.5;
const COIN_R = 6.6;
const COIN_H = 2.4;

// Chute: floor top rises along +x from the low end at XL to the pedestal face at XH.
const XL = -72;
const XH = 46;
const ZL = 36;
const SLOPE = 0.06;
const HALF = 10.5;
const WALL = 1.5;
const FLOOR_T = 2;
const BACK_H = 5;
const FRONT_H = 2;
const COS = 1 / Math.hypot(1, SLOPE);
const A = [COS, 0, SLOPE * COS];
const N = [-SLOPE * COS, 0, COS];
const CHUTE = G.frameOf([XL, 0, ZL], A, [0, 1, 0], N);
const floorZ = (x) => ZL + (x - XL) * SLOPE;
const sOf = (x) => (x - XL) / COS;
const LEN = sOf(XH);
const floorUnder = (x) => floorZ(x) - FLOOR_T / COS;

const GATE_X = TUBES[ACTIVE] - 9;
const PED = { x: XH, y: -12, w: 24, d: 24, r: 2 };
const PED_H = floorZ(XH) + 8;
const HOP = [PED.x + 12, 0];
const HOP_H = 12;
const RUN = { from: 34, rest: 4, to: TUBES[ACTIVE] };

const P = k.fitProjection(
  [
    ...k.boxCorners(BASE, -BASE_H - FOOT_H, 0),
    [XL, -HALF, floorZ(XL) + BACK_H],
    [HOP[0], -12.5, PED_H + HOP_H],
    [HOP[0], 12.5, PED_H + HOP_H],
  ],
  WIDTH,
  HEIGHT,
  { pad: 14, azimuth: 58 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const path = (points) => `M${points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")}Z`;
const byDepth = (points) =>
  [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const VOID = 'style="fill:var(--anatomy-halo)"';

// Screen-left silhouette normal and the viewer direction on the floor, for glass edges and glints.
const { sinA, cosA } = k.cameraOf(P);
const SIDE = [sinA, -cosA];
const VIEW = [cosA, sinA];

function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(BASE, -BASE_H - FOOT_H, BASE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(BASE, 12))) {
    out.push(S(k.cylinder(x, y, 5, -BASE_H - FOOT_H, 1.2, P, 24), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 3.8, -BASE_H - FOOT_H + 1.2, FOOT_H - 1.2, P, 24), { tone: "lo" }));
  }
  out.push(
    S(k.slabOf(BASE, -BASE_H, BASE_H, P, 6, 1.2), {
      tone: "lo",
      inner: L(k.sideSeam(BASE, -2.5, P, 6), { tone: "faint" }),
    }),
  );
  out.push(L(k.planOutline(k.insetPlan(BASE, 3.5), 0, P, 6), { tone: "faint" }));
  const screws = k.corners(BASE, 6.5);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 1.6, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(
    D(
      screws.map(([x, y]) => at([x, y, 0])),
      { size: 0.5 },
    ),
  );
  return out.join("");
}

function endPost() {
  const plan = { x: XL + 2, y: -5, w: 6, d: 10, r: 1.2 };
  return S(k.slabOf(plan, 0, floorUnder(plan.x + plan.w), P, 3, 0.4), { tone: "mid" });
}

function tube(x, index) {
  const out = [];
  const count = STACKS[index];
  out.push(S(k.cylinder(x, 0, COLLAR_R + 1, 0, 1, P, 40), { tone: "mid" }));
  out.push(S(k.cylinder(x, 0, COLLAR_R, 1, SOCKET_H - 1, P, 40), { tone: "mid" }));
  out.push(
    D(k.pointsAt([[x + COLLAR_R * VIEW[0] * 0.98, COLLAR_R * VIEW[1] * 0.98, 0.5]], P), {
      size: 0.45,
    }),
  );
  // Clear wall: a faint tint, the stack inside, then the glass edges and a glint on top.
  out.push(
    `<path d="${k.cylinder(x, 0, GLASS_R, SOCKET_H, GLASS_TOP - SOCKET_H, P, 40).fill}" style="fill:var(--anatomy-hi);opacity:.045"/>`,
  );
  out.push(L(k.ring(x, 0, GLASS_R, SOCKET_H, P, 40), { tone: "lo" }));
  for (let c = 0; c < count; c++) {
    const top = c === count - 1;
    const lit = top && index === ACTIVE;
    out.push(
      S(k.cylinder(x, 0, COIN_R, SOCKET_H + c * COIN_H, COIN_H, P, 40, top ? 0.5 : 0), {
        tone: lit ? "hi" : "mid",
        crease: lit ? "lo" : "faint",
        lit,
      }),
    );
  }
  const edge = (dir) =>
    k.segment(
      [x + dir[0] * GLASS_R, dir[1] * GLASS_R, SOCKET_H],
      [x + dir[0] * GLASS_R, dir[1] * GLASS_R, GLASS_TOP],
      P,
    );
  out.push(L(edge(SIDE) + edge([-SIDE[0], -SIDE[1]]), { tone: "mid" }));
  const glint = (mix) => {
    const g = [-SIDE[0] * (1 - mix) + VIEW[0] * mix, -SIDE[1] * (1 - mix) + VIEW[1] * mix];
    const n = Math.hypot(g[0], g[1]);
    return edge([g[0] / n, g[1] / n]);
  };
  out.push(L(glint(0.42), { tone: "lo" }));
  out.push(
    S(k.cylinder(x, 0, COLLAR_R, GLASS_TOP, COLLAR_TOP - GLASS_TOP, P, 40, 0.4), { tone: "mid" }),
  );
  // Neck up to the chute floor; it ends under the floor, which is drawn later.
  const neckTop = floorUnder(x + 7) + 0.2;
  out.push(
    S(k.cylinder(x, 0, 7, COLLAR_TOP, neckTop - COLLAR_TOP, P, 36), {
      tone: "mid",
      inner: L(k.sideArc(x, 0, 7, COLLAR_TOP + 1.2, P, 24), { tone: "faint" }),
    }),
  );
  return out.join("");
}

const prism = (polygon, s0, s1) => G.prismOf(CHUTE, polygon, s0, s1, P);
const onFloor = (x, y, lift = 0) => [x - SLOPE * COS * lift, y, floorZ(x) + COS * lift];

function chuteBack() {
  const out = [];
  out.push(
    S(
      prism(
        [
          [-HALF, -FLOOR_T],
          [HALF, -FLOOR_T],
          [HALF, 0],
          [-HALF, 0],
        ],
        0,
        LEN,
      ),
      { tone: "mid" },
    ),
  );
  // Shutters close the slots the router did not pick; the picked one is open.
  TUBES.forEach((x, index) => {
    if (index === ACTIVE) {
      const F = G.frameAlong(onFloor(x, 0, 0.02), N);
      const ring = G.circleOf(F, 0, 6.4, P, 48);
      out.push(`<path d="${ring}" ${VOID}/>`, L(ring, { tone: "lo" }));
      out.push(L(G.circleOf(F, 0, 7.6, P, 48), { tone: "faint" }));
      return;
    }
    const plate = k
      .ringOf({ x: x - 7, y: -7, w: 14, d: 14, r: 3 }, 6)
      .map(([px, py]) => at(onFloor(px, py, 0.02)));
    out.push(L(path(plate), { tone: "lo" }));
    out.push(
      D([at(onFloor(x + 4.6, 4.6, 0.02)), at(onFloor(x - 4.6, -4.6, 0.02))], { size: 0.45 }),
    );
  });
  out.push(
    S(
      prism(
        [
          [-HALF, 0],
          [-HALF + WALL, 0],
          [-HALF + WALL, BACK_H],
          [-HALF, BACK_H],
        ],
        0,
        LEN,
      ),
      { tone: "mid" },
    ),
  );
  out.push(
    S(
      prism(
        [
          [-HALF + WALL, 0],
          [HALF - WALL, 0],
          [HALF - WALL, FRONT_H + 1],
          [-HALF + WALL, FRONT_H + 1],
        ],
        0,
        WALL,
      ),
      { tone: "mid" },
    ),
  );
  // Router gate: a flap across the chute just past the open slot, swung from a knob on the back wall.
  const g = sOf(GATE_X);
  out.push(
    S(
      prism(
        [
          [-HALF + WALL, 0],
          [HALF - WALL, 0],
          [HALF - WALL, 4.4],
          [-HALF + WALL, 4.4],
        ],
        g - 0.7,
        g + 0.7,
      ),
      { tone: "mid", crease: "lo" },
    ),
  );
  const [kx, , kz] = onFloor(GATE_X, 0, BACK_H);
  const ky = -HALF + WALL / 2;
  out.push(S(k.cylinder(kx, ky, 2.6, kz, 1, P, 24), { tone: "mid" }));
  out.push(S(k.cylinder(kx, ky, 2.1, kz + 1, 2.6, P, 24), { tone: "mid" }));
  out.push(L(k.knurl(kx, ky, 2.1, kz + 1, kz + 3.6, 14, P), { tone: "lo" }));
  out.push(L(k.lineOnTop([kx, ky], [kx, ky + 2.1], kz + 3.6, P), { tone: "hi" }));
  out.push(D([at([kx, ky, kz + 3.6])], { size: 0.45, tone: "hi" }));
  return out.join("");
}

function coin() {
  const F = G.frameAlong(onFloor(RUN.rest, 0), N);
  return `<g data-part="coin">${S(G.disc(0, 2, 6.2, F, P), { tone: "hi", crease: "lo" })}</g>`;
}

function chuteFront() {
  const out = [];
  out.push(
    S(
      prism(
        [
          [HALF - WALL, 0],
          [HALF, 0],
          [HALF, FRONT_H],
          [HALF - WALL, FRONT_H],
        ],
        0,
        LEN,
      ),
      { tone: "mid" },
    ),
  );
  out.push(
    D(
      [TUBES[0] + 12, TUBES[2] + 12, 34].map((x) => at(onFloor(x, HALF - WALL / 2, FRONT_H))),
      { size: 0.45 },
    ),
  );
  return out.join("");
}

function hopper() {
  const out = [];
  out.push(
    S(k.slabOf(PED, 0, PED_H, P, 3, 0.6), {
      tone: "mid",
      inner: L(k.sideSeam(PED, 6, P, 3), { tone: "faint" }),
    }),
  );
  out.push(
    D(
      k.corners(PED, 3).map(([x, y]) => at([x, y, PED_H])),
      { size: 0.45 },
    ),
  );
  // Service panel and vent slots on the front face.
  const face = (x, z) => at([x, PED.y + PED.d, z]);
  const box = (x0, x1, z0, z1, r) =>
    path(k.ringOf({ x: x0, y: z0, w: x1 - x0, d: z1 - z0, r }, 4).map(([x, z]) => face(x, z)));
  out.push(L(box(PED.x + 4, PED.x + PED.w - 4, 12, PED_H - 8, 1.5), { tone: "lo" }));
  out.push(
    L(
      [0, 1, 2]
        .map((i) =>
          box(PED.x + 8, PED.x + PED.w - 8, PED_H - 15 - i * 3.4, PED_H - 13.6 - i * 3.4, 0.7),
        )
        .join(""),
      { tone: "faint" },
    ),
  );
  out.push(
    D(
      [
        [PED.x + 6, 14],
        [PED.x + PED.w - 6, 14],
        [PED.x + 6, PED_H - 10],
        [PED.x + PED.w - 6, PED_H - 10],
      ].map(([x, z]) => face(x, z)),
      { size: 0.45 },
    ),
  );
  const F = G.frameOf([HOP[0], HOP[1], PED_H], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const top = PED_H + HOP_H;
  out.push(
    S(
      G.solidOf(
        [
          [0, 6],
          [2.5, 6],
          [HOP_H - 2, 12],
          [HOP_H, 12],
        ],
        F,
        P,
      ),
      { tone: "mid" },
    ),
  );
  const mouth = k.ring(HOP[0], HOP[1], 10.6, top, P, 56);
  out.push(`<clipPath id="cs-hopper"><path d="${mouth}"/></clipPath>`);
  out.push(`<path d="${mouth}" ${VOID}/>`);
  const inside = [
    [-3, -3],
    [3.5, 1.5],
    [-1.5, 4.5],
  ].map(([dx, dy], index) =>
    S(k.cylinder(HOP[0] + dx, HOP[1] + dy, 5.4, top - 4 + index * 0.8, 1.2, P, 32), {
      tone: "hi",
      crease: "lo",
    }),
  );
  out.push(`<g clip-path="url(#cs-hopper)">${inside.join("")}</g>`);
  out.push(L(mouth, { tone: "lo" }));
  return out.join("");
}

const shift = (x) =>
  k.axisVector(P, [x - RUN.rest, 0, (x - RUN.rest) * SLOPE]).map((v) => v.toFixed(2));
const [sx, sy] = shift(RUN.from);
const [ex, ey] = shift(RUN.to);
const css = `
@media (prefers-reduced-motion: no-preference) {
  [data-part="coin"] { animation: cs-slide 6s infinite; }
  @keyframes cs-slide {
    0% { transform: translate(${sx}px, ${sy}px); opacity: 0; animation-timing-function: ease-out; }
    10% { transform: translate(${sx}px, ${sy}px); opacity: 1; animation-timing-function: cubic-bezier(.45, 0, .55, 1); }
    58% { transform: translate(${ex}px, ${ey}px); opacity: 1; animation-timing-function: ease-in; }
    68%, 100% { transform: translate(${ex}px, ${ey}px); opacity: 0; }
  }
}`;

writeFigure("07-coin-sorter", {
  label:
    "A desktop coin sorter: coins leave a hopper and slide down a sloped chute, and a router gate opens one slot so each coin drops into just one of four clear tubes.",
  body: [base(), endPost(), ...TUBES.map(tube), chuteBack(), coin(), chuteFront(), hopper()],
  css,
});
