import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { 
  Mountain, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Download, 
  Award, 
  ChevronRight, 
  ChevronLeft,
  Check, 
  Dumbbell, 
  Layers, 
  RotateCw, 
  Scale, 
  Package, 
  Truck, 
  HeartHandshake, 
  Tag, 
  Building2, 
  Mail, 
  ArrowLeft,
  Flame,
  HelpCircle,
  ExternalLink,
  AlertCircle,
  Play,
  Video,
  Camera,
  Film,
  Sliders,
  Compass,
  Activity,
  Lightbulb,
  Trophy,
  Users,
  GraduationCap,
  Instagram,
  Heart
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import {
  trackSloperKingView,
  trackSloperKingVideo,
  trackSloperKingSelect,
  trackSloperKingCheckout,
  trackSloperKingPurchase
} from '@/lib/analytics';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function BambumPage() {
  const router = useRouter();
  const { status } = router.query;
  const orderSectionRef = useRef<HTMLDivElement>(null);
  const videoSectionRef = useRef<HTMLDivElement>(null);

  // Video state
  const [isPlayingDummy, setIsPlayingDummy] = useState<boolean>(false);

  // Order state
  const [itemType, setItemType] = useState<'pair' | 'single'>('pair');
  const [quantity, setQuantity] = useState<number>(1);
  const [shippingZone, setShippingZone] = useState<'pickup' | 'be' | 'eu'>('be');
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponApplied, setCouponApplied] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [isLoadingCheckout, setIsLoadingCheckout] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Maker STL download state
  const [stlEmail, setStlEmail] = useState<string>('');
  const [stlDownloaded, setStlDownloaded] = useState<boolean>(false);
  const [stlLoading, setStlLoading] = useState<boolean>(false);

  // Active training tab
  const [activeMethod, setActiveMethod] = useState<'cable' | 'pickup' | 'bar' | 'warmup'>('cable');

  // Carousel ref & scroll
  const carouselScrollRef = useRef<HTMLDivElement>(null);
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselScrollRef.current) {
      const scrollAmount = carouselScrollRef.current.clientWidth * 0.75;
      carouselScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const communityPosts = [
    {
      id: 1,
      handle: '@sam_climber',
      name: 'Sam V.',
      role: 'Boulderer (V8/7B+)',
      location: 'Boulder Klup, Leuven',
      protocol: 'Cable Machine 4x7s Repeater',
      quote: 'The active wrist pump after a 4-set repeater is wild. Never felt my forearms activate like this on standard hangboards.',
      placeholderText: 'PHOTO PLACEHOLDER: Action shot gripping Sloper King on cable pulley at 30kg load with chalk dust.',
      tags: ['#sloperking', '#bouldering', '#pumptraining'],
      likes: 142,
      time: '3d ago',
    },
    {
      id: 2,
      handle: '@elena.outdoors',
      name: 'Elena D.',
      role: 'Bleau Boulderer',
      location: 'Fontainebleau, France',
      protocol: 'Foot-Loop Crag Warmup',
      quote: 'Under 100g so it lives in my chalk bag. Warmed up on slopers right at the boulders in Franchard before projecting.',
      placeholderText: 'PHOTO PLACEHOLDER: Outdoor session pulling against foot-loop cord in the Fontainebleau forest.',
      tags: ['#sloperking', '#fontainebleau', '#cragwarmup'],
      likes: 289,
      time: '1w ago',
    },
    {
      id: 3,
      handle: '@alex_paraclimb',
      name: 'Alex M.',
      role: 'Adaptive Climber',
      location: 'Innsbruck, Austria',
      protocol: 'Tendon-Safe Rehab Pulls',
      quote: 'Coming back from an A2 pulley tweak. Sloper King lets me train intense forearm endurance with 0% pulley shear stress.',
      placeholderText: 'PHOTO PLACEHOLDER: Gym workout with loading pin and 20kg bumper plate, focusing on wrist flexion.',
      tags: ['#sloperking', '#paraclimbing', '#tendonsafe'],
      likes: 215,
      time: '2w ago',
    },
    {
      id: 4,
      handle: '@routesetter_marc',
      name: 'Marc T.',
      role: 'Commercial Route Setter',
      location: 'Brussels, Belgium',
      protocol: '5-Angle Cantilever Testing',
      quote: 'The 5 angle settings let us match the exact slope of comp fiberglass volumes during test climbs.',
      placeholderText: 'PHOTO PLACEHOLDER: Adjusting cord position on notch 4 before testing compression strength.',
      tags: ['#sloperking', '#routesetting', '#compclimbing'],
      likes: 178,
      time: '2w ago',
    },
    {
      id: 5,
      handle: '@sarah.beta',
      name: 'Sarah K.',
      role: 'Lead Climber (8a)',
      location: 'Klimax, Puurs',
      protocol: 'Bilateral Pair Compression',
      quote: 'Grabbed the complete pair. Doing dual-handed isometric lock-offs while timing intervals on the timer app.',
      placeholderText: 'PHOTO PLACEHOLDER: Dual Sloper Kings hung from pullup bar, dual-hand compression hold.',
      tags: ['#sloperking', '#climbingtraining', '#endurance'],
      likes: 310,
      time: '3w ago',
    },
    {
      id: 6,
      handle: '@boulder_dan',
      name: 'Dan P.',
      role: 'Gym Climber',
      location: 'Ghent, Belgium',
      protocol: 'GoldX 220-Grit Grip Test',
      quote: 'The 220-grit high-friction contact strips give realistic hold feel. Unlocks friction power I never knew I had.',
      placeholderText: 'PHOTO PLACEHOLDER: Close-up of open palm wrapping around the curved sloper surface with mascot crown.',
      tags: ['#sloperking', '#boulderlife', '#climbinggear'],
      likes: 95,
      time: '4w ago',
    },
  ];

  // Track pageview on load
  useEffect(() => {
    trackSloperKingView();
  }, []);

  // Track Stripe purchase return
  useEffect(() => {
    if (router.isReady && (status === 'success' || status === 'demo_success')) {
      const sessionId = (router.query.session_id as string) || `order_${Date.now()}`;
      const returnedType = (router.query.type as string) || itemType;
      const paidAmount = Number(router.query.amount) || (returnedType === 'pair' ? 44.95 + 3.99 : 24.95 + 3.99);
      trackSloperKingPurchase(sessionId, returnedType, paidAmount, shippingZone);
    }
  }, [router.isReady, status]);

  // Pricing calculation
  const basePrice = itemType === 'pair' ? 44.95 : 24.95;
  let discountAmount = 0;
  if (couponApplied === 'FOUNDER25' || couponApplied === 'LAUNCH25') {
    discountAmount = basePrice * 0.25;
  } else if (couponApplied === 'FRIENDS29' && itemType === 'pair') {
    discountAmount = 10.00;
  }

  const unitPriceAfterDiscount = Math.max(5.00, basePrice - discountAmount);
  const subtotal = unitPriceAfterDiscount * quantity;
  
  let shippingCost = 3.99;
  if (shippingZone === 'pickup') shippingCost = 0.00;
  if (shippingZone === 'eu') shippingCost = 4.99;

  const grandTotal = subtotal + shippingCost;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (clean === 'FOUNDER25' || clean === 'LAUNCH25' || (clean === 'FRIENDS29' && itemType === 'pair')) {
      setCouponApplied(clean);
      setCheckoutError(null);
    } else {
      setCheckoutError('Invalid coupon code or not applicable to this item.');
    }
  };

  const handleCheckout = async () => {
    setIsLoadingCheckout(true);
    setCheckoutError(null);
    trackSloperKingCheckout(itemType, quantity, grandTotal, shippingZone);
    try {
      const res = await fetch('/api/bambum/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemType,
          quantity,
          shippingZone,
          couponCode: couponApplied || couponCode,
          email,
          customerName,
          originUrl: window.location.origin,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize payment session.');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setCheckoutError(err.message || 'Could not load checkout. Please try again.');
      setIsLoadingCheckout(false);
    }
  };

  const handleStlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stlEmail) return;
    setStlLoading(true);
    try {
      await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: stlEmail, source: 'bambum_sloperking_stl_download' }),
      }).catch(() => {});
      
      setStlDownloaded(true);
      setStlLoading(false);
    } catch {
      setStlDownloaded(true);
      setStlLoading(false);
    }
  };

  const scrollToOrder = () => {
    if (orderSectionRef.current) {
      orderSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToVideo = () => {
    trackSloperKingVideo('video_btn_click');
    if (videoSectionRef.current) {
      videoSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-amber-400 selection:text-black">
      <Head>
        <title>Sloper King™ by BamBum | The Biomechanical Sloper & Pump Trainer</title>
        <meta 
          name="description" 
          content="Sloper King™ is the innovative, biomechanically engineered climbing tool (<100g) designed by Fré Leys (PhD.). Train the 4 forearm and wrist muscles that hangboards forget." 
        />
        <meta property="og:title" content="Sloper King™ by BamBum | By Fré Leys (PhD.)" />
        <meta property="og:description" content="Master open slopers and delay forearm pump with the Sloper King. 800kg load cord, 5 cantilever angles, <100g." />
        <meta property="og:image" content="https://www.fre2028.la/images/sloperking-label.svg" />
        <meta property="og:url" content="https://www.fre2028.la/bambum" />
        <link rel="canonical" href="https://www.fre2028.la/bambum" />
      </Head>

      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => router.push('/')}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-950 transition-colors py-1"
              title="Back to Fré2028.LA"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline tracking-wider uppercase text-[11px]">Fré2028.LA</span>
            </button>

            <div className="h-4 w-px bg-slate-200" />

            <div className="flex items-center gap-2 font-black tracking-tight text-lg text-slate-950">
              <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.5 rounded font-black tracking-widest uppercase">BAMBUM</span>
              <span>SLOPER KING<span className="text-amber-500 font-bold text-xs align-super ml-0.5">TM</span></span>
            </div>
          </div>

          {/* Clean, single-line desktop navigation */}
          <div className="hidden md:flex items-center gap-5 lg:gap-7 text-xs font-semibold text-slate-600">
            <a href="#video-deepdive" className="hover:text-amber-600 transition-colors flex items-center gap-1.5 whitespace-nowrap">
              <Film className="w-3.5 h-3.5 text-amber-500" />
              <span>15-Min Docu</span>
            </a>
            <a href="#fre" className="hover:text-amber-600 transition-colors whitespace-nowrap">Fré</a>
            <a href="#story" className="hover:text-amber-600 transition-colors whitespace-nowrap">Story</a>
            <a href="#biomechanics" className="hover:text-amber-600 transition-colors whitespace-nowrap">Biomechanics</a>
            <a href="#specs" className="hover:text-amber-600 transition-colors whitespace-nowrap">Specs</a>
            <a href="#training" className="hover:text-amber-600 transition-colors whitespace-nowrap">Training Methods</a>
            <a href="#community" className="hover:text-amber-600 transition-colors whitespace-nowrap">Community</a>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={scrollToOrder}
              className="inline-flex items-center gap-2 bg-slate-950 text-white hover:bg-amber-500 hover:text-slate-950 px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-xs md:text-sm font-extrabold tracking-wide transition-all shadow-md active:scale-95 whitespace-nowrap"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Order Now — From €24.95</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28 bg-gradient-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headlines & Value Prop */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Developed by Fré Leys</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-slate-800 leading-[1.1]">
                Train the <strong className="font-black text-slate-950">strength</strong> <br />
                that <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700">hangboards forget.</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-700 leading-relaxed max-w-2xl font-normal">
                Traditional hangboards focus 100% on crimps (2 finger flexors). <strong>Sloper King™</strong> is the ultra-lightweight (<span className="text-slate-950 font-bold">&lt;100g</span>) biomechanical trainer that activates all <strong>4 primary forearm and wrist flexors</strong> to dominate open slopers and delay forearm pump — without overloading your finger pulleys.
              </p>

              {/* USP Quick Pill Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
                  <div className="text-amber-600 font-extrabold text-lg sm:text-xl">4</div>
                  <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider leading-tight">Muscles Active</div>
                </div>
                <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
                  <div className="text-emerald-700 font-extrabold text-lg sm:text-xl whitespace-nowrap">Pulley Safe</div>
                  <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider leading-tight">0% Joint Strain</div>
                </div>
                <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
                  <div className="text-amber-600 font-extrabold text-lg sm:text-xl">5 Angles</div>
                  <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider leading-tight">Adjustable Difficulty</div>
                </div>
                <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
                  <div className="text-slate-950 font-extrabold text-lg sm:text-xl">&lt; 100g</div>
                  <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider leading-tight">Pocket Size</div>
                </div>
              </div>

              {/* Watch Video CTA */}
              <div className="pt-2">
                <button
                  onClick={scrollToVideo}
                  className="inline-flex items-center justify-center gap-2.5 bg-slate-50 text-slate-950 border border-slate-900 hover:bg-slate-100 hover:border-black px-6 py-3.5 rounded-xl text-sm md:text-base font-extrabold transition-all shadow-sm hover:shadow active:scale-95 group"
                >
                  <div className="w-7 h-7 rounded-full bg-amber-400 border border-amber-500 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-110 transition-transform">
                    <Play className="w-3.5 h-3.5 text-slate-950 fill-slate-950 ml-0.5" />
                  </div>
                  <span>Watch the 15-Min Breakdown Video</span>
                </button>
              </div>

            </div>

            {/* Right Column: Visual Hero Mockup & Placeholders */}
            <div className="lg:col-span-5 space-y-3">
              <div className="relative mx-auto max-w-md bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-xl">
                
                {/* Image Placeholder: Hero Product In Hand */}
                <div className="mb-6 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-4 text-left relative overflow-hidden">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900 uppercase tracking-wider mb-1.5">
                    <Camera className="w-4 h-4 text-amber-600" />
                    <span>PHOTO PLACEHOLDER • HERO PRODUCT SHOT</span>
                  </div>
                  <div className="text-xs text-slate-700 leading-relaxed">
                    <strong>What to showcase here:</strong> Clean close-up action photo of Fré gripping the Sloper King on the climbing wall or cable machine, highlighting active wrist flexion, deep forearm muscle tension, and the matte black finish with yellow mascot crown.
                  </div>
                </div>

                <div className="space-y-3 text-left">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-extrabold text-lg text-slate-950">Sloper King™</h3>
                      <p className="text-xs text-slate-500">Single piece (€24.95) or Pair with pouch (€44.95)</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-slate-950">From €24.95</div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">In stock</span>
                    </div>
                  </div>

                  <ul className="text-xs space-y-2 text-slate-700">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-500 shrink-0" />
                      <span><strong>Single Unit (€24.95):</strong> 1x Sloper King + 800kg cord + Guide</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-500 shrink-0" />
                      <span><strong>Complete Pair (€44.95):</strong> 2x units + 2x cords + Cotton Pouch + Guide</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>CROP GoldX 220-grit high-friction contact strips</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>5 adjustable difficulty angles on every unit</span>
                    </li>
                  </ul>

                  <button
                    onClick={scrollToOrder}
                    className="w-full mt-4 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black py-3 rounded-xl text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Choose Single or Pair — Order Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Shipping & Trust info under product card */}
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-500 max-w-md mx-auto px-2">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Free local pickup in Leuven</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>BE €3.99 | EU €4.99 Tracked</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Made in Belgium</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 15-Minute Long-Form YouTube Deep-Dive Section */}
      <section ref={videoSectionRef} id="video-deepdive" className="py-20 md:py-28 bg-slate-950 text-white border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 md:px-8 text-center space-y-8">
          
          <div className="space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-widest">
              <Film className="w-3.5 h-3.5 text-amber-400" />
              <span>15-MINUTE MASTERCLASS & ORIGIN DOCU</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Why Slopers Feel Impossible <br className="hidden sm:inline" />
              <span className="text-amber-400">& How I Accidentally Engineered the Ultimate Pump Trainer</span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
              Watch the complete 15-minute breakdown where Fré Leys (PhD.) breaks down sloper biomechanics, shows the 100kg break test, and explains cable-machine endurance protocols.
            </p>
          </div>

          {/* Video Player Container */}
          <div className="relative rounded-3xl overflow-hidden border-2 border-slate-700 bg-slate-900 shadow-2xl group">
            
            {/* Video Aspect Ratio Box */}
            <div className="relative aspect-video w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
              
              {/* Background Thumbnail Image Mock */}
              <div className="absolute inset-0 opacity-40 mix-blend-luminosity">
                <img 
                  src="/images/web/20240625_innsbruck_Drapella_web.webp" 
                  alt="YouTube Video Thumbnail Placeholder" 
                  className="w-full h-full object-cover" 
                />
              </div>

              {/* YouTube-like Duration Badge */}
              <div className="absolute bottom-4 right-4 bg-black/85 text-white font-mono text-xs px-2.5 py-1 rounded font-bold tracking-wider">
                14:48 • 4K UHD
              </div>

              {/* Centered Play Trigger & Video Placeholder UI */}
              <div className="relative z-10 text-center space-y-4 px-6 max-w-2xl">
                <button 
                  onClick={() => setIsPlayingDummy(!isPlayingDummy)}
                  className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all group-hover:bg-amber-300"
                >
                  <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-slate-950 ml-1" />
                </button>

                <div className="space-y-1.5">
                  <div className="text-xs uppercase tracking-widest font-extrabold text-amber-400">
                    [ YOUTUBE VIDEO PLACEHOLDER ]
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    "The Biomechanics of Slopers vs. Crimps (And the Tool I Built)"
                  </h3>
                  <p className="text-xs text-slate-300">
                    Click to view the video chapters and director's structure.
                  </p>
                </div>
              </div>

            </div>

            {/* Video Chapters Breakdown Banner */}
            <div className="bg-slate-900/95 border-t border-slate-800 p-6 text-left grid sm:grid-cols-2 md:grid-cols-5 gap-4 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-amber-400 font-bold font-mono text-[11px]">0:00 - 3:15</div>
                <div className="font-extrabold text-white mt-0.5">1. The World Cup Failure</div>
                <div className="text-slate-400 text-[10px]">Pumping out on 3 slopers vs 2nd place in Quali 2.</div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-amber-400 font-bold font-mono text-[11px]">3:15 - 6:40</div>
                <div className="font-extrabold text-white mt-0.5">2. Biomechanics Gap</div>
                <div className="text-slate-400 text-[10px]">Why hangboards only isolate 2 muscles instead of 4.</div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-amber-400 font-bold font-mono text-[11px]">6:40 - 9:50</div>
                <div className="font-extrabold text-white mt-0.5">3. 3D & 800kg Test</div>
                <div className="text-slate-400 text-[10px]">Decoupling load to the semi-static cord.</div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-amber-400 font-bold font-mono text-[11px]">9:50 - 13:10</div>
                <div className="font-extrabold text-white mt-0.5">4. The Pump Discovery</div>
                <div className="text-slate-400 text-[10px]">Gym cable machine protocol & deep fatigue.</div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-amber-400 font-bold font-mono text-[11px]">13:10 - 14:48</div>
                <div className="font-extrabold text-white mt-0.5">5. Gym Reactions</div>
                <div className="text-slate-400 text-[10px]">Live tester feedback in Boulder Leuven + CTA.</div>
              </div>
            </div>

          </div>

          {/* Director's Note Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-left text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold uppercase tracking-wider">
              <Video className="w-4 h-4" />
              <span>DIRECTOR'S NOTE FOR YOUTUBE VIDEO 1</span>
            </div>
            <p className="leading-relaxed text-slate-400">
              <strong>Once you have filmed and uploaded the 15-minute video to YouTube:</strong> replace the placeholder with a responsive <code>&lt;iframe src="https://www.youtube.com/embed/YOUR_VIDEO_ID"&gt;</code>. Anyone scanning the QR code in climbing gyms will immediately view this video in 4K.
            </p>
          </div>

        </div>
      </section>

      {/* About Fré Section */}
      <section id="fre" className="py-20 md:py-28 bg-white text-slate-950 border-b border-slate-200 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 items-stretch">
            
            {/* Left Column: Image with badges */}
            <div className="lg:col-span-5 relative flex flex-col">
              <div className="relative w-full h-full min-h-[400px] aspect-[4/5] lg:aspect-auto rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-slate-100 group">
                <Image
                  src="/images/innsbruck_victory_4x5.jpg"
                  alt="Fré Leys (PhD.) - Para Climber, Inventor & Engineer"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 40vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/15 to-transparent" />
                
                {/* Top-Left Badge: Inventor */}
                <div className="absolute top-4 left-4 z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-amber-400 font-extrabold text-[11px] tracking-wider uppercase shadow-md">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span>Inventor</span>
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6 text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] tracking-wider uppercase mb-2 shadow-md">
                    <Award className="w-3.5 h-3.5" />
                    2x World Cup Gold Medalist
                  </div>
                  <div className="text-2xl font-black text-white tracking-tight">Fré Leys (PhD.)</div>
                  <div className="text-xs text-slate-200 font-medium mt-0.5">Belgian Para Climbing Team • Road to LA 2028</div>
                </div>
              </div>
            </div>

            {/* Right Column: Roles & Credentials */}
            <div className="lg:col-span-7 space-y-4 text-left flex flex-col justify-between">
              {/* 4 Pillars Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                
                {/* 1. Inventor */}
                <div className="p-5 rounded-2xl bg-white border border-amber-400 shadow-sm hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 mb-3">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-950">Inventor</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Founder of BamBum. Bambum designs, prototypes and produces smart athletic hardware and software training tools that solve real performance bottlenecks.
                  </p>
                </div>

                {/* 2. Para Climber */}
                <div className="p-5 rounded-2xl bg-white border border-amber-400 shadow-sm hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 mb-3">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-950">Para Climber</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    2x IFSC World Cup Gold Medalist and Belgian National Team athlete competing at the highest international level aiming for the 2028 Paralympics.
                  </p>
                </div>

                {/* 3. Athlete Representative */}
                <div className="p-5 rounded-2xl bg-white border border-amber-400 shadow-sm hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 mb-3">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-950">Athlete Representative</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Official World Climbing Athlete Representative. Giving a global voice to athletes and actively shaping the future of competitive Para Climbing.
                  </p>
                </div>

                {/* 4. PhD in Mechanics */}
                <div className="p-5 rounded-2xl bg-white border border-amber-400 shadow-sm hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 mb-3">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-950">PhD in Mechanics</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    PhD in Mechanical Engineering from KU Leuven. Specialized in robotics, mechanism design, kinematics, and the mechanical modeling of biological systems.
                  </p>
                </div>

              </div>

              {/* Mission & Paralympics 2028 Callout Banner */}
              <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-300 flex items-start gap-4 shadow-sm">
                <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl shrink-0 mt-0.5 shadow-md">
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-black text-slate-950 flex items-center gap-2 flex-wrap">
                    <span>Direct Funding for LA 2028 Paralympics</span>
                    <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded bg-amber-200 text-amber-950 border border-amber-300">Historic Paralympic Debut</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    100% of all profits from Sloper King™ directly fund Fré’s international qualification campaign and coaching for the <strong>LA 2028 Paralympic Games</strong> — marking the <strong>historic first time Para Climbing is an official Paralympic sport</strong>.
                  </p>
                </div>
              </div>

              {/* Link to main site */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a
                  href="https://fre2028.la"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 text-white hover:bg-amber-500 hover:text-slate-950 font-extrabold text-xs tracking-wide transition-all shadow-md active:scale-95"
                >
                  <span>Explore Fré's Road to LA 2028</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <span className="text-xs text-slate-500">
                  Follow the journey, engineering projects &amp; international competitions
                </span>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* The Origin Story Section */}
      <section id="story" className="py-20 md:py-28 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-left space-y-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-700 bg-amber-100 border border-amber-300 px-3 py-1 inline-block rounded-full">
              THE ORIGIN STORY
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
              How a Brutal World Championship Failure Led to an Engineering Breakthrough.
            </h2>
          </div>

          {/* Action Image Placeholder: WK Climbing Route */}
          <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-left relative overflow-hidden">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
              <Camera className="w-4 h-4 text-amber-600" />
              <span>PHOTO PLACEHOLDER • 2025 WORLD CHAMPIONSHIPS ACTION SHOT</span>
            </div>
            <div className="text-xs text-slate-600 leading-relaxed">
              <strong>What to showcase here:</strong> High-intensity competition photo of Fré on the competition wall during a World Cup or World Championship route to immediately anchor the athletic context.
            </div>
          </div>

          <div className="prose prose-slate lg:prose-lg max-w-none space-y-6 text-slate-700">
            <div className="bg-slate-50 border-l-4 border-amber-500 p-6 md:p-8 rounded-r-2xl shadow-sm not-prose">
              <p className="text-lg md:text-xl font-medium text-slate-900 italic leading-relaxed">
                "At the 2025 Para Climbing World Championships, I was in peak physical shape and climbing stronger than ever. But in the first qualification route, three consecutive open slopers shut me down. My forearms pumped out completely, my fingers peeled off millimeter by millimeter, and I fell: 11th place. In the second route, I placed 2nd and made finals. But the lesson was unmistakable: on open slopers, I was vulnerable."
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="font-extrabold text-sm text-slate-950">Fré Leys (PhD.)</div>
                <div className="text-xs text-slate-500">• 2x World Cup Gold Medalist, KU Leuven Mechanical Engineering PhD</div>
              </div>
            </div>

            <p className="text-base md:text-lg leading-relaxed">
              As an engineer and an elite athlete, I refused to just accept that limitation. Why was my performance on <em>crimps</em> world-class, while I struggled on <em>slopers</em>?
            </p>

            <p className="text-base md:text-lg leading-relaxed">
              The answer was in the training tools: I had spent years training on standard hangboards and Kilterboards. But those tools isolate the fingers in a closed crimp position. When I sat down to model the biomechanics, the anatomical blind spot became obvious.
            </p>
          </div>

        </div>
      </section>

      {/* Biomechanics Breakdown Section */}
      <section id="biomechanics" className="py-20 md:py-28 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-700 bg-amber-100 border border-amber-300 px-3 py-1 inline-block rounded-full">
              SCIENCE & ANATOMY
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
              Why Slopers Demand 4 Muscles &amp; Full Forearm Contraction
            </h2>
            <p className="text-base md:text-lg text-slate-600">
              Traditional hangboards only load your finger flexors on crimps with a passive wrist. Sloper King™ trains your finger flexors while actively contracting both wrist flexors across all 4 primary muscles simultaneously.
            </p>
          </div>

          {/* Anatomy Graphic Placeholder */}
          <div className="max-w-4xl mx-auto mb-12 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/60 p-6 text-left">
            <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900 uppercase tracking-wider mb-1">
              <Camera className="w-4 h-4 text-amber-600" />
              <span>ILLUSTRATION / 3D ANATOMY GRAPHIC PLACEHOLDER</span>
            </div>
            <div className="text-xs text-slate-700 leading-relaxed">
              <strong>What to showcase here:</strong> Forearm anatomical cross-section diagram comparing isolated finger flexors (FDP/FDS) with active wrist flexors (FCR/FCU) contracting during an open sloper grip.
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* Box 1: Crimp */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-sm text-left relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full inline-block mb-4">
                  Traditional Hangboard (Crimp)
                </div>
                <h3 className="text-2xl font-black text-slate-950 mb-3">Only 2 Muscles (Passive Wrist)</h3>
                <p className="text-sm text-slate-600 mb-6">
                  Fingers hook onto edges with an extended/passive wrist, leaving the wrist flexors completely disengaged.
                </p>

                <div className="space-y-3 text-xs font-medium text-slate-700">
                  <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center font-bold shrink-0">1</span>
                    <div>
                      <strong>Flexor digitorum profundus (FDP)</strong>
                      <div className="text-slate-500 text-[11px]">Flexes fingertips on crimp edges.</div>
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center font-bold shrink-0">2</span>
                    <div>
                      <strong>Flexor digitorum superficialis (FDS)</strong>
                      <div className="text-slate-500 text-[11px]">Flexes middle joints on crimp edges.</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-amber-50/70 rounded-lg border border-amber-200 text-xs text-amber-900 leading-relaxed">
                  <strong>The Joint-Angle Blindspot:</strong> Muscle strength is joint-angle specific. Strength gained holding edges with an extended wrist has near-zero carryover to the active wrist contraction needed on slopers.
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-rose-700 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>High peak shear stress on A2/A4 finger pulleys (injury prone).</span>
              </div>
            </div>

            {/* Box 2: Sloper King */}
            <div className="bg-slate-50 p-8 rounded-2xl border-2 border-amber-400 shadow-md text-left relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-amber-900 bg-amber-200 px-3 py-1 rounded-full inline-block mb-4">
                  Sloper King™ Activation
                </div>
                <h3 className="text-2xl font-black text-slate-950 mb-3">All 4 Muscles (Active Contraction)</h3>
                <p className="text-sm text-slate-600 mb-6">
                  Engages finger flexors while actively contracting both wrist flexors inward to generate true sloper friction.
                </p>

                <div className="space-y-2.5 text-xs font-medium text-slate-700">
                  <div className="p-2.5 bg-white rounded-lg border border-amber-200 flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div><strong>1. FDP (Finger Flexor):</strong> Active finger grip tension</div>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-amber-200 flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div><strong>2. FDS (Finger Flexor):</strong> Deep isometric hold tension</div>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-amber-200 flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div><strong>3. Flexor carpi radialis (FCR):</strong> Actively contracts thumb-side wrist flexor</div>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-amber-200 flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div><strong>4. Flexor carpi ulnaris (FCU):</strong> Actively contracts pinky-side wrist flexor</div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-950 leading-relaxed">
                  <strong>Direct Sloper Transfer:</strong> Training finger flexors alongside active wrist flexion contraction transfers 1:1 to real-world slopers.
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-amber-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero lever pressure on pulleys: 100% tendon-safe deep pump training.</span>
              </div>
            </div>

          </div>

          {/* Serendipitous Discovery Callout */}
          <div className="mt-12 bg-slate-50 border border-slate-200 rounded-2xl p-8 max-w-4xl mx-auto shadow-sm text-left">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-100 text-amber-800 rounded-xl shrink-0">
                <Flame className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-black text-slate-950">The Accidental Discovery: The "Pump Master"</h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  "When I rigged the Sloper King to a cable machine at the gym, I discovered something unexpected: because 4 muscles fire under continuous isometric tension while finger joints remain open and unpinched, it delivers the <strong>most intense and tendon-safe forearm pump training</strong> I've ever experienced. You can train forearm endurance to absolute muscular failure with zero pulley injury risk."
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Engineering & Specs Section */}
      <section id="specs" className="py-20 md:py-28 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-left space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-700 bg-amber-100 border border-amber-300 px-3 py-1 inline-block rounded-full">
              ENGINEERING & CONSTRUCTION
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
              Mechanically Decoupled: 800 kg Load Capacity in &lt;100 Grams.
            </h2>
            <p className="text-base md:text-lg text-slate-600">
              Rather than building a heavy, fragile 3D block, we fully decoupled the load-bearing function from the ergonomic contact surface.
            </p>
          </div>

          {/* Prototype Evolution & 100kg Break Test Placeholder */}
          <div className="max-w-4xl mx-auto rounded-2xl border-2 border-dashed border-slate-300 bg-white p-6 text-left">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
              <Camera className="w-4 h-4 text-amber-600" />
              <span>PHOTO PLACEHOLDER • CAD PROTOTYPES & 100KG BREAK-TEST RIG</span>
            </div>
            <div className="text-xs text-slate-600 leading-relaxed">
              <strong>What to showcase here:</strong> Photo of the CAD prototype evolution next to the final production model with the 220-grit contact surface, plus a screenshot of the 100 kg pull-force load test on the semi-static cord.
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-white border border-slate-200 p-8 rounded-2xl space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-950">800 kg Semi-Static Cord</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                The 4mm semi-static load cord carries 100% of the tensile load (800 kg per strand, doubled = 1,600 kg theoretical). Tested beyond 100kg+ bodyweight.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-slate-200 p-8 rounded-2xl space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-bold">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-950">220-Grit GoldX Friction</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Because plastic is too slick, the ergonomic concave shell is surfaced with CROP GoldX 220-grit grip sandpaper. A reliable, predictable friction coefficient without tearing skin.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-slate-200 p-8 rounded-2xl space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-bold">
                <RotateCw className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-950">5 Cantilever Angles</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Easily shift the cord across 5 numbered positions to adjust the difficulty from a subtle open-hand surface to an aggressive, hanging sloper.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* The 4 Types of Training Section */}
      <section id="training" className="py-20 md:py-28 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-left space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-700 bg-amber-100 border border-amber-300 px-3 py-1 inline-block rounded-full">
              4 TRAINING DISCIPLINES
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
              4 Ways to Train Your Forearms & Grip
            </h2>
            <p className="text-base md:text-lg text-slate-600">
              From pinpoint hypertrophy and deep pump resistance on cable machines to tendon-safe warmups at the crag.
            </p>
          </div>

          {/* 4 Cards Grid with Visual/Video Placeholders & Specific Captions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Type 1: Cable Machine */}
            <div className="bg-white border-2 border-amber-400 rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded">
                    FRÉ'S CHOICE ★★★
                  </span>
                  <Activity className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="text-xl font-black text-slate-950">1. Gym Cable Machine</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Attach to the pulley of a cable crossover. Dial in the exact resistance in kilograms for maximum muscular contraction.
                </p>

                {/* Video/Image Placeholder Card */}
                <div className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/70 p-3.5 space-y-1 text-left">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-900 uppercase">
                    <Video className="w-3.5 h-3.5 text-amber-600" />
                    <span>VIDEO / GIF PLACEHOLDER</span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-tight">
                    <strong>What to showcase:</strong> 15-second clip of Fré at the gym cable station (25kg hold, wrists curled inward, full forearm muscle activation).
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-700 space-y-1">
                <div className="font-bold text-slate-950">Goal: Max Strength & Pump</div>
                <div>5–7s heavy holds or 35–45s continuous tension (fatigue delay).</div>
              </div>
            </div>

            {/* Type 2: Floor Pick-Ups */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded">
                    MOBILE STRENGTH
                  </span>
                  <Dumbbell className="w-4 h-4 text-slate-600" />
                </div>
                <h3 className="text-xl font-black text-slate-950">2. Floor Pick-Ups</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Loop the Sloper King onto a kettlebell or weight plate loading pin and deadlift straight off the floor.
                </p>

                {/* Video/Image Placeholder Card */}
                <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-3.5 space-y-1 text-left">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-800 uppercase">
                    <Video className="w-3.5 h-3.5 text-slate-600" />
                    <span>VIDEO / GIF PLACEHOLDER</span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-tight">
                    <strong>What to showcase:</strong> Short clip lifting a 16–24 kg kettlebell off the floor with a locked, neutral wrist.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-700 space-y-1">
                <div className="font-bold text-slate-950">Goal: Home & Free Weights</div>
                <div>No pull-up bar needed. Simple progressive overloading.</div>
              </div>
            </div>

            {/* Type 3: Pull-Up Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded">
                    BODYWEIGHT
                  </span>
                  <Sliders className="w-4 h-4 text-slate-600" />
                </div>
                <h3 className="text-xl font-black text-slate-950">3. Pull-Up Bar & Counter</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Hang the tool over a pull-up bar at home or at the gym for isometric bodyweight sessions.
                </p>

                {/* Video/Image Placeholder Card */}
                <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-3.5 space-y-1 text-left">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-800 uppercase">
                    <Video className="w-3.5 h-3.5 text-slate-600" />
                    <span>VIDEO / GIF PLACEHOLDER</span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-tight">
                    <strong>What to showcase:</strong> Fré hanging from an overhead bar on both Sloper Kings (with feet on ground or resistance band).
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-700 space-y-1">
                <div className="font-bold text-slate-950">Goal: Isometric Hangboard</div>
                <div>Offset hangs, active shoulder engagement, and core stability.</div>
              </div>
            </div>

            {/* Type 4: Crag & Warmup */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded">
                    INJURY-SAFE
                  </span>
                  <Compass className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="text-xl font-black text-slate-950">4. Crag & Pre-Climb Warmup</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Gradually recruit your fingers and wrist flexors at the crag or gym without stressing finger pulleys.
                </p>

                {/* Video/Image Placeholder Card */}
                <div className="rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/60 p-3.5 space-y-1 text-left">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-900 uppercase">
                    <Video className="w-3.5 h-3.5 text-emerald-600" />
                    <span>VIDEO / GIF PLACEHOLDER</span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-tight">
                    <strong>What to showcase:</strong> Warming up at the crag (Freyr/Fontainebleau or gym) with foot-loop progressive isometric traction.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-700 space-y-1">
                <div className="font-bold text-slate-950">Goal: Pulley Protection (&lt;100g)</div>
                <div>No heavy wooden boards to carry. Fits straight into your pocket.</div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* What's In The Box Section */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 md:px-8 text-left space-y-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
              UNBOXING & DELIVERABLES
            </span>
            <h2 className="text-3xl font-black text-slate-950 tracking-tight">
              What's inside your Sloper King™ package?
            </h2>
          </div>

          {/* Unboxing Flat-Lay Placeholder */}
          <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-6 text-left shadow-sm">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
              <Camera className="w-4 h-4 text-amber-600" />
              <span>PHOTO PLACEHOLDER • UNBOXING FLAT-LAY PACKAGING SHOT</span>
            </div>
            <div className="text-xs text-slate-600 leading-relaxed">
              <strong>What to showcase here:</strong> Clean flat-lay photo on a light background showing: 2x matte black Sloper Kings with gold crowns, 2x 800kg semi-static load cords, soft cotton pouch, and the Tiny Quickstart training guide.
            </div>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 text-left">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-sm">
              <div className="font-black text-slate-950 text-lg">2x Sloper King™</div>
              <p className="text-xs text-slate-600">High-durability matte black PLA with 5 adjustable cantilever positions.</p>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-sm">
              <div className="font-black text-slate-950 text-lg">2x 800kg Cords</div>
              <p className="text-xs text-slate-600">4mm semi-static cord (800kg tensile load rating per strand).</p>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-sm">
              <div className="font-black text-slate-950 text-lg">1x Cotton Pouch</div>
              <p className="text-xs text-slate-600">Custom soft cotton carry pouch.</p>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-sm">
              <div className="font-black text-slate-950 text-lg">1x Tiny Guide</div>
              <p className="text-xs text-slate-600">Pocket Quickstart guide with QR codes to video protocols & diagrams.</p>
            </div>
          </div>

        </div>
      </section>

      {/* Community & Social Proof Carousel Section */}
      <section id="community" className="py-20 md:py-28 bg-white border-b border-slate-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl text-left space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-extrabold uppercase tracking-widest">
                <Instagram className="w-3.5 h-3.5 text-amber-700" />
                <span>COMMUNITY & ATHLETE REVIEWS</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
                Trained by Climbers. <br />
                <span className="text-amber-600 font-black">Tag #sloperking</span>
              </h2>
              <p className="text-sm md:text-base text-slate-600">
                From World Cup athletes to local gym crushers and Fontainebleau boulderers — see how the community trains sloper friction and pump endurance.
              </p>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-3 self-start md:self-end shrink-0">
              <a
                href="https://www.instagram.com/explore/tags/sloperking/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold transition-all border border-slate-200 mr-2"
              >
                <Instagram className="w-4 h-4 text-pink-600" />
                <span>#sloperking on Instagram</span>
              </a>
              <button
                onClick={() => scrollCarousel('left')}
                className="w-11 h-11 rounded-xl bg-white border border-slate-300 hover:border-slate-950 hover:bg-slate-50 text-slate-900 flex items-center justify-center transition-all shadow-sm active:scale-95"
                title="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollCarousel('right')}
                className="w-11 h-11 rounded-xl bg-white border border-slate-300 hover:border-slate-950 hover:bg-slate-50 text-slate-900 flex items-center justify-center transition-all shadow-sm active:scale-95"
                title="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Carousel Track */}
          <div
            ref={carouselScrollRef}
            className="flex gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scrollbar-none -mx-4 px-4 md:-mx-8 md:px-8"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {communityPosts.map((post) => (
              <div
                key={post.id}
                className="w-[300px] sm:w-[340px] md:w-[360px] shrink-0 snap-start bg-slate-50 rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between text-left"
              >
                <div className="space-y-4">
                  {/* User Profile Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-sm flex items-center justify-center shadow-xs">
                        {post.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-950">{post.handle}</div>
                        <div className="text-[11px] text-slate-500">{post.location}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                      {post.role}
                    </span>
                  </div>

                  {/* Dummy Photo / Image Placeholder Container */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-dashed border-amber-300 bg-amber-50/70 p-4 flex flex-col justify-between group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-amber-900 uppercase tracking-wider bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded-md border border-amber-200">
                        <Camera className="w-3.5 h-3.5 text-amber-600" />
                        <span>USER PHOTO</span>
                      </div>
                      <span className="text-[10px] font-black text-amber-700 bg-amber-200/80 px-2 py-0.5 rounded-md">
                        #sloperking
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-700 leading-snug font-medium">
                      {post.placeholderText}
                    </div>

                    <div className="text-[10px] font-bold text-slate-600 flex items-center gap-1 bg-white/90 backdrop-blur-xs px-2 py-1 rounded-md border border-slate-200 w-fit">
                      <Zap className="w-3 h-3 text-amber-500" />
                      <span>{post.protocol}</span>
                    </div>
                  </div>

                  {/* User Quote */}
                  <div className="space-y-2">
                    <p className="text-xs text-slate-800 italic leading-relaxed">
                      "{post.quote}"
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {post.tags.map((tag, idx) => (
                        <span key={idx} className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5 text-rose-600 font-semibold">
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                    <span>{post.likes} likes</span>
                  </div>
                  <span>{post.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Instagram Banner */}
          <div className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-slate-50 to-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-sm shrink-0">
                <Instagram className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-slate-950">Got your Sloper King™? Share your workout!</div>
                <div className="text-[11px] text-slate-600">Tag <strong>#sloperking</strong> and <strong>@fre2028.la</strong> to be featured on our community wall.</div>
              </div>
            </div>
            <a
              href="https://www.instagram.com/fre2028.la/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-950 hover:bg-amber-500 text-white hover:text-slate-950 text-xs font-extrabold transition-all shadow-sm shrink-0"
            >
              <span>Follow @fre2028.la</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </section>

      {/* Order & Pricing Webshop Section */}
      <section ref={orderSectionRef} id="order" className="py-20 md:py-28 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-700 bg-amber-100 border border-amber-300 px-3 py-1 inline-block rounded-full">
              OFFICIAL WEBSHOP
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
              Order Your Sloper King™
            </h2>
            <p className="text-sm md:text-base text-slate-600">
              Made in Belgium. 100% of profits fund Fré's bid for the LA 2028 Paralympic Games — the historic first time Para Climbing is an official Paralympic sport.
            </p>
          </div>

          {status === 'success' && (
            <div className="mb-8 p-6 bg-emerald-50 border-2 border-emerald-500 rounded-2xl text-left flex items-start gap-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-extrabold text-lg text-emerald-950">Thank you for your order!</h3>
                <p className="text-sm text-emerald-800 mt-1">
                  We have received your payment successfully. You will receive a confirmation email with tracking details as soon as your Sloper King™ package is dispatched.
                </p>
              </div>
            </div>
          )}

          {status === 'demo_success' && (
            <div className="mb-8 p-6 bg-amber-50 border-2 border-amber-500 rounded-2xl text-left flex items-start gap-4">
              <CheckCircle2 className="w-8 h-8 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-extrabold text-lg text-amber-950">Pre-Order Registration Confirmed!</h3>
                <p className="text-sm text-amber-800 mt-1">
                  Your order is booked for Batch 1. We will contact you shortly for dispatch and delivery confirmation.
                </p>
              </div>
            </div>
          )}

          {checkoutError && (
            <div className="mb-8 p-4 bg-rose-50 border border-rose-300 rounded-xl text-left flex items-center gap-3 text-rose-900 text-sm font-medium">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{checkoutError}</span>
            </div>
          )}

          {/* Full-width 2-column Grid: Product Configuration + Checkout Panel */}
          <div className="grid lg:grid-cols-12 gap-8 items-start text-left">
            
            {/* Left Column: Product Selection & Shipping Options (7 Cols) */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Step 1: Configuration Selection with Photos */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                    1. Choose your configuration
                  </label>
                  <span className="text-xs font-bold text-slate-400">Click a card to select</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  
                  {/* Option 1: Pair */}
                  <div 
                    onClick={() => setItemType('pair')}
                    className={cn(
                      "cursor-pointer p-6 rounded-3xl border-2 transition-all flex flex-col justify-between relative group",
                      itemType === 'pair' 
                        ? "border-slate-950 bg-white ring-2 ring-slate-950 shadow-xl" 
                        : "border-slate-200 bg-white/80 hover:border-slate-400 hover:bg-white shadow-sm"
                    )}
                  >
                    <div className="absolute top-4 right-4 z-10">
                      <span className="text-[10px] font-black tracking-widest uppercase bg-amber-400 text-slate-950 px-2.5 py-1 rounded-full shadow-xs">
                        MOST POPULAR
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* Photo Placeholder: Complete Pair */}
                      <div className="relative aspect-[16/10] rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/80 p-4 flex flex-col justify-between overflow-hidden">
                        <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-amber-900 uppercase tracking-wider bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md border border-amber-200 w-fit">
                          <Camera className="w-3.5 h-3.5 text-amber-600" />
                          <span>PHOTO • COMPLETE PAIR</span>
                        </div>

                        <div className="text-[11px] text-slate-700 leading-snug font-medium">
                          <strong>What to showcase:</strong> 2x matte black Sloper Kings with yellow crowns, 2x 800kg load cords, soft cotton carry pouch &amp; guide.
                        </div>

                        <div className="text-[10px] font-black text-amber-900 bg-amber-200/90 px-2 py-0.5 rounded-md w-fit">
                          Dual-Hand Bilateral Training
                        </div>
                      </div>

                      <div>
                        <div className="flex items-baseline justify-between gap-2">
                          <h3 className="font-black text-xl text-slate-950">Complete Training Pair</h3>
                          <div className="text-2xl font-black text-slate-950">€44.95</div>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Full pair for dual-hand hangs, pull-up bar holds &amp; bilateral pump training.
                        </p>
                      </div>

                      <ul className="text-xs space-y-2 text-slate-700 pt-2 border-t border-slate-100">
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span><strong>2x Sloper King™ units</strong> (&lt;100g each)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span><strong>2x 800kg</strong> semi-static load cords</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span><strong>1x Soft cotton</strong> carry pouch included</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span><strong>1x Tiny Quickstart Guide</strong> with video protocols</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span><strong>5 difficulty angles</strong> on each unit</span>
                        </li>
                      </ul>
                    </div>

                    <div className="pt-5 mt-4 border-t border-slate-100">
                      <div className={cn(
                        "w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider text-center transition-all flex items-center justify-center gap-2",
                        itemType === 'pair'
                          ? "bg-slate-950 text-white shadow-md"
                          : "bg-slate-100 text-slate-700 group-hover:bg-slate-200"
                      )}>
                        {itemType === 'pair' ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-amber-400" />
                            <span>Selected (Complete Pair)</span>
                          </>
                        ) : (
                          <span>Select Complete Pair</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Option 2: Single */}
                  <div 
                    onClick={() => setItemType('single')}
                    className={cn(
                      "cursor-pointer p-6 rounded-3xl border-2 transition-all flex flex-col justify-between relative group",
                      itemType === 'single' 
                        ? "border-slate-950 bg-white ring-2 ring-slate-950 shadow-xl" 
                        : "border-slate-200 bg-white/80 hover:border-slate-400 hover:bg-white shadow-sm"
                    )}
                  >
                    <div className="absolute top-4 right-4 z-10">
                      <span className="text-[10px] font-black tracking-widest uppercase bg-slate-200 text-slate-800 px-2.5 py-1 rounded-full">
                        STARTER
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* Photo Placeholder: Single Unit */}
                      <div className="relative aspect-[16/10] rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/80 p-4 flex flex-col justify-between overflow-hidden">
                        <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-amber-900 uppercase tracking-wider bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md border border-amber-200 w-fit">
                          <Camera className="w-3.5 h-3.5 text-amber-600" />
                          <span>PHOTO • SINGLE UNIT</span>
                        </div>

                        <div className="text-[11px] text-slate-700 leading-snug font-medium">
                          <strong>What to showcase:</strong> 1x matte black Sloper King with yellow crown, 1x 800kg load cord &amp; Tiny Quickstart Guide.
                        </div>

                        <div className="text-[10px] font-black text-amber-900 bg-amber-200/90 px-2 py-0.5 rounded-md w-fit">
                          Unilateral Cable &amp; Lift Setup
                        </div>
                      </div>

                      <div>
                        <div className="flex items-baseline justify-between gap-2">
                          <h3 className="font-black text-xl text-slate-950">Single Unit (1 Piece)</h3>
                          <div className="text-2xl font-black text-slate-950">€24.95</div>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Ideal for unilateral cable pulls, loading pin lifts &amp; portable crag warmups.
                        </p>
                      </div>

                      <ul className="text-xs space-y-2 text-slate-700 pt-2 border-t border-slate-100">
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span><strong>1x Sloper King™ unit</strong> (&lt;100g)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span><strong>1x 800kg</strong> semi-static load cord</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span><strong>1x Tiny Quickstart Guide</strong> with video protocols</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span><strong>5 difficulty angles</strong> built-in</span>
                        </li>
                        <li className="flex items-center gap-2 text-slate-400">
                          <span className="w-4 text-center">—</span>
                          <span>Carry pouch not included</span>
                        </li>
                      </ul>
                    </div>

                    <div className="pt-5 mt-4 border-t border-slate-100">
                      <div className={cn(
                        "w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider text-center transition-all flex items-center justify-center gap-2",
                        itemType === 'single'
                          ? "bg-slate-950 text-white shadow-md"
                          : "bg-slate-100 text-slate-700 group-hover:bg-slate-200"
                      )}>
                        {itemType === 'single' ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-amber-400" />
                            <span>Selected (Single Unit)</span>
                          </>
                        ) : (
                          <span>Select Single Unit</span>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Step 2: Shipping Destination */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
                  2. Select shipping destination
                </label>
                <div className="grid sm:grid-cols-3 gap-3">
                  
                  <div 
                    onClick={() => setShippingZone('pickup')}
                    className={cn(
                      "cursor-pointer p-4 rounded-2xl border text-center transition-all",
                      shippingZone === 'pickup' 
                        ? "border-slate-950 bg-white shadow-md ring-2 ring-slate-950" 
                        : "border-slate-200 bg-white/70 hover:border-slate-300"
                    )}
                  >
                    <div className="font-extrabold text-sm text-slate-950">Leuven Pickup</div>
                    <div className="text-xs font-black text-emerald-700 mt-0.5">FREE (€0.00)</div>
                    <div className="text-[10px] text-slate-500 mt-1">Local pickup by appointment</div>
                  </div>

                  <div 
                    onClick={() => setShippingZone('be')}
                    className={cn(
                      "cursor-pointer p-4 rounded-2xl border text-center transition-all",
                      shippingZone === 'be' 
                        ? "border-slate-950 bg-white shadow-md ring-2 ring-slate-950" 
                        : "border-slate-200 bg-white/70 hover:border-slate-300"
                    )}
                  >
                    <div className="font-extrabold text-sm text-slate-950">Belgium (bpost)</div>
                    <div className="text-xs font-black text-slate-900 mt-0.5">€3.99</div>
                    <div className="text-[10px] text-slate-500 mt-1">With Track &amp; Trace</div>
                  </div>

                  <div 
                    onClick={() => setShippingZone('eu')}
                    className={cn(
                      "cursor-pointer p-4 rounded-2xl border text-center transition-all",
                      shippingZone === 'eu' 
                        ? "border-slate-950 bg-white shadow-md ring-2 ring-slate-950" 
                        : "border-slate-200 bg-white/70 hover:border-slate-300"
                    )}
                  >
                    <div className="font-extrabold text-sm text-slate-950">European Union</div>
                    <div className="text-xs font-black text-slate-900 mt-0.5">€4.99</div>
                    <div className="text-[10px] text-slate-500 mt-1">Tracked across EU (NL, FR, DE...)</div>
                  </div>

                </div>
              </div>

            </div>

            {/* Right Column: Sticky Checkout & Summary Panel (5 Cols) */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-black text-slate-950">Order Summary</h3>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Batch 1 • In Stock
                  </span>
                </div>

                {/* Selected Item Overview & Quantity */}
                <div className="flex items-center justify-between gap-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <div className="font-extrabold text-sm text-slate-950">
                      {itemType === 'pair' ? 'Sloper King™ Set of 2 (Pair)' : 'Sloper King™ Single Unit'}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      €{basePrice.toFixed(2)} per unit
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 font-black text-slate-900 flex items-center justify-center transition-colors"
                      title="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-black text-sm text-slate-950">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 font-black text-slate-900 flex items-center justify-center transition-colors"
                      title="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Promo Coupon Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Have a promo coupon?
                  </label>
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. FOUNDER25"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs uppercase font-bold tracking-wider text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950"
                    />
                    <button
                      type="submit"
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs tracking-wider uppercase transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                  {couponApplied && (
                    <div className="mt-2 text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Coupon <strong>{couponApplied}</strong> applied!</span>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal ({quantity}x {itemType === 'pair' ? 'Pair' : 'Single'})</span>
                    <span className="font-semibold text-slate-950">€{(basePrice * quantity).toFixed(2)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between font-bold text-emerald-600">
                      <span>Launch Discount ({couponApplied})</span>
                      <span>-€{(discountAmount * quantity).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600">
                    <span>Shipping ({shippingZone === 'pickup' ? 'Leuven' : shippingZone === 'be' ? 'Belgium' : 'EU'})</span>
                    <span className="font-semibold text-slate-950">{shippingCost === 0 ? 'FREE' : `€${shippingCost.toFixed(2)}`}</span>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                    <div className="font-black text-base text-slate-950">Total Amount</div>
                    <div className="font-black text-3xl text-slate-950">€{grandTotal.toFixed(2)}</div>
                  </div>
                </div>

                {/* Checkout Button */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleCheckout}
                    disabled={isLoadingCheckout}
                    className="w-full bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white font-black py-4 rounded-xl text-sm tracking-wide transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2.5 disabled:opacity-50 active:scale-95 cursor-pointer"
                  >
                    {isLoadingCheckout ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Secure Checkout with Stripe</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  
                  <div className="text-center text-[11px] text-slate-500 space-y-1">
                    <p className="flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>256-bit encrypted checkout (Card, Bancontact, iDEAL)</span>
                    </p>
                    <p className="text-slate-400">14-day money-back guarantee • Dispatched in 24-48h</p>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Maker Corner (Free STL Lead Magnet) */}
      <section id="makers" className="py-20 md:py-24 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-left">
          
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl p-8 md:p-12 shadow-sm">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              
              <div className="space-y-3 flex-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <Download className="w-3.5 h-3.5" />
                  <span>OPEN SOURCE (CC BY-NC 4.0)</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-950">
                  Own a 3D printer?
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Because I believe in open scientific innovation, I share the official 3D files free for <strong>personal, non-commercial use</strong>. Enter your email to instantly receive the STL bundle + the Slicing & Safety Guide.
                </p>
              </div>

              <div className="w-full md:w-80 shrink-0">
                {stlDownloaded ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <div className="font-extrabold text-sm text-emerald-950">Files On The Way!</div>
                    <div className="text-xs text-emerald-800">Check your inbox for the download link to the STL bundle.</div>
                  </div>
                ) : (
                  <form onSubmit={handleStlSubmit} className="space-y-3">
                    <input
                      type="email"
                      required
                      placeholder="Your email address..."
                      value={stlEmail}
                      onChange={(e) => setStlEmail(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950"
                    />
                    <button
                      type="submit"
                      disabled={stlLoading}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3 rounded-xl text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      {stlLoading ? 'Sending...' : 'Download Free STL'}
                      <Download className="w-4 h-4" />
                    </button>
                    <div className="text-[10px] text-slate-400 text-center">
                      No spam. Only the STL and occasional LA2028 athlete updates.
                    </div>
                  </form>
                )}
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* B2B / Gym Consignment Section */}
      <section className="py-20 md:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center space-y-6">
          <div className="inline-block bg-slate-100 text-slate-800 text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-slate-200">
            CLIMBING GYMS & COACHES
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Want a Sloper King™ Test-Stand in your Climbing Gym?
          </h2>
          <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            We provide a free warmup test-stand for your training area and an 8-set retail display box on <strong>100% consignment (zero financial risk)</strong>. Your gym keeps €16 margin per set.
          </p>
          <div>
            <a
              href="mailto:fre@fre2028.la?subject=Sloper%20King%20Climbing%20Gym%20Inquiry"
              className="inline-flex items-center gap-2 bg-slate-950 text-white hover:bg-amber-500 hover:text-slate-950 px-8 py-3.5 rounded-xl text-sm font-black tracking-wide transition-all shadow-md"
            >
              <Building2 className="w-4 h-4" />
              <span>Request a Gym Package via fre@fre2028.la</span>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-24 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-left">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-3xl font-black text-slate-950 tracking-tight">
              Everything you need to know
            </h2>
          </div>

          <div className="space-y-4">
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-extrabold text-base text-slate-950 mb-2">Why is the cord decoupled from the 3D-printed body?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                3D-printed plastics can delaminate under extreme shear torque. By looping an 800 kg semi-static cord directly through the cantilever channels, the cord carries 100% of the load. The 3D print serves purely as an ergonomic, anatomical contact shell.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-extrabold text-base text-slate-950 mb-2">Can I replace the grip sandpaper when worn out?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Yes! We use CROP GoldX 220-grit sandpaper with self-adhesive backing. You simply peel off the worn strip and apply a fresh pre-cut strip in seconds.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-extrabold text-base text-slate-950 mb-2">Why train on a gym cable machine rather than regular pull-ups?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                On an overhead pull-up bar, you are always constrained to 100% of your bodyweight (unless using counterweight pulleys). On a gym cable machine, you can dial in the load down to the exact kilogram (e.g. 15 kg or 35 kg). This enables targeted hypertrophy and sustained isometric fatigue sets (35–45s continuous tension).
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-extrabold text-base text-slate-950 mb-2">What is the estimated delivery time?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Batch 1 is locally produced in Belgium and dispatched within 2 to 4 business days via bpost (with Track & Trace across Europe). Local pickup orders in Leuven are usually ready within 24 hours.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white text-slate-600 text-xs border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-950 tracking-wider">BAMBUM INNOVATION</span>
            <span>• By Fré Leys (PhD.)</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => router.push('/')} className="hover:text-slate-950 transition-colors">fre2028.la</button>
            <button onClick={() => router.push('/privacy')} className="hover:text-slate-950 transition-colors">Privacy</button>
            <a href="mailto:fre@fre2028.la" className="hover:text-slate-950 transition-colors">Contact</a>
          </div>
          <div className="text-slate-400">
            © {new Date().getFullYear()} Fré Leys. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
