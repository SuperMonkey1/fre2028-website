import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Mountain, Calendar, Radio, Video, Newspaper, Globe, TrendingUp, ArrowLeft, Target } from 'lucide-react';

export default function CommunicationPlan() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <Head>
        <title>Communicatiecampagne - Fré Leys Road to LA 2028</title>
        <meta name="description" content="Volledige communicatie- en marketingcampagneplan voor Fré Leys' reis naar de Paralympische Spelen LA 2028" />
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
            <Radio className="w-4 h-4" />
            Campagnestrategie
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
            Communicatie<br />Campagne
          </h1>
          <p className="text-xl md:text-2xl text-zinc-600 leading-relaxed">
            Road to LA 2028 - Mijn persoonlijk verhaal als katalysator om Leuvenaars en Vlamingen te betrekken bij de Paralympische Spelen van 2028.
          </p>
        </div>
      </section>

      {/* The Vision */}
      <section className="py-16 md:py-20 border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Target className="w-8 h-8" />
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">De Visie</h2>
          </div>
          
          <div className="space-y-6 text-lg text-zinc-700 leading-relaxed">
            <div>
              <h3 className="font-bold text-black mb-2">Wie ik ben:</h3>
              <p>Mijn naam is Fré Leys. Ik ben een burgerlijk ingenieur en een paraklimmer, lid van het Belgische klimteam sinds 2016 en geboren met een beperking aan mijn rechterbeen waarvoor ik een prothese draag. Momenteel ben ik tweedes op de wereldranglijst in mijn klasse.</p>
            </div>

            <div>
              <h3 className="font-bold text-black mb-2">Goud:</h3>
              <p>Klimmen zal in 2028 voor het eerst op het programma staan van de Paralympische Spelen in LA. Mijn ultieme doel is niet alleen om te mogen deelnemen en daarmee de <strong>eerste Leuvense Paralympier</strong> te worden, maar om paralympisch <strong>goud</strong> te winnen. </p>
            </div>

            <div>
              <h3 className="font-bold text-black mb-2">Een unieke kans</h3>
              <p>Mogen deelnemen zal het resultaat zijn van vele jaren toewijding, maar toch zie ik het ook als een privilege. Ik wil deze kans aangrijpen om met mijn persoonlijk verhaal de <strong>Paralympische Spelen</strong> onder de aandacht te brengen en mensen erbij te betrekken. Daarom ben ik deze communicatie campagne - dit verhaal - gestart. Met dit initiatief richt ik mij in de eerste plaats op de Leuvenaar, maar wie weet bereiken we wel heel Vlaanderen.</p>
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
              <div className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-3">Fase 1</div>
              <h3 className="text-2xl font-bold mb-2">Dagen 1000 - 501</h3>
              <p className="text-zinc-700">Primaire focus op mijn thuisstad <strong>Leuven</strong>.</p>
            </div>

            <div className="bg-white border border-zinc-200 p-6">
              <div className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-3">Fase 2</div>
              <h3 className="text-2xl font-bold mb-2">Dagen 500 - 0</h3>
              <p className="text-zinc-700">Uitbreiding van de focus naar <strong>Vlaanderen</strong> en bewustwording op nationaal niveau.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Phase 1 - Nodes */}
      <section className="py-16 md:py-20 border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="mb-12">
            <div className="inline-block px-4 py-2 mb-4 bg-black text-white text-xs font-bold uppercase tracking-wider">
              Fase 1
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Leuven & Community Focus</h2>
          </div>

          {/* Node 1 */}
          <div className="mb-12 bg-gradient-to-r from-red-50 to-white border-l-4 border-red-600 p-8">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-8 h-8 text-red-600" />
              <div>
                <div className="text-sm font-bold uppercase tracking-widest text-red-600">Node 1: Campagne Lancering</div>
                <h3 className="text-2xl font-bold">1000 Dagen - 20 November 2025</h3>
              </div>
            </div>

            <p className="text-zinc-700 mb-4 text-lg">
              Deze node markeert de officiële start, exact 1000 dagen voor de Paralympische Spelen.
            </p>

            <button 
              onClick={() => router.push('/communication-plan/node-1')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-bold text-sm uppercase tracking-wider hover:bg-red-700 transition-colors mb-6"
            >
              Bekijk Volledige Details →
            </button>

            <div className="space-y-4">
              <div className="bg-white p-4 border border-zinc-200">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Website Lancering
                </h4>
                <p className="text-zinc-700 text-sm">fre2028.LA gaat live.</p>
              </div>

              <div className="bg-white p-4 border border-zinc-200">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <Newspaper className="w-5 h-5" />
                  Media Lancering
                </h4>
                <p className="text-zinc-700 text-sm">Een persconferentie houden specifiek gericht op de nieuwsmedia in Leuven.</p>
              </div>

              <div className="bg-white p-4 border border-zinc-200">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Team Building
                </h4>
                <p className="text-zinc-700 text-sm">Officieel beginnen met het opbouwen van mijn team van partners.</p>
              </div>

              <div className="bg-white p-4 border border-zinc-200">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Lokale Marketing
                </h4>
                <p className="text-zinc-700 text-sm">Een "kleine" marketingcampagne lanceren in Leuven als proefrun voor de grotere campagne later.</p>
              </div>

              <div className="bg-white p-4 border border-zinc-200">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <Radio className="w-5 h-5" />
                  Content Start
                </h4>
                <ul className="text-zinc-700 text-sm space-y-1 list-disc list-inside pl-4">
                  <li>Lanceren van de maandelijkse blog/nieuwsbrief (bestaand platform met ~100 abonnees)</li>
                  <li>Beginnen met regelmatige, gestructureerde posts op sociale media (Instagram ~5.000 volgers, Facebook)</li>
                </ul>
              </div>

              <div className="bg-white p-4 border border-zinc-200">
                <h4 className="font-bold mb-2">Merchandise</h4>
                <p className="text-zinc-700 text-sm">Beginnen met het proces van het creëren van een logo om merchandise te produceren (t-shirts, petten).</p>
              </div>
            </div>
          </div>

          {/* Node 2 */}
          <div className="mb-12 bg-zinc-50 border-l-4 border-black p-8">
            <div className="flex items-center gap-3 mb-4">
              <Video className="w-8 h-8" />
              <div>
                <div className="text-sm font-bold uppercase tracking-widest text-zinc-500">Node 2: Community Engagement</div>
                <h3 className="text-2xl font-bold">900 Dagen</h3>
              </div>
            </div>

            <button 
              onClick={() => router.push('/communication-plan/node-2')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-bold text-sm uppercase tracking-wider hover:bg-zinc-800 transition-colors mb-6"
            >
              Bekijk Volledige Details →
            </button>

            <div className="space-y-4">
              <div className="bg-white p-4 border border-zinc-200">
                <h4 className="font-bold mb-2">YouTube Serie Lancering</h4>
                <p className="text-zinc-700 mb-3">"<strong>De Gouden Vingers van België</strong>" - 20-afleveringen serie</p>
                
                <div className="space-y-2 text-sm text-zinc-600">
                  <p><strong>Concept:</strong> Ik zal 20 van de meest bekende Belgische klimmers uitnodigen om hun vingerkracht te testen op een gestandaardiseerde opstelling.</p>
                  <p><strong>Kenmerken:</strong> Er wordt een doorlopend klassement bijgehouden en de winnaar ontvangt de "Gouden Vinger Trofee".</p>
                  <p><strong>Doel:</strong> Paraklimmen en de Paralympische Spelen promoten rechtstreeks bij de Belgische klimgemeenschap.</p>
                  <p><strong>Toekomstig Potentieel:</strong> De testopstelling kan later worden gebruikt om Belgische klimzalen te bezoeken, waardoor alle klimmers hun kracht kunnen vergelijken met de deelnemers. Bij succes kan de serie wereldwijd worden uitgebreid.</p>
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200">
                  <p className="text-xs text-blue-900">
                    <strong>Interne Notitie:</strong> Door samen te werken met beroemde klimmers, kan ik een groot deel van de klimgemeenschap gratis bereiken door hun bestaande platforms te benutten.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Node 3 */}
          <div className="mb-12 bg-zinc-50 border-l-4 border-black p-8">
            <div className="flex items-center gap-3 mb-4">
              <Mountain className="w-8 h-8" />
              <div>
                <div className="text-sm font-bold uppercase tracking-widest text-zinc-500">Node 3: Event Hosting</div>
                <h3 className="text-2xl font-bold">800 Dagen</h3>
              </div>
            </div>

            <button 
              onClick={() => router.push('/communication-plan/node-3')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-bold text-sm uppercase tracking-wider hover:bg-zinc-800 transition-colors mb-6"
            >
              Bekijk Volledige Details →
            </button>

            <div className="space-y-4">
              <div className="bg-white p-4 border border-zinc-200">
                <h4 className="font-bold mb-2">Belgisch Paraklimmen Kampioenschap</h4>
                <p className="text-zinc-700 mb-3">Een open competitie georganiseerd in samenwerking met mijn klimclub (BVKB van klimzaal "Klimax") en mijn vzw "paraclimbing.be"</p>
                
                <div className="space-y-2 text-sm text-zinc-600">
                  <p><strong>Datum:</strong> Gepland voor 20-21 juni</p>
                  <p><strong>Strategie:</strong> We verwachten voornamelijk internationale paraklimmers vanwege het kleine aantal Belgische deelnemers. Het evenement is strategisch gepland voor het weekend na een grote internationale paraklimwedstrijd in Oostenrijk, in de hoop dat klimmers "even langskomen" in België op hun weg naar huis.</p>
                  
                  <div className="mt-3">
                    <p className="font-bold text-black mb-2">Tweedaagse Evenement Structuur:</p>
                    <ul className="list-disc list-inside space-y-1 pl-4">
                      <li><strong>Dag 1:</strong> Kliminitiatie voor nieuwe Belgische paraklimmers</li>
                      <li><strong>Dag 2:</strong> Een para-routesetting cursus voor Belgische routezetters, waarbij de nieuwe paraklimmers de routes kunnen testen</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Node 4 */}
          <div className="mb-12 bg-gradient-to-r from-zinc-50 to-white border-l-4 border-black p-8">
            <div className="flex items-center gap-3 mb-4">
              <Newspaper className="w-8 h-8" />
              <div>
                <div className="text-sm font-bold uppercase tracking-widest text-zinc-500">Node 4: Stadsverzadiging</div>
                <h3 className="text-2xl font-bold">700 Dagen</h3>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-4 border border-zinc-200">
                <h4 className="font-bold mb-2">Leuven Stadsverzadigingscampagne</h4>
                <p className="text-zinc-700 mb-3">Lanceren van een grootschalige, gerichte promotiecampagne in Leuven.</p>
                
                <div className="space-y-2 text-sm text-zinc-600">
                  <p><strong>Tactieken:</strong></p>
                  <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Richten op lokale kranten en tijdschriften</li>
                    <li>Posters ophangen in lokale winkels</li>
                    <li>Brochures verspreiden in brievenbussen</li>
                  </ul>
                  
                  <p className="mt-3"><strong>Doel:</strong> De inwoners van Leuven in direct contact brengen met de Paralympische beweging, met mijn verhaal als de "eerste Paralympiër uit Leuven" als centrale verhaallijn.</p>
                  
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200">
                    <p className="font-bold text-yellow-900">Specifiek Doel:</p>
                    <p className="text-yellow-800">Ervoor zorgen dat zoveel mogelijk inwoners van Leuven <strong>het Paralympische logo kunnen herkennen</strong>, dat momenteel nog zeer onbekend is.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Phase 2 */}
      <section className="py-16 md:py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="mb-12">
            <div className="inline-block px-4 py-2 mb-4 bg-white text-black text-xs font-bold uppercase tracking-wider">
              Fase 2
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Vlaanderen & Nationale Focus</h2>
          </div>

          <div className="bg-white/10 border border-white/20 p-8">
            <div className="flex items-center gap-3 mb-4">
              <Radio className="w-8 h-8" />
              <div>
                <div className="text-sm font-bold uppercase tracking-widest text-zinc-400">Node 5 & Verder</div>
                <h3 className="text-2xl font-bold">600 Dagen - Nationale Media Expansie</h3>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-zinc-300 mb-4">
                <strong className="text-white">Status:</strong> Deze plannen zijn nog niet afgerond maar vertegenwoordigen de richting voor Fase 2.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-lg text-white">Ideeën in Ontwikkeling:</h4>
              
              <div className="space-y-3 text-zinc-300">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">•</span>
                  <div>
                    <p className="font-bold text-white">Podcast:</p>
                    <p className="text-sm">Lanceren van een podcast over prestaties en wat een winnaar een winnaar maakt.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">•</span>
                  <div>
                    <p className="font-bold text-white">Interview Serie:</p>
                    <p className="text-sm">Een serie (video of podcast) hosten waarin andere Paralympiërs worden geïnterviewd.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">•</span>
                  <div>
                    <p className="font-bold text-white">Nationale Televisie:</p>
                    <p className="text-sm">Actief werken om mijn verhaal op de nationale TV te krijgen.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">•</span>
                  <div>
                    <p className="font-bold text-white">Docu-serie:</p>
                    <p className="text-sm">Een concept ontwikkelen voor een serie die mijn reis en die van andere Belgische atleten op weg naar LA 2028 volgt.</p>
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
