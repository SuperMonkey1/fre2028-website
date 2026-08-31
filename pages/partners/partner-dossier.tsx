import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { Mountain, Mail, Globe, Instagram, Award } from 'lucide-react';
import Link from 'next/link';

export default function PartnerDossierPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <Head>
        <title>Partnerschap Dossier - Fré Leys | Team 2028</title>
        <meta name="description" content="Partnership opportunities with Fré Leys on the road to Paralympics 2028" />
      </Head>

      <header className="pt-12 pb-8 bg-black text-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-3 font-bold text-lg tracking-widest uppercase mb-4">
            <Mountain className="w-6 h-6" />
            <div>FRÉ2028.LA</div>
          </div>
          <div className="inline-block bg-amber-400 text-black text-xs font-black uppercase tracking-wider px-3 py-1 mb-3 rounded-xs">
            "Engineering my way to the Paralympics in 2028"
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Partnerschapsdossier — De Leuven 25 Support Circle</h1>
          <p className="text-zinc-300 max-w-3xl text-lg leading-relaxed">
            Hoe Dr. Ir. Frederik Leys Leuvense engineering, spitstechnologie en een consortium van 25 innovatieve bedrijven bundelt op weg naar goud in Los Angeles 2028.
          </p>
        </div>
      </header>

      <main className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-3">De "Engineer-Athlete" & Leuven Innovatie</h2>
              <p className="text-lg text-zinc-700 leading-relaxed mb-6">
                Leuven is de European Capital of Innovation. Als burgerlijk ingenieur (PhD KU Leuven) en 2x Wereldbeker goudwinnaar benadert Fré topsport als een mechatronisch optimalisatievraagstuk: sensor-data, custom trainingstools, biomechanica en materiaalkunde. Fré's paralympische traject fungeert als een levend R&D-testbed voor Leuvense technologie.
              </p>

              <h3 className="text-xl font-bold mt-4 mb-2">De Leuven 25 Support Circle (€100 / maand)</h3>
              <p className="text-zinc-700 mb-4">
                Een exclusief collectief van 25 innovatieve Leuvense ondernemingen die met €100/maand (€1.200/jaar) een professioneel topsporttraject en technologische innovatie mogelijk maken. Reiskosten (bv. circa €3.500 eigen opleg in 2026 door gebrek aan overheidssubsidies) en fulltime voorbereiding worden zo gedekt.
              </p>

              <h3 className="text-xl font-bold mt-4 mb-2">Wat krijgt jouw bedrijf terug?</h3>
              <ul className="list-disc pl-5 text-zinc-700 space-y-2 mb-6">
                <li><strong>Zichtbaarheid:</strong> Logo op de officiële campagneposter, website en trainingskledij / campagne T-shirt</li>
                <li><strong>Jaarevent:</strong> 1x per jaar exclusief partnerevent met kliminitiatie, filmvertoning en keynote talk over innovatie, veerkracht en topsport</li>
                <li><strong>Lokale impact:</strong> Aanwezigheid op Kerstmarkt 2027 en Poster 2028 huis-aan-huis in Leuven en elke school</li>
                <li><strong>R&D & Maatschappelijke betrokkenheid:</strong> Directe verbinding met spitstechnologie en steun voor paraclimbing.be en de Paralympische beweging</li>
              </ul>

              <h3 className="text-xl font-bold mt-4 mb-2">Hoe meer info?</h3>
              <p className="text-zinc-700 mb-8">Download het volledige dossier (PDF) of contacteer mij voor een inspirerende kennismaking.</p>

              <div className="flex gap-4">
                <a className="inline-flex items-center gap-3 bg-black text-white px-6 py-3 rounded font-bold hover:opacity-90" href="/Frederik-Leys-Partnership-Dossier.pdf" download>
                  <Award className="w-4 h-4" /> Download PDF
                </a>
                <a className="inline-flex items-center gap-3 border border-black px-6 py-3 rounded font-bold hover:bg-black hover:text-white transition-colors" href="mailto:frederik.leys@gmail.com">
                  <Mail className="w-4 h-4" /> Contacteer Fré
                </a>
              </div>
            </div>

            <aside className="bg-zinc-50 p-6 rounded border border-zinc-200">
              <div className="relative aspect-[4/3] w-full overflow-hidden border mb-4">
                <Image src="/images/web/me_innsbruck_f.webp" alt="Fré climbing" fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" quality={80} />
              </div>
              <div className="text-sm text-zinc-700 space-y-3">
                <p className="font-bold">Fré Leys — Paraclimber</p>
                <p>Werkt en woont in Leuven. Meervoudig World Cup medaillewinnaar en kandidaat voor LA 2028.</p>
                <div className="pt-3 border-t border-zinc-200">
                  <p className="text-xs font-bold">Contact</p>
                  <p className="text-xs">fre@fre2028.la</p>
                  <p className="text-xs">www.fre2028.la</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-zinc-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">© 2025 Fré Leys</div>
          <div className="mt-4 flex gap-3 items-center justify-center">
            <a href="https://www.instagram.com/fre.climbs" target="_blank" rel="noopener noreferrer" className="text-zinc-700 hover:opacity-80">Instagram</a>
            <a href="https://www.fre2028.la" target="_blank" rel="noopener noreferrer" className="text-zinc-700 hover:opacity-80">fre2028.la</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
