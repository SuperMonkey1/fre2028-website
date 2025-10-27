import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  Mountain, 
  ArrowLeft, 
  Calendar, 
  Award, 
  Heart,
  Zap,
  Target,
  Users,
  TrendingUp
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useRouter } from 'next/router';

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---
const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'white' }>(({ className, variant = 'primary', ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center text-sm font-semibold tracking-wide transition-all duration-200 disabled:opacity-50",
        "h-12 px-8",
        variant === 'primary' && "bg-black text-white hover:bg-zinc-800",
        variant === 'outline' && "border border-current bg-transparent hover:opacity-60",
        variant === 'white' && "bg-white text-black hover:bg-zinc-200",
        className
      )}
      {...props}
    />
  )
})
Button.displayName = "Button"

// --- Story Data ---
const STORY_CHAPTERS = [
  {
    id: 'beginning',
    year: 'Opgegroeid op de Luchtbal',
    title: 'De Kiementijd',
    subtitle: 'Sport, Natuur en Bewijsdrang',
    content: [
      'Ik ben geboren in Merksem en opgegroeid op de Luchtbal in Antwerpen, als zoon van een leerkracht en een directiesecretaresse. Mijn lagere schooltijd heeft me diepgaand gevormd. Het was een school waar sport centraal stond. Ons kleine schooltje won met twee vingers in de neus zowat elk sporttoernooi waaraan we deelnamen. Hoewel er thuis geen aandacht was voor sport, moet mijn passie hier zijn ontstaan.',
      'Op die school voelde ik een constante drang om mezelf te bewijzen, niet alleen op sportief vlak, maar ook om door anderen als capabel en "normaal" te worden beschouwd. Ik merkte al snel dat volwassenen die me niet goed kenden, me ongevraagd in bescherming wilden nemen. In hun ogen was het zorgzaamheid, maar voor mij was het overbescherming die me soms uitsloot van activiteiten. Die noodzaak om telkens opnieuw te bewijzen dat ik alles kon, werd een van mijn sterkste karaktereigenschappen.',
      'Naast school bracht ik veel tijd door in de natuur. Mijn vader was conservator van verschillende natuurgebieden, waaronder De Oude Landen. Als kind en tiener hielp ik mee met het natuuronderhoud: hooien op de hooilanden en het knotten van knotwilgen werden vertrouwde bezigheden.'
    ]
  },
  {
    id: 'youth',
    year: 'Middelbare School',
    title: 'Nieuwe Horizonten',
    subtitle: 'Wetenschap en Avontuur',
    content: [
      'Mijn middelbare school in Ekeren was een vrijzinnige school met een open visie op de wereld. Het was een aangename tijd waar nieuwsgierigheid, studeren en het opbouwen van een maatschappelijke visie werden aangemoedigd. Het belang van moraal, wetenschap en politiek werd ons bijgebracht.',
      'Tegelijkertijd bleef ik intensief sporten: zwemmen, voetbal en vooral fietsen. Gevoed door nieuwsgierigheid genoot ik van urenlange fietstochten, het liefst naar plaatsen waar ik nog nooit was geweest, puur om nieuwe dingen te ontdekken. Hier, tijdens mijn middelbare school, ontdekte ik mijn passie voor avontuur.',
      'Van thuis uit kreeg ik ook een fascinatie voor wetenschap en technologie mee. Mijn vader, een wiskundige en informaticus, was altijd bezig met technologie. Als kind zag ik hem een huis bouwen en tractoren repareren, wat mijn interesse in hoe dingen werken alleen maar aanwakkerde.'
    ]
  },
  {
    id: 'university',
    year: 'Universitaire Jaren',
    title: 'De Ingenieur als Avonturier',
    subtitle: 'Van KULibrie tot Expeditie Robinson',
    content: [
      'Aan de universiteit in Leuven koos ik voor de studie Burgerlijk Ingenieur. Eerlijk gezegd was ik geen topstudent; ik had een hekel aan het pure studeren. Mijn energie ging vooral naar studentenvertegenwoordiging, waar ik enorm veel leerde over organiseren, budgetteren en samenwerken. Een Erasmus-uitwisseling in Chennai, India, opende mijn ogen voor de wereld.',
      'Mijn passie voor onderzoek en ontwikkeling ontdekte ik pas echt tijdens mijn masterproef: de ontwikkeling van een robotkolibrie. Inderdaad, een drone die vliegt door met zijn vleugels te flapperen. Mijn promotor, professor Dirk Vandepitte, bood me de kans om hierop te doctoreren. Vijf jaar lang was ik volledig geobsedeerd en het resultaat was de "KULibrie", een verwezenlijking waar ik enorm trots op ben.',
      'Na mijn doctoraat probeerde ik dit via mijn bedrijfje Hummingdrones te commercialiseren. Hoewel het geen commercieel succes werd, was het een ongelooflijk leerrijk traject.',
      'Een ander onvergetelijk avontuur was mijn deelname aan Expeditie Robinson. Het was een fantastische ervaring: loodzwaar, maar op vele vlakken ontzettend leerzaam. Een bijzondere speling van het lot wilde dat in dezelfde week in april 2018 de KULibrie voor het eerst succesvol vloog én ik het telefoontje kreeg dat ik geselecteerd was voor de expeditie. Het was een week waarin twee totaal verschillende dromen – een technologische en een avontuurlijke – samenkwamen.'
    ]
  },
  {
    id: 'climbing',
    year: '2016-Heden',
    title: 'De Verticale Roeping',
    subtitle: 'De Geboorte van een Paraklimmer',
    content: [
      'Tijdens mijn doctoraat kreeg ik een nieuw type prothese, wat een wereld van sporten voor me opende. Ik begon te lopen, te schaatsen en, belangrijker nog, te klimmen.',
      'Mijn eerste trainer, Tijl, spoorde me al snel aan om mee te doen aan wedstrijden. Ik zei: "Van zodra ik 6a klim, doe ik mee." De dag dat ik mijn eerste 6a klom, hield ik mijn woord. Op mijn allereerste wedstrijd werd ik meteen derde.',
      'De volgende was het WK in Parijs in 2016. Ik had net mijn doctoraat geschreven in een Volkswagenbusje uit 1975 en als laatste stop van die trip werd ik, tot mijn eigen verbazing, vijfde op het wereldkampioenschap.',
      'Ondertussen klim ik 7c. Zowel mijn eigen niveau als dat van de concurrentie is sindsdien explosief gestegen. Met 6b eindig je vandaag als laatste.'
    ]
  },
  {
    id: 'future',
    year: '2025-2028',
    title: 'De Toekomst',
    subtitle: 'De Weg naar Goud',
    content: [
      'Vandaag combineer ik mijn topsportcarrière met mijn werk als zelfstandig ingenieur bij iVOX, een Leuvens onderzoeksbureau. Het is een boeiende job met fijne collega\'s die de perfecte balans biedt. Het werk brengt een belangrijk ritme in mijn leven en geeft me tegelijkertijd de flexibiliteit en tijd om voluit op mijn sport te focussen.',
      'Die stabiele basis is cruciaal, want de komende jaren staat alles in het teken van één doel: paralympisch goud. Om te winnen in 2028, schat ik dat ik een niveau van 8b zal moeten klimmen – een niveau waarmee ik mogelijks in de top 10 van het Belgisch kampioenschap voor valide klimmers zou staan.',
      'Dit doel is allesverslindend, maar ik doe het met passie. Ik zie het als een enorm privilege om voor België te mogen uitkomen en hoop dat ik anderen met een of twee benen kan inspireren om ook te starten met klimmen, of welke sport dan ook.'
    ]
  }
];

