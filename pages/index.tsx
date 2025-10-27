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
  Youtube
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { newsletterService } from '../services/newsletterService';
import { contactService } from '../services/contactService';

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

const TIMELINE_EVENTS = [
  { year: '2023', title: 'IFSC World Championships Bern', desc: 'Silver Medal - Men\'s AL2 Category', milestone: true },
  { year: '2024', title: 'Paraclimbing World Cup Innsbruck', desc: 'Gold Medal - Secured top world ranking', milestone: true },
  { year: '2025', title: 'Intensive Training Block', desc: 'Focus on strength conditioning in Fontainebleau and bespoke gym training in Brussels.', milestone: false },
  { year: '2026', title: 'European Championships', desc: 'Defending the continental title.', milestone: false },
  { year: '2027', title: 'Paralympic Qualifiers', desc: 'The final hurdle before the big stage.', milestone: true },
  { year: '2028', title: 'LOS ANGELES PARALYMPICS', desc: 'The ultimate goal. Representing Belgium on the world\'s biggest stage.', milestone: true, highlight: true },
];

const STRATEGIC_PARTNERS = [
  { id: 1, name: "Strategic Partner 1" },
  { id: 2, name: "Strategic Partner 2" },
  { id: 3, name: "Strategic Partner 3" },
  { id: 4, name: "Strategic Partner 4" },
];

const SPONSORS_GRID = [
  { id: 1, name: "Leuven Partner 1" },
  { id: 2, name: "Leuven Partner 2" },
  { id: 3, name: "Leuven Partner 3" },
  { id: 4, name: "Leuven Partner 4" },
  { id: 5, name: "Leuven Partner 5" },
  { id: 6, name: "Leuven Partner 6" },
  { id: 7, name: "Leuven Partner 7" },
  { id: 8, name: "Leuven Partner 8" },
];

// --- Main Page Component ---

export default function ParaclimberSite() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [videoEnded, setVideoEnded] = useState(true); // Temporarily set to true to show image immediately
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

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
        <meta property="og:image" content="https://www.fre2028.la/images/me/me_innsbruck.webp" />
        <meta property="og:locale" content="nl_BE" />
        <meta property="og:site_name" content="Fré Leys - Paraclimbing België" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://www.fre2028.la/" />
        <meta property="twitter:title" content="Fré Leys - Paraklimmer uit Leuven op weg naar Paralympics 2028" />
        <meta property="twitter:description" content="Frederik 'Fré' Leys, Leuvense paraklimmer met wereldkampioenschappen op zak. Volg mijn reis naar de Paralympische Spelen 2028." />
        <meta property="twitter:image" content="https://www.fre2028.la/images/me/me_innsbruck.webp" />
        
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
              "image": "https://www.fre2028.la/images/me.webp",
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
             <span>Fré Klimt</span>
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
             <button onClick={() => scrollToSection('sponsors')} className="text-left hover:opacity-60">Partners</button>
             <Button onClick={() => scrollToSection('contact')} className="w-full">Partner With Me</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Video Fade */}
      <section className="relative h-screen flex items-center bg-black text-white px-4 md:px-8 overflow-hidden">
        
        {/* 1. The Static Image Background (FINAL STATE) - z-0 puts it at the bottom */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/me/me_innsbruck.webp"
            alt="Fré climbing background"
            className="w-full h-full object-cover opacity-40 grayscale mix-blend-screen"
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
             <source src="https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
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
                   src="/images/me.webp"
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
                src="/images/paraclimbing_be_c.webp"
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

      {/* Journey Section */}
      <section id="journey" className="py-32 bg-zinc-50">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-center mb-24">
            THE ROADMAP
          </h2>

          <div className="relative border-l border-zinc-200 ml-4 md:ml-0">
            <div className="space-y-16">
              {TIMELINE_EVENTS.map((event, index) => (
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
      <section id="media" className="bg-white text-black py-32 border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-16">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter">IN ACTION.</h2>
            <a href="https://www.instagram.com/fre.climbs" target="_blank" rel="noopener noreferrer" className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:opacity-60 transition-opacity">
              <Instagram className="w-5 h-5" /> View Instagram
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 auto-rows-[200px] md:auto-rows-[300px]">
            <div className="relative bg-zinc-100 overflow-hidden transition-all duration-500 col-span-2 row-span-2">
              <Image 
                src="/images/gallery/Ifsc_FSC110590.jpg"
                alt="Fré climbing in action"
                fill
                className="object-cover"
              />
            </div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="relative bg-zinc-100 overflow-hidden flex items-center justify-center text-zinc-300 font-bold tracking-widest uppercase text-xs">
                [Image {i + 2}]
              </div>
            ))}
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

          

          {/* Sponsoring Partners Section */}
          <div>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tighter mb-8 text-center">
              Leuvense Sponsors
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {SPONSORS_GRID.map((sponsor) => (
                <div 
                  key={sponsor.id} 
                  className="relative group aspect-square bg-white border border-zinc-200 overflow-hidden hover:border-black transition-colors"
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                     <div className="text-zinc-300 font-bold uppercase tracking-widest text-xs">
                        Open Slot
                     </div>
                     <div className="text-zinc-400 text-xs mt-2">
                        {sponsor.name}
                     </div>
                  </div>

                  <div className="absolute inset-0 bg-black/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center">
                    <p className="text-white font-bold uppercase tracking-wider mb-2 text-sm">
                      Beschikbaar voor Leuvense partners
                    </p>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest border border-zinc-700 px-3 py-1">
                      Word Partner
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strategic Partners Section */}
          <div className="mb-20 mt-20">
            <h3 className="text-2xl md:text-3xl font-bold tracking-tighter mb-8 text-center">
              Strategische Partners
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {STRATEGIC_PARTNERS.map((partner) => (
                <div 
                  key={partner.id} 
                  className="relative group aspect-square bg-white border border-zinc-200 overflow-hidden hover:border-black transition-colors"
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                     <div className="text-zinc-300 font-bold uppercase tracking-widest text-xs">
                        Open Slot
                     </div>
                     <div className="text-zinc-400 text-xs mt-2">
                        {partner.name}
                     </div>
                  </div>

                  <div className="absolute inset-0 bg-black/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center">
                    <p className="text-white font-bold uppercase tracking-wider mb-2 text-sm">
                      Beschikbaar voor strategische partners
                    </p>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest border border-zinc-700 px-3 py-1">
                      Word Partner
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
            <span>Fré Klimt</span>
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
    </div>
  )
}
