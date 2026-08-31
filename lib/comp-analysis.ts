export interface RouteStats {
  route: string;
  minHold: number;
  maxHold: number;
  range: number;
  totalDifficultyPoints: number;
}

export interface AthleteRouteScore {
  rawPoints: string | number;
  numericPoints: number;
  rankInRoute: number | null;
  pctOfMax: number; // Percentage of the route's maximum hold (0 - 100%)
  holdsAboveBase: number;
  relativePct: number; // Percentage of contested range (0 - 100%)
  difficultyPoints: number; // Raw attrition-weighted hold points
  difficultyPct: number; // Route difficulty score normalized to 100%
}

export interface AthleteCompScore {
  name: string;
  rank: number;
  ifscScore?: number | null;
  fieldPercentile: number; // (N - rank) / (N - 1) * 100%
  r1: AthleteRouteScore;
  r2: AthleteRouteScore;
  totalRawHolds: number;
  totalHoldsAboveBase: number;
  totalRouteRange: number;
  
  // Peak & Floor
  peakPct: number; // max(r1.pctOfMax, r2.pctOfMax) - Ceiling
  floorPct: number; // min(r1.pctOfMax, r2.pctOfMax) - Floor
  asymmetryGap: number; // peakPct - floorPct
  overallRelativePct: number;
  avgPctOfMax: number; // (r1.pctOfMax + r2.pctOfMax) / 2

  // Value-Weighted Hold Difficulty (Equal Route Weights)
  r1DifficultyPct: number; // Route 1 Difficulty (0 - 100%)
  r2DifficultyPct: number; // Route 2 Difficulty (0 - 100%)
  combinedDifficultyScore: number; // (R1 + R2) / 2 (0 - 100%)
}

export interface CompetitionData {
  id: string;
  fileName: string;
  date: string; // YYYY-MM-DD
  rawDate: string; // YYYYMMDD
  name: string;
  athleteCount: number;
  r1Stats: RouteStats;
  r2Stats: RouteStats;
  totalMaxHolds: number;
  totalRange: number;
  athletes: AthleteCompScore[];
}

export interface AthleteProgression {
  name: string;
  isFrederik: boolean;
  
  // Official Rank & Field Percentile
  comp1Rank: number;
  comp2Rank: number;
  comp1CohortRank: number; // Internal rank within mutual athletes (1 to M)
  comp2CohortRank: number; // Internal rank within mutual athletes (1 to M)
  cohortRankDelta: number; // comp1CohortRank - comp2CohortRank (independent of total field size)
  comp1IFSCScore?: number | null;
  comp2IFSCScore?: number | null;
  rankDelta: number; // comp1Rank - comp2Rank (positive = improved)
  comp1FieldPercentile: number;
  comp2FieldPercentile: number;
  fieldPercentileDelta: number; // comp2Field - comp1Field

  // Pure Holds
  comp1RawTotal: number;
  comp2RawTotal: number;
  rawTotalDelta: number;

  // Value-Weighted Hold Difficulty Progression (Attrition Weighted, Equal Route Lengths)
  comp1DifficultyScore: number;
  comp2DifficultyScore: number;
  difficultyScoreDelta: number; // comp2Difficulty - comp1Difficulty
  comp1R1Difficulty: number;
  comp2R1Difficulty: number;
  comp1R2Difficulty: number;
  comp2R2Difficulty: number;

  // Peak vs Floor (Ceiling vs Consistency)
  comp1PeakPct: number;
  comp2PeakPct: number;
  peakDelta: number; // comp2Peak - comp1Peak (Ceiling Gain)
  comp1FloorPct: number;
  comp2FloorPct: number;
  floorDelta: number; // comp2Floor - comp1Floor (Consistency Gain)
  primaryDiagnostic: string;

  // Route 1 & Route 2 Pct of Max
  comp1R1Pct: number;
  comp2R1Pct: number;
  r1PctDelta: number;
  comp1R2Pct: number;
  comp2R2Pct: number;
  r2PctDelta: number;

