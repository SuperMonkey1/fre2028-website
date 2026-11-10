import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { AlertTriangle, Camera, CheckCircle2, Info, Loader2, RotateCcw, Upload } from 'lucide-react';
import type { Finger } from '@/lib/fingerprint/layout';
import { FINGER_COLORS, FINGER_NAMES } from '@/components/fingerprint/Illustrations';
// The hand detection model itself is only downloaded when a photo is analysed (inside analyzeHandPhoto)
import {
  CARD,
  HandPhotoError,
  analyzeHandPhoto,
  cameraDistance,
  fingersLeftToRight,
  measure,
  type FingerBox,
  type HandPhotoResult,
  type Measurements,
  type Pt,
  type Stage,
} from '@/lib/fingerprint/handPhoto';

const STAGES: [Stage, string][] = [
  ['loading', 'Loading the hand detection model'],
  ['hand', 'Checking for a hand'],
  ['card', 'Finding the card'],
  ['flatten', 'Flattening the photo'],
  ['fingers', 'Finding the finger creases and widths'],
];


const ROW_ORDER: Finger[] = ['pinky', 'ring', 'middle', 'index'];

export interface HandPhotoMeasureHandle {
  /** The photo with the boxes, lines and values drawn on it, as a JPEG (null before a photo was analysed). */
  snapshot: () => Promise<Blob | null>;
  /** The photo exactly as the customer uploaded it (null before a photo was analysed). */
  original: () => File | null;
}

