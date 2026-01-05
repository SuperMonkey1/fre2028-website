import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Video, ArrowLeft } from 'lucide-react';

export default function Node2() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <Head>
        <title>Node 2: Community Engagement - Fré Leys Road to LA 2028</title>
        <meta name="description" content="Node 2: Community Engagement - 900 Days Out" />
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
            <Video className="w-4 h-4" />
            Knooppunt 2
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
            De klimgemeenschap en avonturiers betrekken
          </h1>
          <p className="text-xl md:text-2xl text-zinc-600 leading-relaxed">
            900 Dagen
          </p>
        </div>
      </section>

      {/* Overview */}
      <section className="py-16 md:py-20 border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">Overzicht</h2>


          <div className="bg-zinc-50 border-l-4 border-black p-6 mb-8">
            <p className="text-lg text-zinc-800 leading-relaxed">
              Knooppunt 2 luidt de start in van de Youtube-serie "De Sterkste Vingers van België". 
              In deze serie nodigen we elke aflevering een bekende klimmer of avonturier uit voor een gesprek in het Old-timer Volkswagen busje van Fré (zie foto onder). 
              In het gesprek gaan we op zoek naar de strafste verhalen waarin doorzettingsvermogen centraal staat. 
              Op het einde van de aflevering laten we elke gast ook een vingerkrachtmeting doen om te zien weie nu eigenlijk de sterkste vingers heeft.
              Tegelijkertijd creëren we op subtiele wijze bewustwording voor paraklimmen en de Paralympische Spelen.
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-zinc-700 leading-relaxed mb-4">
              Door samen te werken met de bekendste klimmers en avonturiers van België, bereiken we direct het hart van de klimgemeenschap.
            </p>

            <p className="text-zinc-700 leading-relaxed mb-4">
              De serie gaat vooral om menselijke verhalen: het aangaan van uitdagingen, het streven naar persoonlijke grenzen, en de triomfen en nederlagen die daarbij horen.
              Elke aflevering toont niet alleen de fysieke kracht van de klimmers, maar ook hun mentale veerkracht, passie en de verhalen achter hun klimcarrière.
            </p>

            <p className="text-zinc-700 leading-relaxed">
              Het mooie van deze aanpak is dat het gebruik maakt van bestaande doelgroepen. Elke bekende klimmer brengt zijn eigen
              volgers mee, waardoor het bereik van de campagne dramatisch wordt vergroot zonder dat er een groot mediabudget nodig is.
            </p>

                      {/* Mobile Recording Studio */}
          <div className="text-center mb-8">
            <img
              src="/images/web/me_busje_web.webp"
              alt="Mobiele opnamestudio - het busje"
              className="w-full max-w-2xl mx-auto rounded-lg shadow-lg mb-4"
            />
            <p className="text-lg text-zinc-700">
              Dit busje wordt onze mobiele opnamestudio voor de YouTube serie "De Sterkste Vingers van België".
            </p>
          </div>

          </div>
        </div>
      </section>

      {/* The YouTube Series */}
      <section className="py-16 md:py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12">De YouTube Serie</h2>

          <div className="bg-white/10 border border-white/20 p-8 mb-8">
            <h3 className="text-3xl font-bold mb-4">
              "De sterkste Vingers van Vlaanderen"
            </h3>
            <p className="text-xl text-zinc-300 mb-2">Een 12 tal afleveringen over menselijke verhalen en uitdagingen</p>
            <p className="text-sm text-zinc-400">De Vlaamse/Belgische klimwereld en avontuurlijke mensen bereiken door verhalen van uitdagingen en doorzettingsvermogen</p>
          </div>

          {/* Concept */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6">Het Concept</h3>
            
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 p-6">
                <h4 className="font-bold text-lg mb-3 text-white">Formaat</h4>
                <p className="text-zinc-300 mb-4">
                  Elke aflevering toont één bekende klimmer of avonturier die praten over hun markantste ervaring, de uitdagingen die ze hebben overwonnen, en wat ze daaruit geleerd hebben. Het gaat om diepgaande verhalen over mentale kracht, doorzettingsvermogen en de passie voor avontuur, met subtiele verwijzingen naar paraklimmen en de Paralympics. Aan het einde van elke aflevering meten we de vingerkracht van de gast, tonen we het leaderboard, en geven we een tip over de volgende gast.
                </p>
                <ul className="space-y-2 text-zinc-400 text-sm list-disc list-inside pl-2">
                  <li>Afleveringsduur: 20 minuten</li>
                  <li>Diepgaande gesprekken over persoonlijke ervaringen</li>
                  <li>Mix van interview, verhalen en reflecties</li>
                  <li>Inspirerende boodschappen over doorzettingsvermogen</li>
                  <li>Vingerkrachtmeting en leaderboard aan het einde</li>
                  <li>Teaser voor de volgende gast</li>
                </ul>
              </div>

              <div className="bg-white/5 border border-white/10 p-6">
                <h4 className="font-bold text-lg mb-3 text-white">De Prijs</h4>
                <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-800/20 border border-yellow-600/50 p-6">
                  <p className="text-xl font-bold text-yellow-300 mb-2">De Gouden Vinger</p>
                  <p className="text-zinc-300 text-sm">
                    Een trofee gemaakt door Fré in de vorm van de gast zijn hand (we gaan dat hand 3D scannen). Deze unieke trofee wordt een
                    symbool van doorzettingsvermogen en mentale kracht in de Belgische klimgemeenschap en creëert een gedenkwaardig merk voor de serie.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Episode Structure */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6">Episode Structure</h3>
            
            <div className="space-y-4">
              <div className="bg-white/5 border-l-4 border-white/30 p-6">
                <h4 className="font-bold text-white mb-2">1. Introductie (2 minuten)</h4>
                <ul className="space-y-1 text-zinc-300 text-sm list-disc list-inside pl-2">
                  <li>Korte recap van de serie en huidige ranglijst</li>
                  <li>Introductie van de klimmer van deze aflevering</li>
                  <li>Hun achtergrond en prestaties</li>
                </ul>
              </div>

              <div className="bg-white/5 border-l-4 border-white/30 p-6">
                <h4 className="font-bold text-white mb-2">2. Interview Segment (10-12 minuten)</h4>
                <ul className="space-y-1 text-zinc-300 text-sm list-disc list-inside pl-2">
                  <li>Persoonlijke verhalen over hun klimreis en uitdagingen</li>
                  <li>Gesprekken over mentale kracht en doorzettingsvermogen</li>
                  <li>Hoe ze omgaan met tegenslagen en successen</li>
                  <li>Reflecties op hun carrière en toekomst</li>
                  <li>Meningen over paraklimmen en de Paralympics</li>
                </ul>
              </div>

              <div className="bg-white/5 border-l-4 border-white/30 p-6">
                <h4 className="font-bold text-white mb-2">3. Persoonlijke Reflectie (4-5 minuten)</h4>
                <ul className="space-y-1 text-zinc-300 text-sm list-disc list-inside pl-2">
                  <li>Diepere duik in hun meest inspirerende momenten</li>
                  <li>Gedachten over de toekomst van klimmen</li>
                  <li>Advies voor jonge klimmers</li>
                  <li>Verband leggen met bredere thema’s van doorzettingsvermogen</li>
                </ul>
              </div>

              <div className="bg-white/5 border-l-4 border-white/30 p-6">
                <h4 className="font-bold text-white mb-2">4. Vingerkrachtmeting & Afsluiting (2-3 minuten)</h4>
                <ul className="space-y-1 text-zinc-300 text-sm list-disc list-inside pl-2">
                  <li>Vingerkracht test uitvoeren</li>
                  <li>Leaderboard tonen en positie onthullen</li>
                  <li>Teaser voor volgende gast</li>
                  <li>Call to action (abonneren, volgen, ondersteunen)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Future Potential */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-zinc-50 to-white border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12">Toekomst Potentiëel</h2>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-8 mb-8">
            <h3 className="text-2xl font-bold mb-4">De Klimzaal Tour</h3>
            <p className="text-lg text-zinc-800 mb-4">
              Na afloop van de serie wordt de tour een rondreizende activatie die klimzalen
              bezoekt in heel België.
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-zinc-200 p-6">
              <h4 className="font-bold text-lg mb-3">Hoe Het Werkt</h4>
              <ul className="space-y-2 text-zinc-700 list-disc list-inside pl-2">
                <li>Dezelfde tour setup reist naar verschillende klimzalen</li>
                <li>Alle klimmers kunnen deelnemen aan inspirerende sessies</li>
                <li>Verhalen worden gedeeld en verbonden met de serie</li>
                <li>Lokale gemeenschappen worden betrokken</li>
                <li>Nationale bewustzijn wordt vergroot</li>
              </ul>
            </div>

            <div className="bg-white border border-zinc-200 p-6">
              <h4 className="font-bold text-lg mb-3">Voordelen</h4>
              <div className="space-y-3 text-zinc-700">
                <p>
                  <strong>Voor klimmers:</strong> Leuk uitdaging en kans om zichzelf te vergelijken met de profs
                </p>
                <p>
                  <strong>Voor klimzalen:</strong> Gratis activatie/evenement dat leden samenbrengt
                </p>
                <p>
                  <strong>Voor de campagne:</strong> Directe interactie met duizenden klimmers, bewustzijn opbouwen
                  en gemeenschap op grassroots niveau
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-6">
              <h4 className="font-bold text-lg mb-3 text-blue-900">Mogelijkheid voor Mondiale Uitbreiding</h4>
              <p className="text-blue-800 text-sm">
                Als het succesvol is in België, kan het concept internationaal uitbreiden. Repliceer de serie in andere
                landen, waardoor een wereldwijd "Sterkste Greep" kampioenschap ontstaat dat paraklimmen wereldwijd promoot.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Production Plan - temporarily hidden
      <section className="py-16 md:py-20 border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12">Production Plan</h2>

          <div className="space-y-6">
            <div className="bg-white border border-zinc-200 p-6">
              <h3 className="font-bold text-xl mb-4">Tijdlijn</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-24 font-bold text-sm text-zinc-600">Maanden 1-2</div>
                  <div className="text-zinc-700">
                    <p className="font-bold mb-1">Pre-productie</p>
                    <p className="text-sm">Opzet ontwerp & bouw, deelnemer outreach, filmplanning</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-24 font-bold text-sm text-zinc-600">Maanden 3-7</div>
                  <div className="text-zinc-700">
                    <p className="font-bold mb-1">Productie</p>
                    <p className="text-sm">Film alle 12 afleveringen (3 afleveringen per maand)</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-24 font-bold text-sm text-zinc-600">Maanden 3-12</div>
                  <div className="text-zinc-700">
                    <p className="font-bold mb-1">Release</p>
                    <p className="text-sm">Wekelijkse releases (één aflevering elke 1-2 weken)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 p-6">
              <h3 className="font-bold text-xl mb-4">Benodigde Middelen</h3>
              <ul className="space-y-2 text-zinc-700 list-disc list-inside pl-2">
                <li><strong>Uitrusting:</strong> Professionele testopstelling (krachtmeter, gestandaardiseerde greep, montagesysteem)</li>
                <li><strong>Video:</strong> Camera, verlichting, audio apparatuur (kan relatief eenvoudig zijn)</li>
                <li><strong>Bewerking:</strong> Video bewerkingssoftware en vaardigheden (mogelijk uitbesteed)</li>
                <li><strong>Locatie:</strong> Consistente film locatie (klimzaal of trainingsruimte)</li>
                <li><strong>Graphics:</strong> Intro/outro graphics, ranglijst graphics, lower thirds</li>
              </ul>
            </div>

            <div className="bg-white border border-zinc-200 p-6">
              <h3 className="font-bold text-xl mb-4">Budget Overwegingen</h3>
              <div className="space-y-3 text-zinc-700">
                <p>
                  <strong>Test Opstelling:</strong> €500-1,500 (eenmalige investering, herbruikbaar voor klimzaal tour)
                </p>
                <p>
                  <strong>Trofee:</strong> €200-500 (custom gouden vinger trofee)
                </p>
                <p>
                  <strong>Video Productie:</strong> €0-2,000 (afhankelijk van reeds bezeten vs. benodigde apparatuur)
                </p>
                <p>
                  <strong>Bewerking:</strong> €0-1,500 (DIY vs. uitbesteed bewerking)
                </p>
                <p className="pt-3 border-t border-zinc-200 font-bold">
                  Totaal Geschat: €700-5,500
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* Navigation */}
      <section className="py-12 bg-white border-t border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => router.push('/communication-plan/node-1')}
              className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:opacity-60 transition-opacity"
            >
              <ArrowLeft className="w-4 h-4" />
              Node 1
            </button>
            <button 
              onClick={() => router.push('/communication-plan/node-3')}
              className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:opacity-60 transition-opacity"
            >
              Next: Node 3
              <span className="rotate-180"><ArrowLeft className="w-4 h-4" /></span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
