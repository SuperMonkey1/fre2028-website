import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Calendar, Globe, Newspaper, TrendingUp, Target, Radio, ArrowLeft } from 'lucide-react';

export default function Node1() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <Head>
        <title>Node 1: Campaign Launch - Fré Leys Road to LA 2028</title>
        <meta name="description" content="Node 1: Campaign Launch - 1000 Days Out, November 20, 2025" />
      </Head>

      {/* Header */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-4">
          <button 
            onClick={() => router.push('/communication-plan')}
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:opacity-60 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Communication Plan
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-green-50 to-white border-b border-green-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 border border-green-600 text-xs font-bold uppercase tracking-[0.2em] text-green-600">
            <Calendar className="w-4 h-4" />
            Knooppunt 1
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
            Campagne Lancering
          </h1>
          <p className="text-xl md:text-2xl text-zinc-600 leading-relaxed">
            1000 Dagen - 20 November 2025
          </p>
        </div>
      </section>

      {/* Overview */}
      <section className="py-16 md:py-20 border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">Overzicht</h2>
          
          <div className="bg-green-50 border-l-4 border-green-600 p-6 mb-8">
            <p className="text-lg text-zinc-800 leading-relaxed">
              Deze node markeert de officiële start van de campagne, exact <strong>1000 dagen voor de Paralympische Spelen</strong>. 
              Het is het moment waarop we aan de wereld—en specifiek aan Leuven—aankondigen dat de reis naar LA 2028 is begonnen.
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-zinc-700 leading-relaxed mb-4">
              De campagnelancering is ontworpen om onmiddellijke zichtbaarheid en momentum te creëren. Door de mijlpaal van 1000 dagen te kiezen, 
              creëren we een gedenkwaardig moment waar mensen zich achter kunnen scharen. Dit gaat niet alleen over het aankondigen van mijn doel—het gaat erom 
              mijn gemeenschap uit te nodigen om vanaf het allereerste begin deel uit te maken van deze reis.
            </p>
            
            <p className="text-zinc-700 leading-relaxed">
              Alle elementen van deze lancering werken samen: de website biedt een centrale hub, de persconferentie genereert 
              mediadekking, het team building creëert partnerschappen, en de contentstrategie zorgt voor voortdurende betrokkenheid.
            </p>
          </div>
        </div>
      </section>

      {/* Detailed Activities */}
      <section className="py-16 md:py-20 bg-zinc-50">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12">Gedetailleerde Activiteiten</h2>

          <div className="space-y-8">
            {/* Website Launch */}
            <div className="bg-white border border-zinc-200 p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center">
                  <Globe className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Website Lancering</h3>
                  <p className="text-zinc-600">fre2028.LA gaat live</p>
                </div>
              </div>

              <div className="space-y-4 text-zinc-700">
                <p>
                  De website dient als het digitale thuishonk van de campagne. De domeinnaam <strong>fre2028.LA</strong> werd 
                  specifiek gekozen om Los Angeles te vertegenwoordigen, de gaststad van de Paralympische Spelen 2028.
                </p>

                <div className="bg-zinc-50 p-4 border-l-4 border-black">
                  <h4 className="font-bold mb-3">Initiele Website Inhoud:</h4>
                  <ul className="space-y-2 list-disc list-inside pl-2">
                    <li>Mijn persoonlijk verhaal en achtergrond</li>
                    <li>Het volledige communicatieplan</li>
                    <li>Partner showcase sectie</li>
                    <li>Portfolio (foto's, video's, podcasts)</li>
                    <li>Wedstrijdresultaten tracker</li>
                    <li>Maandelijkse blog/nieuwsbrief inschrijving</li>
                    <li>Link naar paraclimbing.be</li>
                  </ul>
                </div>

                <p>
                  De website is gebouwd om mee te groeien met de campagne. Naarmate we door de nodes voortschrijden, zullen voortdurend nieuwe content, media 
                  en functies worden toegevoegd.
                </p>
              </div>
            </div>

            {/* Media Launch */}
            <div className="bg-white border border-zinc-200 p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center">
                  <Newspaper className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Media Lancering</h3>
                  <p className="text-zinc-600">Persconferentie voor Leuvense media</p>
                </div>
              </div>

              <div className="space-y-4 text-zinc-700">
                <p>
                  Er wordt een gerichte persconferentie georganiseerd specifiek voor lokale Leuvense nieuwsmedia. Dit is een strategische 
                  beslissing om lokaal te beginnen voordat we nationaal gaan.
                </p>

                <div className="bg-zinc-50 p-4 border-l-4 border-black">
                  <h4 className="font-bold mb-3">Belangrijkste Boodschappen:</h4>
                  <ul className="space-y-2 list-disc list-inside pl-2">
                    <li>Eerste Paralympiër uit Leuven (indien ik slaag)</li>
                    <li>Historisch moment: paraklimmen debuteert op de Paralympics</li>
                    <li>1000 dagen tot de droom werkelijkheid wordt</li>
                    <li>Reis begint in Leuven, leidt naar Los Angeles</li>
                    <li>Paralympische bewustwording in België bevorderen</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <strong>Doelgroep Media:</strong> Lokale Leuvense kranten (Groot-Leuven, Nieuwsblad Leuven), 
                    lokale radiostations, stadsmagazine, en online nieuwsplatforms.
                  </p>
                </div>
              </div>
            </div>

            {/* Team Building */}
            <div className="bg-white border border-zinc-200 p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Team Building</h3>
                  <p className="text-zinc-600">"Team Fré" opbouwen</p>
                </div>
              </div>

              <div className="space-y-4 text-zinc-700">
                <p>
                  De lancering markeert de officiële start van partnerwerving. Dit omvat sponsors, supporters, 
                  mediapartners en medewerkers die zullen helpen om de reis naar LA 2028 mogelijk te maken.
                </p>

                <div className="bg-zinc-50 p-4 border-l-4 border-black">
                  <h4 className="font-bold mb-3">Partnerschap Categorieën:</h4>
                  <ul className="space-y-2 list-disc list-inside pl-2">
                    <li><strong>Financiële sponsors:</strong> Bedrijven die financiële steun bieden</li>
                    <li><strong>Product sponsors:</strong> Uitrusting, voeding, trainingsmateriaal</li>
                    <li><strong>Mediapartners:</strong> Nieuwsmedia, podcasters, content creators</li>
                    <li><strong>Service partners:</strong> Trainingsfaciliteiten, medische ondersteuning, coaching</li>
                    <li><strong>Community partners:</strong> Lokale organisaties, klimzalen, scholen</li>
                  </ul>
                </div>

                <p>
                  Alle partners zullen prominent worden getoond op de website en in campagnemateriaal. Het partnershipplan 
                  beschrijft specifieke voordelen en samenwerkingsmogelijkheden.
                </p>
              </div>
            </div>

            {/* Local Marketing */}
            <div className="bg-white border border-zinc-200 p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Lokale Marketingcampagne</h3>
                  <p className="text-zinc-600">Proefrun in Leuven</p>
                </div>
              </div>

              <div className="space-y-4 text-zinc-700">
                <p>
                  Dit is een "kleine" maar gerichte marketingcampagne ontworpen als een test voor de veel grotere 
                  stadsverzadigingscampagne gepland voor Knooppunt 4.
                </p>

                <div className="bg-zinc-50 p-4 border-l-4 border-black">
                  <h4 className="font-bold mb-3">Tactieken:</h4>
                  <ul className="space-y-2 list-disc list-inside pl-2">
                    <li>Kleine postercampagne op belangrijke locaties (klimzaal, sportcentra, universiteit)</li>
                    <li>Social media advertenties gericht op inwoners van Leuven</li>
                    <li>Samenwerking met lokale sportclubs voor kruispromotie</li>
                    <li>E-mailcampagne naar bestaande contacten en netwerken</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 border border-yellow-200">
                  <p className="text-sm text-yellow-900">
                    <strong>Leerdoel:</strong> Deze campagne is ontworpen om te leren wat wel en niet werkt 
                    bij het bereiken van de lokale gemeenschap, zodat we de grotere campagne bij Knooppunt 4 kunnen optimaliseren.
                  </p>
                </div>
              </div>
            </div>

            {/* Content Start */}
            <div className="bg-white border border-zinc-200 p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center">
                  <Radio className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Content Strategie Lancering</h3>
                  <p className="text-zinc-600">Regelmatige blog en sociale media</p>
                </div>
              </div>

              <div className="space-y-4 text-zinc-700">
                <p>
                  De contentstrategie begint met twee hoofdpijlers: de maandelijkse blog/nieuwsbrief en gestructureerde 
                  social media posts.
                </p>

                <div className="bg-zinc-50 p-4 border-l-4 border-black mb-4">
                  <h4 className="font-bold mb-3">Maandelijkse Blog/Nieuwsbrief:</h4>
                  <ul className="space-y-2 list-disc list-inside pl-2">
                    <li>Startpunt: ~100 bestaande abonnees</li>
                    <li>Thema: "Obstakels, bevindingen en ontdekkingen op de weg naar LA 2028"</li>
                    <li>Formaat: Persoonlijke reflecties, trainingsinzichten, behind-the-scenes verhalen</li>
                    <li>Doel: Organisch groeien van abonneebestand door kwaliteitscontent</li>
                  </ul>
                </div>

                <div className="bg-zinc-50 p-4 border-l-4 border-black">
                  <h4 className="font-bold mb-3">Social Media Strategie:</h4>
                  <ul className="space-y-2 list-disc list-inside pl-2">
                    <li><strong>Instagram:</strong> Primair platform (~5.000 volgers om mee te starten)</li>
                    <li><strong>Facebook:</strong> Secundair platform voor breder bereik</li>
                    <li><strong>Content mix:</strong> Trainingsvideo's, wedstrijdupdates, persoonlijke verhalen, partner features</li>
                    <li><strong>Post frequentie:</strong> 3-4 keer per week op Instagram, 2-3 op Facebook</li>
                  </ul>
                </div>

                <p className="mt-4">
                  Alle content zal verkeer naar fre2028.LA leiden en nieuwsbrief inschrijvingen aanmoedigen.
                </p>
              </div>
            </div>

            {/* Merchandise */}
            <div className="bg-white border border-zinc-200 p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center">
                  <span className="text-xl">👕</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Merchandise Ontwikkeling</h3>
                  <p className="text-zinc-600">Logo en product creatie</p>
                </div>
              </div>

              <div className="space-y-4 text-zinc-700">
                <p>
                  De merchandise ontwikkeling begint met het creëren van een campagnelogo dat de visuele 
                  identiteit wordt van de Road to LA 2028 reis.
                </p>

                <div className="bg-zinc-50 p-4 border-l-4 border-black">
                  <h4 className="font-bold mb-3">Initiële Productlijn:</h4>
                  <ul className="space-y-2 list-disc list-inside pl-2">
                    <li>T-shirts met campagnelogo</li>
                    <li>Petten/caps</li>
                    <li>Mogelijk: klim chalkbags met branding</li>
                    <li>Mogelijk: stickers en kleine promotie-items</li>
                  </ul>
                </div>

                <p>
                  Merchandise dient meerdere doelen: visuele campagne aanwezigheid creëren, enige inkomsten genereren 
                  om de campagne te ondersteunen, en supporters een tastbare manier geven om hun steun te tonen.
                </p>

                <div className="bg-blue-50 p-4 border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <strong>Tijdslijn:</strong> Logo ontwerp voltooid tegen midden november, eerste merchandise beschikbaar 
                    voor de campagnelancering op 20 november.
                  </p>
                </div>
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
              onClick={() => router.push('/communication-plan')}
              className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:opacity-60 transition-opacity"
            >
              <ArrowLeft className="w-4 h-4" />
              Communicatieplan
            </button>
            <button 
              onClick={() => router.push('/communication-plan/de-sterkste-vingers-van-Belgie')}
              className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:opacity-60 transition-opacity"
            >
              Volgende: Knooppunt 2
              <span className="rotate-180"><ArrowLeft className="w-4 h-4" /></span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
