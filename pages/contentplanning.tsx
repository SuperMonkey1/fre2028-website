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

// `n` is the stable id stored in Firestore (scores, comments, favorite); the array order is the display order.
const VIDEOS: Video[] = [
  { n: 7, dateNl: 'Mei 2027', date: 'May 2027', titleNl: "Ik bouwde een doorzichtige klimmuur in mijn living", title: "I Built a See-Through Climbing Wall in My Living Room", audienceNl: 'Makers, doe-het-zelvers & Shorts-kijkers', audience: 'Makers, DIY & Shorts crossover', angle: 'Visual spectacle viral', views: '120k – 350k (~220k)', viral: true,
    desc: "I used to vacuum form transparent climbing holds and cut them out of plastic sheets. I have a pile of sheets left, so what if I skip the cutting and put them side by side? A fully see-through wall. Plus: why vacuum-formed holds are greener and faster to make.",
    descNl: "Vroeger vacuümvormde ik transparante grepen en sneed ze uit plastic platen. Ik heb nog een hoop platen over: wat als ik ze niet uitsnijd maar naast elkaar zet? Een volledig doorzichtige muur. Plus: waarom gevacuümvormde grepen groener en sneller te maken zijn." },
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
  { n: 17, dateNl: 'nnb', date: 'tbd', titleNl: "Warm water kan je herstel versnellen (ik bouwde een mouw om het te testen)", title: "Hot Water Could Speed Up Your Recovery (I Built a Sleeve to Test It)", audienceNl: 'Klimmers & herstelnerds', audience: 'Climbers & recovery nerds', angle: 'Recovery experiment', views: '–',
    desc: "Research suggests that heating your muscles might help them recover faster. So I build a sleeve that wraps around my forearm with warm water running through it, and use it for an hour every day. Does it actually help? I test it, and explain what the research says.",
    descNl: "Onderzoek suggereert dat je spieren opwarmen het herstel kan versnellen. Dus bouw ik een mouw rond mijn onderarm waar warm water door stroomt, en gebruik ik die elke dag een uur. Helpt het echt? Ik test het en leg uit wat het onderzoek zegt." },
];

const POS: Record<number, number> = {};
VIDEOS.forEach((v, i) => { POS[v.n] = i + 1; });

