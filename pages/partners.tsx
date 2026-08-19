import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { 
  Mountain, 
  ArrowLeft, 
  Instagram, 
  Linkedin, 
  Facebook,
  Twitter,
  Globe,
  ExternalLink,
  Youtube
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useRouter } from 'next/router';
import { Partner } from '../types/partner';
import { partnerService } from '../services/partnerService';

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---
const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'white' }>(({ className, variant = 'primary', ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center text-sm font-semibold tracking-wide transition-all duration-200 disabled:opacity-50",
        "h-12 px-8",
        variant === 'primary' && "bg-black text-white hover:bg-zinc-800",
        variant === 'outline' && "border border-current bg-transparent hover:opacity-60",
        variant === 'white' && "bg-white text-black hover:bg-zinc-200",
        className
      )}
      {...props}
    />
  )
})
Button.displayName = "Button"

interface PartnerCardProps {
  partner: Partner;
  index: number;
  showCategoryLabel?: boolean;
  highlightedPartnerId: string | null;
}

const PartnerCard: React.FC<PartnerCardProps> = ({
  partner,
  index,
  showCategoryLabel = false,
  highlightedPartnerId,
}) => {
  return (
    <div 
      key={partner.id} 
      id={`partner-${partner.id}`}
      className={cn(
        "grid lg:grid-cols-2 gap-12 lg:gap-16 items-center scroll-mt-24 rounded-lg transition-all duration-1000 p-8 -m-8",
        index % 2 === 1 && "lg:grid-flow-dense",
        highlightedPartnerId === partner.id && "bg-zinc-50 border border-zinc-200 shadow-lg"
      )}
    >
      {/* Image */}
      <div className={cn(
        "relative aspect-[4/3] bg-white overflow-hidden",
        index % 2 === 1 && "lg:col-start-2"
      )}>
        {(partner.funImageUrl || partner.imageUrl) ? (
          <img 
            src={partner.funImageUrl || partner.imageUrl || ''}
            alt={partner.name}
            className="w-full h-full object-contain p-8"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-zinc-300">
              <div className="text-sm font-bold uppercase tracking-widest mb-2">
                Partner Image
              </div>
              <div className="text-xs text-zinc-400">
                {partner.name}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={cn(
        index % 2 === 1 && "lg:col-start-1 lg:row-start-1"
      )}>
        {showCategoryLabel && partner.category && (
          <div className="inline-block px-3 py-1 mb-6 border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            {partner.category}
          </div>
        )}
        
        <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-6">
          {partner.name}
        </h2>
        
        <p className="text-lg text-zinc-600 leading-relaxed mb-8">
          {partner.description}
        </p>

        {/* Website Link */}
        {partner.website && (
          <a
            href={partner.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:opacity-60 transition-opacity mb-8"
          >
            <Globe className="w-4 h-4" />
            Bezoek website
            <ExternalLink className="w-3 h-3" />
          </a>
        )}

        {/* Social Media Links */}
        {partner.socials && Object.keys(partner.socials).filter(k => partner.socials?.[k as keyof typeof partner.socials]).length > 0 && (
          <div className="flex flex-wrap gap-3 mt-8">
            {partner.socials.instagram && (
              <a
                href={partner.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-12 h-12 border border-zinc-200 hover:border-black transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {partner.socials.linkedin && (
              <a
                href={partner.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-12 h-12 border border-zinc-200 hover:border-black transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            {partner.socials.facebook && (
              <a
                href={partner.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-12 h-12 border border-zinc-200 hover:border-black transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            )}
            {partner.socials.twitter && (
              <a
                href={partner.socials.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-12 h-12 border border-zinc-200 hover:border-black transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            )}
            {partner.socials.youtube && (
              <a
                href={partner.socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-12 h-12 border border-zinc-200 hover:border-black transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Component ---
export default function PartnersPage() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [highlightedPartnerId, setHighlightedPartnerId] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    loadPartners();
  }, []);

  useEffect(() => {
    // Scroll to specific partner if hash is present in URL
    if (router.isReady && router.asPath.includes('#') && partners.length > 0) {
      const partnerId = router.asPath.split('#')[1];
      const element = document.getElementById(`partner-${partnerId}`);
      if (element) {
        // Highlight the partner
        setHighlightedPartnerId(partnerId);
        
        // Add a small delay to ensure the page is fully rendered
        setTimeout(() => {
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
          });
        }, 300);

        // Remove highlight after animation
        setTimeout(() => {
          setHighlightedPartnerId(null);
        }, 3000);
      }
    }
  }, [router.isReady, router.asPath, partners]);

  const loadPartners = async () => {
    try {
      setIsLoading(true);
      const data = await partnerService.getAllPartners();
      setPartners(data);
    } catch (error) {
      console.error('Error loading partners:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const financialPartners = partners.filter(
    (p) => !p.category || p.category.toLowerCase().includes('financi')
  );
  const strategicPartners = partners.filter(
    (p) =>
      p.category &&
      !p.category.toLowerCase().includes('financi') &&
      !p.category.toLowerCase().includes('performance')
  );
  const performancePartners = partners.filter(
    (p) => p.category && p.category.toLowerCase().includes('performance')
  );

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <Head>
        <title>Partners - Fré Leys | Team 2028</title>
        <meta name="description" content="Ontmoet de partners die Fré Leys ondersteunen op zijn reis naar de Paralympische Spelen 2028 in Los Angeles." />
        <meta property="og:title" content="Partners - Fré Leys | Team 2028" />
        <meta property="og:description" content="Ontmoet de partners die Fré Leys ondersteunen op zijn reis naar de Paralympische Spelen 2028 in Los Angeles." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.fre2028.la/partners" />
        <link rel="canonical" href="https://www.fre2028.la/partners" />
      </Head>

      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b bg-white border-zinc-100",
        isScrolled ? "py-3" : "py-6"
      )}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-3 font-bold text-lg tracking-widest uppercase hover:opacity-60 transition-opacity"
          >
            <Mountain className="w-6 h-6" />
            <span>Fré2028.LA</span>
          </button>

          <Button 
            onClick={() => router.push('/')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Terug naar home
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-zinc-50">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <div className="inline-block px-4 py-2 mb-8 border border-zinc-200 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
            Team Fré2028.LA
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8">
            Mijn Partners
          </h1>
          <p className="text-xl text-zinc-600 leading-relaxed max-w-2xl mx-auto">
            Deze fantastische partners maken mijn reis naar de Paralympische Spelen mogelijk. 
            Samen bouwen we aan een droom en zetten we paraklimmen op de kaart.
          </p>
        </div>
      </section>

      {/* Partnership Strategy Section */}
      <section className="py-20 bg-white border-b border-zinc-100">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          {/* Strategy Overview */}
          <div className="bg-black text-white p-12 md:p-16">
            <div className="inline-block px-3 py-1 mb-4 border border-zinc-700 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              Partnerschap Strategie • Focus Leuven
            </div>
            <h3 className="text-3xl md:text-5xl font-bold tracking-tighter mb-8">
              De Leuven 25 Support Circle
            </h3>
            <div className="prose prose-lg prose-invert max-w-none">
              <p className="text-zinc-300 leading-relaxed mb-6">
                Om in 2028 voor goud te strijden en paraklimmen & de Paralympische Spelen in Leuven en Vlaanderen op de kaart te zetten, is een 100% professionele voorbereiding nodig. Trainen, rust, reizen en deze campagne runnen is een voltijdse job. Omdat overheidssubsidies voor paraklimmen uiterst beperkt zijn — zo moet ik in 2026 alleen al circa €3.500 aan wedstrijdkosten zelf dragen — breng ik 25 toonaangevende Leuvense partners samen in één krachtige steungroep.
              </p>
              
              <div className="space-y-8 mt-8">
                <div className="border-l-4 border-white pl-6">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-xl font-bold">De Leuven 25 Support Circle (€100 / maand)</h4>
                    <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-300">€1.200 / jaar</span>
                  </div>
                  <p className="text-zinc-300 mb-3">
                    Een exclusief erecollectief van 25 geëngageerde Leuvense bedrijven die met €100/maand (€1.200/jaar) het fundament leggen om voltijds als professioneel atleet te leven en trainen. Een bewuste focus op Leuven, waar we zichtbaarheid, innovatie en maatschappelijke impact maximaal bundelen.
                  </p>
                  <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-sm text-sm text-zinc-300 space-y-1.5">
                    <p className="font-bold text-white uppercase text-xs tracking-wider mb-1">Wat krijgen partners terug?</p>
                    <p>• <strong>Zichtbaarheid:</strong> Logo op de officiële campagne-poster, website en wedstrijd/campagne T-shirt.</p>
                    <p>• <strong>Exclusief Jaarevent:</strong> 1x per jaar exclusief partner-event met kliminitiatie, filmvertoning en keynote talk.</p>
                    <p>• <strong>Leuvense Aanwezigheid:</strong> Zichtbaarheid op Kerstmarkt 2027 en de grote Poster-campagne 2028 (huis-aan-huis in Leuven en elke school).</p>
                  </div>
                </div>

                <div className="border-l-4 border-white pl-6">
                  <h4 className="text-xl font-bold mb-2">Strategische Partners in Leuven</h4>
                  <p className="text-zinc-300">
                    Lokale experts en bureaus in media, PR, content creation en logistiek die pro-bono hun schouders zetten onder de 3-maanden mediapush en het verspreiden van het Paralympische verhaal en <a href="https://paraclimbing.be" target="_blank" rel="noopener noreferrer" className="text-white underline font-semibold">paraclimbing.be</a>.
                  </p>
                </div>

                <div className="border-l-4 border-white pl-6">
                  <h4 className="text-xl font-bold mb-2">Performance Team</h4>
                  <p className="text-zinc-300">
                    Het sportieve topkader dat van mij de beste paraklimmer ter wereld maakt: coaches, trainers, kinesitherapeut, sportpsycholoog en voedingsdeskundige.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Sections */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-4 border-zinc-300 border-t-black rounded-full animate-spin"></div>
              <p className="mt-4 text-zinc-600">Partners laden...</p>
            </div>
          ) : partners.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-zinc-600">Nog geen partners beschikbaar.</p>
            </div>
          ) : (
            <div className="space-y-32">
              {/* 1. Financiële Partners (Top - no category label on cards) */}
              {financialPartners.length > 0 && (
                <div>
                  <div className="border-b border-zinc-200 pb-6 mb-16 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-2">
                        Team 2028
                      </span>
                      <h2 className="text-3xl md:text-5xl font-bold tracking-tighter">
                        Partners
                      </h2>
                    </div>
                    <p className="text-zinc-500 text-sm md:text-base max-w-md">
                      De partners die de financiële basis leggen voor de Road to LA 2028.
                    </p>
                  </div>

                  <div className="space-y-32">
                    {financialPartners.map((partner, index) => (
                      <PartnerCard 
                        key={partner.id} 
                        partner={partner} 
                        index={index} 
                        showCategoryLabel={false}
                        highlightedPartnerId={highlightedPartnerId} 
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Strategische Partners (Middle) */}
              {strategicPartners.length > 0 && (
                <div>
                  <div className="border-b border-zinc-200 pb-6 mb-16 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-2">
                        Samenwerking & Media
                      </span>
                      <h2 className="text-3xl md:text-5xl font-bold tracking-tighter">
                        Strategische Partners
                      </h2>
                    </div>
                    <p className="text-zinc-500 text-sm md:text-base max-w-md">
                      Partners die hun communicatie, netwerk en expertise inzetten voor maximale zichtbaarheid en impact.
                    </p>
                  </div>

                  <div className="space-y-32">
                    {strategicPartners.map((partner, index) => (
                      <PartnerCard 
                        key={partner.id} 
                        partner={partner} 
                        index={index} 
                        showCategoryLabel={true}
                        highlightedPartnerId={highlightedPartnerId} 
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Performance Team (Bottom) */}
              {performancePartners.length > 0 && (
                <div>
                  <div className="border-b border-zinc-200 pb-6 mb-16 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-2">
                        Sportieve Omkadering
                      </span>
                      <h2 className="text-3xl md:text-5xl font-bold tracking-tighter">
                        Performance Team
                      </h2>
                    </div>
                    <p className="text-zinc-500 text-sm md:text-base max-w-md">
                      Het team van coaches, specialisten en experts dat Fré ondersteunt op weg naar goud.
                    </p>
                  </div>

                  <div className="space-y-32">
                    {performancePartners.map((partner, index) => (
                      <PartnerCard 
                        key={partner.id} 
                        partner={partner} 
                        index={index} 
                        showCategoryLabel={true}
                        highlightedPartnerId={highlightedPartnerId} 
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8">
            Word jij de volgende partner?
          </h2>
          <p className="text-xl text-zinc-400 mb-12 leading-relaxed">
            Wil je deel uitmaken van Team 2028 en mijn reis naar de Paralympische Spelen ondersteunen? 
            Neem contact met me op en ontdek de mogelijkheden.
          </p>
          <div className="flex flex-wrap gap-6 justify-center">
            <Button
              onClick={() => router.push('/become-partner')}
              variant="white"
            >
              Become a partner
            </Button>
            <Button
              onClick={() => router.push('/#contact')}
              variant="outline"
            >
              Contacteer mij
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 font-bold uppercase tracking-widest mx-auto hover:opacity-60 transition-opacity"
          >
            <Mountain className="w-6 h-6" />
            <span>Fré2028.LA</span>
          </button>
          <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 mt-6">
            © 2025 Fré Leys
          </div>
        </div>
      </footer>
    </div>
  )
}