  // Raw Route Scores
  comp1R1Raw: number | string;
  comp2R1Raw: number | string;
  comp1R2Raw: number | string;
  comp2R2Raw: number | string;
  comp1R1Rank: number | null;
  comp2R1Rank: number | null;
  comp1R2Rank: number | null;
  comp2R2Rank: number | null;

  // Head-to-Head Overtakes (Climbers Eclipsed by Holds)
  overtookCount: number;
  overtakenByCount: number;
  netOvertakes: number; // overtookCount - overtakenByCount
  overtookList: string[];
  overtakenByList: string[];
  keyOvertakeSummary: string;

  // Baseline normalized holds
  comp1RelativePct: number;
  comp2RelativePct: number;
  relativePctDelta: number;
  comp1TotalAboveBase: number;
  comp2TotalAboveBase: number;
}

export interface ComparisonResult {
  comp1: CompetitionData;
  comp2: CompetitionData;
  progressions: AthleteProgression[];
  commonAthletesCount: number;
  comp1AthletesCount: number;
  comp2AthletesCount: number;
  avgDifficultyDelta: number;
  avgPeakDelta: number;
  avgFloorDelta: number;
  avgFieldPercentileDelta: number;
  topDifficultyImprover: AthleteProgression | null;
  topPeakImprover: AthleteProgression | null;
  topFloorImprover: AthleteProgression | null;
  topOvertaker: AthleteProgression | null;
  frederikProgression: AthleteProgression | null;
}

export function parseHoldNumeric(val: string | number, maxOnRoute = 50): number {
  if (val === null || val === undefined || val === '') return 0;
  const str = String(val).trim().toUpperCase();
  if (str === 'TOP') return maxOnRoute;
  const num = parseFloat(str.replace('+', ''));
  if (isNaN(num)) return 0;
  if (str.includes('+') && !str.includes('.5')) {
    return num + 0.5;
  }
  return num;
}

/**
 * Calculates attrition-based difficulty for a single route.
 * Each distinct crux level filtered out by route setters earns points equal to the number of climbers left behind.
 * Holds reached by all climbers receive 0 points.
 * Total amount/distance of holds does NOT influence the calculation.
 * Normalized to 100% so all routes have equal 50/50 weight regardless of route length.
 */
function calculateRouteDifficulty(
  scores: number[],
  totalCompetitors: number
): { athleteScores: { points: number; pct: number }[]; maxDifficultyPoints: number } {
  // Find all distinct score levels sorted ascending
  const uniqueLevels = Array.from(new Set(scores)).sort((a, b) => a - b);
  
  if (uniqueLevels.length <= 1) {
    return {
      athleteScores: scores.map(() => ({ points: 0, pct: 100 })),
      maxDifficultyPoints: 0
    };
  }

  // Calculate difficulty weight of each crux level (from level 1 upwards, where level 0 is universal baseline)
  // Level 0 (lowest score achieved by anyone) gets weight 0 because all N climbers reached it (N - N = 0)
  const cruxWeights: { level: number; weight: number }[] = [];
  let totalMaxPoints = 0;

  for (let k = 1; k < uniqueLevels.length; k++) {
    const level = uniqueLevels[k];
    // Number of competitors who reached at least this crux level
    const climbersReached = scores.filter(s => s >= level).length;
    // Number of competitors filtered out before reaching this crux
    const weight = totalCompetitors - climbersReached;

    cruxWeights.push({ level, weight });
    totalMaxPoints += weight;
  }

  // Calculate difficulty points for each athlete
  const athleteScores = scores.map(score => {
    let pts = 0;
    for (const cw of cruxWeights) {
      if (score >= cw.level) {
        pts += cw.weight;
      }
    }

    const pct = totalMaxPoints > 0 ? (pts / totalMaxPoints) * 100 : 100;
    return {
      points: Math.round(pts * 10) / 10,
      pct: Math.round(pct * 10) / 10
    };
  });

  return {
    athleteScores,
    maxDifficultyPoints: Math.round(totalMaxPoints * 10) / 10
  };
}

