import React, { useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { Mountain, Trophy, Medal, Mail, Phone, Globe, Instagram, Linkedin, Award } from 'lucide-react';

export default function PartnerBrochure() {
  const brochureRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Head>
        <title>Partner Brochure - Fré Leys 2028</title>
        <meta name="description" content="Partnership opportunities with Fré Leys on the road to Paralympics 2028" />
      </Head>

      {/* Print Button - Hidden when printing */}
      <div className="fixed top-4 right-4 z-50 no-print">
        <button
          onClick={handlePrint}
          className="bg-black text-white px-6 py-3 font-bold uppercase tracking-widest text-sm hover:bg-zinc-800 transition-colors shadow-lg"
        >
          Print / Export PDF
        </button>
      </div>

      {/* A4 Tri-fold Brochure Container */}
      <div ref={brochureRef} className="brochure-container">
        {/* FRONT COVER - Based on home page banner */}
        <section className="brochure-panel front-cover relative overflow-hidden bg-black text-white">
          {/* Background Image - Same as hero section */}
          <div className="absolute inset-0 z-0">
            <Image 
              src="/images/web/me_innsbruck_banner_web.webp"
              alt="Fré climbing"
              fill
              sizes="33vw"
              className="object-cover opacity-40 grayscale mix-blend-screen"
              priority
              quality={60}
            />
          </div>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/50 z-10" />
          
          {/* Content */}
          <div className="relative z-20 h-full flex flex-col justify-between p-8">
            {/* Logo/Branding */}
            <div className="flex items-center gap-3 font-bold text-lg tracking-widest uppercase">
              <Mountain className="w-6 h-6" />
              <span>FRÉ2028.LA</span>
            </div>

            {/* Main Title */}
            <div>
              <div className="inline-block px-4 py-2 mb-6 border border-white/30 text-xs font-bold uppercase tracking-[0.2em] text-zinc-300">
                Road to Los Angeles 2028
              </div>
              <h1 className="text-6xl font-bold tracking-tighter leading-none mb-6">
                DROOM<br />GROOTS.
              </h1>
              <p className="text-xl text-zinc-400 leading-relaxed max-w-sm">
                Steun de eerste Leuvense Paralympiër op weg naar Los Angeles 2028
              </p>
            </div>

            {/* Bottom Stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="border border-zinc-700 p-3">
                <div className="text-2xl font-bold">6</div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">World Cup Medailles</div>
              </div>
              <div className="border border-zinc-700 p-3">
                <div className="text-2xl font-bold">AL-2</div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">Klasse</div>
              </div>
            </div>
          </div>
        </section>

        {/* INSIDE LEFT PANEL - About */}
        <section className="brochure-panel inside-left bg-white text-black p-8 flex flex-col justify-between">
          <div>
            <div className="inline-block px-3 py-1 mb-4 border border-zinc-300 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600">
              Wie is Fré?
            </div>
            
            <h2 className="text-3xl font-bold tracking-tighter mb-6">
              Frederik Leys
            </h2>

            <div className="space-y-4 text-sm leading-relaxed text-zinc-700">
              <p>
                <strong className="text-black">Frederik 'Fré' Leys</strong> is een 38-jarige paraklimmer uit Leuven die zich voorbereidt op de Paralympische Spelen 2028 in Los Angeles.
              </p>
              
              <p>
                Als lid van de AL-2 klasse (Leg Amputees) heeft Fré sinds 2016 al <strong>6 wereldbeker medailles</strong> verzameld, waaronder 2 gouden, 1 zilveren en 3 bronzen medailles.
              </p>

              <p>
                Met <strong>26 internationale deelnames</strong> en topprestaties op wereldkampioenschappen, werkt Fré elke dag hard aan zijn Paralympische droom.
              </p>
            </div>
          </div>

          {/* Key Achievements */}
          <div className="mt-6 pt-6 border-t border-zinc-200">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
              Top Prestaties
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-3 h-3 text-white" />
                </div>
                <span className="text-zinc-700 leading-tight">
                  <strong>2× Goud</strong> World Cup (2021, 2023)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <Medal className="w-3 h-3 text-white" />
                </div>
                <span className="text-zinc-700 leading-tight">
                  <strong>1× Zilver</strong> WK & World Cup (2017, 2021, 2022)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Medal className="w-3 h-3 text-white" />
                </div>
                <span className="text-zinc-700 leading-tight">
                  <strong>3× Brons</strong> World Cup (2016, 2021, 2024)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-zinc-600 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold">
                  4
                </div>
                <span className="text-zinc-700 leading-tight">
                  <strong>4de plaats</strong> WK Seoul 2025
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* INSIDE CENTER PANEL - Partnership Benefits */}
        <section className="brochure-panel inside-center bg-zinc-50 text-black p-8 flex flex-col">
          <div className="inline-block px-3 py-1 mb-4 border border-zinc-300 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600">
            Waarom Partner Worden?
          </div>
          
          <h2 className="text-3xl font-bold tracking-tighter mb-6">
            Jouw Impact
          </h2>

          <div className="space-y-6 text-sm leading-relaxed text-zinc-700 flex-1">
            <div>
              <h3 className="font-bold text-black mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs">1</span>
                Zichtbaarheid
              </h3>
              <p className="text-xs pl-8">
                Logo op persmateriaal, website, social media (8K+ bereik), wedstrijdkleding, en persdossiers met nationale en internationale exposure.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-black mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs">2</span>
                Maatschappelijke Impact
              </h3>
              <p className="text-xs pl-8">
                Verbind je merk met inclusie, doorzettingsvermogen en het bereiken van onmogelijk geachte doelen. Inspireer klanten en medewerkers.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-black mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs">3</span>
                Paraclimbing.be VZW
              </h3>
              <p className="text-xs pl-8">
                Steun de groeiende paraklimgemeenschap in België. Fré's organisatie maakt klimmen toegankelijk voor personen met fysieke beperkingen.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-black mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs">4</span>
                Authenticiteit
              </h3>
              <p className="text-xs pl-8">
                Geen oppervlakkige sponsoring. Bouw een echte relatie op met een atleet die volledig toegewijd is aan zijn sport en maatschappelijke missie.
              </p>
            </div>
          </div>

          {/* Partnership Types Preview */}
          <div className="mt-6 pt-6 border-t border-zinc-300">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
              Partnership Niveaus
            </h3>
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <div className="border border-zinc-300 p-2 text-center">
                <div className="font-bold">Financieel</div>
              </div>
              <div className="border border-zinc-300 p-2 text-center">
                <div className="font-bold">Strategisch</div>
              </div>
              <div className="border border-zinc-300 p-2 text-center">
                <div className="font-bold">Performance</div>
              </div>
            </div>
          </div>
        </section>

        {/* INSIDE RIGHT PANEL - Timeline & Goals */}
        <section className="brochure-panel inside-right bg-white text-black p-8 flex flex-col">
          <div className="inline-block px-3 py-1 mb-4 border border-zinc-300 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600">
            De Route naar 2028
          </div>
          
          <h2 className="text-3xl font-bold tracking-tighter mb-6">
            Roadmap
          </h2>

          {/* Timeline */}
          <div className="relative border-l border-zinc-200 ml-3 space-y-5 flex-1">
            <div className="relative pl-6">
              <div className="absolute left-[-5px] top-2 w-2.5 h-2.5 bg-black rounded-full border-2 border-white ring-1 ring-black" />
              <div>
                <span className="font-bold text-sm">2026</span>
                <p className="text-xs text-zinc-600 mt-1">World Cup circuit & kwalificaties</p>
              </div>
            </div>

            <div className="relative pl-6">
              <div className="absolute left-[-5px] top-2 w-2.5 h-2.5 bg-black rounded-full border-2 border-white ring-1 ring-black" />
              <div>
                <span className="font-bold text-sm">2027</span>
                <p className="text-xs text-zinc-600 mt-1">Wereldkampioenschappen & finale kwalificatie</p>
              </div>
            </div>

            <div className="relative pl-6">
              <div className="absolute left-[-5px] top-2 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white ring-2 ring-red-600 scale-125" />
              <div>
                <span className="font-bold text-sm text-red-600">2028</span>
                <p className="text-xs text-zinc-600 mt-1">
                  <strong className="text-black">Paralympische Spelen Los Angeles</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Training Stats */}
          <div className="mt-6 pt-6 border-t border-zinc-200">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
              Training & Toewijding
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="text-center p-3 bg-zinc-50">
                <div className="text-xl font-bold text-black">30u</div>
                <div className="text-[10px] uppercase text-zinc-600 mt-1">per week</div>
              </div>
              <div className="text-center p-3 bg-zinc-50">
                <div className="text-xl font-bold text-black">26</div>
                <div className="text-[10px] uppercase text-zinc-600 mt-1">wedstrijden</div>
              </div>
            </div>
          </div>

          {/* Paraclimbing.be mention */}
          <div className="mt-6 p-4 bg-black text-white">
            <div className="text-[10px] uppercase tracking-wider text-zinc-400 mb-2">Sociale Impact</div>
            <p className="text-xs leading-relaxed">
              Oprichter van <strong>paraclimbing.be</strong> - een VZW die paraklimmen toegankelijk maakt voor iedereen in België.
            </p>
          </div>
        </section>

        {/* BACK PANEL - Contact & CTA */}
        <section className="brochure-panel back-cover bg-black text-white p-8 flex flex-col justify-between">
          <div>
            <div className="inline-block px-3 py-1 mb-4 border border-zinc-700 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">
              Neem Contact Op
            </div>
            
            <h2 className="text-4xl font-bold tracking-tighter mb-6">
              Laten we<br />samenwerken
            </h2>

            <p className="text-sm text-zinc-400 leading-relaxed mb-8">
              Wil je deel uitmaken van deze Paralympische reis? Neem contact op om de mogelijkheden te bespreken.
            </p>

            {/* Contact Info */}
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Email</div>
                  <a href="mailto:fre@fre2028.la" className="hover:text-zinc-300 transition-colors">
                    fre@fre2028.la
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Website</div>
                  <a href="https://www.fre2028.la" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">
                    www.fre2028.la
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Instagram className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Social Media</div>
                  <a href="https://www.instagram.com/fre.climbs" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">
                    @fre.climbs
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Download Dossier CTA */}
          <div className="space-y-4">
            <div className="border border-zinc-700 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Sponsordossier</span>
              </div>
              <p className="text-xs text-zinc-400 mb-3">
                Download het volledige partnership dossier voor meer details over mogelijkheden en pakketten.
              </p>
              <a 
                href="/Frederik-Leys-Partnership-Dossier.pdf"
                download
                className="inline-block w-full text-center bg-white text-black py-2 text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors"
              >
                Download PDF
              </a>
            </div>

            {/* Footer Branding */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
              <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-widest">
                <Mountain className="w-5 h-5" />
                <span>FRÉ2028.LA</span>
              </div>
              <div className="flex gap-3">
                <a href="https://www.instagram.com/fre.climbs" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://www.linkedin.com/in/frederik-leys-b7bb5b9/" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* OUTER BACK (visible when folded closed) */}
        <section className="brochure-panel outer-back bg-zinc-100 text-black p-8 flex items-center justify-center">
          <div className="text-center max-w-xs">
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 font-bold text-2xl uppercase tracking-widest mb-2">
                <Mountain className="w-8 h-8" />
                <span>FRÉ2028.LA</span>
              </div>
              <div className="text-xs uppercase tracking-widest text-zinc-500">
                Road to Los Angeles 2028
              </div>
            </div>

            <div className="space-y-2 text-xs text-zinc-600">
              <p>Frederik 'Fré' Leys</p>
              <p>Belgisch Paraklimmer | AL-2 Klasse</p>
              <p className="pt-2">
                <a href="https://www.fre2028.la" className="font-bold text-black hover:opacity-60 transition-opacity">
                  www.fre2028.la
                </a>
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-300">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                Oprichter Paraclimbing.be VZW
              </p>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        /* Screen View Styles */
        .brochure-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(2, 1fr);
          width: 100vw;
          min-height: 100vh;
          background: #f5f5f5;
        }

        .brochure-panel {
          min-height: 50vh;
          width: 100%;
        }

        /* Panel positioning for screen view */
        .front-cover { grid-column: 1; grid-row: 1; }
        .inside-left { grid-column: 2; grid-row: 1; }
        .inside-center { grid-column: 3; grid-row: 1; }
        .inside-right { grid-column: 1; grid-row: 2; }
        .back-cover { grid-column: 2; grid-row: 2; }
        .outer-back { grid-column: 3; grid-row: 2; }

        /* Print Styles for A4 Tri-fold */
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }

          body {
            margin: 0;
            padding: 0;
          }

          .no-print {
            display: none !important;
          }

          .brochure-container {
            display: grid;
            grid-template-columns: repeat(3, 99mm);
            grid-template-rows: repeat(2, 210mm);
            width: 297mm;
            height: 420mm;
            background: white;
            page-break-after: always;
          }

          .brochure-panel {
            width: 99mm;
            height: 210mm;
            min-height: 210mm;
            max-height: 210mm;
            overflow: hidden;
            page-break-inside: avoid;
          }

          /* Ensure proper sizing for images in print */
          .brochure-panel img {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }

        /* Responsive adjustments for smaller screens */
        @media (max-width: 1200px) {
          .brochure-container {
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: repeat(3, 1fr);
          }

          .front-cover { grid-column: 1; grid-row: 1; }
          .inside-left { grid-column: 2; grid-row: 1; }
          .inside-center { grid-column: 1; grid-row: 2; }
          .inside-right { grid-column: 2; grid-row: 2; }
          .back-cover { grid-column: 1; grid-row: 3; }
          .outer-back { grid-column: 2; grid-row: 3; }
        }

        @media (max-width: 768px) {
          .brochure-container {
            grid-template-columns: 1fr;
            grid-template-rows: auto;
          }

          .brochure-panel {
            min-height: 100vh;
          }

          .front-cover { grid-column: 1; grid-row: 1; }
          .inside-left { grid-column: 1; grid-row: 2; }
          .inside-center { grid-column: 1; grid-row: 3; }
          .inside-right { grid-column: 1; grid-row: 4; }
          .back-cover { grid-column: 1; grid-row: 5; }
          .outer-back { grid-column: 1; grid-row: 6; }
        }
      `}</style>
    </>
  );
}
