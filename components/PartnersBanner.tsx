import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowRight, Plus } from 'lucide-react';
import { Partner } from '../types/partner';
import { partnerService } from '../services/partnerService';

const DEFAULT_FOUNDING_PARTNERS: Partial<Partner>[] = [
  {
    id: 'cronos',
    name: 'De Cronos Groep',
    category: 'Financiële Partner',
    logoUrl: '/images/partners/cronos.svg',
  },
];

const TOTAL_SLOTS = 6;

export const PartnersBanner: React.FC = () => {
  const router = useRouter();
  const [partners, setPartners] = useState<Partner[]>(DEFAULT_FOUNDING_PARTNERS as Partner[]);

  useEffect(() => {
    let cancelled = false;
    partnerService
      .getAllPartners()
      .then((data) => {
        const financial = (data || []).filter(
          (p) => !p.category || p.category.toLowerCase().includes('financi')
        );
        if (!cancelled && financial.length > 0) setPartners(financial);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const slots = Array.from({ length: TOTAL_SLOTS }).map((_, i) => partners[i] || null);

  return (
    <section id="partners-banner" className="bg-white border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-zinc-900">
              Dank aan mijn Partners
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 font-medium">
              Deze Leuvense innovatieve bedrijven steunen mij op weg naar LA
            </p>
          </div>
          <Link
            href="/become-partner"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-900 hover:text-red-600 transition-colors"
          >
            Word Partner <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {slots.map((partner, index) =>
            partner ? (
              <div
                key={partner.id || index}
                onClick={() => router.push(partner.id ? `/partners#${partner.id}` : '/partners')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    router.push(partner.id ? `/partners#${partner.id}` : '/partners');
                  }
                }}
                className="group bg-white border-2 border-zinc-200 hover:border-black p-4 flex flex-col items-center justify-between text-center hover:shadow-lg transition-all duration-200 cursor-pointer h-36 rounded-md"
              >
                <div className="relative w-full flex-1 min-h-[70px] flex items-center justify-center">
                  {partner.logoUrl ? (
                    <Image
                      src={partner.logoUrl}
                      alt={partner.name}
                      fill
                      unoptimized
                      className="object-contain transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <span className="font-black text-lg text-zinc-900 tracking-tight">{partner.name}</span>
                  )}
                </div>
                <p className="w-full text-xs font-bold text-zinc-900 truncate mt-2">{partner.name}</p>
              </div>
            ) : (
              <Link
                key={`empty-${index}`}
                href="/become-partner"
                className="group border-2 border-dashed border-zinc-200 hover:border-black bg-zinc-50/50 hover:bg-zinc-100/80 p-4 flex flex-col items-center justify-center text-center transition-all duration-200 h-36 rounded-md"
              >
                <div className="w-10 h-10 rounded-full border-2 border-zinc-300 group-hover:border-black group-hover:bg-black group-hover:text-white flex items-center justify-center text-zinc-400 transition-all mb-2">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-zinc-700 group-hover:text-black leading-tight">
                  Jouw Logo Hier
                </span>
                <span className="text-[11px] text-zinc-400 mt-0.5">Word Founding Partner</span>
              </Link>
            )
          )}
        </div>
      </div>
    </section>
  );
};
