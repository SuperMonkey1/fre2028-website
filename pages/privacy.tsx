import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Mountain, ArrowLeft, ShieldCheck, Mail, Lock, Trash2, Globe } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'white' }>(
  ({ className, variant = 'primary', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center text-sm font-semibold tracking-wide transition-all duration-200 disabled:opacity-50 h-11 px-6",
          variant === 'primary' && "bg-black text-white hover:bg-zinc-800",
          variant === 'outline' && "border border-zinc-300 text-black hover:border-black",
          variant === 'white' && "bg-white text-black hover:bg-zinc-200",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <Head>
        <title>Privacy Policy - FRÉ2028.LA</title>
        <meta name="description" content="Privacy Policy and User Data Deletion information for Frederik Leys / FRE2028.LA campaign and connected applications." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.fre2028.la/privacy" />
      </Head>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b bg-white/90 backdrop-blur-md border-zinc-100 py-4">
        <div className="max-w-4xl mx-auto px-4 md:px-8 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-3 font-bold text-lg tracking-widest uppercase hover:opacity-60 transition-opacity"
          >
            <Mountain className="w-5 h-5" />
            <span>FRÉ2028.LA</span>
          </button>

          <Button onClick={() => router.push('/')} variant="outline" className="text-xs">
            <ArrowLeft className="w-3.5 h-3.5 mr-2" /> Terug naar home
          </Button>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 pt-32 pb-24">
        <div className="border-b border-zinc-200 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 text-xs font-semibold uppercase tracking-wider text-zinc-600 rounded-full mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-black" /> Privacy & Gegevensbescherming
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="text-zinc-500 mt-2 text-sm">Laatst bijgewerkt: 16 augustus 2026</p>
        </div>

        <div className="space-y-10 text-zinc-700 leading-relaxed text-sm md:text-base">
          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-bold text-black mb-3">1. Wie zijn wij?</h2>
            <p>
              Deze Privacy Policy is van toepassing op de website <strong>fre2028.la</strong> en alle daaraan gekoppelde applicaties en sociale media beheertools van de officiële Paralympische campagne van <strong>Frederik Leys</strong> (Leuven, België).
            </p>
            <p className="mt-2">
              Voor vragen over privacy of gegevensbescherming kun je contact opnemen via <a href="mailto:frederik.leys@gmail.com" className="text-black font-semibold underline underline-offset-4">frederik.leys@gmail.com</a>.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-bold text-black mb-3">2. Welke gegevens verzamelen wij?</h2>
            <p>Wij verzamelen uitsluitend gegevens die noodzakelijk zijn voor het functioneren van de campagne en de website:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5">
              <li><strong>Nieuwsbrief inschrijvingen:</strong> Je e-mailadres wanneer je je vrijwillig aanmeldt voor updates over de weg naar LA 2028.</li>
              <li><strong>Contact- en partneraanvragen:</strong> Naam, organisatie, e-mailadres en bericht wanneer je contact met ons opneemt.</li>
              <li><strong>Anonieme websitestatistieken:</strong> Geanonimiseerde bezoekersstatistieken (zonder tracking van persoonlijke identiteit) om de werking van de website te optimaliseren.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-bold text-black mb-3">3. Social Media Integraties & Meta Platform Apps</h2>
            <p>
              Onze interne beheertools (zoals <em>social-media-manager</em>) maken gebruik van officiële API&apos;s (waaronder Meta Graph API voor Instagram & Facebook, en LinkedIn REST API).
            </p>
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-5 mt-3 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-black">
                <Lock className="w-4 h-4" /> Gebruik van API tokens
              </div>
              <p className="text-sm text-zinc-600">
                Toegangstokens worden uitsluitend intern gebruikt door de atleet/campagnebeheerder om goedgekeurde sportieve berichten, foto&apos;s en video&apos;s rechtstreeks te publiceren naar de officiële kanalen (zoals <code>@fre.climbs</code>). Er worden geen persoonlijke gegevens van volgers of derden verwerkt, opgeslagen of doorverkocht.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section id="data-deletion">
            <h2 className="text-xl font-bold text-black mb-3 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              4. Instructies voor Gegevensverwijdering (User Data Deletion)
            </h2>
            <p>
              In overeenstemming met de Meta Platform & GDPR richtlijnen kun je te allen tijde verzoeken om je gegevens te laten verwijderen of gekoppelde app-machtigingen in te trekken:
            </p>
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-5 mt-3 space-y-3">
              <p className="font-semibold text-black text-sm">Hoe trek je app-toegang in via Facebook/Instagram?</p>
              <ol className="list-decimal pl-5 text-sm text-zinc-600 space-y-1">
                <li>Ga naar je <strong>Facebook-instellingen</strong> ➡️ <em>Instellingen en privacy</em>.</li>
                <li>Klik op <strong>Apps en websites</strong>.</li>
                <li>Zoek naar <strong>social-media-manager</strong> (of FRÉ2028) en klik op <strong>Verwijderen</strong>.</li>
              </ol>
              <p className="font-semibold text-black text-sm pt-2">Verzoek tot volledige verwijdering via e-mail:</p>
              <p className="text-sm text-zinc-600">
                Stuur een eenvoudig verzoek naar <a href="mailto:frederik.leys@gmail.com" className="text-black font-medium underline">frederik.leys@gmail.com</a> met het onderwerp &ldquo;Verzoek Gegevensverwijdering&rdquo;. Wij verwijderen je e-mailadres en eventuele opgeslagen gegevens binnen 48 uur permanent uit onze systemen.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-bold text-black mb-3">5. Jouw Rechten onder de AVG / GDPR</h2>
            <p>Je hebt conform de Europese Algemene Verordening Gegevensbescherming (AVG/GDPR) altijd het recht om:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Inzage te vragen in de gegevens die we over jou bewaren.</li>
              <li>Correctie of volledige verwijdering van je gegevens te eisen.</li>
              <li>Je toestemming voor de nieuwsbrief op elk gewenst moment in te trekken via de uitschrijflink in de e-mail.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl font-bold text-black mb-3">6. Contact</h2>
            <div className="flex items-center gap-3 mt-2 text-zinc-800">
              <Mail className="w-4 h-4 text-black" />
              <span>frederik.leys@gmail.com</span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-zinc-800">
              <Globe className="w-4 h-4 text-black" />
              <span>https://fre2028.la</span>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-8 text-center text-xs text-zinc-400">
        &copy; {new Date().getFullYear()} Frederik Leys - Road to LA 2028. Alle rechten voorbehouden.
      </footer>
    </div>
  );
}