const loadImg = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const HandPhotoMeasure = forwardRef<HandPhotoMeasureHandle, { onMeasured: (m: Measurements | null) => void }>(function HandPhotoMeasure(
  { onMeasured },
  ref,
) {
  const [stage, setStage] = useState<Stage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<HandPhotoResult | null>(null);
  const [measurements, setMeasurements] = useState<Measurements | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const originalRef = useRef<File | null>(null);
  // The crease moves up and down only; the box sides move left and right only
  const drag = useRef<{ finger: Finger; part: 'crease' | 'x0' | 'x1' } | null>(null);

  // Photo plus overlay in one image, stored with the order so the measurement can be checked later
  useImperativeHandle(
    ref,
    () => ({
      snapshot: async () => {
        if (!result || !svgRef.current) return null;
        const { width, height } = result;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(await loadImg(result.image), 0, 0, width, height);
        const svg = svgRef.current.cloneNode(true) as SVGSVGElement;
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.setAttribute('width', String(width));
        svg.setAttribute('height', String(height));
        svg.setAttribute('font-family', 'Arial, Helvetica, sans-serif');
        const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' }));
        try {
          ctx.drawImage(await loadImg(url), 0, 0, width, height);
        } finally {
          URL.revokeObjectURL(url);
        }
        return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
      },
      original: () => (result ? originalRef.current : null),
    }),
    [result],
  );

  // Recompute the values whenever a crease line is moved
  useEffect(() => {
    if (!result) return;
    const m = measure(result);
    setMeasurements(m);
    onMeasured(m);
    // onMeasured is a state setter wrapper from the page; it does not need to retrigger this
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  const analyze = async (file: File) => {
    setError(null);
    setResult(null);
    setMeasurements(null);
    onMeasured(null);
    try {
      const r = await analyzeHandPhoto(file, setStage);
      originalRef.current = file;
      setResult(r);
    } catch (e: any) {
      if (!(e instanceof HandPhotoError)) console.error(e);
      setError(e instanceof HandPhotoError ? e.message : 'Something went wrong while analysing the photo. Try another photo.');
    } finally {
      setStage(null);
    }
  };

  const onFile = (f: File | undefined | null) => {
    if (f) analyze(f);
    if (fileRef.current) fileRef.current.value = '';
  };

  const toSvg = (e: React.PointerEvent): Pt | null => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return null;
    const p = svg.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    const q = p.matrixTransform(ctm.inverse());
    return { x: q.x, y: q.y };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current || !result) return;
    const p = toSvg(e);
    if (!p) return;
    const { finger, part } = drag.current;
    const box = result.fingers[finger];
    if (part === 'crease') {
      const next: FingerBox = { ...box, crease: Math.min(Math.max(p.y, box.top), box.bottom) };
      setResult({ ...result, fingers: { ...result.fingers, [finger]: next } });
      return;
    }
    // Each box has its own sides (boxes may overlap); a box can't get narrower than a few px
    const min = unit * 2;
    const x = part === 'x0' ? Math.min(p.x, box.x1 - min) : Math.max(p.x, box.x0 + min);
    setResult({ ...result, fingers: { ...result.fingers, [finger]: { ...box, [part]: x } } });
  };

  const busy = stage !== null;
  const stageIndex = STAGES.findIndex(([s]) => s === stage);
  const unit = result ? Math.max(result.width, result.height) / 100 : 0;
  const order = result ? fingersLeftToRight(result.fingers) : [];
  const isOuter = (f: Finger, side: 'x0' | 'x1') => (side === 'x0' ? order[0] === f : order[order.length - 1] === f);
  const startDrag = (finger: Finger, part: 'crease' | 'x0' | 'x1') => (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { finger, part };
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />

      {!result && !busy && (
        <button
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            onFile(e.dataTransfer.files?.[0]);
          }}
          className={`flex flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-all ${
            dragOver ? 'border-slate-500 bg-slate-100' : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100'
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-700">
            <Camera className="h-6 w-6" />
          </div>
          <div className="text-sm font-extrabold text-slate-900">Upload a photo of your hand</div>
          <div className="text-xs leading-relaxed text-slate-500">
            Palm up, fingers straight and relaxed, gently touching, with a bank card flat on your palm. Taken from straight above.
          </div>
          <span className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-black text-white">
            <Upload className="h-3.5 w-3.5" /> Choose photo
          </span>
        </button>
      )}

      {busy && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          {STAGES.map(([s, label], i) => (
            <div key={s} className={`flex items-center gap-2 py-1 text-sm ${i <= stageIndex ? 'text-slate-800' : 'text-slate-400'}`}>
              {i < stageIndex ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : i === stageIndex ? (
                <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
              ) : (
                <span className="h-4 w-4 rounded-full border border-slate-300" />
              )}
              <span className={i === stageIndex ? 'font-bold' : ''}>{label}</span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {result && (
        <>
          {/* As wide as fits, but never taller than most of the screen */}
          <div
            className="relative mx-auto overflow-hidden rounded-xl bg-slate-100"
            style={{ width: `min(100%, calc(78vh * ${result.width / result.height}))` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={result.image} alt="Your flattened hand photo" className="block w-full select-none" draggable={false} />
            <svg
              ref={svgRef}
              viewBox={`0 0 ${result.width} ${result.height}`}
              className="absolute inset-0 h-full w-full touch-none"
              onPointerMove={onPointerMove}
              onPointerUp={() => (drag.current = null)}
              onPointerCancel={() => (drag.current = null)}
            >
              <polygon
                points={result.card.corners.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="#f59e0b"
                strokeWidth={unit / 3}
              />
              {ROW_ORDER.map((f) => {
                const b = result.fingers[f];
                const x0 = Math.min(b.x0, b.x1), x1 = Math.max(b.x0, b.x1);
                const mid = (x0 + x1) / 2;
                const color = FINGER_COLORS[f];
                return (
                  <g key={f}>
                    <rect
                      x={x0}
                      y={b.top}
                      width={x1 - x0}
                      height={b.bottom - b.top}
                      fill={color}
                      fillOpacity={0.08}
                      stroke={color}
                      strokeWidth={unit / 3}
                      pointerEvents="none"
                    />
                    {/* inner box sides: wide invisible lines to grab. The outer sides stay fixed. */}
                    {(['x0', 'x1'] as const).filter((side) => !isOuter(f, side)).map((side) => (
                      <line
                        key={side}
                        x1={b[side]}
                        x2={b[side]}
                        y1={b.top}
                        y2={b.bottom}
                        stroke="transparent"
                        strokeWidth={unit * 2}
                        className="cursor-ew-resize"
                        onPointerDown={startDrag(f, side)}
                      />
                    ))}
                    <line x1={x0} x2={x1} y1={b.crease} y2={b.crease} stroke={color} strokeWidth={unit / 2} pointerEvents="none" />
                    <line
                      x1={x0}
                      x2={x1}
                      y1={b.crease}
                      y2={b.crease}
                      stroke="transparent"
                      strokeWidth={unit * 2.5}
                      className="cursor-ns-resize"
                      onPointerDown={startDrag(f, 'crease')}
                    />
                    <g pointerEvents="none">
                      <rect
                        x={mid - unit * 1.6}
                        y={b.crease - unit}
                        width={unit * 3.2}
                        height={unit * 2}
                        rx={unit * 0.6}
                        fill="white"
                        stroke={color}
                        strokeWidth={unit / 3}
                      />
                      <path
                        d={`M${mid - unit * 0.6} ${b.crease - unit * 0.25} L${mid} ${b.crease - unit * 0.7} L${mid + unit * 0.6} ${b.crease - unit * 0.25} M${mid - unit * 0.6} ${b.crease + unit * 0.25} L${mid} ${b.crease + unit * 0.7} L${mid + unit * 0.6} ${b.crease + unit * 0.25}`}
                        fill="none"
                        stroke={color}
                        strokeWidth={unit / 4}
                      />
                    </g>
                  </g>
                );
              })}
              {measurements && <Dimensions result={result} m={measurements} unit={unit} />}
            </svg>
          </div>
          <p className="text-[11px] leading-snug text-slate-500">
            Each box marks a finger, its line the crease of the upper finger joint. Drag a line up or down to put it on the
            crease, or drag an inner box side to fit the finger at its widest point.
          </p>


          {result.warnings.map((w) => (
            <div key={w} className="flex gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-700">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <div>{w}</div>
            </div>
          ))}

          {measurements && (
            <div>
              <div className="mb-1 grid grid-cols-[1fr_72px_72px] items-end gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Finger</span>
                <span className="text-right text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Length</span>
                <span className="text-right text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Width</span>
              </div>
              {ROW_ORDER.map((f) => (
                <div key={f} className="grid grid-cols-[1fr_72px_72px] items-center gap-2 border-b border-slate-100 py-1 last:border-0">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <span className="h-3 w-3 rounded-full" style={{ background: FINGER_COLORS[f] }} />
                    {FINGER_NAMES[f]}
                  </div>
                  <div className="text-right text-sm font-bold text-slate-800">{f === 'pinky' ? '0' : measurements.offset[f]}</div>
                  <div className="text-right text-sm font-bold text-slate-800">{measurements.width[f]}</div>
                </div>
              ))}
              <p className="mt-1 text-xs text-slate-500">All values in mm, measured at the crease of the upper finger joint.</p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Camera about {Math.round(cameraDistance(result) / 10)} cm above the hand
                {result.camera.fromMetadata ? ` (lens ${result.camera.focal35} mm from the photo)` : ' (estimated, no lens data in the photo)'}
                ; corrected for the height of your fingers.
              </p>
            </div>
          )}

          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold text-slate-600 hover:border-slate-300 hover:text-slate-950"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Use another photo
          </button>
        </>
      )}

      {error && (
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-950 px-3 py-2 text-xs font-black text-white hover:bg-slate-800"
        >
          <Upload className="h-3.5 w-3.5" /> Try another photo
        </button>
      )}
    </div>
  );
});

export default HandPhotoMeasure;

/** Shows what is measured: the card as the ruler, the pinky crease as zero, each length up to its crease, each width. */
function Dimensions({ result, m, unit }: { result: HandPhotoResult; m: Measurements; unit: number }) {
  const boxes = ROW_ORDER.map((f) => result.fingers[f]);
  const left = Math.min(...boxes.map((b) => Math.min(b.x0, b.x1))) - unit * 3;
  const right = Math.max(...boxes.map((b) => Math.max(b.x0, b.x1))) + unit * 3;
  const zero = result.fingers.pinky.crease;
  const font = unit * 2;

  const label = (x: number, y: number, text: string, color: string, key: string) => (
    <g key={key}>
      <rect
        x={x - (text.length * font * 0.3 + unit * 0.6)}
        y={y - font * 0.7}
        width={text.length * font * 0.6 + unit * 1.2}
        height={font * 1.4}
        rx={unit * 0.4}
        fill="white"
        fillOpacity={0.9}
        stroke={color}
        strokeWidth={unit / 5}
      />
      <text x={x} y={y} fontSize={font} fontWeight={800} fill="#0f172a" textAnchor="middle" dominantBaseline="central">
        {text}
      </text>
    </g>
  );
  // Dimension line with end ticks
  const dim = (x1: number, y1: number, x2: number, y2: number, color: string, key: string) => {
    const vertical = x1 === x2;
    const t = unit * 0.9;
    return (
      <g key={key} stroke={color} strokeWidth={unit / 4}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} />
        {vertical ? (
          <>
            <line x1={x1 - t} x2={x1 + t} y1={y1} y2={y1} />
            <line x1={x2 - t} x2={x2 + t} y1={y2} y2={y2} />
          </>
        ) : (
          <>
            <line x1={x1} x2={x1} y1={y1 - t} y2={y1 + t} />
            <line x1={x2} x2={x2} y1={y2 - t} y2={y2 + t} />
          </>
        )}
      </g>
    );
  };

  return (
    <g pointerEvents="none">
      {/* the ruler: the card's long side */}
      {(() => {
        const [a, b, c] = result.card.corners;
        const [p, q] = Math.hypot(b.x - a.x, b.y - a.y) >= Math.hypot(c.x - b.x, c.y - b.y) ? [a, b] : [b, c];
        return label((p.x + q.x) / 2, (p.y + q.y) / 2, `Card = ${CARD.long} mm`, '#f59e0b', 'card-l');
      })()}

      {/* zero line through the pinky crease */}
      <line
        x1={left}
        x2={right}
        y1={zero}
        y2={zero}
        stroke="#0f172a"
        strokeWidth={unit / 5}
        strokeDasharray={`${unit} ${unit * 0.7}`}
      />
      {label(right + unit * 2.5, zero, '0', '#0f172a', 'zero')}

      {ROW_ORDER.map((f) => {
        const b = result.fingers[f];
        const x0 = Math.min(b.x0, b.x1), x1 = Math.max(b.x0, b.x1);
        const color = FINGER_COLORS[f];
        // length: from the zero line up to this finger's crease, on the left quarter of its box
        const lx = x0 + (x1 - x0) * 0.22;
        // width: drawn near the bottom of the box, away from the crease line and the length, so the two can't be confused
        const wy = b.bottom - unit * 2;
        return (
          <g key={f}>
            {f !== 'pinky' && dim(lx, zero, lx, b.crease, color, 'len')}
            {f !== 'pinky' && label(lx, (zero + b.crease) / 2, String(m.offset[f]), color, 'len-l')}
            {dim(x0, wy, x1, wy, color, 'w')}
            {label((x0 + x1) / 2, wy - unit * 2.2, String(m.width[f]), color, 'w-l')}
          </g>
        );
      })}
    </g>
  );
}
