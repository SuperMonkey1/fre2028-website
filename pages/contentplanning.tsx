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
  desc?: string;
  descNl?: string;
};

const VIDEOS: Video[] = [
  { n: 1, dateNl: 'Nov 2026', date: 'Nov 2026', titleNl: "Waarom je slopers niet kunt houden (en hoe je dat oplost)", title: "Why You Can't Hold Slopers (And How to Fix It)", audienceNl: 'Kernklimmers & ingenieurs', audience: 'Core climbers & engineers', angle: 'Product launch #1: Sloper King', views: '35k – 80k (~55k)',
    desc: "Why do slopers load your fingers so differently from crimps or jugs? I failed at the World Championships on slopers, figured out why, and built the Sloper King. An explainer on forces and biomechanics, woven with tests, reactions and a sloper challenge.",
    descNl: "Waarom belasten slopers je vingers zo anders dan crimps of jugs? Ik faalde op het WK op slopers, zocht uit waarom en bouwde de Sloper King. Uitleg over krachten en biomechanica, afgewisseld met tests, reacties en een sloper-challenge." },
  { n: 2, dateNl: 'Dec 2026', date: 'Dec 2026', titleNl: "Kan een 3D-geprinte griptrainer een auto optillen?", title: "Can a 3D-Printed Grip Trainer Lift a Car?", audienceNl: 'Makers & technische twijfelaars', audience: 'Makers & tech skeptics', angle: 'Authority & proof', views: '60k – 150k (~100k)',
    desc: "A destruction test: we hang heavier and heavier objects from a 3D-printed grip trainer, from a few climbers to a car and beyond, until it breaks. In between, I explain the design principles that make this print far stronger than you'd expect.",
    descNl: "Een destructietest: we hangen steeds zwaardere voorwerpen aan een 3D-geprinte griptrainer, van een paar klimmers tot een auto en verder, tot hij breekt. Tussendoor leg ik de designprincipes uit die de print veel sterker maken dan je verwacht." },
  { n: 3, dateNl: 'Jan 2027', date: 'Jan 2027', titleNl: "Een topklimmer probeert te klimmen met een beenprothese (dat liep niet goed)", title: "A Top Climber Tries Climbing With a Prosthetic Leg (It Didn't Go Well)", audienceNl: 'Algemeen YouTube-publiek & klimmers', audience: 'General YouTube & climbers', angle: 'Mega viral breakout', views: '150k – 500k+ (~300k)', viral: true,
    desc: "I build a rigid shell around a well-known climber's leg: no feeling on footholds, no ankle movement, just like a prosthesis. Then I give them challenges. Along the way, many climbers who climb on a prosthesis share their story and explain why some moves stop working.",
    descNl: "Ik bouw een stijve koker rond het been van een bekende klimmer: geen gevoel op voetgrepen, geen beweging in de enkel, net als een prothese. Dan geef ik uitdagingen. Tussendoor komen veel klimmers met een prothese aan het woord over hun verhaal en waarom sommige bewegingen niet lukken." },
  { n: 4, dateNl: 'Feb 2027', date: 'Feb 2027', titleNl: "Je hangbord overbelast je A2-pulley (en zo los je het op)", title: "Your Hangboard Is Overloading Your A2 Pulley (Here's the Fix)", audienceNl: 'Klimmers & biomechanica', audience: 'Climbers & biomechanics', angle: 'Product launch #2: Tailr Edge', views: '40k – 90k (~65k)',
    desc: "A2 pulley injuries are among the most common in climbing, and standard hangboard edges make them easy to get. My made-to-measure Tailr Edge loads all four fingers evenly, so no calluses build up, and its open drag position barely loads the A2 pulley.",
    descNl: "Een A2-pulleyblessure is een van de meest voorkomende klimblessures, en standaard hangbordlatjes maken het je makkelijk. Mijn Tailr Edge op maat belast alle vier je vingers gelijk, dus geen eeltopbouw, en de open positie belast de A2-pulley amper." },
  { n: 5, dateNl: 'Mrt 2027', date: 'Mar 2027', titleNl: "Ik maakte voor Jakob Schubert een greep exact op maat van zijn vingers", title: "I Made Jakob Schubert a Hold Shaped Exactly to His Fingers", audienceNl: 'Wereldwijde klimgemeenschap', audience: 'Global climbing community', angle: 'Collab subscriber surge', views: '100k – 300k (~180k)', viral: true,
    desc: "At the last World Championships, Jakob Schubert gave me an imprint of his fingers holding a crimp. I turn that 3D scan into a wooden grip, milled to fit his fingers exactly, then hand it over and we test it together.",
    descNl: "Op het vorige WK gaf Jakob Schubert me een afdruk van zijn vingers op een crimp. Die 3D-scan zet ik om naar een houten greep, exact op maat van zijn vingers gefreesd, en die testen we daarna samen." },
  { n: 6, dateNl: 'Apr 2027', date: 'Apr 2027', titleNl: "3 Kilter Board-grepen die niemand ooit gebruikt (ik checkte 1.000 boulders)", title: "3 Kilter Board Holds Nobody Ever Uses (I Checked 1,000 Climbs)", audienceNl: 'Techneuten & boardklimmers', audience: 'Tech nerds & board climbers', angle: 'Data & app virality', views: '40k – 100k (~70k)',
    desc: "My Bambum app loaded all ~1,000 verified Kilter boulders. Which holds are used most, which barely, and which three are never used? We set fun boulders on those forgotten holds, plus routes that train one grip type: crimps, pinches or slopers.",
    descNl: "Mijn Bambum-app laadde alle ~1.000 geverifieerde Kilter-boulders in. Welke grepen worden veel gebruikt, welke amper, en welke drie nooit? We maken boulders op die vergeten grepen, en routes die één greepstijl trainen: crimps, pinches of slopers." },
  { n: 7, dateNl: 'Mei 2027', date: 'May 2027', titleNl: "Ik bouwde een doorzichtige klimmuur in mijn living", title: "I Built a See-Through Climbing Wall in My Living Room", audienceNl: 'Makers, doe-het-zelvers & Shorts-kijkers', audience: 'Makers, DIY & Shorts crossover', angle: 'Visual spectacle viral', views: '120k – 350k (~220k)', viral: true,
    desc: "I used to vacuum form transparent climbing holds and cut them out of plastic sheets. I have a pile of sheets left, so what if I skip the cutting and put them side by side? A fully see-through wall. Plus: why vacuum-formed holds are greener and faster to make.",
    descNl: "Vroeger vacuümvormde ik transparante grepen en sneed ze uit plastic platen. Ik heb nog een hoop platen over: wat als ik ze niet uitsnijd maar naast elkaar zet? Een volledig doorzichtige muur. Plus: waarom gevacuümvormde grepen groener en sneller te maken zijn." },
  { n: 8, dateNl: 'Jun 2027', date: 'Jun 2027', titleNl: "Dit grijpt beter dan klimschoenen (getest door Hannes Van Duysen)", title: "This Grips Better Than Climbing Shoes (Tested by Hannes Van Duysen)", audienceNl: 'Klimmers & fysicanerds', audience: 'Climbers & physics geeks', angle: 'Domestic super-collab', views: '45k – 95k (~70k)',
    desc: "Making my prosthetics, I found materials with far more friction than climbing shoe rubber. They wear out fast, but for slab specialist Hannes Van Duysen that may not matter. I stick it over his shoes, we test it on slabs, and I explain why it grips better.",
    descNl: "Bij het maken van mijn protheses vond ik materialen met veel meer frictie dan klimschoenrubber. Ze slijten snel, maar voor slabspecialist Hannes Van Duysen maakt dat misschien niet uit. Ik plak het over zijn schoenen, we testen op slabs en ik leg uit waarom het beter grijpt." },
  { n: 9, dateNl: 'Jul 2027', date: 'Jul 2027', titleNl: "Je hartslag weet wanneer je gaat vallen", title: "Your Heart Rate Knows When You're About to Fall", audienceNl: 'Wearable- & biohackingfans', audience: 'Wearable & biohacking nerds', angle: 'Scientific innovation', views: '25k – 60k (~40k)',
    desc: "Climbing with a heart rate strap, I noticed I always fall off pumped at the same heart rate. So can you predict a fall? Three climbers climb while an app tracks their heart rate live. Plus: why base fitness matters more in climbing than people think.",
    descNl: "Klimmend met een hartslagband merkte ik dat ik altijd op dezelfde hartslag val als ik verzuurd ben. Kun je een val dus voorspellen? Drie klimmers klimmen terwijl een app hun hartslag live volgt. Plus: waarom basisconditie belangrijker is dan je denkt." },
  { n: 10, dateNl: 'Aug 2027', date: 'Aug 2027', titleNl: "Waarom ik mijn hangbord inruilde voor een kabelmachine", title: "Why I Swapped My Hangboard for a Cable Machine", audienceNl: 'Toegewijde klimmers & coaches', audience: 'Dedicated climbers & coaches', angle: 'Training methodology', views: '50k – 120k (~80k)',
    desc: "How I train my grip differently from most climbers: with my Sloper King and Tailr Edge on a gym cable machine. That separates load from reps, so for 12 endurance reps I set the weight to just make it. Hard on a hangboard, easier than counterweights.",
    descNl: "Hoe ik mijn grip anders train: met mijn Sloper King en Tailr Edge op een kabelmachine. Zo koppel ik belasting los van reps: voor 12 reps verzuring stel ik het gewicht zo in dat ik ze net haal. Moeilijk op een hangbord, makkelijker dan met tegengewichten." },
  { n: 11, dateNl: 'Sep 2027', date: 'Sep 2027', titleNl: "De eerste klimzaal ooit stond in België (en niemand weet het)", title: "The First Climbing Gym Ever Was in Belgium (And Nobody Knows)", audienceNl: 'Erfgoed- & cultuurliefhebbers', audience: 'Heritage & culture fans', angle: 'Emotional depth & roots', views: '20k – 50k (~35k)',
    desc: "Few people know the very first climbing gym was in Belgium, and it still exists. I interview its founders and the first route setter ever, who still sets at Stone Age. Then we track down the very first hold on the wall, scan it and remake it for my website.",
    descNl: "Weinig mensen weten dat de allereerste klimzaal in België stond, en die bestaat nog. Ik interview de oprichters en de eerste routebouwer ooit, die nu nog routes zet in Stone Age. Daarna zoeken we de allereerste greep op, scannen die en bouwen hem na voor mijn website." },
  { n: 12, dateNl: 'Okt 2027', date: 'Oct 2027', titleNl: "Ik zette een boor op mijn beenprothese (en andere slechte ideeën)", title: "I Put a Drill on My Prosthetic Leg (And Other Bad Ideas)", audienceNl: 'Mainstream YouTube & gamers', audience: 'Mainstream YouTube & gamers', angle: 'Maker chaos & comedy', views: '100k – 400k (~250k)', viral: true,
    desc: "A fun one: I turn my prosthetic leg into an Inspector Gadget climbing tool. Think of a drill that bores into the wall so I can stand anywhere, a giant suction cup, or something that is guaranteed not to work, like a big blob of jelly. I build each gadget and then put it to the test on the wall.",
    descNl: 'Een leuke: ik maak van mijn beenprothese een klimtool à la Inspector Gadget. Denk aan een boor die in de muur boort zodat ik overal kan staan, een gigantische zuignap, of iets dat gegarandeerd niet werkt, zoals een grote klodder jelly. Ik bouw elk gadget en test het daarna op de muur.' },
  { n: 13, dateNl: 'Nov 2027', date: 'Nov 2027', titleNl: "Stop met repeaters. Je traint je uithouding verkeerd.", title: "Stop Doing Repeaters. You're Training Endurance Wrong.", audienceNl: 'Toegewijde klimmers & coaches', audience: 'Dedicated climbers & coaches', angle: 'Protocol & training app', views: '35k – 75k (~50k)',
    desc: "Everyone trains endurance with repeaters: hang 7 seconds, rest 3. But on the wall you almost always hold on with one hand while reaching. So train left-right: 6 seconds left, 3 both, 6 right. I built an app for it and A/B test it on two friends.",
    descNl: "Iedereen traint weerstand met repeaters: 7 seconden hangen, 3 rust. Maar op de muur hou je bijna altijd één greep vast terwijl je reikt. Train dus links-rechts: 6 seconden links, 3 samen, 6 rechts. Ik maakte er een app voor en test het via een A/B-test bij twee vrienden." },
  { n: 14, dateNl: 'Dec 2027', date: 'Dec 2027', titleNl: "Het gewichtsgesprek dat klimmers vermijden (ik liet een DXA-scan doen)", title: "The Weight Talk Climbers Avoid (I Got a DXA Scan)", audienceNl: 'Gezondheids- & fitnesspubliek', audience: 'Health & fitness audience', angle: 'Vulnerable biohacking', views: '40k – 85k (~60k)',
    desc: "Weight is a taboo in climbing, yet climbing is a fight against gravity. What counts is relative strength: your strength divided by your mass. How do you improve it in a healthy way? We talk nutrition, and I get a DXA scan that measures fat, muscle and bone.",
    descNl: "Gewicht is een taboe in het klimmen, maar klimmen is een gevecht tegen de zwaartekracht. Wat telt is relatieve kracht: je kracht gedeeld door je massa. Hoe verbeter je die gezond? We hebben het over voeding, en een DXA-scan meet je vet, spieren en botmassa." },
  { n: 15, dateNl: 'Jan 2028', date: 'Jan 2028', titleNl: "4 topklimmers, 4 totaal verschillende trainingsmethodes", title: "4 Top Climbers, 4 Wildly Different Training Methods",
    desc: "A look at a full week of my training: every session, and how my training plan as a whole is built up. To make it broader than just my own routine, I also ask three top climbers how their training week looks, so you can compare the different approaches side by side.",
    descNl: "Een kijk op een volledige week van mijn trainingen: elke sessie, en hoe mijn trainingsschema in elkaar zit. Om het breder te maken vraag ik ook drie topklimmers hoe hun trainingsweek eruitziet, zodat je de aanpakken naast elkaar kunt leggen.", audienceNl: 'Trouwe community & atleten', audience: 'Loyal community & athletes', angle: 'Road to LA28 start', views: '30k – 65k (~45k)' },
  { n: 16, dateNl: 'Feb 2028', date: 'Feb 2028', titleNl: "Waarom lijken sommige klimmers moeiteloos? Ik heb het gemeten.", title: "Why Do Some Climbers Look Effortless? I Measured It.",
    desc: "Why do some climbers climb more efficiently than others? We fit every hold on a boulder with force sensors and let different climbers try it, maybe as a contest to use the least force. That shows exactly why some people and some moves cost less energy.",
    descNl: "Waarom klimmen sommige mensen efficiënter dan anderen? We rusten alle grepen van een boulder uit met krachtsensoren en laten verschillende klimmers klimmen, misschien als wedstrijd met zo weinig mogelijk kracht. Zo zien we waarom bepaalde bewegingen minder energie kosten.", audienceNl: 'B2B-zalen & hardwaretech', audience: 'B2B gyms & hardware tech', angle: 'Future product & finale', views: '30k – 70k (~50k)' },
];

