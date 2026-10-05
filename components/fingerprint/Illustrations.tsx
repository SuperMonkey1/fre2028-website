import { FRONT_DEPTH, HOLE, type EdgeLayout, type Finger, type Hand } from '@/lib/fingerprint/layout';

export const FINGER_COLORS: Record<Finger, string> = {
  pinky: '#f472b6',
  ring: '#a78bfa',
  middle: '#38bdf8',
  index: '#34d399',
};

export const FINGER_NAMES: Record<Finger, string> = {
  pinky: 'Pinky',
  ring: 'Ring',
  middle: 'Middle',
  index: 'Index',
};

/* ---------- Hand (left hand, palm down, seen from above) ---------- */

const FINGERS = [
  { f: 'pinky' as Finger, x: 58, tip: 120 },
  { f: 'ring' as Finger, x: 96, tip: 66 },
  { f: 'middle' as Finger, x: 134, tip: 48 },
  { f: 'index' as Finger, x: 172, tip: 80 },
];

function HandShapes() {
  return (
    <>
      {FINGERS.map((d) => (
        <rect key={d.f} x={d.x} y={d.tip} width={34} height={230 - d.tip} rx={17} />
      ))}
      <rect x={54} y={185} width={160} height={135} rx={34} />
      <rect x={196} y={196} width={38} height={108} rx={19} transform="rotate(38 215 250)" />
    </>
  );
}

function Hand({ fill = '#fde68a', stroke = '#0f172a', dashed = false }: { fill?: string; stroke?: string; dashed?: boolean }) {
  return (
    <g>
      {/* stroke underneath + fill on top = one clean outline around the union */}
      <g fill="none" stroke={stroke} strokeWidth={5} strokeDasharray={dashed ? '6 6' : undefined} strokeLinejoin="round">
        <HandShapes />
      </g>
      <g fill={fill}>
        <HandShapes />
      </g>
    </g>
  );
}

function Paper({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 320 340" className="h-full w-full">
      <rect x={20} y={14} width={280} height={316} rx={6} fill="#ffffff" stroke="#cbd5e1" strokeWidth={2} transform="rotate(-2 160 170)" />
      {children}
    </svg>
  );
}

export function TraceHandIllustration() {
  return (
    <Paper>
      <Hand />
      {/* pencil tracing around the index finger */}
      <g transform="translate(222 52) rotate(35)">
        <rect x={0} y={0} width={14} height={95} rx={3} fill="#f59e0b" stroke="#0f172a" strokeWidth={2.5} />
        <rect x={0} y={78} width={14} height={17} fill="#fda4af" stroke="#0f172a" strokeWidth={2.5} />
        <path d="M0 0 L7 -20 L14 0 Z" fill="#fef3c7" stroke="#0f172a" strokeWidth={2.5} strokeLinejoin="round" />
        <path d="M4.5 -13 L7 -20 L9.5 -13 Z" fill="#0f172a" />
      </g>
      <path d="M206 82 C 214 66, 224 60, 226 58" fill="none" stroke="#0f172a" strokeWidth={2} strokeDasharray="4 4" />
    </Paper>
  );
}

