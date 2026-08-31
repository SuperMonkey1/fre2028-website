import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { X, ArrowRight, Sparkles, Download, Plus } from 'lucide-react';
import { Partner } from '../types/partner';
import { partnerService } from '../services/partnerService';

interface PartnersWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBecomePartner?: () => void;
}

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
  const router = useRouter();
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
      // Filter only financial partners
      const financialPartners = (data || []).filter(
        (p) => !p.category || p.category.toLowerCase().includes('financi')
      );

      if (financialPartners.length > 0) {
        setPartners(financialPartners);
      } else {
        setPartners(DEFAULT_FOUNDING_PARTNERS as Partner[]);
      }
    } catch (err) {
      setPartners(DEFAULT_FOUNDING_PARTNERS as Partner[]);
    }
  };

  if (!isOpen) return null;

  // Show 6 cards for now
  const displayPartners = partners.length > 0 ? partners : (DEFAULT_FOUNDING_PARTNERS as Partner[]);
  const totalSlots = 6;

  const handlePartnerClick = (partner: Partial<Partner>) => {
    onClose();
    if (partner?.id) {
      router.push(`/partners#${partner.id}`);
    } else {
      router.push('/partners');
    }
  };

  const slots = Array.from({ length: totalSlots }).map((_, index) => {
    const partner = displayPartners[index];
    return {
      slotNumber: index + 1,
      isFilled: !!partner,
      partner: partner || null,
    };
  });

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="partners-modal-title"
    >
      <div 
        className="bg-white text-black w-full max-w-5xl max-h-[94vh] flex flex-col justify-between shadow-2xl border border-zinc-200 overflow-hidden relative rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Header */}
        <div className="px-5 py-4 sm:px-8 sm:py-5 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 id="partners-modal-title" className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900">
              Dank aan mijn Partners
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-0.5">
              De Leuven 25 Support Circle • Road to LA 2028
            </p>
          </div>

          {/* Close Button (X) */}
          <button 
            onClick={onClose}
            aria-label="Sluit dialoog"
            className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-200/70 transition-all rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 6 Partners Grid with larger cards */}
        <div className="p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto bg-white flex items-center">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 w-full">
            {slots.map(({ slotNumber, isFilled, partner }) => {
              if (isFilled && partner) {
                return (
                  <div
                    key={`slot-${slotNumber}`}
                    onClick={() => handlePartnerClick(partner)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handlePartnerClick(partner);
                      }
                    }}
                    className="relative group bg-white border-2 border-zinc-200 hover:border-black p-5 sm:p-6 md:p-7 flex flex-col justify-between items-center text-center shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer min-h-[160px] sm:min-h-[190px] md:min-h-[210px] rounded-md"
                  >
                    {/* Prominent Logo */}
                    <div className="relative w-full flex-1 min-h-[85px] sm:min-h-[105px] md:min-h-[120px] flex items-center justify-center p-2">
                      {partner.logoUrl ? (
                        <Image
                          src={partner.logoUrl}
                          alt={partner.name}
                          fill
                          unoptimized
                          className="object-contain transition-transform duration-200 group-hover:scale-105"
                        />
                      ) : (
                        <span className="font-black text-lg sm:text-xl md:text-2xl text-zinc-900 tracking-tight">
                          {partner.name}
                        </span>
                      )}
                    </div>

                    {/* Partner Name Label */}
                    <div className="w-full text-center mt-2">
                      <p className="text-xs sm:text-sm font-bold text-zinc-900 truncate leading-tight">
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
                  className="group relative border-2 border-dashed border-zinc-200 hover:border-black bg-zinc-50/50 hover:bg-zinc-100/80 p-5 sm:p-6 md:p-7 flex flex-col justify-between items-center text-center cursor-pointer transition-all duration-200 min-h-[160px] sm:min-h-[190px] md:min-h-[210px] rounded-md"
                >
                  <div className="flex flex-col items-center justify-center my-auto py-2">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-zinc-300 group-hover:border-black group-hover:bg-black group-hover:text-white flex items-center justify-center text-zinc-400 transition-all mb-2.5 shadow-xs">
                      <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-sm sm:text-base font-bold text-zinc-700 group-hover:text-black transition-colors leading-tight">
                      Jouw Logo Hier
                    </span>
                    <span className="text-[11px] sm:text-xs text-zinc-400 group-hover:text-zinc-600 mt-1">
                      Word Founding Partner
                    </span>
                  </div>

                  <div className="w-full text-center">
                    <span className="text-[10px] sm:text-xs font-semibold text-zinc-400 group-hover:text-black uppercase tracking-wider transition-colors inline-flex items-center gap-1">
                      Sluit je aan <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 sm:px-8 sm:py-4 border-t border-zinc-200 bg-zinc-50 flex flex-col md:flex-row items-center justify-between gap-4 flex-shrink-0">
          <div className="text-xs text-zinc-600 text-center md:text-left font-medium flex-1">
            Dank aan alle partners die mijn droom naar LA 2028 mogelijk maken!
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center justify-center md:justify-end gap-2.5 flex-shrink-0">
            <Link
              href="/become-partner"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-zinc-900 text-white hover:bg-black transition-colors rounded-sm whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" /> Word Partner
            </Link>

            <Link
              href="/Frederik-Leys-Partnership-Dossier.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100 transition-colors rounded-sm whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" /> Dossier PDF
            </Link>

            <button
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-wider bg-black text-white hover:bg-zinc-800 transition-colors shadow-sm rounded-sm whitespace-nowrap"
            >
              Verder naar Homepage <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
