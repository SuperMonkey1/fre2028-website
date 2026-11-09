import { useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AlertTriangle, ArrowLeft, ArrowRight } from 'lucide-react';
import BambumLayout from '@/components/bambum/BambumLayout';
import HandPhotoMeasure from '@/components/fingerprint/HandPhotoMeasure';
import { computeLayout, type Finger } from '@/lib/fingerprint/layout';
import type { Measurements } from '@/lib/fingerprint/handPhoto';
import { GENDERS, PHOTO_DESIGNER_PAGE, encodeHand, saveGender, saveHand, saveHeight, type Gender } from '@/lib/fingerprint/savedHand';

/** Added to each measured finger width in the design only (not on the photo), in mm. */
const EXTRA_WIDTH: Record<Finger, number> = { index: 3, middle: 3, ring: 3, pinky: 3 };
const round1 = (n: number) => Math.round(n * 10) / 10;

/** Accepted body height range (cm). */
const MIN_HEIGHT_CM = 120;
const MAX_HEIGHT_CM = 230;

/** Photo instructions, in the order you set up the photo. */
const PHOTO_TIPS: [string, string][] = [
  ['Palm up, hand flat.', 'Hold your hand horizontal and roughly flat, palm facing up, fingers straight. It can be in the air.'],
  ['Wrist straight, not bent.', 'Keep your hand in line with your forearm, without bending the wrist up, down or to the side.'],
  [
    'Relax your fingers.',
    "Let them gently touch each other. Don't press or pinch them towards each other: that changes their shape and width.",
  ],
  [
    'Card flat on your palm.',
    'Any bank card, loyalty card or ID card works (they are all the same size). Show the side without the card number, and keep the whole card in view.',
  ],
  ['Plain, light background.', 'Whatever is behind your hand: a plain, light floor or table works best. Wood or a skin-coloured surface makes the finger edges hard to find.'],
  [
    'Phone straight above, 30–50 cm away.',
    'Hold your phone level, about 30–50 cm (12–20 inches) right above your hand, so the camera looks straight down.',
  ],
  [
    'Fill the frame.',
    'Get close enough that your fingers and the card take up most of the photo, with the fingertips still in view. The bigger your hand in the photo, the more exact the creases.',
  ],
  ['Normal camera, no zoom.', 'Use the standard camera (no wide-angle, no zoom) and good, even light without strong shadows.'],
];

