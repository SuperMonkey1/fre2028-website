import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { 
  Mountain, 
  Award, 
  Mail, 
  Instagram, 
  Twitter, 
  Menu, 
  X, 
  MapPin, 
  TrendingUp, 
  ArrowRight,
  Grid3X3,
  Heart,
  ArrowUpRight,
  Users
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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

const SPONSORS_GRID = [
  { id: 1, name: "Belgian Climbing Fed", tier: "Partner", size: "2x2" },
  { id: 2, name: "Performance Gear Co", tier: "Gold", size: "2x1" },
  { id: 3, name: "Brussels Sports", tier: "Gold", size: "2x1" },
  { id: 4, name: "Kineos Therapy", tier: "Supporter", size: "1x1" },
  { id: 5, name: "Ghent Climbing Gym", tier: "Supporter", size: "1x1" },
  { id: 6, name: "Alpine Nutrition", tier: "Partner", size: "2x2" },
  { id: 7, name: "Solid Holds", tier: "Supporter", size: "1x1" },
  { id: 8, name: "Peak Performance", tier: "Supporter", size: "1x1" },
  { id: 9, name: "Adaptive Athletes BE", tier: "Gold", size: "2x1" },
  { id: 10, name: "Local Gov Support", tier: "Supporter", size: "1x1" },
  { id: 11, name: "Flemish Sport", tier: "Supporter", size: "1x1" },
  { id: 12, name: "Vertical Life", tier: "Supporter", size: "1x1" },
  { id: 13, name: "Chalk Matters", tier: "Supporter", size: "1x1" },
  { id: 14, name: "Route Setters Anon", tier: "Supporter", size: "1x1" },
  { id: 15, name: "Recovery Plus", tier: "Supporter", size: "1x1" },
  { id: 16, name: "Explore More", tier: "Gold", size: "2x1" },
  { id: 17, name: "Mountain Ready", tier: "Supporter", size: "1x1" },
  { id: 18, name: "Basecamp Provisions", tier: "Supporter", size: "1x1" },
];

// --- Main Page Component ---

export default function ParaclimberSite() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      
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
             <span>Fré.Climbs</span>
          </div>

          {/* Desktop Nav */}
          <div className={cn(
            "hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-widest transition-colors",
            isScrolled ? "text-black" : "text-white"
          )}>
            <button onClick={() => scrollToSection('about')} className="hover:opacity-60 transition-opacity">Mijn verhaal</button>
            <button onClick={() => scrollToSection('nonprofit')} className="hover:opacity-60 transition-opacity">Community</button>
            <button onClick={() => scrollToSection('journey')} className="hover:opacity-60 transition-opacity">Journey</button>
            <button onClick={() => scrollToSection('media')} className="hover:opacity-60 transition-opacity">Pers/Media</button>
            <button onClick={() => scrollToSection('sponsors')} className="hover:opacity-60 transition-opacity">Supporters</button>
            <Button 
              onClick={() => scrollToSection('contact')} 
              variant={isScrolled ? 'primary' : 'white'}
              className="h-10 px-6 text-xs ml-4"
            >
              Contact
            </Button>
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
             <button onClick={() => scrollToSection('sponsors')} className="text-left hover:opacity-60">Supporters</button>
             <Button onClick={() => scrollToSection('contact')} className="w-full">Partner With Me</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Video Fade */}
      <section className="relative h-screen flex items-center bg-black text-white px-4 md:px-8 overflow-hidden">
        
        {/* 1. The Static Image Background (FINAL STATE) - z-0 puts it at the bottom */}
        <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1522163182402-834f871fd851?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80')] bg-cover bg-center grayscale mix-blend-screen z-0" />

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
              DEFY<br />GRAVITY.
            </h1>
            <p className="text-xl text-zinc-400 max-w-lg leading-relaxed mb-12">
              I'm Fré Leys. Belgian Paraclimber. <br/>
              Fighting for gold, one hold at a time.
            </p>
            <div className="flex flex-wrap gap-6">
              <Button onClick={() => scrollToSection('journey')} variant="white" className="min-w-[160px]">
                The Roadmap
              </Button>
              <button onClick={() => scrollToSection('about')} className="group flex items-center gap-3 text-sm font-bold uppercase tracking-widest hover:text-zinc-300 transition-colors">
                My Story <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Corner Stats */}
        <div className="absolute bottom-8 right-4 md:right-8 hidden md:flex gap-12 text-right z-30">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Category</div>
            <div className="text-3xl font-bold">AL-2</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Rank</div>
            <div className="text-3xl font-bold">#2</div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5">
              <div className="aspect-[3/4] bg-zinc-100 relative overflow-hidden">
                 <Image 
                   src="/images/me/nakajima_timmerman_Ifsc_FSC121816.jpg"
                   alt="Fré Leys Portrait"
                   fill
                   className="object-cover"
                   priority
                 />
              </div>
            </div>
            <div className="lg:col-span-7">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-12">
                MORE THAN CLIMBING.
              </h2>
              <div className="space-y-8 text-lg lg:text-xl leading-relaxed text-zinc-600 max-w-2xl">
                <p>
                  Born in Ghent, my life changed after a motorcycle accident in 2018. For many, that's the end. For me, it was a rebirth.
                </p>
                <p>
                  <strong className="text-black">Paraclimbing gave me purpose.</strong> The wall doesn't care about what you're missing; it only cares about what you have left to give.
                </p>
                <p>
                  Now, my eyes are set on one goal: The Los Angeles 2028 Paralympics. It's a 4-year roadmap of grueling training and unwavering discipline.
                </p>
                <p>
                   
                </p>
              </div>

              <div className="mt-12">
                <Button 
                  onClick={() => window.location.href = '/story'} 
                  variant="outline" 
                  className="mb-16"
                >
                  Read My Full Story <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-8 pt-16 border-t border-zinc-100">
                <div>
                  <Award className="w-8 h-8 mb-4" />
                  <div className="text-3xl font-bold">6</div>
                  <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mt-1">Podiums</div>
                </div>
                <div>
                  <TrendingUp className="w-8 h-8 mb-4" />
                  <div className="text-3xl font-bold">7c</div>
                  <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mt-1">Top Grade</div>
                </div>
                <div>
                  <MapPin className="w-8 h-8 mb-4" />
                  <div className="text-3xl font-bold">BEL</div>
                  <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mt-1">Team</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Non-Profit / Community Section */}
      <section id="nonprofit" className="py-32 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 text-white font-bold uppercase tracking-widest mb-8 text-xs border border-zinc-800 px-4 py-2">
                  <Heart className="w-4 h-4 fill-white" /> Paraclimbing.be VZW
              </div>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8">
                PARACLIMBING<br/>.BE
              </h2>
              <p className="text-2xl font-bold text-white mb-8 leading-tight">
                Climbing is more than a sport; it's a pathway to rediscovering strength.
              </p>
              <div className="space-y-6 text-lg text-zinc-400 leading-relaxed mb-12">
                <p>
                  I founded <strong>paraclimbing.be</strong> with a simple mission: to ensuring every person with a physical disability in Belgium has the opportunity to experience the vertical world. 
                </p>
                <p>
                  We organize initiation days, provide specialized adaptive equipment to gyms, and are building a community that defies limitations.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                 <div className="border border-zinc-800 p-6 text-center">
                    <Users className="w-8 h-8 mx-auto mb-4" />
                    <div className="font-bold uppercase tracking-widest text-xs">Community</div>
                 </div>
                 <div className="border border-zinc-800 p-6 text-center">
                    <Mountain className="w-8 h-8 mx-auto mb-4" />
                    <div className="font-bold uppercase tracking-widest text-xs">Discovery</div>
                 </div>
                 <div className="border border-zinc-800 p-6 text-center">
                    <TrendingUp className="w-8 h-8 mx-auto mb-4" />
                    <div className="font-bold uppercase tracking-widest text-xs">Growth</div>
                 </div>
              </div>

              <Button variant="white" onClick={() => window.open('https://paraclimbing.be', '_blank')} className="w-full sm:w-auto">
                Visit Paraclimbing.be <ArrowUpRight className="ml-2 w-4 h-4" />
              </Button>
            </div>

            <div className="order-1 lg:order-2 relative aspect-square bg-zinc-900 border border-zinc-800 grayscale overflow-hidden">
              {/* Image placeholder for a workshop/community event */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-700 p-8 text-center">
                <Users className="w-16 h-16 mb-6 opacity-20" />
                <span className="font-bold tracking-widest uppercase text-sm">
                  [Initiation Day Photo]
                </span>
              </div>
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
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
                Supporters
              </div>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter">
                TEAM 2028.
              </h2>
            </div>
            <Button onClick={() => scrollToSection('contact')} className="shrink-0">
              Become a sponsor
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-0 grid-flow-dense border border-zinc-200 bg-white">
            {SPONSORS_GRID.map((sponsor) => (
              <div 
                key={sponsor.id} 
                className={cn(
                  "relative group aspect-square bg-white outline outline-1 outline-zinc-100 overflow-hidden",
                  sponsor.size === '2x2' && "col-span-2 row-span-2",
                  sponsor.size === '2x1' && "col-span-2 row-span-1 aspect-auto",
                )}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 grayscale group-hover:grayscale-0 transition-all duration-500">
                   <div className="w-full h-full flex items-center justify-center text-zinc-300 font-bold uppercase tracking-widest text-center text-xs md:text-sm">
                      {sponsor.size === '1x1' ? 'Logo' : sponsor.name}
                   </div>
                </div>

                <div className="absolute inset-0 bg-black/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center">
                  <p className="text-white font-bold uppercase tracking-wider mb-2">
                    {sponsor.name}
                  </p>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest border border-zinc-700 px-2 py-1">
                    {sponsor.tier}
                  </span>
                </div>
              </div>
            ))}
            
            {[...Array(6)].map((_, i) => (
              <div key={`filler-${i}`} className="aspect-square bg-zinc-50/50 outline outline-1 outline-zinc-100 flex items-center justify-center">
                <span className="text-zinc-300 text-[10px] uppercase tracking-widest">Open Slot</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 bg-white">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">PARTNER WITH ME.</h2>
            <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
              Elite paraclimbing requires elite support. Join the team and champion resilience on the global stage.
            </p>
          </div>

          <div className="bg-white p-8 md:p-16 shadow-xl shadow-zinc-100/50 border border-zinc-100">
            <form className="space-y-8">
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 group-focus-within:text-black transition-colors">Name</label>
                    <input type="text" className="w-full py-3 bg-transparent border-b border-zinc-200 focus:border-black focus:outline-none transition-colors text-lg" placeholder="John Doe" />
                  </div>
                  <div className="group">
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 group-focus-within:text-black transition-colors">Email</label>
                    <input type="email" className="w-full py-3 bg-transparent border-b border-zinc-200 focus:border-black focus:outline-none transition-colors text-lg" placeholder="john@company.com" />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 group-focus-within:text-black transition-colors">Inquiry Type</label>
                  <select className="w-full py-3 bg-transparent border-b border-zinc-200 focus:border-black focus:outline-none transition-colors text-lg appearance-none rounded-none">
                    <option>Sponsorship</option>
                    <option>Non-Profit / Paraclimbing.be</option>
                    <option>Media Request</option>
                    <option>General</option>
                  </select>
                </div>
                <div className="group">
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 group-focus-within:text-black transition-colors">Message</label>
                  <textarea rows={4} className="w-full py-3 bg-transparent border-b border-zinc-200 focus:border-black focus:outline-none transition-colors text-lg resize-none" placeholder="How can we work together?"></textarea>
                </div>
              </div>

              <Button type="submit" className="w-full">
                Send Inquiry
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
            <span>Fré.Climbs</span>
          </div>
          
          <div className="flex gap-8 text-zinc-400">
            <a href="https://www.instagram.com/fre.climbs" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors"><Instagram className="w-5 h-5" /></a>
            <a href="https://twitter.com/fre.climbs" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="mailto:contact@freleys.com" className="hover:text-black transition-colors"><Mail className="w-5 h-5" /></a>
          </div>

          <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            © 2025 Fré Leys
          </div>
        </div>
      </footer>
    </div>
  )
}