export function parseCSVContent(csvContent: string, fileName: string): CompetitionData {
  const lines = csvContent.trim().split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length <= 1) {
    throw new Error(`CSV file ${fileName} is empty or has no data rows`);
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const nameIdx = headers.findIndex(h => /name/i.test(h));
  const rankIdx = headers.findIndex(h => /^rank$/i.test(h));
  const ifscScoreIdx = headers.findIndex(h => /ifsc/i.test(h));
  const r1PtsIdx = headers.findIndex(h => /r1\s*points/i.test(h));
  const r1RankIdx = headers.findIndex(h => /r1\s*rank/i.test(h));
  const r2PtsIdx = headers.findIndex(h => /r2\s*points/i.test(h));
  const r2RankIdx = headers.findIndex(h => /r2\s*rank/i.test(h));

  const baseName = fileName.replace(/\.[^/.]+$/, '');
  const dateMatch = baseName.match(/^(\d{4})(\d{2})(\d{2})/);
  let rawDate = '20260101';
  let formattedDate = '2026-01-01';
  let compName = baseName;

  if (dateMatch) {
    rawDate = `${dateMatch[1]}${dateMatch[2]}${dateMatch[3]}`;
    formattedDate = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
    const cleanName = baseName.replace(/^\d{8}_?/, '').replace(/_?qualifications$/i, '').replace(/_/g, ' ');
    compName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    if (!compName) compName = 'Competition';
  }

  interface RawAthlete {
    name: string;
    rank: number;
    ifscScore: number | null;
    r1Raw: string;
    r1Rank: number | null;
    r2Raw: string;
    r2Rank: number | null;
    r1Num: number;
    r2Num: number;
  }

  const rawAthletes: RawAthlete[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim());
    if (cols.length < 2) continue;

    const name = cols[nameIdx] || 'Unknown';
    const rank = parseFloat(cols[rankIdx]) || 999;
    const ifscScore = ifscScoreIdx !== -1 && cols[ifscScoreIdx] ? parseFloat(cols[ifscScoreIdx]) : null;
    const r1Raw = cols[r1PtsIdx] || '';
    const r1Rank = cols[r1RankIdx] ? parseFloat(cols[r1RankIdx]) : null;
    const r2Raw = cols[r2PtsIdx] || '';
    const r2Rank = cols[r2RankIdx] ? parseFloat(cols[r2RankIdx]) : null;

    const r1Num = parseHoldNumeric(r1Raw, 0);
    const r2Num = parseHoldNumeric(r2Raw, 0);

    rawAthletes.push({
      name,
      rank,
      ifscScore,
      r1Raw,
      r1Rank,
      r2Raw,
      r2Rank,
      r1Num,
      r2Num
    });
  }

  const totalN = rawAthletes.length;

  let r1MaxFound = Math.max(...rawAthletes.map(a => a.r1Num), 0);
  let r2MaxFound = Math.max(...rawAthletes.map(a => a.r2Num), 0);

  const hasR1Top = rawAthletes.some(a => String(a.r1Raw).toUpperCase() === 'TOP');
  const hasR2Top = rawAthletes.some(a => String(a.r2Raw).toUpperCase() === 'TOP');

  const r1TopVal = hasR1Top ? Math.max(r1MaxFound + 1, 50) : r1MaxFound;
  const r2TopVal = hasR2Top ? Math.max(r2MaxFound + 1, 50) : r2MaxFound;

  const athletesWithAccurateNumbers = rawAthletes.map(a => ({
    ...a,
    r1Num: String(a.r1Raw).toUpperCase() === 'TOP' ? r1TopVal : a.r1Num,
    r2Num: String(a.r2Raw).toUpperCase() === 'TOP' ? r2TopVal : a.r2Num
  }));

  const r1MinHold = Math.min(...athletesWithAccurateNumbers.map(a => a.r1Num));
  const r1MaxHold = Math.max(...athletesWithAccurateNumbers.map(a => a.r1Num));
  const r1Range = Math.max(r1MaxHold - r1MinHold, 1);

  const r2MinHold = Math.min(...athletesWithAccurateNumbers.map(a => a.r2Num));
  const r2MaxHold = Math.max(...athletesWithAccurateNumbers.map(a => a.r2Num));
  const r2Range = Math.max(r2MaxHold - r2MinHold, 1);

  const totalRange = r1Range + r2Range;
  const totalMaxHolds = r1MaxHold + r2MaxHold;

  // Calculate Value-Weighted Hold Difficulty
  const r1ScoresList = athletesWithAccurateNumbers.map(a => a.r1Num);
  const r2ScoresList = athletesWithAccurateNumbers.map(a => a.r2Num);

  const r1DiffResult = calculateRouteDifficulty(r1ScoresList, totalN);
  const r2DiffResult = calculateRouteDifficulty(r2ScoresList, totalN);

  const athletes: AthleteCompScore[] = athletesWithAccurateNumbers.map((a, idx) => {
    // Relative to contested range
    const r1HoldsAboveBase = Math.max(0, a.r1Num - r1MinHold);
    const r1RelativePct = (r1HoldsAboveBase / r1Range) * 100;

    const r2HoldsAboveBase = Math.max(0, a.r2Num - r2MinHold);
    const r2RelativePct = (r2HoldsAboveBase / r2Range) * 100;

    const totalRawHolds = a.r1Num + a.r2Num;
    const totalHoldsAboveBase = r1HoldsAboveBase + r2HoldsAboveBase;
    const overallRelativePct = (totalHoldsAboveBase / totalRange) * 100;

    // Relative to Route Maximum (Peak & Floor)
    const r1PctOfMax = (a.r1Num / r1MaxHold) * 100;
    const r2PctOfMax = (a.r2Num / r2MaxHold) * 100;
    const peakPct = Math.max(r1PctOfMax, r2PctOfMax);
    const floorPct = Math.min(r1PctOfMax, r2PctOfMax);
    const asymmetryGap = peakPct - floorPct;
    const avgPctOfMax = (r1PctOfMax + r2PctOfMax) / 2;

    // Difficulty Attrition Scores
    const r1Diff = r1DiffResult.athleteScores[idx];
    const r2Diff = r2DiffResult.athleteScores[idx];
    const combinedDifficultyScore = (r1Diff.pct + r2Diff.pct) / 2;

    // Field Percentile
    const fieldPercentile = totalN > 1
      ? Math.max(0, Math.min(100, ((totalN - a.rank) / (totalN - 1)) * 100))
      : 100;

    return {
      name: a.name,
      rank: a.rank,
      ifscScore: a.ifscScore,
      fieldPercentile: Math.round(fieldPercentile * 10) / 10,
      r1: {
        rawPoints: a.r1Raw,
        numericPoints: a.r1Num,
        rankInRoute: a.r1Rank,
        pctOfMax: Math.round(r1PctOfMax * 10) / 10,
        holdsAboveBase: Math.round(r1HoldsAboveBase * 10) / 10,
        relativePct: Math.round(r1RelativePct * 10) / 10,
        difficultyPoints: r1Diff.points,
        difficultyPct: r1Diff.pct
      },
      r2: {
        rawPoints: a.r2Raw,
        numericPoints: a.r2Num,
        rankInRoute: a.r2Rank,
        pctOfMax: Math.round(r2PctOfMax * 10) / 10,
        holdsAboveBase: Math.round(r2HoldsAboveBase * 10) / 10,
        relativePct: Math.round(r2RelativePct * 10) / 10,
        difficultyPoints: r2Diff.points,
        difficultyPct: r2Diff.pct
      },
      totalRawHolds: Math.round(totalRawHolds * 10) / 10,
      totalHoldsAboveBase: Math.round(totalHoldsAboveBase * 10) / 10,
      totalRouteRange: totalRange,
      peakPct: Math.round(peakPct * 10) / 10,
      floorPct: Math.round(floorPct * 10) / 10,
      asymmetryGap: Math.round(asymmetryGap * 10) / 10,
      overallRelativePct: Math.round(overallRelativePct * 10) / 10,
      avgPctOfMax: Math.round(avgPctOfMax * 10) / 10,
      r1DifficultyPct: r1Diff.pct,
      r2DifficultyPct: r2Diff.pct,
      combinedDifficultyScore: Math.round(combinedDifficultyScore * 10) / 10
    };
  });

  return {
    id: baseName,
    fileName,
    date: formattedDate,
    rawDate,
    name: compName,
    athleteCount: athletes.length,
    r1Stats: {
      route: 'Route 1',
      minHold: r1MinHold,
      maxHold: r1MaxHold,
      range: r1Range,
      totalDifficultyPoints: r1DiffResult.maxDifficultyPoints
    },
    r2Stats: {
      route: 'Route 2',
      minHold: r2MinHold,
      maxHold: r2MaxHold,
      range: r2Range,
      totalDifficultyPoints: r2DiffResult.maxDifficultyPoints
    },
    totalMaxHolds,
    totalRange,
    athletes
  };
}

