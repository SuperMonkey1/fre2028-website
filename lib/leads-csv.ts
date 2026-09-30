export interface LeadRecord {
  leadId: string;
  status: string;
  lastActionDate: string;
  personalConnection: string;
  language: string;
  salutation: string;
  name: string;
  company: string;
  email: string;
  notes: string;
}

export const CSV_HEADERS = [
  'Lead ID',
  'Status',
  'Datum Laatste Actie',
  'Persoonlijke Connectie',
  'Taal',
  'Formele Aanspreking',
  'Naam',
  'Bedrijf / Organisatie',
  'E-mailadres',
  'Opmerkingen / Bron'
];

/**
 * Robust RFC 4180 CSV Parser (Client & Server safe)
 * Handles commas inside quotes, escaped quotes (""), multiline values, and windows/unix line endings.
 */
export function parseCSV(csvText: string): LeadRecord[] {
  if (!csvText || !csvText.trim()) return [];

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  // Normalize line endings to \n
  const text = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped double quote
        currentField += '"';
        i++; // skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      currentRow.push(currentField.trim());
      currentField = '';
    } else if (char === '\n' && !inQuotes) {
      // Row separator
      currentRow.push(currentField.trim());
      if (currentRow.some(field => field.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  // Handle trailing row/field
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(field => field.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length === 0) return [];

  // Identify header indices
  const headerRow = rows[0].map(h => h.toLowerCase().trim());
  const dataRows = rows.slice(1);

  const getIdx = (candidates: string[], fallbackIdx: number): number => {
    for (const c of candidates) {
      const idx = headerRow.findIndex(h => h === c.toLowerCase() || h.includes(c.toLowerCase()));
      if (idx !== -1) return idx;
    }
    return fallbackIdx;
  };

  const idIdx = getIdx(['lead id', 'id', 'slug'], 0);
  const statusIdx = getIdx(['status'], 1);
  const dateIdx = getIdx(['datum laatste actie', 'datum', 'date', 'last action'], 2);
  const connIdx = getIdx(['persoonlijke connectie', 'connectie', 'connection'], 3);
  const langIdx = getIdx(['taal', 'language', 'lang'], 4);
  const salutationIdx = getIdx(['formele aanspreking', 'aanspreking', 'salutation'], 5);
  const nameIdx = getIdx(['naam', 'name', 'contact'], 6);
  const companyIdx = getIdx(['bedrijf / organisatie', 'bedrijf', 'organisatie', 'company'], 7);
  const emailIdx = getIdx(['e-mailadres', 'email', 'e-mail', 'mail'], 8);
  const notesIdx = getIdx(['opmerkingen / bron', 'opmerkingen', 'bron', 'notes', 'comments'], 9);

  return dataRows.map(row => {
    const getVal = (idx: number) => (row[idx] !== undefined ? row[idx] : '');
    return {
      leadId: getVal(idIdx),
      status: getVal(statusIdx) || 'Concept in Gmail',
      lastActionDate: getVal(dateIdx),
      personalConnection: getVal(connIdx),
      language: getVal(langIdx) || 'Nederlands',
      salutation: getVal(salutationIdx),
      name: getVal(nameIdx),
      company: getVal(companyIdx),
      email: getVal(emailIdx),
      notes: getVal(notesIdx),
    };
  }).filter(lead => lead.leadId || lead.name || lead.company);
}

/**
 * Escapes and formats a value according to RFC 4180 CSV standard.
 */
function escapeCSVField(val: string | undefined | null): string {
  if (val === undefined || val === null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Converts a list of LeadRecords into standard CSV text.
 */
export function serializeCSV(leads: LeadRecord[]): string {
  const headerLine = CSV_HEADERS.map(escapeCSVField).join(',');
  const lines = leads.map(lead => [
    escapeCSVField(lead.leadId),
    escapeCSVField(lead.status),
    escapeCSVField(lead.lastActionDate),
    escapeCSVField(lead.personalConnection),
    escapeCSVField(lead.language),
    escapeCSVField(lead.salutation),
    escapeCSVField(lead.name),
    escapeCSVField(lead.company),
    escapeCSVField(lead.email),
    escapeCSVField(lead.notes),
  ].join(','));

  return [headerLine, ...lines].join('\n') + '\n';
}
