import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, FlaskConical, MapPin, Trophy, Wrench } from 'lucide-react';
import BambumLayout, { PRODUCT_ICONS } from '@/components/bambum/BambumLayout';
import MediaPlaceholder from '@/components/bambum/MediaPlaceholder';
import { SHOP_PRODUCTS } from '@/lib/bambum/shop';

const SHARED = [
  {
    icon: FlaskConical,
    title: 'Engineered, not guessed',
    text: 'Both products are designed by Fré Leys (PhD. in Mechanical Engineering), who specialises in the mechanics of biological systems.',
  },
  {
    icon: Wrench,
    title: 'Built for your fingers and forearms',
    text: 'Smart athletic hardware that solves a real performance bottleneck, from open slopers to unequal finger lengths.',
  },
  {
    icon: MapPin,
    title: 'Made in Belgium',
    text: 'Locally produced and dispatched with Track & Trace. Free local pickup in Leuven for Sloper King™.',
  },
  {
    icon: Trophy,
    title: 'Backed by a World Cup athlete',
    text: 'Fré is a 2x IFSC Para Climbing World Cup gold medalist. Your purchase supports the road to the LA 2028 Paralympics.',
  },
];

const PRODUCT_MEDIA: Record<string, { label: string; brief: string }> = {
  'sloper-king': {
    label: 'Sloper King in action',
    brief: 'Action shot of Fré gripping the Sloper King on a cable machine or on the wall, chalk dust in the air, forearm and wrist clearly in frame.',
  },
  fingerprint: {
    label: 'FingerPrint edge in hand',
    brief: 'Close-up of a printed FingerPrint edge with a hand on it so the unequal finger lengths are visible. Optional: split-screen with the 3D render from the designer.',
  },
};