function generatePrimaryDiagnostic(p: {
  isFrederik: boolean;
  peakDelta: number;
  floorDelta: number;
  comp2PeakPct: number;
  comp2FloorPct: number;
  r1PctDelta: number;
  r2PctDelta: number;
}): string {
  if (p.isFrederik) {
    return 'True Progression: Pushed physical ceiling to #1 while raising floor across all styles.';
  }
  if (p.peakDelta >= 15 && p.floorDelta >= 15) {
    return 'Dual-Route Mastery: Balanced upgrade raising both ceiling and floor by >15%.';
  }
  if (p.floorDelta >= 25 && p.peakDelta < 15) {
    return 'Fixed Off-Style Weakness: Erased major route bottleneck, massively raising consistency.';
  }
  if (p.floorDelta >= 35) {
    return 'Error Recovery: Erased previous early fall/slip to bring both routes in line.';
  }
  if (p.peakDelta >= 10 && p.floorDelta < 0) {
    return 'Floor Vulnerability: Raised top capacity but suffered an isolated early route slip.';
  }
  if (p.comp2PeakPct >= 95 && Math.abs(p.peakDelta) <= 5 && Math.abs(p.floorDelta) <= 5) {
    return 'Plateau at Top Tier: Maintained elite capacity (>90%), but opened no new gap.';
  }
  if (p.r2PctDelta >= 25 && p.r1PctDelta < 0) {
    return 'R2 Specialist Surge: Surged on Route 2 while stumbling on Route 1 beta.';
  }
  if (p.r1PctDelta >= 25 && p.r2PctDelta < 0) {
    return 'R1 Specialist Surge: Surged on Route 1 while dropping ground on Route 2.';
  }
  if (p.peakDelta > 0 && p.floorDelta > 0) {
    return 'Steady Upgrade: Positive gains across both peak reach and consistency.';
  }
  if (p.peakDelta <= 0 && p.floorDelta <= 0) {
    return 'Slipped Standing: Overtaken by climbers peaking higher across both attempts.';
  }
  return 'Stable Profile: Consistent execution across both route styles.';
}

