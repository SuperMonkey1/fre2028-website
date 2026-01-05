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
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">1. De Financiële Partners</h2>
          </div>

          <p className="text-lg text-zinc-700 leading-relaxed mb-12">
            Deze groep bestaat uit twee niveaus van financiële sponsors: een lokale basis van ondersteuning (Leuven Circle) en een groep van grote partners op nationaal niveau.
          </p>

          {/* Leuven Circle */}
          <div className="bg-white border border-zinc-200 p-8 mb-8">
            <h3 className="text-2xl font-bold mb-6">De Leuven Circle</h3>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Doel</div>
                <p className="text-zinc-700">Een stabiele financiële basis creëren om alle jaarlijkse klimgerelateerde kosten te dekken. Deze bedragen jaarlijks ongeveer 8000 euro.</p>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Doelwit</div>
                <p className="text-zinc-700">Een kern groep van <strong>8 partnerbedrijven</strong>.</p>
              </div>
            </div>

            <div className="space-y-4 text-zinc-700">
              <div>
                <h4 className="font-bold mb-2">Profiel:</h4>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li>Leuven-gebaseerde bedrijven</li>
                  <li>Focus op de technologie sector om mijn eigen achtergrond als ingenieur te benutten</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-2">Outreach:</h4>
                <p>Een mix van warme outreach (bestaand netwerk) en cold emailing.</p>
              </div>

              <div>
                <h4 className="font-bold mb-2">Tijdslijn:</h4>
                <p>Alle 8 partners veiligstellen binnen de eerste 6 maanden van de campagne.</p>
              </div>

              <div className="bg-zinc-50 p-4 border-l-4 border-black">
                <h4 className="font-bold mb-2">De Vraag (Financieel):</h4>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li>Een minimum van <strong>€1.000 per jaar</strong> per partner</li>
                  <li>Jaarlijkse hernieuwing</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-2">De Teruggave (Op maat):</h4>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li>Officiële partner status met promotie op de fre2028.LA website en sociale media</li>
                  <li>In-company talks (bijv. over prestaties, veerkracht, een ingenieursbenadering van topsport)</li>
                  <li>Andere</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-2">Voorwaarden:</h4>
                <p>Partnerschappen zullen gestructureerd worden voor jaarlijkse verlenging. Dit bouwt verantwoordelijkheid in, waardoor ik het succes van de campagne elk jaar kan bewijzen. Partners kunnen op die manier ook meegroeien met de campagne</p>
              </div>
            </div>
          </div>

          {/* Prime Partners */}
          <div className="bg-white border border-zinc-200 p-8">
            <h3 className="text-2xl font-bold mb-6">De Prime Partners (Nationaal Niveau)</h3>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Doel</div>
                <p className="text-zinc-700">Grote financiering veiligstellen die me toelaat om <strong>voltijds te focussen op prestaties</strong> in het laatste, kritieke jaar voor de Paralympische Spelen</p>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Doelwit</div>
                <p className="text-zinc-700">Ongeveer <strong>4 partners</strong>.</p>
              </div>
            </div>

            <div className="space-y-4 text-zinc-700">
              <div>
                <h4 className="font-bold mb-2">Profiel:</h4>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li>Grote nationale (Vlaamse) bedrijven</li>
                  <li>Sterke B2C (Business-to-Consumer) focus met een grote klantbasis</li>
                  <li>Voorbeelden: Banken, supermarktketens, restaurantketens</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-2">Outreach:</h4>
                <p>Dit zal een langetermijn strategische inspanning zijn.</p>
              </div>

              <div>
                <h4 className="font-bold mb-2">Tijdslijn:</h4>
                <p>Alle 4 partners veiligstellen tegen het <strong>midden van 2027</strong>. Dit geeft een ~1.5-jaar runway om deze high-level relaties op te bouwen.</p>
              </div>

              <div className="bg-zinc-50 p-4 border-l-4 border-black">
                <h4 className="font-bold mb-2">De Vraag:</h4>
                <p>Financiële steun <strong>In overleg</strong>.</p>
                <p>Promotie Fre2028.LA naar <strong>personeel</strong> en <strong>klanten</strong>.</p>

              </div>

              <div>
                <h4 className="font-bold mb-2">De Teruggave:</h4>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li><strong>In overleg</strong></li>
                  <li>High-level nationale zichtbaarheid en associatie met het Belgische Paralympische verhaal</li>
                  <li>Inspirerende talks voor hun nationale werknemersbasis</li>
                  <li>Grote merk alignment mogelijkheden</li>
                  <li>Andere</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 p-4">
                <h4 className="font-bold mb-2 text-red-900">Uitdaging:</h4>
                <p className="text-red-800">Dit wordt erkend als het meest uitdagende deel van het financiële plan en zal een toegewijde, professionele aanpak vereisen.</p>
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
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">2. Strategische Partners</h2>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 p-8">
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-2">Pro Bono Diensten</p>
              <h3 className="text-xl font-bold mb-4">Leuven-Gebaseerde Professionele Diensten</h3>
            </div>

            <div className="space-y-4 text-zinc-700">
              <div>
                <h4 className="font-bold mb-2">Doel:</h4>
                <p>Professionele diensten en expertise verkrijgen om de campagne effectief te runnen zonder directe financiële kosten, terwijl tegelijkertijd mijn Leuven netwerk wordt versterkt.</p>
              </div>

              <div>
                <h4 className="font-bold mb-2">Doelwit:</h4>
                <p>Leuven-gebaseerde bedrijven en geschoolde professionals.</p>
              </div>

              <div>
                <h4 className="font-bold mb-2">Profiel:</h4>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li>Marktonderzoek / analyse bureau</li>
                  <li>Advertentie / PR agentschap</li>
                  <li>Professionele content creators (videograaf, fotograaf)</li>
                  <li>Juridische of administratieve ondersteuning</li>
                </ul>
              </div>

              <div className="bg-white p-4 border-l-4 border-black">
                <h4 className="font-bold mb-2">De Vraag:</h4>
                <p>Pro bono diensten en expertise (geen financiële bijdrage).</p>
              </div>

              <div>
                <h4 className="font-bold mb-2">De Teruggave:</h4>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li>Officiële partner status en volledige zichtbaarheid op de website en in campagne materialen</li>
                  <li>Een unieke en tastbare manier om een lokale atleet te ondersteunen</li>
                  <li>Praktische voordelen (bijv. gebruik van een non-profit structuur voor diensten)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-2">Redenering:</h4>
                <p>Deze partners lokaal houden is praktisch gemakkelijker en versterkt het "Eerste Paralympiër uit Leuven" verhaal door een sterke lokale ondersteuningsweb op te bouwen.</p>
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
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">3. Het Prestatie Team</h2>
          </div>

          <div className="bg-white border border-zinc-200 p-8">
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-2">Expert Ondersteuning</p>
              <h3 className="text-xl font-bold mb-4">Atletische, Fysieke & Mentale Voorbereiding</h3>
            </div>

            <div className="space-y-4 text-zinc-700">
              <div>
                <h4 className="font-bold mb-2">Doel:</h4>
                <p>Dit is het niet-financiële, high-performance team verantwoordelijk voor mijn atletische, fysieke en mentale voorbereiding.</p>
              </div>

              <div>
                <h4 className="font-bold mb-2">Profiel:</h4>
                <p>Dit is mijn kern atletische ondersteuningsstructuur, die al in ontwikkeling is.</p>
              </div>

              <div>
                <h4 className="font-bold mb-2">Team Leden:</h4>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li>Trainers & Coaches</li>
                  <li>Voedingsdeskundige / Nutritionist</li>
                  <li>Kine (Fysiotherapeut)</li>
                  <li>Klim Federatie</li>
                  <li>G-Sport Vlaanderen</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Table */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">Samenvatting: Financiële Partnerschap Niveaus</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-zinc-300">
              <thead>
                <tr className="bg-black text-white">
                  <th className="border border-zinc-300 p-4 text-left font-bold">Kenmerk</th>
                  <th className="border border-zinc-300 p-4 text-left font-bold">De Leuven Circle</th>
                  <th className="border border-zinc-300 p-4 text-left font-bold">De Prime Partners</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr>
                  <td className="border border-zinc-300 p-4 font-bold">Doel</td>
                  <td className="border border-zinc-300 p-4">Lopende kosten dekken, campagne financieren</td>
                  <td className="border border-zinc-300 p-4">100% prestatie focus (en communicatie) mogelijk maken in laatste jaar</td>
                </tr>
                <tr className="bg-zinc-50">
                  <td className="border border-zinc-300 p-4 font-bold">Geografie</td>
                  <td className="border border-zinc-300 p-4">Leuven</td>
                  <td className="border border-zinc-300 p-4">Vlaanderen / Nationaal</td>
                </tr>
                <tr>
                  <td className="border border-zinc-300 p-4 font-bold"># Partners</td>
                  <td className="border border-zinc-300 p-4">8</td>
                  <td className="border border-zinc-300 p-4">~4</td>
                </tr>
                <tr className="bg-zinc-50">
                  <td className="border border-zinc-300 p-4 font-bold">Vraag (per partner)</td>
                  <td className="border border-zinc-300 p-4">€1.000 &lt;</td>
                  <td className="border border-zinc-300 p-4">~€10.000 (eenmalig of laatste jaar)</td>
                </tr>
                <tr>
                  <td className="border border-zinc-300 p-4 font-bold">Doelwit Profiel</td>
                  <td className="border border-zinc-300 p-4">lokale KMO's</td>
                  <td className="border border-zinc-300 p-4">Banken, Supermarkten, grote B2C ketens</td>
                </tr>
                <tr className="bg-zinc-50">
                  <td className="border border-zinc-300 p-4 font-bold">Tijdslijn</td>
                  <td className="border border-zinc-300 p-4">Veiligstellen binnen 6 maanden</td>
                  <td className="border border-zinc-300 p-4">Veiligstellen tegen midden 2027</td>
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
