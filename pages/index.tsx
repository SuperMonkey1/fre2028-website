import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { 
  Mountain, 
  Award, 
  Mail, 
  Instagram, 
  Linkedin, 
  Menu, 
  X, 
  MapPin, 
  TrendingUp, 
  ArrowRight,
  Grid3X3,
  Heart,
  ArrowUpRight,
  Users,
  Youtube,
  Trophy,
  Medal,
  Calendar
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { newsletterService } from '../services/newsletterService';
import { contactService } from '../services/contactService';
import { partnerService } from '../services/partnerService';
import { Partner } from '../types/partner';
import { useRouter } from 'next/router';
import resultsData from '../public/data/results.json';

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

// --- Data ---

// Portfolio images
const portfolioImages = [
  {
    src: "/images/web/me_winning_innsbruck_web.webp",
    alt: "Fré climbing in Innsbruck 2025"
  },
  {
    src: "/images/web/me_innsbruck_banner_web.webp",
    alt: "Fré climbing in Innsbruck 2025"
  },
  {
    src: "/images/web/20240625_innsbruck_Drapella_web.webp",
    alt: "Innsbruck competition 2024"
  },
  {
    src: "/images/web/me_on_rocks_web.webp",
    alt: "Innsbruck climbing 2024"
  },
  {
    src: "/images/web/paraclimbing_be_web.webp",
    alt: "Fré climbing in Innsbruck 2025"
  },
  {
    src: "/images/web/20240625_innsbruck_Nicholas_web.webp",
    alt: "Innsbruck event 2024"
  },
  {
    src: "/images/web/20250925_seoul_na_web.webp",
    alt: "Seoul competition 2025"
  },
  {
    src: "/images/web/20251025_Laval_JANVIRT_web.webp",
    alt: "Laval competition 2025"
  },
  {
    src: "/images/web/20230613_JANVIRT_web.webp",
    alt: "Competition 2023"
  },
  {
    src: "/images/web/me_podium_gold_xsloba_web.webp",
    alt: "IFSC Para World Cup SLC 2023"
  }
];

// Parse CSV function
const parseCSV = (csvText: string) => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header.trim()] = values[index]?.trim() || '';
    });
    return obj;
  });
};

// Convert CSV milestone to timeline format
const convertMilestoneToTimeline = (milestone: any) => {
  // Extract year from date
  const dateParts = milestone.Date.split('/');
  const year = dateParts.length === 3 ? dateParts[2] : milestone.Date;
  
  // Determine if this should be highlighted (LA Paralympics)
  const isHighlight = milestone.Title.toUpperCase().includes('LOS ANGELES') || 
                     milestone.Title.toUpperCase().includes('PARALYMPICS');
  
  return {
    year,
    title: milestone.Title,
    desc: milestone.Description,
    milestone: milestone.type === 'Milestone',
    highlight: isHighlight
  };
};

// --- Main Page Component ---

