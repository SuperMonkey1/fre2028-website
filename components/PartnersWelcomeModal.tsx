import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ArrowRight, Sparkles, CheckCircle2, Download, Plus } from 'lucide-react';
import { Partner } from '../types/partner';
import { partnerService } from '../services/partnerService';

interface PartnersWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBecomePartner?: () => void;
}

const TOTAL_SLOTS = 25;

// Default founding partner in case Firestore hasn't returned yet or is empty
const DEFAULT_FOUNDING_PARTNERS: Partial<Partner>[] = [
  {
    id: 'cronos',
    name: 'De Cronos Groep',
    category: 'Financiële Partner',
    description: 'Pionier in technologie, innovatie en ondernemerschap.',
    logoUrl: '/images/partners/cronos.svg',
    website: 'https://cronos-groep.be',
  },
];

export const PartnersWelcomeModal: React.FC<PartnersWelcomeModalProps> = ({
  isOpen,
  onClose,
  onSelectBecomePartner,
}) => {
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadPartners();
    }
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const loadPartners = async () => {
    try {
      const data = await partnerService.getAllPartners();
      if (data && data.length > 0) {
        setPartners(data);
      } else {
        setPartners(DEFAULT_FOUNDING_PARTNERS as Partner[]);
      }
    } catch (err) {
      setPartners(DEFAULT_FOUNDING_PARTNERS as Partner[]);
    }
  };

  if (!isOpen) return null;

  // Build the 25-slot array
  const displayPartners = partners.length > 0 ? partners : (DEFAULT_FOUNDING_PARTNERS as Partner[]);

  const slots = Array.from({ length: TOTAL_SLOTS }).map((_, index) => {
    const partner = displayPartners[index];
    return {
      slotNumber: index + 1,
      isFilled: !!partner,
      partner: partner || null,
    };
  });

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="partners-modal-title"
    >
      <div 
        className="bg-white text-black w-full max-w-6xl max-h-[96vh] flex flex-col justify-between shadow-2xl border border-zinc-200 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Header */}
        <div className="px-5 py-3 sm:px-8 sm:py-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 id="partners-modal-title" className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900">
              Dank aan mijn Partners
            </h2>
          </div>

          {/* Close Button (X) */}
          <button 
            onClick={onClose}
            aria-label="Sluit dialoog"
            className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-200/70 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 25 Partners Grid (Fits neatly on screen without scrolling on desktop) */}
        <div className="p-3 sm:p-5 md:p-6 flex-1 overflow-y-auto md:overflow-hidden bg-white flex items-center">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-2.5 md:gap-3 w-full">
            {slots.map(({ slotNumber, isFilled, partner }) => {
              if (isFilled && partner) {
                return (
                  <div
                    key={`slot-${slotNumber}`}
                    className="relative group bg-white border-2 border-black p-2.5 sm:p-3 flex flex-col justify-between items-center text-center shadow-sm hover:shadow-md transition-all h-[95px] sm:h-[110px] md:h-[118px]"
                  >
                    {/* Top Slot Header */}
                    <div className="w-full flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                      <span className="font-bold text-black">#{slotNumber}</span>
                      <span className="inline-flex items-center text-emerald-700 font-bold gap-0.5 text-[9px]">
                        <CheckCircle2 className="w-3 h-3" /> Bevestigd
                      </span>
                    </div>

                    {/* Prominent Logo */}
                    <div className="relative w-full flex-1 my-1 flex items-center justify-center">
                      {partner.logoUrl ? (
                        <Image
                          src={partner.logoUrl}
                          alt={partner.name}
                          fill
                          unoptimized
                          className="object-contain p-1 transition-transform duration-200 group-hover:scale-105"
                        />
                      ) : (
                        <span className="font-black text-sm sm:text-base text-zinc-900 tracking-tight">
                          {partner.name}
                        </span>
                      )}
                    </div>

                    {/* Partner Name Label */}
                    <div className="w-full text-center">
                      <p className="text-[11px] font-bold text-zinc-900 truncate leading-none">
                        {partner.name}
                      </p>
                    </div>
                  </div>
                );
              }

              // Empty Slot
              return (
                <div
                  key={`slot-${slotNumber}`}
                  onClick={() => {
                    onClose();
                    if (onSelectBecomePartner) {
                      onSelectBecomePartner();
                    } else {
                      window.location.href = '/become-partner';
                    }
                  }}
                  className="group relative border-2 border-dashed border-zinc-300 hover:border-black bg-zinc-50/50 hover:bg-zinc-100 p-2 sm:p-2.5 flex flex-col justify-between items-center text-center cursor-pointer transition-all duration-200 h-[95px] sm:h-[110px] md:h-[118px]"
                >
                  <div className="w-full flex items-center justify-between text-[9px] font-mono text-zinc-400 group-hover:text-zinc-700 transition-colors">
                    <span>Positie #{slotNumber}</span>
                    <span className="opacity-0 group-hover:opacity-100 font-bold text-black transition-opacity">
                      Claim →
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center my-auto">
                    <div className="w-6 h-6 rounded-full border border-zinc-300 group-hover:border-black group-hover:bg-black group-hover:text-white flex items-center justify-center text-zinc-400 transition-all mb-1">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-bold text-zinc-600 group-hover:text-black transition-colors leading-tight">
                      Jouw Logo Hier
                    </span>
                  </div>

                  <div className="w-full text-[9px] font-semibold text-zinc-400 group-hover:text-black uppercase tracking-wider transition-colors">
                    Word Partner
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 sm:px-8 sm:py-3.5 border-t border-zinc-200 bg-zinc-50 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="text-xs text-zinc-600 text-center sm:text-left font-medium">
            Dank aan alle partners die mijn droom naar LA 2028 mogelijk maken!
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 w-full sm:w-auto">
            <Link
              href="/become-partner"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-zinc-900 text-white hover:bg-black transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" /> Word Partner
            </Link>

            <Link
              href="/Frederik-Leys-Partnership-Dossier.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Dossier PDF
            </Link>

            <button
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-wider bg-black text-white hover:bg-zinc-800 transition-colors shadow-sm"
            >
              Verder naar Homepage <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
