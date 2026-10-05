// FingerPrint – parametric crimp edge.
//
// The base design (public/fingerprint/FingerPrint.step) is a 79 mm wide left-hand block with four finger
// edges. Each edge is a 5° tilted face with an R5 fillet at the bottom and an R3 fillet into the underside
// of the top plate (z = 20). Between x = 15 and x = 64 the body is a plain extrusion, so to change the
// finger widths we keep both ends of the original (eyelets and cord fillets), rebuild the middle at the new
// width, then rebuild each finger edge and re-drill the cord channel and the central load hole
// (shrunk around its centre when an edge comes too close).
import { importSTEP, makeBox, makeCylinder, Sketcher, type Shape3D } from 'replicad';
import { COS, END_ZONE, HOLE, TILT, type EdgeLayout, type Hand } from './layout';

const ORIGINAL_WIDTH = 79;
const FRONT_Y = -17;
const BACK_Y = 50;
const TOP_Z = 25;
const TAN = Math.tan(TILT);
const SIN = Math.sin(TILT);

const PLATE_Z = 20; // underside of the top plate
const BOTTOM_R = 5;
const TOP_R = 3;
const CUT_Y_START = -6; // front of the rebuilt region (inside the solid lip)

function edgeProfile(x0: number, x1: number, E: number): Shape3D {
  const cb = { y: E - BOTTOM_R * TAN - BOTTOM_R / COS, z: BOTTOM_R };
  const ct = { y: E - (PLATE_Z - TOP_R) * TAN + TOP_R / COS, z: PLATE_Z - TOP_R };

  const bisB = norm(COS, SIN - 1);
  const bisT = norm(-COS, 1 - SIN);

  return new Sketcher('YZ', x0)
    .movePointerTo([CUT_Y_START, 0])
    .lineTo([cb.y, 0])
    .threePointsArcTo(
      [cb.y + BOTTOM_R * COS, cb.z + BOTTOM_R * SIN],
      [cb.y + BOTTOM_R * bisB[0], cb.z + BOTTOM_R * bisB[1]],
    )
    .lineTo([ct.y - TOP_R * COS, ct.z - TOP_R * SIN])
    .threePointsArcTo([ct.y, PLATE_Z], [ct.y + TOP_R * bisT[0], ct.z + TOP_R * bisT[1]])
    .lineTo([CUT_Y_START, PLATE_Z])
    .close()
    .extrude(x1 - x0) as Shape3D;
}

function norm(a: number, b: number): [number, number] {
  const l = Math.hypot(a, b);
  return [a / l, b / l];
}

/** Central load hole (R9.5 with an R4 flare at the bottom), uniformly scaled by `k`. */
function loadHoleVolume(x: number, k: number): Shape3D {
  const r = HOLE.r * k;
  const f = HOLE.flareR * k;
  return new Sketcher('XZ')
    .movePointerTo([0, -1])
    .lineTo([r + f, -1])
    .lineTo([r + f, 0])
    .threePointsArcTo([r, f], [r + f - f * Math.SQRT1_2, f - f * Math.SQRT1_2])
    .lineTo([r, TOP_Z + 1])
    .lineTo([0, TOP_Z + 1])
    .close()
    .revolve([0, 0, 1], { origin: [0, 0, 0] })
    .translate([x, HOLE.y, 0]) as Shape3D;
}

/** Plain middle section: front lip (R5 front fillet) and top plate, without finger edges. */
function middleSection(x0: number, x1: number): Shape3D {
  const r = 5;
  return new Sketcher('YZ', x0)
    .movePointerTo([CUT_Y_START, 0])
    .lineTo([FRONT_Y + r, 0])
    .threePointsArcTo([FRONT_Y, r], [FRONT_Y + r - r * Math.SQRT1_2, r - r * Math.SQRT1_2])
    .lineTo([FRONT_Y, TOP_Z])
    .lineTo([BACK_Y, TOP_Z])
    .lineTo([BACK_Y, PLATE_Z])
    .lineTo([CUT_Y_START, PLATE_Z])
    .close()
    .extrude(x1 - x0) as Shape3D;
}

export interface BaseParts {
  left: Shape3D;
  right: Shape3D;
}

/** Splits the original design into its two ends (eyelets, cord fillets), which are kept as-is. */
export async function loadBase(stepBlob: Blob): Promise<BaseParts> {
  const original = (await importSTEP(stepBlob)) as Shape3D;
  return {
    left: original.intersect(makeBox([-50, -50, -10], [END_ZONE, 100, 50])),
    right: original.intersect(makeBox([ORIGINAL_WIDTH - END_ZONE, -50, -10], [150, 100, 50])),
  };
}

/** Deepest original edge inside the end pieces (the index edge at y = 12). */
const ORIGINAL_END_EDGE_Y = 12;

export function buildFingerPrint(base: BaseParts, layout: EdgeLayout, hand: Hand): Shape3D {
  const W = layout.width;
  let shape = base.left
    .clone()
    .fuse(middleSection(END_ZONE, W - END_ZONE))
    .fuse(base.right.clone().translate([W - ORIGINAL_WIDTH, 0, 0])) as Shape3D;

  for (const c of layout.columns) {
    const E = layout.edgeY[c.finger];
    const yEnd = Math.max(ORIGINAL_END_EDGE_Y, E) + 2.5;
    shape = shape.cut(makeBox([c.x0, CUT_Y_START, 0], [c.x1, yEnd, PLATE_Z]));
    shape = shape.fuse(edgeProfile(c.x0, c.x1, E));
  }
  shape = shape.cut(makeCylinder(4, W + 2, [-1, -9, 7], [1, 0, 0]));
  if (layout.holeScale > 0) shape = shape.cut(loadHoleVolume(layout.holeX, layout.holeScale));
  shape = shape.simplify();
  if (hand === 'right') shape = shape.mirror('YZ', [W / 2, 0, 0]);
  return shape;
}
