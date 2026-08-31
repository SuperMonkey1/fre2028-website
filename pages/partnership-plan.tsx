import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Mountain, Target, Users, Briefcase, Award, TrendingUp, ArrowLeft, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';

export default function PartnershipPlan() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <Head>
        <title>Partnerschap Plan — Engineering my way to the Paralympics in 2028 | Fré Leys</title>
        <meta name="description" content="Het partnerschap- en innovatieplan van Dr. Ir. Frederik Leys: hoe Leuvense spitstechnologie, engineering en 25 innovatieve bedrijven de weg effenen naar goud in LA 2028." />
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
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-300 text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">
              <Briefcase className="w-4 h-4" />
              Strategisch Partnerschapsplan
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 border border-amber-300 text-amber-900 text-xs font-extrabold uppercase tracking-wider rounded-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Project Subtitle
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-4">
            "Engineering my way to the Paralympics in 2028"
          </h1>
          <p className="text-xl md:text-2xl text-zinc-600 leading-relaxed max-w-3xl">
            Hoe Dr. Ir. Frederik Leys Leuvense engineering, innovatie en topsport bundelt om als eerste Leuvense Paralympiër ooit goud te veroveren in Los Angeles.
          </p>
        </div>
      </section>

      {/* The Engineer-Athlete & Leuven Innovation */}
      <section className="py-16 md:py-20 border-b border-zinc-100 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Cpu className="w-8 h-8 text-black" />
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Het Ecosysteem & De Engineer-Athlete</h2>
          </div>

          <div className="bg-zinc-50 border-2 border-black p-8 md:p-10 mb-8 space-y-6">
            <div className="space-y-4 text-lg text-zinc-700 leading-relaxed">
              <p>
                <strong>Dr. Ir. Frederik Leys</strong> behaalde een doctoraat in de Werktuigkunde (KU Leuven) met de ontwikkeling van een robotkolibrie (KULibrie). Als burgerlijk ingenieur, maker en onderzoeker benadert Fré topsport niet louter als fysiologische uitdaging, maar als een <strong>complex mechatronisch en data-gedreven optimalisatievraagstuk</strong>.
              </p>
              <p>
                Het ontwerpen van een technologisch ge-engineerde atleet vraagt om feedbackloops, sensor-data, custom trainingstools, biomechanische precisie en geavanceerde materiaalkunde. Fré's paralympische lichaam en sportuitrusting fungeren hierbij als een <strong>levend R&D-testbed</strong>.
              </p>
            </div>

            <div className="border-t border-zinc-200 pt-6">
              <h3 className="text-xl font-bold mb-3 text-black">Waarom Leuven uniek is</h3>
              <p className="text-zinc-700 text-sm leading-relaxed mb-4">
                Leuven staat wereldwijd bekend als <em>European Capital of Innovation</em>. Gevoed door KU Leuven, Imec, UZ Leuven en honderden baanbrekende spin-offs in het Arenberg Science Park en Haasrode Research Park, bezit Leuven een ongeëvenaarde concentratie aan deep tech, health tech en mechatronica.
              </p>
              <div className="p-4 bg-white border border-zinc-200 rounded-sm">
                <p className="text-sm font-semibold text-zinc-900 italic">
                  "Mijn doel is om 25 innovatieve Leuvense bedrijven samen te brengen rond dit project. Samen bewijzen we dat Leuvense spitstechnologie en engineering letterlijk goud kunnen winnen op de Paralympische Spelen van Los Angeles 2028."
                </p>
              </div>
            </div>
          </div>
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
              <h3 className="font-bold text-xl mb-2">1. Presteren via Engineering & Innovatie</h3>
              <p className="text-zinc-700 leading-relaxed">
                De nodige financiële, technische en sportwetenschappelijke ondersteuning veiligstellen om voltijds te kunnen trainen, prototypen, innoveren en goud te veroveren in LA 2028.
              </p>
            </div>

            <div className="border-l-4 border-black pl-6 py-2">
              <h3 className="font-bold text-xl mb-2">2. Het Leuvense Innovatiecollectief (25 Bedrijven)</h3>
              <p className="text-zinc-700 leading-relaxed">
                Een hecht consortium van <strong>25 innovatieve Leuvense bedrijven</strong> opbouwen dat Fré's traject omarmt als uithangbord van lokaal technologisch leiderschap.
              </p>
            </div>

            <div className="border-l-4 border-black pl-6 py-2">
              <h3 className="font-bold text-xl mb-2">3. Maatschappelijk Engagement & Legacy</h3>
              <p className="text-zinc-700 leading-relaxed">
                De allereerste Paralympiër van Leuven worden en het momentum benutten om de <strong>Paralympische beweging en G-sport</strong> in Leuven en Vlaanderen structureel op de kaart te zetten via <a href="https://paraclimbing.be" target="_blank" rel="noopener noreferrer" className="underline font-bold text-black">Paraclimbing.be</a>.
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
            Om als professioneel atleet 100% te focussen op goud in LA 2028, bouw ik aan een hecht netwerk van <strong>25 innovatieve Leuvense partnerbedrijven</strong> aan <strong>€100 per maand (€1.200 per jaar)</strong>. Dit levert het noodzakelijke jaarlijkse werkingsbudget van net geen €25.000 - €30.000 om voltijds te kunnen trainen, testen, herstellen en de campagne te leiden.
          </p>

          {/* Context & Waarom dit nodig is */}
          <div className="bg-white border border-zinc-200 p-8 mb-8 space-y-6">
            <h3 className="text-2xl font-bold">Waarom deze steun noodzakelijk is</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border-l-4 border-amber-500 pl-4 py-1 bg-amber-50/50">
                <h4 className="font-bold text-sm text-zinc-900 mb-1">Minimale overheidsmiddelen</h4>
                <p className="text-sm text-zinc-700">
                  Zelfs wedstrijdkosten worden in België amper gedekt. Zo moet ik voor mijn internationale wedstrijden in 2026 circa <strong>€3.500 uit eigen zak</strong> betalen. In het buitenland worden directe concurrenten voltijds gefinancierd door overheid en olympische comités.
                </p>
              </div>

              <div className="border-l-4 border-black pl-4 py-1 bg-zinc-50">
                <h4 className="font-bold text-sm text-zinc-900 mb-1">Voltijds traject & R&D</h4>
                <p className="text-sm text-zinc-700">
                  Een 100% voorbereiding naar paralympisch goud vraagt voltijdse toewijding: dagelijkse krachttraining, klimtrainingen, sensor-analyse, biomechanische data-evaluatie, reizen en campagnebeheer.
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
                <p className="text-zinc-700 font-medium">25 Innovatieve Leuvense Engineering & Tech Bedrijven</p>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Aanpak</div>
                <p className="text-zinc-700">3 maanden gerichte media-, tech- & netwerkpush in Leuven</p>
              </div>
            </div>

            <div className="space-y-4 text-zinc-700">
              <div className="bg-zinc-50 p-5 border border-zinc-200">
                <h4 className="font-bold text-sm uppercase tracking-wider text-zinc-900 mb-3">Concrete Return voor Partners:</h4>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li><strong>Zichtbaarheid op alle dragers:</strong> Logo op de officiële <strong>campagneposter</strong>, de <strong>website (fre2028.la)</strong> en de <strong>trainingskledij / campagne T-shirt</strong>.</li>
                  <li><strong>Exclusief Jaarevent:</strong> 1x per jaar partnerevent met kliminitiatie, filmvertoning en inspirerende keynote over veerkracht, innovatie en de 'engineer-athlete' aanpak.</li>
                  <li><strong>Kerstmarkt 2027:</strong> Partneractivatie en zichtbaarheid op de Leuvense Kerstmarkt.</li>
                  <li><strong>Grote Poster 2028:</strong> Huis-aan-huis verspreiding in elk huis in Leuven en op alle scholen (in samenwerking met Stad Leuven).</li>
                  <li><strong>R&D-Synergie & Maatschappelijke Impact:</strong> Zichtbare link met spitstechnologie, inclusie en paraklimmen via <a href="https://paraclimbing.be" target="_blank" rel="noopener noreferrer" className="underline font-semibold">paraclimbing.be</a>.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-2">Waarom uitsluitend Leuvense Innovatie?</h4>
                <p className="text-sm">
                  Omdat Leuven een wereldklasse ecosysteem is van ingenieurs en vernieuwers. Door dit verhaal hier te concentreren, verbinden we lokale trots, technologische superioriteit en maatschappelijke impact op het allerhoogste wereldpodium.
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
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">2. Strategische & Media Partners (Leuven)</h2>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 p-8">
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-2">Pro Bono Expertise & Tech Integratie</p>
              <h3 className="text-xl font-bold mb-4">Lokale Partners in Communicatie, Media & Technologie</h3>
            </div>

            <div className="space-y-4 text-zinc-700">
              <div>
                <h4 className="font-bold mb-2">Doel:</h4>
                <p>Professionele expertise inzetten voor de 3-maanden push, mediacampagnes, PR, video storytelling en eventuele technische prototyping zonder cashflowdruk op het sportieve budget.</p>
              </div>

              <div>
                <h4 className="font-bold mb-2">Doelwit & Profiel:</h4>
                <ul className="list-disc list-inside space-y-1 pl-4 text-sm">
                  <li>PR & Communicatiebureaus uit de regio Leuven</li>
                  <li>Content creators (videografie, fotografie, storytelling)</li>
                  <li>Technologie- en hardwarepartners (sensoren, prototyping, data)</li>
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
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">3. Het Performance & Data Team</h2>
          </div>

          <div className="bg-white border border-zinc-200 p-8">
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-2">Sportwetenschappelijk & Biomechanisch Kader</p>
              <h3 className="text-xl font-bold mb-4">Atletische, Fysieke & Data-gedreven Begeleiding</h3>
            </div>

            <div className="space-y-4 text-zinc-700">
              <div>
                <h4 className="font-bold mb-2">Doel:</h4>
                <p>De wetenschappelijke, medische en sportieve omkadering die ervoor zorgt dat Fré in absolute topvorm en met geoptimaliseerde biomechanica aan de start verschijnt in Los Angeles 2028.</p>
              </div>

              <div>
                <h4 className="font-bold mb-2">Team Leden:</h4>
                <ul className="list-disc list-inside space-y-1 pl-4 text-sm">
                  <li>Hoofdcoach & Klimtrainers</li>
                  <li>Kinesitherapeut & Revalidatiespecialist</li>
                  <li>Biomechanici & Data-analisten</li>
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
                  <th className="border border-zinc-300 p-4 text-left font-bold">1. Financiële & Innovatie Partners</th>
                  <th className="border border-zinc-300 p-4 text-left font-bold">2. Strategische Partners</th>
                  <th className="border border-zinc-300 p-4 text-left font-bold">3. Performance & Data Team</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr>
                  <td className="border border-zinc-300 p-4 font-bold">Concept</td>
                  <td className="border border-zinc-300 p-4 font-semibold">"Engineering my way to the Paralympics in 2028"</td>
                  <td className="border border-zinc-300 p-4">Media, PR & Pro Bono Tech Expertise</td>
                  <td className="border border-zinc-300 p-4">Fysieke, biomechanische & mentale coaching</td>
                </tr>
                <tr className="bg-zinc-50">
                  <td className="border border-zinc-300 p-4 font-bold">Doel</td>
                  <td className="border border-zinc-300 p-4">Voltijds topsporttraject, R&D-optimalisatie & reiskosten dekken</td>
                  <td className="border border-zinc-300 p-4">Media- en technologieversterking</td>
                  <td className="border border-zinc-300 p-4">Paralympisch goud en atletische perfectie</td>
                </tr>
                <tr>
                  <td className="border border-zinc-300 p-4 font-bold">Focus</td>
                  <td className="border border-zinc-300 p-4">Leuven Innovatie Ecosysteem</td>
                  <td className="border border-zinc-300 p-4">Leuven</td>
                  <td className="border border-zinc-300 p-4">Nationaal / Internationaal</td>
                </tr>
                <tr className="bg-zinc-50">
                  <td className="border border-zinc-300 p-4 font-bold">Aantal</td>
                  <td className="border border-zinc-300 p-4">25 Innovatieve Bedrijven</td>
                  <td className="border border-zinc-300 p-4">3 - 5 partners</td>
                  <td className="border border-zinc-300 p-4">Kernteam van experts</td>
                </tr>
                <tr>
                  <td className="border border-zinc-300 p-4 font-bold">Bijdrage</td>
                  <td className="border border-zinc-300 p-4">€100 / maand (€1.200 / jaar)</td>
                  <td className="border border-zinc-300 p-4">Pro bono diensten & expertise</td>
                  <td className="border border-zinc-300 p-4">Expertise & coaching</td>
                </tr>
                <tr className="bg-zinc-50">
                  <td className="border border-zinc-300 p-4 font-bold">Return</td>
                  <td className="border border-zinc-300 p-4">Poster, website, T-shirt, jaarevent, Kerstmarkt 2027, huis-aan-huis poster 2028, R&D synergie</td>
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
          <p className="text-sm text-zinc-600">"Engineering my way to the Paralympics in 2028" — Weg naar LA 2028 Paralympics</p>
        </div>
      </footer>
    </div>
  );
}

