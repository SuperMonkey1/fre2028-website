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

// --- Partner Types ---
interface Partner {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  website?: string;
  socials?: {
    instagram?: string;
    linkedin?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
  };
}

// --- Partner Data ---
const PARTNERS: Partner[] = [
  {
    id: 'partner-1',
    name: 'Partner Name 1',
    category: 'Financiële Partner',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    image: '/images/partners/partner-1.jpg',
    website: 'https://example.com',
    socials: {
      instagram: 'https://instagram.com/partner1',
      linkedin: 'https://linkedin.com/company/partner1',
      facebook: 'https://facebook.com/partner1',
    }
  },
  {
    id: 'partner-2',
    name: 'Partner Name 2',
    category: 'Strategische Partner',
    description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    image: '/images/partners/partner-2.jpg',
    website: 'https://example.com',
    socials: {
      instagram: 'https://instagram.com/partner2',
      linkedin: 'https://linkedin.com/company/partner2',
    }
  },
  {
    id: 'partner-3',
    name: 'Partner Name 3',
    category: 'Performance Team',
    description: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
    image: '/images/partners/partner-3.jpg',
    website: 'https://example.com',
    socials: {
      instagram: 'https://instagram.com/partner3',
      youtube: 'https://youtube.com/partner3',
    }
  },
];

// --- Main Component ---
export default function PartnersPage() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
            <span>Fré Klimt</span>
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
            Team 2028
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

      {/* Partners Sections */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="space-y-32">
            {PARTNERS.map((partner, index) => (
              <div 
                key={partner.id} 
                className={cn(
                  "grid lg:grid-cols-2 gap-12 lg:gap-16 items-center",
                  index % 2 === 1 && "lg:grid-flow-dense"
                )}
              >
                {/* Image */}
                <div className={cn(
                  "relative aspect-[4/3] bg-zinc-100 overflow-hidden",
                  index % 2 === 1 && "lg:col-start-2"
                )}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-zinc-300">
                      <div className="text-sm font-bold uppercase tracking-widest mb-2">
                        Partner Logo/Image
                      </div>
                      <div className="text-xs text-zinc-400">
                        {partner.name}
                      </div>
                    </div>
                  </div>
                  {/* Uncomment when you have actual images */}
                  {/* <Image 
                    src={partner.image}
                    alt={partner.name}
                    fill
                    className="object-cover"
                  /> */}
                </div>

                {/* Content */}
                <div className={cn(
                  index % 2 === 1 && "lg:col-start-1 lg:row-start-1"
                )}>
                  <div className="inline-block px-3 py-1 mb-6 border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    {partner.category}
                  </div>
                  
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
                  {partner.socials && Object.keys(partner.socials).length > 0 && (
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
            ))}
          </div>
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
              onClick={() => router.push('/#contact')}
              variant="white"
            >
              Contacteer mij
            </Button>
            <a 
              href="/Frederik-Leys-Partnership-Dossier.pdf" 
              download
              className="inline-flex items-center justify-center text-sm font-semibold tracking-wide transition-all duration-200 h-12 px-8 border border-white bg-transparent hover:opacity-60"
            >
              Download sponsordossier
            </a>
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
            <span>Fré Klimt</span>
          </button>
          <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 mt-6">
            © 2025 Fré Leys
          </div>
        </div>
      </footer>
    </div>
  )
}
