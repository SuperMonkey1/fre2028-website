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
          <div className="inline-block px-4 py-2 mb-8 border border-zinc-200 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
            Partnerschap Kans
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8">
            Word Partner
          </h1>
          <p className="text-xl text-zinc-600 leading-relaxed max-w-2xl mx-auto">
            Sluit je aan bij Team Fré2028.LA en help geschiedenis te schrijven. Ondersteun Fré Leys' reis om België's eerste Paralympische klimmer te worden en promoot de Paralympische Spelen in Vlaanderen.
          </p>
        </div>
      </section>

      {/* Executive Summary */}
      <section className="py-20 bg-white border-b border-zinc-100">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-12 text-center">
            Executive summary
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
                  <strong>Doel:</strong> Fré's persoonlijk verhaal om Leuvenaars en Vlamingen te betrekken bij de Paralympische Spelen 2028.
                </p>
                <p>
                  <strong>Strategie:</strong> Twee-fasen campagne van 1000 dagen tot lancering, beginnend lokaal in Leuven en uitbreidend naar Vlaanderen.
                </p>
                <p>
                  <strong>Platform:</strong> Centraal knooppunt op FRE2028.LA met persoonlijk verhaal, blog, resultaten en partner showcase.
                </p>
                <p>
                  <strong>Impact:</strong> Bewustzijn en betrokkenheid opbouwen bij de Paralympische beweging door strategische media-initiatieven.
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
                  <strong>Doelstellingen:</strong> Middelen veiligstellen voor topprestaties en een team opbouwen om de Paralympische Spelen te promoten in Leuven en Vlaanderen.
                </p>
                <p>
                  <strong>Financiële Partners:</strong> Leuven Circle (8 lokale partners voor €8.000/jaar basis) en een viertal Nationale Lead Partners voor volledige focus.
                </p>
                <p>
                  <strong>Communicatie Partners:</strong> 4 strategische partners die pro-bono communicatie-expertise en diensten bieden.

                </p>
                <p>
                  <strong>Performance Team:</strong> Mijn sportief kader.
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
            <div className="bg-white border border-zinc-200 p-8">
              <h3 className="text-2xl font-bold mb-4">Leuven Founding Circle</h3>
              <p className="text-zinc-700 mb-4">
                Sluit je aan bij 8 lokale partners die de basis vormen voor Fré2028.LA. Jaarlijkse bijdrage van €1.000 dekt kern klimkosten.
              </p>
              <ul className="space-y-2 text-zinc-600">
                <li>• Erkenning als founding member</li>
                <li>• Uitgelicht op partners pagina en website</li>
                <li>• Lokale gemeenschapsimpact</li>
                <li>• Jaarlijkse partnerschapsvergadering</li>
              </ul>
            </div>

            <div className="bg-white border border-zinc-200 p-8">
              <h3 className="text-2xl font-bold mb-4">Nationale Lead Partners</h3>
              <p className="text-zinc-700 mb-4">
                3 strategische partners die volledige focus op prestaties en nationale zichtbaarheid via de Paralympics mogelijk maken.
              </p>
              <ul className="space-y-2 text-zinc-600">
                <li>• Maximale impact positionering</li>
                <li>• Nationale media exposure</li>
                <li>• Exclusieve partnerschapsvoordelen</li>
                <li>• Directe betrokkenheid bij campagne</li>
              </ul>
            </div>

            <div className="bg-white border border-zinc-200 p-8">
              <h3 className="text-2xl font-bold mb-4">Strategische Communicatie Partners</h3>
              <p className="text-zinc-700 mb-4">
                4 partners die pro-bono expertise bieden om de Paralympische boodschap in Vlaanderen te versterken.
              </p>
              <ul className="space-y-2 text-zinc-600">
                <li>• Toon expertise in communicatie</li>
                <li>• Draag bij aan Paralympisch bewustzijn</li>
                <li>• Netwerk met andere strategische partners</li>
                <li>• Langdurige merkassociatie</li>
              </ul>
            </div>

            <div className="bg-white border border-zinc-200 p-8">
              <h3 className="text-2xl font-bold mb-4">Performance Team Partners</h3>
              <p className="text-zinc-700 mb-4">
                Ondersteun het team dat Fré de beste adaptieve klimmer ter wereld maakt: coaches, fysiotherapeuten, sportpsychologen.
              </p>
              <ul className="space-y-2 text-zinc-600">
                <li>• Directe bijdrage aan Paralympisch succes</li>
                <li>• Associatie met elite sportprestaties</li>
                <li>• Erkenning in performance team</li>
                <li>• Impact op Paralympische geschiedenis</li>
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