type Lang = 'en' | 'nl';
const LANG_KEY = 'fre2028-content-lang';
const TXT = {
  en: {
    eyebrow: 'YouTube roadmap • Nov 2026 → Feb 2028',
    h1a: '16 video ideas,',
    h1b: 'which should I make?',
    hey: 'Hey!',
    intro1: 'Fré is planning to start a YouTube channel about climbing, engineering and prosthetics, with one main video per month until LA 2028. For each idea, drag the slider from',
    notInt: 'not interested',
    veryInt: 'very interested',
    to: 'to',
    intro2: "There are no right or wrong answers: it's about",
    opinion: 'your personal opinion',
    intro3: 'would you click on and watch this video? Add a comment if you want. Your answers are saved automatically as you go.',
    rated: 'rated', saving: 'saving…', saved: 'saved ✓', error: 'could not save, try again',
    q1: 'I am…', climber: 'a climber', maker: 'a maker', none: 'none of the above', pickMore: 'You can pick both climber and maker.',
    nameQ: "What's your name?", namePh: 'Your name', notRated: 'not rated', comment: 'Comment (optional)', results: 'Results', voters: 'voters',
    ideaQ: 'Do you have a video idea of your own?', ideaPh: 'Your idea (optional)',
    favQ: 'If you could watch only one of these videos, which would it be?', favPh: 'Choose a video…',
  },
  nl: {
    eyebrow: 'YouTube-planning • nov 2026 → feb 2028',
    h1a: '16 video-ideeën,',
    h1b: 'welke moet ik maken?',
    hey: 'Hey!',
    intro1: 'Fré plant een YouTube-kanaal te starten over klimmen, engineering en protheses, met tot LA 2028 elke maand één hoofdvideo. Sleep bij elk idee de schuifbalk van',
    notInt: 'niet geïnteresseerd',
    veryInt: 'heel geïnteresseerd',
    to: 'tot',
    intro2: 'Er zijn geen juiste of foute antwoorden: het gaat om',
    opinion: 'jouw persoonlijke mening',
    intro3: 'zou jij op deze video klikken en hem bekijken? Voeg gerust een opmerking toe. Je antwoorden worden automatisch bewaard.',
    rated: 'beoordeeld', saving: 'bewaren…', saved: 'bewaard ✓', error: 'bewaren mislukt, probeer opnieuw',
    q1: 'Ik ben…', climber: 'een klimmer', maker: 'een maker', none: 'geen van beide', pickMore: 'Je mag zowel klimmer als maker kiezen.',
    nameQ: 'Wat is je naam?', namePh: 'Je naam', notRated: 'niet beoordeeld', comment: 'Opmerking (optioneel)', results: 'Resultaten', voters: 'stemmers',
    ideaQ: 'Heb je zelf een idee voor een video?', ideaPh: 'Jouw idee (optioneel)',
    favQ: "Als je maar één van deze video's mocht bekijken, welke zou het zijn?", favPh: 'Kies een video…',
  },
} as const;

