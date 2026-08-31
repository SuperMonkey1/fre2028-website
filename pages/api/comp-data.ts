import type { NextApiRequest, NextApiResponse } from 'next';
import { loadAllQualificationCompetitions } from '../../lib/comp-analysis-server';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const competitions = loadAllQualificationCompetitions();
    res.status(200).json({ success: true, competitions });
  } catch (error) {
    console.error('API Error in comp-data:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
}
