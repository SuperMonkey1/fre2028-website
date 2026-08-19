import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { 
  Mountain,
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Building2, 
  Mail, 
  User, 
  FileText, 
  ArrowLeft,
  AlertCircle,
  Award,
  ChevronRight,
  Sparkles,
  Check
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'white' }>(({ className, variant = 'primary', ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center text-sm font-semibold tracking-wide transition-all duration-200 disabled:opacity-50",
        "h-12 px-8",
        variant === 'primary' && "bg-black text-white hover:bg-zinc-800",
        variant === 'outline' && "border border-zinc-300 bg-white text-black hover:border-black",
        variant === 'white' && "bg-white text-black hover:bg-zinc-100 border border-zinc-200",
        className
      )}
      {...props}
    />
  )
});
Button.displayName = "Button";

type PlanType = 'monthly' | 'yearly' | 'two_years';

export default function PaymentsPage() {
  const router = useRouter();
  const { status } = router.query;
  const formRef = useRef<HTMLDivElement>(null);

  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');

  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-scroll to top on status change
  useEffect(() => {
    if (status) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [status]);

  const scrollToForm = (plan: PlanType) => {
    setSelectedPlan(plan);
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    if (!email) {
      setErrorMessage('Vul een geldig e-mailadres in.');
      setIsLoading(false);
      return;
    }

    try {
      const originUrl = window.location.origin;
      
      const payload = {
        plan: selectedPlan,
        companyName,
        contactName,
        email,
        vatNumber,
        address,
        notes,
        originUrl,
      };

      // Try relative API route first
      let response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // If relative API is not routed in static hosting, fallback to direct Cloud Function
      if (!response.ok && response.status === 404) {
        response = await fetch('https://us-central1-fre-2028-website.cloudfunctions.net/payments/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Er is een fout opgetreden bij het starten van de betaalsessie.');
      }

      // Redirect to Stripe secure Checkout
      window.location.href = data.url;
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'Kon betaalsessie niet starten. Probeer het opnieuw of contacteer Fré via e-mail.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <Head>
        <title>Kies jouw Partnerformule — Fré2028 Road to LA</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Kies jouw partnerformule voor De Leuven 25 Support Circle (Road to LA 2028)." />
      </Head>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b bg-white border-zinc-100 py-4 md:py-6">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-3 font-bold text-lg tracking-widest uppercase hover:opacity-60 transition-opacity"
          >
            <Mountain className="w-6 h-6" />
            <span>Fré2028.LA</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-zinc-500">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-bit SSL Beveiligde Betaling</span>
            </div>
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="flex items-center gap-2 h-10 px-4 text-xs font-bold uppercase tracking-wider"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Terug
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <section className="pt-32 pb-16 bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <div className="inline-block px-4 py-2 mb-6 border border-zinc-200 text-xs font-bold uppercase tracking-[0.2em] text-zinc-600 bg-white">
            De Leuven 25 Support Circle
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
            Kies jouw Partnerformule
          </h1>
          <p className="text-lg md:text-xl text-zinc-600 leading-relaxed max-w-2xl mx-auto">
            Sluit je aan bij de 25 Leuvense erebedrijven en leg het fundament voor de eerste Leuvense Paralympiër ooit in Los Angeles 2028.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-16">

        {/* Success Banner */}
        {status === 'success' && (
          <div className="mb-16 p-8 bg-emerald-50 border border-emerald-300 rounded-sm shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-emerald-600 text-white rounded-full">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-emerald-950">Hartelijk dank voor jouw sponsoring!</h2>
                <p className="text-emerald-900 leading-relaxed max-w-2xl">
                  Jouw betaling is succesvol verwerkt via Stripe. Je ontvangt direct een bevestiging en officieel fiscaal betalingsbewijs per e-mail.
                </p>
                <div className="pt-3 flex flex-wrap gap-4 text-xs font-bold text-emerald-800">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Fiscaal Aftrekbaar als Marketingkost</span>
                  <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-emerald-600" /> Officieel Lid van De Leuven 25 Support Circle</span>
                </div>
                <div className="pt-3">
                  <p className="text-sm text-emerald-900">
                    Fré neemt binnen 24 uur persoonlijk contact met je op voor de aanlevering van jouw logo en de praktische planning van het exclusieve jaarevent.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancelled Banner */}
        {status === 'cancelled' && (
          <div className="mb-16 p-6 bg-amber-50 border border-amber-300 rounded-sm flex items-center gap-4 text-amber-950">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <h3 className="font-bold">Betaling niet afgerond</h3>
              <p className="text-sm text-amber-900">Er werd niets in rekening gebracht. Je kan hieronder gerust jouw formule kiezen en opnieuw proberen.</p>
            </div>
          </div>
        )}

        {/* ==================== 3 SAAS PRICING CARDS (SIDE BY SIDE) ==================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-20">
          
          {/* Card 1: Maandelijks */}
          <div 
            onClick={() => setSelectedPlan('monthly')}
            className={cn(
              "flex flex-col justify-between p-8 border-2 transition-all duration-200 cursor-pointer relative",
              selectedPlan === 'monthly'
                ? "border-black bg-zinc-50 shadow-md ring-2 ring-black"
                : "border-zinc-200 bg-white hover:border-zinc-400"
            )}
          >
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                Maandelijks
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-2">
                Flexibel
              </h3>
              <p className="text-xs text-zinc-600 min-h-[36px] mb-6 leading-relaxed">
                Doorlopende maandelijkse steun. 100% flexibel en op elk moment opzegbaar.
              </p>

              <div className="mb-6 pb-6 border-b border-zinc-200">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black tracking-tight">€ 100</span>
                  <span className="text-sm font-semibold text-zinc-500">/ maand</span>
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">Automatisch maandelijks gefactureerd</div>
              </div>

              <div className="space-y-3.5 text-xs text-zinc-700 mb-8">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                  <span><strong>Logo op alle dragers:</strong> Website, poster & T-shirt</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                  <span><strong>1x per jaar exclusief jaarevent:</strong> Klimclinic & inspiratietalk</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                  <span><strong>100% Fiscaal aftrekbaar</strong> als marketing/sponsoring</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                  <span>Maandelijks opzegbaar</span>
                </div>
              </div>
            </div>

            <Button
              type="button"
              onClick={(e) => { e.stopPropagation(); scrollToForm('monthly'); }}
              variant={selectedPlan === 'monthly' ? 'primary' : 'outline'}
              className="w-full text-xs font-bold uppercase tracking-wider"
            >
              {selectedPlan === 'monthly' ? 'Geselecteerd ✓' : 'Kies Maandelijks'}
            </Button>
          </div>

          {/* Card 2: 1 Jaar (FEATURED / POPULAR) */}
          <div 
            onClick={() => setSelectedPlan('yearly')}
            className={cn(
              "flex flex-col justify-between p-8 border-2 transition-all duration-200 cursor-pointer relative bg-zinc-900 text-white shadow-xl md:-translate-y-2",
              selectedPlan === 'yearly'
                ? "border-black ring-4 ring-black"
                : "border-zinc-900 hover:border-black"
            )}
          >
            {/* Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-full shadow-sm">
              Meest Gekozen
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
                1 Jaar Lidmaatschap
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-2 text-white">
                Jaarpartnerschap
              </h3>
              <p className="text-xs text-zinc-300 min-h-[36px] mb-6 leading-relaxed">
                Volledig werkingsjaar. Legt de structurele basis voor Fré's trainingsprogramma.
              </p>

              <div className="mb-6 pb-6 border-b border-zinc-700">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black tracking-tight text-white">€ 1.200</span>
                  <span className="text-sm font-semibold text-zinc-400">/ jaar</span>
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">Gelijk aan € 100/mnd • 1 btw-factuur</div>
              </div>

              <div className="space-y-3.5 text-xs text-zinc-200 mb-8">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Alles van Maandelijks</strong></span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Grote Poster 2028:</strong> Huis-aan-huis in elk Leuvens huis & scholen</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Leuvense Kerstmarkt 2027:</strong> Activatie & logovermelding</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Maatschappelijke Impact:</strong> G-sport steun via Paraclimbing.be</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); scrollToForm('yearly'); }}
              className="w-full h-12 bg-white text-black hover:bg-zinc-100 font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2"
            >
              {selectedPlan === 'yearly' ? 'Geselecteerd ✓' : 'Kies 1 Jaar'}
            </button>
          </div>

          {/* Card 3: 2 Jaar */}
          <div 
            onClick={() => setSelectedPlan('two_years')}
            className={cn(
              "flex flex-col justify-between p-8 border-2 transition-all duration-200 cursor-pointer relative",
              selectedPlan === 'two_years'
                ? "border-black bg-zinc-50 shadow-md ring-2 ring-black"
                : "border-zinc-200 bg-white hover:border-zinc-400"
            )}
          >
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                2 Jaar (Tot LA 2028)
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-2">
                Tot LA 2028
              </h3>
              <p className="text-xs text-zinc-600 min-h-[36px] mb-6 leading-relaxed">
                Vaste, gegarandeerde dekking voor de volledige paralympische campagne.
              </p>

              <div className="mb-6 pb-6 border-b border-zinc-200">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black tracking-tight">€ 2.400</span>
                  <span className="text-sm font-semibold text-zinc-500">eenmalig</span>
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">2 jaar gegarandeerde zichtbaarheid</div>
              </div>

              <div className="space-y-3.5 text-xs text-zinc-700 mb-8">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                  <span><strong>Alles van 1 Jaar Partnerschap</strong></span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                  <span><strong>Prioritaire Logoplaatsing</strong> op alle officiële dragers</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                  <span><strong>2x Jaarevents:</strong> 2 jaar lang gratis tickets & clinic voor jouw team</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                  <span>Dekking buitenlandse wereldbekers & stages</span>
                </div>
              </div>
            </div>

            <Button
              type="button"
              onClick={(e) => { e.stopPropagation(); scrollToForm('two_years'); }}
              variant={selectedPlan === 'two_years' ? 'primary' : 'outline'}
              className="w-full text-xs font-bold uppercase tracking-wider"
            >
              {selectedPlan === 'two_years' ? 'Geselecteerd ✓' : 'Kies 2 Jaar'}
            </Button>
          </div>

        </div>

        {/* ==================== BILLING DETAILS & STRIPE CHECKOUT SECTION ==================== */}
        <div ref={formRef} className="pt-8 border-t border-zinc-200 max-w-3xl mx-auto">
          
          <div className="text-center mb-10">
            <div className="inline-block px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest mb-3">
              Stap 2: Facturatie & Afronding
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              Jouw Gegevens & Betaalkeuze
            </h2>
            <p className="text-sm text-zinc-600">
              Geselecteerde formule:{' '}
              <strong className="text-black">
                {selectedPlan === 'monthly' && 'De Leuven 25 — Maandelijks (€ 100 / maand)'}
                {selectedPlan === 'yearly' && 'De Leuven 25 — 1 Jaar (€ 1.200 / jaar)'}
                {selectedPlan === 'two_years' && 'De Leuven 25 — 2 Jaar tot LA 2028 (€ 2.400 eenmalig)'}
              </strong>
            </p>
          </div>

          <form onSubmit={handleCheckout} className="bg-zinc-50 border border-zinc-200 p-8 md:p-10 shadow-sm space-y-6">
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-600 mb-2 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-zinc-400" /> Bedrijfsnaam / Organisatie
                </label>
                <input 
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="bijv. Bedrijf NV of Privé"
                  className="w-full py-3 px-4 bg-white border border-zinc-300 focus:border-black focus:outline-none transition-colors text-sm text-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-600 mb-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-zinc-400" /> Contactpersoon *
                </label>
                <input 
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Voornaam & Achternaam"
                  className="w-full py-3 px-4 bg-white border border-zinc-300 focus:border-black focus:outline-none transition-colors text-sm text-black"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-600 mb-2 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" /> E-mailadres (Facturatie & Info) *
                </label>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="naam@bedrijf.be"
                  className="w-full py-3 px-4 bg-white border border-zinc-300 focus:border-black focus:outline-none transition-colors text-sm text-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-600 mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-zinc-400" /> BTW / Ondernemingsnummer
                </label>
                <input 
                  type="text"
                  value={vatNumber}
                  onChange={(e) => setVatNumber(e.target.value)}
                  placeholder="BE 0123.456.789"
                  className="w-full py-3 px-4 bg-white border border-zinc-300 focus:border-black focus:outline-none transition-colors text-sm text-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-600 mb-2">
                Facturatieadres (Straat, Nr, Postcode & Gemeente)
              </label>
              <input 
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Bondgenotenlaan 1, 3000 Leuven"
                className="w-full py-3 px-4 bg-white border border-zinc-300 focus:border-black focus:outline-none transition-colors text-sm text-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-600 mb-2">
                Optionele opmerking of factuurreferentie
              </label>
              <textarea 
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="bijv. Logo volgt via mail, PO-nummer..."
                className="w-full py-2.5 px-4 bg-white border border-zinc-300 focus:border-black focus:outline-none transition-colors text-sm text-black resize-none"
              />
            </div>

            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit / Pay Button */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-black hover:bg-zinc-800 text-white font-bold text-base tracking-wide transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Betaalsessie voorbereiden...</span>
                </>
              ) : (
                <>
                  <span>Afrekenen via Veilige Stripe Checkout</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-zinc-500 pt-2 border-t border-zinc-200">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Bancontact</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Visa / Mastercard</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> iDEAL</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Apple Pay & Google Pay</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> SEPA Incasso</span>
            </div>
          </form>

          {/* Alternative Invoice Option */}
          <div className="mt-8 p-6 bg-white border border-zinc-200 text-center">
            <h4 className="font-bold text-black text-sm mb-1">
              Liever betalen via klassieke bankoverschrijving of bestelbon (PO)?
            </h4>
            <p className="text-zinc-600 text-xs mb-3">
              Geen probleem, we kunnen een formele offerte en factuur vooraf opmaken.
            </p>
            <a 
              href="mailto:frederik.leys@gmail.com?subject=Aanvraag%20Factuur%20Sponsoring%20Leuven%2025&body=Beste%20Fr%C3%A9%2C%0A%0AWij%20willen%20ons%20graag%20aansluiten%20bij%20De%20Leuven%2025%20Support%20Circle.%20Gelieve%20ons%20een%20factuur%20te%20bezorgen%20voor%3A%0A-%20Bedrijfsnaam%3A%20%0A-%20BTW-nummer%3A%20%0A-%20Facturatieadres%3A%20%0A-%20Gekozen%20formule%20(Maandelijks%20%E2%82%AC100%20%2F%20Jaarlijks%20%E2%82%AC1.200%20%2F%202%20Jaar%20%E2%82%AC2.400)%3A%20%0A%0AMet%20vriendelijke%20groet%2C"
              className="inline-flex items-center gap-1 text-xs font-bold text-black underline hover:opacity-70 transition-opacity"
            >
              <span>Stuur een e-mail naar frederik.leys@gmail.com</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-12 text-center text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} Fré Leys — Road to Los Angeles 2028</div>
          <div className="flex items-center gap-6">
            <span>frederik.leys@gmail.com</span>
            <span>www.fre2028.la</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
