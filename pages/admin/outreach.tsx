import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { 
  Mountain, 
  Mail, 
  Copy, 
  Check, 
  ExternalLink, 
  Search, 
  Filter, 
  TrendingUp, 
  Award, 
  Users, 
  Send, 
  DollarSign, 
  ArrowRight,
  Eye,
  Plus,
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export interface EmailDraft {
  slug: string;
  filename: string;
  title: string;
  subject: string;
  htmlContent: string;
  plainText: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  role: string;
  tier: string;
  tierId: number;
  status: 'TE_CONTACTEREN' | 'GECONTACTEERD' | 'IN_GESPREK' | 'BEVESTIGD' | 'ON_HOLD' | 'GEEN_MATCH';
  angle: string;
  notes: string;
  emailDraftSlug?: string;
  potentialAmount?: string;
  contactEmail?: string;
}

interface OutreachPageProps {
  emailDrafts: Record<string, EmailDraft>;
  initialLeads: Lead[];
}

const INITIAL_LEADS: Lead[] = [
  // Confirmed
  {
    id: 'cronos',
    name: 'Directie / Sponsoring',
    company: 'Cronos Group',
    role: 'IT & Innovatie Groep',
    tier: 'Bevestigde Sponsoring',
    tierId: 0,
    status: 'BEVESTIGD',
    angle: 'Technologie, innovatie en ondernemerschap',
    notes: 'Positief gereageerd op eerste contact. Eerste officiële sponsor van de Road to LA 2028 campagne!',
    potentialAmount: '€ 2.500 (éénmalig)',
  },
  // Tier 1
  {
    id: 'hans-clijsters',
    name: 'Hans Clijsters',
    company: 'Democo Group / Solidaris Brabant',
    role: 'Bestuurder Democo / Bijzonder Gevolmachtigde Solidaris',
    tier: 'Tier 1: The Golden Triangle',
    tierId: 1,
    status: 'TE_CONTACTEREN',
    angle: 'Veiligheidscultuur (Democo) + G-sport CSR (Solidaris)',
    notes: 'Directe warme connectie (voormalig werkgever). Biedt brug tussen bouw en gezondheidsmutualiteit.',
    emailDraftSlug: 'hans-clijsters',
    potentialAmount: '€ 1.000 - € 1.500 / jaar',
  },
  {
    id: 'heidi-rakels',
    name: 'Heidi Rakels',
    company: 'Guardsquare / XYZT.AI',
    role: 'Co-founder Guardsquare (Unicorn), Bestuurder, Kunstenaar',
    tier: 'Tier 1: The Golden Triangle',
    tierId: 1,
    status: 'TE_CONTACTEREN',
    angle: 'Shared identity: Burgerlijk Ingenieur + Olympisch Medaillewinnares Judo',
    notes: 'Unieke peer & mentor. Enige in Leuven die zowel olympisch podium als tech-unicorn haalde.',
    emailDraftSlug: 'heidi-rakels',
    potentialAmount: '€ 1.000 - € 1.500 / jaar',
  },
  {
    id: 'francoise-chombar',
    name: 'Françoise Chombar',
    company: 'Melexis / STEM Platform',
    role: 'Voorzitter Melexis, Voorzitter Vlaams STEM-platform',
    tier: 'Tier 1: The Golden Triangle',
    tierId: 1,
    status: 'TE_CONTACTEREN',
    angle: 'STEM-ambassadeurschap & Diversity, Equity and Inclusion in tech',
    notes: 'Breekt vooroordelen: doctor-ingenieur én topsporter met beperking. Perfect voor STEM platform.',
    emailDraftSlug: 'francoise-chombar',
    potentialAmount: '€ 1.000 - € 1.500 / jaar',
  },
  // Tier 2
  {
    id: 'roland-duchatelet',
    name: 'Roland Duchâtelet',
    company: 'Xtrion / Vivant',
    role: 'Oprichter Xtrion / Melexis / Serie-investeerder in sport',
    tier: 'Tier 2: Melexis / Duchâtelet Dynastie',
    tierId: 2,
    status: 'TE_CONTACTEREN',
    angle: 'Data-gedreven sportanalyse & innovatie in adaptieve technologie',
    notes: 'Ingenieur met grote interesse in sportoptimalisatie en analyse.',
    emailDraftSlug: 'roland-duchatelet',
    potentialAmount: '€ 1.000 - € 1.500 / jaar',
  },
  {
    id: 'roderick-duchatelet',
    name: 'Roderick Duchâtelet',
    company: 'Sportinvesteerder',
    role: 'Ondernemer, voormalig eigenaar Újpest FC',
    tier: 'Tier 2: Melexis / Duchâtelet Dynastie',
    tierId: 2,
    status: 'TE_CONTACTEREN',
    angle: 'Opkomende olympische sport (klimmen) vs verzadigde voetbalmarkt',
    notes: 'Recente verkoop Újpest FC = liquiditeit voor nieuwe sportprojecten.',
    emailDraftSlug: 'roderick-duchatelet',
    potentialAmount: '€ 1.000 - € 1.500 / jaar',
  },
  {
    id: 'rudi-de-winter',
    name: 'Rudi De Winter',
    company: 'X-Fab',
    role: 'CEO X-Fab (MEMS & sensor-foundry)',
    tier: 'Tier 2: Melexis / Duchâtelet Dynastie',
    tierId: 2,
    status: 'TE_CONTACTEREN',
    angle: 'MEMS (mechanica + elektronica), precisiebeweging & werkgeversbranding',
    notes: 'Sponsort technische conferenties. Metafoor van precisie in paraklimmen.',
    emailDraftSlug: 'rudi-de-winter',
    potentialAmount: '€ 1.000 - € 1.500 / jaar',
  },
  // Tier 3
  {
    id: 'urbain-vandeurzen',
    name: 'Urbain Vandeurzen',
    company: 'LMS / Smile Invest / VMF Invest',
    role: 'Oprichter LMS International, Voorzitter Opening the Future',
    tier: 'Tier 3: Deep Tech KU Leuven Spin-offs & Alumni',
    tierId: 3,
    status: 'TE_CONTACTEREN',
    angle: 'KU Leuven Alumni mechanica & Opening the Future mecenaat',
    notes: 'PhD in Mechanical Engineering. Ultieme alumnus en filantroop van de faculteit.',
    emailDraftSlug: 'urbain-vandeurzen',
    potentialAmount: '€ 1.000 - € 1.500 / jaar',
  },
  {
    id: 'wilfried-vancraen',
    name: 'Wilfried Vancraen',
    company: 'Materialise',
    role: 'Oprichter & Bestuurder Materialise',
    tier: 'Tier 3: Deep Tech KU Leuven Spin-offs & Alumni',
    tierId: 3,
    status: 'TE_CONTACTEREN',
    angle: 'Medical 3D printing & co-development adaptieve prothesevoet/holds',
    notes: 'Materialise Medical bouwt patiënt-specifieke implantaten. Perfecte testcase.',
    emailDraftSlug: 'wilfried-vancraen',
    potentialAmount: '€ 1.000 / jaar + Tech Co-Dev',
  },
  {
    id: 'kuleuven-alumni',
    name: 'Inge Wullaert / Redactie GeniaaL',
    company: 'KU Leuven Alumni & Alumnirelaties',
    role: 'Directeur Alumnirelaties & Bestuur Alumni Ingenieurs',
    tier: 'Tier 3: Deep Tech KU Leuven Spin-offs & Alumni',
    tierId: 3,
    status: 'TE_CONTACTEREN',
    angle: 'Alumnus in de kijker in GeniaaL, inspiratietalks & Universiteitsfonds',
    notes: 'Bereik naar tienduizenden ingenieurs-alumni en CEO\'s in Vlaanderen.',
    emailDraftSlug: 'kuleuven-alumni',
    potentialAmount: 'Partnernetwerk + Lezingen',
  },
  {
    id: 'luc-van-den-hove',
    name: 'Luc Van den hove',
    company: 'imec',
    role: 'President & CEO imec',
    tier: 'Tier 3: Deep Tech KU Leuven Spin-offs & Alumni',
    tierId: 3,
    status: 'TE_CONTACTEREN',
    angle: 'Wearables & Health sensoren (OnePlanet) onder extreme biomechanische belasting',
    notes: 'Positioneren als elite testcase voor draagbare stres- en bewegingssensoren.',
    emailDraftSlug: 'luc-van-den-hove',
    potentialAmount: '€ 1.000 - € 1.500 / jaar',
  },
  {
    id: 'koenraad-debackere',
    name: 'Koenraad Debackere',
    company: 'KU Leuven R&D (LRD)',
    role: 'Gedelegeerd Bestuurder LRD / Voorzitter Gemma Frisius Fonds',
    tier: 'Tier 3: Deep Tech KU Leuven Spin-offs & Alumni',
    tierId: 3,
    status: 'TE_CONTACTEREN',
    angle: 'Valorisatie, spin-off netwerk & introductie aan portfoliobedrijven',
    notes: 'Centrale poortwachter voor het Leuvense ingenieurs- en spin-off ecosysteem.',
    emailDraftSlug: 'koenraad-debackere',
    potentialAmount: 'Netwerk & Introducties',
  },
  {
    id: 'paul-van-dun',
    name: 'Paul Van Dun',
    company: 'KU Leuven R&D (LRD)',
    role: 'Algemeen Directeur LRD',
    tier: 'Tier 3: Deep Tech KU Leuven Spin-offs & Alumni',
    tierId: 3,
    status: 'TE_CONTACTEREN',
    angle: 'Koppeling met spin-off portfolio (robotica, geavanceerde materialen)',
    notes: 'Kan gerichte matches maken met Leuvense tech-bedrijven op zoek naar visibiliteit.',
    emailDraftSlug: 'paul-van-dun',
    potentialAmount: 'Netwerk & Introducties',
  },
  {
    id: 'martin-de-prycker',
    name: 'Martin De Prycker',
    company: 'Qbic Fund / EVS',
    role: 'Managing Partner Qbic, Bestuurder EVS Broadcast Equipment',
    tier: 'Tier 3: Deep Tech KU Leuven Spin-offs & Alumni',
    tierId: 3,
    status: 'TE_CONTACTEREN',
    angle: 'Snijvlak Deep Tech (Qbic) & Olympische sportuitzendingen (EVS)',
    notes: 'EVS levert broadcast technologie voor de Olympische Spelen.',
    emailDraftSlug: 'martin-de-prycker',
    potentialAmount: '€ 1.000 - € 1.500 / jaar',
  },
  // Tier 4
  {
    id: 'comate',
    name: 'Sander Van den dries & Wouter Foulon',
    company: 'Comate Engineering & Design',
    role: 'Founders Comate & Comate Ventures',
    tier: 'Tier 4: Hardware Scale-ups & Peers',
    tierId: 4,
    status: 'TE_CONTACTEREN',
    angle: 'Hardware builders grit + link naar Marc Coucke / Comate Ventures',
    notes: 'Bouwen fysieke producten. Mech Eng PhD is hun kernprofiel. Jonge Ondernemer van het Jaar.',
    potentialAmount: '€ 1.000 - € 1.500 / jaar',
  },
  {
    id: 'amnovis-replasia',
    name: 'Jonas Van Vaerenbergh & Peter Mercelis',
    company: 'Amnovis / Replasia (ex-LayerWise)',
    role: 'Co-founders LayerWise, Amnovis & Replasia',
    tier: 'Tier 4: Hardware Scale-ups & Peers',
    tierId: 4,
    status: 'TE_CONTACTEREN',
    angle: 'KU Leuven PhD Werktuigkunde + Additive Manufacturing & Biomechanica',
    notes: 'Replasia focust op heupdysplasie. Begrijpen biomechanische adaptaties door en door.',
    potentialAmount: '€ 1.000 - € 1.500 / jaar',
  },
  {
    id: 'xenomatix',
    name: 'Filip Geuens',
    company: 'XenomatiX',
    role: 'CEO XenomatiX (Solid-state Lidar)',
    tier: 'Tier 4: Hardware Scale-ups & Peers',
    tierId: 4,
    status: 'TE_CONTACTEREN',
    angle: 'Precisie-engineering & werkgeversbranding ("Wegdek scannen" = "Klimroute lezen")',
    notes: 'Leuvense scale-up in autonome voertuigen en sensoren. Oud-CTO Nikon Metrology.',
    potentialAmount: '€ 1.000 - € 1.500 / jaar',
  },
  {
    id: 'guardsquare-eric',
    name: 'Eric Lafortune',
    company: 'Guardsquare',
    role: 'Co-founder & Chief Architect Guardsquare',
    tier: 'Tier 4: Hardware Scale-ups & Peers',
    tierId: 4,
    status: 'TE_CONTACTEREN',
    angle: 'Niche-expertise die uitgroeit tot een wereldwijde standaard',
    notes: 'Maker van ProGuard. Partner van Heidi Rakels.',
    potentialAmount: '€ 1.000 - € 1.500 / jaar',
  },
  {
    id: 'pharrowtech',
    name: 'Wim Van Thillo',
    company: 'Pharrowtech',
    role: 'CEO Pharrowtech (imec spin-off)',
    tier: 'Tier 4: Hardware Scale-ups & Peers',
    tierId: 4,
    status: 'TE_CONTACTEREN',
    angle: 'Differentiërende werkgeversbranding voor snelgroeiende deep-tech scale-up',
    notes: 'Haalde recent meer dan €15M Serie A op.',
    potentialAmount: '€ 1.000 - € 1.500 / jaar',
  },
  // Tier 5
  {
    id: 'piet-colruyt',
    name: 'Piet Colruyt',
    company: 'Impact House / Impact Capital',
    role: 'Oprichter Impact Capital, Burgerlijk Ingenieur-Architect KU Leuven',
    tier: 'Tier 5: Impact Investors & Smart Money',
    tierId: 5,
    status: 'TE_CONTACTEREN',
    angle: 'Systeemverandering & inclusieve adaptieve sportinfrastructuur',
    notes: 'Impact investor met KU Leuven ingenieursprofiel.',
    potentialAmount: '€ 1.000 - € 2.500 / jaar',
  },
  {
    id: 'marc-coucke',
    name: 'Marc Coucke',
    company: 'Alychlo / Comate Ventures',
    role: 'Oprichter Alychlo, Partner Comate Ventures',
    tier: 'Tier 5: Impact Investors & Smart Money',
    tierId: 5,
    status: 'TE_CONTACTEREN',
    angle: 'Passie voor topsport, veerkracht & ondernemerschap',
    notes: 'Warme ingang via Comate Ventures / Sander Van den dries.',
    potentialAmount: 'Major partner / Mecenaat',
  },
  {
    id: 'michel-akkermans',
    name: 'Michel Akkermans',
    company: 'Pamica / imec',
    role: 'Investeerder Pamica, Bestuurder imec, Ex-Clear2Pay',
    tier: 'Tier 5: Impact Investors & Smart Money',
    tierId: 5,
    status: 'TE_CONTACTEREN',
    angle: 'KU Leuven burgerlijk ingenieur, bestuurlijke diversiteit & internationale groei',
    notes: 'Bruggenbouwer tussen fintech, deep tech en imec ecosysteem.',
    potentialAmount: '€ 1.000 - € 1.500 / jaar',
  },
  {
    id: 'jurgen-ingels',
    name: 'Jurgen Ingels',
    company: 'SmartFin / SuperNova',
    role: 'Tech-investeerder SmartFin, Organisator SuperNova festival',
    tier: 'Tier 5: Impact Investors & Smart Money',
    tierId: 5,
    status: 'TE_CONTACTEREN',
    angle: 'Keynote spreker op SuperNova festival voor 10.000+ tech-professionals',
    notes: 'Directe toegang tot de complete Belgische VC en technologie-community.',
    potentialAmount: 'Sprekerspodium & Netwerk',
  },
  {
    id: 'stijn-bijnens',
    name: 'Stijn Bijnens',
    company: 'Cegeka / Proximus',
    role: 'CEO Cegeka, Toekomstig CEO Proximus',
    tier: 'Tier 5: Impact Investors & Smart Money',
    tierId: 5,
    status: 'TE_CONTACTEREN',
    angle: 'Trinity of Innovation (AI, Cloud, 5G) & Data-driven human resilience',
    notes: 'Limburg-Leuven as, connectie met Hans Clijsters.',
    potentialAmount: '€ 1.000 - € 2.500 / jaar',
  },
  // Tier 6
  {
    id: 'jan-paesen',
    name: 'Jan Paesen',
    company: 'Leuven MindGate',
    role: 'Managing Director Leuven MindGate',
    tier: 'Tier 6: Institutionele Gatekeepers',
    tierId: 6,
    status: 'TE_CONTACTEREN',
    angle: 'Het ultieme merkverhaal van Leuven: Health + High-Tech + Creativiteit',
    notes: 'Kan Fré opvoeren als internationaal gezicht van het Leuvense innovatienetwerk.',
    potentialAmount: 'Stadsambassadeurschap',
  },
  {
    id: 'danielle-vanwesenbeeck',
    name: 'Daniëlle Vanwesenbeeck',
    company: 'Voka Vlaams-Brabant / Mastermail',
    role: 'Voorzitter Voka Vlaams-Brabant, CEO Mastermail',
    tier: 'Tier 6: Institutionele Gatekeepers',
    tierId: 6,
    status: 'TE_CONTACTEREN',
    angle: 'Ondernemerschap, veerkracht & toegang tot Voka Lenterecepties',
    notes: 'Warme ingang via Hans Clijsters. Directe toegang tot 3.000+ regionale bedrijven.',
    potentialAmount: 'Voka Netwerk & Events',
  },
  {
    id: 'charles-beauduin',
    name: 'Charles Beauduin',
    company: 'Barco / Vandewiele',
    role: 'Voorzitter Barco, CEO Vandewiele',
    tier: 'Tier 6: Institutionele Gatekeepers',
    tierId: 6,
    status: 'TE_CONTACTEREN',
    angle: 'Wereldwijde industriële engineering & mecenaat voor toptalent',
    notes: 'Leidt wereldspelers in machinebouw en visualisatie. Steunt technologische excellentie.',
    potentialAmount: '€ 1.000 - € 2.500 / jaar',
  },
  {
    id: 'wim-van-hecke',
    name: 'Wim Van Hecke',
    company: 'Icometrix',
    role: 'CEO Icometrix (AI voor MRI beeldvorming)',
    tier: 'Tier 6: Institutionele Gatekeepers',
    tierId: 6,
    status: 'TE_CONTACTEREN',
    angle: 'Health-tech & brug tussen klinische data en levenskwaliteit',
    notes: 'Toonaangevend gezondheidstechnologiebedrijf in Leuven.',
    potentialAmount: '€ 1.000 - € 1.500 / jaar',
  },
];

const STATUS_LABELS: Record<Lead['status'], { label: string; color: string; bg: string; border: string }> = {
  BEVESTIGD: { label: '✅ Bevestigd', color: 'text-emerald-800', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  IN_GESPREK: { label: '⏳ In gesprek', color: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-200' },
  GECONTACTEERD: { label: '📨 Gecontacteerd', color: 'text-blue-800', bg: 'bg-blue-50', border: 'border-blue-200' },
  TE_CONTACTEREN: { label: '📋 Te contacteren', color: 'text-zinc-700', bg: 'bg-zinc-100', border: 'border-zinc-300' },
  ON_HOLD: { label: '⏸️ On hold', color: 'text-purple-800', bg: 'bg-purple-50', border: 'border-purple-200' },
  GEEN_MATCH: { label: '❌ Geen match', color: 'text-red-800', bg: 'bg-red-50', border: 'border-red-200' },
};

export default function OutreachAdminPage({ emailDrafts, initialLeads }: OutreachPageProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [leads, setLeads] = useState<Lead[]>(initialLeads || INITIAL_LEADS);
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modal state
  const [activeEmailModal, setActiveEmailModal] = useState<EmailDraft | null>(null);
  const [activeLeadForModal, setActiveLeadForModal] = useState<Lead | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isCopiedSubject, setIsCopiedSubject] = useState(false);

  // Authentication check
  useEffect(() => {
    const auth = sessionStorage.getItem('admin_authenticated');
    if (auth !== 'true') {
      router.push('/');
    } else {
      setIsAuthenticated(true);
      // Load saved lead statuses from localStorage if any
      const savedLeads = localStorage.getItem('fre2028_outreach_leads');
      if (savedLeads) {
        try {
          const parsed = JSON.parse(savedLeads);
          setLeads(parsed);
        } catch (e) {
          console.error('Failed to parse saved leads', e);
        }
      }
    }
  }, [router]);

  // Save to localStorage when leads change
  const updateLeadStatus = (leadId: string, newStatus: Lead['status']) => {
    const updated = leads.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l));
    setLeads(updated);
    localStorage.setItem('fre2028_outreach_leads', JSON.stringify(updated));
  };

  // Metrics calculations
  const confirmedCount = leads.filter((l) => l.status === 'BEVESTIGD').length;
  const inDiscussionCount = leads.filter((l) => l.status === 'IN_GESPREK').length;
  const contactedCount = leads.filter((l) => l.status === 'GECONTACTEERD').length;
  const toContactCount = leads.filter((l) => l.status === 'TE_CONTACTEREN').length;
  
  const totalConfirmedAmount = 2500; // Cronos
  const targetYear1 = 8000; // 8 partners x €1000
  const progressPercent = Math.min(100, Math.round((totalConfirmedAmount / targetYear1) * 100));

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesTier = selectedTier === 'ALL' || lead.tier.includes(selectedTier);
      const matchesStatus = selectedStatus === 'ALL' || lead.status === selectedStatus;
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        lead.name.toLowerCase().includes(query) ||
        lead.company.toLowerCase().includes(query) ||
        lead.angle.toLowerCase().includes(query) ||
        lead.notes.toLowerCase().includes(query);

      return matchesTier && matchesStatus && matchesSearch;
    });
  }, [leads, selectedTier, selectedStatus, searchQuery]);

  const openEmailModal = (lead: Lead) => {
    if (!lead.emailDraftSlug || !emailDrafts[lead.emailDraftSlug]) {
      alert(`Er is nog geen draft template aangemaakt voor ${lead.name}. Jelle kan deze direct voor je opstellen!`);
      return;
    }
    setActiveLeadForModal(lead);
    setActiveEmailModal(emailDrafts[lead.emailDraftSlug]);
    setIsCopied(false);
    setIsCopiedSubject(false);
  };

  const copyToClipboard = async (text: string, isHtml: boolean = false) => {
    try {
      if (isHtml && typeof ClipboardItem !== 'undefined') {
        const blobHtml = new Blob([text], { type: 'text/html' });
        const blobPlain = new Blob([activeEmailModal?.plainText || text], { type: 'text/plain' });
        const data = [new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobPlain })];
        await navigator.clipboard.write(data);
      } else {
        await navigator.clipboard.writeText(text);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch (err) {
      // Fallback
      navigator.clipboard.writeText(activeEmailModal?.plainText || text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  const copySubject = (subject: string) => {
    navigator.clipboard.writeText(subject);
    setIsCopiedSubject(true);
    setTimeout(() => setIsCopiedSubject(false), 2000);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    router.push('/');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans pb-24">
      <Head>
        <title>Sponsor Outreach & Lead Tracker - FRE2028 Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      {/* Admin Top Navigation */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-bold tracking-widest text-sm text-zinc-900 hover:text-black">
              <Mountain className="w-5 h-5 text-black" />
              FRÉ2028.LA
            </Link>
            <div className="h-4 w-[1px] bg-zinc-200 hidden sm:block" />
            <nav className="flex items-center gap-1 sm:gap-2">
              <Link 
                href="/admin/outreach"
                className="px-3.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider bg-black text-white flex items-center gap-1.5 shadow-sm"
              >
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                Sponsor Outreach & CRM
              </Link>
              <Link 
                href="/admin"
                className="px-3.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-black hover:bg-zinc-100 transition-colors"
              >
                Website Partners
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              Naar Website
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-zinc-600 hover:text-red-600 transition-colors px-2 py-1"
            >
              Uitloggen
            </button>
          </div>
        </div>
      </header>

      {/* Hero / Motivational Header */}
      <div className="bg-white border-b border-zinc-200 pt-8 pb-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-50 text-amber-900 border border-amber-200 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Road to LA 2028 • Sponsor Pipeline
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-950">
                Sponsor Outreach Dashboard
              </h1>
              <p className="text-zinc-600 text-sm md:text-base mt-1.5 max-w-2xl">
                Volg de stand van zaken van de <span className="text-zinc-950 font-bold">Leuven 8</span> campagne, bekijk kant-en-klare e-mail drafts van <span className="text-amber-700 font-bold">Jelle</span> en sluit deals.
              </p>
            </div>

            {/* Motivational Quote / Badge */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 border border-amber-200 rounded-xl p-4 md:max-w-xs flex items-center gap-3.5 shadow-sm">
              <div className="w-11 h-11 rounded-lg bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-amber-900 font-extrabold">Eerste Mijlpaal Behaald! 🔥</p>
                <p className="text-xs text-amber-950 mt-0.5 leading-snug">
                  Cronos is binnen (€2.500). Nog <span className="font-bold underline decoration-amber-500">7 partners</span> voor de Leuven 8!
                </p>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Opgehaald */}
            <div className="bg-zinc-50 border border-zinc-200/90 p-5 rounded-xl">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Opgehaald Kapitaal</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-emerald-700">
                € {totalConfirmedAmount.toLocaleString('nl-BE')}
              </div>
              <p className="text-xs text-zinc-500 mt-1 font-medium">van doel € 8.000 (Jaar 1)</p>
            </div>

            {/* Bevestigde Partners */}
            <div className="bg-zinc-50 border border-zinc-200/90 p-5 rounded-xl">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Leuven 8 Partners</span>
                <Users className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-zinc-950">
                {confirmedCount} <span className="text-zinc-400 text-lg font-normal">/ 8</span>
              </div>
              <p className="text-xs text-zinc-500 mt-1 font-medium">12.5% van Leuven 8 bezet</p>
            </div>

            {/* In Gesprek & Contact */}
            <div className="bg-zinc-50 border border-zinc-200/90 p-5 rounded-xl">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Actieve Pipeline</span>
                <Send className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-blue-700">
                {contactedCount + inDiscussionCount}
              </div>
              <p className="text-xs text-zinc-500 mt-1 font-medium">{inDiscussionCount} in gesprek • {contactedCount} verstuurd</p>
            </div>

            {/* Te Contacteren */}
            <div className="bg-zinc-50 border border-zinc-200/90 p-5 rounded-xl">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Klaar voor Outreach</span>
                <Mail className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-purple-700">
                {toContactCount}
              </div>
              <p className="text-xs text-zinc-500 mt-1 font-medium">13 drafts direct verzendklaar</p>
            </div>
          </div>

          {/* Visual Goal Progress Bar */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Voortgang Leuven 8 Budget (Jaar 1)
              </span>
              <span className="text-emerald-700 font-extrabold text-sm">{progressPercent}% Behaald</span>
            </div>
            
            <div className="w-full h-3.5 bg-zinc-200 rounded-full overflow-hidden border border-zinc-300/60 p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] text-zinc-500 font-mono mt-2.5">
              <span>€ 0</span>
              <span className="text-emerald-700 font-bold">€ 2.500 (Nu - Cronos)</span>
              <span>€ 4.000 (Mijlpaal 2)</span>
              <span className="text-zinc-900 font-bold">€ 8.000 (Target Jaar 1)</span>
              <span>€ 40.000 (LA 2028 Totaal)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Pipeline & Leads */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
        
        {/* Filters & Search Toolbar */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center mb-6 pb-6 border-b border-zinc-200">
          {/* Search */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Zoek lead, bedrijf of insteek..."
              className="w-full bg-white border border-zinc-300 pl-9 pr-4 py-2 text-sm text-zinc-900 placeholder-zinc-400 rounded-lg focus:outline-none focus:border-black transition-colors shadow-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-white border border-zinc-300 text-xs font-semibold text-zinc-700 py-2 px-3 rounded-lg focus:outline-none focus:border-black transition-colors shadow-sm"
            >
              <option value="ALL">Alle Statussen ({leads.length})</option>
              <option value="BEVESTIGD">✅ Bevestigd ({confirmedCount})</option>
              <option value="IN_GESPREK">⏳ In gesprek ({inDiscussionCount})</option>
              <option value="GECONTACTEERD">📨 Gecontacteerd ({contactedCount})</option>
              <option value="TE_CONTACTEREN">📋 Te contacteren ({toContactCount})</option>
            </select>

            {/* Tier Filter */}
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="bg-white border border-zinc-300 text-xs font-semibold text-zinc-700 py-2 px-3 rounded-lg focus:outline-none focus:border-black transition-colors shadow-sm"
            >
              <option value="ALL">Alle Tiers</option>
              <option value="Tier 1">Tier 1: The Golden Triangle</option>
              <option value="Tier 2">Tier 2: Melexis / Duchâtelet</option>
              <option value="Tier 3">Tier 3: KU Leuven Spin-offs & Alumni</option>
              <option value="Tier 4">Tier 4: Hardware Scale-ups</option>
              <option value="Tier 5">Tier 5: Impact & Smart Money</option>
              <option value="Tier 6">Tier 6: Gatekeepers</option>
            </select>
          </div>
        </div>

        {/* Leads Table / Cards */}
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-zinc-600 text-xs uppercase tracking-wider border-b border-zinc-200">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Lead & Bedrijf</th>
                  <th className="py-3.5 px-4 font-bold hidden md:table-cell">Tier / Categorie</th>
                  <th className="py-3.5 px-4 font-bold">Insteek & Rol</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">E-mail & Actie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredLeads.map((lead) => {
                  const statusInfo = STATUS_LABELS[lead.status];
                  const hasDraft = lead.emailDraftSlug && emailDrafts[lead.emailDraftSlug];

                  return (
                    <tr 
                      key={lead.id} 
                      className={`hover:bg-zinc-50/80 transition-colors ${
                        lead.status === 'BEVESTIGD' ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      {/* Name & Company */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-zinc-950 text-base">{lead.name}</div>
                        <div className="text-zinc-700 text-xs font-medium mt-0.5">{lead.company}</div>
                        <div className="text-zinc-400 text-[11px] mt-0.5">{lead.role}</div>
                      </td>

                      {/* Tier */}
                      <td className="py-4 px-4 hidden md:table-cell">
                        <span className="inline-block px-2.5 py-1 text-[11px] font-semibold bg-zinc-100 text-zinc-800 rounded border border-zinc-200">
                          {lead.tier}
                        </span>
                        {lead.potentialAmount && (
                          <div className="text-zinc-600 text-xs mt-1 font-mono">{lead.potentialAmount}</div>
                        )}
                      </td>

                      {/* Angle & Notes */}
                      <td className="py-4 px-4 max-w-xs sm:max-w-sm">
                        <div className="text-zinc-800 text-xs font-medium line-clamp-2 leading-relaxed">{lead.angle}</div>
                        {lead.notes && (
                          <div className="text-zinc-500 text-[11px] mt-1 line-clamp-1 italic">{lead.notes}</div>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-4 px-4">
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value as Lead['status'])}
                          className={`text-xs font-bold py-1.5 px-2.5 rounded-lg border focus:outline-none transition-colors cursor-pointer shadow-sm ${
                            lead.status === 'BEVESTIGD'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : lead.status === 'IN_GESPREK'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : lead.status === 'GECONTACTEERD'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : 'bg-zinc-50 text-zinc-700 border-zinc-300'
                          }`}
                        >
                          <option value="TE_CONTACTEREN">📋 Te contacteren</option>
                          <option value="GECONTACTEERD">📨 Gecontacteerd</option>
                          <option value="IN_GESPREK">⏳ In gesprek</option>
                          <option value="BEVESTIGD">✅ Bevestigd</option>
                          <option value="ON_HOLD">⏸️ On hold</option>
                          <option value="GEEN_MATCH">❌ Geen match</option>
                        </select>
                      </td>

                      {/* Email Action */}
                      <td className="py-4 px-4 text-right">
                        {hasDraft ? (
                          <button
                            onClick={() => openEmailModal(lead)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Bekijk Mail
                          </button>
                        ) : (
                          <span className="text-xs text-zinc-400 italic">
                            Jelle stelt op
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Email Viewer & Copy Modal */}
      {activeEmailModal && activeLeadForModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
          onClick={() => setActiveEmailModal(null)}
        >
          <div 
            className="bg-white text-zinc-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-zinc-950 text-white p-6 border-b border-zinc-800 flex items-start justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> E-mail Draft van Jelle voor {activeLeadForModal.name}
                </div>
                <h3 className="text-xl font-bold text-white">{activeLeadForModal.company}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">{activeLeadForModal.role}</p>
              </div>
              <button 
                onClick={() => setActiveEmailModal(null)}
                className="text-zinc-400 hover:text-white p-1 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Subject Line Box */}
            <div className="bg-zinc-50 p-4 border-b border-zinc-200 flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Onderwerp</div>
                <div className="font-bold text-sm text-zinc-900 mt-0.5 select-all">
                  {activeEmailModal.subject}
                </div>
              </div>
              <button
                onClick={() => copySubject(activeEmailModal.subject)}
                className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-white border border-zinc-300 rounded-md hover:bg-zinc-100 text-zinc-700 transition-colors flex-shrink-0 shadow-sm"
              >
                {isCopiedSubject ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {isCopiedSubject ? 'Gekopieerd!' : 'Kopieer Onderwerp'}
              </button>
            </div>

            {/* Email Body Preview */}
            <div className="p-6 max-h-[50vh] overflow-y-auto bg-white prose prose-zinc max-w-none text-sm leading-relaxed border-b border-zinc-200">
              <div dangerouslySetInnerHTML={{ __html: activeEmailModal.htmlContent }} />
            </div>

            {/* Modal Actions Footer */}
            <div className="p-5 bg-zinc-50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateLeadStatus(activeLeadForModal.id, 'GECONTACTEERD')}
                  className="px-3 py-2 text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Markeer als 'Gecontacteerd' 📨
                </button>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={`mailto:${activeLeadForModal.contactEmail || ''}?subject=${encodeURIComponent(activeEmailModal.subject)}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-zinc-300 font-semibold text-xs rounded-lg hover:bg-zinc-100 text-zinc-800 transition-colors shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  Open in Mail App
                </a>

                <button
                  onClick={() => copyToClipboard(activeEmailModal.htmlContent, true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-zinc-800 text-white font-bold text-xs rounded-lg transition-colors shadow-md"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {isCopied ? 'Gekopieerd voor Gmail/Outlook!' : 'Kopieer Volledige E-mail'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export async function getStaticProps() {
  const mailsDirectory = path.join(process.cwd(), 'content', 'Partners', 'mails');
  const emailDrafts: Record<string, EmailDraft> = {};

  try {
    if (fs.existsSync(mailsDirectory)) {
      const filenames = fs.readdirSync(mailsDirectory);

      for (const filename of filenames) {
        if (filename.endsWith('.html')) {
          const filePath = path.join(mailsDirectory, filename);
          const fullHtml = fs.readFileSync(filePath, 'utf-8');
          const slug = filename.replace('.html', '');

          // Extract Subject line from HTML if present
          let subject = 'Partnerschap Road to LA 2028 — Fré Leys';
          const subjectMatch = fullHtml.match(/<div class="subject-line">([\s\S]*?)<\/div>/i);
          if (subjectMatch && subjectMatch[1]) {
            subject = subjectMatch[1].trim();
          }

          // Extract Title
          let title = slug;
          const titleMatch = fullHtml.match(/<title>([\s\S]*?)<\/title>/i);
          if (titleMatch && titleMatch[1]) {
            title = titleMatch[1].replace('Email –', '').trim();
          }

          // Extract Body content (between <body> and </body>)
          let bodyHtml = fullHtml;
          const bodyMatch = fullHtml.match(/<body>([\s\S]*?)<\/body>/i);
          if (bodyMatch && bodyMatch[1]) {
            // Remove subject box and tip note from bodyHtml for preview clarity
            bodyHtml = bodyMatch[1]
              .replace(/<div class="subject-box">[\s\S]*?<\/div>/i, '')
              .replace(/<p class="note">[\s\S]*?<\/p>/i, '')
              .trim();
          }

          // Generate clean plain text fallback
          const plainText = bodyHtml
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/p>/gi, '\n\n')
            .replace(/<li>/gi, '• ')
            .replace(/<\/li>/gi, '\n')
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .trim();

          emailDrafts[slug] = {
            slug,
            filename,
            title,
            subject,
            htmlContent: bodyHtml,
            plainText,
          };
        }
      }
    }
  } catch (error) {
    console.error('Error loading email drafts:', error);
  }

  return {
    props: {
      emailDrafts,
      initialLeads: INITIAL_LEADS,
    },
  };
}