type Lang = 'en' | 'nl';
const LANG_KEY = 'fre2028-content-lang';
const TXT = {
  en: {
    eyebrow: 'YouTube roadmap • Nov 2026 → Feb 2028',
    h1a: '17 video ideas,',
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
    nameQ: "What's your name?", namePh: 'Your name', notRated: 'not rated', comment: 'Comment (optional)', results: 'Results', voters: 'voters', included: 'included', excludedNote: 'left out (rated 2 or fewer videos)', excludedTag: 'not counted', segAll: 'Everyone', segClimber: 'Climbers', segMaker: 'Makers', method: 'How the ranking works', methodText: "Everyone uses the scale differently: some give only 0s and 10s, others stay between 5 and 8. So each person's scores are first standardised against their own average and spread (a z-score). The ranking uses the average of those relative scores, converted back to a 0–10 scale. People who rated 2 or fewer videos are left out. The raw data is unchanged.", rawAvg: 'raw avg', top3: 'in personal top 3', favs: 'favourite', csv: 'Download raw data (CSV)', perVideo: 'individual scores', perPerson: 'Answers per person', submit: 'Save my answers', thanks: 'Thank you', thanksText: 'Your answers are saved. This is me doing my victory dance. You can still change your answers anytime.', close: 'Close', minion: 'Even the Minion approves', favLabel: 'Favourite', ideaLabel: 'Own idea',
    ideaQ: 'Do you have a video idea of your own?', ideaPh: 'Your idea (optional)',
    favQ: 'If you could watch only one of these videos, which would it be?', favPh: 'Choose a video…',
  },
  nl: {
    eyebrow: 'YouTube-planning • nov 2026 → feb 2028',
    h1a: '17 video-ideeën,',
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
    nameQ: 'Wat is je naam?', namePh: 'Je naam', notRated: 'niet beoordeeld', comment: 'Opmerking (optioneel)', results: 'Resultaten', voters: 'stemmers', included: 'meegeteld', excludedNote: "weggelaten (2 of minder video's beoordeeld)", excludedTag: 'niet meegeteld', segAll: 'Iedereen', segClimber: 'Klimmers', segMaker: 'Makers', method: 'Hoe de ranking werkt', methodText: "Iedereen gebruikt de schaal anders: sommigen geven enkel 0 en 10, anderen blijven tussen 5 en 8. Daarom worden de scores van elke persoon eerst gestandaardiseerd ten opzichte van hun eigen gemiddelde en spreiding (een z-score). De ranking gebruikt het gemiddelde van die relatieve scores, terug omgezet naar een schaal van 0–10. Wie 2 of minder video's beoordeelde, wordt weggelaten. De ruwe data blijft ongewijzigd.", rawAvg: 'ruw gem.', top3: 'in persoonlijke top 3', favs: 'favoriet', csv: 'Ruwe data downloaden (CSV)', perVideo: 'individuele scores', perPerson: 'Antwoorden per persoon', submit: 'Bewaar mijn antwoorden', thanks: 'Bedankt', thanksText: 'Je antwoorden zijn bewaard. Dit ben ik die mijn overwinningsdansje doet. Je kunt je antwoorden altijd nog aanpassen.', close: 'Sluiten', minion: 'Zelfs de Minion keurt het goed', favLabel: 'Favoriet', ideaLabel: 'Eigen idee',
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

const MIN_RATED = 3;
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const ratedCount = (x: { scores: Scores }) => VIDEOS.filter((v) => typeof x.scores[v.n] === 'number').length;

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
  const [openVoter, setOpenVoter] = useState<string | null>(null);
  const [thanks, setThanks] = useState(false);
  const [segment, setSegment] = useState<'all' | 'climber' | 'maker'>('all');
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

  const save = () => {
    if (!voterId) return Promise.resolve();
    setStatus('saving');
    return setDoc(doc(db, COLLECTION, voterId), { name, profile, scores, comments, idea, favorite, updatedAt: serverTimestamp() })
      .then(() => setStatus('saved'))
      .catch(() => setStatus('error'));
  };

  // Debounced autosave to Firestore
  useEffect(() => {
    if (!voterId || !loaded || !dirty.current) return;
    setStatus('saving');
    const t = setTimeout(save, 700);
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

  // Results analysis. Raw Firestore data is never changed: low-effort responses are only left out of the calculation,
  // and each respondent's scores are standardised (z-score) to remove differences in how people use the 0–10 scale.
  const analysis = useMemo(() => {
    const isValid = (x: Voter) => ratedCount(x) >= MIN_RATED;
    const included = voters.filter((x) => isValid(x) && (segment === 'all' || x.profile.includes(segment)));
    const excluded = voters.filter((x) => !isValid(x)).length;
    const people = included.map((x) => {
      const vals = VIDEOS.map((v) => x.scores[v.n]).filter((sc): sc is number => typeof sc === 'number');
      const m = mean(vals);
      const sd = Math.sqrt(mean(vals.map((sc) => (sc - m) ** 2)));
      const third = [...vals].sort((a, b) => b - a)[Math.min(2, vals.length - 1)];
      return { x, m, sd, third };
    });
    const grandMean = mean(people.map((p) => p.m));
    const spreads = people.map((p) => p.sd).filter((sd) => sd > 0);
    const pooledSd = spreads.length ? mean(spreads) : 1;
    const rows = VIDEOS.map((v) => {
      const rated = people.filter((p) => typeof p.x.scores[v.n] === 'number');
      const zs = rated.map((p) => (p.sd > 0 ? (p.x.scores[v.n] - p.m) / p.sd : 0));
      const z = zs.length ? mean(zs) : 0;
      return {
        v,
        n: rated.length,
        z,
        adjusted: Math.min(10, Math.max(0, grandMean + z * pooledSd)),
        raw: rated.length ? mean(rated.map((p) => p.x.scores[v.n])) : 0,
        top3: rated.length ? rated.filter((p) => p.x.scores[v.n] >= p.third).length / rated.length : 0,
        favs: included.filter((x) => x.favorite === v.n).length,
      };
    }).sort((a, b) => b.z - a.z);
    return { included, excluded, rows };
  }, [voters, segment]);

  const downloadCsv = () => {
    const head = ['id', 'name', 'profile', 'rated', 'favorite', 'idea', ...VIDEOS.map((v) => `score_${v.n}`), ...VIDEOS.map((v) => `comment_${v.n}`)];
    const esc = (val: unknown) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const lines = voters.map((x) => [x.id, x.name, x.profile.join('+'), ratedCount(x), x.favorite ?? '', x.idea, ...VIDEOS.map((v) => x.scores[v.n] ?? ''), ...VIDEOS.map((v) => x.comments[v.n] ?? '')].map(esc).join(','));
    const blob = new Blob(['\ufeff' + [head.map(esc).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'content_votes_raw.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Head>
        <title>Video Ideas – Fré Leys</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="mx-auto max-w-3xl px-4 pb-24 pt-10 md:pt-14">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2 pt-1.5 text-xs font-bold uppercase leading-snug tracking-widest text-slate-500">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
            <span>{L.eyebrow}</span>
          </div>
          <div className="flex shrink-0 overflow-hidden rounded-full border border-slate-300 bg-white text-xs font-black">
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
            <h2 className="text-lg font-black text-slate-950">{L.results}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {analysis.included.length} {L.included} · {analysis.excluded} {L.excludedNote}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {([['all', L.segAll], ['climber', L.segClimber], ['maker', L.segMaker]] as const).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setSegment(k)}
                  aria-pressed={segment === k}
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${segment === k ? 'border-amber-400 bg-amber-400 text-slate-950' : 'border-slate-300 text-slate-600 hover:bg-slate-100'}`}
                >
                  {label}
                </button>
              ))}
              <button type="button" onClick={downloadCsv} className="ml-auto rounded-full border border-slate-300 px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100">
                ⬇ {L.csv}
              </button>
            </div>
            <details className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
              <summary className="cursor-pointer font-bold text-slate-800">{L.method}</summary>
              <p className="mt-2 leading-relaxed">{L.methodText}</p>
            </details>
            <ol className="mt-4 space-y-3 text-sm">
              {analysis.rows.map((r, i) => (
                <li key={r.v.n} className="flex items-start gap-3">
                  <span className="w-5 shrink-0 pt-0.5 text-right font-black text-slate-400">{i + 1}</span>
                  <span className={`shrink-0 w-12 text-center font-bold rounded px-1.5 py-0.5 ${r.n ? TONE_BADGE[tone(r.adjusted)] : 'bg-slate-100 text-slate-500'}`}>
                    {r.n ? r.adjusted.toFixed(1) : '–'}
                  </span>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900">#{POS[r.v.n]} {lang === 'nl' ? r.v.titleNl : r.v.title}</div>
                    <div className="text-xs text-slate-500">
                      z {r.z >= 0 ? '+' : ''}{r.z.toFixed(2)} · {L.rawAvg} {r.raw.toFixed(1)} · {Math.round(r.top3 * 100)}% {L.top3} · {r.favs}× {L.favs} · n={r.n}
                    </div>
                    <details className="text-xs text-slate-500">
                      <summary className="cursor-pointer">{L.perVideo}</summary>
                      {analysis.included.map((x) => (x.scores[r.v.n] != null || x.comments[r.v.n]) ? (
                        <div key={x.id}>
                          {x.name}{x.profile.length ? ` (${x.profile.join(' + ')})` : ''}: <b className="text-slate-800">{x.scores[r.v.n] ?? '–'}</b>{x.comments[r.v.n] ? ` — ${x.comments[r.v.n]}` : ''}
                        </div>
                      ) : null)}
                    </details>
                  </div>
                </li>
              ))}
            </ol>
            {voters.some((x) => x.idea || x.favorite != null) && (
              <div className="mt-4 space-y-1 border-t border-slate-200 pt-3 text-sm text-slate-500">
                {voters.map((x) => (x.idea || x.favorite != null) ? (
                  <div key={x.id}>
                    {x.name}: {x.favorite != null ? <b className="text-slate-800">#{POS[x.favorite]}</b> : null}{x.idea ? ` — ${x.idea}` : ''}
                  </div>
                ) : null)}
              </div>
            )}
            <h3 className="mt-5 mb-2 border-t border-slate-200 pt-4 font-black text-slate-950">{L.perPerson}</h3>
            <ul className="space-y-2 text-sm">
              {voters.map((x) => {
                const open = openVoter === x.id;
                const fav = VIDEOS.find((v) => v.n === x.favorite);
                return (
                  <li key={x.id} className="rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setOpenVoter(open ? null : x.id)}
                      aria-expanded={open}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-slate-50"
                    >
                      <span className="font-bold text-slate-900">{x.name}</span>
                      {ratedCount(x) < MIN_RATED ? <span className="rounded bg-slate-100 px-1.5 text-xs text-slate-400">{L.excludedTag}</span> : null}
                      {x.profile.length ? <span className="text-slate-500">({x.profile.join(' + ')})</span> : null}
                      <span className="ml-auto text-slate-400">{VIDEOS.filter((v) => x.scores[v.n] != null).length} / {VIDEOS.length} {open ? '▴' : '▾'}</span>
                    </button>
                    {open && (
                      <div className="space-y-1.5 border-t border-slate-200 px-3 py-3 text-slate-600">
                        {fav && <div><b className="text-slate-800">{L.favLabel}:</b> {POS[fav.n]}. {lang === 'nl' ? fav.titleNl : fav.title}</div>}
                        {x.idea && <div><b className="text-slate-800">{L.ideaLabel}:</b> {x.idea}</div>}
                        {VIDEOS.map((v) => (
                          <div key={v.n} className="flex items-start gap-3">
                            <span className={`shrink-0 w-10 text-center font-bold rounded px-1.5 py-0.5 ${x.scores[v.n] != null ? TONE_BADGE[tone(x.scores[v.n])] : 'bg-slate-100 text-slate-500'}`}>
                              {x.scores[v.n] ?? '–'}
                            </span>
                            <div>
                              <div>{POS[v.n]}. {lang === 'nl' ? v.titleNl : v.title}</div>
                              {x.comments[v.n] ? <div className="text-slate-500 italic">{x.comments[v.n]}</div> : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
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
              <div className="flex gap-3 items-start justify-between">
                <p className="font-black text-lg leading-snug text-slate-950">{lang === 'nl' ? v.titleNl : v.title}</p>
                <span className="shrink-0 pt-1 text-xs font-black text-amber-600">#{POS[v.n]}</span>
              </div>
              {(lang === 'nl' ? v.descNl : v.desc) && (
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{lang === 'nl' ? v.descNl : v.desc}</p>
              )}
              <div className="h-3" />
              <input
                type="range" min={0} max={10} step={1}
                value={s ?? 5}
                onChange={(e) => setScore(v.n, Number(e.target.value))}
                className={`w-full h-7 cursor-pointer ${s != null ? 'accent-amber-500' : 'accent-slate-300'}`}
                aria-label={`Score for video ${POS[v.n]}`}
              />
              <div className="flex justify-between gap-2 text-xs text-slate-400">
                <span>0 · {L.notInt}</span><span className="text-right">10 · {L.veryInt}</span>
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
              <option key={v.n} value={v.n}>{POS[v.n]}. {lang === 'nl' ? v.titleNl : v.title}</option>
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

        <button
          type="button"
          onClick={() => { save(); setThanks(true); }}
          className="w-full rounded-2xl bg-amber-400 px-5 py-4 text-lg font-black text-slate-950 shadow-sm transition-transform hover:scale-[1.01] hover:bg-amber-300 active:scale-[0.99]"
        >
          {L.submit} 🎉
        </button>

      </div>

      {thanks && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-hidden bg-slate-950/60 p-4 backdrop-blur-sm" onClick={() => setThanks(false)}>
          <Confetti />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="cp-dance mx-auto h-56 w-56 overflow-hidden rounded-full border-4 border-amber-400 shadow-lg">
              <img src="/images/web/me_winning_innsbruck_web.webp" alt="Fré celebrating" className="h-full w-full object-cover" style={{ objectPosition: '22% 50%', transform: 'scale(1.9)', transformOrigin: '22% 50%' }} />
            </div>
            <div className="cp-pop absolute -right-3 top-28 w-24 rotate-12 rounded-2xl border-4 border-white bg-white shadow-xl">
              <img src="/images/me_la_minion.jpg" alt="" className="h-28 w-full rounded-xl object-cover" style={{ objectPosition: '50% 40%' }} />
              <p className="px-1 py-1 text-[10px] font-bold leading-tight text-slate-600">{L.minion}</p>
            </div>
            <h2 className="mt-5 text-3xl font-black text-slate-950">{L.thanks}{name.trim() ? `, ${name.trim()}` : ''}! 🙌</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{L.thanksText}</p>
            <button type="button" onClick={() => setThanks(false)} className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-700">
              {L.close}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes cp-dance {
          0%, 100% { transform: rotate(-8deg) translateY(0); }
          25% { transform: rotate(8deg) translateY(-12px) scale(1.04); }
          50% { transform: rotate(-6deg) translateY(0); }
          75% { transform: rotate(10deg) translateY(-8px) scale(0.98); }
        }
        @keyframes cp-pop {
          0% { transform: scale(0) rotate(-30deg); }
          70% { transform: scale(1.15) rotate(18deg); }
          100% { transform: scale(1) rotate(12deg); }
        }
        @keyframes cp-fall {
          0% { transform: translate3d(0, -10vh, 0) rotate(0deg); opacity: 1; }
          100% { transform: translate3d(var(--drift), 110vh, 0) rotate(720deg); opacity: 0.9; }
        }
        .cp-dance { animation: cp-dance 0.9s ease-in-out infinite; }
        .cp-pop { animation: cp-pop 0.6s 0.8s cubic-bezier(.3,1.6,.5,1) both; }
        .cp-confetti { position: absolute; top: 0; animation: cp-fall linear forwards; }
        @media (prefers-reduced-motion: reduce) {
          .cp-dance, .cp-pop, .cp-confetti { animation: none; }
        }
      `}</style>
    </div>
  );
}

const CONFETTI_COLORS = ['#f59e0b', '#fbbf24', '#10b981', '#3b82f6', '#ef4444', '#a855f7', '#ec4899'];

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 140 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 1.5,
        duration: 2.5 + Math.random() * 2.5,
        drift: (Math.random() - 0.5) * 200,
        size: 6 + Math.random() * 8,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        round: Math.random() < 0.3,
      })),
    []
  );
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="cp-confetti"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.round ? p.size : p.size * 0.45,
            background: p.color,
            borderRadius: p.round ? '50%' : 2,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            ['--drift' as string]: `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