export function MeasureIllustration() {
  const base = FINGERS[0].tip;
  return (
    <Paper>
      <Hand fill="#f8fafc" stroke="#94a3b8" dashed />
      <line x1={36} x2={290} y1={base} y2={base} stroke="#f472b6" strokeWidth={3} strokeDasharray="8 6" />
      <text x={40} y={base + 22} fontSize={15} fontWeight={800} fill="#db2777">
        pinky = 0
      </text>
      {FINGERS.slice(1).map((d) => {
        const x = d.x + 17;
        const c = FINGER_COLORS[d.f];
        return (
          <g key={d.f}>
            <line x1={x} x2={x} y1={base - 4} y2={d.tip + 4} stroke={c} strokeWidth={4} />
            <path d={`M${x - 7} ${d.tip + 12} L${x} ${d.tip + 1} L${x + 7} ${d.tip + 12} Z`} fill={c} />
            <path d={`M${x - 7} ${base - 12} L${x} ${base - 1} L${x + 7} ${base - 12} Z`} fill={c} />
            <line x1={d.x - 2} x2={d.x + 36} y1={d.tip} y2={d.tip} stroke={c} strokeWidth={2.5} />
            <rect x={x - 13} y={(base + d.tip) / 2 - 11} width={26} height={22} rx={11} fill={c} />
            <text x={x} y={(base + d.tip) / 2 + 5} fontSize={13} fontWeight={800} textAnchor="middle" fill="#0f172a">
              {d.f[0].toUpperCase()}
            </text>
          </g>
        );
      })}
      {/* ruler */}
      <g transform="translate(244 40)">
        <rect width={26} height={180} rx={3} fill="#fef3c7" stroke="#0f172a" strokeWidth={2} />
        {Array.from({ length: 18 }, (_, i) => (
          <line key={i} x1={0} x2={i % 5 === 0 ? 14 : 8} y1={10 + i * 9.5} y2={10 + i * 9.5} stroke="#0f172a" strokeWidth={1.5} />
        ))}
      </g>
    </Paper>
  );
}

export function WidthIllustration() {
  // Same traced hand as step 2, with a width arrow across the last joint of each finger.
  return (
    <Paper>
      <Hand fill="#f8fafc" stroke="#94a3b8" dashed />
      {FINGERS.map((d) => {
        const y = d.tip + 24;
        const x0 = d.x - 1;
        const x1 = d.x + 35;
        const c = FINGER_COLORS[d.f];
        return (
          <g key={d.f}>
            <line x1={x0} x2={x0} y1={y - 12} y2={y + 12} stroke={c} strokeWidth={2.5} />
            <line x1={x1} x2={x1} y1={y - 12} y2={y + 12} stroke={c} strokeWidth={2.5} />
            <line x1={x0 + 2} x2={x1 - 2} y1={y} y2={y} stroke={c} strokeWidth={3.5} />
            <path d={`M${x0 + 9} ${y - 6} L${x0 + 1} ${y} L${x0 + 9} ${y + 6} Z`} fill={c} />
            <path d={`M${x1 - 9} ${y - 6} L${x1 - 1} ${y} L${x1 - 9} ${y + 6} Z`} fill={c} />
            <rect x={d.x + 4} y={y + 16} width={26} height={20} rx={10} fill={c} />
            <text x={d.x + 17} y={y + 30} fontSize={12} fontWeight={800} textAnchor="middle" fill="#0f172a">
              {d.f[0].toUpperCase()}
            </text>
          </g>
        );
      })}
      <text x={134} y={262} fontSize={14} fontWeight={800} textAnchor="middle" fill="#b45309">
        width at the last joint
      </text>
    </Paper>
  );
}