export default function ParaclimberSite() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [videoEnded, setVideoEnded] = useState(true); // Temporarily set to true to show image immediately
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [isPortfolioSliderOpen, setIsPortfolioSliderOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [portfolioSectionVisible, setPortfolioSectionVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const portfolioRef = useRef<HTMLDivElement>(null);

  // Partners state
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoadingPartners, setIsLoadingPartners] = useState(true);

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    inquiryType: 'Sponsoring',
    message: ''
  });
  const [isContactSubmitting, setIsContactSubmitting] = useState(false);
  const [contactSubmitMessage, setContactSubmitMessage] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load partners from Firestore
  useEffect(() => {
    loadPartners();
  }, []);

  // Load milestones from CSV
  useEffect(() => {
    loadMilestones();
  }, []);

  // Intersection observer for portfolio section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setPortfolioSectionVisible(true);
            observer.disconnect(); // Stop observing once loaded
          }
        });
      },
      { rootMargin: '200px' } // Start loading 200px before section is visible
    );

    if (portfolioRef.current) {
      observer.observe(portfolioRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const loadMilestones = async () => {
    try {
      const response = await fetch('/data/FRE2028 content - Milestones.csv');
      const csvText = await response.text();
      const milestones = parseCSV(csvText);
      const events = milestones.map(convertMilestoneToTimeline);
      setTimelineEvents(events);
    } catch (error) {
      console.error('Error loading milestones:', error);
      // Fallback to empty array if CSV fails to load
      setTimelineEvents([]);
    }
  };

  const loadPartners = async () => {
    try {
      setIsLoadingPartners(true);
      const data = await partnerService.getAllPartners();
      setPartners(data);
    } catch (error) {
      console.error('Error loading partners:', error);
    } finally {
      setIsLoadingPartners(false);
    }
  };

  // Attempt to autoplay video on load
  useEffect(() => {
    if (videoRef.current) {
      // We use a timeout to ensure the element is fully mounted and ready
      setTimeout(() => {
          videoRef.current?.play().catch(e => {
              console.log("Autoplay prevented by browser, showing static image immediately.");
              setVideoEnded(true); 
          });
      }, 100);
    }
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await newsletterService.subscribe(email);
      setSubmitMessage('Bedankt voor je inschrijving!');
      setEmail('');
      setTimeout(() => {
        setIsNewsletterOpen(false);
        setSubmitMessage('');
      }, 2000);
    } catch (error: any) {
      setSubmitMessage(error.message || 'Er is iets misgegaan. Probeer het opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsContactSubmitting(true);
    setContactSubmitMessage('');

    try {
      await contactService.sendMessage(contactForm);
      setContactSubmitMessage('Bericht succesvol verstuurd! We nemen zo snel mogelijk contact met je op.');
      setContactForm({
        name: '',
        email: '',
        inquiryType: 'Sponsoring',
        message: ''
      });
      setTimeout(() => {
        setContactSubmitMessage('');
      }, 5000);
    } catch (error: any) {
      setContactSubmitMessage(error.message || 'Er is iets misgegaan. Probeer het opnieuw.');
    } finally {
      setIsContactSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <Head>
        <title>Fré Leys - Paraklimmer op weg naar Los Angeles 2028 Paralympics | Leuven, België</title>
        <meta name="description" content="Frederik 'Fré' Leys, Leuvense paraklimmer met wereldkampioenschappen op zak. Volg mijn reis naar de Paralympische Spelen 2028 in Los Angeles. Ontdek paraklimmen in België via paraclimbing.be" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.fre2028.la/" />
        <meta property="og:title" content="Fré Leys - Paraklimmer uit Leuven op weg naar Paralympics 2028" />
        <meta property="og:description" content="Frederik 'Fré' Leys, Leuvense paraklimmer met wereldkampioenschappen op zak. Volg mijn reis naar de Paralympische Spelen 2028 in Los Angeles." />
        <meta property="og:image" content="https://www.fre2028.la/images/web/me_innsbruck_banner_web.webp" />
        <meta property="og:locale" content="nl_BE" />
        <meta property="og:site_name" content="Fré Leys - Paraclimbing België" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://www.fre2028.la/" />
        <meta property="twitter:title" content="Fré Leys - Paraklimmer uit Leuven op weg naar Paralympics 2028" />
        <meta property="twitter:description" content="Frederik 'Fré' Leys, Leuvense paraklimmer met wereldkampioenschappen op zak. Volg mijn reis naar de Paralympische Spelen 2028." />
        <meta property="twitter:image" content="https://www.fre2028.la/images/web/me_innsbruck_banner_web.webp" />
        
        {/* Additional SEO */}
        <meta name="author" content="Frederik Leys" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.fre2028.la/" />
        
        {/* JSON-LD Structured Data for Person/Athlete */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Frederik Leys",
              "alternateName": "Fré Leys",
              "jobTitle": "Paralympic Athlete - Paraclimbing",
              "description": "Belgische paraklimmer uit Leuven op weg naar de Paralympische Spelen 2028 in Los Angeles. Wereldkampioen en oprichter van paraclimbing.be",
              "url": "https://www.fre2028.la",
              "image": "https://www.fre2028.la/images/web/me_web.webp",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Leuven",
                "addressCountry": "BE"
              },
              "nationality": {
                "@type": "Country",
                "name": "Belgium"
              },
              "sameAs": [
                "https://www.instagram.com/fre.climbs",
                "https://www.linkedin.com/in/frederik-leys-b7bb5b9/",
                "https://www.youtube.com/@FreClimbs",
                "https://paraclimbing.be"
              ],
              "knowsAbout": ["Paraclimbing", "Paralympics", "Adaptive Sports", "Sport Climbing", "Paralympic Games"],
              "award": [
                "IFSC World Championships Silver Medal 2023",
                "Paraclimbing World Cup Gold Medal 2024"
              ],
              "memberOf": {
                "@type": "Organization",
                "name": "Paraclimbing.be VZW",
                "url": "https://paraclimbing.be"
              }
            })
          }}
        />
        
        {/* JSON-LD for Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Paraclimbing.be VZW",
              "description": "Belgische organisatie die paraklimmen toegankelijk maakt voor iedereen met een fysieke beperking",
              "url": "https://paraclimbing.be",
              "founder": {
                "@type": "Person",
                "name": "Frederik Leys"
              },
              "location": {
                "@type": "Place",
                "address": {
                  "@type": "PostalAddress",
                  "addressCountry": "BE"
                }
              }
            })
          }}
        />

        {/* JSON-LD for Event - Los Angeles 2028 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SportsEvent",
              "name": "Los Angeles 2028 Paralympic Games",
              "description": "Frederik Leys' doel om te participeren in de Paralympische Spelen 2028 in Los Angeles",
              "startDate": "2028-08-15",
              "endDate": "2028-08-27",
              "location": {
                "@type": "Place",
                "name": "Los Angeles",
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "Los Angeles",
                  "addressRegion": "CA",
                  "addressCountry": "US"
                }
              },
              "sport": "Paraclimbing",
              "competitor": {
                "@type": "Person",
                "name": "Frederik Leys",
                "url": "https://www.fre2028.la"
              }
            })
          }}
        />
      </Head>
      
      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isScrolled ? "bg-white border-zinc-100 py-3" : "bg-transparent border-transparent py-6"
      )}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          <div className={cn(
            "flex items-center gap-3 font-bold text-lg tracking-widest uppercase transition-colors",
            isScrolled ? "text-black" : "text-white"
          )}>
             <Mountain className="w-6 h-6" />
             <span>Fré2028.LA</span>
          </div>

          {/* Desktop Nav */}
          <div className={cn(
            "hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-widest transition-colors",
            isScrolled ? "text-black" : "text-white"
          )}>
            <button onClick={() => scrollToSection('about')} className="hover:opacity-60 transition-opacity">Mijn verhaal</button>
            <button onClick={() => scrollToSection('nonprofit')} className="hover:opacity-60 transition-opacity">Paraclimbing.be</button>
            <button onClick={() => scrollToSection('journey')} className="hover:opacity-60 transition-opacity">Roadmap</button>
            <button onClick={() => scrollToSection('media')} className="hover:opacity-60 transition-opacity">Pers/Media</button>
            <button onClick={() => scrollToSection('contact')} className="hover:opacity-60 transition-opacity">Contact</button>
            <button onClick={() => router.push('/partners')} className="hover:opacity-60 transition-opacity">Partners</button>
            <button 
              onClick={() => scrollToSection('sponsors')} 
              className="inline-flex items-center justify-center text-sm font-semibold tracking-wide transition-all duration-200 h-10 px-6 text-xs ml-4 bg-red-600 hover:bg-red-700 text-white"
            >
              Word partner
            </button>
          </div>

          {/* Mobile Nav Toggle */}
          <button 
            className={cn("lg:hidden p-2", isScrolled ? "text-black" : "text-white")}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Content */}
        <div className={cn(
          "lg:hidden absolute top-full left-0 w-full bg-white border-b border-zinc-100 transition-all duration-300 overflow-hidden shadow-xl",
          isMobileMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="flex flex-col p-6 gap-6 text-sm font-bold uppercase tracking-widest">
             <button onClick={() => scrollToSection('about')} className="text-left hover:opacity-60">About</button>
             <button onClick={() => scrollToSection('nonprofit')} className="text-left hover:opacity-60">Community</button>
             <button onClick={() => scrollToSection('journey')} className="text-left hover:opacity-60">Journey</button>
             <button onClick={() => scrollToSection('media')} className="text-left hover:opacity-60">Media</button>
             <button onClick={() => scrollToSection('sponsors')} className="text-left hover:opacity-60">Sponsors</button>
             <button onClick={() => { setIsMobileMenuOpen(false); router.push('/partners'); }} className="text-left hover:opacity-60">Partners</button>
             <Button onClick={() => scrollToSection('contact')} className="w-full">Partner With Me</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Video Fade */}
      <section className="relative h-screen flex items-center bg-black text-white px-4 md:px-8 overflow-hidden">
        
        {/* 1. The Static Image Background (FINAL STATE) - z-0 puts it at the bottom */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/web/me_innsbruck_banner_web.webp"
            alt="Fré climbing background"
            fill
            sizes="100vw"
            className="object-cover opacity-40 grayscale mix-blend-screen"
            priority
            quality={60}
          />
        </div>

        {/* 2. The Video Overlay (INITIAL STATE) - z-10 puts it on top. Fades out when 'videoEnded' is true. */}
        <div className={cn(
          "absolute inset-0 transition-opacity duration-[2000ms] ease-in-out z-10 bg-black",
           videoEnded ? "opacity-0 pointer-events-none" : "opacity-100"
        )}>
           {/* Video uses same styling (grayscale, opacity-40, mix-blend-screen) to match the image underneath for a seamless transition */}
           <video
             ref={videoRef}
             muted
             playsInline
             onEnded={() => setVideoEnded(true)}
             onError={() => {
               console.log("Video failed to load, showing static image.");
               setVideoEnded(true);
             }}
             className="w-full h-full object-cover grayscale opacity-40 mix-blend-screen"
           >
             <source src="https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp9" type="video/mp4" />
           </video>
        </div>

        {/* Gradient Overlay (must be on top of both video and image to maintain readability) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/50 z-20" />
        
        <div className="relative z-30 max-w-7xl mx-auto w-full pt-20">
          <div className="max-w-4xl">
            <div className="inline-block px-4 py-2 mb-8 border border-white/30 text-xs font-bold uppercase tracking-[0.2em] text-zinc-300">
              Road to Los Angeles 2028
            </div>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-none mb-8">
              DROOM<br />GROOTS.
            </h1>
            <p className="text-xl text-zinc-400 max-w-lg leading-relaxed mb-12">
              Word ik in 2028 de eerste Leuvense Paralympiër?
            </p>
            <div className="flex flex-wrap gap-6">
              <button onClick={() => setIsNewsletterOpen(true)} className="inline-flex items-center justify-center text-sm font-semibold tracking-wide transition-all duration-200 h-12 px-8 min-w-[160px] bg-red-600 hover:bg-red-700 text-white">
                Ontvang updates
              </button>
              <button onClick={() => scrollToSection('about')} className="group flex items-center gap-3 text-sm font-bold uppercase tracking-widest hover:text-zinc-300 transition-colors">
                Mijn verhaal <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Corner Stats */}
        <div className="absolute bottom-8 right-4 md:right-8 hidden md:flex gap-12 text-right z-30">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Klasse</div>
            <div className="text-3xl font-bold">Leg Amputees (AL-2)</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">World Cup Medailles</div>
            <div className="text-3xl font-bold">#6</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Home Town</div>
            <div className="text-3xl font-bold">Leuven</div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-5">
              <div className="relative w-full">
                 <Image 
                   src="/images/web/me_web.webp"
                   alt="Fré Leys Portrait"
                   width={800}
                   height={1000}
                   className="w-full h-auto"
                   priority
                 />
              </div>
            </div>
            <div className="lg:col-span-7">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-12">
                Welkom!
              </h2>
              <div className="space-y-8 text-lg lg:text-xl leading-relaxed text-zinc-600 max-w-2xl">
                <p>
                  Welkom op mijn website. Hier deel ik mijn reis naar de Paralympische spelen van 2028 in Los Angeles. Ontdek mijn verhaal, volg mijn trainingen en steun me op weg naar mijn Paralympische droom.
                </p>
                <p>
                  <strong className="text-black">Als mogelijks eerste Paralympiër van Leuven,</strong> wil ik jullie meenemen in mijn avontuur vol uitdagingen, overwinningen en de onwrikbare vastberadenheid om geschiedenis te schrijven.
                </p>
              </div>

              <div className="mt-12">
                <Button 
                  onClick={() => window.location.href = '/story'} 
                  variant="outline" 
                  className="mb-16"
                >
                  Lees mijn persoonlijk verhaal <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Non-Profit / Community Section */}
      <section id="nonprofit" className="py-32 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-start">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 text-white font-bold uppercase tracking-widest mb-8 text-xs border border-zinc-800 px-4 py-2">
                  <Heart className="w-4 h-4 fill-white" /> Paraclimbing.be VZW
              </div>
              {/* <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8">
                WORD PARAKLIMMER
              </h2> */}
              <p className="text-2xl font-bold text-white mb-8 leading-tight">
                Klimmen is vaak meer dan een sport; het helpt bij het (her)ontdekken van wat mogelijk is.
              </p>
              <div className="space-y-6 text-lg text-zinc-400 leading-relaxed mb-12">
                <p>
                  Ik richtte <strong>paraclimbing.be</strong> op met een eenvoudige missie: ervoor zorgen dat elke persoon met een fysieke beperking in België de kans krijgt om het klimmen te ontdekken.
                </p>
                <p>
                  We organiseren initiatiedagen, helpen bij vragen, ondersteunen atleten en bouwen aan een gemeenschap van avonturiers met een hoekje af.
                </p>
              </div>

              <Button variant="white" onClick={() => window.open('https://paraclimbing.be', '_blank')} className="w-full sm:w-auto">
                Bezoek Paraclimbing.be <ArrowUpRight className="ml-2 w-4 h-4" />
              </Button>
            </div>

            <div className="order-1 lg:order-2 relative bg-zinc-900 border border-zinc-800 overflow-hidden">
              <Image 
                src="/images/web/paraclimbing_be_web.webp"
                alt="Paraclimbing.be community"
                width={800}
                height={800}
                className="w-full h-auto object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
                 <div className="border border-zinc-800 p-6 text-center">
                    <Users className="w-8 h-8 mx-auto mb-4" />
                    <div className="font-bold uppercase tracking-widest text-xs">Gemeenschap</div>
                 </div>
                 <div className="border border-zinc-800 p-6 text-center">
                    <Mountain className="w-8 h-8 mx-auto mb-4" />
                    <div className="font-bold uppercase tracking-widest text-xs">Ontdekking</div>
                 </div>
                 <div className="border border-zinc-800 p-6 text-center">
                    <TrendingUp className="w-8 h-8 mx-auto mb-4" />
                    <div className="font-bold uppercase tracking-widest text-xs">Groei</div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="relative">
            {/* Results Header */}
            <div className="mb-8 md:mb-12 text-center">
              <div className="inline-block px-4 py-2 mb-6 border border-zinc-300 text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">
                2016-2025
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-3 md:mb-4">
                Resultaten
              </h2>
              <p className="text-base md:text-lg text-zinc-600 italic">
                Mijn Top 4 Prestaties
              </p>
            </div>

            {/* Scrollable Results List */}
            <div className="overflow-y-auto space-y-4 md:space-y-6 pr-2" style={{ maxHeight: '396px' }}>
              {resultsData.results
                .filter(result => result.rank <= 4)
                .map((result, index) => (
                  <div 
                    key={index}
                    className="group bg-white border border-zinc-200 rounded-lg p-6 md:p-8 hover:border-zinc-300 transition-all duration-200 hover:shadow-lg"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {/* Rank Badge */}
                        <div className={cn(
                          "flex items-center justify-center w-12 h-12 rounded-full text-white font-bold text-lg flex-shrink-0",
                          result.rank === 1 && "bg-yellow-500",
                          result.rank === 2 && "bg-gray-400", 
                          result.rank === 3 && "bg-amber-600",
                          result.rank > 3 && "bg-zinc-600"
                        )}>
                          {result.rank === 1 && <Trophy className="w-6 h-6" />}
                          {result.rank === 2 && <Medal className="w-6 h-6" />}
                          {result.rank === 3 && <Medal className="w-6 h-6" />}
                          {result.rank > 3 && result.rank}
                        </div>

                        {/* Event Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg md:text-xl text-zinc-900 mb-1 leading-tight">
                            {result.eventName}
                          </h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-zinc-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{result.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{result.date}</span>
                            </div>
                            <div className="inline-block px-2 py-1 bg-zinc-100 text-zinc-700 rounded text-xs font-medium">
                              {result.discipline}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Position Label */}
                      <div className="text-right">
                        <div className="text-2xl md:text-3xl font-bold text-zinc-900">
                          #{result.rank}
                        </div>
                        <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                          Plaats
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* View All Results Button */}
            <div className="mt-11 flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Medal Statistics */}
              <div className="bg-gradient-to-r from-zinc-50 to-white p-6 rounded-lg border border-zinc-200">
                <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4">
                  World Cup Medailles
                </h4>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xl font-bold">2</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                      <Medal className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xl font-bold">1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
                      <Medal className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xl font-bold">3</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  6 medailles in totaal
                </p>
              </div>

              {/* Right aligned text and button */}
              <div className="text-right">
                <p className="text-sm text-zinc-600 mb-4">
                  Top 4 prestaties uit {resultsData.results.length} internationale wedstrijden
                </p>
                <Button 
                  onClick={() => window.open('https://ifsc.results.info/athlete/351', '_blank')}
                  variant="outline"
                  className="h-10 px-6 text-xs"
                >
                  <Award className="w-4 h-4 mr-2" />
                  Bekijk Op IFSC Website
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section id="journey" className="py-32 bg-zinc-50">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-center mb-24">
            THE ROADMAP
          </h2>

          <div className="relative border-l border-zinc-200 ml-4 md:ml-0">
            <div className="space-y-16">
              {timelineEvents.map((event: any, index: number) => (
                <div key={index} className="relative pl-12 md:pl-0 md:grid md:grid-cols-5 items-start group">
                  {/* Timeline Node */}
                  <div className={cn(
                    "absolute left-[-5px] top-2 w-2.5 h-2.5 rounded-full border-2 border-white ring-1 transition-all duration-500",
                    event.highlight ? "bg-black ring-black scale-125" : "bg-zinc-400 ring-zinc-400 group-hover:bg-black group-hover:ring-black"
                  )} />
                  
                  <div className="md:col-span-1 md:text-right md:pr-12 pt-1">
                    <span className={cn(
                      "font-bold tracking-tighter text-xl",
                      event.highlight ? "text-black" : "text-zinc-400 group-hover:text-black transition-colors"
                    )}>
                      {event.year}
                    </span>
                  </div>

                  <div className="md:col-span-4 pt-1">
                    <h3 className="text-xl font-bold mb-3">{event.title}</h3>
                    <p className="text-zinc-600 leading-relaxed">{event.desc}</p>
                    {event.milestone && 
                      <span className="inline-block mt-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 border border-zinc-200 px-2 py-1">
                        Milestone
                      </span>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Media Section */}
      <section id="media" ref={portfolioRef} className="bg-white text-black py-32 border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-16">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter">PORTOFOLIO.</h2>
            <div className="hidden md:flex items-center gap-4">
              <Button 
                onClick={() => window.location.href = '/story'} 
                variant="outline"
              >
                Lees mijn persoonlijk verhaal
              </Button>
              <a href="https://www.instagram.com/fre.climbs" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:opacity-60 transition-opacity">
                <Instagram className="w-5 h-5" /> View Instagram
              </a>
            </div>
          </div>

          {/* Mobile button - above the grid */}
          <div className="mb-6 md:hidden">
            <Button 
              onClick={() => window.location.href = '/story'} 
              variant="outline"
              className="w-full"
            >
              Lees mijn persoonlijk verhaal
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 auto-rows-[200px] md:auto-rows-[250px]">
            <div className="relative bg-zinc-100 overflow-hidden transition-all duration-500 col-span-2 row-span-2">
              <Image 
                src="/images/web/me_winning_innsbruck_web.webp"
                alt="Fré climbing in action"
                fill
                className="object-cover"
              />
            </div>
            <div 
              className="relative bg-zinc-100 overflow-hidden transition-all duration-500 cursor-pointer hover:scale-105 aspect-auto"
              onClick={() => setIsMediaDialogOpen(true)}
            >
              <Image 
                src="/images/web/grensverleggers_web.webp"
                alt="Grensverleggers podcast"
                width={400}
                height={300}
                className="w-full h-auto"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/20 hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <div className="bg-white/90 rounded-full p-3">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18V5l12-2v13M9 18c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm12-9c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z" />
                  </svg>
                </div>
              </div>
            </div>
            <div 
              className="relative bg-zinc-100 overflow-hidden transition-all duration-500 cursor-pointer hover:scale-105"
              onClick={() => setIsVideoDialogOpen(true)}
            >
              <Image 
                src="https://img.youtube.com/vi/MZuKnpXXbUo/maxresdefault.jpg"
                alt="Climbing for Gold video thumbnail"
                width={480}
                height={360}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/20 hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <div className="bg-red-600 rounded-full p-3">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              <div className="absolute bottom-2 left-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-medium">
                Video
              </div>
            </div>
            <div 
              className="relative bg-zinc-100 overflow-hidden transition-all duration-500 cursor-pointer hover:scale-105"
              onClick={() => setIsPortfolioSliderOpen(true)}
            >
              {portfolioSectionVisible ? (
                <div className="grid grid-cols-2 h-full gap-0.5">
                  {portfolioImages.slice(0, 4).map((image, index) => (
                    <div key={index} className="relative overflow-hidden">
                      <Image 
                        src={image.src}
                        alt={image.alt}
                        fill
                        unoptimized
                        loading="lazy"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 h-full gap-0.5 animate-pulse bg-zinc-200" />
              )}
              <div className="absolute inset-0 bg-black/20 hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <div className="bg-white/90 rounded-full p-3">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="absolute bottom-2 left-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-medium">
                {portfolioImages.length} foto's
              </div>
            </div>
          </div>

          <div className="mt-16 text-center md:hidden">
            <Button variant="outline" className="w-full" onClick={() => window.open('https://www.instagram.com/fre.climbs', '_blank')}>
              <Instagram className="w-4 h-4 mr-2" /> View More on Instagram
            </Button>
          </div>
        </div>
      </section>

      {/* Sponsors Grid Section */}
      <section id="sponsors" className="py-32 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 font-bold uppercase tracking-widest mb-4 text-xs text-zinc-500">
                <Grid3X3 className="w-4 h-4" />
                Partners
              </div>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter">
                TEAM 2028.
              </h2>
            </div>
            <div className="flex flex-wrap gap-4 shrink-0">
              <a 
                href="/Frederik-Leys-Partnership-Dossier.pdf" 
                download
                className="inline-flex items-center justify-center text-sm font-semibold tracking-wide transition-all duration-200 h-12 px-8 border border-current bg-transparent hover:opacity-60 shrink-0"
              >
                Download sponsordossier
              </a>
              <Button onClick={() => scrollToSection('contact')} className="shrink-0">
                Contacteer mij
              </Button>
            </div>
          </div>

          {isLoadingPartners ? (
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-4 border-zinc-300 border-t-black rounded-full animate-spin"></div>
              <p className="mt-4 text-zinc-600">Partners laden...</p>
            </div>
          ) : (
            <>
              {/* Financiële Partners Section */}
              {partners.filter(p => p.category === 'Financiële Partner').length > 0 && (
                <div className="mb-20">
                  <h3 className="text-2xl md:text-3xl font-bold tracking-tighter mb-8 text-center">
                    Financiële Partners
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
                    {partners
                      .filter(p => p.category === 'Financiële Partner')
                      .map((partner) => (
                        <div 
                          key={partner.id} 
                          className="relative group aspect-square bg-white border border-zinc-200 overflow-hidden hover:border-black transition-colors cursor-pointer"
                          onClick={() => router.push(`/partners#${partner.id}`)}
                        >
                          {partner.imageUrl ? (
                            <Image 
                              src={partner.imageUrl}
                              alt={partner.name}
                              fill
                              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              className="object-contain p-4"
                              loading="lazy"
                            />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                              <div className="text-zinc-600 font-bold uppercase tracking-widest text-xs">
                                {partner.name}
                              </div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center">
                            <p className="text-white font-bold uppercase tracking-wider mb-2 text-sm">
                              {partner.name}
                            </p>
                            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest border border-zinc-700 px-3 py-1">
                              Bekijk Partner
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Strategic Partners Section */}
              {partners.filter(p => p.category === 'Strategische Partner').length > 0 && (
                <div className="mb-20">
                  <h3 className="text-2xl md:text-3xl font-bold tracking-tighter mb-8 text-center">
                    Strategische Partners
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
                    {partners
                      .filter(p => p.category === 'Strategische Partner')
                      .map((partner) => (
                        <div 
                          key={partner.id} 
                          className="relative group aspect-square bg-white border border-zinc-200 overflow-hidden hover:border-black transition-colors cursor-pointer"
                          onClick={() => router.push(`/partners#${partner.id}`)}
                        >
                          {partner.imageUrl ? (
                            <Image 
                              src={partner.imageUrl}
                              alt={partner.name}
                              fill
                              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              className="object-contain p-4"
                              loading="lazy"
                            />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                              <div className="text-zinc-600 font-bold uppercase tracking-widest text-xs">
                                {partner.name}
                              </div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center">
                            <p className="text-white font-bold uppercase tracking-wider mb-2 text-sm">
                              {partner.name}
                            </p>
                            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest border border-zinc-700 px-3 py-1">
                              Bekijk Partner
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Performance Team Section */}
              {partners.filter(p => p.category === 'Performance Team').length > 0 && (
                <div className="mb-20">
                  <h3 className="text-2xl md:text-3xl font-bold tracking-tighter mb-8 text-center">
                    Performance Team
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
                    {partners
                      .filter(p => p.category === 'Performance Team')
                      .map((partner) => (
                        <div 
                          key={partner.id} 
                          className="relative group aspect-square bg-white border border-zinc-200 overflow-hidden hover:border-black transition-colors cursor-pointer"
                          onClick={() => router.push(`/partners#${partner.id}`)}
                        >
                          {partner.imageUrl ? (
                            <Image 
                              src={partner.imageUrl}
                              alt={partner.name}
                              fill
                              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              className="object-contain p-4"
                              loading="lazy"
                            />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                              <div className="text-zinc-600 font-bold uppercase tracking-widest text-xs">
                                {partner.name}
                              </div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center">
                            <p className="text-white font-bold uppercase tracking-wider mb-2 text-sm">
                              {partner.name}
                            </p>
                            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest border border-zinc-700 px-3 py-1">
                              Bekijk Partner
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Show message if no partners yet */}
              {partners.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-xl text-zinc-600 mb-6">Nog geen partners beschikbaar.</p>
                  <Button onClick={() => scrollToSection('contact')}>
                    Word de eerste partner
                  </Button>
                </div>
              )}
            </>
          )}

        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 bg-white">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">Contacteer me.</h2>
            <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
              Heb je vragen, opmerkingen of stuur je gewoon graag mails?
            </p>
          </div>

          <div className="bg-white p-8 md:p-16 shadow-xl shadow-zinc-100/50 border border-zinc-100">
            <form onSubmit={handleContactSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 group-focus-within:text-black transition-colors">Naam</label>
                    <input 
                      type="text" 
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      required
                      disabled={isContactSubmitting}
                      className="w-full py-3 bg-transparent border-b border-zinc-200 focus:border-black focus:outline-none transition-colors text-lg" 
                      placeholder="Jan Janssens" 
                    />
                  </div>
                  <div className="group">
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 group-focus-within:text-black transition-colors">Email</label>
                    <input 
                      type="email" 
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      required
                      disabled={isContactSubmitting}
                      className="w-full py-3 bg-transparent border-b border-zinc-200 focus:border-black focus:outline-none transition-colors text-lg" 
                      placeholder="jan@bedrijf.be" 
                    />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 group-focus-within:text-black transition-colors">Type vraag</label>
                  <select 
                    value={contactForm.inquiryType}
                    onChange={(e) => setContactForm({...contactForm, inquiryType: e.target.value})}
                    disabled={isContactSubmitting}
                    className="w-full py-3 bg-transparent border-b border-zinc-200 focus:border-black focus:outline-none transition-colors text-lg appearance-none rounded-none"
                  >
                    <option>Sponsoring</option>
                    <option>Paraclimbing.be</option>
                    <option>Media</option>
                    <option>Algemeen</option>
                  </select>
                </div>
                <div className="group">
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 group-focus-within:text-black transition-colors">Bericht</label>
                  <textarea 
                    rows={4} 
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    required
                    disabled={isContactSubmitting}
                    className="w-full py-3 bg-transparent border-b border-zinc-200 focus:border-black focus:outline-none transition-colors text-lg resize-none" 
                    placeholder="Hoe kunnen we samenwerken?"
                  ></textarea>
                </div>
              </div>

              {contactSubmitMessage && (
                <div className={cn(
                  "text-sm font-medium p-3 border",
                  contactSubmitMessage.includes('succesvol') 
                    ? "bg-green-50 text-green-800 border-green-200" 
                    : "bg-red-50 text-red-800 border-red-200"
                )}>
                  {contactSubmitMessage}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isContactSubmitting}>
                {isContactSubmitting ? 'Bezig met versturen...' : 'Verstuur bericht'}
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2 font-bold uppercase tracking-widest">
            <Mountain className="w-6 h-6" />
            <span>Fré2028.LA</span>
          </div>
          
          <div className="flex gap-8 text-zinc-400">
            <a href="https://www.instagram.com/fre.climbs" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors"><Instagram className="w-5 h-5" /></a>
            <a href="https://www.linkedin.com/in/frederik-leys-b7bb5b9/" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors"><Linkedin className="w-5 h-5" /></a>
            <a href="https://www.youtube.com/@FreClimbs" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors"><Youtube className="w-5 h-5" /></a>
          </div>

          <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            © 2025 Fré Leys
          </div>
        </div>
      </footer>

      {/* Newsletter Modal */}
      {isNewsletterOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsNewsletterOpen(false)}>
          <div className="bg-white max-w-md w-full p-8 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setIsNewsletterOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="mb-8">
              <Mail className="w-12 h-12 mb-4" />
              <h3 className="text-3xl font-bold tracking-tighter mb-3">
                Schrijf je in voor mijn gratis nieuwsbrief
              </h3>
              <p className="text-zinc-600">
                Ontvang elke maand een update
              </p>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="space-y-6">
              <div className="group">
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                  Email
                </label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-3 px-4 bg-zinc-50 border border-zinc-200 focus:border-black focus:outline-none transition-colors text-lg"
                  placeholder="jouw@email.com"
                  disabled={isSubmitting}
                />
              </div>

              {submitMessage && (
                <div className={cn(
                  "text-sm font-medium p-3 border",
                  submitMessage.includes('Bedankt') 
                    ? "bg-green-50 text-green-800 border-green-200" 
                    : "bg-red-50 text-red-800 border-red-200"
                )}>
                  {submitMessage}
                </div>
              )}

              <Button 
                type="submit" 
                variant="primary" 
                className="w-full !bg-red-600 hover:!bg-red-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Bezig...' : 'Inschrijven'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Media Dialog */}
      {isMediaDialogOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsMediaDialogOpen(false)}>
          <div className="bg-white max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setIsMediaDialogOpen(false)}
              className="absolute top-4 right-4 z-10 bg-white/90 rounded-full p-2 text-zinc-600 hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative bg-zinc-100">
              <Image 
                src="/images/web/grensverleggers_web.webp"
                alt="Grensverleggers podcast"
                width={600}
                height={300}
                className="w-full h-auto"
              />
            </div>

            <div className="p-6">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold uppercase tracking-wider rounded-full mb-3">
                  Podcast
                </span>
                <h3 className="text-xl font-bold tracking-tight mb-2">
                  Grensverleggers over veerkracht
                </h3>
                <p className="text-sm text-zinc-500 mb-4">
                  20 juli 2025
                </p>
              </div>

              <p className="text-zinc-700 leading-relaxed mb-4 text-sm">
                Fré Leys traint 30 uur per week, won al meerdere World Cups en droomt van een deelname aan de Paralympische Spelen. De ambitieuze klimmer laat zich niet hinderen door zijn beperking. Integendeel, hij vermoedt dat het zijn grenzeloze ambitie en doorzettingsvermogen verklaart. Zo ambieert Fré de titel van wereldkampioen.
              </p>
              
              <p className="text-zinc-700 leading-relaxed mb-6 text-sm">
                Host Pieter Embrechts ontmoet Fré voor een gesprek over veerkracht en vooroordelen. En hoe het enige echte falen simpelweg niet proberen is.
              </p>

              <div className="border border-zinc-200 rounded-lg p-4">
                <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-zinc-600">
                  Beluister hier
                </h4>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg overflow-hidden">
                  <div className="flex items-center p-3 text-white">
                    <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Grensverleggers</p>
                      <p className="text-xs opacity-90 truncate">The Only Way Is Up. Paralympisch klimmer Fré Leys...</p>
                    </div>
                    <button 
                      onClick={() => window.open('https://open.spotify.com/episode/793kva7MtYLL5YVmndbILI', '_blank')}
                      className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors flex-shrink-0"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Dialog */}
      {isVideoDialogOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsVideoDialogOpen(false)}>
          <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setIsVideoDialogOpen(false)}
              className="absolute top-4 right-4 z-10 bg-white/90 rounded-full p-2 text-zinc-600 hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <article className="blog-post-content">
              <header className="post-header p-6 pb-0">
                <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold uppercase tracking-wider rounded-full mb-3">
                  Video
                </span>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">Climbing for Gold</h1>
                <p className="post-intro text-lg text-zinc-600 leading-relaxed">
                  Vincent Groos, volgde me een jaar lang doorheen het competitie circuit.
                </p>
              </header>
              
              <main className="post-main p-6 pt-4">
                <div className="video-content">
                  <div className="video-embed">
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
                      <iframe 
                        src="https://www.youtube.com/embed/MZuKnpXXbUo" 
                        title="Climbing for Gold" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </main>
            </article>
          </div>
        </div>
      )}

      {/* Portfolio Slider Dialog */}
      {isPortfolioSliderOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setIsPortfolioSliderOpen(false)}>
          <div className="relative w-full max-w-4xl mx-auto" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setIsPortfolioSliderOpen(false)}
              className="absolute top-4 right-4 z-10 bg-white/90 rounded-full p-2 text-zinc-600 hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Main Image */}
            <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/10' }}>
              <Image 
                src={portfolioImages[currentSlideIndex]?.src}
                alt={portfolioImages[currentSlideIndex]?.alt}
                fill
                unoptimized
                priority
                className="object-contain"
              />
              
              {/* Navigation Arrows */}
              {portfolioImages.length > 1 && (
                <>
                  <button 
                    onClick={() => setCurrentSlideIndex(prev => prev === 0 ? portfolioImages.length - 1 : prev - 1)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => setCurrentSlideIndex(prev => prev === portfolioImages.length - 1 ? 0 : prev + 1)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
                {currentSlideIndex + 1} / {portfolioImages.length}
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {portfolioImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlideIndex(index)}
                  className={cn(
                    "relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                    currentSlideIndex === index ? "border-white scale-105" : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <Image 
                    src={image.src}
                    alt={image.alt}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Image Title */}
            <div className="mt-4 text-center">
              <h3 className="text-white text-lg font-semibold">
                {portfolioImages[currentSlideIndex]?.alt}
              </h3>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