/** Measure page body (/shop/tailr-edge-measure). */
export default function MeasurePage() {
  const router = useRouter();
  const [measured, setMeasured] = useState<Measurements | null>(null);
  const layout = useMemo(() => (measured ? computeLayout(measured) : null), [measured]);
  // Body height, entered in cm (default) or feet and inches
  const [unit, setUnit] = useState<'cm' | 'ftin'>('cm');
  const [cm, setCm] = useState('');
  const [ft, setFt] = useState('');
  const [inch, setInch] = useState('');
  const heightCm = unit === 'cm' ? parseFloat(cm) : (parseFloat(ft) || 0) * 30.48 + (parseFloat(inch) || 0) * 2.54;
  const heightValid = Number.isFinite(heightCm) && heightCm >= MIN_HEIGHT_CM && heightCm <= MAX_HEIGHT_CM;
  const switchUnit = (next: 'cm' | 'ftin') => {
    // carry a valid height over to the other unit
    if (next === unit) return;
    if (heightValid) {
      const totalIn = Math.round(heightCm / 2.54);
      if (next === 'cm') setCm(String(Math.round(heightCm)));
      else {
        setFt(String(Math.floor(totalIn / 12)));
        setInch(String(totalIn % 12));
      }
    }
    setUnit(next);
  };
  const [gender, setGender] = useState<Gender | null>(null);

  const save = () => {
    if (!measured || !heightValid || !gender) return;
    // From experience the edges work better a bit wider than the fingers themselves
    const w = measured.width;
    const design = {
      ...measured,
      width: {
        index: round1(w.index + EXTRA_WIDTH.index),
        middle: round1(w.middle + EXTRA_WIDTH.middle),
        ring: round1(w.ring + EXTRA_WIDTH.ring),
        pinky: round1(w.pinky + EXTRA_WIDTH.pinky),
      },
    };
    saveHand(design);
    saveHeight(Math.round(heightCm));
    saveGender(gender);
    const hand = encodeHand(design);
    router.push(`${PHOTO_DESIGNER_PAGE}?left=${hand}&right=${hand}&height=${Math.round(heightCm)}&gender=${gender}#designer`);
  };

  return (
    <BambumLayout active="tailr-edge" links={[]}>
      <Head>
        <title>Tailr Edge | Measure your hand from a photo</title>
        <meta name="robots" content="noindex" />
      </Head>

      <main className="mx-auto max-w-3xl px-4 pb-24">
        <section className="py-6 md:py-8">
          <Link
            href={PHOTO_DESIGNER_PAGE}
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-950"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to the designer
          </Link>
          <div className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">Step 1 of 2</div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Measure your hand from a photo</h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Upload a photo, check the boxes and the crease lines, adjust them where needed and save. Your values then go to the
            designer.
          </p>
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-base font-black text-slate-950">How to take the photo</h2>
            <div className="mt-3 grid gap-5 sm:grid-cols-[200px_1fr]">
              <figure className="mx-auto w-48 sm:w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/tailr-edge/measure-example.jpg?v=2"
                  alt="Example: a hand palm up with a bank card on the palm, fingers relaxed and gently touching"
                  className="w-full rounded-xl border border-slate-200 bg-white"
                />
                <figcaption className="mt-1.5 text-center text-[11px] text-slate-500">Example: card on the palm, fingers relaxed</figcaption>
              </figure>
              <ol className="grid content-start gap-y-2.5 text-sm leading-relaxed text-slate-700">
                {PHOTO_TIPS.map(([title, text], i) => (
                  <li key={title} className="flex gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-950 text-[11px] font-black text-white">
                      {i + 1}
                    </span>
                    <span>
                      <strong className="text-slate-950">{title}</strong> {text}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <HandPhotoMeasure onMeasured={setMeasured} />

          {measured && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              {layout && layout.errors.length > 0 && (
                <div className="mb-3 flex gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    {layout.errors.join(' ')} Check the lines on the photo. If they are right, you can still save and see the
                    design.
                  </div>
                </div>
              )}
              <div className="mb-4">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <label htmlFor="height" className="text-sm font-extrabold text-slate-950">
                    Your height
                  </label>
                  <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-0.5 text-xs font-bold">
                    {(['cm', 'ftin'] as const).map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => switchUnit(u)}
                        className={`rounded-md px-2.5 py-1 transition-all ${unit === u ? 'bg-white text-slate-950 shadow' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        {u === 'cm' ? 'cm' : 'ft / in'}
                      </button>
                    ))}
                  </div>
                </div>
                {unit === 'cm' ? (
                  <div className="flex items-center gap-2">
                    <input
                      id="height"
                      type="number"
                      inputMode="numeric"
                      placeholder="e.g. 178"
                      value={cm}
                      onChange={(e) => setCm(e.target.value)}
                      className="w-32 rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold focus:border-slate-500 focus:outline-none"
                    />
                    <span className="text-sm text-slate-500">cm</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      id="height"
                      type="number"
                      inputMode="numeric"
                      placeholder="5"
                      value={ft}
                      onChange={(e) => setFt(e.target.value)}
                      className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold focus:border-slate-500 focus:outline-none"
                    />
                    <span className="text-sm text-slate-500">ft</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="10"
                      aria-label="Height, inches"
                      value={inch}
                      onChange={(e) => setInch(e.target.value)}
                      className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold focus:border-slate-500 focus:outline-none"
                    />
                    <span className="text-sm text-slate-500">in</span>
                  </div>
                )}
                {!heightValid && (
                  <p className="mt-1 text-xs font-semibold text-red-700">
                    {cm || ft || inch
                      ? `Enter a height between ${MIN_HEIGHT_CM} and ${MAX_HEIGHT_CM} cm (about 4 ft 0 in to 7 ft 6 in).`
                      : 'Enter your height.'}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <div className="mb-1.5 text-sm font-extrabold text-slate-950">Gender</div>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Gender">
                  {GENDERS.map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={gender === id}
                      onClick={() => setGender(id)}
                      className={`rounded-lg border px-3.5 py-1.5 text-sm font-bold transition-all ${
                        gender === id ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {!gender && <p className="mt-1 text-xs font-semibold text-red-700">Choose your gender.</p>}
              </div>
              <button
                onClick={save}
                disabled={!heightValid || !gender}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-3 text-sm font-black text-white shadow-md transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Create your personalised design <ArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-2 text-center text-xs text-slate-500">
                Don&apos;t worry: every measurement is checked by hand for outliers and compared with other measurements, to make
                sure it is realistic, before your Tailr Edge is made.
              </p>
            </div>
          )}
        </section>
      </main>
    </BambumLayout>
  );
}
