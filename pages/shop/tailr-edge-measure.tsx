import { useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AlertTriangle, ArrowLeft, Camera, Check, Coins, Save } from 'lucide-react';
import BambumLayout from '@/components/bambum/BambumLayout';
import HandPhotoMeasure from '@/components/fingerprint/HandPhotoMeasure';
import { computeLayout } from '@/lib/fingerprint/layout';
import type { Measurements } from '@/lib/fingerprint/handPhoto';
import { PHOTO_DESIGNER_PAGE, encodeHand, saveHand } from '@/lib/fingerprint/savedHand';

/** Added to the middle and ring finger width in the design only (not on the photo), in mm. */
const MIDDLE_FINGERS_EXTRA_WIDTH = 2;
const round1 = (n: number) => Math.round(n * 10) / 10;

export default function TailrEdgeMeasurePage() {
  const router = useRouter();
  const [measured, setMeasured] = useState<Measurements | null>(null);
  const layout = useMemo(() => (measured ? computeLayout(measured) : null), [measured]);

  const save = () => {
    if (!measured) return;
    // From experience the middle and ring edge work better a bit wider than the fingers themselves
    const design = {
      ...measured,
      width: {
        ...measured.width,
        middle: round1(measured.width.middle + MIDDLE_FINGERS_EXTRA_WIDTH),
        ring: round1(measured.width.ring + MIDDLE_FINGERS_EXTRA_WIDTH),
      },
    };
    saveHand(design);
    const hand = encodeHand(design);
    router.push(`${PHOTO_DESIGNER_PAGE}?left=${hand}&right=${hand}#designer`);
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
          <ul className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
            <li className="flex gap-2">
              <Camera className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" /> Palm up, fingers straight and together
            </li>
            <li className="flex gap-2">
              <Coins className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" /> A coin flat next to your hand, not touching it
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" /> Photo from straight above, good light
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <HandPhotoMeasure onMeasured={setMeasured} />

          {measured && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              {layout && layout.errors.length > 0 && (
                <div className="mb-3 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    {layout.errors.join(' ')} Check the lines on the photo. If they are right, you can still save and see the
                    design.
                  </div>
                </div>
              )}
              <button
                onClick={save}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-3 text-sm font-black text-white shadow-md transition-all hover:bg-slate-800"
              >
                <Save className="h-4 w-4" /> Save and open the designer
              </button>
              <p className="mt-2 text-center text-xs text-slate-500">
                Don&apos;t worry: we always double-check your dimensions with human eyes to make sure they make sense.
              </p>
            </div>
          )}
        </section>
      </main>
    </BambumLayout>
  );
}