const PERSONAL_STATS = [
  { icon: Calendar, label: 'Jaren Klimmen', value: '9+' },
  { icon: Award, label: 'Internationale Medailles', value: '12+' },
  { icon: TrendingUp, label: 'Hoogste Niveau', value: '7c' },
  { icon: Users, label: 'Geïnspireerde Mensen', value: '500+' }
];

export default function StoryPage() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <Head>
        <title>Mijn Verhaal - Van Luchtbal naar LA 2028 | Frederik Leys Paraklimmer</title>
        <meta name="description" content="Het inspirerende verhaal van Frederik 'Fré' Leys uit Leuven: van ingenieur en Expeditie Robinson deelnemer tot wereldkampioen paraklimmen en paralympische atleet richting Los Angeles 2028." />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://www.fre2028.la/story" />
        <meta property="og:title" content="Mijn Verhaal - Van de Luchtbal naar LA 2028 Paralympics" />
        <meta property="og:description" content="Het inspirerende verhaal van Frederik 'Fré' Leys: van ingenieur tot wereldkampioen paraklimmen en paralympische atleet." />
        <meta property="og:image" content="https://www.fre2028.la/images/me_busje.webp" />
        <meta property="og:locale" content="nl_BE" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://www.fre2028.la/story" />
        <meta property="twitter:title" content="Mijn Verhaal - Van de Luchtbal naar LA 2028 Paralympics" />
        <meta property="twitter:description" content="Het inspirerende verhaal van Frederik 'Fré' Leys: van ingenieur tot wereldkampioen paraklimmen." />
        <meta property="twitter:image" content="https://www.fre2028.la/images/me_busje.webp" />
        
        {/* Additional SEO */}
        <meta name="author" content="Frederik Leys" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.fre2028.la/story" />
        
        {/* JSON-LD for Article */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              "headline": "Van de Luchtbal naar LA 2028 - Het verhaal van Frederik Leys",
              "description": "Het inspirerende verhaal van Frederik 'Fré' Leys uit Leuven: van ingenieur en Expeditie Robinson deelnemer tot wereldkampioen paraklimmen en paralympische atleet richting Los Angeles 2028.",
              "author": {
                "@type": "Person",
                "name": "Frederik Leys",
                "url": "https://www.fre2028.la"
              },
              "datePublished": "2025-01-01",
              "dateModified": "2025-01-01",
              "publisher": {
                "@type": "Person",
                "name": "Frederik Leys"
              },
              "image": "https://www.fre2028.la/images/me_busje.webp",
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": "https://www.fre2028.la/story"
              },
              "keywords": "paraclimbing, paralympics, Leuven, België, Frederik Leys, Expeditie Robinson, KU Leuven, ingenieur, adaptive sports"
            })
          }}
        />
      </Head>
      
      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b bg-white/95 backdrop-blur-sm border-zinc-200",
        isScrolled ? "py-3 shadow-sm" : "py-4 md:py-6"
      )}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-3 font-bold text-lg tracking-widest uppercase text-black hover:opacity-60 transition-opacity"
          >
             <Mountain className="w-6 h-6" />
             <span>Fré.Climbs</span>
          </button>

          <Button 
            onClick={() => router.push('/')}
            variant="outline"
            className="h-10 px-6 text-xs"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Terug naar Home
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 md:pt-40 pb-16 md:pb-20 bg-gradient-to-b from-zinc-50 to-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="text-center md:text-left">
              <div className="inline-block px-4 py-2 mb-6 md:mb-8 border border-zinc-300 text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">
                Mijn Volledige Reis
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-none mb-6 md:mb-8">
                VAN DE LUCHTBAL<br />NAAR <span className="text-zinc-600">LA 2028</span>.
              </h1>
              <p className="text-lg md:text-xl text-zinc-600 leading-relaxed">
                Een reis die me via de wereld van engineering en avontuur naar de verticale wereld van het paraklimmen bracht, 
                met één duidelijk doel voor ogen: goud op de Paralympische Spelen van 2028 in Los Angeles.
              </p>
            </div>
            <div className="relative">
              <img 
                src="/images/me_busje.webp" 
                alt="Fré met zijn Volkswagenbusje" 
                className="w-full h-auto rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-16 bg-black text-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {PERSONAL_STATS.map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="w-8 h-8 mx-auto mb-4 opacity-60" />
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Chapters */}
      <section className="py-20 md:py-32">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="space-y-24 md:space-y-32">
            {STORY_CHAPTERS.map((chapter, index) => (
              <div key={chapter.id} className="relative">
                {/* Chapter Header */}
                <div className="mb-8 md:mb-12">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-xs md:text-sm font-bold tracking-widest uppercase text-zinc-400">
                      {chapter.year}
                    </span>
                    <div className="flex-1 h-px bg-zinc-200" />
                  </div>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-3 md:mb-4">
                    {chapter.title}
                  </h2>
                  <p className="text-base md:text-lg text-zinc-600 italic">
                    {chapter.subtitle}
                  </p>
                </div>

                {/* Chapter Content with Image */}
                {(chapter.id === 'beginning' || chapter.id === 'youth' || chapter.id === 'university' || chapter.id === 'climbing' || chapter.id === 'future') ? (
                  <div className={cn(
                    "grid md:grid-cols-[1fr,400px] gap-8 md:gap-12 items-start",
                    (chapter.id === 'youth' || chapter.id === 'climbing') && "md:grid-cols-[400px,1fr]"
                  )}>
                    {(chapter.id === 'youth' || chapter.id === 'climbing') ? (
                      <>
                        <div className="relative order-2 md:order-1">
                          {chapter.id === 'youth' && (
                            <img 
                              src="/images/me_oude_landen.webp" 
                              alt="Fré in De Oude Landen tijdens natuuronderhoud" 
                              className="w-full h-auto rounded-lg shadow-lg sticky top-24"
                            />
                          )}
                          {chapter.id === 'climbing' && (
                            <img 
                              src="/images/me_podium.webp" 
                              alt="Fré tijdens het paraklimmen" 
                              className="w-full h-auto rounded-lg shadow-lg sticky top-24"
                            />
                          )}
                        </div>
                        <div className="space-y-4 md:space-y-6 text-base md:text-lg leading-relaxed text-zinc-700 order-1 md:order-2">
                          {chapter.content.map((paragraph, pIndex) => (
                            <p key={pIndex}>
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-4 md:space-y-6 text-base md:text-lg leading-relaxed text-zinc-700">
                          {chapter.content.map((paragraph, pIndex) => (
                            <p key={pIndex}>
                              {paragraph}
                            </p>
                          ))}
                        </div>
                        <div className="relative">
                          {chapter.id === 'beginning' && (
                            <img 
                              src="/images/me_peuter.webp" 
                              alt="Fré als kind in de natuur" 
                              className="w-full h-auto rounded-lg shadow-lg sticky top-24"
                            />
                          )}
                          {chapter.id === 'university' && (
                            <img 
                              src="/images/me_kulibrie.webp" 
                              alt="Fré met de KULibrie robotkolibrie" 
                              className="w-full h-auto rounded-lg shadow-lg sticky top-24"
                            />
                          )}
                          {chapter.id === 'future' && (
                            <img 
                              src="/images/me_winning.webp" 
                              alt="Fré op het podium" 
                              className="w-full h-auto rounded-lg shadow-lg sticky top-24"
                            />
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 md:space-y-6 text-base md:text-lg leading-relaxed text-zinc-700">
                    {chapter.content.map((paragraph, pIndex) => (
                      <p key={pIndex}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}

                {/* Chapter Visual Separator */}
                {index < STORY_CHAPTERS.length - 1 && (
                  <div className="mt-12 md:mt-16 flex justify-center">
                    <div className="w-12 h-px bg-gradient-to-r from-transparent via-zinc-300 to-transparent" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 md:py-32 bg-zinc-50">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter mb-6 md:mb-8">
            Dit Is Pas Het Begin.
          </h2>
          <p className="text-lg md:text-xl text-zinc-600 mb-10 md:mb-12 max-w-2xl mx-auto">
            De weg naar LA 2028 gaat verder, en elke supporter maakt deze reis mogelijk. 
            Ga met me mee terwijl we herdefiniëren wat mogelijk is.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center">
            <Button 
              onClick={() => router.push('/#journey')}
              className="min-w-[200px]"
            >
              Bekijk Roadmap
            </Button>
            <Button 
              onClick={() => router.push('/#contact')}
              variant="outline"
              className="min-w-[200px]"
            >
              Word Partner
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 font-bold uppercase tracking-widest hover:opacity-60 transition-opacity"
          >
            <Mountain className="w-6 h-6" />
            <span>Fré.Climbs</span>
          </button>
          
          <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            © 2025 Fré Leys
          </div>
        </div>
      </footer>
    </div>
  )
}