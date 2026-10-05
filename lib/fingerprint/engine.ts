import { setOC, type Shape3D } from 'replicad';
import { buildFingerPrint, loadBase, type BaseParts } from './model';
import { computeLayout, type FingerParams, type Hand } from './layout';

// OpenCascade (~23 MB wasm) is pulled from the CDN at runtime so it stays out of the bundle and the repo.
const OCCT_VERSION = '1.1.0';
const OCCT_BASE = `https://cdn.jsdelivr.net/npm/replicad-opencascadejs@${OCCT_VERSION}/dist/`;
const BASE_STEP_URL = '/fingerprint/FingerPrint.step';

// Bypass the bundler: it must not try to resolve the CDN module.
const runtimeImport = new Function('url', 'return import(url)') as (url: string) => Promise<any>;

export interface BuildResult {
  shape: Shape3D;
  vertices: Float32Array;
  normals: Float32Array;
  triangles: Uint32Array;
  edges: Float32Array;
}

let basePromise: Promise<BaseParts> | null = null;

export function initEngine(): Promise<BaseParts> {
  if (!basePromise) {
    basePromise = (async () => {
      const { default: opencascade } = await runtimeImport(`${OCCT_BASE}replicad_single.js`);
      const OC = await opencascade({ locateFile: () => `${OCCT_BASE}replicad_single.wasm` });
      setOC(OC);
      const res = await fetch(BASE_STEP_URL);
      if (!res.ok) throw new Error(`Could not load base design (${res.status})`);
      return loadBase(await res.blob());
    })();
    basePromise.catch(() => {
      basePromise = null;
    });
  }
  return basePromise;
}

export async function buildDesign(params: FingerParams, hand: Hand): Promise<BuildResult> {
  const base = await initEngine();
  const layout = computeLayout(params);
  if (layout.errors.length) throw new Error(layout.errors.join(' '));
  const shape = buildFingerPrint(base, layout, hand);
  const m = shape.mesh({ tolerance: 0.03, angularTolerance: 0.15 });
  const e = shape.meshEdges({ tolerance: 0.03, angularTolerance: 0.15 });
  return {
    shape,
    vertices: Float32Array.from(m.vertices),
    normals: Float32Array.from(m.normals),
    triangles: Uint32Array.from(m.triangles),
    edges: Float32Array.from(e.lines),
  };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
