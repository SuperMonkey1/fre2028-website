import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import {
  TrendingUp,
  TrendingDown,
  Award,
  BarChart3,
  Layers,
  ArrowRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  Info,
  Calendar,
  Mountain,
  ChevronDown,
  Activity,
  SlidersHorizontal,
  Compass,
  ArrowUpRight,
  ArrowDownRight,
  Swords,
  Target,
  Download,
  CheckCircle2,
  AlertCircle,
  Zap
} from 'lucide-react';
import {
  CompetitionData,
  AthleteProgression,
  compareCompetitions
} from '../lib/comp-analysis';
import { loadAllQualificationCompetitions } from '../lib/comp-analysis-server';

interface CompAnalysisPageProps {
  competitions: CompetitionData[];
}

type AnalysisTab = 'difficultyWeighted' | 'peakFloor' | 'overtakes' | 'fieldPercentile';
type SortField = string;

export const getStaticProps: GetStaticProps<CompAnalysisPageProps> = async () => {
  const competitions = loadAllQualificationCompetitions();
  return {
    props: {
      competitions: JSON.parse(JSON.stringify(competitions))
    }
  };
};

export default function CompAnalysisPage({ competitions }: CompAnalysisPageProps) {
  // State
  const [selectedComp1Id, setSelectedComp1Id] = useState<string>(
    competitions.length >= 2 ? competitions[0].id : competitions[0]?.id || ''
  );
  const [selectedComp2Id, setSelectedComp2Id] = useState<string>(
    competitions.length >= 2 ? competitions[1].id : competitions[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<AnalysisTab>('difficultyWeighted');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('difficultyDelta');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [hoveredFlowAthlete, setHoveredFlowAthlete] = useState<string | null>(null);
  const [showMethodology, setShowMethodology] = useState<boolean>(false);

  // Selected Comp Objects
  const comp1 = useMemo(() => {
    return competitions.find(c => c.id === selectedComp1Id) || competitions[0];
  }, [competitions, selectedComp1Id]);

  const comp2 = useMemo(() => {
    return competitions.find(c => c.id === selectedComp2Id) || competitions[1] || competitions[0];
  }, [competitions, selectedComp2Id]);

  // Comparison Results
  const comparison = useMemo(() => {
    if (!comp1 || !comp2) return null;
    return compareCompetitions(comp1, comp2);
  }, [comp1, comp2]);

  // Flow Transition Data
  const flowData = useMemo(() => {
    if (!comparison) return null;
    const leftSorted = [...comparison.progressions].sort(
      (a, b) => a.comp1Rank - b.comp1Rank || a.name.localeCompare(b.name)
    );
    const rightSorted = [...comparison.progressions].sort(
      (a, b) => a.comp2Rank - b.comp2Rank || a.name.localeCompare(b.name)
    );

    const rowHeight = 46;
    const topOffset = 65;
    const totalHeight = topOffset + Math.max(leftSorted.length, rightSorted.length) * rowHeight + 35;
    const leftX = 270;
    const rightX = 690;
    const cx1 = leftX + (rightX - leftX) * 0.45;
    const cx2 = rightX - (rightX - leftX) * 0.45;

    const lines = comparison.progressions.map(p => {
      const idx1 = leftSorted.findIndex(a => a.name === p.name);
      const idx2 = rightSorted.findIndex(a => a.name === p.name);
      const y1 = topOffset + idx1 * rowHeight + 16;
      const y2 = topOffset + idx2 * rowHeight + 16;
      const pathD = `M ${leftX} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${rightX} ${y2}`;

      return {
        athlete: p,
        idx1,
        idx2,
        y1,
        y2,
        pathD
      };
    });

    return {
      leftSorted,
      rightSorted,
      rowHeight,
      topOffset,
      totalHeight,
      leftX,
      rightX,
      lines
    };
  }, [comparison]);

  // Difficulty Flow Transition Data
  const difficultyFlowData = useMemo(() => {
    if (!comparison) return null;
    const leftSorted = [...comparison.progressions].sort(
      (a, b) => b.comp1DifficultyScore - a.comp1DifficultyScore || a.name.localeCompare(b.name)
    );
    const rightSorted = [...comparison.progressions].sort(
      (a, b) => b.comp2DifficultyScore - a.comp2DifficultyScore || a.name.localeCompare(b.name)
    );

    const rowHeight = 46;
    const topOffset = 65;
    const totalHeight = topOffset + Math.max(leftSorted.length, rightSorted.length) * rowHeight + 35;
    const leftX = 270;
    const rightX = 690;
    const cx1 = leftX + (rightX - leftX) * 0.45;
    const cx2 = rightX - (rightX - leftX) * 0.45;

    const lines = comparison.progressions.map(p => {
      const idx1 = leftSorted.findIndex(a => a.name === p.name);
      const idx2 = rightSorted.findIndex(a => a.name === p.name);
      const y1 = topOffset + idx1 * rowHeight + 16;
      const y2 = topOffset + idx2 * rowHeight + 16;
      const pathD = `M ${leftX} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${rightX} ${y2}`;

      return {
        athlete: p,
        idx1,
        idx2,
        y1,
        y2,
        pathD
      };
    });

    return {
      leftSorted,
      rightSorted,
      rowHeight,
      topOffset,
      totalHeight,
      leftX,
      rightX,
      lines
    };
  }, [comparison]);

  // Filtered & Sorted Progressions
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      if (['name', 'comp1Rank', 'comp2Rank', 'cohortRank', 'index'].includes(field)) {
        setSortAsc(true);
      } else {
        setSortAsc(false);
      }
    }
  };

  const renderSortIcon = (field: string) => {
    if (sortField === field) {
      return sortAsc ? <ArrowUp className="w-3 h-3 text-black" /> : <ArrowDown className="w-3 h-3 text-black" />;
    }
    return <ArrowUpDown className="w-3 h-3 text-zinc-400 group-hover:text-black transition-colors" />;
  };

  const displayedProgressions = useMemo(() => {
    if (!comparison) return [];
    let list = [...comparison.progressions];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }

    list.sort((a, b) => {
      let valA = 0;
      let valB = 0;

      if (sortField === 'name') {
        return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      } else if (sortField === 'diagnostic') {
        return sortAsc ? a.primaryDiagnostic.localeCompare(b.primaryDiagnostic) : b.primaryDiagnostic.localeCompare(a.primaryDiagnostic);
      } else if (sortField === 'comp1Rank') {
        return sortAsc ? a.comp1Rank - b.comp1Rank : b.comp1Rank - a.comp1Rank;
      } else if (sortField === 'comp2Rank') {
        return sortAsc ? a.comp2Rank - b.comp2Rank : b.comp2Rank - a.comp2Rank;
      } else if (sortField === 'rankDelta') {
        valA = a.rankDelta;
        valB = b.rankDelta;
      } else if (sortField === 'comp1Difficulty') {
        valA = a.comp1DifficultyScore;
        valB = b.comp1DifficultyScore;
      } else if (sortField === 'comp2Difficulty') {
        valA = a.comp2DifficultyScore;
        valB = b.comp2DifficultyScore;
      } else if (sortField === 'difficultyDelta') {
        valA = a.difficultyScoreDelta;
        valB = b.difficultyScoreDelta;
      } else if (sortField === 'comp1R1R2') {
        valA = a.comp1R1Difficulty + a.comp1R2Difficulty;
        valB = b.comp1R1Difficulty + b.comp1R2Difficulty;
      } else if (sortField === 'comp2R1R2') {
        valA = a.comp2R1Difficulty + a.comp2R2Difficulty;
        valB = b.comp2R1Difficulty + b.comp2R2Difficulty;
      } else if (sortField === 'comp1Peak') {
        valA = a.comp1PeakPct;
        valB = b.comp1PeakPct;
      } else if (sortField === 'comp2Peak') {
        valA = a.comp2PeakPct;
        valB = b.comp2PeakPct;
      } else if (sortField === 'peakDelta') {
        valA = a.peakDelta;
        valB = b.peakDelta;
      } else if (sortField === 'comp1Floor') {
        valA = a.comp1FloorPct;
        valB = b.comp1FloorPct;
      } else if (sortField === 'comp2Floor') {
        valA = a.comp2FloorPct;
        valB = b.comp2FloorPct;
      } else if (sortField === 'floorDelta') {
        valA = a.floorDelta;
        valB = b.floorDelta;
      } else if (sortField === 'cohortRankDelta') {
        valA = a.cohortRankDelta;
        valB = b.cohortRankDelta;
      } else if (sortField === 'netOvertakes') {
        valA = a.overtookCount;
        valB = b.overtookCount;
      } else if (sortField === 'overtookList') {
        valA = a.overtookList.length;
        valB = b.overtookList.length;
      } else if (sortField === 'overtakenByList') {
        valA = a.overtakenByList.length;
        valB = b.overtakenByList.length;
      } else if (sortField === 'comp1FieldPercentile') {
        valA = a.comp1FieldPercentile;
        valB = b.comp1FieldPercentile;
      } else if (sortField === 'comp2FieldPercentile') {
        valA = a.comp2FieldPercentile;
        valB = b.comp2FieldPercentile;
      } else if (sortField === 'fieldPercentileDelta') {
        valA = a.fieldPercentileDelta;
        valB = b.fieldPercentileDelta;
      } else {
        // Default sort by Comp 2 Rank ascending
        return sortAsc ? a.comp2Rank - b.comp2Rank : b.comp2Rank - a.comp2Rank;
      }
      return sortAsc ? valA - valB : valB - valA;
    });

    return list;
  }, [comparison, searchQuery, sortField, sortAsc]);

  // Athletes ranked strictly by Progression Delta (Difficulty Gain descending)
  const deltaRankedAthletes = useMemo(() => {
    if (!comparison) return [];
    return [...comparison.progressions].sort(
      (a, b) => b.difficultyScoreDelta - a.difficultyScoreDelta || a.name.localeCompare(b.name)
    );
  }, [comparison]);

  const frederik = comparison?.frederikProgression;
  const topDifficulty = comparison?.topDifficultyImprover;
  const topPeak = comparison?.topPeakImprover;
  const topFloor = comparison?.topFloorImprover;
  const topOvertaker = comparison?.topOvertaker;

  // CSV Export handler
  const handleExportCSV = () => {
    if (!comparison || displayedProgressions.length === 0) return;
    const headers = [
      'Athlete',
      'Comp 1 Rank',
      'Comp 2 Rank',
      'Rank Change',
      'Comp 1 Difficulty %',
      'Comp 2 Difficulty %',
      'Difficulty Gain',
      'Comp 1 R1 Difficulty',
      'Comp 2 R1 Difficulty',
      'Comp 1 R2 Difficulty',
      'Comp 2 R2 Difficulty',
      'Comp 1 Peak %',
      'Comp 2 Peak %',
      'Peak Gain',
      'Comp 1 Floor %',
      'Comp 2 Floor %',
      'Floor Gain',
      'Net Overtakes',
      'Overtook Athletes',
      'Overtaken By Athletes',
      'Comp 1 Field %',
      'Comp 2 Field %',
      'Field Progression',
      'Primary Diagnostic'
    ];

    const rows = displayedProgressions.map(p => [
      `"${p.name}"`,
      p.comp1Rank,
      p.comp2Rank,
      p.rankDelta >= 0 ? `+${p.rankDelta}` : p.rankDelta,
      `${p.comp1DifficultyScore.toFixed(1)}%`,
      `${p.comp2DifficultyScore.toFixed(1)}%`,
      `${p.difficultyScoreDelta >= 0 ? '+' : ''}${p.difficultyScoreDelta.toFixed(1)}%`,
      `${p.comp1R1Difficulty.toFixed(1)}%`,
      `${p.comp2R1Difficulty.toFixed(1)}%`,
      `${p.comp1R2Difficulty.toFixed(1)}%`,
      `${p.comp2R2Difficulty.toFixed(1)}%`,
      `${p.comp1PeakPct.toFixed(1)}%`,
      `${p.comp2PeakPct.toFixed(1)}%`,
      `${p.peakDelta >= 0 ? '+' : ''}${p.peakDelta.toFixed(1)}%`,
      `${p.comp1FloorPct.toFixed(1)}%`,
      `${p.comp2FloorPct.toFixed(1)}%`,
      `${p.floorDelta >= 0 ? '+' : ''}${p.floorDelta.toFixed(1)}%`,
      p.netOvertakes >= 0 ? `+${p.netOvertakes}` : p.netOvertakes,
      `"${p.overtookList.join('; ')}"`,
      `"${p.overtakenByList.join('; ')}"`,
      `${p.comp1FieldPercentile.toFixed(1)}%`,
      `${p.comp2FieldPercentile.toFixed(1)}%`,
      `${p.fieldPercentileDelta >= 0 ? '+' : ''}${p.fieldPercentileDelta.toFixed(1)}%`,
      `"${p.primaryDiagnostic}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `qualification_analysis_${comp1.id}_vs_${comp2.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!competitions || competitions.length === 0) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center p-6 font-sans">
        <div className="max-w-md text-center bg-zinc-50 border border-zinc-300 p-8 rounded-xl shadow-sm">
          <Mountain className="w-12 h-12 text-black mx-auto mb-4" />
          <h1 className="text-xl font-bold">No Qualification Data Found</h1>
          <p className="text-zinc-600 text-sm mt-2">
            Add qualification CSV files to <code className="bg-zinc-200 px-2 py-1 rounded text-black font-mono">comp data/extracted/</code> to generate analysis.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans antialiased">
      <Head>
        <title>Competition Analysis | FRE2028</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-300">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-black text-white">
                FRE2028 Performance Lab
              </span>
              <span className="text-xs text-zinc-500 font-mono tracking-tight">Advanced Paraclimbing Analytics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black">
              Qualification Progression Intelligence
            </h1>
            <p className="text-zinc-600 text-sm mt-1 max-w-3xl">
              Hold difficulty weighted by field attrition (holds grabbed by everyone = 0 pts), with equal weighting across routes of different lengths.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-black hover:bg-zinc-800 text-white transition-colors shadow-sm"
            >
              Back to Website
            </Link>
          </div>
        </div>

        {/* Competition Pair Controls */}
        <div className="mt-6 p-5 rounded-xl bg-white border border-zinc-300 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Comp 1 */}
            <div className="md:col-span-5">
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" /> Base Event (Comp 1)
              </label>
              <select
                value={selectedComp1Id}
                onChange={e => setSelectedComp1Id(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-300 text-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black font-medium"
              >
                {competitions.map(c => (
                  <option key={`c1-${c.id}`} value={c.id}>
                    {c.date} • {c.name} ({c.athletes.length} climbers • Max: R1 {c.r1Stats.maxHold}, R2 {c.r2Stats.maxHold})
                  </option>
                ))}
              </select>
            </div>

            {/* Middle arrow */}
            <div className="md:col-span-2 flex justify-center pt-2 md:pt-4">
              <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-300 flex items-center justify-center text-black">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Comp 2 */}
            <div className="md:col-span-5">
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-black" /> Comparison Event (Comp 2)
              </label>
              <select
                value={selectedComp2Id}
                onChange={e => setSelectedComp2Id(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-300 text-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black font-medium"
              >
                {competitions.map(c => (
                  <option key={`c2-${c.id}`} value={c.id}>
                    {c.date} • {c.name} ({c.athletes.length} climbers • Max: R1 {c.r1Stats.maxHold}, R2 {c.r2Stats.maxHold})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Analytical Dimension Navigation Tabs (Directly under Comp Selection) */}
        <div className="mt-6">
          <div className="flex flex-wrap gap-2 border-b border-zinc-300 pb-2">
            <button
              onClick={() => { setActiveTab('difficultyWeighted'); setSortField('difficultyDelta'); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
                activeTab === 'difficultyWeighted'
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-300'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Hold Difficulty Index (Attrition Weighted)
            </button>

            <button
              onClick={() => { setActiveTab('peakFloor'); setSortField('peakDelta'); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
                activeTab === 'peakFloor'
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-300'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              Peak vs Floor (Ceiling & Consistency)
            </button>

            <button
              onClick={() => { setActiveTab('overtakes'); setSortField('comp2Rank'); setSortAsc(false); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
                activeTab === 'overtakes'
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-300'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              Head-to-Head Overtakes (Climbers Eclipsed)
            </button>

            <button
              onClick={() => { setActiveTab('fieldPercentile'); setSortField('fieldPercentileDelta'); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
                activeTab === 'fieldPercentile'
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-300'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Field Percentile (Outperformed Field %)
            </button>
          </div>
        </div>

        {/* Methodology Explanation Banner (Replaces KPI cards) */}
        <div className="mt-4 p-5 rounded-xl bg-white border border-zinc-300 shadow-sm">
          {activeTab === 'difficultyWeighted' && (
            <div className="space-y-4">
              {/* Header & Core Meaning */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-zinc-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-black">
                    <Zap className="w-4 h-4 text-black" />
                    How the Hold Difficulty Score Percentage (%) is Calculated & What It Means
                  </div>
                  <p className="text-xs text-zinc-700 leading-relaxed max-w-4xl">
                    The <strong>Difficulty Score %</strong> measures the <strong>exact percentage of total route crux difficulty conquered</strong> across both qualification routes in a competition.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] bg-zinc-50 p-2 rounded-lg border border-zinc-200 shrink-0">
                  <span className="px-2 py-1 bg-white border border-zinc-300 rounded font-bold text-black">
                    100% = Reached the Top High Point on Both Routes
                  </span>
                  <span className="px-2 py-1 bg-white border border-zinc-300 rounded text-zinc-600">
                    0% = Baseline Holds Only (Grabbed by all competitors)
                  </span>
                </div>
              </div>

              {/* Step-by-Step Calculation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-zinc-700">
                {/* Step 1 */}
                <div className="p-3.5 bg-zinc-50 rounded-lg border border-zinc-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-black text-xs">Step 1: Point Value Per Hold</span>
                      <span className="text-[10px] font-mono font-bold bg-zinc-200 text-zinc-800 px-1.5 py-0.5 rounded">Scarcity Weight</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-zinc-600 mb-2">
                      Each hold gets points equal to how many climbers it filtered out. Holds grabbed by everyone yield <strong>0 pts</strong>:
                    </p>
                    <div className="bg-white border border-zinc-300 rounded p-2 font-mono text-[11px] text-black font-semibold">
                      Hold Value V(h) = N - ClimbersReached(h)
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-zinc-500 font-mono">
                    • 20/20 grab hold 5 ➔ 0 pts<br />
                    • 3/20 grab hold 35 ➔ 17 pts (Crux)
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-3.5 bg-zinc-50 rounded-lg border border-zinc-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-black text-xs">Step 2: Route Normalization</span>
                      <span className="text-[10px] font-mono font-bold bg-zinc-200 text-zinc-800 px-1.5 py-0.5 rounded">0% to 100%</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-zinc-600 mb-2">
                      A climber's accumulated hold points divided by the maximum points achieved on that route:
                    </p>
                    <div className="bg-white border border-zinc-300 rounded p-2 font-mono text-[11px] text-black font-semibold">
                      Route % = (Climber Points / Max Points) × 100
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-zinc-500 font-mono">
                    • Equalizes short routes (e.g. 30 holds) with long routes (e.g. 50 holds).
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-3.5 bg-zinc-50 rounded-lg border border-zinc-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-black text-xs">Step 3: Comp Qualification Score</span>
                      <span className="text-[10px] font-mono font-bold bg-zinc-200 text-zinc-800 px-1.5 py-0.5 rounded">50 / 50 Average</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-zinc-600 mb-2">
                      The balanced arithmetic mean of both qualification routes:
                    </p>
                    <div className="bg-white border border-zinc-300 rounded p-2 font-mono text-[11px] text-black font-semibold">
                      Comp Score % = (Route 1% + Route 2%) / 2
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-zinc-500 font-mono">
                    • e.g. Frederik in Laval: (100% + 95.6%) / 2 = <strong className="text-black">97.8%</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'peakFloor' && (
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-black">
                  <Target className="w-4 h-4 text-black" />
                  Methodology: Peak Capacity vs Floor Consistency (Ceiling Analysis)
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed max-w-4xl">
                  Isolates an athlete's maximum physical reach (<strong className="text-black">Peak Ceiling = max(R1%, R2%)</strong>) from their minimum execution consistency (<strong className="text-black">Floor = min(R1%, R2%)</strong>). Raising the floor indicates the elimination of route-style vulnerabilities and flash slip errors.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-zinc-800 bg-zinc-50 p-2.5 rounded-lg border border-zinc-200 shrink-0">
                <div>
                  <span className="text-zinc-400 block text-[9px] uppercase">Ceiling</span>
                  <span className="font-bold text-black">max(R1%, R2%)</span>
                </div>
                <div className="border-l border-zinc-200 pl-2.5">
                  <span className="text-zinc-400 block text-[9px] uppercase">Floor</span>
                  <span className="font-bold text-black">min(R1%, R2%)</span>
                </div>
                <div className="border-l border-zinc-200 pl-2.5">
                  <span className="text-zinc-400 block text-[9px] uppercase">Asymmetry</span>
                  <span className="font-bold text-black">Peak - Floor</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'overtakes' && (
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-black">
                  <Swords className="w-4 h-4 text-black" />
                  Methodology: Head-to-Head Overtakes & Mutual Cohort Position Shift
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed max-w-4xl">
                  Tracks direct head-to-head competition shifts and named overtakes among athletes who attended both events. <strong className="text-black">H2H Shift</strong> measures movement within the mutual cohort (e.g. 6th ➔ 1st = +5), completely independent of total field size variations.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-zinc-800 bg-zinc-50 p-2.5 rounded-lg border border-zinc-200 shrink-0">
                <div>
                  <span className="text-zinc-400 block text-[9px] uppercase">Cohort Shift</span>
                  <span className="font-bold text-black">C1_Rank - C2_Rank</span>
                </div>
                <div className="border-l border-zinc-200 pl-2.5">
                  <span className="text-zinc-400 block text-[9px] uppercase">Overtakes</span>
                  <span className="font-bold text-black">Named Rank Passes</span>
                </div>
                <div className="border-l border-zinc-200 pl-2.5">
                  <span className="text-zinc-400 block text-[9px] uppercase">Field Basis</span>
                  <span className="font-bold text-black">Mutual Athletes Only</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fieldPercentile' && (
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-black">
                  <Activity className="w-4 h-4 text-black" />
                  Methodology: True Field Percentile (Outperformed Field %)
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed max-w-4xl">
                  Normalizes competition performance by calculating the exact percentage of the competitor field outperformed at each event: <code className="bg-white border px-1 py-0.5 rounded font-mono text-black">(N - Rank) / (N - 1) * 100%</code>. Rank 1 is always 100%, and last place is 0%.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-zinc-800 bg-zinc-50 p-2.5 rounded-lg border border-zinc-200 shrink-0">
                <div>
                  <span className="text-zinc-400 block text-[9px] uppercase">Formula</span>
                  <span className="font-bold text-black">(N-Rank)/(N-1)</span>
                </div>
                <div className="border-l border-zinc-200 pl-2.5">
                  <span className="text-zinc-400 block text-[9px] uppercase">Range</span>
                  <span className="font-bold text-black">0% - 100%</span>
                </div>
                <div className="border-l border-zinc-200 pl-2.5">
                  <span className="text-zinc-400 block text-[9px] uppercase">Delta</span>
                  <span className="font-bold text-black">Comp 2% - Comp 1%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* View Content Container */}
        <div className="mt-6 p-6 rounded-xl bg-white border border-zinc-300 shadow-sm">
          {/* Controls: Search & CSV Export */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200">
            <div>
              <h2 className="text-base font-bold text-black flex items-center gap-2">
                {activeTab === 'difficultyWeighted' && <>Attrition-Weighted Hold Difficulty (Equal Route Lengths)</>}
                {activeTab === 'peakFloor' && <>Peak Capacity vs Floor Consistency</>}
                {activeTab === 'overtakes' && <>Head-to-Head Overtake Matrix</>}
                {activeTab === 'fieldPercentile' && <>True Field Percentile Progression</>}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Comparing <span className="font-semibold text-black">{comp1.name}</span> ({comp1.date}) with <span className="font-semibold text-black">{comp2.name}</span> ({comp2.date}) • {displayedProgressions.length} mutual climbers
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Filter Search */}
              <div className="relative w-full sm:w-56">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter climber..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-300 text-black rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-black font-medium"
                />
              </div>

              {/* Download CSV */}
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-black border border-zinc-300 transition-colors shadow-sm whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5 text-black" />
                Export CSV
              </button>
            </div>
          </div>

          {/* TAB 1: DIFFICULTY WEIGHTED (ATTRITION BASED) VIEW */}
          {activeTab === 'difficultyWeighted' && (
            <>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-zinc-700 bg-zinc-100 uppercase font-bold border-b border-zinc-300 select-none">
                    <tr>
                      <th className="py-3 px-3 cursor-pointer group hover:text-black" onClick={() => handleSort('comp2Rank')}>
                        <span className="flex items-center gap-1"># {renderSortIcon('comp2Rank')}</span>
                      </th>
                      <th className="py-3 px-3 cursor-pointer group hover:text-black" onClick={() => handleSort('name')}>
                        <span className="flex items-center gap-1">Climber {renderSortIcon('name')}</span>
                      </th>
                      <th className="py-3 px-3 cursor-pointer group hover:text-black" onClick={() => handleSort('comp1Difficulty')}>
                        <span className="flex items-center gap-1">Comp 1 Difficulty {renderSortIcon('comp1Difficulty')}</span>
                      </th>
                      <th className="py-3 px-3 cursor-pointer group hover:text-black" onClick={() => handleSort('comp2Difficulty')}>
                        <span className="flex items-center gap-1">Comp 2 Difficulty {renderSortIcon('comp2Difficulty')}</span>
                      </th>
                      <th className="py-3 px-3 cursor-pointer group hover:text-black text-right" onClick={() => handleSort('difficultyDelta')}>
                        <span className="flex items-center justify-end gap-1">Δ Difficulty Gain {renderSortIcon('difficultyDelta')}</span>
                      </th>
                      <th className="py-3 px-3 cursor-pointer group hover:text-black text-center" onClick={() => handleSort('comp1R1R2')}>
                        <span className="flex items-center justify-center gap-1">Comp 1 (R1 / R2) {renderSortIcon('comp1R1R2')}</span>
                      </th>
                      <th className="py-3 px-3 cursor-pointer group hover:text-black text-center" onClick={() => handleSort('comp2R1R2')}>
                        <span className="flex items-center justify-center gap-1">Comp 2 (R1 / R2) {renderSortIcon('comp2R1R2')}</span>
                      </th>
                      <th className="py-3 px-3 cursor-pointer group hover:text-black" onClick={() => handleSort('diagnostic')}>
                        <span className="flex items-center gap-1">Primary Diagnostic {renderSortIcon('diagnostic')}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 font-mono">
                    {displayedProgressions.map((p, idx) => {
                      const isFre = p.isFrederik;
                      const isPos = p.difficultyScoreDelta >= 0;

                      return (
                        <tr
                          key={p.name}
                          className={`hover:bg-zinc-50 transition-colors ${
                            isFre ? 'bg-zinc-100 font-bold' : ''
                          }`}
                        >
                          <td className="py-3 px-3 text-zinc-400">{idx + 1}</td>
                          <td className="py-3 px-3 font-sans">
                            <span className={isFre ? 'font-black text-black' : 'text-zinc-900 font-medium'}>
                              {p.name}
                            </span>
                            {isFre && (
                              <span className="ml-2 px-1.5 py-0.2 rounded text-[10px] font-bold bg-black text-white font-mono">
                                BEL
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-zinc-600">
                            {p.comp1DifficultyScore.toFixed(1)}%
                          </td>
                          <td className="py-3 px-3 text-black font-semibold">
                            {p.comp2DifficultyScore.toFixed(1)}%
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-black text-sm">
                            {isPos ? `+${p.difficultyScoreDelta.toFixed(1)}%` : `${p.difficultyScoreDelta.toFixed(1)}%`}
                          </td>
                          <td className="py-3 px-3 text-center text-zinc-500">
                            {p.comp1R1Difficulty.toFixed(0)}% / {p.comp1R2Difficulty.toFixed(0)}%
                          </td>
                          <td className="py-3 px-3 text-center text-zinc-800 font-semibold">
                            {p.comp2R1Difficulty.toFixed(0)}% / {p.comp2R2Difficulty.toFixed(0)}%
                          </td>
                          <td className="py-3 px-3 font-sans text-[11px] text-zinc-700">
                            <span className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                              isFre ? 'bg-black text-white font-bold' : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                            }`}>
                              {p.primaryDiagnostic}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Difficulty Flow Transition Chart */}
              {difficultyFlowData && (
                <div className="mt-12 pt-8 border-t border-zinc-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-sm font-bold text-black uppercase tracking-wider flex items-center gap-2">
                        <Zap className="w-4 h-4 text-black" />
                        Hold Difficulty Progression Flow ({comp1?.name} ➔ {comp2?.name})
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        Tracking how each athlete climbed against route crux difficulty from {comp1?.name} to {comp2?.name}. Hover over any athlete to highlight their trajectory.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-600 bg-zinc-50 px-3 py-2 rounded-lg border border-zinc-200">
                      <span className="flex items-center gap-1.5 font-bold text-black">
                        <span className="w-3 h-1 bg-black rounded-full inline-block" /> Frederik Leys ({comparison?.frederikProgression?.comp1DifficultyScore.toFixed(1)}% ➔ {comparison?.frederikProgression?.comp2DifficultyScore.toFixed(1)}%, +{comparison?.frederikProgression?.difficultyScoreDelta.toFixed(1)}%)
                      </span>
                      <span className="flex items-center gap-1.5 text-zinc-800">
                        <span className="w-3 h-1 bg-zinc-800 rounded-full inline-block" /> Gained Difficulty %
                      </span>
                      <span className="flex items-center gap-1.5 text-zinc-400">
                        <span className="w-3 h-1 bg-zinc-300 rounded-full inline-block" /> Lower / Flat
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto bg-[#fafafa] rounded-xl border border-zinc-200 p-4">
                    <div className="min-w-[760px] max-w-[960px] mx-auto">
                      <svg
                        viewBox={`0 0 960 ${difficultyFlowData.totalHeight}`}
                        className="w-full h-auto select-none"
                      >
                        <defs>
                          <marker
                            id="flow-diff-arrow-fre"
                            viewBox="0 0 10 10"
                            refX="7"
                            refY="5"
                            markerWidth="6"
                            markerHeight="6"
                            orient="auto"
                          >
                            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#000000" />
                          </marker>
                          <marker
                            id="flow-diff-arrow-up"
                            viewBox="0 0 10 10"
                            refX="7"
                            refY="5"
                            markerWidth="5"
                            markerHeight="5"
                            orient="auto"
                          >
                            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#27272a" />
                          </marker>
                          <marker
                            id="flow-diff-arrow-down"
                            viewBox="0 0 10 10"
                            refX="7"
                            refY="5"
                            markerWidth="5"
                            markerHeight="5"
                            orient="auto"
                          >
                            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#a1a1aa" />
                          </marker>
                          <marker
                            id="flow-diff-arrow-neutral"
                            viewBox="0 0 10 10"
                            refX="7"
                            refY="5"
                            markerWidth="5"
                            markerHeight="5"
                            orient="auto"
                          >
                            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#d4d4d8" />
                          </marker>
                        </defs>

                        {/* Header Labels */}
                        <g>
                          <text x="20" y="24" fill="#000" fontSize="13" fontWeight="800" fontFamily="sans-serif">
                            {comp1?.name.toUpperCase()} DIFFICULTY SCORE
                          </text>
                          <text x="20" y="40" fill="#71717a" fontSize="11" fontFamily="monospace">
                            {comp1?.date} • Scarcity-Weighted Route Cruxes
                          </text>

                          <text x="480" y="28" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="700" fontFamily="monospace" letterSpacing="0.1em">
                            DIFFICULTY PROGRESSION FLOW ➔
                          </text>

                          <text x="940" y="24" textAnchor="end" fill="#000" fontSize="13" fontWeight="800" fontFamily="sans-serif">
                            {comp2?.name.toUpperCase()} DIFFICULTY SCORE
                          </text>
                          <text x="940" y="40" textAnchor="end" fill="#71717a" fontSize="11" fontFamily="monospace">
                            {comp2?.date} • Scarcity-Weighted Route Cruxes
                          </text>
                        </g>

                        {/* Background Curves (Non-Frederik & Non-Hovered) */}
                        <g>
                          {difficultyFlowData.lines
                            .filter(l => !l.athlete.isFrederik && l.athlete.name !== hoveredFlowAthlete)
                            .map(l => {
                              const isGained = l.athlete.difficultyScoreDelta > 0;
                              const isLost = l.athlete.difficultyScoreDelta < 0;
                              const isDimmed = hoveredFlowAthlete !== null && hoveredFlowAthlete !== l.athlete.name;

                              return (
                                <path
                                  key={l.athlete.name}
                                  d={l.pathD}
                                  fill="none"
                                  stroke={isGained ? '#3f3f46' : isLost ? '#a1a1aa' : '#d4d4d8'}
                                  strokeWidth={isGained ? 2.5 : 1.5}
                                  strokeDasharray={isLost ? '4 4' : 'none'}
                                  opacity={isDimmed ? 0.15 : isGained ? 0.8 : 0.5}
                                  markerEnd={isGained ? 'url(#flow-diff-arrow-up)' : isLost ? 'url(#flow-diff-arrow-down)' : 'url(#flow-diff-arrow-neutral)'}
                                  className="transition-all duration-200 cursor-pointer"
                                  onMouseEnter={() => setHoveredFlowAthlete(l.athlete.name)}
                                  onMouseLeave={() => setHoveredFlowAthlete(null)}
                                />
                              );
                            })}
                        </g>

                        {/* Highlighted Curve (Hovered Athlete if not Frederik) */}
                        <g>
                          {difficultyFlowData.lines
                            .filter(l => !l.athlete.isFrederik && l.athlete.name === hoveredFlowAthlete)
                            .map(l => (
                              <path
                                key={l.athlete.name}
                                d={l.pathD}
                                fill="none"
                                stroke="#000000"
                                strokeWidth={3.5}
                                opacity={1}
                                markerEnd="url(#flow-diff-arrow-fre)"
                                className="transition-all duration-200 cursor-pointer"
                              />
                            ))}
                        </g>

                        {/* Frederik Leys Curve (Always on top or highlighted) */}
                        <g>
                          {difficultyFlowData.lines
                            .filter(l => l.athlete.isFrederik)
                            .map(l => {
                              const isHovered = hoveredFlowAthlete === l.athlete.name;
                              const isOtherHovered = hoveredFlowAthlete !== null && !isHovered;

                              return (
                                <path
                                  key={l.athlete.name}
                                  d={l.pathD}
                                  fill="none"
                                  stroke="#000000"
                                  strokeWidth={isHovered ? 5 : 4}
                                  opacity={isOtherHovered ? 0.35 : 1}
                                  markerEnd="url(#flow-diff-arrow-fre)"
                                  className="transition-all duration-200 cursor-pointer drop-shadow-sm"
                                  onMouseEnter={() => setHoveredFlowAthlete(l.athlete.name)}
                                  onMouseLeave={() => setHoveredFlowAthlete(null)}
                                />
                              );
                            })}
                        </g>

                        {/* Left Side Athletes (Comp 1 Difficulty) */}
                        <g>
                          {difficultyFlowData.leftSorted.map((p, idx) => {
                            const isFre = p.isFrederik;
                            const isHovered = hoveredFlowAthlete === p.name;
                            const isDimmed = hoveredFlowAthlete !== null && !isHovered;
                            const y = difficultyFlowData.topOffset + idx * difficultyFlowData.rowHeight + 16;

                            return (
                              <g
                                key={`left-diff-${p.name}`}
                                className="cursor-pointer transition-all duration-200"
                                opacity={isDimmed ? 0.3 : 1}
                                onMouseEnter={() => setHoveredFlowAthlete(p.name)}
                                onMouseLeave={() => setHoveredFlowAthlete(null)}
                              >
                                {/* Card background */}
                                <rect
                                  x="15"
                                  y={y - 16}
                                  width="245"
                                  height="32"
                                  rx="6"
                                  fill={isFre ? '#000000' : isHovered ? '#f4f4f5' : '#ffffff'}
                                  stroke={isFre ? '#000000' : isHovered ? '#18181b' : '#e4e4e7'}
                                  strokeWidth={isFre || isHovered ? 1.5 : 1}
                                />
                                {/* Difficulty Score badge */}
                                <text
                                  x="26"
                                  y={y + 4}
                                  fill={isFre ? '#ffffff' : '#71717a'}
                                  fontSize="11"
                                  fontWeight="800"
                                  fontFamily="monospace"
                                >
                                  {p.comp1DifficultyScore.toFixed(1)}%
                                </text>
                                {/* Athlete Name */}
                                <text
                                  x="74"
                                  y={y + 4}
                                  fill={isFre ? '#ffffff' : '#18181b'}
                                  fontSize="11"
                                  fontWeight={isFre ? 800 : 600}
                                  fontFamily="sans-serif"
                                >
                                  {p.name.length > 18 ? `${p.name.slice(0, 17)}…` : p.name}
                                </text>
                                {/* BEL badge for Frederik */}
                                {isFre && (
                                  <rect x="212" y={y - 8} width="28" height="16" rx="3" fill="#ffffff" />
                                )}
                                {isFre && (
                                  <text x="226" y={y + 4} textAnchor="middle" fill="#000000" fontSize="9" fontWeight="900" fontFamily="monospace">
                                    BEL
                                  </text>
                                )}
                                {/* Anchor dot */}
                                <circle
                                  cx={difficultyFlowData.leftX}
                                  cy={y}
                                  r={isFre ? 4.5 : 3.5}
                                  fill={isFre ? '#000000' : isHovered ? '#18181b' : '#71717a'}
                                />
                              </g>
                            );
                          })}
                        </g>

                        {/* Right Side Athletes (Comp 2 Difficulty) */}
                        <g>
                          {difficultyFlowData.rightSorted.map((p, idx) => {
                            const isFre = p.isFrederik;
                            const isHovered = hoveredFlowAthlete === p.name;
                            const isDimmed = hoveredFlowAthlete !== null && !isHovered;
                            const y = difficultyFlowData.topOffset + idx * difficultyFlowData.rowHeight + 16;
                            const isGain = p.difficultyScoreDelta > 0;

                            return (
                              <g
                                key={`right-diff-${p.name}`}
                                className="cursor-pointer transition-all duration-200"
                                opacity={isDimmed ? 0.3 : 1}
                                onMouseEnter={() => setHoveredFlowAthlete(p.name)}
                                onMouseLeave={() => setHoveredFlowAthlete(null)}
                              >
                                {/* Anchor dot */}
                                <circle
                                  cx={difficultyFlowData.rightX}
                                  cy={y}
                                  r={isFre ? 4.5 : 3.5}
                                  fill={isFre ? '#000000' : isHovered ? '#18181b' : '#71717a'}
                                />
                                {/* Card background */}
                                <rect
                                  x={difficultyFlowData.rightX + 15}
                                  y={y - 16}
                                  width="240"
                                  height="32"
                                  rx="6"
                                  fill={isFre ? '#000000' : isHovered ? '#f4f4f5' : '#ffffff'}
                                  stroke={isFre ? '#000000' : isHovered ? '#18181b' : '#e4e4e7'}
                                  strokeWidth={isFre || isHovered ? 1.5 : 1}
                                />
                                {/* Difficulty Score badge */}
                                <text
                                  x={difficultyFlowData.rightX + 26}
                                  y={y + 4}
                                  fill={isFre ? '#ffffff' : '#000000'}
                                  fontSize="11"
                                  fontWeight="800"
                                  fontFamily="monospace"
                                >
                                  {p.comp2DifficultyScore.toFixed(1)}%
                                </text>
                                {/* Athlete Name */}
                                <text
                                  x={difficultyFlowData.rightX + 74}
                                  y={y + 4}
                                  fill={isFre ? '#ffffff' : '#18181b'}
                                  fontSize="11"
                                  fontWeight={isFre ? 800 : 600}
                                  fontFamily="sans-serif"
                                >
                                  {p.name.length > 15 ? `${p.name.slice(0, 14)}…` : p.name}
                                </text>
                                {/* Difficulty Gain Pill */}
                                <rect
                                  x={difficultyFlowData.rightX + 190}
                                  y={y - 8}
                                  width="55"
                                  height="16"
                                  rx="3"
                                  fill={
                                    isFre
                                      ? '#ffffff'
                                      : isGain
                                      ? '#18181b'
                                      : '#f4f4f5'
                                  }
                                />
                                <text
                                  x={difficultyFlowData.rightX + 217}
                                  y={y + 4}
                                  textAnchor="middle"
                                  fill={
                                    isFre
                                      ? '#000000'
                                      : isGain
                                      ? '#ffffff'
                                      : '#71717a'
                                  }
                                  fontSize="9"
                                  fontWeight="800"
                                  fontFamily="monospace"
                                >
                                  {isGain ? `+${p.difficultyScoreDelta.toFixed(1)}%` : `${p.difficultyScoreDelta.toFixed(1)}%`}
                                </text>
                              </g>
                            );
                          })}
                        </g>
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* DELTA PROGRESSION LEADERBOARD CHART */}
              {deltaRankedAthletes.length > 0 && (
                <div className="mt-12 pt-8 border-t border-zinc-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-sm font-bold text-black uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-black" />
                        Progression Delta Ranking: Who Improved the Most? ({comp1?.name} ➔ {comp2?.name})
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        Ranking all mutual competitors by their net difficulty gain (Δ%). Visualizing who made the biggest physical leaps between events.
                      </p>
                    </div>
                    {comparison?.topDifficultyImprover && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black text-white text-xs font-mono">
                        <Award className="w-3.5 h-3.5 text-white" />
                        <span>#1 Delta: <strong>{comparison.topDifficultyImprover.name}</strong> (+{comparison.topDifficultyImprover.difficultyScoreDelta.toFixed(1)}%)</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-[#fafafa] rounded-xl border border-zinc-200 p-5 overflow-x-auto">
                    <div className="min-w-[680px] space-y-2.5">
                      {deltaRankedAthletes.map((p, idx) => {
                        const isFre = p.isFrederik;
                        const isPos = p.difficultyScoreDelta >= 0;
                        const maxAbsDelta = 40; // Max visual scale %
                        const barWidthPct = Math.min(Math.abs(p.difficultyScoreDelta) / maxAbsDelta * 100, 100);

                        return (
                          <div
                            key={`delta-rank-${p.name}`}
                            className={`flex items-center justify-between gap-4 p-3 rounded-lg border transition-all ${
                              isFre
                                ? 'bg-zinc-900 text-white border-black shadow-sm'
                                : 'bg-white text-zinc-800 border-zinc-200 hover:border-zinc-300'
                            }`}
                          >
                            {/* Left: Rank & Athlete Name */}
                            <div className="flex items-center gap-3 w-60 shrink-0">
                              <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                                idx === 0
                                  ? isFre ? 'bg-white text-black' : 'bg-black text-white'
                                  : isFre ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-600'
                              }`}>
                                #{idx + 1}
                              </span>
                              <div className="truncate">
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-xs font-bold truncate ${isFre ? 'text-white' : 'text-zinc-900'}`}>
                                    {p.name}
                                  </span>
                                  {isFre && (
                                    <span className="px-1 py-0.2 rounded text-[9px] font-extrabold bg-white text-black font-mono">
                                      BEL
                                    </span>
                                  )}
                                </div>
                                <div className={`text-[10px] font-mono ${isFre ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                  {p.comp1DifficultyScore.toFixed(1)}% ➔ {p.comp2DifficultyScore.toFixed(1)}%
                                </div>
                              </div>
                            </div>

                            {/* Middle: Horizontal Delta Bar */}
                            <div className="flex-1 flex items-center gap-3">
                              <div className="flex-1 bg-zinc-100 h-4 rounded-full overflow-hidden flex items-center relative border border-zinc-200">
                                {isPos ? (
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      isFre ? 'bg-white' : 'bg-zinc-800'
                                    }`}
                                    style={{ width: `${barWidthPct}%` }}
                                  />
                                ) : (
                                  <div
                                    className="h-full rounded-full bg-zinc-300 transition-all duration-500 ml-auto"
                                    style={{ width: `${barWidthPct}%` }}
                                  />
                                )}
                              </div>
                              <span className={`w-16 text-right font-mono font-bold text-xs shrink-0 ${
                                isFre ? 'text-white' : isPos ? 'text-black' : 'text-zinc-400'
                              }`}>
                                {isPos ? `+${p.difficultyScoreDelta.toFixed(1)}%` : `${p.difficultyScoreDelta.toFixed(1)}%`}
                              </span>
                            </div>

                            {/* Right: Diagnostic Tag */}
                            <div className="w-52 shrink-0 text-right hidden sm:block">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-sans truncate max-w-full ${
                                isFre
                                  ? 'bg-zinc-800 text-zinc-200 border border-zinc-700 font-bold'
                                  : 'bg-zinc-50 text-zinc-600 border border-zinc-200'
                              }`}>
                                {p.primaryDiagnostic}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 2: PEAK VS FLOOR VIEW */}
          {activeTab === 'peakFloor' && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-zinc-700 bg-zinc-100 uppercase font-bold border-b border-zinc-300 select-none">
                  <tr>
                    <th className="py-3 px-3 cursor-pointer group hover:text-black" onClick={() => handleSort('comp2Rank')}>
                      <span className="flex items-center gap-1"># {renderSortIcon('comp2Rank')}</span>
                    </th>
                    <th className="py-3 px-3 cursor-pointer group hover:text-black" onClick={() => handleSort('name')}>
                      <span className="flex items-center gap-1">Climber {renderSortIcon('name')}</span>
                    </th>
                    <th className="py-3 px-3 cursor-pointer group hover:text-black" onClick={() => handleSort('comp1Peak')}>
                      <span className="flex items-center gap-1">Comp 1 Peak {renderSortIcon('comp1Peak')}</span>
                    </th>
                    <th className="py-3 px-3 cursor-pointer group hover:text-black" onClick={() => handleSort('comp2Peak')}>
                      <span className="flex items-center gap-1">Comp 2 Peak {renderSortIcon('comp2Peak')}</span>
                    </th>
                    <th className="py-3 px-3 cursor-pointer group hover:text-black text-right" onClick={() => handleSort('peakDelta')}>
                      <span className="flex items-center justify-end gap-1">Peak Gain (Ceiling) {renderSortIcon('peakDelta')}</span>
                    </th>
                    <th className="py-3 px-3 cursor-pointer group hover:text-black" onClick={() => handleSort('comp1Floor')}>
                      <span className="flex items-center gap-1">Comp 1 Floor {renderSortIcon('comp1Floor')}</span>
                    </th>
                    <th className="py-3 px-3 cursor-pointer group hover:text-black" onClick={() => handleSort('comp2Floor')}>
                      <span className="flex items-center gap-1">Comp 2 Floor {renderSortIcon('comp2Floor')}</span>
                    </th>
                    <th className="py-3 px-3 cursor-pointer group hover:text-black text-right" onClick={() => handleSort('floorDelta')}>
                      <span className="flex items-center justify-end gap-1">Floor Gain (Consistency) {renderSortIcon('floorDelta')}</span>
                    </th>
                    <th className="py-3 px-3 cursor-pointer group hover:text-black" onClick={() => handleSort('diagnostic')}>
                      <span className="flex items-center gap-1">Primary Diagnostic {renderSortIcon('diagnostic')}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 font-mono">
                  {displayedProgressions.map((p, idx) => {
                    const isFre = p.isFrederik;
                    const peakPos = p.peakDelta >= 0;
                    const floorPos = p.floorDelta >= 0;

                    return (
                      <tr
                        key={p.name}
                        className={`hover:bg-zinc-50 transition-colors ${
                          isFre ? 'bg-zinc-100 font-bold' : ''
                        }`}
                      >
                        <td className="py-3 px-3 text-zinc-400">{idx + 1}</td>
                        <td className="py-3 px-3 font-sans">
                          <span className={isFre ? 'font-black text-black' : 'text-zinc-900 font-medium'}>
                            {p.name}
                          </span>
                          {isFre && (
                            <span className="ml-2 px-1.5 py-0.2 rounded text-[10px] font-bold bg-black text-white font-mono">
                              BEL
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-zinc-600">{p.comp1PeakPct.toFixed(1)}%</td>
                        <td className="py-3 px-3 text-black font-semibold">{p.comp2PeakPct.toFixed(1)}%</td>
                        <td className="py-3 px-3 text-right font-bold text-black">
                          {peakPos ? `+${p.peakDelta.toFixed(1)}%` : `${p.peakDelta.toFixed(1)}%`}
                        </td>
                        <td className="py-3 px-3 text-zinc-600">{p.comp1FloorPct.toFixed(1)}%</td>
                        <td className="py-3 px-3 text-black font-semibold">{p.comp2FloorPct.toFixed(1)}%</td>
                        <td className="py-3 px-3 text-right font-bold text-black">
                          {floorPos ? `+${p.floorDelta.toFixed(1)}%` : `${p.floorDelta.toFixed(1)}%`}
                        </td>
                        <td className="py-3 px-3 font-sans text-[11px] text-zinc-700">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                            isFre ? 'bg-black text-white font-bold' : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                          }`}>
                            {p.primaryDiagnostic}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: OVERTAKES MATRIX */}
          {activeTab === 'overtakes' && (
            <>
              <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-zinc-700 bg-zinc-100 uppercase font-bold border-b border-zinc-300 select-none">
                  <tr>
                    <th className="py-3 px-3 cursor-pointer group hover:text-black" onClick={() => handleSort('comp2Rank')}>
                      <span className="flex items-center gap-1"># {renderSortIcon('comp2Rank')}</span>
                    </th>
                    <th className="py-3 px-3 cursor-pointer group hover:text-black" onClick={() => handleSort('name')}>
                      <span className="flex items-center gap-1">Climber {renderSortIcon('name')}</span>
                    </th>
                    <th className="py-3 px-3 cursor-pointer group hover:text-black" onClick={() => handleSort('comp1Rank')}>
                      <span className="flex items-center gap-1">Comp 1 Rank {renderSortIcon('comp1Rank')}</span>
                    </th>
                    <th className="py-3 px-3 cursor-pointer group hover:text-black" onClick={() => handleSort('comp2Rank')}>
                      <span className="flex items-center gap-1">Comp 2 Rank {renderSortIcon('comp2Rank')}</span>
                    </th>
                    <th className="py-3 px-3 cursor-pointer group hover:text-black text-right" onClick={() => handleSort('cohortRankDelta')}>
                      <span className="flex items-center justify-end gap-1" title="Mutual Field Shift (Independent of total competitor count)">H2H Shift {renderSortIcon('cohortRankDelta')}</span>
                    </th>
                    <th className="py-3 px-3 cursor-pointer group hover:text-black text-center" onClick={() => handleSort('netOvertakes')}>
                      <span className="flex items-center justify-center gap-1">Amount Eclipsed {renderSortIcon('netOvertakes')}</span>
                    </th>
                    <th className="py-3 px-3 cursor-pointer group hover:text-black" onClick={() => handleSort('overtookList')}>
                      <span className="flex items-center gap-1">Overtook (Eclipsed Athletes) {renderSortIcon('overtookList')}</span>
                    </th>
                    <th className="py-3 px-3 cursor-pointer group hover:text-black" onClick={() => handleSort('overtakenByList')}>
                      <span className="flex items-center gap-1">Overtaken By {renderSortIcon('overtakenByList')}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 font-mono">
                  {displayedProgressions.map((p, idx) => {
                    const isFre = p.isFrederik;
                    const hasOvertakes = p.overtookCount > 0;
                    const h2hPos = p.cohortRankDelta > 0;
                    const h2hNeg = p.cohortRankDelta < 0;

                    return (
                      <tr
                        key={p.name}
                        className={`hover:bg-zinc-50 transition-colors ${
                          isFre ? 'bg-zinc-100 font-bold' : ''
                        }`}
                      >
                        <td className="py-3 px-3 text-zinc-400">{idx + 1}</td>
                        <td className="py-3 px-3 font-sans">
                          <span className={isFre ? 'font-black text-black' : 'text-zinc-900 font-medium'}>
                            {p.name}
                          </span>
                          {isFre && (
                            <span className="ml-2 px-1.5 py-0.2 rounded text-[10px] font-bold bg-black text-white font-mono">
                              BEL
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-zinc-600">#{p.comp1Rank}</td>
                        <td className="py-3 px-3 text-black font-semibold">#{p.comp2Rank}</td>
                        <td className="py-3 px-3 text-right">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-mono font-bold ${
                            isFre ? 'bg-black text-white' : h2hPos ? 'bg-zinc-800 text-white' : h2hNeg ? 'bg-zinc-200 text-zinc-800' : 'text-zinc-400'
                          }`}>
                            {h2hPos ? `+${p.cohortRankDelta}` : p.cohortRankDelta === 0 ? '=' : p.cohortRankDelta}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded text-xs font-mono font-bold ${
                            hasOvertakes ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-400'
                          }`}>
                            {p.overtookCount}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-sans text-xs text-zinc-900 font-medium">
                          {p.overtookList.length > 0 ? (
                            <span>{p.overtookList.join('; ')}</span>
                          ) : (
                            <span className="text-zinc-400 italic">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-sans text-xs text-zinc-600">
                          {p.overtakenByList.length > 0 ? (
                            <span>{p.overtakenByList.join('; ')}</span>
                          ) : (
                            <span className="text-zinc-400 italic">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Flow Transition Chart */}
            {flowData && (
              <div className="mt-12 pt-8 border-t border-zinc-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-black uppercase tracking-wider flex items-center gap-2">
                      <Swords className="w-4 h-4 text-black" />
                      Head-to-Head Rank Transition Flow ({comp1?.name} ➔ {comp2?.name})
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      Visualizing head-to-head position shifts and overtakes from {comp1?.name} to {comp2?.name}. Hover over any athlete to highlight their trajectory.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-600 bg-zinc-50 px-3 py-2 rounded-lg border border-zinc-200">
                    <span className="flex items-center gap-1.5 font-bold text-black">
                      <span className="w-3 h-1 bg-black rounded-full inline-block" /> Frederik Leys (#{comparison?.frederikProgression?.comp1Rank} ➔ #{comparison?.frederikProgression?.comp2Rank})
                    </span>
                    <span className="flex items-center gap-1.5 text-zinc-800">
                      <span className="w-3 h-1 bg-zinc-800 rounded-full inline-block" /> Gained Rank
                    </span>
                    <span className="flex items-center gap-1.5 text-zinc-400">
                      <span className="w-3 h-1 bg-zinc-300 rounded-full inline-block" /> Lost / Stable
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto bg-[#fafafa] rounded-xl border border-zinc-200 p-4">
                  <div className="min-w-[760px] max-w-[960px] mx-auto">
                    <svg
                      viewBox={`0 0 960 ${flowData.totalHeight}`}
                      className="w-full h-auto select-none"
                    >
                      <defs>
                        <marker
                          id="flow-arrow-fre"
                          viewBox="0 0 10 10"
                          refX="7"
                          refY="5"
                          markerWidth="6"
                          markerHeight="6"
                          orient="auto"
                        >
                          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#000000" />
                        </marker>
                        <marker
                          id="flow-arrow-up"
                          viewBox="0 0 10 10"
                          refX="7"
                          refY="5"
                          markerWidth="5"
                          markerHeight="5"
                          orient="auto"
                        >
                          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#27272a" />
                        </marker>
                        <marker
                          id="flow-arrow-down"
                          viewBox="0 0 10 10"
                          refX="7"
                          refY="5"
                          markerWidth="5"
                          markerHeight="5"
                          orient="auto"
                        >
                          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#a1a1aa" />
                        </marker>
                        <marker
                          id="flow-arrow-neutral"
                          viewBox="0 0 10 10"
                          refX="7"
                          refY="5"
                          markerWidth="5"
                          markerHeight="5"
                          orient="auto"
                        >
                          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#d4d4d8" />
                        </marker>
                      </defs>

                      {/* Header Labels */}
                      <g>
                        <text x="20" y="24" fill="#000" fontSize="13" fontWeight="800" fontFamily="sans-serif">
                          {comp1?.name.toUpperCase()} RANKING
                        </text>
                        <text x="20" y="40" fill="#71717a" fontSize="11" fontFamily="monospace">
                          {comp1?.date} • {comp1?.athleteCount} Athletes
                        </text>

                        <text x="480" y="28" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="700" fontFamily="monospace" letterSpacing="0.1em">
                          RANK PROGRESSION FLOW ➔
                        </text>

                        <text x="940" y="24" textAnchor="end" fill="#000" fontSize="13" fontWeight="800" fontFamily="sans-serif">
                          {comp2?.name.toUpperCase()} RANKING
                        </text>
                        <text x="940" y="40" textAnchor="end" fill="#71717a" fontSize="11" fontFamily="monospace">
                          {comp2?.date} • {comp2?.athleteCount} Athletes
                        </text>
                      </g>

                      {/* Background Curves (Non-Frederik & Non-Hovered) */}
                      <g>
                        {flowData.lines
                          .filter(l => !l.athlete.isFrederik && l.athlete.name !== hoveredFlowAthlete)
                          .map(l => {
                            const isGained = l.athlete.rankDelta > 0;
                            const isLost = l.athlete.rankDelta < 0;
                            const isDimmed = hoveredFlowAthlete !== null && hoveredFlowAthlete !== l.athlete.name;

                            return (
                              <path
                                key={l.athlete.name}
                                d={l.pathD}
                                fill="none"
                                stroke={isGained ? '#3f3f46' : isLost ? '#a1a1aa' : '#d4d4d8'}
                                strokeWidth={isGained ? 2.5 : 1.5}
                                strokeDasharray={isLost ? '4 4' : 'none'}
                                opacity={isDimmed ? 0.15 : isGained ? 0.8 : 0.5}
                                markerEnd={isGained ? 'url(#flow-arrow-up)' : isLost ? 'url(#flow-arrow-down)' : 'url(#flow-arrow-neutral)'}
                                className="transition-all duration-200 cursor-pointer"
                                onMouseEnter={() => setHoveredFlowAthlete(l.athlete.name)}
                                onMouseLeave={() => setHoveredFlowAthlete(null)}
                              />
                            );
                          })}
                      </g>

                      {/* Highlighted Curve (Hovered Athlete if not Frederik) */}
                      <g>
                        {flowData.lines
                          .filter(l => !l.athlete.isFrederik && l.athlete.name === hoveredFlowAthlete)
                          .map(l => (
                            <path
                              key={l.athlete.name}
                              d={l.pathD}
                              fill="none"
                              stroke="#000000"
                              strokeWidth={3.5}
                              opacity={1}
                              markerEnd="url(#flow-arrow-fre)"
                              className="transition-all duration-200 cursor-pointer"
                            />
                          ))}
                      </g>

                      {/* Frederik Leys Curve (Always on top or highlighted) */}
                      <g>
                        {flowData.lines
                          .filter(l => l.athlete.isFrederik)
                          .map(l => {
                            const isHovered = hoveredFlowAthlete === l.athlete.name;
                            const isOtherHovered = hoveredFlowAthlete !== null && !isHovered;

                            return (
                              <path
                                key={l.athlete.name}
                                d={l.pathD}
                                fill="none"
                                stroke="#000000"
                                strokeWidth={isHovered ? 5 : 4}
                                opacity={isOtherHovered ? 0.35 : 1}
                                markerEnd="url(#flow-arrow-fre)"
                                className="transition-all duration-200 cursor-pointer drop-shadow-sm"
                                onMouseEnter={() => setHoveredFlowAthlete(l.athlete.name)}
                                onMouseLeave={() => setHoveredFlowAthlete(null)}
                              />
                            );
                          })}
                      </g>

                      {/* Left Side Athletes (Comp 1 Rank) */}
                      <g>
                        {flowData.leftSorted.map((p, idx) => {
                          const isFre = p.isFrederik;
                          const isHovered = hoveredFlowAthlete === p.name;
                          const isDimmed = hoveredFlowAthlete !== null && !isHovered;
                          const y = flowData.topOffset + idx * flowData.rowHeight + 16;

                          return (
                            <g
                              key={`left-${p.name}`}
                              className="cursor-pointer transition-all duration-200"
                              opacity={isDimmed ? 0.3 : 1}
                              onMouseEnter={() => setHoveredFlowAthlete(p.name)}
                              onMouseLeave={() => setHoveredFlowAthlete(null)}
                            >
                              {/* Card background */}
                              <rect
                                x="15"
                                y={y - 16}
                                width="245"
                                height="32"
                                rx="6"
                                fill={isFre ? '#000000' : isHovered ? '#f4f4f5' : '#ffffff'}
                                stroke={isFre ? '#000000' : isHovered ? '#18181b' : '#e4e4e7'}
                                strokeWidth={isFre || isHovered ? 1.5 : 1}
                              />
                              {/* Rank badge */}
                              <text
                                x="28"
                                y={y + 4}
                                fill={isFre ? '#ffffff' : '#71717a'}
                                fontSize="11"
                                fontWeight="800"
                                fontFamily="monospace"
                              >
                                #{p.comp1Rank}
                              </text>
                              {/* Athlete Name */}
                              <text
                                x="65"
                                y={y + 4}
                                fill={isFre ? '#ffffff' : '#18181b'}
                                fontSize="11"
                                fontWeight={isFre ? 800 : 600}
                                fontFamily="sans-serif"
                              >
                                {p.name.length > 20 ? `${p.name.slice(0, 19)}…` : p.name}
                              </text>
                              {/* BEL badge for Frederik */}
                              {isFre && (
                                <rect x="212" y={y - 8} width="28" height="16" rx="3" fill="#ffffff" />
                              )}
                              {isFre && (
                                <text x="226" y={y + 4} textAnchor="middle" fill="#000000" fontSize="9" fontWeight="900" fontFamily="monospace">
                                  BEL
                                </text>
                              )}
                              {/* Anchor dot */}
                              <circle
                                cx={flowData.leftX}
                                cy={y}
                                r={isFre ? 4.5 : 3.5}
                                fill={isFre ? '#000000' : isHovered ? '#18181b' : '#71717a'}
                              />
                            </g>
                          );
                        })}
                      </g>

                      {/* Right Side Athletes (Comp 2 Rank) */}
                      <g>
                        {flowData.rightSorted.map((p, idx) => {
                          const isFre = p.isFrederik;
                          const isHovered = hoveredFlowAthlete === p.name;
                          const isDimmed = hoveredFlowAthlete !== null && !isHovered;
                          const y = flowData.topOffset + idx * flowData.rowHeight + 16;

                          return (
                            <g
                              key={`right-${p.name}`}
                              className="cursor-pointer transition-all duration-200"
                              opacity={isDimmed ? 0.3 : 1}
                              onMouseEnter={() => setHoveredFlowAthlete(p.name)}
                              onMouseLeave={() => setHoveredFlowAthlete(null)}
                            >
                              {/* Anchor dot */}
                              <circle
                                cx={flowData.rightX}
                                cy={y}
                                r={isFre ? 4.5 : 3.5}
                                fill={isFre ? '#000000' : isHovered ? '#18181b' : '#71717a'}
                              />
                              {/* Card background */}
                              <rect
                                x={flowData.rightX + 15}
                                y={y - 16}
                                width="240"
                                height="32"
                                rx="6"
                                fill={isFre ? '#000000' : isHovered ? '#f4f4f5' : '#ffffff'}
                                stroke={isFre ? '#000000' : isHovered ? '#18181b' : '#e4e4e7'}
                                strokeWidth={isFre || isHovered ? 1.5 : 1}
                              />
                              {/* Rank badge */}
                              <text
                                x={flowData.rightX + 28}
                                y={y + 4}
                                fill={isFre ? '#ffffff' : '#000000'}
                                fontSize="11"
                                fontWeight="800"
                                fontFamily="monospace"
                              >
                                #{p.comp2Rank}
                              </text>
                              {/* Athlete Name */}
                              <text
                                x={flowData.rightX + 62}
                                y={y + 4}
                                fill={isFre ? '#ffffff' : '#18181b'}
                                fontSize="11"
                                fontWeight={isFre ? 800 : 600}
                                fontFamily="sans-serif"
                              >
                                {p.name.length > 17 ? `${p.name.slice(0, 16)}…` : p.name}
                              </text>
                              {/* Head-to-Head Cohort Shift Pill */}
                              <rect
                                x={flowData.rightX + 215}
                                y={y - 8}
                                width="30"
                                height="16"
                                rx="3"
                                fill={
                                  isFre
                                    ? '#ffffff'
                                    : p.cohortRankDelta > 0
                                    ? '#18181b'
                                    : p.cohortRankDelta < 0
                                    ? '#e4e4e7'
                                    : '#f4f4f5'
                                }
                              />
                              <text
                                x={flowData.rightX + 230}
                                y={y + 4}
                                textAnchor="middle"
                                fill={
                                  isFre
                                    ? '#000000'
                                    : p.cohortRankDelta > 0
                                    ? '#ffffff'
                                    : p.cohortRankDelta < 0
                                    ? '#52525b'
                                    : '#a1a1aa'
                                }
                                fontSize="9"
                                fontWeight="800"
                                fontFamily="monospace"
                              >
                                {p.cohortRankDelta > 0 ? `+${p.cohortRankDelta}` : p.cohortRankDelta === 0 ? '=' : p.cohortRankDelta}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

          {/* TAB 4: FIELD PERCENTILE VIEW */}
          {activeTab === 'fieldPercentile' && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-zinc-700 bg-zinc-100 uppercase font-bold border-b border-zinc-300 select-none">
                  <tr>
                    <th className="py-3 px-3 cursor-pointer group hover:text-black" onClick={() => handleSort('comp2Rank')}>
                      <span className="flex items-center gap-1"># {renderSortIcon('comp2Rank')}</span>
                    </th>
                    <th className="py-3 px-3 cursor-pointer group hover:text-black" onClick={() => handleSort('name')}>
                      <span className="flex items-center gap-1">Climber {renderSortIcon('name')}</span>
                    </th>
                    <th className="py-3 px-3 cursor-pointer group hover:text-black" onClick={() => handleSort('comp1Rank')}>
                      <span className="flex items-center gap-1">Comp 1 Rank {renderSortIcon('comp1Rank')}</span>
                    </th>
                    <th className="py-3 px-3 cursor-pointer group hover:text-black" onClick={() => handleSort('comp2Rank')}>
                      <span className="flex items-center gap-1">Comp 2 Rank {renderSortIcon('comp2Rank')}</span>
                    </th>
                    <th className="py-3 px-3 cursor-pointer group hover:text-black text-right" onClick={() => handleSort('rankDelta')}>
                      <span className="flex items-center justify-end gap-1">Rank Change {renderSortIcon('rankDelta')}</span>
                    </th>
                    <th className="py-3 px-3 cursor-pointer group hover:text-black" onClick={() => handleSort('comp1FieldPercentile')}>
                      <span className="flex items-center gap-1">Comp 1 Outperformed {renderSortIcon('comp1FieldPercentile')}</span>
                    </th>
                    <th className="py-3 px-3 cursor-pointer group hover:text-black" onClick={() => handleSort('comp2FieldPercentile')}>
                      <span className="flex items-center gap-1">Comp 2 Outperformed {renderSortIcon('comp2FieldPercentile')}</span>
                    </th>
                    <th className="py-3 px-3 cursor-pointer group hover:text-black text-right" onClick={() => handleSort('fieldPercentileDelta')}>
                      <span className="flex items-center justify-end gap-1">True Competitive Progression {renderSortIcon('fieldPercentileDelta')}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 font-mono">
                  {displayedProgressions.map((p, idx) => {
                    const isFre = p.isFrederik;
                    const isPos = p.fieldPercentileDelta >= 0;

                    return (
                      <tr
                        key={p.name}
                        className={`hover:bg-zinc-50 transition-colors ${
                          isFre ? 'bg-zinc-100 font-bold' : ''
                        }`}
                      >
                        <td className="py-3 px-3 text-zinc-400">{idx + 1}</td>
                        <td className="py-3 px-3 font-sans">
                          <span className={isFre ? 'font-black text-black' : 'text-zinc-900 font-medium'}>
                            {p.name}
                          </span>
                          {isFre && (
                            <span className="ml-2 px-1.5 py-0.2 rounded text-[10px] font-bold bg-black text-white font-mono">
                              BEL
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-zinc-600">#{p.comp1Rank} (of {comp1.athleteCount})</td>
                        <td className="py-3 px-3 text-black font-semibold">#{p.comp2Rank} (of {comp2.athleteCount})</td>
                        <td className="py-3 px-3 text-right font-bold text-black">
                          {p.rankDelta >= 0 ? `+${p.rankDelta}` : p.rankDelta}
                        </td>
                        <td className="py-3 px-3 text-zinc-600">{p.comp1FieldPercentile.toFixed(1)}%</td>
                        <td className="py-3 px-3 text-black font-semibold">{p.comp2FieldPercentile.toFixed(1)}%</td>
                        <td className="py-3 px-3 text-right font-bold text-black text-sm">
                          {isPos ? `+${p.fieldPercentileDelta.toFixed(1)}%` : `${p.fieldPercentileDelta.toFixed(1)}%`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
