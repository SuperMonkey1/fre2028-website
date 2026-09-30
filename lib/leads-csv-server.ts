import fs from 'fs';
import path from 'path';
import { LeadRecord, parseCSV, serializeCSV } from './leads-csv';

/**
 * Server-side helper: reads the primary leads CSV from disk.
 */
export function loadLeadsFromDisk(): LeadRecord[] {
  const primaryPath = path.join(process.cwd(), '_sales', 'leads', 'leads_tracking_status.csv');
  const publicPath = path.join(process.cwd(), 'public', 'data', 'leads_tracking_status.csv');

  let filePathToRead = '';
  if (fs.existsSync(primaryPath)) {
    filePathToRead = primaryPath;
  } else if (fs.existsSync(publicPath)) {
    filePathToRead = publicPath;
  }

  if (!filePathToRead) {
    console.warn('Leads CSV file not found on disk at:', primaryPath);
    return [];
  }

  try {
    const content = fs.readFileSync(filePathToRead, 'utf-8');
    return parseCSV(content);
  } catch (err) {
    console.error('Error reading leads CSV file:', err);
    return [];
  }
}

/**
 * Server-side helper: writes updated leads records back to disk in both locations.
 */
export function saveLeadsToDisk(leads: LeadRecord[]): { success: boolean; error?: string } {
  const csvContent = serializeCSV(leads);
  const primaryPath = path.join(process.cwd(), '_sales', 'leads', 'leads_tracking_status.csv');
  const publicPath = path.join(process.cwd(), 'public', 'data', 'leads_tracking_status.csv');

  try {
    // Ensure directories exist
    const primaryDir = path.dirname(primaryPath);
    if (!fs.existsSync(primaryDir)) {
      fs.mkdirSync(primaryDir, { recursive: true });
    }

    const publicDir = path.dirname(publicPath);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(primaryPath, csvContent, 'utf-8');
    fs.writeFileSync(publicPath, csvContent, 'utf-8');

    return { success: true };
  } catch (err: any) {
    console.error('Error writing leads CSV to disk:', err);
    return { success: false, error: err?.message || String(err) };
  }
}