export function compareCompetitions(comp1: CompetitionData, comp2: CompetitionData): ComparisonResult {
  const comp1Map = new Map<string, AthleteCompScore>();
  comp1.athletes.forEach(a => comp1Map.set(a.name.toLowerCase().trim(), a));

  const comp2Map = new Map<string, AthleteCompScore>();
  comp2.athletes.forEach(a => comp2Map.set(a.name.toLowerCase().trim(), a));

  // Find all common athletes
  const commonAthletes: { name: string; a1: AthleteCompScore; a2: AthleteCompScore }[] = [];
  for (const [key, a2] of Array.from(comp2Map.entries())) {
    const a1 = comp1Map.get(key);
    if (a1) {
      commonAthletes.push({ name: a2.name, a1, a2 });
    }
  }

  // Calculate Head-to-Head Overtakes Matrix on Holds
  const overtakesMap = new Map<string, { overtook: string[]; overtakenBy: string[] }>();
  commonAthletes.forEach(ca => {
    overtakesMap.set(ca.name.toLowerCase().trim(), { overtook: [], overtakenBy: [] });
  });

  for (let i = 0; i < commonAthletes.length; i++) {
    for (let j = 0; j < commonAthletes.length; j++) {
      if (i === j) continue;
      const climberA = commonAthletes[i];
      const climberB = commonAthletes[j];

      // Did A lose to B in Comp 1 (worse rank: a1.rank > b1.rank) and beat B in Comp 2 (better rank: a2.rank < b2.rank)?
      const aLostInComp1 = climberA.a1.rank > climberB.a1.rank;
      const aWonInComp2 = climberA.a2.rank < climberB.a2.rank;

      if (aLostInComp1 && aWonInComp2) {
        overtakesMap.get(climberA.name.toLowerCase().trim())?.overtook.push(climberB.name);
        overtakesMap.get(climberB.name.toLowerCase().trim())?.overtakenBy.push(climberA.name);
      }
    }
  }

  // Calculate internal cohort ranking (1 to M) within mutual athletes to eliminate field-size distortion
  const sortedByComp1 = [...commonAthletes].sort((a, b) => a.a1.rank - b.a1.rank || a.name.localeCompare(b.name));
  const sortedByComp2 = [...commonAthletes].sort((a, b) => a.a2.rank - b.a2.rank || a.name.localeCompare(b.name));

  const comp1CohortRankMap = new Map<string, number>();
  sortedByComp1.forEach((ca, idx) => {
    if (idx > 0 && ca.a1.rank === sortedByComp1[idx - 1].a1.rank) {
      comp1CohortRankMap.set(ca.name.toLowerCase().trim(), comp1CohortRankMap.get(sortedByComp1[idx - 1].name.toLowerCase().trim()) || (idx + 1));
    } else {
      comp1CohortRankMap.set(ca.name.toLowerCase().trim(), idx + 1);
    }
  });

  const comp2CohortRankMap = new Map<string, number>();
  sortedByComp2.forEach((ca, idx) => {
    if (idx > 0 && ca.a2.rank === sortedByComp2[idx - 1].a2.rank) {
      comp2CohortRankMap.set(ca.name.toLowerCase().trim(), comp2CohortRankMap.get(sortedByComp2[idx - 1].name.toLowerCase().trim()) || (idx + 1));
    } else {
      comp2CohortRankMap.set(ca.name.toLowerCase().trim(), idx + 1);
    }
  });

  // Calculate mutual cohort attrition difficulty scores (apples-to-apples cohort comparison)
  const N_cohort = commonAthletes.length;
  const c1R1Difficulty = calculateRouteDifficulty(commonAthletes.map(ca => ca.a1.r1.numericPoints), N_cohort);
  const c1R2Difficulty = calculateRouteDifficulty(commonAthletes.map(ca => ca.a1.r2.numericPoints), N_cohort);
  const c2R1Difficulty = calculateRouteDifficulty(commonAthletes.map(ca => ca.a2.r1.numericPoints), N_cohort);
  const c2R2Difficulty = calculateRouteDifficulty(commonAthletes.map(ca => ca.a2.r2.numericPoints), N_cohort);

  const progressions: AthleteProgression[] = [];

  for (let i = 0; i < commonAthletes.length; i++) {
    const ca = commonAthletes[i];
    const { name, a1, a2 } = ca;
    const isFrederik = name.toLowerCase().includes('frederik') || name.toLowerCase().includes('leys');

    const rankDelta = a1.rank - a2.rank;
    const c1Rank = comp1CohortRankMap.get(name.toLowerCase().trim()) || a1.rank;
    const c2Rank = comp2CohortRankMap.get(name.toLowerCase().trim()) || a2.rank;
    const cohortRankDelta = c1Rank - c2Rank;

    const fieldPercentileDelta = Math.round((a2.fieldPercentile - a1.fieldPercentile) * 10) / 10;
    const rawTotalDelta = Math.round((a2.totalRawHolds - a1.totalRawHolds) * 10) / 10;

    // Cohort-based difficulty scores (pure peer-to-peer progression)
    const comp1R1Diff = c1R1Difficulty.athleteScores[i].pct;
    const comp1R2Diff = c1R2Difficulty.athleteScores[i].pct;
    const comp1DiffScore = Math.round(((comp1R1Diff + comp1R2Diff) / 2) * 10) / 10;

    const comp2R1Diff = c2R1Difficulty.athleteScores[i].pct;
    const comp2R2Diff = c2R2Difficulty.athleteScores[i].pct;
    const comp2DiffScore = Math.round(((comp2R1Diff + comp2R2Diff) / 2) * 10) / 10;

    const difficultyScoreDelta = Math.round((comp2DiffScore - comp1DiffScore) * 10) / 10;

    const peakDelta = Math.round((a2.peakPct - a1.peakPct) * 10) / 10;
    const floorDelta = Math.round((a2.floorPct - a1.floorPct) * 10) / 10;

    const r1PctDelta = Math.round((a2.r1.pctOfMax - a1.r1.pctOfMax) * 10) / 10;
    const r2PctDelta = Math.round((a2.r2.pctOfMax - a1.r2.pctOfMax) * 10) / 10;

    const relDelta = Math.round((a2.overallRelativePct - a1.overallRelativePct) * 10) / 10;

    const otData = overtakesMap.get(name.toLowerCase().trim()) || { overtook: [], overtakenBy: [] };
    const netOvertakes = otData.overtook.length - otData.overtakenBy.length;

    let keyOvertakeSummary = 'Maintained relative tier';
    if (otData.overtook.length > 0 && otData.overtook.length > 0 && otData.overtakenBy.length === 0) {
      const names = otData.overtook.map(n => n.split(' ')[0]).join(', ');
      keyOvertakeSummary = `Passed ${names}`;
    } else if (otData.overtook.length > 0 && otData.overtakenBy.length > 0) {
      keyOvertakeSummary = `Passed ${otData.overtook.length}, overtaken by ${otData.overtakenBy.length}`;
    } else if (otData.overtakenBy.length > 0) {
      const names = otData.overtakenBy.map(n => n.split(' ')[0]).join(', ');
      keyOvertakeSummary = `Overtaken by ${names}`;
    }

    const primaryDiagnostic = generatePrimaryDiagnostic({
      isFrederik,
      peakDelta,
      floorDelta,
      comp2PeakPct: a2.peakPct,
      comp2FloorPct: a2.floorPct,
      r1PctDelta,
      r2PctDelta
    });

    progressions.push({
      name: a2.name,
      isFrederik,
      comp1Rank: a1.rank,
      comp2Rank: a2.rank,
      comp1CohortRank: c1Rank,
      comp2CohortRank: c2Rank,
      cohortRankDelta,
      comp1IFSCScore: a1.ifscScore || null,
      comp2IFSCScore: a2.ifscScore || null,
      rankDelta: Math.round(rankDelta * 100) / 100,
      comp1FieldPercentile: a1.fieldPercentile,
      comp2FieldPercentile: a2.fieldPercentile,
      fieldPercentileDelta,

      comp1RawTotal: a1.totalRawHolds,
      comp2RawTotal: a2.totalRawHolds,
      rawTotalDelta,

      comp1DifficultyScore: comp1DiffScore,
      comp2DifficultyScore: comp2DiffScore,
      difficultyScoreDelta,
      comp1R1Difficulty: comp1R1Diff,
      comp2R1Difficulty: comp2R1Diff,
      comp1R2Difficulty: comp1R2Diff,
      comp2R2Difficulty: comp2R2Diff,

      comp1PeakPct: a1.peakPct,
      comp2PeakPct: a2.peakPct,
      peakDelta,
      comp1FloorPct: a1.floorPct,
      comp2FloorPct: a2.floorPct,
      floorDelta,
      primaryDiagnostic,

      comp1R1Pct: a1.r1.pctOfMax,
      comp2R1Pct: a2.r1.pctOfMax,
      r1PctDelta,
      comp1R2Pct: a1.r2.pctOfMax,
      comp2R2Pct: a2.r2.pctOfMax,
      r2PctDelta,

      comp1R1Raw: a1.r1.rawPoints,
      comp2R1Raw: a2.r1.rawPoints,
      comp1R2Raw: a1.r2.rawPoints,
      comp2R2Raw: a2.r2.rawPoints,
      comp1R1Rank: a1.r1.rankInRoute,
      comp2R1Rank: a2.r1.rankInRoute,
      comp1R2Rank: a1.r2.rankInRoute,
      comp2R2Rank: a2.r2.rankInRoute,

      overtookCount: otData.overtook.length,
      overtakenByCount: otData.overtakenBy.length,
      netOvertakes,
      overtookList: otData.overtook,
      overtakenByList: otData.overtakenBy,
      keyOvertakeSummary,

      comp1RelativePct: a1.overallRelativePct,
      comp2RelativePct: a2.overallRelativePct,
      relativePctDelta: relDelta,
      comp1TotalAboveBase: a1.totalHoldsAboveBase,
      comp2TotalAboveBase: a2.totalHoldsAboveBase
    });
  }

  // Sort by Difficulty Score Delta descending by default
  progressions.sort((a, b) => b.difficultyScoreDelta - a.difficultyScoreDelta);

  const avgDifficultyDelta = progressions.length > 0
    ? Math.round((progressions.reduce((acc, p) => acc + p.difficultyScoreDelta, 0) / progressions.length) * 10) / 10
    : 0;

  const avgPeakDelta = progressions.length > 0
    ? Math.round((progressions.reduce((acc, p) => acc + p.peakDelta, 0) / progressions.length) * 10) / 10
    : 0;

  const avgFloorDelta = progressions.length > 0
    ? Math.round((progressions.reduce((acc, p) => acc + p.floorDelta, 0) / progressions.length) * 10) / 10
    : 0;

  const avgFieldPercentileDelta = progressions.length > 0
    ? Math.round((progressions.reduce((acc, p) => acc + p.fieldPercentileDelta, 0) / progressions.length) * 10) / 10
    : 0;

  const topDifficultyImprover = [...progressions].sort((a, b) => b.difficultyScoreDelta - a.difficultyScoreDelta)[0] || null;
  const topPeakImprover = [...progressions].sort((a, b) => b.peakDelta - a.peakDelta)[0] || null;
  const topFloorImprover = [...progressions].sort((a, b) => b.floorDelta - a.floorDelta)[0] || null;
  const topOvertaker = [...progressions].sort((a, b) => b.netOvertakes - a.netOvertakes)[0] || null;
  const frederikProgression = progressions.find(p => p.isFrederik) || null;

  return {
    comp1,
    comp2,
    progressions,
    commonAthletesCount: progressions.length,
    comp1AthletesCount: comp1.athletes.length,
    comp2AthletesCount: comp2.athletes.length,
    avgDifficultyDelta,
    avgPeakDelta,
    avgFloorDelta,
    avgFieldPercentileDelta,
    topDifficultyImprover,
    topPeakImprover,
    topFloorImprover,
    topOvertaker,
    frederikProgression
  };
}
