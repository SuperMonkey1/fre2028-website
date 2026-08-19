import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Download, Plus, Mountain } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(true);

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
      setIsLoading(true);
      const data = await partnerService.getAllPartners();
      if (data && data.length > 0) {
        setPartners(data);
      } else {
        setPartners(DEFAULT_FOUNDING_PARTNERS as Partner[]);
      }
    } catch (err) {
      console.warn('Using default partners fallback in modal');
      setPartners(DEFAULT_FOUNDING_PARTNERS as Partner[]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Build the 25-slot array
  const displayPartners = partners.length > 0 ? partners : (DEFAULT_FOUNDING_PARTNERS as Partner[]);
  const filledCount = displayPartners.length;

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
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="partners-modal-title"
    >
      <div 
        className="bg-white text-black w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl border border-zinc-200 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-5 md:px-8 md:py-6 border-b border-zinc-200 bg-zinc-50/70 flex items-start justify-between relative flex-shrink-0">
          <div className="pr-10">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-widest bg-black text-white">
                <Mountain className="w-3 h-3" /> Road to LA 2028
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5" /> Founding 25 Partners
              </span>
              <span className="text-xs font-semibold text-zinc-500">
                {filledCount} van de 25 posities ingevuld
              </span>
            </div>

            <h2 id="partners-modal-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
              Dank aan onze Partners & Pioniers
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1 max-w-3xl leading-relaxed">
              Samen bouwen we aan de allereerste Leuvense deelname aan het paraklimmen op de Paralympische Spelen van Los Angeles 2028.
              Een exclusief netwerk van 25 toonaangevende bedrijven die geloven in veerkracht, innovatie en topsport.
            </p>
          </div>

          {/* Close Button (X) */}
          <button 
            onClick={onClose}
            aria-label="Sluit dialoog"
            className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-black hover:bg-zinc-200/60 transition-all rounded-none"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable 25 Partners Grid */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1 bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {slots.map(({ slotNumber, isFilled, partner }) => {
              if (isFilled && partner) {
                return (
                  <div
                    key={`slot-${slotNumber}`}
                    className="relative group bg-zinc-50 border-2 border-black p-4 flex flex-col justify-between items-center text-center transition-all duration-200 hover:shadow-lg min-h-[140px] sm:min-h-[160px]"
                  >
                    {/* Badge */}
                    <div className="w-full flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">
                      <span className="font-bold text-black">#{slotNumber}</span>
                      <span className="inline-flex items-center text-emerald-700 font-semibold gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Bevestigd
                      </span>
                    </div>

                    {/* Logo / Image */}
                    <div className="relative w-full h-14 sm:h-16 my-auto flex items-center justify-center p-1">
                      {partner.logoUrl ? (
                        <Image
                          src={partner.logoUrl}
                          alt={partner.name}
                          fill
                          unoptimized
                          className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                        />
                      ) : (
                        <span className="font-extrabold text-sm sm:text-base text-zinc-900 tracking-tight">
                          {partner.name}
                        </span>
                      )}
                    </div>

                    {/* Partner Name & Subtitle */}
                    <div className="w-full mt-2 pt-2 border-t border-zinc-200">
                      <p className="text-xs font-bold text-zinc-900 truncate">
                        {partner.name}
                      </p>
                      <p className="text-[10px] text-zinc-500 truncate">
                        {partner.category || 'Financiële Partner'}
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
                  className="group relative border-2 border-dashed border-zinc-200 hover:border-black bg-zinc-50/40 hover:bg-zinc-100/80 p-3 sm:p-4 flex flex-col justify-between items-center text-center cursor-pointer transition-all duration-200 min-h-[140px] sm:min-h-[160px]"
                >
                  <div className="w-full flex items-center justify-between text-[10px] font-mono text-zinc-400 group-hover:text-zinc-700 transition-colors">
                    <span>Positie #{slotNumber}</span>
                    <span className="opacity-0 group-hover:opacity-100 font-semibold text-black transition-opacity">
                      Claim →
                    </span>
                  </div>

                  <div className="my-auto flex flex-col items-center justify-center py-2">
                    <div className="w-8 h-8 rounded-full border border-zinc-300 group-hover:border-black group-hover:bg-black group-hover:text-white flex items-center justify-center text-zinc-400 transition-all mb-1.5">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-zinc-700 group-hover:text-black transition-colors">
                      Jouw Logo Hier
                    </span>
                  </div>

                  <div className="w-full text-[10px] font-semibold text-zinc-400 group-hover:text-black uppercase tracking-wider transition-colors">
                    Word Partner #{slotNumber}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 md:px-8 md:py-5 border-t border-zinc-200 bg-zinc-50 flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0">
          <div className="text-xs text-zinc-600 text-center sm:text-left">
            <span className="font-bold text-black">Wil je ook aansluiten als founding partner?</span>{' '}
            Ontvang het sponsordossier en word zichtbaar in onze weg naar LA 2028.
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 w-full sm:w-auto">
            <Link
              href="/become-partner"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-zinc-900 text-white hover:bg-black transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" /> Word Partner
            </Link>

            <Link
              href="/Frederik-Leys-Partnership-Dossier.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Dossier PDF
            </Link>

            <button
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-black text-white hover:bg-zinc-800 transition-colors shadow-sm"
            >
              Verder naar Homepage <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
