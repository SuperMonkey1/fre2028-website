import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Image from 'next/image';

const slides = [
  {
    id: 1,
    type: 'text',
    content: (
      <div className="relative w-full h-full flex flex-col items-start justify-center text-left pl-8 md:pl-24">
        {/* Static Background Image (to match homepage) */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/web/me_innsbruck_banner_web.webp"
            alt="Fré climbing background"
            fill
            sizes="100vw"
            className="object-cover opacity-40 grayscale mix-blend-screen"
            priority
            quality={100}
          />
        </div>
        
        {/* Gradient Overlays for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/50 z-10" />
        <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-black to-transparent pointer-events-none z-10" />
        <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-black to-transparent pointer-events-none z-10" />

        {/* Content Overlay */}
        <div className="relative z-20 flex flex-col items-start justify-start w-full max-w-7xl px-4 md:px-0 h-full pt-20">
          <div className="inline-block px-4 py-2 border border-white/60 text-xs font-bold uppercase tracking-[0.2em] text-zinc-300 mb-8 backdrop-blur-sm">
            Road to Los Angeles 2028
          </div>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-none mb-6 text-white text-left">
            DREAM<br />BIG.
          </h1>
          
          <p className="absolute bottom-[25vh] text-xl md:text-2xl lg:text-3xl text-zinc-300 max-w-2xl leading-relaxed font-light">
            Becoming the first Paralympian from Leuven
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    type: 'image-text',
    image: '/images/tedx/amp_football.png',
    text: 'My grind',
    subtitle: 'I had to prove them wrong',
    position: 'bottom-left',
    fitHeight: true,
  },
  {
    id: 3,
    type: 'text',
    content: (
      <div className="flex flex-col items-start justify-center max-w-5xl px-8 md:px-24 space-y-10">
        <h2 className="text-5xl md:text-7xl font-black text-[#D4AF37] tracking-widest uppercase mb-8">
          4 Principles
        </h2>
        {[
          { number: '1', title: 'You are not amazing', about: 'Believe in yourself' },
          { number: '2', title: 'What if I fail?', about: 'Make the right choice' },
          { number: '3', title: 'The Final Boss', about: 'The right motivation is XP' },
          { number: '4', title: 'Fun disables Gravity', about: 'The First Law of Thermodynamics' },
        ].map((p) => (
          <div key={p.number} className="flex items-baseline gap-6">
            <span className="text-4xl md:text-6xl font-black text-[#D4AF37]">{p.number}</span>
            <div className="flex flex-col">
              <span className="text-2xl md:text-4xl font-bold text-white">{p.title}</span>
              <span className="text-lg md:text-2xl text-zinc-400 font-light italic mt-1">{p.about}</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 4,
    type: 'text',
    content: (
      <div className="relative w-full h-full flex flex-row p-8 md:p-16">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/tedx/climbing_route_steps.png"
            alt="Climbing route steps"
            fill
            sizes="100vw"
            className="object-cover"
            quality={100}
          />
        </div>
        <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-black to-transparent pointer-events-none z-10" />
        <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-black to-transparent pointer-events-none z-10" />
        <div className="relative z-20 flex flex-col items-start justify-start w-1/2">
          <span className="text-5xl md:text-7xl font-black text-[#D4AF37] mb-2">1</span>
          <h2 className="text-4xl md:text-6xl font-bold text-white">You are not amazing</h2>
          <p className="text-xl md:text-2xl text-zinc-300 font-light italic mt-2">Believe in yourself</p>
        </div>
        <div className="relative z-20 flex items-end justify-center w-1/2 pb-4">
          <p className="text-lg md:text-2xl text-zinc-200 font-light italic max-w-xl text-center leading-relaxed">
            To top a climbing route, you just have to climb from climbing hold to climbing hold
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 5,
    type: 'image',
    image: '/images/tedx/kulibri_step_by_step.png',
    alt: 'The Kulibrie',
  },
  {
    id: 6,
    type: 'principle',
    number: '2',
    title: 'What if I fail?',
    subtitle: 'Make the right choice',
  },
  {
    id: 7,
    type: 'text',
    content: (
      <div className="flex flex-col items-center justify-center text-center space-y-8">
        <h2 className="text-4xl md:text-6xl text-gray-500 line-through decoration-red-500 decoration-[4px]">
          What if I fail?
        </h2>
        <h2 className="text-5xl md:text-7xl font-bold text-white max-w-5xl leading-tight">
          What is the worst thing that could actually happen?
        </h2>
      </div>
    ),
  },
  {
    id: 8,
    type: 'text',
    content: (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg md:text-xl text-zinc-500 font-light italic">
          We never sold a single robotic hummingbird.
        </p>
      </div>
    ),
  },
  {
    id: 9,
    type: 'principle',
    number: '3',
    title: 'The Final Boss',
    subtitle: 'The right motivation is XP',
  },
  {
    id: 10,
    type: 'image',
    image: '/images/tedx/podium.png',
    alt: 'Fré on the World Cup podium with gold medal',
    contain: true,
    fadeEdges: true,
  },
  {
    id: 11,
    type: 'graphic',
    content: (
      <div className="flex flex-col items-center justify-center w-full max-w-4xl px-8">
        <h2 className="text-6xl md:text-8xl font-black text-white mb-16 tracking-widest uppercase">
          Chase the XP
        </h2>
        <div className="w-full h-8 bg-gray-800 rounded-full overflow-hidden border-2 border-gray-600 mb-6 relative">
          <div className="h-full bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-200 w-3/4 rounded-full relative">
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
        <div className="flex justify-between w-full text-gray-400 text-lg md:text-2xl font-bold uppercase tracking-wider">
          <span>Skills</span>
          <span>·</span>
          <span>Knowledge</span>
          <span>·</span>
          <span>Relationships</span>
          <span>·</span>
          <span>Resilience</span>
        </div>
      </div>
    ),
  },
  {
    id: 12,
    type: 'principle',
    number: '4',
    title: 'Fun disables Gravity',
    subtitle: 'The First Law of Thermodynamics',
  },
  {
    id: 13,
    type: 'image',
    image: '/images/tedx/20230613_JANVIRT_web.webp',
    fadeEdges: true,
    contain: true,
  },
  {
    id: 14,
    type: 'text',
    content: (
      <div className="flex flex-col items-center justify-center text-center space-y-12 max-w-4xl px-8">
        <p className="text-2xl md:text-4xl text-zinc-400 font-light leading-relaxed italic">
          You can&apos;t enjoy a rare bird if you don&apos;t know it&apos;s rare.
        </p>
        <div className="w-24 h-px bg-zinc-700" />
        <p className="text-2xl md:text-4xl text-[#D4AF37] font-medium leading-relaxed italic">
          But then again, if you discover you don&apos;t like birds, put down the binoculars.
        </p>
      </div>
    ),
  },
  {
    id: 15,
    type: 'text',
    content: (
      <div className="flex flex-col items-start justify-center max-w-5xl px-8 md:px-24 space-y-10">
        <h2 className="text-5xl md:text-7xl font-black text-[#D4AF37] tracking-widest uppercase mb-8">
          4 Principles
        </h2>
        {[
          { number: '1', title: 'You are not amazing', about: 'Believe in yourself' },
          { number: '2', title: 'What if I fail?', about: 'Make the right choice' },
          { number: '3', title: 'The Final Boss', about: 'The right motivation is XP' },
          { number: '4', title: 'Fun disables Gravity', about: 'The First Law of Thermodynamics' },
        ].map((p) => (
          <div key={p.number} className="flex items-baseline gap-6">
            <span className="text-4xl md:text-6xl font-black text-[#D4AF37]">{p.number}</span>
            <div className="flex flex-col">
              <span className="text-2xl md:text-4xl font-bold text-white">{p.title}</span>
              <span className="text-lg md:text-2xl text-zinc-400 font-light italic mt-1">{p.about}</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 16,
    type: 'text',
    content: (
      <div className="flex flex-col items-center justify-center text-center space-y-6">
        <h3 className="text-3xl md:text-5xl text-gray-400 font-medium tracking-wide">
          Don't call it a dream.
        </h3>
        <h1 className="text-6xl md:text-9xl font-black text-[#D4AF37] uppercase tracking-widest mt-4">
          Call it a<br />project.
        </h1>
        <p className="text-xl md:text-2xl text-white tracking-widest mt-8">Fre2028.LA</p>
      </div>
    ),
  }
];

export default function TEDxDeck() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter' || e.key === 'PageDown') {
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        prevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  const slide = slides[currentSlideIndex];

  return (
    <div className="fixed inset-0 bg-[#111] text-white overflow-hidden flex items-center justify-center font-sans tracking-wide">
      <Head>
        <title>TEDx Presentation | Fré</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 h-1 bg-gray-800 w-full z-50">
        <div 
          className="h-full bg-[#D4AF37] transition-all duration-300 ease-out"
          style={{ width: `${((currentSlideIndex + 1) / slides.length) * 100}%` }}
        />
      </div>

      <div className="relative w-full h-full flex items-center justify-center">
        {/* Render Slide Content based on Type */}

        {slide.type === 'image' && (
          <div className="relative w-full h-full animate-fade-in text-transparent bg-black">
            <Image 
              src={slide.image!} 
              alt={slide.alt || 'Slide image'} 
              fill
              className={(slide as any).contain ? "object-contain" : "object-cover"}
              priority
            />
            <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-black to-transparent pointer-events-none z-10" />
            <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-black to-transparent pointer-events-none z-10" />
            {(slide as any).fadeEdges && (
              <>
                <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-black to-transparent pointer-events-none z-10" />
                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black to-transparent pointer-events-none z-10" />
              </>
            )}
          </div>
        )}

        {slide.type === 'image-text' && (
          <div className="relative w-full h-full animate-fade-in bg-black">
            <Image 
              src={slide.image!} 
              alt="Background" 
              fill
              className={(slide as any).fitHeight ? "object-contain" : "object-cover"}
              priority
            />
            {/* Side gradients */}
            <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-black to-transparent pointer-events-none z-10" />
            <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-black to-transparent pointer-events-none z-10" />
            {/* Dark gradient overlay for text readability */}
            <div className={`absolute inset-0 bg-black/40 bg-gradient-to-t ${slide.position === 'bottom-right' ? 'from-black/80 to-transparent' : 'from-black/60 via-black/20 to-black/60'} pointer-events-none`} />
            
            <div className={`absolute z-20 p-12 md:p-24 flex flex-col w-full h-full ${
              slide.position === 'bottom-left'
                ? 'items-start justify-end text-left'
                : slide.position === 'bottom-right' 
                  ? 'items-end justify-end text-right' 
                  : 'items-center justify-center text-center'
            }`}>
              <h1 className={`${
                (slide as any).bossStyle 
                  ? 'text-6xl md:text-9xl font-black uppercase tracking-[0.2em] text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]'
                  : 'text-5xl md:text-8xl font-bold text-white drop-shadow-2xl'
              }`}>
                {slide.text}
              </h1>
              {(slide as any).subtitle && (
                <p className="text-2xl md:text-4xl text-zinc-300 font-light mt-4 drop-shadow-lg">
                  {(slide as any).subtitle}
                </p>
              )}
            </div>
          </div>
        )}

        {slide.type === 'title' && (
          <div className="flex flex-col items-center justify-center animate-fade-in text-center">
            <h1 className="text-[15rem] md:text-[25rem] leading-none font-black text-[#D4AF37] drop-shadow-2xl">
              {slide.title}
            </h1>
            <h2 className="text-5xl md:text-8xl tracking-[0.5em] font-light text-white uppercase ml-[0.5em]">
              {slide.subtitle}
            </h2>
          </div>
        )}

        {slide.type === 'principle' && (
          <div className="relative flex flex-col items-center justify-center w-full h-full px-8 lg:px-24 animate-fade-in text-center">
            <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-black to-transparent pointer-events-none z-10" />
            <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-black to-transparent pointer-events-none z-10" />
            <div className="relative z-20 flex flex-col items-center">
              <span className="text-[12rem] md:text-[18rem] leading-none font-black text-[#D4AF37] mb-8">
                {slide.number}
              </span>
              <div className="w-24 h-2 bg-[#D4AF37] mb-12"></div>
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white max-w-6xl leading-tight">
                {slide.title}
              </h2>
              {slide.subtitle && (
                <p className="text-2xl md:text-3xl text-zinc-400 font-light italic mt-6">{slide.subtitle}</p>
              )}
            </div>
          </div>
        )}

        {(slide.type === 'text' || slide.type === 'graphic') && (
          <div className="relative flex flex-col items-center justify-center w-full h-full animate-fade-in">
            <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-black to-transparent pointer-events-none z-10" />
            <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-black to-transparent pointer-events-none z-10" />
            <div className="relative z-20 flex flex-col items-center justify-center w-full h-full">
              {slide.content}
            </div>
          </div>
        )}

      </div>

      {/* Navigation Controls Overlay (Invisible but clickable) */}
      <div className="absolute inset-0 flex z-40">
        <div className="w-1/3 h-full cursor-w-resize" onClick={prevSlide} />
        <div className="w-2/3 h-full cursor-e-resize" onClick={nextSlide} />
      </div>
      
      {/* Fre2028.LA Header (top right, all slides except last) */}
      {currentSlideIndex < slides.length - 1 && (
        <div className="absolute top-5 right-8 text-white/70 text-sm font-light tracking-[0.15em] z-50 pointer-events-none">
          Fre2028.LA
        </div>
      )}


    </div>
  );
}
