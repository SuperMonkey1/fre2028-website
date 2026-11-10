import { Layers, ShieldCheck, Target } from 'lucide-react';

// "Why Tailr Edge": the three main advantages, all coming from the edge being shaped to your fingers.
// Shared by the shop page, the photo designer, the early-access page and the friends page.
const ADVANTAGES = [
  {
    icon: ShieldCheck,
    title: 'Protects your A2 pulley',
    text: (
      <>
        Every edge sits exactly where that fingertip lands, so all four fingers stay stretched while you hang. None of them has
        to bend to reach a straight line, so your <strong className="text-slate-950">A2 pulley is not loaded</strong>: the
        pulley that gets injured most in climbing.
      </>
    ),
  },
  {
    icon: Layers,
    title: 'No torn skin',
    text: (
      <>
        All four fingers carry an equal share. On a straight edge some fingers take far more load than others, and their skin
        pays for it. I know it well: after a few weeks on a straight edge the skin on my pinky tears and I have to stop to let
        it heal. With Tailr Edge that doesn&apos;t happen.
      </>
    ),
  },
  {
    icon: Target,
    title: 'One exercise, every hold type',
    text: (
      <>
        Straight-edge strength doesn&apos;t carry over well to three-finger drags or two-finger pockets. Tailr Edge strength
        does: it works on a straight edge, and translates perfectly to <strong className="text-slate-950">three-finger and
        two-finger drags</strong>. One exercise trains several finger positions and hold types.
      </>
    ),
  },
];

export default function TailrEdgeAdvantages() {
  return (
    <section id="advantages" className="scroll-mt-20 pt-20">
      <div className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">Why Tailr Edge</div>
      <h2 className="max-w-3xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
        Stronger in less time.{' '}
        <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 bg-clip-text text-transparent">
          Without getting injured.
        </span>
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
        Your fingers are not the same length, but a straight edge treats them as if they are. Tailr Edge gives every finger its own
        edge at its own length. That changes three things.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {ADVANTAGES.map(({ icon: Icon, title, text }, i) => (
          <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-amber-400">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">0{i + 1}</span>
            </div>
            <h3 className="mt-4 text-lg font-black text-slate-950">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
