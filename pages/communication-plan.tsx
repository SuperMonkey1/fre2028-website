import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Mountain, Calendar, Radio, Video, Newspaper, Globe, TrendingUp, ArrowLeft, Target } from 'lucide-react';

export default function CommunicationPlan() {
  const router = useRouter();

  // Calculate days until Paralympics (August 15, 2028)
  const paralympicsDate = new Date('2028-08-15');
  const today = new Date();
  const daysRemaining = Math.ceil((paralympicsDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const formattedDate = paralympicsDate.toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <Head>
        <title>Communicatiecampagne - Fré Leys Road to LA 2028</title>
        <meta name="description" content="Volledige communicatie- en marketingcampagneplan voor Fré Leys' reis naar de Paralympische Spelen LA 2028" />
      </Head>

      {/* Header */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:opacity-60 transition-opacity"
            >
              <ArrowLeft className="w-4 h-4" />
              Terug naar Home
            </button>
            <div className="text-right">
              <div className="text-lg font-bold text-black">
                Nog {daysRemaining} dagen...
              </div>
              <div className="text-xs font-thin text-zinc-500">
                {formattedDate}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-zinc-50 to-white border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-300 text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">
              <Radio className="w-4 h-4" />
              Communicatiecampagne
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 border border-amber-300 text-amber-900 text-xs font-extrabold uppercase tracking-wider rounded-sm">
              "Engineering my way to the Paralympics in 2028"
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
            Road to LA 2028
          </h1>
          <p className="text-xl md:text-2xl text-zinc-600 leading-relaxed">
             Mijn reis als burgerlijk ingenieur en paraklimmer om Leuvense innovatie, mechatronica en topsport te verenigen op weg naar de Paralympische Spelen van 2028.
          </p>
        </div>
      </section>

      {/* The Vision */}
      <section className="py-16 md:py-20 border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Target className="w-8 h-8" />
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">De Visie: The Engineer-Athlete</h2>
          </div>
          
          <div className="space-y-6 text-lg text-zinc-700 leading-relaxed">
            <div>
              <h3 className="font-bold text-black mb-2">Wie ik ben:</h3>
              <p>Mijn naam is Dr. Ir. Frederik Leys. Ik ben een burgerlijk ingenieur (doctoraat in de Werktuigkunde aan de KU Leuven) en paraklimmer, lid van het Belgische klimteam sinds 2016 en geboren met een beperking aan mijn rechterbeen waarvoor ik een prothese draag. Momenteel ben ik tweede op de wereldranglijst in mijn klasse met 2x Wereldbeker Goud. In 2022 richtte ik de <strong>VZW Paraclimbing.be</strong> op om mensen met een fysieke beperking te inspireren en te begeleiden in de klimsport.</p>
            </div>

            <div>
              <h3 className="font-bold text-black mb-2">"Engineering my way to the Paralympics in 2028"</h3>
              <p>Klimmen debuteert in 2028 voor het eerst in de geschiedenis op de Paralympische Spelen in Los Angeles. Als maker en ingenieur benader ik topsport als een optimalisatie- en innovatievraagstuk: custom trainingsapparatuur, sensoren, biomechanische data en spitstechnologie uit het innovatieve Leuvense ecosysteem fungeren als mijn R&D-testbed richting goud.</p>
            </div>

            <div>
              <h3 className="font-bold text-black mb-2">De eerste Leuvense Paralympiër & een gouden hefboom</h3>
              <p>Mijn ultieme doel is om de <strong>allereerste Paralympiër van Leuven</strong> te worden en goud te winnen voor België. Maar bovenal wil ik deze opportuniteit aangrijpen om het Leuvense innovatieve bedrijfsleven en het brede publiek te verbinden met de <strong>Paralympische beweging</strong> en inclusieve topsport.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Campaign Hub */}
      <section className="py-16 md:py-20 border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Globe className="w-8 h-8" />
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Centrale Campagne Hub: FRE2028.LA</h2>
          </div>

          <div className="bg-black text-white p-8 mb-6">
            <p className="text-xl mb-4">
              Het middelpunt van deze campagne is mijn website, <strong className="text-2xl">FRE2028.LA</strong>
            </p>
            <p className="text-zinc-400 text-sm">
              Het <code className="bg-white/10 px-2 py-1">.LA</code> domein werd specifiek gekozen omwille van de gaststad van de Paralympische Spelen in 2028.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-xl">De website bevat:</h3>
            <ul className="space-y-3 text-zinc-700">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-zinc-200 rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                <span>Mijn persoonlijk verhaal</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-zinc-200 rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                <span>Dit communicatieplan</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-zinc-200 rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                <span>Een showcase van mijn sponsors en "Team Fré"</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-zinc-200 rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                <span>Een portfolio (foto's, video's, podcasts en andere media)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-zinc-200 rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                <span>Mijn wedstrijdresultaten</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-zinc-200 rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                <span>Mijn maandelijkse blog met details over de "obstakels, bevindingen en ontdekkingen op mijn weg naar LA 2028"</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-zinc-200 rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                <span>Een link naar mijn vzw: <strong>Paraclimbing.be</strong></span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Campaign Strategy */}
      <section className="py-16 md:py-20 bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-8 h-8" />
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Campagnestrategie & Fasering</h2>
          </div>

          <div className="bg-white border-l-4 border-black p-6 mb-8">
            <p className="text-lg text-zinc-700 leading-relaxed">
              De gehele campagne wandelt van <strong>"knooppunt tot knooppunt"</strong>—belangrijke initiatieven gepland om de 100 dagen.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-zinc-200 p-6">
              <div className="inline-block px-4 py-2 mb-4 bg-black text-white text-xs font-bold uppercase tracking-wider">
                Fase 1
              </div>
              <h3 className="text-2xl font-bold mb-2">Dagen 1000 - 501</h3>
              <p className="text-zinc-700">Primaire focus op mijn thuisstad <strong>Leuven</strong>.</p>
            </div>

            <div className="bg-white border border-zinc-200 p-6">
              <div className="inline-block px-4 py-2 mb-4 bg-black text-white text-xs font-bold uppercase tracking-wider">
                Fase 2
              </div>
              <h3 className="text-2xl font-bold mb-2">Dagen 500 - 0</h3>
              <p className="text-zinc-700">Uitbreiding van de focus naar <strong>Vlaanderen</strong> en bewustwording op nationaal niveau.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 md:py-20 border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="mb-12">
            <div className="inline-block px-4 py-2 mb-4 bg-black text-white text-xs font-bold uppercase tracking-wider">
              Campagne Tijdslijn
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Knooppunten</h2>
            <p className="text-zinc-600 text-lg">Van 1000 dagen tot de Paralympische Spelen</p>
          </div>

          {/* Timeline Container */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-zinc-200 md:left-8"></div>

            {/* Node 1 */}
            <div 
              onClick={() => router.push('/communication-plan/node-1')}
              className="relative pl-8 md:pl-20 pb-12 cursor-pointer hover:opacity-75 transition-opacity group"
            >
              <div className="absolute left-0 top-0 w-4 h-4 bg-green-600 rounded-full border-4 border-white md:left-6"></div>
              <div className="bg-gradient-to-r from-green-50 to-white border-l-4 border-green-600 p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                  <div className="text-sm font-bold uppercase tracking-widest text-green-600 mb-2 md:mb-0">
                    Knooppunt 1
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-zinc-500">
                      Nog 1000 dagen...
                    </div>
                    <div className="text-xs text-zinc-400">
                      19 november 2025
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-2 group-hover:text-green-600 transition-colors">
                  Lancering Campagne
                </h3>
                <p className="text-lg text-zinc-600 mb-4">
                  1000 Dagen voor de Paralympische Spelen
                </p>
                <ul className="space-y-2 text-sm text-zinc-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Lancering van website Fre2028.LA </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Persconferentie voor initiële mediadekking in Leuven</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Start van de zoektocht naar partners</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Node 2 - In Development */}
            <div 
              onClick={() => router.push('/communication-plan/de-sterkste-vingers-van-Belgie')}
              className="relative pl-8 md:pl-20 pb-12 cursor-pointer hover:opacity-75 transition-opacity group"
            >
              <div className="absolute left-0 top-0 w-4 h-4 bg-amber-500 rounded-full border-4 border-white md:left-6"></div>
              <div className="bg-gradient-to-r from-amber-50/70 to-white border-l-4 border-amber-500 p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-amber-600 mb-2 md:mb-0">
                    <span>Knooppunt 2</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-semibold lowercase">in ontwikkeling</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-zinc-500">
                      Nog 900 Dagen
                    </div>
                    <div className="text-xs text-zinc-400">
                      27 februari 2026
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-2 group-hover:text-amber-600 transition-colors">
                  YouTube Serie
                </h3>
                <p className="text-lg text-zinc-600 mb-4">
                  De Sterkste Vingers van België
                </p>
                <ul className="space-y-2 text-sm text-zinc-600">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>12 afleveringen, 12 bekende Belgische topklimmers en avonturiers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>De klimgemeenschap bij mijn verhaal betrekken</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>Bereik uitbreiden via bestaande influencers en atleten</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Node 3 - Done */}
            <div 
              onClick={() => router.push('/communication-plan/node-3')}
              className="relative pl-8 md:pl-20 pb-12 cursor-pointer hover:opacity-75 transition-opacity group"
            >
              <div className="absolute left-0 top-0 w-4 h-4 bg-green-600 rounded-full border-4 border-white md:left-6"></div>
              <div className="bg-gradient-to-r from-green-50 to-white border-l-4 border-green-600 p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-green-600 mb-2 md:mb-0">
                    <span>Knooppunt 3</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-300 font-semibold lowercase">voltooid</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-zinc-500">
                      Nog 800 Dagen
                    </div>
                    <div className="text-xs text-zinc-400">
                      20-21 juni 2026
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-2 group-hover:text-green-600 transition-colors">
                  Belgisch kampioenschap Paraklimmen
                </h3>
                <p className="text-lg text-zinc-600 mb-4">
                  Georganiseerd door klimclub BVKB en Paraclimbing.be
                </p>
                <ul className="space-y-2 text-sm text-zinc-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Open kampioenschap met internationaal allure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Kliminitiatie voor nieuwe paraklimmers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Een festival met veel randactiviteiten</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Node 4 */}
            <div className="relative pl-8 md:pl-20 pb-12">
              <div className="absolute left-0 top-0 w-4 h-4 bg-black rounded-full border-4 border-white md:left-6"></div>
              <div className="bg-gradient-to-r from-zinc-50 to-white border-l-4 border-black p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                  <div className="text-sm font-bold uppercase tracking-widest text-zinc-600 mb-2 md:mb-0">
                    Knooppunt 4
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-zinc-500">
                      Nog 700 Dagen
                    </div>
                    <div className="text-xs text-zinc-400">
                      5 september 2026
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-2">
                  Stadsverzadiging
                </h3>
                <p className="text-lg text-zinc-600 mb-4">
                  Leuven Stadsverzadigingscampagne
                </p>
                <ul className="space-y-2 text-sm text-zinc-600">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>Maximaliseren van zichtbaarheid in thuisstad Leuven</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>Lokale partnerschappen en sponsoring verstevigen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>Creëren van breed draagvlak voor overgang naar fase 2</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Node 5 */}
            <div className="relative pl-8 md:pl-20 pb-0">
              <div className="absolute left-0 top-0 w-4 h-4 bg-black rounded-full border-4 border-white md:left-6"></div>
              <div className="bg-gradient-to-r from-zinc-50 to-white border-l-4 border-black p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                  <div className="text-sm font-bold uppercase tracking-widest text-zinc-600 mb-2 md:mb-0">
                    Knooppunt 5
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-zinc-500">
                      Nog 600 Dagen
                    </div>
                    <div className="text-xs text-zinc-400">
                      15 december 2026
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-2">
                  Standje Leuvense Kerstmarkt
                </h3>
                <p className="text-lg text-zinc-600 mb-4">
                  dit is de Leuvense Live editie van onze Youtube serie.
                </p>
                <ul className="space-y-2 text-sm text-zinc-600">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>We gaan opzoek naar de sterkte vingers en bicepsen van Leuven.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>Terplekke een paar meettoestellen (bv pullup bar) (met online leaderboard)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>Interviewen elke avond een bekende en minder bekende sportieve Leuvenaar in het kleinste glazen huis van Vlaanderen.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>Reclame maken voor andere initiatieven in de paralympische wereld en verkopen van Merch (iedereen een petje van Fre2028.LA)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Phase 2 */}
      <section className="py-16 md:py-20 bg-zinc-50">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="mb-12">
            <div className="inline-block px-4 py-2 mb-4 bg-white text-black border-2 border-black text-xs font-bold uppercase tracking-wider">
              Fase 2
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Vlaanderen & Nationale Focus</h2>
            <p className="text-zinc-600 text-lg">500 Dagen en verder - Nationale Media Expansie</p>
          </div>

          <div className="bg-white border-2 border-black p-6 md:p-8">
            <p className="text-zinc-700 mb-4">
              <strong className="text-black">Status:</strong> Deze fase is nog in ideation.
            </p>

            <div className="space-y-4">
              <h3 className="font-bold text-xl text-black mb-4">Ideeën in Ontwikkeling:</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-zinc-50 border-l-4 border-black">
                  <span className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold mt-1">•</span>
                  <div>
                    <p className="font-bold text-black">Podcast</p>
                    <p className="text-sm text-zinc-600">Lanceren van een podcast over prestaties en wat een winnaar een winnaar maakt.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-zinc-50 border-l-4 border-black">
                  <span className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold mt-1">•</span>
                  <div>
                    <p className="font-bold text-black">Docu-serie op nationale televisie</p>
                    <p className="text-sm text-zinc-600">Een concept ontwikkelen voor een serie die mijn reis en die van andere Belgische atleten op weg naar LA 2028 volgt.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-zinc-50 border-l-4 border-black">
                  <span className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold mt-1">•</span>
                  <div>
                    <p className="font-bold text-black">Kerstmarkt Expansie</p>
                    <p className="text-sm text-zinc-600">De Leuvense Kerstmarkt formule herhalen maar groter en beter - uitbreiden naar andere Vlaamse steden en meer interactieve elementen.</p>
                  </div>
                </div>

                
                <div className="flex items-start gap-3 p-4 bg-zinc-50 border-l-4 border-black">
                  <span className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold mt-1">•</span>
                  <div>
                    <p className="font-bold text-black">De Paralympische spelen Live op groot scherm </p>
                    <p className="text-sm text-zinc-600">De paralympische spelen live op groot scherm op de Oude Markt in Leuven</p>
                  </div>
                </div>

              </div>
            </div>
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
          <p className="text-sm text-zinc-600">Communicatiecampagne - Road to LA 2028 Paralympische Spelen</p>
        </div>
      </footer>
    </div>
  );
}
