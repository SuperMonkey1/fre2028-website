import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Dumbbell, Fingerprint } from 'lucide-react';
import { SHOP_PRODUCTS, type ShopProductSlug } from '@/lib/bambum/shop';

export type BambumActive = 'shop' | ShopProductSlug;

export const PRODUCT_ICONS: Record<ShopProductSlug, typeof Dumbbell> = {
  'sloper-king': Dumbbell,
  fingerprint: Fingerprint,
};

interface LayoutProps {
  active: BambumActive;
  /** In-page anchors for the current product, shown in the header on wide screens. */
  links?: { label: string; href: string }[];
  /** Right-hand header action (e.g. an "Order now" button). */
  cta?: ReactNode;
  children: ReactNode;
}

const tabClass = (on: boolean) =>
  `whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-extrabold tracking-wide transition-colors ${
    on ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
  }`;

/** Shared shell for the BamBum shop: brand header with product switcher, and footer. */
export default function BambumLayout({ active, links, cta, children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-amber-400 selection:text-black">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 py-1 text-xs font-bold text-slate-500 transition-colors hover:text-slate-950"
              title="Back to Fré2028.LA"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden text-[11px] uppercase tracking-wider lg:inline">Fré2028.LA</span>
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <Link href="/bambum" className="rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-slate-950">
              BamBum
            </Link>
          </div>

          <nav aria-label="Products" className="flex items-center gap-1 overflow-x-auto">
            <Link href="/bambum" className={tabClass(active === 'shop')}>
              Shop
            </Link>
            {SHOP_PRODUCTS.map((p) => (
              <Link key={p.slug} href={p.href} className={tabClass(active === p.slug)}>
                {p.name}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-4">
            {links && links.length > 0 && (
              <div className="hidden items-center gap-5 text-xs font-semibold text-slate-600 2xl:flex">
                {links.map((l) => (
                  <a key={l.href} href={l.href} className="whitespace-nowrap transition-colors hover:text-amber-600">
                    {l.label}
                  </a>
                ))}
              </div>
            )}
            {cta}
          </div>
        </div>
      </header>

      {children}

      <footer className="border-t border-slate-200 bg-white py-12 text-xs text-slate-600">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row md:px-8">
          <div className="flex items-center gap-2">
            <span className="font-black tracking-wider text-slate-950">BAMBUM INNOVATION</span>
            <span>• By Fré Leys (PhD.)</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link href="/bambum/sloper-king" className="transition-colors hover:text-slate-950">Sloper King™</Link>
            <Link href="/bambum/fingerprint" className="transition-colors hover:text-slate-950">FingerPrint</Link>
            <Link href="/" className="transition-colors hover:text-slate-950">fre2028.la</Link>
            <Link href="/privacy" className="transition-colors hover:text-slate-950">Privacy</Link>
            <a href="mailto:fre@fre2028.la" className="transition-colors hover:text-slate-950">Contact</a>
          </div>
          <div className="text-slate-400">© {new Date().getFullYear()} Fré Leys. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

/** "Also from BamBum" teaser for the other product, placed at the bottom of a product page. */
export function AlsoFromBambum({ current }: { current: ShopProductSlug }) {
  const other = SHOP_PRODUCTS.find((p) => p.slug !== current);
  if (!other) return null;
  const Icon = PRODUCT_ICONS[other.slug];
  return (
    <section className="border-b border-slate-200 bg-slate-50 py-16 md:py-20">
      <div className="mx-auto max-w-4xl px-4 md:px-8">
        <div className="mb-4 text-center text-xs font-extrabold uppercase tracking-widest text-slate-500">Also from BamBum</div>
        <Link
          href={other.href}
          className="group flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-slate-400 hover:shadow-md sm:flex-row sm:items-center sm:justify-between md:p-8"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{other.eyebrow}</div>
              <h3 className="text-xl font-black text-slate-950">{other.name}</h3>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600">{other.headline}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="text-sm font-black text-slate-950">{other.price}</span>
            <span className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white transition-colors group-hover:bg-amber-500 group-hover:text-slate-950">
              {other.cta} <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
