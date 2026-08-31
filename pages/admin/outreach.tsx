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
  ArrowRight,
  Eye,
  Plus,
  X,
  Edit,
  Trash2,
  RefreshCw,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react';

export interface EmailDraft {
  slug: string;
  filename: string;
  title: string;
  subject: string;
  htmlContent: string;
  plainText: string;
}

export interface GmailMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  isoDate?: string;
  displayDate: string;
  snippet: string;
  body: string;
  htmlBody?: string;
  isFromMe: boolean;
}

export interface GmailThreadData {
  threadId: string;
  contactEmail: string;
  subject: string;
  hasSent: boolean;
  hasReply: boolean;
  sentDate?: string;
  lastReplyDate?: string;
  messageCount: number;
  messages: GmailMessage[];
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
  draftCreated?: boolean;
  draftId?: string;
  contactedAt?: string;
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
    contactEmail: 'info@cronos-group.com',
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
    contactEmail: 'hans.clijsters@democo.be',
    potentialAmount: '€ 100 / maand (€ 1.200 / jaar)',
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
    contactEmail: 'heidi.rakels@guardsquare.com',
    potentialAmount: '€ 100 / maand (€ 1.200 / jaar)',
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
    contactEmail: 'fch@melexis.com',
    potentialAmount: '€ 100 / maand (€ 1.200 / jaar)',
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
    contactEmail: 'roland.duchatelet@xtrion.be',
    potentialAmount: '€ 100 / maand (€ 1.200 / jaar)',
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
    contactEmail: 'roderick.duchatelet@gmail.com',
    potentialAmount: '€ 100 / maand (€ 1.200 / jaar)',
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
    contactEmail: 'rudi.dewinter@xfab.com',
    potentialAmount: '€ 100 / maand (€ 1.200 / jaar)',
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
    contactEmail: 'urbain.vandeurzen@smile-invest.com',
    potentialAmount: '€ 100 / maand (€ 1.200 / jaar)',
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
    contactEmail: 'wilfried.vancraen@materialise.be',
    potentialAmount: '€ 100/mnd + Tech Co-Dev',
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
    contactEmail: 'alumni@kuleuven.be',
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
    contactEmail: 'luc.vandenhove@imec.be',
    potentialAmount: '€ 100 / maand (€ 1.200 / jaar)',
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
    contactEmail: 'koenraad.debackere@kuleuven.be',
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
    contactEmail: 'paul.vandun@kuleuven.be',
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
    contactEmail: 'martin.deprycker@qbic.be',
    potentialAmount: '€ 100 / maand (€ 1.200 / jaar)',
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
    emailDraftSlug: 'comate',
    contactEmail: 'sander@comate.be',
    potentialAmount: '€ 100 / maand (€ 1.200 / jaar)',
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
    emailDraftSlug: 'amnovis-replasia',
    contactEmail: 'peter.mercelis@amnovis.com',
    potentialAmount: '€ 100 / maand (€ 1.200 / jaar)',
  },
  {
    id: 'hummingdrones-nv',
    name: 'Hummingdrones NV',
    company: 'Hummingdrones NV',
    role: 'Drone & Hardware Scale-up',
    tier: 'Tier 4: Hardware Scale-ups & Peers',
    tierId: 4,
    status: 'GECONTACTEERD',
    angle: 'Innovatieve drone technologie & topsport partnerschap',
    notes: 'Gecontacteerd via Gmail',
    contactEmail: 'info@hummingdrones.com',
    potentialAmount: '€ 100 / maand (€ 1.200 / jaar)',
    contactedAt: '2026-08-25',
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
    emailDraftSlug: 'xenomatix',
    contactEmail: 'filip.geuens@xenomatix.com',
    potentialAmount: '€ 100 / maand (€ 1.200 / jaar)',
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
    emailDraftSlug: 'guardsquare-eric',
    contactEmail: 'eric.lafortune@guardsquare.com',
    potentialAmount: '€ 100 / maand (€ 1.200 / jaar)',
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
    emailDraftSlug: 'pharrowtech',
    contactEmail: 'wim.vanthillo@pharrowtech.com',
    potentialAmount: '€ 100 / maand (€ 1.200 / jaar)',
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
    emailDraftSlug: 'piet-colruyt',
    contactEmail: 'piet@impactcapital.be',
    potentialAmount: '€ 100 / maand (€ 1.200 / jaar)',
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
    emailDraftSlug: 'marc-coucke',
    contactEmail: 'marc.coucke@alychlo.com',
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
    emailDraftSlug: 'michel-akkermans',
    contactEmail: 'michel.akkermans@pamica.be',
    potentialAmount: '€ 100 / maand (€ 1.200 / jaar)',
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
    emailDraftSlug: 'jurgen-ingels',
    contactEmail: 'jurgen@smartfinvc.com',
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
    emailDraftSlug: 'stijn-bijnens',
    contactEmail: 'stijn.bijnens@cegeka.com',
    potentialAmount: '€ 100 / maand (€ 1.200 / jaar)',
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
    emailDraftSlug: 'jan-paesen',
    contactEmail: 'jan.paesen@leuvenmindgate.be',
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
    emailDraftSlug: 'danielle-vanwesenbeeck',
    contactEmail: 'danielle@mastermail.be',
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
    emailDraftSlug: 'charles-beauduin',
    contactEmail: 'charles.beauduin@vandewiele.com',
    potentialAmount: '€ 100 / maand (€ 1.200 / jaar)',
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
    emailDraftSlug: 'wim-van-hecke',
    contactEmail: 'wim.vanhecke@icometrix.com',
    potentialAmount: '€ 100 / maand (€ 1.200 / jaar)',
  },
];

const STATUS_LABELS: Record<Lead['status'], { label: string; color: string; bg: string; border: string }> = {
  BEVESTIGD: { label: 'Bevestigd', color: 'text-zinc-900', bg: 'bg-zinc-100', border: 'border-zinc-300' },
  IN_GESPREK: { label: 'In gesprek', color: 'text-zinc-900', bg: 'bg-zinc-100', border: 'border-zinc-300' },
  GECONTACTEERD: { label: 'Gecontacteerd', color: 'text-zinc-900', bg: 'bg-zinc-100', border: 'border-zinc-300' },
  TE_CONTACTEREN: { label: 'Te contacteren', color: 'text-zinc-700', bg: 'bg-zinc-100', border: 'border-zinc-300' },
  ON_HOLD: { label: 'On hold', color: 'text-zinc-700', bg: 'bg-zinc-100', border: 'border-zinc-300' },
  GEEN_MATCH: { label: 'Geen match', color: 'text-zinc-500', bg: 'bg-zinc-100', border: 'border-zinc-300' },
};

