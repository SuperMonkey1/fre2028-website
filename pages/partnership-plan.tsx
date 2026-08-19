import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Mountain, Target, Users, Briefcase, Award, TrendingUp, ArrowLeft } from 'lucide-react';

export default function PartnershipPlan() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <Head>
        <title>Partnerschap Plan - Fré Leys Road to LA 2028</title>
        <meta name="description" content="Volledig partnerschap en sponsorplan voor Fré Leys' reis naar de LA 2028 Paralympische Spelen" />
      </Head>

      {/* Header */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-4">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:opacity-60 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug naar Home
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-zinc-50 to-white border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 border border-zinc-300 text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">
            <Briefcase className="w-4 h-4" />
            Strategisch Plan
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
            Partnerschap Plan
          </h1>
          <p className="text-xl md:text-2xl text-zinc-600 leading-relaxed">
            LA 2028 Team & Sponsorschap Strategie
          </p>
        </div>
      </section>

      {/* Core Objectives */}
      <section className="py-16 md:py-20 border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Target className="w-8 h-8" />
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Kern Doelstellingen</h2>
          </div>

          <div className="space-y-6">
            <div className="border-l-4 border-black pl-6 py-2">
              <h3 className="font-bold text-xl mb-2">1. Presteren</h3>
              <p className="text-zinc-700 leading-relaxed">
                De nodige financiële, professionele en prestatiegerichte ondersteuning veiligstellen om succesvol te trainen voor en te kwalificeren voor de LA 2028 Paralympische Spelen.
              </p>
            </div>

            <div className="border-l-4 border-black pl-6 py-2">
              <h3 className="font-bold text-xl mb-2">2. Sociaal engagement</h3>
              <p className="text-zinc-700 leading-relaxed">
                Een toegewijde team opbouwen (van partners, sponsors en professionals) om actief de <strong>Paralympische Spelen van 2028</strong> te promoten in <strong>Leuven en Vlaanderen</strong>.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Financial Partners */}
      <section className="py-16 md:py-20 bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-8 h-8" />
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">1. De Leuven 25 Support Circle</h2>
          </div>

          <p className="text-lg text-zinc-700 leading-relaxed mb-8">
            Om als professioneel atleet 100% te kunnen focussen op goud in LA 2028, bouw ik aan een hecht netwerk van <strong>25 geëngageerde Leuvense partners</strong> aan <strong>€100 per maand (€1.200 per jaar)</strong>. Dit levert het noodzakelijke jaarlijkse werkingsbudget van net geen €25.000 - €30.000 om voltijds te kunnen trainen, rusten en de campagne te leiden.
          </p>

          {/* Context & Waarom dit nodig is */}
          <div className="bg-white border border-zinc-200 p-8 mb-8 space-y-6">
            <h3 className="text-2xl font-bold">Waarom deze steun noodzakelijk is</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border-l-4 border-amber-500 pl-4 py-1 bg-amber-50/50">
                <h4 className="font-bold text-sm text-zinc-900 mb-1">Amper overheidsmiddelen</h4>
                <p className="text-sm text-zinc-700">
                  Zelfs wedstrijdkosten worden niet volledig gedekt. Zo moet ik voor mijn internationale wedstrijden in 2026 circa <strong>€3.500 uit eigen middelen</strong> betalen. In omringende landen worden paraklimmers voltijds professioneel omkaderd met aanzienlijke budgetten.
                </p>
              </div>

              <div className="border-l-4 border-black pl-4 py-1 bg-zinc-50">
                <h4 className="font-bold text-sm text-zinc-900 mb-1">Voltijds topsporttraject</h4>
                <p className="text-sm text-zinc-700">
                  Aanvankelijk wilde ik enkel klimkosten dekken, maar een 100% voorbereiding is onmogelijk combineerbaar met een reguliere job. Naast fysieke training en herstel is dit communicatietraject alleen al bijna een halftijdse baan.
                </p>
              </div>
            </div>
          </div>

          {/* 25 Leuven Partners Details */}
          <div className="bg-white border-2 border-black p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-6">
              <h3 className="text-2xl font-bold">Het Partnerpakket</h3>
              <span className="inline-block px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-wider">
                €100 / maand • €1.200 / jaar
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Doelwit</div>
                <p className="text-zinc-700 font-medium">25 Leuvense ondernemingen & leiders</p>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Aanpak</div>
                <p className="text-zinc-700">3 maanden gerichte media- & netwerkpush in Leuven</p>
              </div>
            </div>

            <div className="space-y-4 text-zinc-700">
              <div className="bg-zinc-50 p-5 border border-zinc-200">
                <h4 className="font-bold text-sm uppercase tracking-wider text-zinc-900 mb-3">Concrete Return voor Partners:</h4>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li><strong>Zichtbaarheid:</strong> Alle 25 sponsors worden vermeld op de officiële <strong>campagneposter</strong>, de <strong>website</strong> en het <strong>wedstrijd/campagne T-shirt</strong>.</li>
                  <li><strong>Exclusief Jaarevent:</strong> 1x per jaar exclusief partnerevent met kliminitiatie, filmvertoning en keynote talk (over veerkracht, innovatie en ingenieursaanpak in topsport).</li>
                  <li><strong>Kerstmarkt 2027:</strong> Partneractivatie en zichtbaarheid op de Leuvense Kerstmarkt.</li>
                  <li><strong>Grote Poster 2028:</strong> Huis-aan-huis verspreiding in elk huis in Leuven en op alle scholen (in samenwerking met Stad Leuven).</li>
                  <li><strong>Maatschappelijke impact:</strong> Structurele promotie voor paraklimmen via <a href="https://paraclimbing.be" target="_blank" rel="noopener noreferrer" className="underline font-semibold">paraclimbing.be</a> en aandacht voor de Paralympische Spelen in Leuven.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-2">Waarom uitsluitend Leuven?</h4>
                <p className="text-sm">
                  Enerzijds praktisch voor events en samenwerking, anderzijds omdat ik mijn zichtbaarheid en inzet rond de Paralympische Spelen bewust wil focussen op mijn thuisstad Leuven.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Partners */}
      <section className="py-16 md:py-20 border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Users className="w-8 h-8" />
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">2. Strategische Partners (Leuven)</h2>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 p-8">
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-2">Pro Bono Expertise & Media</p>
              <h3 className="text-xl font-bold mb-4">Lokale Partners in Communicatie & Diensten</h3>
            </div>

            <div className="space-y-4 text-zinc-700">
              <div>
                <h4 className="font-bold mb-2">Doel:</h4>
                <p>Professionele expertise inzetten voor de 3-maanden push, mediacampagnes, PR en content creation zonder cashflowdruk op het sportieve budget.</p>
              </div>

              <div>
                <h4 className="font-bold mb-2">Doelwit & Profiel:</h4>
                <ul className="list-disc list-inside space-y-1 pl-4 text-sm">
                  <li>PR & Communicatiebureaus uit Leuven</li>
                  <li>Content creators (videografie, fotografie, storytelling)</li>
                  <li>Media- en distributiepartners</li>
                  <li>Juridische en administratieve ondersteuning</li>
                </ul>
              </div>

              <div className="bg-white p-4 border-l-4 border-black">
                <h4 className="font-bold mb-2">De Teruggave:</h4>
                <p className="text-sm">Volledige erkenning als Strategisch Partner op de website, in persberichten, events en bij alle gezamenlijke campagnes.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Team */}
      <section className="py-16 md:py-20 bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Award className="w-8 h-8" />
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">3. Het Performance Team</h2>
          </div>

          <div className="bg-white border border-zinc-200 p-8">
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-2">Expert Topsportkader</p>
              <h3 className="text-xl font-bold mb-4">Atletische, Fysieke & Mentale Begeleiding</h3>
            </div>

            <div className="space-y-4 text-zinc-700">
              <div>
                <h4 className="font-bold mb-2">Doel:</h4>
                <p>De wetenschappelijke en sportieve structuur die ervoor zorgt dat Fré in topvorm aan de start verschijnt in Los Angeles 2028.</p>
              </div>

              <div>
                <h4 className="font-bold mb-2">Team Leden:</h4>
                <ul className="list-disc list-inside space-y-1 pl-4 text-sm">
                  <li>Hoofdcoach & Klimtrainers</li>
                  <li>Kinesitherapeut & Revalidatiespecialist</li>
                  <li>Sportpsycholoog & Mentale Coach</li>
                  <li>Voedingsdeskundige</li>
                  <li>Klim- en Bergsportfederatie / G-Sport Vlaanderen</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Table */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">Samenvatting Partnerschap Structuur</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-zinc-300">
              <thead>
                <tr className="bg-black text-white">
                  <th className="border border-zinc-300 p-4 text-left font-bold">Pijler</th>
                  <th className="border border-zinc-300 p-4 text-left font-bold">1. Financiële Partners</th>
                  <th className="border border-zinc-300 p-4 text-left font-bold">2. Strategische Partners</th>
                  <th className="border border-zinc-300 p-4 text-left font-bold">3. Performance Team</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr>
                  <td className="border border-zinc-300 p-4 font-bold">Doel</td>
                  <td className="border border-zinc-300 p-4">Voltijds professioneel topsporttraject & reiskosten dekken</td>
                  <td className="border border-zinc-300 p-4">Media, PR, video & mediapush pro-bono</td>
                  <td className="border border-zinc-300 p-4">Fysieke, technische & mentale topbegeleiding</td>
                </tr>
                <tr className="bg-zinc-50">
                  <td className="border border-zinc-300 p-4 font-bold">Focus</td>
                  <td className="border border-zinc-300 p-4">Leuven</td>
                  <td className="border border-zinc-300 p-4">Leuven</td>
                  <td className="border border-zinc-300 p-4">Nationaal / Internationaal</td>
                </tr>
                <tr>
                  <td className="border border-zinc-300 p-4 font-bold">Aantal</td>
                  <td className="border border-zinc-300 p-4">25 partners</td>
                  <td className="border border-zinc-300 p-4">3 - 5 partners</td>
                  <td className="border border-zinc-300 p-4">Kernteam van experts</td>
                </tr>
                <tr className="bg-zinc-50">
                  <td className="border border-zinc-300 p-4 font-bold">Bijdrage</td>
                  <td className="border border-zinc-300 p-4">€100 / maand (€1.200 / jaar)</td>
                  <td className="border border-zinc-300 p-4">Pro bono diensten & expertise</td>
                  <td className="border border-zinc-300 p-4">Expertise & coaching</td>
                </tr>
                <tr>
                  <td className="border border-zinc-300 p-4 font-bold">Return</td>
                  <td className="border border-zinc-300 p-4">Poster, website, T-shirt, jaarevent, Kerstmarkt 2027, huis-aan-huis poster 2028</td>
                  <td className="border border-zinc-300 p-4">Erkenning, netwerk & media-associatie</td>
                  <td className="border border-zinc-300 p-4">Paralympisch goud & topsportsucces</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-100 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2 font-bold uppercase tracking-widest mb-4">
            <Mountain className="w-6 h-6" />
            <span>Fré2028.LA</span>
          </div>
          <p className="text-sm text-zinc-600">Partnerschap Plan - Weg naar LA 2028 Paralympics</p>
        </div>
      </footer>
    </div>
  );
}
