import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Mountain, Target, Users, Briefcase, Award, TrendingUp, ArrowLeft, Radio, Video, Newspaper, Globe, ExternalLink } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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

export default function BecomePartner() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <Head>
        <title>Word Partner - Fré Leys Road to LA 2028</title>
        <meta name="description" content="Sluit je aan bij Team Fré2028.LA en ondersteun Fré Leys' reis naar de Paralympische Spelen LA 2028" />
        <meta property="og:title" content="Word Partner - Fré Leys Road to LA 2028" />
        <meta property="og:description" content="Sluit je aan bij Team Fré2028.LA en ondersteun Fré Leys' reis naar de Paralympische Spelen LA 2028" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.fre2028.la/become-partner" />
        <link rel="canonical" href="https://www.fre2028.la/become-partner" />
      </Head>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b bg-white border-zinc-100 py-6">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-3 font-bold text-lg tracking-widest uppercase hover:opacity-60 transition-opacity"
          >
            <Mountain className="w-6 h-6" />
            <span>Fré2028.LA</span>
          </button>

          <Button
            onClick={() => router.push('/partners')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Terug naar partners
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-zinc-50">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <div className="inline-block px-4 py-2 mb-4 border border-zinc-200 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
            Partnerschap & Innovatie
          </div>
          <div className="text-xs font-extrabold uppercase tracking-widest text-amber-700 bg-amber-100 border border-amber-300 px-3 py-1 inline-block rounded-sm mb-6">
            "Engineering my way to the Paralympics in 2028"
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8">
            Word Partner
          </h1>
          <p className="text-xl text-zinc-600 leading-relaxed max-w-2xl mx-auto">
            Sluit je aan bij Team Fré2028.LA. Samen met 25 innovatieve Leuvense bedrijven bundelen we spitstechnologie, mechatronica en topsport om België's eerste Paralympische klimmer naar goud te loodsen.
          </p>
        </div>
      </section>

      {/* Executive Summary */}
      <section className="py-20 bg-white border-b border-zinc-100">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-12 text-center">
            Executive Summary
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Communication Plan Summary */}
            <div className="bg-gradient-to-br from-zinc-50 to-white border border-zinc-200 p-8 flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-6">
                <Radio className="w-8 h-8 text-black" />
                <h3 className="text-2xl font-bold">Communicatie Campagne</h3>
              </div>

              <div className="space-y-4 text-zinc-700">
                <p>
                  <strong>Doel:</strong> Fré's unieke "Engineer-Athlete" verhaal inzetten om Leuvenaars en Vlamingen te inspireren en te verbinden met de Paralympische Spelen 2028.
                </p>
                <p>
                  <strong>Strategie:</strong> Twee-fasen campagne van 1000 dagen tot de openingsceremonie in LA, startend met een krachtige lokale push in Leuven en doorgroeiend naar nationaal niveau.
                </p>
                <p>
                  <strong>Platform:</strong> Centraal knooppunt op FRE2028.LA met blog over R&D, trainingsbevindingen, resultaten en partner showcase.
                </p>
                <p>
                  <strong>Impact:</strong> Structurele zichtbaarheid voor innovatieve partners en promotie van inclusieve topsport.
                </p>
              </div>

              <Button
                onClick={() => router.push('/communication-plan')}
                variant="outline"
                className="mt-6 w-full"
              >
                Lees Volledig Communicatieplan
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Partnership Plan Summary */}
            <div className="bg-gradient-to-br from-zinc-50 to-white border border-zinc-200 p-8 flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="w-8 h-8 text-black" />
                <h3 className="text-2xl font-bold">Partnerschap Strategie</h3>
              </div>

              <div className="space-y-4 text-zinc-700">
                <p>
                  <strong>Doel:</strong> 25 innovatieve Leuvense bedrijven verenigen in de <em>Leuven 25 Support Circle</em> (€100/mnd of €1.200/jaar) om als voltijds atleet & onderzoeker toe te werken naar goud in LA 2028.
                </p>
                <p>
                  <strong>R&D Testbed & Innovatie:</strong> Leuven is de European Capital of Innovation. Fré's training, lichaam en uitrusting functioneren als testbed voor lokale spitstechnologie.
                </p>
                <p>
                  <strong>Strategische Partners:</strong> Lokale bureaus en experts die pro-bono communicatie-, media- en technische expertise inzetten.
                </p>
                <p>
                  <strong>Performance Team:</strong> Wetenschappelijke begeleiding (coaches, kine, biomechanici, sportpsycholoog).
                </p>
              </div>

              <Button
                onClick={() => router.push('/partnership-plan')}
                variant="outline"
                className="mt-6 w-full"
              >
                Lees Volledig Partnerschap Plan
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Opportunities */}
      <section className="py-20 bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-12 text-center">
            Partnerschap Kansen
          </h2>

          <div className="space-y-8">
            <div className="bg-white border-2 border-black p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                <h3 className="text-2xl font-bold">De Leuven 25 Support Circle</h3>
                <span className="inline-block px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-wider">
                  €100 / maand • €1.200 / jaar
                </span>
              </div>
              <p className="text-zinc-700 mb-6">
                Sluit je aan bij de Leuven 25 Support Circle — het erecollectief van 25 innovatieve Leuvense engineering- en techbedrijven. Omdat overheidssubsidies voor paraklimmen uiterst schaars zijn (bv. circa €3.500 eigen opleg in 2026 voor wedstrijdreizen), maakt deze bijdrage van €100/maand een voltijds professioneel topsporttraject en technologische optimalisatie mogelijk.
              </p>
              
              <div className="bg-zinc-50 p-5 border border-zinc-200 rounded-sm mb-4">
                <h4 className="font-bold text-sm uppercase tracking-wider text-zinc-900 mb-3">
                  Concrete Return voor jouw bedrijf:
                </h4>
                <ul className="space-y-2 text-zinc-700 text-sm">
                  <li>• <strong>Prominente zichtbaarheid:</strong> Logo op de officiële campagne-poster, website en trainingskledij / campagne T-shirt.</li>
                  <li>• <strong>Exclusief Jaarevent:</strong> 1x per jaar partnerevent met kliminitiatie, filmvertoning en keynote over veerkracht, innovatie en de 'engineer-athlete' mentaliteit.</li>
                  <li>• <strong>Kerstmarkt 2027:</strong> Zichtbaarheid bij acties en aanwezigheid op de Leuvense Kerstmarkt.</li>
                  <li>• <strong>Grote Poster 2028:</strong> Logo op de officiële poster die huis-aan-huis gebust wordt in elk huis in Leuven en op elke school.</li>
                  <li>• <strong>Maatschappelijke & R&D Impact:</strong> Directe betrokkenheid bij innovatie, inclusie en paraklimmen (<a href="https://paraclimbing.be" target="_blank" rel="noopener noreferrer" className="underline font-semibold">paraclimbing.be</a>).</li>
                </ul>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 p-8">
              <h3 className="text-2xl font-bold mb-4">Strategische Partners (Leuven)</h3>
              <p className="text-zinc-700 mb-4">
                Lokale mediabureaus, PR-specialisten, videografen en prototyping-partners die pro-bono hun expertise inzetten om het Paralympische innovatieverhaal breed uit te dragen.
              </p>
              <ul className="space-y-2 text-zinc-600">
                <li>• Toon technologisch leiderschap en maatschappelijke betrokkenheid in Leuven</li>
                <li>• Versterk de zichtbaarheid van paraklimmen en innovatieve topsport</li>
                <li>• Netwerk met de 25 Leuvense partnerondernemingen</li>
                <li>• Structurele merkassociatie met een uniek "Engineer-Athlete" topsporttraject</li>
              </ul>
            </div>

            <div className="bg-white border border-zinc-200 p-8">
              <h3 className="text-2xl font-bold mb-4">Performance & Data Team Partners</h3>
              <p className="text-zinc-700 mb-4">
                Ondersteun het sportwetenschappelijke team dat Fré de beste paraklimmer ter wereld maakt: coaches, fysiotherapeuten, biomechanici en sportpsychologen.
              </p>
              <ul className="space-y-2 text-zinc-600">
                <li>• Directe bijdrage aan Paralympisch goud in Los Angeles 2028</li>
                <li>• Associatie met grensverleggende data-analyse en sportbiomechanica</li>
                <li>• Erkenning als lid van het officiële Performance Team</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8">
            Klaar om Team 2028 te Joinen?
          </h2>
          <p className="text-xl text-zinc-400 mb-12 leading-relaxed">
            Neem direct contact op met Fré om partnerschapskansen te bespreken en hoe je kunt bijdragen aan deze historische reis.
          </p>
          <div className="flex flex-wrap gap-6 justify-center">
            <Button
              onClick={() => router.push('/#contact')}
              variant="white"
            >
              Contacteer Fré
            </Button>
            <Button
              onClick={() => router.push('/partners')}
              variant="outline"
            >
              Bekijk Huidige Partners
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 font-bold uppercase tracking-widest mx-auto hover:opacity-60 transition-opacity"
          >
            <Mountain className="w-6 h-6" />
            <span>Fré2028.LA</span>
          </button>
          <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 mt-6">
            © 2025 Fré Leys
          </div>
        </div>
      </footer>
    </div>
  )
}