export default function OutreachAdminPage({ emailDrafts = {}, initialLeads = INITIAL_LEADS }: OutreachPageProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [leads, setLeads] = useState<Lead[]>(initialLeads || INITIAL_LEADS);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Gmail API State
  const [gmailStatus, setGmailStatus] = useState<{
    connected: boolean;
    email?: string;
    loading: boolean;
    error?: string;
  }>({
    connected: false,
    loading: true,
  });

  // Created drafts map (persisted in localStorage)
  const [createdDrafts, setCreatedDrafts] = useState<Record<string, { draftId?: string; timestamp: string }>>({});
  
  // Generating state per lead
  const [generatingLeadId, setGeneratingLeadId] = useState<string | null>(null);

  // Batch generator modal state
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [batchLogs, setBatchLogs] = useState<string[]>([]);
  const [batchCompleted, setBatchCompleted] = useState(false);

  // Gmail Thread Sync state
  const [gmailThreads, setGmailThreads] = useState<Record<string, GmailThreadData>>({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [isReauthing, setIsReauthing] = useState(false);
  const [syncNotification, setSyncNotification] = useState<string | null>(null);
  const [activeGmailThread, setActiveGmailThread] = useState<GmailThreadData | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'thread' | 'template'>('thread');

  // Email Modal state
  const [activeEmailModal, setActiveEmailModal] = useState<EmailDraft | null>(null);
  const [activeLeadForModal, setActiveLeadForModal] = useState<Lead | null>(null);
  const [modalCustomEmail, setModalCustomEmail] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isCopiedSubject, setIsCopiedSubject] = useState(false);
  const [isCreatingDraftFromModal, setIsCreatingDraftFromModal] = useState(false);
  const [modalDraftSuccess, setModalDraftSuccess] = useState(false);

  // Lead CRUD Modal state
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [leadFormData, setLeadFormData] = useState<{
    name: string;
    company: string;
    role: string;
    status: Lead['status'];
    contactEmail: string;
    angle: string;
    notes: string;
    emailDraftSlug: string;
    contactedAt: string;
  }>({
    name: '',
    company: '',
    role: '',
    status: 'TE_CONTACTEREN',
    contactEmail: '',
    angle: '',
    notes: '',
    emailDraftSlug: '',
    contactedAt: '',
  });

  const handleOpenCreateModal = () => {
    setEditingLead(null);
    setLeadFormData({
      name: '',
      company: '',
      role: '',
      status: 'TE_CONTACTEREN',
      contactEmail: '',
      angle: '',
      notes: '',
      emailDraftSlug: '',
      contactedAt: '',
    });
    setIsLeadModalOpen(true);
  };

  const handleOpenEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setLeadFormData({
      name: lead.name,
      company: lead.company,
      role: lead.role || '',
      status: lead.status,
      contactEmail: lead.contactEmail || '',
      angle: lead.angle || '',
      notes: lead.notes || '',
      emailDraftSlug: lead.emailDraftSlug || '',
      contactedAt: lead.contactedAt || '',
    });
    setIsLeadModalOpen(true);
  };

  const handleSaveLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadFormData.company.trim() || !leadFormData.name.trim()) {
      alert('Vul a.u.b. minimaal de bedrijfsnaam en naam van de contactpersoon in.');
      return;
    }

    let contactedAt = leadFormData.contactedAt ? leadFormData.contactedAt.trim() : undefined;
    const isNowContacted = leadFormData.status === 'GECONTACTEERD' || leadFormData.status === 'IN_GESPREK' || leadFormData.status === 'BEVESTIGD';
    if (isNowContacted && !contactedAt) {
      contactedAt = new Date().toISOString().split('T')[0];
    }

    if (editingLead) {
      const updated = leads.map((l) =>
        l.id === editingLead.id
          ? {
              ...l,
              ...leadFormData,
              contactedAt,
              emailDraftSlug: leadFormData.emailDraftSlug || undefined,
            }
          : l
      );
      setLeads(updated);
      localStorage.setItem('fre2028_outreach_leads', JSON.stringify(updated));
    } else {
      const companySlug = (leadFormData.company || 'lead')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]/g, '-');
      const uniqueId = `${companySlug}-${Date.now().toString().slice(-4)}`;
      const newLead: Lead = {
        id: uniqueId,
        name: leadFormData.name.trim(),
        company: leadFormData.company.trim(),
        role: leadFormData.role.trim() || 'Contactpersoon',
        tier: 'Algemeen',
        tierId: 99,
        status: leadFormData.status,
        angle: leadFormData.angle.trim(),
        notes: leadFormData.notes.trim(),
        contactEmail: leadFormData.contactEmail.trim(),
        contactedAt,
        emailDraftSlug: leadFormData.emailDraftSlug || undefined,
      };
      const updated = [newLead, ...leads];
      setLeads(updated);
      localStorage.setItem('fre2028_outreach_leads', JSON.stringify(updated));
    }

    setIsLeadModalOpen(false);
  };

  const handleDeleteLead = (lead: Lead) => {
    if (window.confirm(`Weet je zeker dat je "${lead.name}" (${lead.company}) wilt verwijderen?`)) {
      const updated = leads.filter((l) => l.id !== lead.id);
      setLeads(updated);
      localStorage.setItem('fre2028_outreach_leads', JSON.stringify(updated));
    }
  };

  // Authentication check & load stored drafts
  useEffect(() => {
    const auth = sessionStorage.getItem('admin_authenticated');
    if (auth !== 'true') {
      router.push('/');
    } else {
      setIsAuthenticated(true);
      // Load saved lead statuses with non-destructive merge
      const savedLeads = localStorage.getItem('fre2028_outreach_leads');
      let currentLeads = INITIAL_LEADS;
      if (savedLeads) {
        try {
          const parsed = JSON.parse(savedLeads);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const initialIds = new Set(INITIAL_LEADS.map((l) => l.id));
            const customLeads = parsed.filter((l) => !initialIds.has(l.id));
            currentLeads = [
              ...customLeads,
              ...INITIAL_LEADS.map((initLead) => {
                const savedMatch = parsed.find((l) => l.id === initLead.id);
                return savedMatch ? { ...initLead, ...savedMatch } : initLead;
              }),
            ];
          }
        } catch (e) {
          console.error('Failed to parse saved leads', e);
        }
      }
      setLeads(currentLeads);
      localStorage.setItem('fre2028_outreach_leads', JSON.stringify(currentLeads));

      // Load saved created Gmail drafts
      const savedDrafts = localStorage.getItem('fre2028_outreach_gmail_drafts');
      if (savedDrafts) {
        try {
          setCreatedDrafts(JSON.parse(savedDrafts));
        } catch (e) {
          console.error('Failed to parse saved drafts', e);
        }
      }

      // Load saved Gmail threads
      const savedThreads = localStorage.getItem('fre2028_outreach_gmail_threads');
      if (savedThreads) {
        try {
          const parsed = JSON.parse(savedThreads);
          if (parsed && typeof parsed === 'object') {
            const validThreads: Record<string, GmailThreadData> = {};
            for (const [k, v] of Object.entries(parsed)) {
              if (v && typeof v === 'object' && Array.isArray((v as any).messages)) {
                validThreads[k] = v as GmailThreadData;
              }
            }
            setGmailThreads(validThreads);
          }
        } catch (e) {
          console.error('Failed to parse saved threads', e);
        }
      }

      // Check Gmail connection & auto-sync sent/replies
      checkGmailConnection();
      handleSyncGmail(true, currentLeads);
    }
  }, [router]);

  useEffect(() => {
    if (router.query.gmail_auth === 'success') {
      setSyncNotification('Gmail succesvol gekoppeld met volledige synchronisatie!');
      handleSyncGmail(false);
      router.replace('/admin/outreach', undefined, { shallow: true });
    }
  }, [router.query]);

  const checkGmailConnection = async () => {
    setGmailStatus((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch('/api/admin/gmail/status');
      const data = await res.json();
      if (data.connected) {
        setGmailStatus({
          connected: true,
          email: data.email || 'frederik.leys@gmail.com',
          loading: false,
        });
      } else {
        setGmailStatus({
          connected: false,
          loading: false,
          error: data.error,
        });
      }
    } catch (err: any) {
      setGmailStatus({
        connected: false,
        loading: false,
        error: err.message,
      });
    }
  };

  // Save to localStorage when leads change
  const updateLeadStatus = (leadId: string, newStatus: Lead['status'], explicitDate?: string) => {
    const updated = leads.map((l) => {
      if (l.id === leadId) {
        const isNowContacted = newStatus === 'GECONTACTEERD' || newStatus === 'IN_GESPREK' || newStatus === 'BEVESTIGD';
        const contactedAt = explicitDate !== undefined
          ? explicitDate
          : (isNowContacted && !l.contactedAt ? new Date().toISOString().split('T')[0] : l.contactedAt);
        return { ...l, status: newStatus, contactedAt };
      }
      return l;
    });
    setLeads(updated);
    localStorage.setItem('fre2028_outreach_leads', JSON.stringify(updated));
  };

  // Update lead contacted date directly
  const updateLeadContactedDate = (leadId: string, date: string) => {
    const updated = leads.map((l) => (l.id === leadId ? { ...l, contactedAt: date } : l));
    setLeads(updated);
    localStorage.setItem('fre2028_outreach_leads', JSON.stringify(updated));
  };

  // Update lead contact email
  const updateLeadContactEmail = (leadId: string, email: string) => {
    const updated = leads.map((l) => (l.id === leadId ? { ...l, contactEmail: email } : l));
    setLeads(updated);
    localStorage.setItem('fre2028_outreach_leads', JSON.stringify(updated));
  };

  // Generate a single Gmail draft
  const generateSingleDraft = async (lead: Lead, customEmail?: string) => {
    setGeneratingLeadId(lead.id);
    const emailToUse = customEmail || lead.contactEmail || '';
    try {
      const res = await fetch('/api/admin/gmail/create-drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead,
          target: lead.id,
          customEmail: emailToUse,
        }),
      });
      const data = await res.json();
      if (data.success && data.results && data.results[0]) {
        const draftId = data.results[0].draftId;
        const newDrafts = {
          ...createdDrafts,
          [lead.id]: { draftId, timestamp: new Date().toLocaleTimeString('nl-BE') },
        };
        setCreatedDrafts(newDrafts);
        localStorage.setItem('fre2028_outreach_gmail_drafts', JSON.stringify(newDrafts));
        if (!lead.contactedAt) {
          updateLeadContactedDate(lead.id, new Date().toISOString().split('T')[0]);
        }
        return { success: true, draftId };
      } else {
        alert(`Kon draft voor ${lead.name} niet aanmaken: ${data.error || 'Onbekende fout'}`);
        return { success: false };
      }
    } catch (err: any) {
      alert(`Fout bij aanmaken van draft: ${err.message}`);
      return { success: false };
    } finally {
      setGeneratingLeadId(null);
    }
  };

  // Batch generate Gmail drafts
  const handleBatchGenerate = async (tierFilter?: number | null) => {
    const leadsToProcess = filteredLeads.filter((l) => l.status !== 'BEVESTIGD');
    if (leadsToProcess.length === 0) {
      alert('Geen leads geselecteerd om drafts voor aan te maken.');
      return;
    }

    setBatchModalOpen(true);
    setIsBatchGenerating(true);
    setBatchCompleted(false);
    setBatchProgress({ current: 0, total: leadsToProcess.length });
    setBatchLogs([`Starten met batch generatie voor ${leadsToProcess.length} leads in Gmail (${gmailStatus.email || 'frederik.leys@gmail.com'})...`]);

    const updatedMap = { ...createdDrafts };

    for (let i = 0; i < leadsToProcess.length; i++) {
      const lead = leadsToProcess[i];
      setBatchProgress({ current: i + 1, total: leadsToProcess.length });
      
      try {
        const res = await fetch('/api/admin/gmail/create-drafts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lead,
            target: lead.id,
            customEmail: lead.contactEmail || '',
          }),
        });
        const data = await res.json();
        if (data.success && data.results && data.results[0]) {
          const draftId = data.results[0].draftId;
          updatedMap[lead.id] = { draftId, timestamp: new Date().toLocaleTimeString('nl-BE') };
          if (!lead.contactedAt) {
            updateLeadContactedDate(lead.id, new Date().toISOString().split('T')[0]);
          }
          setBatchLogs((prev) => [
            `[OK] [${i + 1}/${leadsToProcess.length}] Concept klaar voor ${lead.name} (${lead.company}) -> Draft ID: ${draftId}`,
            ...prev,
          ]);
        } else {
          setBatchLogs((prev) => [
            `[FOUT] [${i + 1}/${leadsToProcess.length}] Fout voor ${lead.name}: ${data.error || 'Kon niet aanmaken'}`,
            ...prev,
          ]);
        }
      } catch (err: any) {
        setBatchLogs((prev) => [
          `[FOUT] [${i + 1}/${leadsToProcess.length}] Server fout voor ${lead.name}: ${err.message}`,
          ...prev,
        ]);
      }
    }

    setCreatedDrafts(updatedMap);
    localStorage.setItem('fre2028_outreach_gmail_drafts', JSON.stringify(updatedMap));
    setIsBatchGenerating(false);
    setBatchCompleted(true);
  };

  // Metrics calculations
  const confirmedCount = leads.filter((l) => l.status === 'BEVESTIGD').length;
  const inDiscussionCount = leads.filter((l) => l.status === 'IN_GESPREK').length;
  const contactedCount = leads.filter((l) => l.status === 'GECONTACTEERD').length;
  const toContactCount = leads.filter((l) => l.status === 'TE_CONTACTEREN').length;

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesStatus = selectedStatus === 'ALL' || lead.status === selectedStatus;
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        lead.name.toLowerCase().includes(query) ||
        lead.company.toLowerCase().includes(query) ||
        lead.angle.toLowerCase().includes(query) ||
        lead.notes.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [leads, selectedStatus, searchQuery]);

  const handleReauthGmail = () => {
    setIsReauthing(true);
    window.location.href = '/api/admin/gmail/authorize';
  };

  // Sync Gmail Threads handler
  const handleSyncGmail = async (silent: boolean = false, customLeadsList?: Lead[]) => {
    setIsSyncing(true);
    if (!silent) setSyncNotification(null);
    try {
      const activeList = (customLeadsList && customLeadsList.length > 0) ? customLeadsList : leads;
      const res = await fetch('/api/admin/gmail/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: activeList }),
      });
      const data = await res.json();

      if (data.needsReauth) {
        if (!silent && window.confirm('Gmail leestoegang is vereist om verzonden mails en antwoorden op te halen. Wil je nu autoriseren in Google?')) {
          handleReauthGmail();
        }
        return;
      }

      if (data.success && data.results) {
        const syncedResults: Record<string, any> = data.results;
        const validThreads: Record<string, GmailThreadData> = {};
        for (const [k, v] of Object.entries(syncedResults)) {
          if (v && typeof v === 'object' && Array.isArray(v.messages)) {
            validThreads[k] = v as GmailThreadData;
          }
        }

        setGmailThreads((prev) => {
          const merged = { ...prev, ...validThreads };
          localStorage.setItem('fre2028_outreach_gmail_threads', JSON.stringify(merged));
          return merged;
        });

        // Auto-update lead statuses based on synced threads
        let updatedCount = 0;
        let repliesCount = 0;
        let sentCount = 0;

        setLeads((prevLeads) => {
          const base = (prevLeads && prevLeads.length > 0) ? prevLeads : activeList;
          const updated = base.map((lead) => {
            const thread = validThreads[lead.id] || (lead.contactEmail ? validThreads[lead.contactEmail.toLowerCase().trim()] : null);
            if (thread) {
              let newStatus = lead.status;
              let newContactedAt = lead.contactedAt;

              if (thread.hasReply) {
                repliesCount++;
                if (lead.status === 'TE_CONTACTEREN' || lead.status === 'GECONTACTEERD') {
                  newStatus = 'IN_GESPREK';
                }
              } else if (thread.hasSent) {
                sentCount++;
                if (lead.status === 'TE_CONTACTEREN') {
                  newStatus = 'GECONTACTEERD';
                }
              }

              if (thread.sentDate && !newContactedAt) {
                newContactedAt = thread.sentDate;
              }

              if (newStatus !== lead.status || newContactedAt !== lead.contactedAt) {
                updatedCount++;
                return { ...lead, status: newStatus, contactedAt: newContactedAt };
              }
            }
            return lead;
          });

          localStorage.setItem('fre2028_outreach_leads', JSON.stringify(updated));
          return updated;
        });

        if (!silent) {
          const msg = `Gmail gesynchroniseerd: ${Object.keys(syncedResults).length} threads gecontroleerd (${repliesCount} met antwoord, ${sentCount} verzonden).`;
          setSyncNotification(msg);
          setTimeout(() => setSyncNotification(null), 7000);
        }
      } else if (!silent) {
        alert(`Synchronisatie mislukt: ${data.error || 'Onbekende fout'}`);
      }
    } catch (err: any) {
      if (!silent) {
        alert(`Fout bij synchroniseren met Gmail: ${err.message}`);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const getLeuven25Draft = (lead: Lead) => {
    const company = lead.company || 'uw organisatie';
    const rawName = lead.name || '';
    let firstName = '';
    if (rawName && !['Beste', 'Lead', 'Partner'].includes(rawName.trim())) {
      if (rawName.includes('&')) {
        firstName = rawName.split('&').map(p => p.trim().split(' ')[0]).filter(Boolean).join(' & ');
      } else {
        firstName = rawName.trim().split(' ')[0];
      }
    }
    const greeting = firstName ? `Beste ${firstName},` : 'Beste,';
    const companySlug = (lead.id || lead.company || 'partner').toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    const customUtmUrl = `https://fre2028.la/?utm_source=${encodeURIComponent(companySlug)}&utm_medium=email&utm_campaign=leuven25_support_circle`;
    const customPdfUrl = `https://fre2028.la/Frederik-Leys-Partnership-Dossier.pdf?utm_source=${encodeURIComponent(companySlug)}&utm_medium=email&utm_campaign=leuven25_support_circle`;

    const subject = `Partnerschap Road to LA 2028 — Leuven 25 Support Circle & ${company}`;

    const htmlContent = `<p>${greeting}</p>

<p>Ik neem graag even contact met je op.</p>

<p>Ik ben Fré Leys, een Leuvense paraklimmer met een duidelijke missie: <strong>goud behalen op de Paralympische Spelen van LA 2028</strong>. Om de stap naar voltijds topsporter te kunnen zetten, lanceer ik momenteel de <strong>&quot;Leuven 25 Support Circle&quot;</strong>. Dit is een lokaal netwerk van exact 25 Leuvense partnerbedrijven die mijn traject financieel steunen met een bijdrage van <strong>€100 per maand</strong>, oftewel <strong>€1.200 per jaar</strong>. Met dit budget dek ik mijn levensonderhoud, trainingsgerelateerde kosten en de niet-gesubsidieerde kosten om aan wedstrijden te kunnen deelnemen, zodat ik me 100% professioneel kan focussen op topsport. Hiermee zou ik de allereerste Paralympiër uit Leuven ooit worden.</p>

<p><strong>Wat krijgt ${company} concreet terug als partner?</strong></p>

<ul style="padding-left: 20px; margin: 12px 0 16px 0; line-height: 1.7;">
  <li style="margin-bottom: 6px;"><strong>Zichtbaarheid:</strong> Jouw bedrijfslogo op de website (<a href="${customUtmUrl}" style="color: #000; text-decoration: underline;">fre2028.la</a>), de officiële campagneposter en mijn trainingskledij.</li>
  <li style="margin-bottom: 6px;"><strong>Exclusief Jaarevent:</strong> Een jaarlijks partnerevent, bijvoorbeeld een kliminitiatie met vertoning van mijn <a href="https://www.youtube.com/watch?v=MZuKnpXXbUo" style="color: #000; text-decoration: underline;">documentaire</a> of een keynote over veerkracht, innovatie en topsport.</li>
  <li style="margin-bottom: 6px;"><strong>Grote Poster 2028:</strong> Jouw logo op de campagneposter die in 2028 huis-aan-huis wordt gebust in Leuven en op elke Leuvense school hangt.</li>
  <li style="margin-bottom: 6px;"><strong>Leuvense Kerstmarkt 2027:</strong> Zichtbaarheid en activatiemogelijkheden op de Kerstmarkt in Leuven.</li>
  <li style="margin-bottom: 6px;"><strong>Maatschappelijke Impact:</strong> Een structurele bijdrage aan de promotie van paraklimmen (via <a href="https://paraclimbing.be" style="color: #000; text-decoration: underline;">paraclimbing.be</a>) en de Paralympische Spelen in Leuven.</li>
  <li style="margin-bottom: 6px;"><strong>Maatwerk & Flexibiliteit:</strong> Elke andere vorm van return, activatie of samenwerking op maat van jullie bedrijf is uiteraard bespreekbaar.</li>
</ul>

<p>Meer details kan je vinden in deze bijlage: <a href="${customPdfUrl}" style="color: #000; font-weight: bold; text-decoration: underline;">Partnerschap Dossier (PDF)</a>.</p>

<p>Ik ben benieuwd naar jouw blik op mijn project en kom graag eens aftoetsen of een samenwerking binnen die &quot;Leuven 25&quot; een match zou zijn.</p>

<p>Zou je het zien zitten om binnenkort eens af te spreken?<br>
Laat maar weten wanneer dat voor jou zou passen.</p>

<p style="margin-top: 24px;">Vriendelijke groeten,</p>

<p><strong>Fré Leys</strong><br>
<a href="${customUtmUrl}" style="color: #52525b; text-decoration: none; font-size: 14px;">fre2028.la</a> • <span style="color: #71717a; font-size: 13px;">Paraclimbing • Road to LA 2028</span></p>`;

    const plainText = `${greeting}

Ik neem graag even contact met je op.

Ik ben Fré Leys, een Leuvense paraklimmer met een duidelijke missie: goud behalen op de Paralympische Spelen van LA 2028. Om de stap naar voltijds topsporter te kunnen zetten, lanceer ik momenteel de "Leuven 25 Support Circle". Dit is een lokaal netwerk van exact 25 Leuvense partnerbedrijven die mijn traject financieel steunen met een bijdrage van €100 per maand, oftewel €1.200 per jaar. Met dit budget dek ik mijn levensonderhoud, trainingsgerelateerde kosten en de niet-gesubsidieerde kosten om aan wedstrijden te kunnen deelnemen, zodat ik me 100% professioneel kan focussen op topsport. Hiermee zou ik de allereerste Paralympiër uit Leuven ooit worden.

Wat krijgt ${company} concreet terug als partner?

• Zichtbaarheid: Jouw bedrijfslogo op de website (${customUtmUrl}), de officiële campagneposter en mijn trainingskledij.
• Exclusief Jaarevent: Een jaarlijks partnerevent, bijvoorbeeld een kliminitiatie met vertoning van mijn documentaire (https://www.youtube.com/watch?v=MZuKnpXXbUo) of een keynote over veerkracht, innovatie en topsport.
• Grote Poster 2028: Jouw logo op de campagneposter die in 2028 huis-aan-huis wordt gebust in Leuven en op elke Leuvense school hangt.
• Leuvense Kerstmarkt 2027: Zichtbaarheid en activatiemogelijkheden op de Kerstmarkt in Leuven.
• Maatschappelijke Impact: Een structurele bijdrage aan de promotie van paraklimmen (via https://paraclimbing.be) en de Paralympische Spelen in Leuven.
• Maatwerk & Flexibiliteit: Elke andere vorm van return, activatie of samenwerking op maat van jullie bedrijf is uiteraard bespreekbaar.

Meer details kan je vinden in deze bijlage: ${customPdfUrl}

Ik ben benieuwd naar jouw blik op mijn project en kom graag eens aftoetsen of een samenwerking binnen die "Leuven 25" een match zou zijn.

Zou je het zien zitten om binnenkort eens af te spreken?
Laat maar weten wanneer dat voor jou zou passen.

Vriendelijke groeten,

Fré Leys
fre2028.la`;

    return {
      slug: lead.id,
      filename: `${lead.id}.html`,
      title: company,
      subject,
      htmlContent,
      plainText,
    };
  };

  const openEmailModal = (lead: Lead) => {
    setActiveLeadForModal(lead);
    setModalCustomEmail(lead.contactEmail || '');
    setModalDraftSuccess(false);
    setIsCopied(false);
    setIsCopiedSubject(false);

    const thread = gmailThreads[lead.id] || (lead.contactEmail ? gmailThreads[lead.contactEmail.toLowerCase().trim()] : null);
    if (thread && Array.isArray(thread.messages) && thread.messages.length > 0) {
      setActiveGmailThread(thread);
      setActiveModalTab('thread');
    } else {
      setActiveGmailThread(null);
      setActiveModalTab('template');
    }

    const leuven25Draft = getLeuven25Draft(lead);
    setActiveEmailModal(leuven25Draft);
  };

  const handleCreateDraftFromModal = async () => {
    if (!activeLeadForModal) return;
    setIsCreatingDraftFromModal(true);
    const res = await generateSingleDraft(activeLeadForModal, modalCustomEmail);
    setIsCreatingDraftFromModal(false);
    if (res.success) {
      setModalDraftSuccess(true);
      if (modalCustomEmail && modalCustomEmail !== activeLeadForModal.contactEmail) {
        updateLeadContactEmail(activeLeadForModal.id, modalCustomEmail);
      }
    }
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
        <title>Sponsor Outreach & Gmail Drafts - FRE2028 Admin</title>
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
                <TrendingUp className="w-3.5 h-3.5 text-zinc-300" />
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

      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          {/* Filters & Search Toolbar */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center mb-6 pb-6 border-b border-zinc-200">
            {/* Search */}
            <div className="relative w-full lg:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Zoeken..."
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

            {/* Actions & Filters */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-white border border-zinc-300 text-xs font-semibold text-zinc-700 py-2 px-3 rounded-lg focus:outline-none focus:border-black transition-colors shadow-sm cursor-pointer"
              >
                <option value="ALL">Alle Statussen ({leads.length})</option>
                <option value="BEVESTIGD">Bevestigd ({confirmedCount})</option>
                <option value="IN_GESPREK">In gesprek ({inDiscussionCount})</option>
                <option value="GECONTACTEERD">Gecontacteerd ({contactedCount})</option>
                <option value="TE_CONTACTEREN">Te contacteren ({toContactCount})</option>
              </select>

              {/* Sync Gmail Button */}
              <button
                onClick={() => handleSyncGmail()}
                disabled={isSyncing || isReauthing}
                title="Synchroniseer verzonden mails en inkomende antwoorden via Gmail"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-900 text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-zinc-700 ${isSyncing || isReauthing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Synchroniseren...' : isReauthing ? 'Autoriseren...' : 'Synchroniseer Gmail'}
              </button>

              {/* Add Lead Button */}
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Nieuwe Lead
              </button>
            </div>
          </div>

          {/* Sync Notification Banner */}
          {syncNotification && (
            <div className="mb-4 p-3 bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs font-semibold rounded-lg flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-zinc-800" />
                <span>{syncNotification}</span>
              </div>
              <button onClick={() => setSyncNotification(null)} className="text-zinc-500 hover:text-black">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Leads Table / Cards */}
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-zinc-600 text-xs uppercase tracking-wider border-b border-zinc-200">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">Lead & Bedrijf</th>
                    <th className="py-3.5 px-4 font-bold hidden md:table-cell">Contact E-mail</th>
                    <th className="py-3.5 px-4 font-bold">Insteek & Rol</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                    <th className="py-3.5 px-4 font-bold text-right">Acties</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-zinc-500">
                        <p className="text-sm font-medium mb-3">Geen leads gevonden voor deze filter of zoekopdracht.</p>
                        <button
                          onClick={handleOpenCreateModal}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                          Nieuwe Lead Toevoegen
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => {
                      const statusInfo = STATUS_LABELS[lead.status];
                      const draftSlug = lead.emailDraftSlug || lead.id;
                      const hasDraftTemplate = Boolean(draftSlug && emailDrafts[draftSlug]);
                      const hasGmailDraft = createdDrafts[lead.id];
                      const thread = gmailThreads[lead.id] || (lead.contactEmail ? gmailThreads[lead.contactEmail.toLowerCase().trim()] : null);
                      const hasMail = true;
                      const isGenerating = generatingLeadId === lead.id;

                      return (
                        <tr 
                          key={lead.id} 
                          className="hover:bg-zinc-50/80 transition-colors"
                        >
                          {/* Name & Company */}
                          <td className="py-4 px-4">
                            <div className="font-bold text-zinc-950 text-base flex flex-wrap items-center gap-2">
                              {lead.name}
                              {thread?.hasReply && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-300" title="Antwoord ontvangen in Gmail">
                                  <Check className="w-2.5 h-2.5 text-zinc-700" /> Got response
                                </span>
                              )}
                              {thread?.hasSent && !thread?.hasReply && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-300" title="E-mail verstuurd">
                                  <Check className="w-2.5 h-2.5 text-zinc-600" /> Sent
                                </span>
                              )}
                              {hasGmailDraft && !thread?.hasSent && !thread?.hasReply && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200" title="Draft aangemaakt in Gmail">
                                  <Mail className="w-2.5 h-2.5 text-zinc-600" /> Drafted
                                </span>
                              )}
                            </div>
                            <div className="text-zinc-700 text-xs font-semibold mt-0.5">{lead.company}</div>
                            <div className="text-zinc-400 text-[11px] mt-0.5">{lead.role}</div>
                            <div className="text-zinc-500 text-[11px] font-mono mt-1 md:hidden">
                              {lead.contactEmail || '(geen email)'}
                            </div>
                          </td>

                          {/* Contact Email (Editable) */}
                          <td className="py-4 px-4 hidden md:table-cell">
                            <input
                              type="email"
                              value={lead.contactEmail || ''}
                              onChange={(e) => updateLeadContactEmail(lead.id, e.target.value)}
                              placeholder="naam@bedrijf.be"
                              className="bg-zinc-50/80 hover:bg-white focus:bg-white border border-zinc-200 focus:border-black rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-800 w-48 transition-colors"
                            />
                            <div className="text-[11px] text-zinc-400 mt-1 font-medium">{lead.tier?.split(':')[0] || 'Lead'}</div>
                          </td>

                          {/* Angle & Notes */}
                          <td className="py-4 px-4 max-w-xs sm:max-w-sm">
                            <div className="text-zinc-800 text-xs font-medium line-clamp-2 leading-relaxed">{lead.angle}</div>
                            {lead.notes && (
                              <div className="text-zinc-500 text-[11px] mt-1 line-clamp-1 italic">{lead.notes}</div>
                            )}
                          </td>

                          {/* Status & Contacted Date */}
                          <td className="py-4 px-4">
                            <select
                              value={lead.status}
                              onChange={(e) => updateLeadStatus(lead.id, e.target.value as Lead['status'])}
                              className="text-xs font-medium py-1.5 px-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 focus:outline-none focus:border-black transition-colors cursor-pointer shadow-sm w-full max-w-[140px]"
                            >
                              <option value="TE_CONTACTEREN">Te contacteren</option>
                              <option value="GECONTACTEERD">Gecontacteerd</option>
                              <option value="IN_GESPREK">In gesprek</option>
                              <option value="BEVESTIGD">Bevestigd</option>
                              <option value="ON_HOLD">On hold</option>
                              <option value="GEEN_MATCH">Geen match</option>
                            </select>

                            {/* Contacted Date (only visible when a date is set) */}
                            {lead.contactedAt && (
                              <div className="mt-1">
                                <input
                                  type="date"
                                  value={lead.contactedAt}
                                  onChange={(e) => updateLeadContactedDate(lead.id, e.target.value)}
                                  title="Datum gecontacteerd"
                                  className="bg-transparent hover:bg-zinc-100 focus:bg-white border border-transparent hover:border-zinc-300 focus:border-black rounded px-1 py-0.5 text-[11px] font-mono text-zinc-600 focus:text-zinc-900 transition-colors cursor-pointer"
                                />
                              </div>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {lead.status !== 'BEVESTIGD' && !thread?.hasSent && !thread?.hasReply && (
                                <button
                                  onClick={() => generateSingleDraft(lead)}
                                  disabled={isGenerating}
                                  title="Maak draft aan"
                                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-colors shadow-sm ${
                                    hasGmailDraft 
                                      ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border-zinc-300' 
                                      : 'bg-white hover:bg-zinc-100 text-zinc-800 border-zinc-300'
                                  }`}
                                >
                                  {isGenerating ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-600" />
                                  ) : hasGmailDraft ? (
                                    <Check className="w-3.5 h-3.5 text-zinc-700" />
                                  ) : (
                                    <Mail className="w-3.5 h-3.5 text-zinc-600" />
                                  )}
                                  {hasGmailDraft ? 'Drafted' : 'Draft'}
                                </button>
                              )}

                              {hasMail && (
                                <button
                                  onClick={() => openEmailModal(lead)}
                                  title="Bekijk e-mail conversatie of template"
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  Mail
                                </button>
                              )}

                              <button
                                onClick={() => handleOpenEditModal(lead)}
                                title="Lead bewerken"
                                className="p-1.5 bg-white hover:bg-zinc-100 text-zinc-700 hover:text-black border border-zinc-300 rounded-lg transition-colors shadow-sm"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteLead(lead)}
                                title="Lead verwijderen"
                                className="p-1.5 bg-white hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 border border-zinc-300 rounded-lg transition-colors shadow-sm"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Batch Generation Modal */}
      {batchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white text-zinc-900 w-full max-w-xl rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden">
            <div className="bg-zinc-950 text-white p-6 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-white" />
                <h3 className="text-lg font-bold">Gmail Drafts Generator</h3>
              </div>
              {!isBatchGenerating && (
                <button 
                  onClick={() => setBatchModalOpen(false)}
                  className="text-zinc-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between text-sm font-bold mb-2">
                <span>Voortgang ({batchProgress.current} van {batchProgress.total})</span>
                <span className="text-zinc-900 font-mono">
                  {batchProgress.total > 0 ? Math.round((batchProgress.current / batchProgress.total) * 100) : 0}%
                </span>
              </div>

              <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden mb-5 border border-zinc-200">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                  style={{ width: `${batchProgress.total > 0 ? (batchProgress.current / batchProgress.total) * 100 : 0}%` }}
                />
              </div>

              <div className="bg-zinc-950 text-zinc-300 font-mono text-xs p-4 rounded-xl h-48 overflow-y-auto space-y-1.5 border border-zinc-800">
                {batchLogs.map((log, idx) => (
                  <div key={idx} className={log.includes('[OK]') ? 'text-zinc-200' : log.includes('[FOUT]') ? 'text-zinc-400 font-semibold' : 'text-zinc-400'}>
                    {log}
                  </div>
                ))}
              </div>

              {batchCompleted && (
                <div className="mt-5 p-4 bg-zinc-100 border border-zinc-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-800 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-zinc-700" />
                    Alle drafts staan klaar in Gmail!
                  </div>
                  <a
                    href="https://mail.google.com/mail/u/0/#drafts"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-zinc-800 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
                  >
                    Open Gmail Drafts <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex justify-end">
              <button
                onClick={() => setBatchModalOpen(false)}
                disabled={isBatchGenerating}
                className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-semibold text-xs rounded-lg transition-colors"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email / Gmail Conversation Modal */}
      {activeLeadForModal && (activeEmailModal || activeGmailThread) && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
          onClick={() => {
            setActiveEmailModal(null);
            setActiveGmailThread(null);
            setActiveLeadForModal(null);
          }}
        >
          <div 
            className="bg-white text-zinc-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-zinc-950 text-white p-6 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">
                    {activeLeadForModal.name} — {activeLeadForModal.company}
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">{activeLeadForModal.role}</p>
              </div>
              <button 
                onClick={() => {
                  setActiveEmailModal(null);
                  setActiveGmailThread(null);
                  setActiveLeadForModal(null);
                }}
                className="text-zinc-400 hover:text-white p-1 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Tabs (if both thread and template exist) */}
            {activeGmailThread && activeEmailModal && (
              <div className="flex border-b border-zinc-200 bg-zinc-50 px-6 pt-2">
                <button
                  onClick={() => setActiveModalTab('thread')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
                    activeModalTab === 'thread'
                      ? 'border-black text-black'
                      : 'border-transparent text-zinc-500 hover:text-black'
                  }`}
                >
                  Gmail Conversatie ({activeGmailThread.messageCount})
                </button>
                <button
                  onClick={() => setActiveModalTab('template')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
                    activeModalTab === 'template'
                      ? 'border-black text-black'
                      : 'border-transparent text-zinc-500 hover:text-black'
                  }`}
                >
                  Draft Template
                </button>
              </div>
            )}

            {/* TAB 1: Gmail Conversation Thread */}
            {activeGmailThread && activeModalTab === 'thread' && (
              <div className="p-6 max-h-[58vh] overflow-y-auto space-y-4 bg-zinc-50/50">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                  <div className="text-xs font-bold text-zinc-900">
                    Onderwerp: <span className="font-normal text-zinc-700">{activeGmailThread.subject || '(geen onderwerp)'}</span>
                  </div>
                  <a
                    href={`https://mail.google.com/mail/u/0/#search/${encodeURIComponent(activeGmailThread.contactEmail)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-zinc-700 hover:text-black underline"
                  >
                    Open in Gmail <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="space-y-4">
                  {(activeGmailThread.messages || []).map((msg, idx) => (
                    <div
                      key={msg.id || idx}
                      className={`p-4 rounded-xl border ${
                        msg.isFromMe 
                          ? 'bg-white border-zinc-200 ml-4' 
                          : 'bg-zinc-100/90 border-zinc-300 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-zinc-200/60">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${msg.isFromMe ? 'text-zinc-900' : 'text-zinc-950 font-black'}`}>
                            {msg.isFromMe ? 'Jij (Fré Leys)' : activeLeadForModal.name}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            &lt;{msg.from.replace(/.*<([^>]+)>.*/, '$1')}&gt;
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-400 font-mono">
                          {msg.displayDate}
                        </span>
                      </div>

                      <div className="text-xs text-zinc-800 leading-relaxed whitespace-pre-wrap font-sans">
                        {msg.body}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: Static / Draft Template */}
            {activeEmailModal && (activeModalTab === 'template' || !activeGmailThread) && (
              <>
                {/* Recipient & Subject Box */}
                <div className="bg-zinc-50 p-4 border-b border-zinc-200 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 w-20">Ontvanger:</span>
                    <input
                      type="email"
                      value={modalCustomEmail}
                      onChange={(e) => setModalCustomEmail(e.target.value)}
                      placeholder="naam@bedrijf.be"
                      className="flex-1 bg-white border border-zinc-300 rounded-md px-3 py-1 text-xs font-mono text-zinc-900 focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-2 border-t border-zinc-200">
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
                      {isCopiedSubject ? <Check className="w-3.5 h-3.5 text-zinc-700" /> : <Copy className="w-3.5 h-3.5 text-zinc-600" />}
                      {isCopiedSubject ? 'Gekopieerd!' : 'Kopieer Onderwerp'}
                    </button>
                  </div>
                </div>

                {/* Email Body Preview */}
                <div className="p-6 max-h-[48vh] overflow-y-auto bg-white prose prose-zinc max-w-none text-sm leading-relaxed border-b border-zinc-200">
                  <div dangerouslySetInnerHTML={{ __html: activeEmailModal.htmlContent }} />
                </div>
              </>
            )}

            {/* Modal Actions Footer */}
            <div className="p-5 bg-zinc-50 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    updateLeadStatus(activeLeadForModal.id, 'GECONTACTEERD');
                  }}
                  className="px-3 py-2 text-xs font-semibold bg-zinc-100 text-zinc-900 border border-zinc-300 rounded-lg hover:bg-zinc-200 transition-colors"
                >
                  Markeer als 'Gecontacteerd'
                </button>
                <button
                  onClick={() => {
                    updateLeadStatus(activeLeadForModal.id, 'IN_GESPREK');
                  }}
                  className="px-3 py-2 text-xs font-semibold bg-zinc-100 text-zinc-900 border border-zinc-300 rounded-lg hover:bg-zinc-200 transition-colors"
                >
                  Markeer als 'In gesprek'
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                {activeEmailModal && (
                  <>
                    {/* Create Draft Button */}
                    <button
                      onClick={handleCreateDraftFromModal}
                      disabled={isCreatingDraftFromModal}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-black text-white font-bold text-xs rounded-lg transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isCreatingDraftFromModal ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : modalDraftSuccess ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <Mail className="w-4 h-4 text-white" />
                      )}
                      {modalDraftSuccess ? 'Drafted!' : 'Maak Draft'}
                    </button>

                    <button
                      onClick={() => copyToClipboard(activeEmailModal.htmlContent, true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-black text-white font-bold text-xs rounded-lg transition-colors shadow-md"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
                      {isCopied ? 'Gekopieerd!' : 'Kopieer E-mail'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lead Create / Edit Modal */}
      {isLeadModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
          onClick={() => setIsLeadModalOpen(false)}
        >
          <div
            className="bg-white text-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-zinc-950 text-white p-6 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">
                  {editingLead ? 'Lead Bewerken' : 'Nieuwe Lead Toevoegen'}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {editingLead ? `Pas de gegevens van ${editingLead.company} aan` : 'Voeg een potentiële sponsor of partner toe'}
                </p>
              </div>
              <button
                onClick={() => setIsLeadModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveLead}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Bedrijfsnaam */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                      Bedrijfsnaam *
                    </label>
                    <input
                      type="text"
                      required
                      value={leadFormData.company}
                      onChange={(e) => setLeadFormData({ ...leadFormData, company: e.target.value })}
                      placeholder="bv. Guardsquare, KBC, Cronos"
                      className="w-full bg-zinc-50 focus:bg-white border border-zinc-300 focus:border-black rounded-lg px-3 py-2 text-sm text-zinc-900 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Contactpersoon */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                      Contactpersoon *
                    </label>
                    <input
                      type="text"
                      required
                      value={leadFormData.name}
                      onChange={(e) => setLeadFormData({ ...leadFormData, name: e.target.value })}
                      placeholder="bv. Heidi Rakels"
                      className="w-full bg-zinc-50 focus:bg-white border border-zinc-300 focus:border-black rounded-lg px-3 py-2 text-sm text-zinc-900 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Rol / Functie */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                      Functie / Rol
                    </label>
                    <input
                      type="text"
                      value={leadFormData.role}
                      onChange={(e) => setLeadFormData({ ...leadFormData, role: e.target.value })}
                      placeholder="bv. CEO / Co-founder / Bestuurder"
                      className="w-full bg-zinc-50 focus:bg-white border border-zinc-300 focus:border-black rounded-lg px-3 py-2 text-sm text-zinc-900 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* E-mailadres */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                      E-mailadres
                    </label>
                    <input
                      type="email"
                      value={leadFormData.contactEmail}
                      onChange={(e) => setLeadFormData({ ...leadFormData, contactEmail: e.target.value })}
                      placeholder="naam@bedrijf.be"
                      className="w-full bg-zinc-50 focus:bg-white border border-zinc-300 focus:border-black rounded-lg px-3 py-2 text-sm font-mono text-zinc-900 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Status */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                      Status
                    </label>
                    <select
                      value={leadFormData.status}
                      onChange={(e) => setLeadFormData({ ...leadFormData, status: e.target.value as Lead['status'] })}
                      className="w-full bg-zinc-50 focus:bg-white border border-zinc-300 focus:border-black rounded-lg px-3 py-2 text-sm font-medium text-zinc-900 focus:outline-none transition-colors cursor-pointer"
                    >
                      <option value="TE_CONTACTEREN">Te contacteren</option>
                      <option value="GECONTACTEERD">Gecontacteerd</option>
                      <option value="IN_GESPREK">In gesprek</option>
                      <option value="BEVESTIGD">Bevestigd</option>
                      <option value="ON_HOLD">On hold</option>
                      <option value="GEEN_MATCH">Geen match</option>
                    </select>
                  </div>

                  {/* Gecontacteerd op Datum */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                      Datum Gecontacteerd
                    </label>
                    <input
                      type="date"
                      value={leadFormData.contactedAt}
                      onChange={(e) => setLeadFormData({ ...leadFormData, contactedAt: e.target.value })}
                      className="w-full bg-zinc-50 focus:bg-white border border-zinc-300 focus:border-black rounded-lg px-3 py-2 text-sm font-mono text-zinc-900 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* E-mail Template */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                      E-mail Draft Template
                    </label>
                    <select
                      value={leadFormData.emailDraftSlug}
                      onChange={(e) => setLeadFormData({ ...leadFormData, emailDraftSlug: e.target.value })}
                      className="w-full bg-zinc-50 focus:bg-white border border-zinc-300 focus:border-black rounded-lg px-3 py-2 text-sm text-zinc-900 focus:outline-none transition-colors cursor-pointer"
                    >
                      <option value="">(Geen template)</option>
                      {Object.keys(emailDrafts).map((slug) => (
                        <option key={slug} value={slug}>
                          {emailDrafts[slug].title || slug}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Insteek / Pitch Angle */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                    Insteek / Pitch Angle
                  </label>
                  <textarea
                    rows={2}
                    value={leadFormData.angle}
                    onChange={(e) => setLeadFormData({ ...leadFormData, angle: e.target.value })}
                    placeholder="bv. Shared identity: Burgerlijk Ingenieur + topsport..."
                    className="w-full bg-zinc-50 focus:bg-white border border-zinc-300 focus:border-black rounded-lg px-3 py-2 text-sm text-zinc-900 focus:outline-none transition-colors"
                  />
                </div>

                {/* Notities */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                    Notities / Achtergrond
                  </label>
                  <textarea
                    rows={2}
                    value={leadFormData.notes}
                    onChange={(e) => setLeadFormData({ ...leadFormData, notes: e.target.value })}
                    placeholder="bv. Directe warme connectie..."
                    className="w-full bg-zinc-50 focus:bg-white border border-zinc-300 focus:border-black rounded-lg px-3 py-2 text-sm text-zinc-900 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
                <div>
                  {editingLead && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsLeadModalOpen(false);
                        handleDeleteLead(editingLead);
                      }}
                      className="px-3 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                      Lead Verwijderen
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsLeadModalOpen(false)}
                    className="px-4 py-2 bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-700 font-semibold text-xs rounded-lg transition-colors"
                  >
                    Annuleren
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-black hover:bg-zinc-800 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
                  >
                    {editingLead ? 'Wijzigingen Opslaan' : 'Lead Toevoegen'}
                  </button>
                </div>
              </div>
            </form>
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
            bodyHtml = bodyMatch[1]
              .replace(/<div class="subject-box">[\s\S]*?<\/div>/gi, '')
              .replace(/<div class="subject-line"[^>]*>[\s\S]*?<\/div>/gi, '')
              .replace(/<p class="note">[\s\S]*?<\/p>/gi, '')
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