const COLLECTION = 'content_votes';
const ID_KEY = 'fre2028-content-voter-id';
const tone = (s: number) => (s >= 7 ? 'good' : s >= 4 ? 'meh' : 'bad');
const TONE_BORDER = { good: 'border-l-emerald-500', meh: 'border-l-amber-400', bad: 'border-l-red-500' } as const;
const TONE_BADGE = { good: 'bg-emerald-100 text-emerald-800 border border-emerald-300', meh: 'bg-amber-100 text-amber-800 border border-amber-300', bad: 'bg-red-100 text-red-800 border border-red-300' } as const;

type Scores = Record<string, number>;
type Comments = Record<string, string>;
type Voter = { id: string; name: string; profile: string[]; scores: Scores; comments: Comments; idea: string; favorite: number | null };
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
  const [idea, setIdea] = useState('');
  const [favorite, setFavorite] = useState<number | null>(null);
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
          setIdea(d.idea || '');
          setFavorite(typeof d.favorite === 'number' ? d.favorite : null);
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
      setDoc(doc(db, COLLECTION, voterId), { name, profile, scores, comments, idea, favorite, updatedAt: serverTimestamp() })
        .then(() => setStatus('saved'))
        .catch(() => setStatus('error'));
    }, 700);
    return () => clearTimeout(t);
  }, [name, profile, scores, comments, idea, favorite, voterId, loaded]);

  // Results view (?results)
  useEffect(() => {
    if (!showResults) return;
    getDocs(collection(db, COLLECTION))
      .then((snap) =>
        setVoters(snap.docs.map((d) => ({ id: d.id, name: d.data().name || 'anonymous', profile: d.data().profile || [], scores: d.data().scores || {}, comments: d.data().comments || {}, idea: d.data().idea || '', favorite: typeof d.data().favorite === 'number' ? d.data().favorite : null })))
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
            {voters.some((x) => x.idea || x.favorite != null) && (
              <div className="mt-4 space-y-1 border-t border-slate-200 pt-3 text-sm text-slate-500">
                {voters.map((x) => (x.idea || x.favorite != null) ? (
                  <div key={x.id}>
                    {x.name}: {x.favorite != null ? <b className="text-slate-800">#{x.favorite}</b> : null}{x.idea ? ` — ${x.idea}` : ''}
                  </div>
                ) : null)}
              </div>
            )}
          </div>
        )}

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 leading-relaxed text-slate-700 shadow-sm">
          <b className="text-amber-600">{L.hey}</b> {L.intro1} <b className="text-amber-600">0 ({L.notInt})</b> {L.to} <b className="text-amber-600">10 ({L.veryInt})</b>. {L.intro2} <b className="text-amber-600">{L.opinion}</b>: {L.intro3}
        </div>

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <label htmlFor="voter-name" className="mb-3 block font-black text-slate-950">{L.nameQ}</label>
          <input
            id="voter-name"
            value={name}
            onChange={(e) => { dirty.current = true; setName(e.target.value.slice(0, 60)); }}
            placeholder={L.namePh}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:border-amber-500 focus:bg-white focus:outline-none"
          />
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
                  {(lang === 'nl' ? v.descNl : v.desc) && (
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{lang === 'nl' ? v.descNl : v.desc}</p>
                  )}
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

        <div className="mb-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-3 font-black text-slate-950">{L.favQ}</p>
          <select
            value={favorite ?? ''}
            onChange={(e) => { dirty.current = true; setFavorite(e.target.value ? Number(e.target.value) : null); }}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:border-amber-500 focus:bg-white focus:outline-none"
          >
            <option value="">{L.favPh}</option>
            {VIDEOS.map((v) => (
              <option key={v.n} value={v.n}>{v.n}. {lang === 'nl' ? v.titleNl : v.title}</option>
            ))}
          </select>
        </div>

        <div className="mb-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-3 font-black text-slate-950">{L.ideaQ}</p>
          <textarea
            value={idea}
            onChange={(e) => { dirty.current = true; setIdea(e.target.value.slice(0, 1000)); }}
            placeholder={L.ideaPh}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 min-h-[80px] focus:border-amber-500 focus:bg-white focus:outline-none"
          />
        </div>

      </div>
    </div>
  );
}
