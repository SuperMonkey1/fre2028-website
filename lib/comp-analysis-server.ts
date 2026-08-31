import fs from 'fs';
import path from 'path';
import { CompetitionData, parseCSVContent } from './comp-analysis';

export function loadAllQualificationCompetitions(): CompetitionData[] {
  const extractedDir = path.join(process.cwd(), 'comp data', 'extracted');
  if (!fs.existsSync(extractedDir)) {
    return [];
  }

  const files = fs.readdirSync(extractedDir);
  const qualFiles = files.filter(f => f.toLowerCase().endsWith('qualifications.csv'));

  const competitions: CompetitionData[] = [];
  for (const file of qualFiles) {
    const fullPath = path.join(extractedDir, file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    try {
      const comp = parseCSVContent(content, file);
      competitions.push(comp);
    } catch (e) {
      console.error(`Error parsing ${file}:`, e);
    }
  }

  // Sort chronologically by date ascending
  competitions.sort((a, b) => a.rawDate.localeCompare(b.rawDate));
  return competitions;
}