export default function BambumShopPage() {
  return (
    <BambumLayout active="shop">
      <Head>
        <title>BamBum | Climbing training tools by Fré Leys (PhD.)</title>
        <meta
          name="description"
          content="BamBum designs smart climbing training tools: Sloper King™, the biomechanical sloper and pump trainer, and FingerPrint, custom crimp edges shaped to your hand."
        />
        <meta property="og:title" content="BamBum | Climbing training tools by Fré Leys (PhD.)" />
        <meta property="og:description" content="Sloper King™ and FingerPrint: two training tools for climbers, engineered by a World Cup para climber." />
        <meta property="og:image" content="https://www.fre2028.la/images/sloperking-label.svg" />
        <meta property="og:url" content="https://www.fre2028.la/bambum" />
        <link rel="canonical" href="https://www.fre2028.la/bambum" />
      </Head>

      <main>
        {/* Hero */}
        <section className="border-b border-slate-200 bg-gradient-to-b from-white via-slate-50 to-slate-100 pb-16 pt-12 md:pb-24 md:pt-20">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 md:px-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span>BamBum Innovation • By Fré Leys</span>
              </div>
              <h1 className="text-4xl font-medium leading-[1.1] tracking-tight text-slate-800 sm:text-5xl lg:text-6xl">
                Training tools for the{' '}
                <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 bg-clip-text font-black text-transparent">
                  grip you actually use.
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-700 md:text-xl">
                BamBum designs, prototypes and produces smart athletic hardware and software that solve real performance bottlenecks.
                Two products, one goal: stronger, safer climbing.
              </p>
              <div className="mt-8">
                <a
                  href="#products"
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3.5 text-sm font-black tracking-wide text-slate-950 shadow-md transition-all hover:bg-amber-500"
                >
                  Shop the products <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
            <div className="lg:col-span-5">
              <MediaPlaceholder
                kind="photo"
                label="Hero product shot"
                aspect="aspect-[4/3]"
                brief="Both products together on a clean, chalky surface: the matte black Sloper King with its yellow crown and cord next to a printed FingerPrint edge. Warm light, shallow depth of field."
              />
            </div>
          </div>
        </section>

        {/* Products */}
        <section id="products" className="scroll-mt-20 border-b border-slate-200 bg-white py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
              {SHOP_PRODUCTS.map((p) => {
                const Icon = PRODUCT_ICONS[p.slug];
                return (
                  <Link
                    key={p.slug}
                    href={p.href}
                    className="group flex flex-col rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition-all hover:border-slate-400 hover:bg-white hover:shadow-xl md:p-8"
                  >
                    <MediaPlaceholder
                      kind="photo"
                      label={PRODUCT_MEDIA[p.slug].label}
                      brief={PRODUCT_MEDIA[p.slug].brief}
                      aspect="aspect-[16/10]"
                      className="mb-6"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-300 bg-amber-100 text-amber-700">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-black uppercase tracking-widest text-slate-600">
                        {p.eyebrow}
                      </span>
                    </div>

                    <h2 className="mt-6 text-3xl font-black tracking-tight text-slate-950">{p.name}</h2>
                    <p className="mt-1 text-lg font-bold text-slate-800">{p.headline}</p>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{p.blurb}</p>

                    <ul className="mt-5 space-y-2 text-sm text-slate-700">
                      {p.points.map((pt) => (
                        <li key={pt} className="flex items-center gap-2">
                          <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-5">
                      <span className="text-2xl font-black text-slate-950">{p.price}</span>
                      <span className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-xs font-black tracking-wide text-white shadow-md transition-colors group-hover:bg-amber-500 group-hover:text-slate-950">
                        {p.cta} <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Brand video */}
        <section className="border-b border-slate-800 bg-slate-950 py-16 text-white md:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 md:px-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-5">
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400">See it in action</span>
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Built in the workshop, tested on the wall.</h2>
              <p className="text-base leading-relaxed text-slate-300">
                From a 3D-printed prototype to a tool you can train with: watch how both products are designed, tested and used.
              </p>
            </div>
            <div className="lg:col-span-7">
              <MediaPlaceholder
                kind="video"
                dark
                label="BamBum brand video (60-90 s)"
                aspect="aspect-video"
                brief="Short intro film: 3D printer running, Fré testing a prototype, then both products in use on the cable machine and on a crimp. Ends on the BamBum logo and the two product names."
              />
            </div>
          </div>
        </section>

        {/* Meet the maker */}
        <section className="border-b border-slate-200 bg-white py-16 md:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 md:px-8 lg:grid-cols-12">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-xl lg:col-span-4">
              <Image
                src="/images/innsbruck_victory_4x5.jpg"
                alt="Fré Leys (PhD.), para climber, inventor and engineer"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-left">
                <div className="text-xl font-black text-white">Fré Leys (PhD.)</div>
                <div className="mt-0.5 text-xs font-medium text-slate-200">Belgian Para Climbing Team • Road to LA 2028</div>
              </div>
            </div>
            <div className="space-y-4 text-left lg:col-span-4">
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Meet the maker</span>
              <h2 className="text-3xl font-black tracking-tight text-slate-950">Inventor, engineer and World Cup athlete.</h2>
              <p className="text-base leading-relaxed text-slate-600">
                Fré designs every BamBum product personally, with a PhD in Mechanical Engineering from KU Leuven and years of competing at
                the highest level. Every product starts as a problem Fré ran into while training.
              </p>
            </div>
            <div className="lg:col-span-4">
              <MediaPlaceholder
                kind="photo"
                label="Workshop"
                aspect="aspect-[4/5]"
                brief="Behind the scenes: Fré at the workbench with a 3D printer in the background, a prototype in one hand and calipers or a cord in the other."
              />
            </div>
          </div>
        </section>

        {/* What both products share */}
        <section className="border-b border-slate-200 bg-slate-50 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="mx-auto mb-12 max-w-2xl space-y-3 text-center">
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">The BamBum way</span>
              <h2 className="text-3xl font-black tracking-tight text-slate-950">Two products, one approach</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {SHARED.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-950">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Gyms and contact */}
        <section className="border-b border-slate-200 bg-white py-16 md:py-24">
          <div className="mx-auto max-w-4xl space-y-4 px-4 text-center md:px-8">
            <h2 className="text-3xl font-black tracking-tight text-slate-950">Questions, gyms or coaches?</h2>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-600">
              Want a Sloper King™ test-stand in your climbing gym, or have a question about FingerPrint? Get in touch.
            </p>
            <a
              href="mailto:fre@fre2028.la?subject=BamBum"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-8 py-3.5 text-sm font-black tracking-wide text-white shadow-md transition-all hover:bg-amber-500 hover:text-slate-950"
            >
              fre@fre2028.la
            </a>
          </div>
        </section>
      </main>
    </BambumLayout>
  );
}
