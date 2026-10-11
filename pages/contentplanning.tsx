import React, { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import { collection, doc, getDocs, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

type Video = {
  n: number;
  date: string;
  dateNl: string;
  title: string;
  titleNl: string;
  audience: string;
  audienceNl: string;
  angle: string;
  views: string;
  viral?: boolean;
};

const VIDEOS: Video[] = [
  { n: 1, dateNl: 'Nov 2026', date: 'Nov 2026', titleNl: 'Waarom klimmers slecht zijn in slopers (en het geheim van enorme powerendurance)', title: 'Why Climbers Suck at Slopers (And the Secret to Insane Power Endurance)', audienceNl: 'Kernklimmers & ingenieurs', audience: 'Core climbers & engineers', angle: 'Product launch #1: Sloper King', views: '35k – 80k (~55k)' },
  { n: 2, dateNl: 'Dec 2026', date: 'Dec 2026', titleNl: 'Kan 3D-geprint klimmateriaal 800 kg dragen? (Hydraulische vernietigingstest)', title: 'Can 3D-Printed Climbing Gear Hold 800 kg? (Hydraulic Destruction Test)', audienceNl: 'Makers & technische twijfelaars', audience: 'Makers & tech skeptics', angle: 'Authority & proof', views: '60k – 150k (~100k)' },
  { n: 3, dateNl: 'Jan 2027', date: 'Jan 2027', titleNl: 'Ik gaf een topklimmer een beenprothese (het liep niet goed)', title: 'I Gave an Elite Climber a Prosthetic Leg (It Did Not Go Well)', audienceNl: 'Algemeen YouTube-publiek & klimmers', audience: 'General YouTube & climbers', angle: 'Mega viral breakout', views: '150k – 500k+ (~300k)', viral: true },
  { n: 4, dateNl: 'Feb 2027', date: 'Feb 2027', titleNl: 'Waarom standaard hangborden je vingers blesseren (de A2-pulleyoplossing)', title: 'Why Standard Hangboards Injure Your Fingers (The A2 Pulley Fix)', audienceNl: 'Klimmers & biomechanica', audience: 'Climbers & biomechanics', angle: 'Product launch #2: Fingerprint hangboard', views: '40k – 90k (~65k)' },
  { n: 5, dateNl: 'Mrt 2027', date: 'Mar 2027', titleNl: 'Ik 3D-printte een custom greep voor wereldkampioen Jakob Schubert', title: 'I 3D-Printed a Custom Grip for World Champion Jakob Schubert', audienceNl: 'Wereldwijde klimgemeenschap', audience: 'Global climbing community', angle: 'Collab subscriber surge', views: '100k – 300k (~180k)', viral: true },
  { n: 6, dateNl: 'Apr 2027', date: 'Apr 2027', titleNl: 'Ik analyseerde 50.000 Kilter Board-routes (de meest onderschatte grepen)', title: 'I Analyzed 50,000 Kilter Board Climbs (The Most Sandbagged Holds)', audienceNl: 'Techneuten & boardklimmers', audience: 'Tech nerds & board climbers', angle: 'Data & app virality', views: '40k – 100k (~70k)' },
  { n: 7, dateNl: 'Mei 2027', date: 'May 2027', titleNl: 'Ik bouwde een transparante klimmuur in mijn living', title: 'I Built a Transparent Climbing Wall in My Living Room', audienceNl: 'Makers, doe-het-zelvers & Shorts-kijkers', audience: 'Makers, DIY & Shorts crossover', angle: 'Visual spectacle viral', views: '120k – 350k (~220k)', viral: true },
  { n: 8, dateNl: 'Jun 2027', date: 'Jun 2027', titleNl: 'De fysica van wrijving op onmogelijke grepen (met Hannes Van Duysen)', title: 'The Physics of Friction on Impossible Holds (feat. Hannes Van Duysen)', audienceNl: 'Klimmers & fysicanerds', audience: 'Climbers & physics geeks', angle: 'Domestic super-collab', views: '45k – 95k (~70k)' },
  { n: 9, dateNl: 'Jul 2027', date: 'Jul 2027', titleNl: 'Kan een algoritme voorspellen wanneer je valt? (hartslagtelemetrie)', title: 'Can an Algorithm Predict When You Will Fall? (Heart Rate Telemetry)', audienceNl: 'Wearable- & biohackingfans', audience: 'Wearable & biohacking nerds', angle: 'Scientific innovation', views: '25k – 60k (~40k)' },
  { n: 10, dateNl: 'Aug 2027', date: 'Aug 2027', titleNl: 'Mijn weg naar de Paralympics engineeren (materiaal maken dat echt werkte)', title: 'Engineering My Way to the Paralympics (Making Gear That Actually Worked)', audienceNl: 'Mainstream media & sponsors', audience: 'Mainstream media & sponsors', angle: 'Brand manifesto & origin story', views: '50k – 120k (~80k)' },
  { n: 11, dateNl: 'Sep 2027', date: 'Sep 2027', titleNl: 'Ik maakte de allereerste indoor klimgreep van de wereld opnieuw', title: "I Remade the World's First Indoor Climbing Hold", audienceNl: 'Erfgoed- & cultuurliefhebbers', audience: 'Heritage & culture fans', angle: 'Emotional depth & roots', views: '20k – 50k (~35k)' },
  { n: 12, dateNl: 'Okt 2027', date: 'Oct 2027', titleNl: 'Ik bouwde 3 absurde klimprotheses (boor, veer & springer)', title: 'I Built 3 Ridiculous Climbing Prosthetics (Drill, Spring & Jumper)', audienceNl: 'Mainstream YouTube & gamers', audience: 'Mainstream YouTube & gamers', angle: 'Maker chaos & comedy', views: '100k – 400k (~250k)', viral: true },
  { n: 13, dateNl: 'Nov 2027', date: 'Nov 2027', titleNl: 'Stop met repeater hangs (waarom wisselen van hand echte powerendurance bouwt)', title: 'Stop Doing Repeater Hangs (Why Alternating Hands Builds True Power Endurance)', audienceNl: 'Toegewijde klimmers & coaches', audience: 'Dedicated climbers & coaches', angle: 'Protocol & training app', views: '35k – 75k (~50k)' },
  { n: 14, dateNl: 'Dec 2027', date: 'Dec 2027', titleNl: 'Ik liet een medische DXA-scan doen (de harde waarheid over klimgewicht & voeding)', title: 'I Got a Medical DXA Scan (The Brutal Truth About Climbing Weight & Food)', audienceNl: 'Gezondheids- & fitnesspubliek', audience: 'Health & fitness audience', angle: 'Vulnerable biohacking', views: '40k – 85k (~60k)' },
  { n: 15, dateNl: 'Jan 2028', date: 'Jan 2028', titleNl: 'Binnen in een trainingsweek van een 2x Wereldbeker-winnaar (periodisering & herstel)', title: 'Inside a 2x World Cup Gold Training Week (Periodization & Recovery)', audienceNl: 'Trouwe community & atleten', audience: 'Loyal community & athletes', angle: 'Road to LA28 start', views: '30k – 65k (~45k)' },
  { n: 16, dateNl: 'Feb 2028', date: 'Feb 2028', titleNl: 'Ik plaatste krachtsensoren op klimgrepen om echte krachten te meten', title: 'I Put Load Cells on Climbing Holds to Measure Real Force', audienceNl: 'B2B-zalen & hardwaretech', audience: 'B2B gyms & hardware tech', angle: 'Future product & finale', views: '30k – 70k (~50k)' },
];

type Lang = 'en' | 'nl';
const LANG_KEY = 'fre2028-content-lang';
const TXT = {
  en: {
    eyebrow: 'YouTube roadmap • Nov 2026 → Feb 2028',
    h1a: '16 video ideas,',
    h1b: 'which should I make?',
    hey: 'Hey!',
    intro1: 'Fré is planning one main YouTube video per month until LA 2028 (climbing + engineering + prosthetics). For each idea, drag the slider from',
    notInt: 'not interested',
    veryInt: 'very interested',
    to: 'to',
    intro2: "There are no right or wrong answers: it's about",
    opinion: 'your personal opinion',
    intro3: 'would you click on and watch this video? Add a comment if you want. Your answers are saved automatically as you go.',
    rated: 'rated', saving: 'saving…', saved: 'saved ✓', error: 'could not save, try again',
    q1: 'I am…', climber: 'a climber', maker: 'a maker', none: 'none of the above', pickMore: 'You can pick both climber and maker.',
    name: 'Your name', notRated: 'not rated', comment: 'Comment (optional)', results: 'Results', voters: 'voters',
  },
  nl: {
    eyebrow: 'YouTube-planning • nov 2026 → feb 2028',
    h1a: '16 video-ideeën,',
    h1b: 'welke moet ik maken?',
    hey: 'Hey!',
    intro1: 'Fré plant tot LA 2028 elke maand één hoofdvideo op YouTube (klimmen + engineering + protheses). Sleep bij elk idee de schuifbalk van',
    notInt: 'niet geïnteresseerd',
    veryInt: 'heel geïnteresseerd',
    to: 'tot',
    intro2: 'Er zijn geen juiste of foute antwoorden: het gaat om',
    opinion: 'jouw persoonlijke mening',
    intro3: 'zou jij op deze video klikken en hem bekijken? Voeg gerust een opmerking toe. Je antwoorden worden automatisch bewaard.',
    rated: 'beoordeeld', saving: 'bewaren…', saved: 'bewaard ✓', error: 'bewaren mislukt, probeer opnieuw',
    q1: 'Ik ben…', climber: 'een klimmer', maker: 'een maker', none: 'geen van beide', pickMore: 'Je mag zowel klimmer als maker kiezen.',
    name: 'Je naam', notRated: 'niet beoordeeld', comment: 'Opmerking (optioneel)', results: 'Resultaten', voters: 'stemmers',
  },
} as const;

const COLLECTION = 'content_votes';
const ID_KEY = 'fre2028-content-voter-id';
const tone = (s: number) => (s >= 7 ? 'good' : s >= 4 ? 'meh' : 'bad');
const TONE_BORDER = { good: 'border-l-emerald-500', meh: 'border-l-amber-400', bad: 'border-l-red-500' } as const;
const TONE_BADGE = { good: 'bg-emerald-100 text-emerald-800 border border-emerald-300', meh: 'bg-amber-100 text-amber-800 border border-amber-300', bad: 'bg-red-100 text-red-800 border border-red-300' } as const;

type Scores = Record<string, number>;
type Comments = Record<string, string>;
type Voter = { id: string; name: string; profile: string[]; scores: Scores; comments: Comments };
const PROFILES = ['climber', 'maker', 'none'] as const;

function newId() {
  return (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));
}

export default function ContentPlanning() {
  const [voterId, setVoterId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [profile, setProfile] = useState<string[]>([]);
  const [scores, setScores] = useState<Scores>({});
  const [comments, setComments] = useState<Comments>({});
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [loaded, setLoaded] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [voters, setVoters] = useState<Voter[]>([]);
  const dirty = useRef(false);
  const [lang, setLangState] = useState<Lang>('en');
  const L = TXT[lang];
  const setLang = (l: Lang) => { setLangState(l); try { localStorage.setItem(LANG_KEY, l); } catch {} };

  // Load (or create) this visitor's voter id, then fetch any previous answers from Firestore
  useEffect(() => {
    let savedLang: string | null = null;
    try { savedLang = localStorage.getItem(LANG_KEY); } catch {}
    setLangState(savedLang === 'nl' || savedLang === 'en' ? savedLang : navigator.language?.toLowerCase().startsWith('nl') ? 'nl' : 'en');
    setShowResults(new URLSearchParams(window.location.search).has('results'));
    let id = '';
    try { id = localStorage.getItem(ID_KEY) || ''; } catch {}
    if (!id) {
      id = newId();
      try { localStorage.setItem(ID_KEY, id); } catch {}
    }
    setVoterId(id);
    getDoc(doc(db, COLLECTION, id))
      .then((snap) => {
        if (snap.exists()) {
          const d = snap.data();
          setName(d.name || '');
          setProfile(Array.isArray(d.profile) ? d.profile : []);
          setScores(d.scores || {});
          setComments(d.comments || {});
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  // Debounced autosave to Firestore
  useEffect(() => {
    if (!voterId || !loaded || !dirty.current) return;
    setStatus('saving');
    const t = setTimeout(() => {
      setDoc(doc(db, COLLECTION, voterId), { name, profile, scores, comments, updatedAt: serverTimestamp() })
        .then(() => setStatus('saved'))
        .catch(() => setStatus('error'));
    }, 700);
    return () => clearTimeout(t);
  }, [name, profile, scores, comments, voterId, loaded]);

  // Results view (?results)
  useEffect(() => {
    if (!showResults) return;
    getDocs(collection(db, COLLECTION))
      .then((snap) =>
        setVoters(snap.docs.map((d) => ({ id: d.id, name: d.data().name || 'anonymous', profile: d.data().profile || [], scores: d.data().scores || {}, comments: d.data().comments || {} })))
      )
      .catch(() => {});
  }, [showResults]);

  const toggleProfile = (k: string) => { dirty.current = true; setProfile((p) => (k === 'none' ? (p.includes('none') ? [] : ['none']) : p.includes(k) ? p.filter((x) => x !== k) : [...p.filter((x) => x !== 'none'), k])); };
  const setScore = (n: number, v: number) => { dirty.current = true; setScores((s) => ({ ...s, [n]: v })); };
  const setComment = (n: number, v: string) => { dirty.current = true; setComments((c) => ({ ...c, [n]: v.slice(0, 1000) })); };
  const rated = VIDEOS.filter((v) => scores[v.n] != null).length;

  const averages = useMemo(() => {
    const out: Record<number, { avg: number; count: number }> = {};
    VIDEOS.forEach((v) => {
      const vals = voters.map((x) => x.scores[v.n]).filter((x) => typeof x === 'number');
      out[v.n] = { avg: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0, count: vals.length };
    });
    return out;
  }, [voters]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Head>
        <title>Video Ideas – Fré Leys</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="mx-auto max-w-3xl px-4 pb-24 pt-10 md:pt-14">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span>{L.eyebrow}</span>
          </div>
          <div className="flex overflow-hidden rounded-full border border-slate-300 bg-white text-xs font-black">
            {(['en', 'nl'] as Lang[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={`px-3.5 py-1.5 uppercase tracking-wider transition-colors ${lang === l ? 'bg-amber-400 text-slate-950' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <h1 className="mb-8 text-4xl font-medium leading-[1.1] tracking-tight text-slate-800 sm:text-5xl">
          {L.h1a}{' '}
          <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 bg-clip-text font-black text-transparent">
            {L.h1b}
          </span>
        </h1>

        {showResults && (
          <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-black text-slate-950">{L.results} ({voters.length} {L.voters})</h2>
            <ul className="space-y-2 text-sm">
              {[...VIDEOS].sort((a, b) => averages[b.n].avg - averages[a.n].avg).map((v) => (
                <li key={v.n} className="flex items-start gap-3">
                  <span className={`shrink-0 w-14 text-center font-bold rounded px-2 py-0.5 ${averages[v.n].count ? TONE_BADGE[tone(averages[v.n].avg)] : 'bg-slate-100 text-slate-500'}`}>
                    {averages[v.n].count ? averages[v.n].avg.toFixed(1) : '–'}
                  </span>
                  <div>
                    <div>{v.n}. {lang === 'nl' ? v.titleNl : v.title}</div>
                    {voters.map((x) => (x.scores[v.n] != null || x.comments[v.n]) ? (
                      <div key={x.id} className="text-slate-500">
                        {x.name}{x.profile.length ? ` (${x.profile.join(' + ')})` : ''}: <b className="text-slate-800">{x.scores[v.n] ?? '–'}</b>{x.comments[v.n] ? ` — ${x.comments[v.n]}` : ''}
                      </div>
                    ) : null)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 leading-relaxed text-slate-700 shadow-sm">
          <b className="text-amber-600">{L.hey}</b> {L.intro1} <b className="text-amber-600">0 ({L.notInt})</b> {L.to} <b className="text-amber-600">10 ({L.veryInt})</b>. {L.intro2} <b className="text-amber-600">{L.opinion}</b>: {L.intro3}
        </div>

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-3 font-black text-slate-950">{L.q1}</p>
          <div className="flex flex-col gap-2">
            {PROFILES.map((k) => (
              <label key={k} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-slate-400">
                <input
                  type="checkbox"
                  checked={profile.includes(k)}
                  onChange={() => toggleProfile(k)}
                  className="h-5 w-5 cursor-pointer accent-amber-500"
                />
                {L[k]}
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-400">{L.pickMore}</p>
        </div>

        <div className="sticky top-0 z-10 bg-slate-50/95 py-3 flex flex-wrap items-center gap-3 border-b border-slate-200 mb-4 backdrop-blur">
          <span className="text-sm text-slate-500 mr-auto">
            {rated} / {VIDEOS.length} {L.rated} ·{' '}
            {status === 'saving' && L.saving}
            {status === 'saved' && <span className="text-emerald-600">{L.saved}</span>}
            {status === 'error' && <span className="text-red-600">{L.error}</span>}
          </span>
          <input
            value={name}
            onChange={(e) => { dirty.current = true; setName(e.target.value.slice(0, 60)); }}
            placeholder={L.name}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm w-40 focus:border-amber-500 focus:outline-none"
          />
        </div>

        {VIDEOS.map((v) => {
          const s = scores[v.n];
          const t = s != null ? tone(s) : null;
          return (
            <div key={v.n} className={`bg-white border border-slate-200 border-l-4 rounded-3xl p-5 mb-4 shadow-sm ${t ? TONE_BORDER[t] : 'border-l-slate-200'}`}>
              <div className="flex gap-3 items-start">
                <div className="shrink-0 w-9 h-9 rounded-full border border-amber-300 bg-amber-100 text-amber-700 grid place-items-center font-black">{v.n}</div>
                <div>
                  <p className="font-black text-lg leading-snug text-slate-950">{lang === 'nl' ? v.titleNl : v.title}</p>
                </div>
              </div>
              <div className="h-3" />
              <div className="flex items-center gap-3.5">
                <input
                  type="range" min={0} max={10} step={1}
                  value={s ?? 5}
                  onChange={(e) => setScore(v.n, Number(e.target.value))}
                  className="flex-1 h-7 cursor-pointer accent-amber-500"
                  aria-label={`Score for video ${v.n}`}
                />
                <span className={`shrink-0 min-w-[68px] text-center font-bold rounded-lg px-2 py-1 ${t ? TONE_BADGE[t] : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                  {s != null ? `${s} / 10` : L.notRated}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-0.5 mr-[82px]">
                <span>0 · {L.notInt}</span><span>10 · {L.veryInt}</span>
              </div>
              <textarea
                value={comments[v.n] || ''}
                onChange={(e) => setComment(v.n, e.target.value)}
                placeholder={L.comment}
                className="w-full mt-2.5 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 min-h-[40px] focus:border-amber-500 focus:bg-white focus:outline-none"
              />
            </div>
          );
        })}

      </div>
    </div>
  );
}
