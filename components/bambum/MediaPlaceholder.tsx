import { Camera, Play, Video } from 'lucide-react';

interface Props {
  kind: 'photo' | 'video';
  /** Short title of the shot, e.g. "Hero product shot". */
  label: string;
  /** What the final image or video should show. */
  brief: string;
  /** Tailwind aspect ratio class, e.g. "aspect-[4/3]". */
  aspect?: string;
  className?: string;
  /** Use on dark backgrounds. */
  dark?: boolean;
}

/** Stand-in for a photo or video that doesn't exist yet. Explains what should go here. */
export default function MediaPlaceholder({ kind, label, brief, aspect = 'aspect-[4/3]', className = '', dark = false }: Props) {
  const Icon = kind === 'video' ? Video : Camera;
  return (
    <div
      className={`relative flex ${aspect} flex-col justify-between overflow-hidden rounded-2xl border-2 border-dashed p-4 text-left ${
        dark ? 'border-amber-400/60 bg-slate-900' : 'border-amber-300 bg-amber-50/80'
      } ${className}`}
    >
      <div
        className={`flex w-fit items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
          dark ? 'border-amber-400/40 bg-slate-950/80 text-amber-300' : 'border-amber-200 bg-white/90 text-amber-900'
        }`}
      >
        <Icon className={`h-3.5 w-3.5 ${dark ? 'text-amber-400' : 'text-amber-600'}`} />
        <span>
          {kind === 'video' ? 'Video' : 'Photo'} placeholder • {label}
        </span>
      </div>

      {kind === 'video' && (
        <div className="flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-amber-500 bg-amber-400 shadow-md">
            <Play className="ml-0.5 h-6 w-6 fill-slate-950 text-slate-950" />
          </div>
        </div>
      )}

      <div className={`text-[11px] font-medium leading-snug ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
        <strong>What to show:</strong> {brief}
      </div>
    </div>
  );
}