export function EnterValuesIllustration() {
  const rows: [Finger, string, string][] = [
    ['pinky', '0', '18'],
    ['ring', '23.9', '20'],
    ['middle', '27.9', '21'],
    ['index', '12.0', '20'],
  ];
  return (
    <svg viewBox="0 0 320 340" className="h-full w-full">
      <rect x={20} y={30} width={280} height={280} rx={18} fill="#ffffff" stroke="#cbd5e1" strokeWidth={2} />
      <text x={40} y={68} fontSize={16} fontWeight={800} fill="#0f172a">
        Your fingers (mm)
      </text>
      <text x={207} y={92} fontSize={10} fontWeight={800} textAnchor="end" fill="#64748b">
        LENGTH
      </text>
      <text x={276} y={92} fontSize={10} fontWeight={800} textAnchor="end" fill="#64748b">
        WIDTH
      </text>
      {rows.map(([f, len, w], i) => (
        <g key={f} transform={`translate(40 ${102 + i * 50})`}>
          <circle cx={8} cy={18} r={8} fill={FINGER_COLORS[f]} />
          <text x={24} y={23} fontSize={14} fontWeight={700} fill="#334155">
            {FINGER_NAMES[f]}
          </text>
          <rect x={95} y={0} width={74} height={36} rx={9} fill={f === 'pinky' ? '#f1f5f9' : '#ffffff'} stroke={f === 'ring' ? '#f59e0b' : '#cbd5e1'} strokeWidth={f === 'ring' ? 3 : 2} />
          <text x={161} y={23} fontSize={14} fontWeight={700} textAnchor="end" fill={f === 'pinky' ? '#94a3b8' : '#0f172a'}>
            {len}
          </text>
          <rect x={178} y={0} width={60} height={36} rx={9} fill="#ffffff" stroke="#cbd5e1" strokeWidth={2} />
          <text x={230} y={23} fontSize={14} fontWeight={700} textAnchor="end" fill="#0f172a">
            {w}
          </text>
        </g>
      ))}
      {/* cursor */}
      <path d="M212 174 l0 30 l8 -7 l6 13 l6 -3 l-6 -13 l10 -1 z" fill="#0f172a" stroke="#ffffff" strokeWidth={2} />
    </svg>
  );
}


/* ---------- Edge map: the four edges seen from above, climber side at the bottom ---------- */

export function EdgeMap({ layout, hand, compact = false }: { layout: EdgeLayout; hand: Hand; compact?: boolean }) {
  const s = 3.2; // px per mm
  const pad = 14;
  const backY = 50; // back of the body (model y)
  const frontY = -FRONT_DEPTH;
  const BW = layout.width;
  const maxEdge = Math.max(...layout.columns.map((c) => layout.edgeY[c.finger]));
  const topY = Math.max(backY, maxEdge + 6);
  const W = BW * s + pad * 2;
  const H = (topY - frontY) * s + pad * 2 + 40;
  const sx = (x: number) => pad + (hand === 'left' ? BW - x : x) * s;
  const sy = (y: number) => pad + (topY - y) * s;
  const holeR = (HOLE.r + HOLE.flareR) * layout.holeScale;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label="Top view of the finger edges">
      <rect x={pad} y={sy(backY)} width={BW * s} height={(backY - frontY) * s} rx={6} fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 4" />
      {layout.columns.map((c) => {
        const E = layout.edgeY[c.finger];
        const w = (c.x1 - c.x0) * s;
        const xa = Math.min(sx(c.x0), sx(c.x1));
        const color = FINGER_COLORS[c.finger];
        return (
          <g key={c.finger}>
            <rect x={xa} y={sy(E)} width={w} height={(E - frontY) * s} fill={color} fillOpacity={0.35} stroke={color} strokeWidth={1.5} />
            <line x1={xa} x2={xa + w} y1={sy(E)} y2={sy(E)} stroke={color} strokeWidth={4} strokeLinecap="round" />
            <text x={xa + w / 2} y={sy(E) - 7} fontSize={compact ? 13 : 12} fontWeight={800} textAnchor="middle" fill="#0f172a">
              {(E + FRONT_DEPTH).toFixed(1)}
            </text>
            <text x={xa + w / 2} y={sy(frontY) + 18} fontSize={12} fontWeight={700} textAnchor="middle" fill="#475569">
              {FINGER_NAMES[c.finger]}
            </text>
            <text x={xa + w / 2} y={sy(frontY) + 33} fontSize={11} fontWeight={600} textAnchor="middle" fill="#94a3b8">
              {(c.x1 - c.x0).toFixed(0)} mm
            </text>
          </g>
        );
      })}
      {holeR > 0 && (
        <circle cx={sx(layout.holeX)} cy={sy(HOLE.y)} r={holeR * s} fill="#ffffff" stroke="#475569" strokeWidth={1.5} />
      )}
      <line x1={pad} x2={W - pad} y1={sy(frontY)} y2={sy(frontY)} stroke="#0f172a" strokeWidth={2} />
    </svg>
  );
}
