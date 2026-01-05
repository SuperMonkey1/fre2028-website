import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Mountain, ArrowLeft } from 'lucide-react';

export default function Node3() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <Head>
        <title>Knooppunt 3: Evenementen Organiseren - Fré Leys Road to LA 2028</title>
        <meta name="description" content="Knooppunt 3: Evenementen Organiseren - Belgisch Paraklimmen Kampioenschap, 800 Dagen" />
      </Head>

      {/* Header */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-4">
          <button 
            onClick={() => router.push('/communication-plan')}
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:opacity-60 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug naar Communicatieplan
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-zinc-50 to-white border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 border border-zinc-300 text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">
            <Mountain className="w-4 h-4" />
            Knooppunt 3
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
            Belgisch Kampioenschap Paraklimmen 
          </h1>
          <p className="text-xl md:text-2xl text-zinc-600 leading-relaxed">
            800 Dagen - Belgisch Paraklimmen Kampioenschap
          </p>
        </div>
      </section>

      {/* Overview */}
      <section className="py-16 md:py-20 border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">Overzicht</h2>

          <div className="bg-zinc-50 border-l-4 border-black p-6 mb-8">
            <p className="text-lg text-zinc-800 leading-relaxed">
              Knooppunt 3 richt zich op het organiseren van het <strong>Belgisch Kampioenschap Paraklimmen</strong>, een open internationale competitie
              die meerdere strategische doelen dient: de Belgische paraklimmen gemeenschap laten groeien, internationale
              exposure bieden en Belgische routebouwers opleiden in paraklim-specifieke routebouw.
              De organisatie gebeurt door VZW Paraclimbing.be in samenwerking met Klimclub BVKB.
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-zinc-700 leading-relaxed mb-4">
              Dit evenement is meer dan alleen een competitie—het is een investering in de toekomst van het Belgische paraklimmen. Door
              infrastructuur te creëren (getrainde routesetters) en gemeenschap (nieuwe paraklimmers), bouwen we een
              duurzame ecosysteem dat mijn persoonlijke reis naar LA 2028 zal overleven.
            </p>

            <p className="text-zinc-700 leading-relaxed">
              De strategische timing—gepland het weekend na een grote internationale paraklimmen competitie in Oostenrijk—
              maximaliseert internationale deelname terwijl de reiskosten voor atleten worden geminimaliseerd.
            </p>
          </div>
        </div>
      </section>

      {/* The Event */}
      <section className="py-16 md:py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12">Het Evenement</h2>

          <div className="bg-white/10 border border-white/20 p-8 mb-8">
            <h3 className="text-3xl font-bold mb-4">Belgisch Paraklimmen Kampioenschap</h3>
            <p className="text-xl text-zinc-300 mb-2">Een open internationale competitie</p>
            <p className="text-sm text-zinc-400">Georganiseerd door VZW Paraclimbing.be in samenwerking met Klimclub BVKB</p>
          </div>

          {/* Event Details */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6">Evenement Details</h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/10 p-6">
                <h4 className="font-bold text-lg mb-3 text-white">Wanneer</h4>
                <p className="text-zinc-300 mb-2">20-21 juni</p>
                <p className="text-sm text-zinc-400">
                  Weekend direct volgend op de Oostenrijkse internationale competitie
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 p-6">
                <h4 className="font-bold text-lg mb-3 text-white">Waar</h4>
                <p className="text-zinc-300 mb-2">Klimzaal Klimax, Puurs</p>
                <p className="text-sm text-zinc-400">
                  Thuisklimzaal van Klimclub BVKB
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 p-6">
                <h4 className="font-bold text-lg mb-3 text-white">Organisatoren</h4>
                <ul className="space-y-1 text-zinc-300 text-sm">
                  <li>• VZW Paraclimbing.be (non-profit)</li>
                  <li>• Klimclub BVKB</li>
                  <li>• Klimax (klimzaal)</li>
                </ul>
              </div>

              <div className="bg-white/5 border border-white/10 p-6">
                <h4 className="font-bold text-lg mb-3 text-white">Verwachte Deelnemers</h4>
                <ul className="space-y-1 text-zinc-300 text-sm">
                  <li>• Internationale paraklimmers</li>
                  <li>• Belgische paraklimmers</li>
                  <li>• Nieuwe deelnemers van initiatie</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Strategic Timing */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6">Strategische Timing</h3>

            <div className="bg-white/5 border border-white/10 p-6">
              <h4 className="font-bold text-lg mb-3 text-white">De "Hop By" Strategie</h4>
              <p className="text-zinc-300 mb-4">
                Door direct na een grote Oostenrijkse competitie te plannen, maken we het gemakkelijk voor internationale
                atleten om aan beide evenementen deel te nemen zonder aparte reizen te hoeven maken.
              </p>

         
            </div>
          </div>
        </div>
      </section>

      {/* Two-Day Structure */}
      <section className="py-16 md:py-20 border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12">Twee-Daagse Evenement Structuur</h2>

          <div className="space-y-8">
            {/* Day 1 */}
            <div className="bg-gradient-to-r from-green-50 to-white border-l-4 border-green-600 p-8">
              <div className="mb-6">
                <div className="inline-block px-4 py-2 mb-2 bg-green-600 text-white text-xs font-bold uppercase tracking-wider">
                  Dag 1 - Vrijdag, 20 juni
                </div>
                <h3 className="text-2xl font-bold">Klim Initiatie voor Nieuwe Belgische Paraklimmers</h3>
              </div>

              <div className="space-y-4">
                <p className="text-zinc-700 leading-relaxed">
                  De eerste dag richt zich op het verwelkomen van nieuwe Belgische paraklimmers in de sport door middel van gestructureerde
                  introductie en praktijkervaring.
                </p>

                <div className="bg-white border border-zinc-200 p-6">
                  <h4 className="font-bold mb-3">Programma Overzicht</h4>
                  <div className="space-y-3 text-sm text-zinc-700">
                    <div className="flex gap-4">
                      <span className="font-bold w-24 flex-shrink-0">9:00-10:00</span>
                      <div>
                        <p className="font-bold">Welkom & Introductie</p>
                        <p className="text-zinc-600">Registratie, uitrusting aanpassen, veiligheidsbriefing</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-bold w-24 flex-shrink-0">10:00-12:00</span>
                      <div>
                        <p className="font-bold">Paraklimmen 101</p>
                        <p className="text-zinc-600">Introductie van verschillende categorieën, regels en technieken</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-bold w-24 flex-shrink-0">12:00-13:00</span>
                      <div>
                        <p className="font-bold">Lunch</p>
                        <p className="text-zinc-600">Gemeenschapsopbouw en netwerken</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-bold w-24 flex-shrink-0">13:00-16:00</span>
                      <div>
                        <p className="font-bold">Oefensessies</p>
                        <p className="text-zinc-600">Begeleid klimmen op verschillende routes, persoonlijke coaching</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-bold w-24 flex-shrink-0">16:00-17:00</span>
                      <div>
                        <p className="font-bold">Vragen & Afsluiting</p>
                        <p className="text-zinc-600">Open discussie, bronnen, volgende stappen</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 p-4">
                  <h4 className="font-bold mb-2 text-green-900">Doelen voor Dag 1</h4>
                  <ul className="space-y-1 text-sm text-green-800 list-disc list-inside pl-2">
                    <li>Introduceer minstens 10-15 nieuwe Belgische klimmers aan paraklimmen</li>
                    <li>Bied een veilige, ondersteunende eerste klimervaring</li>
                    <li>Bouw gemeenschap onder Belgische paraklimmers</li>
                    <li>Identificeer potentiële toekomstige concurrenten</li>
                    <li>Creëer content (foto's, video's) die de Belgische paraklimmen groei tonen</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Day 2 */}
            <div className="bg-gradient-to-r from-blue-50 to-white border-l-4 border-blue-600 p-8">
              <div className="mb-6">
                <div className="inline-block px-4 py-2 mb-2 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider">
                  Dag 2 - Zaterdag, 21 juni
                </div>
                <h3 className="text-2xl font-bold">Paraklimmen Routesetting Cursus</h3>
              </div>

              <div className="space-y-4">
                <p className="text-zinc-700 leading-relaxed">
                  De tweede dag traint Belgische routesetters in de specifieke vaardigheden die nodig zijn om kwaliteitsroutes
                  te zetten voor paraklimmen competities, terwijl de nieuwe paraklimmers van Dag 1 de routes testen.
                </p>

                <div className="bg-white border border-zinc-200 p-6">
                  <h4 className="font-bold mb-3">Programma Overzicht</h4>
                  <div className="space-y-3 text-sm text-zinc-700">
                    <div className="flex gap-4">
                      <span className="font-bold w-24 flex-shrink-0">9:00-10:00</span>
                      <div>
                        <p className="font-bold">Cursus Introductie</p>
                        <p className="text-zinc-600">Paraklimmen categorieën, classificatiesysteem, IFSC regels</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-bold w-24 flex-shrink-0">10:00-12:30</span>
                      <div>
                        <p className="font-bold">Routesetting Theorie</p>
                        <p className="text-zinc-600">Categorie-specifieke setting technieken, toegankelijkheidsoverwegingen</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-bold w-24 flex-shrink-0">12:30-13:30</span>
                      <div>
                        <p className="font-bold">Lunch</p>
                        <p className="text-zinc-600">Discussie en kennisdeling</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-bold w-24 flex-shrink-0">13:30-16:00</span>
                      <div>
                        <p className="font-bold">Praktisch Setting</p>
                        <p className="text-zinc-600">Routesetters creëren routes voor verschillende categorieën</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-bold w-24 flex-shrink-0">16:00-18:00</span>
                      <div>
                        <p className="font-bold">Testen & Feedback</p>
                        <p className="text-zinc-600">Nieuwe paraklimmers testen routes, setters observeren en leren</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-bold w-24 flex-shrink-0">18:00-19:00</span>
                      <div>
                        <p className="font-bold">Debrief & Certificering</p>
                        <p className="text-zinc-600">Cursus afsluiting, certificaat uitreiking</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4">
                  <h4 className="font-bold mb-2 text-blue-900">Doelen voor Dag 2</h4>
                  <ul className="space-y-1 text-sm text-blue-800 list-disc list-inside pl-2">
                    <li>Train 8-12 Belgische routesetters in paraklimmen-specifieke technieken</li>
                    <li>Creëer een pool van gekwalificeerde setters voor toekomstige Belgische evenementen</li>
                    <li>Bied echte testmogelijkheid voor Dag 1 deelnemers</li>
                    <li>Bouw relaties tussen setters en klimmers</li>
                    <li>Stel België voor als competente gastheer voor internationale paraklimmen evenementen</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* The Synergy */}
          <div className="mt-12 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 p-8">
            <h3 className="text-2xl font-bold mb-4">De Perfecte Synergie</h3>
            <p className="text-zinc-700 mb-4">
              De twee-daagse structuur creëert een wederzijds voordelig ecosysteem:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/80 p-4 border border-purple-200">
                <h4 className="font-bold mb-2">Dag 1 Voorziet Dag 2 van:</h4>
                <ul className="space-y-1 text-sm text-zinc-700 list-disc list-inside pl-2">
                  <li>Testklimmers voor nieuwe routes</li>
                  <li>Echte feedback over routekwaliteit</li>
                  <li>Diverse vaardigheidsniveaus om setters uit te dagen</li>
                </ul>
              </div>
              <div className="bg-white/80 p-4 border border-purple-200">
                <h4 className="font-bold mb-2">Dag 2 Voorziet Dag 1 van:</h4>
                <ul className="space-y-1 text-sm text-zinc-700 list-disc list-inside pl-2">
                  <li>Verse routes om op te klimmen en te oefenen</li>
                  <li>Voortgezette betrokkenheid en leren</li>
                  <li>Gevoel van bij te dragen aan iets groters</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Competition Weekend */}
      <section className="py-16 md:py-20 bg-zinc-50 border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12">Het Kampioenschap Competitie</h2>

          <div className="bg-white border border-zinc-200 p-8 mb-8">
            <p className="text-zinc-700 mb-4">
              Naast (of geïntegreerd met) het twee-daagse programma vindt de daadwerkelijke <strong>Belgische Paraklimmen Kampioenschap</strong>
              competitie plaats. Dit is een officiële ranking evenement open voor alle paraklimmers.
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <p className="text-sm text-yellow-900">
                <strong>Opmerking:</strong> De exacte integratie van de competitie met de initiatie- en trainingsdagen
                is flexibel en zal bepaald worden gebaseerd op deelnemersaantallen en logistieke overwegingen.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-zinc-200 p-6">
              <h3 className="font-bold text-xl mb-4">Competitie Formaat</h3>
              <ul className="space-y-2 text-zinc-700 list-disc list-inside pl-2">
                <li>IFSC-goedgekeurde paraklimmen competitie</li>
                <li>Meerdere categorieën gebaseerd op handicapclassificatie</li>
                <li>Boulder en/of lead format (nog te bepalen)</li>
                <li>Open voor internationale deelnemers</li>
                <li>Belgische Kampioenschap titels toegekend aan top Belgische klimmers in elke categorie</li>
              </ul>
            </div>

            <div className="bg-white border border-zinc-200 p-6">
              <h3 className="font-bold text-xl mb-4">Verwachte Deelname</h3>
              <div className="space-y-3 text-zinc-700">
                <p>
                  <strong>Internationale klimmers:</strong> 20-40 atleten (afhankelijk van Oostenrijkse competitie deelname)
                </p>
                <p>
                  <strong>Belgische klimmers:</strong> 5-10 bestaande + 10-15 nieuwe van initiatie = 15-25 totaal
                </p>
                <p className="pt-3 border-t border-zinc-200">
                  <strong>Totaal verwacht:</strong> 35-65 concurrenten
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>







      {/* Navigation */}
      <section className="py-12 bg-zinc-50 border-t border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex justify-between items-center">
            <button
              onClick={() => router.push('/communication-plan/de-sterkste-vingers-van-Belgie')}
              className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:opacity-60 transition-opacity"
            >
              <ArrowLeft className="w-4 h-4" />
              Knooppunt 2
            </button>
            <button
              onClick={() => router.push('/communication-plan/node-4')}
              className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:opacity-60 transition-opacity"
            >
              Volgende: Knooppunt 4
              <span className="rotate-180"><ArrowLeft className="w-4 h-4" /></span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
