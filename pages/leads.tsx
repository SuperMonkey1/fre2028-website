import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import {
  Mountain,
  Search,
  Filter,
  Download,
  Upload,
  Copy,
  Plus,
  Edit2,
  Trash2,
  Check,
  RotateCcw,
  Save,
  Send,
  Mail,
  Building2,
  User,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronDown,
  LayoutGrid,
  Table as TableIcon,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  HelpCircle,
  TrendingUp,
  Tag,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  FileSpreadsheet,
  X,
  FileText,
} from 'lucide-react';
import { LeadRecord, serializeCSV, parseCSV } from '../lib/leads-csv';
import { loadLeadsFromDisk } from '../lib/leads-csv-server';

interface LeadsPageProps {
  initialLeads: LeadRecord[];
}

export const getStaticProps: GetStaticProps<LeadsPageProps> = async () => {
  const initialLeads = loadLeadsFromDisk();
  return {
    props: {
      initialLeads: JSON.parse(JSON.stringify(initialLeads)),
    },
  };
};

const STATUS_OPTIONS = [
  'Concept in Gmail',
  'Verzonden',
  'In Gesprek',
  'Positief / Deal',
  'Opvolgen',
  'Gepland',
  'Bounced',
  'Niet contacteren',
  'Geen Match',
];

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string; dot: string; icon: any }> = {
  'Concept in Gmail': {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    icon: Clock,
  },
  'Verzonden': {
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    dot: 'bg-blue-600',
    icon: Send,
  },
  'In Gesprek': {
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
    dot: 'bg-purple-600',
    icon: MessageSquare,
  },
  'Positief / Deal': {
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dot: 'bg-emerald-600',
    icon: CheckCircle2,
  },
  'Opvolgen': {
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
    icon: RotateCcw,
  },
  'Gepland': {
    bg: 'bg-cyan-50',
    text: 'text-cyan-800',
    border: 'border-cyan-200',
    dot: 'bg-cyan-600',
    icon: Calendar,
  },
  'Bounced': {
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
    icon: AlertTriangle,
  },
  'Niet contacteren': {
    bg: 'bg-zinc-100',
    text: 'text-zinc-600',
    border: 'border-zinc-300',
    dot: 'bg-zinc-400',
    icon: XCircle,
  },
  'Geen Match': {
    bg: 'bg-zinc-100',
    text: 'text-zinc-500',
    border: 'border-zinc-300',
    dot: 'bg-zinc-400',
    icon: XCircle,
  },
};

const LOCAL_STORAGE_KEY = 'fre2028_leads_crm_v1';

export default function LeadsTrackerPage({ initialLeads }: LeadsPageProps) {
  const [leads, setLeads] = useState<LeadRecord[]>(initialLeads || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [langFilter, setLangFilter] = useState<string>('ALL');
  const [connectionOnly, setConnectionOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [sortField, setSortField] = useState<keyof LeadRecord>('company');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // UI modals and alerts
  const [editingLead, setEditingLead] = useState<LeadRecord | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSavingToDisk, setIsSavingToDisk] = useState(false);
  const [diskSyncStatus, setDiskSyncStatus] = useState<'idle' | 'synced' | 'dev-only' | 'error'>('idle');
  const [inlineEditingNotesId, setInlineEditingNotesId] = useState<string | null>(null);
  const [inlineNotesValue, setInlineNotesValue] = useState<string>('');

  // New Lead Form State
  const [newLeadForm, setNewLeadForm] = useState<Partial<LeadRecord>>({
    leadId: '',
    status: 'Concept in Gmail',
    lastActionDate: new Date().toISOString().split('T')[0],
    personalConnection: '',
    language: 'Nederlands',
    salutation: 'Geachte heer / mevrouw,',
    name: '',
    company: '',
    email: '',
    notes: '',
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLeads(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load leads from localStorage', e);
    }
  }, []);

  // Show toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Save changes locally and attempt to sync to disk via API
  const persistLeads = useCallback(async (updatedLeads: LeadRecord[], notify = true) => {
    setLeads(updatedLeads);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedLeads));
    } catch (e) {
      console.error('LocalStorage save error', e);
    }

    // Try syncing to API route in background
    try {
      setIsSavingToDisk(true);
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: updatedLeads }),
      });
      if (res.ok) {
        setDiskSyncStatus('synced');
        if (notify) showToast('Wijzigingen opgeslagen & gesynchroniseerd naar CSV op schijf!');
      } else {
        setDiskSyncStatus('dev-only');
        if (notify) showToast('Opgeslagen in browser! (API sync alleen beschikbaar in dev mode)');
      }
    } catch (e) {
      setDiskSyncStatus('dev-only');
      if (notify) showToast('Opgeslagen in lokale opslag');
    } finally {
      setIsSavingToDisk(false);
    }
  }, []);

  // Update a single lead
  const handleUpdateLead = (updatedLead: LeadRecord) => {
    const updated = leads.map(l => (l.leadId === updatedLead.leadId ? updatedLead : l));
    persistLeads(updated);
    setEditingLead(null);
  };

  // Quick inline status change
  const handleQuickStatusChange = (leadId: string, newStatus: string, autoUpdateDate = true) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const updated = leads.map(lead => {
      if (lead.leadId === leadId) {
        return {
          ...lead,
          status: newStatus,
          lastActionDate: autoUpdateDate ? todayStr : lead.lastActionDate,
        };
      }
      return lead;
    });
    persistLeads(updated);
    showToast(`Status bijgewerkt naar "${newStatus}"`);
  };

  // Delete lead
  const handleDeleteLead = (leadId: string) => {
    if (confirm(`Weet je zeker dat je lead "${leadId}" wilt verwijderen?`)) {
      const updated = leads.filter(l => l.leadId !== leadId);
      persistLeads(updated);
      showToast('Lead verwijderd');
    }
  };

  // Add new lead
  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.name && !newLeadForm.company) {
      alert('Vul minimaal een naam of bedrijf in.');
      return;
    }

    const generatedSlug =
      newLeadForm.leadId?.trim() ||
      `${(newLeadForm.company || newLeadForm.name || 'lead')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')}-${Date.now().toString().slice(-4)}`;

    const newLead: LeadRecord = {
      leadId: generatedSlug,
      status: newLeadForm.status || 'Concept in Gmail',
      lastActionDate: newLeadForm.lastActionDate || new Date().toISOString().split('T')[0],
      personalConnection: newLeadForm.personalConnection || '',
      language: newLeadForm.language || 'Nederlands',
      salutation: newLeadForm.salutation || 'Geachte heer / mevrouw,',
      name: newLeadForm.name || '',
      company: newLeadForm.company || '',
      email: newLeadForm.email || '',
      notes: newLeadForm.notes || '',
    };

    const updated = [newLead, ...leads];
    persistLeads(updated);
    setIsAddingNew(false);
    setNewLeadForm({
      leadId: '',
      status: 'Concept in Gmail',
      lastActionDate: new Date().toISOString().split('T')[0],
      personalConnection: '',
      language: 'Nederlands',
      salutation: 'Geachte heer / mevrouw,',
      name: '',
      company: '',
      email: '',
      notes: '',
    });
    showToast(`Nieuwe lead "${newLead.company || newLead.name}" toegevoegd!`);
  };

  // Reset to Disk Baseline
  const handleResetToBaseline = () => {
    if (confirm('Wil je alle lokale aanpassingen overschrijven met het originele CSV-bestand op schijf?')) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setLeads(initialLeads);
      persistLeads(initialLeads, false);
      showToast('Gereset naar baseline CSV data');
    }
  };

  // Download CSV
  const handleDownloadCSV = () => {
    const csvContent = serializeCSV(leads);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_tracking_status_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV-bestand gedownload!');
  };

  // Copy CSV to clipboard
  const handleCopyCSV = () => {
    const csvContent = serializeCSV(leads);
    navigator.clipboard.writeText(csvContent);
    showToast('Volledige CSV gekopieerd naar klembord!');
  };

  // Import CSV file
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      if (text) {
        try {
          const parsed = parseCSV(text);
          if (parsed.length > 0) {
            persistLeads(parsed);
            showToast(`${parsed.length} leads succesvol geïmporteerd uit CSV!`);
          } else {
            alert('Geen geldige leads gevonden in dit CSV bestand.');
          }
        } catch (err) {
          alert('Fout bij het parseren van het CSV bestand.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Sorting helper
  const handleSort = (field: keyof LeadRecord) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // KPI calculations
  const stats = useMemo(() => {
    const total = leads.length;
    const sent = leads.filter(l => l.status === 'Verzonden').length;
    const draft = leads.filter(l => l.status === 'Concept in Gmail').length;
    const inProgress = leads.filter(l => l.status === 'In Gesprek' || l.status === 'Opvolgen').length;
    const positive = leads.filter(l => l.status === 'Positief / Deal').length;
    const doNotContact = leads.filter(l => l.status === 'Niet contacteren' || l.status === 'Geen Match').length;
    const withConnection = leads.filter(l => l.personalConnection && l.personalConnection.trim() !== '').length;

    return {
      total,
      sent,
      draft,
      inProgress,
      positive,
      doNotContact,
      withConnection,
      sentPercentage: total > 0 ? Math.round((sent / total) * 100) : 0,
    };
  }, [leads]);

  // Filtered and sorted leads
  const filteredLeads = useMemo(() => {
    return leads
      .filter(lead => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = lead.name.toLowerCase().includes(q);
          const matchCompany = lead.company.toLowerCase().includes(q);
          const matchEmail = lead.email.toLowerCase().includes(q);
          const matchNotes = lead.notes.toLowerCase().includes(q);
          const matchConn = lead.personalConnection.toLowerCase().includes(q);
          const matchId = lead.leadId.toLowerCase().includes(q);
          if (!matchName && !matchCompany && !matchEmail && !matchNotes && !matchConn && !matchId) {
            return false;
          }
        }

        // Status filter
        if (statusFilter !== 'ALL' && lead.status !== statusFilter) {
          return false;
        }

        // Language filter
        if (langFilter !== 'ALL' && lead.language !== langFilter) {
          return false;
        }

        // Connection only filter
        if (connectionOnly && (!lead.personalConnection || lead.personalConnection.trim() === '')) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const valA = (a[sortField] || '').toLowerCase();
        const valB = (b[sortField] || '').toLowerCase();
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [leads, searchQuery, statusFilter, langFilter, connectionOnly, sortField, sortDirection]);

  // Kanban groups
  const kanbanColumns = useMemo(() => {
    return [
      { id: 'Concept in Gmail', title: 'Concept in Gmail', icon: Clock, count: leads.filter(l => l.status === 'Concept in Gmail').length },
      { id: 'Verzonden', title: 'Verzonden (Outreach)', icon: Send, count: leads.filter(l => l.status === 'Verzonden').length },
      { id: 'In Gesprek', title: 'In Gesprek', icon: MessageSquare, count: leads.filter(l => l.status === 'In Gesprek').length },
      { id: 'Positief / Deal', title: 'Positief / Deal', icon: CheckCircle2, count: leads.filter(l => l.status === 'Positief / Deal').length },
      { id: 'Opvolgen', title: 'Opvolgen', icon: RotateCcw, count: leads.filter(l => l.status === 'Opvolgen').length },
      { id: 'Niet contacteren', title: 'Niet contacteren / Closed', icon: XCircle, count: leads.filter(l => l.status === 'Niet contacteren' || l.status === 'Geen Match' || l.status === 'Bounced').length },
    ];
  }, [leads]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans">
      <Head>
        <title>Leads Tracking & Status Visualizer — FRE2028</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      {/* Top Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 border border-zinc-700 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-2 text-zinc-900 hover:opacity-80 transition-opacity">
              <Mountain className="w-6 h-6 text-black" />
              <span className="font-bold tracking-tight text-lg">FRE2028</span>
            </Link>
            <div className="h-5 w-[1px] bg-zinc-200 hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                  Sales CRM
                </span>
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900">
                  Leads Tracking Status
                </h1>
              </div>
              <p className="text-xs text-zinc-500 hidden md:block">
                Visualiseert & beheert <code className="text-zinc-700 font-mono bg-zinc-100 px-1 py-0.5 rounded">_sales/leads/leads_tracking_status.csv</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Link
              href="/admin/outreach"
              className="px-3 py-1.5 rounded text-xs font-semibold tracking-wide bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors flex items-center gap-1.5"
            >
              <TrendingUp className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden sm:inline">Naar</span> Outreach Suite
            </Link>
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded text-xs font-semibold tracking-wide bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
            >
              Admin Dashboard
            </Link>
            <button
              onClick={() => setIsAddingNew(true)}
              className="px-3.5 py-1.5 rounded text-xs font-bold tracking-wide bg-black text-white hover:bg-zinc-800 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Nieuwe Lead
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Stats Bar */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
            <div className="flex items-center justify-between text-zinc-500 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Totaal Leads</span>
              <FileSpreadsheet className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-2xl font-extrabold text-zinc-900">{stats.total}</div>
            <div className="text-xs text-zinc-500 mt-1">{stats.withConnection} met warme connectie</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
            <div className="flex items-center justify-between text-blue-600 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Verzonden</span>
              <Send className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-extrabold text-blue-900">{stats.sent}</div>
            <div className="text-xs text-blue-600/80 mt-1">{stats.sentPercentage}% van totaal</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
            <div className="flex items-center justify-between text-amber-600 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Concept in Gmail</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-amber-900">{stats.draft}</div>
            <div className="text-xs text-amber-700/80 mt-1">Klaar voor review</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
            <div className="flex items-center justify-between text-purple-600 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">In Gesprek</span>
              <MessageSquare className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-extrabold text-purple-900">{stats.inProgress}</div>
            <div className="text-xs text-purple-700/80 mt-1">Actieve onderhandeling</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
            <div className="flex items-center justify-between text-emerald-600 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Positief / Deal</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-900">{stats.positive}</div>
            <div className="text-xs text-emerald-700/80 mt-1">Sponsoring bevestigd</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
            <div className="flex items-center justify-between text-zinc-500 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Niet Contacteren</span>
              <XCircle className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-2xl font-extrabold text-zinc-700">{stats.doNotContact}</div>
            <div className="text-xs text-zinc-500 mt-1">Gesloten of gepasseerd</div>
          </div>
        </section>

        {/* Toolbar & Filters */}
        <section className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Zoek op naam, bedrijf, e-mail, opmerking..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-black focus:bg-white transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* View Switcher & Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap justify-between md:justify-end">
              {/* Table / Kanban toggle */}
              <div className="flex items-center bg-zinc-100 p-1 rounded-lg border border-zinc-200">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all ${
                    viewMode === 'table' ? 'bg-white text-black shadow-sm' : 'text-zinc-600 hover:text-black'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  Tabel
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all ${
                    viewMode === 'kanban' ? 'bg-white text-black shadow-sm' : 'text-zinc-600 hover:text-black'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  Pipeline
                </button>
              </div>

              {/* Data Actions */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleDownloadCSV}
                  title="Download bijgewerkte CSV"
                  className="p-2 text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg border border-zinc-200 flex items-center gap-1 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download CSV</span>
                </button>

                <button
                  onClick={handleCopyCSV}
                  title="Kopieer CSV naar klembord"
                  className="p-2 text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg border border-zinc-200 flex items-center gap-1 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">Kopieer</span>
                </button>

                <label
                  title="Importeer CSV bestand"
                  className="p-2 text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg border border-zinc-200 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Importeer</span>
                  <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
                </label>

                <button
                  onClick={handleResetToBaseline}
                  title="Herstel naar originele CSV"
                  className="p-2 text-xs text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Status & Category Pills */}
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-zinc-100 text-xs">
            <span className="font-semibold text-zinc-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>

            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-black text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Alles ({leads.length})
            </button>

            {STATUS_OPTIONS.map(status => {
              const count = leads.filter(l => l.status === status).length;
              if (count === 0 && statusFilter !== status) return null;
              const col = STATUS_COLORS[status] || { bg: 'bg-zinc-100', text: 'text-zinc-700' };

              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(statusFilter === status ? 'ALL' : status)}
                  className={`px-2.5 py-1 rounded-full font-medium transition-colors flex items-center gap-1.5 ${
                    statusFilter === status
                      ? 'bg-zinc-900 text-white shadow-sm'
                      : `${col.bg} ${col.text} hover:opacity-80`
                  }`}
                >
                  <span>{status}</span>
                  <span className="text-[10px] opacity-75 font-mono">({count})</span>
                </button>
              );
            })}

            <div className="h-4 w-[1px] bg-zinc-200 mx-1 hidden sm:block" />

            <button
              onClick={() => setConnectionOnly(!connectionOnly)}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors flex items-center gap-1 ${
                connectionOnly
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Warme Connecties ({stats.withConnection})</span>
            </button>

            <select
              value={langFilter}
              onChange={e => setLangFilter(e.target.value)}
              className="px-2 py-1 bg-zinc-50 border border-zinc-200 rounded-md text-xs font-medium text-zinc-700 focus:outline-none"
            >
              <option value="ALL">Alle talen</option>
              <option value="Nederlands">Nederlands</option>
              <option value="Engels">Engels</option>
            </select>
          </div>
        </section>

        {/* VIEW 1: TABLE VIEW */}
        {viewMode === 'table' && (
          <section className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4 cursor-pointer hover:text-black select-none" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-1">
                        <span>Contact & Bedrijf</span>
                        <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4 cursor-pointer hover:text-black select-none" onClick={() => handleSort('status')}>
                      <div className="flex items-center gap-1">
                        <span>Status</span>
                        <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4 cursor-pointer hover:text-black select-none" onClick={() => handleSort('lastActionDate')}>
                      <div className="flex items-center gap-1">
                        <span>Datum Actie</span>
                        <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4">Persoonlijke Connectie</th>
                    <th className="py-3.5 px-4">Opmerkingen & Notities</th>
                    <th className="py-3.5 px-4 text-right">Acties</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-zinc-500">
                        <div className="max-w-sm mx-auto space-y-2">
                          <HelpCircle className="w-8 h-8 text-zinc-300 mx-auto" />
                          <p className="font-semibold text-zinc-700">Geen leads gevonden</p>
                          <p className="text-xs text-zinc-500">
                            Geen resultaten voor de huidige zoekopdracht of filter.
                          </p>
                          <button
                            onClick={() => {
                              setSearchQuery('');
                              setStatusFilter('ALL');
                              setLangFilter('ALL');
                              setConnectionOnly(false);
                            }}
                            className="text-xs text-blue-600 hover:underline font-medium"
                          >
                            Wis alle filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map(lead => {
                      const statusStyle = STATUS_COLORS[lead.status] || {
                        bg: 'bg-zinc-100',
                        text: 'text-zinc-800',
                        border: 'border-zinc-200',
                        dot: 'bg-zinc-400',
                      };

                      const isEditingNotes = inlineEditingNotesId === lead.leadId;

                      return (
                        <tr key={lead.leadId} className="hover:bg-zinc-50/80 transition-colors group">
                          {/* Contact & Company */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-zinc-900 text-sm flex items-center gap-1.5">
                              {lead.name}
                              {lead.language === 'Engels' && (
                                <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">
                                  EN
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-zinc-600 font-medium flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3 text-zinc-400 shrink-0" />
                              <span>{lead.company}</span>
                            </div>
                            {lead.email && (
                              <div className="text-[11px] text-zinc-400 hover:text-zinc-700 flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3 shrink-0" />
                                <a
                                  href={`mailto:${lead.email}?subject=Partnerschap Road to LA 2028 — Frederik Leys&body=${encodeURIComponent(
                                    lead.salutation ? `${lead.salutation}\n\n` : ''
                                  )}`}
                                  className="truncate max-w-[200px] hover:underline"
                                >
                                  {lead.email}
                                </a>
                              </div>
                            )}
                          </td>

                          {/* Inline Status Dropdown */}
                          <td className="py-3.5 px-4">
                            <div className="relative inline-block">
                              <select
                                value={lead.status}
                                onChange={e => handleQuickStatusChange(lead.leadId, e.target.value)}
                                className={`text-xs font-semibold py-1.5 pl-3 pr-7 rounded-lg border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-black/10 transition-all ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                              >
                                {STATUS_OPTIONS.map(opt => (
                                  <option key={opt} value={opt} className="bg-white text-zinc-900">
                                    {opt}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                            </div>
                          </td>

                          {/* Date of Last Action */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="text-xs font-mono text-zinc-700 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                              <span>{lead.lastActionDate || '—'}</span>
                            </div>
                          </td>

                          {/* Personal Connection */}
                          <td className="py-3.5 px-4 max-w-[220px]">
                            {lead.personalConnection ? (
                              <div className="text-xs text-amber-900 bg-amber-50/80 border border-amber-200/80 rounded-md p-2 flex items-start gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                <span className="line-clamp-2 leading-relaxed">{lead.personalConnection}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-zinc-400 italic">Geen connectie</span>
                            )}
                          </td>

                          {/* Notes / Comments (with quick inline edit) */}
                          <td className="py-3.5 px-4 max-w-[280px]">
                            {isEditingNotes ? (
                              <div className="space-y-1.5">
                                <textarea
                                  value={inlineNotesValue}
                                  onChange={e => setInlineNotesValue(e.target.value)}
                                  className="w-full text-xs p-2 border border-black rounded bg-white focus:outline-none min-h-[60px]"
                                  autoFocus
                                />
                                <div className="flex items-center gap-1 justify-end">
                                  <button
                                    onClick={() => setInlineEditingNotesId(null)}
                                    className="px-2 py-1 text-[11px] font-medium text-zinc-600 hover:text-black rounded"
                                  >
                                    Annuleer
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleUpdateLead({ ...lead, notes: inlineNotesValue });
                                      setInlineEditingNotesId(null);
                                    }}
                                    className="px-2.5 py-1 text-[11px] font-bold bg-black text-white rounded hover:bg-zinc-800"
                                  >
                                    Opslaan
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                onClick={() => {
                                  setInlineEditingNotesId(lead.leadId);
                                  setInlineNotesValue(lead.notes || '');
                                }}
                                title="Klik om notitie direct aan te passen"
                                className="cursor-pointer group/note hover:bg-zinc-100 p-1.5 rounded -m-1.5 transition-colors"
                              >
                                {lead.notes ? (
                                  <p className="text-xs text-zinc-700 line-clamp-2 leading-relaxed">
                                    {lead.notes}
                                  </p>
                                ) : (
                                  <p className="text-xs text-zinc-400 italic flex items-center gap-1">
                                    <Plus className="w-3 h-3" /> Voeg opmerking toe...
                                  </p>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              {lead.email && (
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(lead.email);
                                    showToast(`E-mail ${lead.email} gekopieerd!`);
                                  }}
                                  title="Kopieer e-mailadres"
                                  className="p-1.5 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-md transition-colors"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => setEditingLead(lead)}
                                title="Volledige lead bewerken"
                                className="p-1.5 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded-md transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteLead(lead.leadId)}
                                title="Lead verwijderen"
                                className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
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

            {/* Table Footer Summary */}
            <div className="bg-zinc-50 px-4 py-3 border-t border-zinc-200 text-xs text-zinc-500 flex flex-wrap items-center justify-between gap-2">
              <div>
                Getoond: <span className="font-semibold text-zinc-800">{filteredLeads.length}</span> van{' '}
                <span className="font-semibold text-zinc-800">{leads.length}</span> leads
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-zinc-400">
                  Tip: klik op een status dropdown of opmerking om direct aan te passen
                </span>
              </div>
            </div>
          </section>
        )}

        {/* VIEW 2: KANBAN PIPELINE VIEW */}
        {viewMode === 'kanban' && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
            {kanbanColumns.map(column => {
              const colLeads = filteredLeads.filter(lead => {
                if (column.id === 'Niet contacteren') {
                  return lead.status === 'Niet contacteren' || lead.status === 'Geen Match' || lead.status === 'Bounced';
                }
                return lead.status === column.id;
              });

              const colStyle = STATUS_COLORS[column.id] || {
                bg: 'bg-zinc-50',
                border: 'border-zinc-200',
                text: 'text-zinc-800',
                dot: 'bg-zinc-400',
              };

              const Icon = column.icon;

              return (
                <div key={column.id} className="bg-zinc-100/70 rounded-xl p-3 border border-zinc-200/80 flex flex-col min-h-[300px]">
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-zinc-200">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${colStyle.dot}`} />
                      <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800 truncate">
                        {column.title}
                      </h2>
                    </div>
                    <span className="text-xs font-mono font-bold bg-white text-zinc-700 px-2 py-0.5 rounded-full shadow-sm border border-zinc-200">
                      {colLeads.length}
                    </span>
                  </div>

                  {/* Cards List */}
                  <div className="space-y-2.5 flex-1">
                    {colLeads.length === 0 ? (
                      <div className="py-8 text-center text-zinc-400 text-xs italic">Geen leads</div>
                    ) : (
                      colLeads.map(lead => (
                        <div
                          key={lead.leadId}
                          onClick={() => setEditingLead(lead)}
                          className="bg-white p-3 rounded-lg border border-zinc-200 shadow-sm hover:shadow-md hover:border-zinc-400 transition-all cursor-pointer space-y-2 group"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <h3 className="font-bold text-xs text-zinc-900 leading-snug group-hover:text-black">
                              {lead.name}
                            </h3>
                            {lead.language === 'Engels' && (
                              <span className="text-[9px] font-bold bg-blue-50 text-blue-700 px-1 py-0.2 rounded border border-blue-100 shrink-0">
                                EN
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-zinc-600 flex items-center gap-1 font-medium truncate">
                            <Building2 className="w-3 h-3 text-zinc-400 shrink-0" />
                            <span className="truncate">{lead.company}</span>
                          </div>

                          {lead.personalConnection && (
                            <div className="text-[11px] text-amber-900 bg-amber-50 p-1.5 rounded border border-amber-200/60 leading-tight">
                              <span className="font-semibold">Connectie: </span>
                              <span className="line-clamp-2">{lead.personalConnection}</span>
                            </div>
                          )}

                          {lead.notes && (
                            <p className="text-[11px] text-zinc-500 line-clamp-2 italic leading-relaxed">
                              {lead.notes}
                            </p>
                          )}

                          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400">
                            <span className="font-mono">{lead.lastActionDate || 'Geen datum'}</span>
                            <span className="text-zinc-600 font-semibold group-hover:underline">Bewerken &rarr;</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </main>

      {/* FULL EDIT LEAD MODAL */}
      {editingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-zinc-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingLead(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Lead Bewerken</span>
              <h2 className="text-xl font-extrabold text-zinc-900 mt-1">
                {editingLead.name} — {editingLead.company}
              </h2>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">ID: {editingLead.leadId}</p>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                handleUpdateLead(editingLead);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    Naam Contactpersoon
                  </label>
                  <input
                    type="text"
                    value={editingLead.name}
                    onChange={e => setEditingLead({ ...editingLead, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-black focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    Bedrijf / Organisatie
                  </label>
                  <input
                    type="text"
                    value={editingLead.company}
                    onChange={e => setEditingLead({ ...editingLead, company: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-black focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    Status
                  </label>
                  <select
                    value={editingLead.status}
                    onChange={e => setEditingLead({ ...editingLead, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-black focus:bg-white font-medium"
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    Datum Laatste Actie
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={editingLead.lastActionDate}
                      onChange={e => setEditingLead({ ...editingLead, lastActionDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-black focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setEditingLead({ ...editingLead, lastActionDate: new Date().toISOString().split('T')[0] })}
                      className="text-xs px-2 py-2 bg-zinc-100 hover:bg-zinc-200 rounded-lg font-medium whitespace-nowrap"
                    >
                      Vandaag
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    E-mailadres
                  </label>
                  <input
                    type="email"
                    value={editingLead.email}
                    onChange={e => setEditingLead({ ...editingLead, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-black focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    Taal
                  </label>
                  <select
                    value={editingLead.language}
                    onChange={e => setEditingLead({ ...editingLead, language: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-black focus:bg-white"
                  >
                    <option value="Nederlands">Nederlands</option>
                    <option value="Engels">Engels</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                  Formele Aanspreking
                </label>
                <input
                  type="text"
                  value={editingLead.salutation}
                  onChange={e => setEditingLead({ ...editingLead, salutation: e.target.value })}
                  placeholder="bv. Geachte heer Clijsters, / Dear Ms. Sheehan,"
                  className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-black focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                  Persoonlijke Connectie / Introductie
                </label>
                <input
                  type="text"
                  value={editingLead.personalConnection}
                  onChange={e => setEditingLead({ ...editingLead, personalConnection: e.target.value })}
                  placeholder="bv. Ex-werkgever / Doorverwezen door Tom Wolfs"
                  className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-black focus:bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600">
                    Opmerkingen / Bron / Statusverslag
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      const stamp = `[${today}] `;
                      setEditingLead({
                        ...editingLead,
                        notes: editingLead.notes ? `${editingLead.notes} ${stamp}` : stamp,
                      });
                    }}
                    className="text-[11px] text-blue-600 hover:underline font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Voeg datumstempel toe
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={editingLead.notes}
                  onChange={e => setEditingLead({ ...editingLead, notes: e.target.value })}
                  placeholder="Voeg opmerkingen, afspraken of statusupdates toe..."
                  className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-black focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => handleDeleteLead(editingLead.leadId)}
                  className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Verwijder Lead
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingLead(null)}
                    className="px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                  >
                    Annuleren
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-sm font-bold bg-black text-white hover:bg-zinc-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    Opslaan & Sluiten
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW LEAD MODAL */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-zinc-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddingNew(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                Nieuwe Prospect
              </span>
              <h2 className="text-xl font-extrabold text-zinc-900 mt-1">Nieuwe Lead Toevoegen</h2>
              <p className="text-xs text-zinc-500">
                Wordt direct toegevoegd aan de tracking status CSV.
              </p>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    Naam Contactpersoon *
                  </label>
                  <input
                    type="text"
                    value={newLeadForm.name}
                    onChange={e => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                    placeholder="bv. Jan Peeters"
                    className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-black focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    Bedrijf / Organisatie *
                  </label>
                  <input
                    type="text"
                    value={newLeadForm.company}
                    onChange={e => setNewLeadForm({ ...newLeadForm, company: e.target.value })}
                    placeholder="bv. Tech Innovators NV"
                    className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-black focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    Status
                  </label>
                  <select
                    value={newLeadForm.status}
                    onChange={e => setNewLeadForm({ ...newLeadForm, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-black focus:bg-white font-medium"
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    Datum Actie
                  </label>
                  <input
                    type="date"
                    value={newLeadForm.lastActionDate}
                    onChange={e => setNewLeadForm({ ...newLeadForm, lastActionDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-black focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    E-mailadres
                  </label>
                  <input
                    type="email"
                    value={newLeadForm.email}
                    onChange={e => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                    placeholder="directie@bedrijf.be"
                    className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-black focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    Taal
                  </label>
                  <select
                    value={newLeadForm.language}
                    onChange={e => setNewLeadForm({ ...newLeadForm, language: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-black focus:bg-white"
                  >
                    <option value="Nederlands">Nederlands</option>
                    <option value="Engels">Engels</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                  Formele Aanspreking
                </label>
                <input
                  type="text"
                  value={newLeadForm.salutation}
                  onChange={e => setNewLeadForm({ ...newLeadForm, salutation: e.target.value })}
                  placeholder="Geachte heer ..., / Beste ..."
                  className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-black focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                  Persoonlijke Connectie
                </label>
                <input
                  type="text"
                  value={newLeadForm.personalConnection}
                  onChange={e => setNewLeadForm({ ...newLeadForm, personalConnection: e.target.value })}
                  placeholder="bv. KU Leuven alumnus / Ontmoet op MindGate event"
                  className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-black focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                  Opmerkingen & Notities
                </label>
                <textarea
                  rows={3}
                  value={newLeadForm.notes}
                  onChange={e => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                  placeholder="Achtergrond, rol, interesse, opmerkingen..."
                  className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-black focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-black text-white hover:bg-zinc-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Lead Toevoegen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
