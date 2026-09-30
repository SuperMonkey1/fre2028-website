import fs from 'fs';
import path from 'path';

const TARGET_DIR = path.resolve(process.cwd(), '..', 'my_leads');
console.log('Regenerating my_leads with typed props and @lucide/svelte in:', TARGET_DIR);

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeFile(relPath, content) {
  const fullPath = path.join(TARGET_DIR, relPath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf-8');
  console.log('✓ Updated:', relPath);
}

// 1. Sidebar.svelte
writeFile('src/lib/components/Sidebar.svelte', `<script lang="ts">
	import { 
		LayoutDashboard, 
		KanbanSquare, 
		Table as TableIcon, 
		FolderGit2, 
		Plus, 
		ChevronDown, 
		Sparkles,
		Flame,
		CheckCircle2,
		X
	} from '@lucide/svelte';
	import { getProjectsList, getActiveProject, selectProject } from '$lib/stores/projects.svelte';
	import { getStats, loadLeads } from '$lib/stores/leads.svelte';
	import { page } from '$app/stores';

	interface Props {
		open?: boolean;
		onclose?: () => void;
		onopenNewLead?: () => void;
		onopenProjectModal?: () => void;
	}

	let { open = false, onclose, onopenNewLead, onopenProjectModal }: Props = $props();

	let projects = $derived(getProjectsList());
	let activeProject = $derived(getActiveProject());
	let stats = $derived(getStats());
	let projectDropdownOpen = $state(false);

	function handleSelectProject(id: string) {
		selectProject(id);
		projectDropdownOpen = false;
		loadLeads();
	}

	const navItems = [
		{ href: '/', label: 'Overview Dashboard', icon: LayoutDashboard },
		{ href: '/pipeline', label: 'Kanban Pipeline', icon: KanbanSquare },
		{ href: '/table', label: 'Data Grid Tabel', icon: TableIcon },
		{ href: '/projects', label: 'Projecten & CSVs', icon: FolderGit2 }
	];
</script>

<!-- Mobile backdrop -->
{#if open}
	<div
		class="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs transition-opacity cursor-pointer"
		onclick={() => onclose?.()}
		onkeydown={(e) => e.key === 'Escape' && onclose?.()}
		role="button"
		tabindex="0"
		aria-label="Sluit menu"
	></div>
{/if}

<aside
	class="fixed md:static inset-y-0 left-0 z-50 w-72 bg-white dark:bg-[#12141a] border-r border-zinc-200 dark:border-zinc-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 {open ? 'translate-x-0' : '-translate-x-full'}"
>
	<div>
		<!-- Logo & App Header -->
		<div class="h-16 px-6 border-b border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between">
			<div class="flex items-center gap-3">
				<div class="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
					<Flame class="w-5 h-5" />
				</div>
				<div>
					<span class="font-black tracking-tight text-lg leading-none block text-zinc-900 dark:text-white">
						My Leads
					</span>
					<span class="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
						Sales & CRM Tracker
					</span>
				</div>
			</div>
			<button class="md:hidden text-zinc-400 hover:text-white" onclick={() => onclose?.()}>
				<X class="w-5 h-5" />
			</button>
		</div>

		<!-- Project Selector Dropdown -->
		<div class="p-4 border-b border-zinc-200 dark:border-zinc-800/80 relative">
			<div class="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5 px-1 flex items-center justify-between">
				<span>Actief Project</span>
				<button onclick={() => onopenProjectModal?.()} class="text-amber-500 hover:underline font-semibold lowercase">
					+ nieuw
				</button>
			</div>

			<button
				onclick={() => (projectDropdownOpen = !projectDropdownOpen)}
				class="w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between text-left hover:border-amber-500/50 transition-all group"
			>
				<div class="flex items-center gap-2.5 min-w-0">
					<div
						class="w-3 h-3 rounded-full shrink-0"
						style="background-color: {activeProject?.color || '#f59e0b'}"
					></div>
					<span class="text-xs font-bold text-zinc-900 dark:text-white truncate">
						{activeProject?.name || 'Selecteer project...'}
					</span>
				</div>
				<ChevronDown class="w-4 h-4 text-zinc-400 group-hover:text-white shrink-0 transition-transform {projectDropdownOpen ? 'rotate-180' : ''}" />
			</button>

			<!-- Dropdown list -->
			{#if projectDropdownOpen}
				<div class="absolute left-4 right-4 top-[78px] z-50 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl py-1 divide-y divide-zinc-100 dark:divide-zinc-700/50">
					{#each projects as prj}
						<button
							onclick={() => handleSelectProject(prj.id)}
							class="w-full px-3 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-700/60 flex items-center justify-between text-xs transition-colors {activeProject?.id === prj.id ? 'bg-amber-50 dark:bg-amber-500/10 font-bold' : ''}"
						>
							<div class="flex items-center gap-2 truncate">
								<div class="w-2.5 h-2.5 rounded-full" style="background-color: {prj.color || '#f59e0b'}"></div>
								<span class="truncate text-zinc-800 dark:text-zinc-200">{prj.name}</span>
							</div>
							{#if prj.leadCount !== undefined}
								<span class="text-[10px] font-mono text-zinc-400">({prj.leadCount})</span>
							{/if}
						</button>
					{/each}
					<button
						onclick={() => { projectDropdownOpen = false; onopenProjectModal?.(); }}
						class="w-full px-3 py-2 text-left text-xs text-amber-600 dark:text-amber-400 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700/60 flex items-center gap-1.5"
					>
						<Plus class="w-3.5 h-3.5" />
						Voeg Project CSV toe...
					</button>
				</div>
			{/if}
		</div>

		<!-- Main Navigation -->
		<nav class="p-4 space-y-1.5">
			{#each navItems as item}
				{@const active = $page.url.pathname === item.href}
				{@const Icon = item.icon}
				<a
					href={item.href}
					onclick={() => onclose?.()}
					class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all {active
						? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
						: 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-white'}"
				>
					<Icon class="w-4 h-4" />
					<span>{item.label}</span>
				</a>
			{/each}
		</nav>

		<!-- Mini Stats Summary -->
		<div class="px-4 py-2">
			<div class="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800/60 space-y-2">
				<div class="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-400">
					<span>Pipeline Voortgang</span>
					<span class="font-mono text-amber-500">{stats.sentPercentage}%</span>
				</div>
				<div class="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
					<div class="bg-amber-500 h-full transition-all duration-500" style="width: {stats.sentPercentage}%"></div>
				</div>
				<div class="grid grid-cols-2 gap-2 pt-1 text-[11px]">
					<div class="text-zinc-500">Totaal: <strong class="text-zinc-900 dark:text-white">{stats.totalLeads}</strong></div>
					<div class="text-blue-500 font-semibold">Verzonden: <strong>{stats.sent}</strong></div>
					<div class="text-purple-500 font-semibold">In gesprek: <strong>{stats.inProgress}</strong></div>
					<div class="text-emerald-500 font-semibold">Deals: <strong>{stats.deals}</strong></div>
				</div>
			</div>
		</div>
	</div>

	<!-- Bottom Actions -->
	<div class="p-4 border-t border-zinc-200 dark:border-zinc-800/80">
		<button
			onclick={() => onopenNewLead?.()}
			class="w-full py-2.5 px-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-xl text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-sm"
		>
			<Plus class="w-4 h-4" />
			Nieuwe Lead Toevoegen
		</button>
	</div>
</aside>
`);

// 2. Header.svelte
writeFile('src/lib/components/Header.svelte', `<script lang="ts">
	import { 
		Menu, 
		Sun, 
		Moon, 
		Search, 
		RefreshCw, 
		FileSpreadsheet, 
		Plus, 
		AlertTriangle 
	} from '@lucide/svelte';
	import { getIsDark, toggleTheme } from '$lib/stores/theme.svelte';
	import { getActiveProject } from '$lib/stores/projects.svelte';
	import { getFilters, getIsLoading, getFileExists, getCsvPath, loadLeads } from '$lib/stores/leads.svelte';

	interface Props {
		ontoggleMobileMenu?: () => void;
		onopenNewLead?: () => void;
	}

	let { ontoggleMobileMenu, onopenNewLead }: Props = $props();

	let isDark = $derived(getIsDark());
	let activeProject = $derived(getActiveProject());
	let isLoading = $derived(getIsLoading());
	let fileExists = $derived(getFileExists());
	let csvPath = $derived(getCsvPath());
	let filters = getFilters();
</script>

<header class="h-16 px-4 md:px-8 bg-white dark:bg-[#12141a] border-b border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between gap-4 sticky top-0 z-30">
	<!-- Left: Mobile Toggle & Project Badge -->
	<div class="flex items-center gap-3">
		<button
			class="md:hidden p-2 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
			onclick={() => ontoggleMobileMenu?.()}
		>
			<Menu class="w-5 h-5" />
		</button>

		<div class="flex items-center gap-2">
			<span class="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30">
				{activeProject?.name || 'Project'}
			</span>

			{#if !fileExists}
				<span class="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900">
					<AlertTriangle class="w-3 h-3" /> CSV niet gevonden
				</span>
			{:else}
				<span class="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400 truncate max-w-[280px]" title={csvPath}>
					<FileSpreadsheet class="w-3 h-3 text-emerald-500 shrink-0" />
					<span class="truncate">{csvPath.split(/[/\\\\]/).pop()}</span>
				</span>
			{/if}
		</div>
	</div>

	<!-- Center: Search Input -->
	<div class="flex-1 max-w-md hidden sm:block">
		<div class="relative">
			<Search class="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
			<input
				type="text"
				placeholder="Zoek op naam, bedrijf, e-mail, opmerking..."
				bind:value={filters.search}
				class="w-full pl-9 pr-4 py-1.5 text-xs bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-amber-500 transition-colors"
			/>
		</div>
	</div>

	<!-- Right Actions -->
	<div class="flex items-center gap-2">
		<button
			onclick={() => loadLeads()}
			disabled={isLoading}
			title="Ververs CSV van schijf"
			class="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
		>
			<RefreshCw class="w-4 h-4 {isLoading ? 'animate-spin text-amber-500' : ''}" />
		</button>

		<button
			onclick={toggleTheme}
			title="Wissel Donker / Licht thema"
			class="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
		>
			{#if isDark}
				<Sun class="w-4 h-4 text-amber-400" />
			{:else}
				<Moon class="w-4 h-4 text-zinc-700" />
			{/if}
		</button>

		<button
			onclick={() => onopenNewLead?.()}
			class="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
		>
			<Plus class="w-4 h-4" />
			<span class="hidden sm:inline">Nieuwe Lead</span>
		</button>
	</div>
</header>
`);

// 3. LeadsTable.svelte
writeFile('src/lib/components/LeadsTable.svelte', `<script lang="ts">
	import { 
		Mail, 
		Building2, 
		Calendar, 
		Sparkles, 
		Edit2, 
		Trash2, 
		Copy, 
		ChevronDown, 
		Plus
	} from '@lucide/svelte';
	import type { LeadRecord } from '$lib/types';
	import { updateStatus, updateLead, deleteLead, showToast } from '$lib/stores/leads.svelte';

	interface Props {
		leads?: LeadRecord[];
		oneditLead?: (l: LeadRecord) => void;
	}

	let { leads = [], oneditLead }: Props = $props();

	const STATUS_OPTIONS = [
		'Concept in Gmail',
		'Verzonden',
		'In Gesprek',
		'Positief / Deal',
		'Opvolgen',
		'Gepland',
		'Bounced',
		'Niet contacteren',
		'Geen Match'
	];

	const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
		'Concept in Gmail': { bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-300 dark:border-amber-500/30' },
		'Verzonden': { bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-300 dark:border-blue-500/30' },
		'In Gesprek': { bg: 'bg-purple-500/10 dark:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-300 dark:border-purple-500/30' },
		'Positief / Deal': { bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-300 dark:border-emerald-500/30' },
		'Opvolgen': { bg: 'bg-orange-500/10 dark:bg-orange-500/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-300 dark:border-orange-500/30' },
		'Gepland': { bg: 'bg-cyan-500/10 dark:bg-cyan-500/20', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-300 dark:border-cyan-500/30' },
		'Bounced': { bg: 'bg-rose-500/10 dark:bg-rose-500/20', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-300 dark:border-rose-500/30' },
		'Niet contacteren': { bg: 'bg-zinc-500/10', text: 'text-zinc-500', border: 'border-zinc-300 dark:border-zinc-700' },
		'Geen Match': { bg: 'bg-zinc-500/10', text: 'text-zinc-500', border: 'border-zinc-300 dark:border-zinc-700' }
	};

	let inlineEditNotesId = $state<string | null>(null);
	let inlineNotesVal = $state('');

	function handleStatusChange(leadId: string, status: string) {
		updateStatus(leadId, status, true);
	}

	function handleCopyEmail(email: string) {
		navigator.clipboard.writeText(email);
		showToast(\`E-mail \${email} gekopieerd!\`);
	}
</script>

<div class="bg-white dark:bg-[#12141a] rounded-xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm overflow-hidden">
	<div class="overflow-x-auto">
		<table class="w-full text-left text-xs border-collapse">
			<thead>
				<tr class="bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
					<th class="py-3 px-4">Contact & Bedrijf</th>
					<th class="py-3 px-4">Status</th>
					<th class="py-3 px-4">Datum Actie</th>
					<th class="py-3 px-4">Connectie</th>
					<th class="py-3 px-4">Notities & Opmerkingen</th>
					<th class="py-3 px-4 text-right">Acties</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-zinc-100 dark:divide-zinc-800/60">
				{#if leads.length === 0}
					<tr>
						<td colSpan={6} class="py-12 text-center text-zinc-400">
							Geen leads gevonden.
						</td>
					</tr>
				{:else}
					{#each leads as lead (lead.leadId)}
						{@const st = STATUS_COLORS[lead.status] || { bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-700' }}
						<tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
							<!-- Contact & Company -->
							<td class="py-3 px-4">
								<div class="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
									<span>{lead.name}</span>
									{#if lead.language === 'Engels'}
										<span class="text-[9px] font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400 px-1 py-0.2 rounded">
											EN
										</span>
									{/if}
								</div>
								<div class="text-zinc-500 flex items-center gap-1 mt-0.5 font-medium">
									<Building2 class="w-3 h-3 text-zinc-400 shrink-0" />
									<span class="truncate max-w-[200px]">{lead.company}</span>
								</div>
								{#if lead.email}
									<div class="text-[11px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center gap-1 mt-0.5">
										<Mail class="w-3 h-3 shrink-0" />
										<a
											href="mailto:{lead.email}?subject=Partnerschap&body={encodeURIComponent(lead.salutation ? lead.salutation + '\\n\\n' : '')}"
											class="truncate max-w-[180px] hover:underline"
										>
											{lead.email}
										</a>
									</div>
								{/if}
							</td>

							<!-- Status Dropdown -->
							<td class="py-3 px-4">
								<div class="relative inline-block">
									<select
										value={lead.status}
										onchange={(e) => handleStatusChange(lead.leadId, (e.target as HTMLSelectElement).value)}
										class="text-xs font-bold py-1 pl-2.5 pr-6 rounded-lg border appearance-none cursor-pointer focus:outline-none {st.bg} {st.text} {st.border}"
									>
										{#each STATUS_OPTIONS as opt}
											<option value={opt} class="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
												{opt}
											</option>
										{/each}
									</select>
									<ChevronDown class="w-3.5 h-3.5 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
								</div>
							</td>

							<!-- Last Action Date -->
							<td class="py-3 px-4 whitespace-nowrap">
								<div class="font-mono text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
									<Calendar class="w-3 h-3 text-zinc-400" />
									<span>{lead.lastActionDate || '—'}</span>
								</div>
							</td>

							<!-- Connection -->
							<td class="py-3 px-4 max-w-[200px]">
								{#if lead.personalConnection}
									<div class="text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded p-1.5 text-[11px] leading-tight flex items-start gap-1">
										<Sparkles class="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
										<span class="line-clamp-2">{lead.personalConnection}</span>
									</div>
								{:else}
									<span class="text-zinc-400 italic text-[11px]">—</span>
								{/if}
							</td>

							<!-- Notes (Quick Edit) -->
							<td class="py-3 px-4 max-w-[260px]">
								{#if inlineEditNotesId === lead.leadId}
									<div class="space-y-1">
										<textarea
											bind:value={inlineNotesVal}
											class="w-full text-xs p-1.5 border border-amber-500 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none min-h-[50px]"
											autofocus
										></textarea>
										<div class="flex items-center gap-1 justify-end">
											<button
												onclick={() => (inlineEditNotesId = null)}
												class="px-2 py-0.5 text-[10px] font-bold text-zinc-400 hover:text-white"
											>
												Annuleer
											</button>
											<button
												onclick={() => {
													updateLead({ ...lead, notes: inlineNotesVal });
													inlineEditNotesId = null;
												}}
												class="px-2.5 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded"
											>
												Opslaan
											</button>
										</div>
									</div>
								{:else}
									<div
										onclick={() => {
											inlineEditNotesId = lead.leadId;
											inlineNotesVal = lead.notes || '';
										}}
										onkeydown={(e) => {
											if (e.key === 'Enter' || e.key === ' ') {
												inlineEditNotesId = lead.leadId;
												inlineNotesVal = lead.notes || '';
											}
										}}
										role="button"
										tabindex="0"
										class="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 p-1.5 rounded transition-colors"
										title="Klik om direct aan te passen"
									>
										{#if lead.notes}
											<p class="text-zinc-700 dark:text-zinc-300 line-clamp-2 text-[11px] leading-relaxed">
												{lead.notes}
											</p>
										{:else}
											<span class="text-zinc-400 italic text-[11px] flex items-center gap-1">
												<Plus class="w-3 h-3" /> Voeg notitie toe...
											</span>
										{/if}
									</div>
								{/if}
							</td>

							<!-- Actions -->
							<td class="py-3 px-4 text-right whitespace-nowrap">
								<div class="flex items-center justify-end gap-1">
									{#if lead.email}
										<button
											onclick={() => handleCopyEmail(lead.email)}
											title="Kopieer e-mail"
											class="p-1.5 text-zinc-400 hover:text-amber-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
										>
											<Copy class="w-3.5 h-3.5" />
										</button>
									{/if}
									<button
										onclick={() => oneditLead?.(lead)}
										title="Volledige lead bewerken"
										class="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
									>
										<Edit2 class="w-3.5 h-3.5" />
									</button>
									<button
										onclick={() => deleteLead(lead.leadId)}
										title="Verwijder lead"
										class="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors"
									>
										<Trash2 class="w-3.5 h-3.5" />
									</button>
								</div>
							</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>
`);

// 4. LeadsKanban.svelte
writeFile('src/lib/components/LeadsKanban.svelte', `<script lang="ts">
	import { Clock, Send, MessageSquare, CheckCircle2, RotateCcw, XCircle, Building2, ChevronRight } from '@lucide/svelte';
	import type { LeadRecord } from '$lib/types';

	interface Props {
		leads?: LeadRecord[];
		oneditLead?: (l: LeadRecord) => void;
	}

	let { leads = [], oneditLead }: Props = $props();

	const columns = [
		{ id: 'Concept in Gmail', title: 'Concept in Gmail', icon: Clock },
		{ id: 'Verzonden', title: 'Verzonden', icon: Send },
		{ id: 'In Gesprek', title: 'In Gesprek', icon: MessageSquare },
		{ id: 'Positief / Deal', title: 'Positief / Deal', icon: CheckCircle2 },
		{ id: 'Opvolgen', title: 'Opvolgen', icon: RotateCcw },
		{ id: 'Niet contacteren', title: 'Gesloten / Geen Match', icon: XCircle }
	];
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 items-start">
	{#each columns as col}
		{@const Icon = col.icon}
		{@const colLeads = leads.filter(l => {
			if (col.id === 'Niet contacteren') {
				return l.status === 'Niet contacteren' || l.status === 'Geen Match' || l.status === 'Bounced';
			}
			return l.status === col.id;
		})}

		<div class="bg-zinc-100 dark:bg-[#12141a] rounded-xl p-3 border border-zinc-200 dark:border-zinc-800/80 flex flex-col min-h-[350px]">
			<!-- Header -->
			<div class="flex items-center justify-between pb-2 mb-2 border-b border-zinc-200 dark:border-zinc-800">
				<div class="flex items-center gap-1.5 truncate">
					<Icon class="w-3.5 h-3.5 text-zinc-400" />
					<h3 class="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 truncate">
						{col.title}
					</h3>
				</div>
				<span class="text-xs font-mono font-bold bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700">
					{colLeads.length}
				</span>
			</div>

			<!-- Cards list -->
			<div class="space-y-2 flex-1 overflow-y-auto max-h-[70vh]">
				{#if colLeads.length === 0}
					<div class="py-8 text-center text-zinc-400 text-xs italic">Geen leads</div>
				{:else}
					{#each colLeads as lead (lead.leadId)}
						<div
							onclick={() => oneditLead?.(lead)}
							onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && oneditLead?.(lead)}
							role="button"
							tabindex="0"
							class="bg-white dark:bg-zinc-800/70 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700/60 shadow-sm hover:border-amber-500 transition-all cursor-pointer space-y-1.5 group"
						>
							<div class="flex items-start justify-between gap-1">
								<h4 class="font-bold text-xs text-zinc-900 dark:text-white leading-snug group-hover:text-amber-500">
									{lead.name}
								</h4>
								{#if lead.language === 'Engels'}
									<span class="text-[9px] font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400 px-1 py-0.2 rounded shrink-0">
										EN
									</span>
								{/if}
							</div>

							<div class="text-xs text-zinc-500 flex items-center gap-1 truncate font-medium">
								<Building2 class="w-3 h-3 text-zinc-400 shrink-0" />
								<span class="truncate">{lead.company}</span>
							</div>

							{#if lead.personalConnection}
								<div class="text-[10px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 p-1.5 rounded border border-amber-200 dark:border-amber-500/20 leading-tight">
									<span class="font-semibold">Connectie:</span> {lead.personalConnection}
								</div>
							{/if}

							{#if lead.notes}
								<p class="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed italic">
									{lead.notes}
								</p>
							{/if}

							<div class="pt-1.5 border-t border-zinc-100 dark:border-zinc-700/50 flex items-center justify-between text-[10px] text-zinc-400">
								<span class="font-mono">{lead.lastActionDate || '—'}</span>
								<span class="text-amber-500 font-bold group-hover:underline flex items-center gap-0.5">
									Bewerken <ChevronRight class="w-3 h-3" />
								</span>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	{/each}
</div>
`);

// 5. LeadModal.svelte
writeFile('src/lib/components/LeadModal.svelte', `<script lang="ts">
	import { X, Save, Trash2, Plus } from '@lucide/svelte';
	import type { LeadRecord } from '$lib/types';
	import { updateLead, deleteLead } from '$lib/stores/leads.svelte';

	interface Props {
		lead?: LeadRecord | null;
		onclose?: () => void;
	}

	let { lead = null, onclose }: Props = $props();

	let currentLead = $state<LeadRecord>({ ...lead! });

	$effect(() => {
		if (lead) currentLead = { ...lead };
	});

	const STATUS_OPTIONS = [
		'Concept in Gmail',
		'Verzonden',
		'In Gesprek',
		'Positief / Deal',
		'Opvolgen',
		'Gepland',
		'Bounced',
		'Niet contacteren',
		'Geen Match'
	];

	async function handleSubmit(e: Event) {
		e.preventDefault();
		await updateLead(currentLead);
		onclose?.();
	}

	function addDateStamp() {
		const today = new Date().toISOString().split('T')[0];
		const stamp = \`[\${today}] \`;
		currentLead.notes = currentLead.notes ? \`\${currentLead.notes} \${stamp}\` : stamp;
	}
</script>

{#if lead}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
		<div class="bg-white dark:bg-[#15171e] rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 relative max-h-[90vh] overflow-y-auto">
			<button onclick={() => onclose?.()} class="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white">
				<X class="w-6 h-6" />
			</button>

			<div class="mb-5">
				<span class="text-xs font-bold uppercase tracking-wider text-amber-500">Lead Bewerken</span>
				<h2 class="text-xl font-black text-zinc-900 dark:text-white mt-0.5">
					{currentLead.name} — {currentLead.company}
				</h2>
				<p class="text-xs text-zinc-400 font-mono">ID: {currentLead.leadId}</p>
			</div>

			<form onsubmit={handleSubmit} class="space-y-4">
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
					<div>
						<label for="lead-name" class="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Naam Contactpersoon</label>
						<input id="lead-name" type="text" bind:value={currentLead.name} class="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500" required />
					</div>
					<div>
						<label for="lead-company" class="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Bedrijf / Organisatie</label>
						<input id="lead-company" type="text" bind:value={currentLead.company} class="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500" required />
					</div>
					<div>
						<label for="lead-status" class="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Status</label>
						<select id="lead-status" bind:value={currentLead.status} class="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 font-bold">
							{#each STATUS_OPTIONS as opt}
								<option value={opt}>{opt}</option>
							{/each}
						</select>
					</div>
					<div>
						<label for="lead-date" class="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Datum Laatste Actie</label>
						<div class="flex items-center gap-2">
							<input id="lead-date" type="date" bind:value={currentLead.lastActionDate} class="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono" />
							<button type="button" onclick={() => (currentLead.lastActionDate = new Date().toISOString().split('T')[0])} class="text-xs px-2 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg font-bold">
								Vandaag
							</button>
						</div>
					</div>
					<div>
						<label for="lead-email" class="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">E-mailadres</label>
						<input id="lead-email" type="email" bind:value={currentLead.email} class="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono" />
					</div>
					<div>
						<label for="lead-lang" class="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Taal</label>
						<select id="lead-lang" bind:value={currentLead.language} class="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500">
							<option value="Nederlands">Nederlands</option>
							<option value="Engels">Engels</option>
						</select>
					</div>
				</div>

				<div>
					<label for="lead-salutation" class="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Formele Aanspreking</label>
					<input id="lead-salutation" type="text" bind:value={currentLead.salutation} placeholder="bv. Geachte heer Clijsters, / Dear Ms. Sheehan," class="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500" />
				</div>

				<div>
					<label for="lead-conn" class="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Persoonlijke Connectie / Warm Lead Info</label>
					<input id="lead-conn" type="text" bind:value={currentLead.personalConnection} placeholder="bv. Ex-werkgever / Doorverwezen door..." class="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500" />
				</div>

				<div>
					<div class="flex items-center justify-between mb-1">
						<label for="lead-notes" class="block text-xs font-bold uppercase tracking-wider text-zinc-500">Notities / Statusverslag</label>
						<button type="button" onclick={addDateStamp} class="text-[11px] text-amber-500 hover:underline font-bold flex items-center gap-1">
							<Plus class="w-3 h-3" /> Voeg datumstempel toe
						</button>
					</div>
					<textarea id="lead-notes" rows="4" bind:value={currentLead.notes} placeholder="Gespreksnotities, acties, feedback..." class="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"></textarea>
				</div>

				<div class="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
					<button type="button" onclick={() => { deleteLead(currentLead.leadId); onclose?.(); }} class="px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-lg flex items-center gap-1.5">
						<Trash2 class="w-3.5 h-3.5" /> Verwijder
					</button>

					<div class="flex items-center gap-2">
						<button type="button" onclick={() => onclose?.()} class="px-4 py-2 text-xs font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
							Annuleren
						</button>
						<button type="submit" class="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg flex items-center gap-1.5 shadow-sm">
							<Save class="w-3.5 h-3.5" /> Opslaan direct in CSV
						</button>
					</div>
				</div>
			</form>
		</div>
	</div>
{/if}
`);

// 6. NewLeadModal.svelte
writeFile('src/lib/components/NewLeadModal.svelte', `<script lang="ts">
	import { X, Plus } from '@lucide/svelte';
	import type { LeadRecord } from '$lib/types';
	import { updateLead } from '$lib/stores/leads.svelte';

	interface Props {
		open?: boolean;
		onclose?: () => void;
	}

	let { open = false, onclose }: Props = $props();

	let name = $state('');
	let company = $state('');
	let status = $state('Concept in Gmail');
	let lastActionDate = $state(new Date().toISOString().split('T')[0]);
	let email = $state('');
	let language = $state('Nederlands');
	let salutation = $state('Geachte heer / mevrouw,');
	let personalConnection = $state('');
	let notes = $state('');

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!name && !company) {
			alert('Vul minimaal een naam of bedrijf in.');
			return;
		}

		const slug = \`\${(company || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-\${Date.now().toString().slice(-4)}\`;

		const newLead: LeadRecord = {
			leadId: slug,
			name,
			company,
			status,
			lastActionDate,
			email,
			language,
			salutation,
			personalConnection,
			notes
		};

		await updateLead(newLead);
		name = '';
		company = '';
		email = '';
		personalConnection = '';
		notes = '';
		onclose?.();
	}
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
		<div class="bg-white dark:bg-[#15171e] rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 relative max-h-[90vh] overflow-y-auto">
			<button onclick={() => onclose?.()} class="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white">
				<X class="w-6 h-6" />
			</button>

			<div class="mb-5">
				<span class="text-xs font-bold uppercase tracking-wider text-amber-500">Nieuw Contact</span>
				<h2 class="text-xl font-black text-zinc-900 dark:text-white mt-0.5">
					Nieuwe Lead Toevoegen
				</h2>
				<p class="text-xs text-zinc-400">Wordt direct toegevoegd aan de actieve CSV.</p>
			</div>

			<form onsubmit={handleSubmit} class="space-y-4">
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
					<div>
						<label for="new-name" class="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Naam Contactpersoon *</label>
						<input id="new-name" type="text" bind:value={name} placeholder="bv. Jan Peeters" class="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500" required />
					</div>
					<div>
						<label for="new-company" class="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Bedrijf / Organisatie *</label>
						<input id="new-company" type="text" bind:value={company} placeholder="bv. Acme Tech NV" class="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500" required />
					</div>
					<div>
						<label for="new-status" class="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Status</label>
						<select id="new-status" bind:value={status} class="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 font-bold">
							<option value="Concept in Gmail">Concept in Gmail</option>
							<option value="Verzonden">Verzonden</option>
							<option value="In Gesprek">In Gesprek</option>
							<option value="Positief / Deal">Positief / Deal</option>
							<option value="Opvolgen">Opvolgen</option>
							<option value="Gepland">Gepland</option>
							<option value="Niet contacteren">Niet contacteren</option>
						</select>
					</div>
					<div>
						<label for="new-date" class="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Datum Actie</label>
						<input id="new-date" type="date" bind:value={lastActionDate} class="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono" />
					</div>
					<div>
						<label for="new-email" class="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">E-mailadres</label>
						<input id="new-email" type="email" bind:value={email} placeholder="contact@bedrijf.be" class="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono" />
					</div>
					<div>
						<label for="new-lang" class="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Taal</label>
						<select id="new-lang" bind:value={language} class="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500">
							<option value="Nederlands">Nederlands</option>
							<option value="Engels">Engels</option>
						</select>
					</div>
				</div>

				<div>
					<label for="new-salutation" class="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Formele Aanspreking</label>
					<input id="new-salutation" type="text" bind:value={salutation} placeholder="Geachte heer ..., / Beste ..." class="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500" />
				</div>

				<div>
					<label for="new-connection" class="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Persoonlijke Connectie</label>
					<input id="new-connection" type="text" bind:value={personalConnection} placeholder="bv. KU Leuven alumnus / Ontmoet op MindGate event" class="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500" />
				</div>

				<div>
					<label for="new-notes" class="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Opmerkingen & Notities</label>
					<textarea id="new-notes" rows="3" bind:value={notes} placeholder="Achtergrond, rol, interesse, opmerkingen..." class="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"></textarea>
				</div>

				<div class="flex items-center justify-end gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
					<button type="button" onclick={() => onclose?.()} class="px-4 py-2 text-xs font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
						Annuleren
					</button>
					<button type="submit" class="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg flex items-center gap-1.5 shadow-sm">
						<Plus class="w-3.5 h-3.5" /> Lead Toevoegen
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
`);

// 7. ProjectModal.svelte
writeFile('src/lib/components/ProjectModal.svelte', `<script lang="ts">
	import { X, Save } from '@lucide/svelte';
	import type { ProjectConfig } from '$lib/types';
	import { saveProjectApi, selectProject } from '$lib/stores/projects.svelte';
	import { loadLeads } from '$lib/stores/leads.svelte';

	interface Props {
		open?: boolean;
		project?: ProjectConfig | null;
		onclose?: () => void;
	}

	let { open = false, project = null, onclose }: Props = $props();

	let name = $state('');
	let description = $state('');
	let csvPath = $state('');
	let color = $state('#3b82f6');

	$effect(() => {
		if (project) {
			name = project.name;
			description = project.description || '';
			csvPath = project.csvPath;
			color = project.color || '#3b82f6';
		} else {
			name = '';
			description = '';
			csvPath = '';
			color = '#3b82f6';
		}
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!name || !csvPath) {
			alert('Naam en CSV pad zijn verplicht.');
			return;
		}

		const toSave: Partial<ProjectConfig> = {
			id: project?.id,
			name,
			description,
			csvPath,
			color
		};

		const ok = await saveProjectApi(toSave);
		if (ok) {
			if (!project?.id) {
				const generatedId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
				selectProject(generatedId);
				await loadLeads();
			}
			onclose?.();
		}
	}
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
		<div class="bg-white dark:bg-[#15171e] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 relative">
			<button onclick={() => onclose?.()} class="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white">
				<X class="w-6 h-6" />
			</button>

			<div class="mb-5">
				<span class="text-xs font-bold uppercase tracking-wider text-amber-500">Project Configuratie</span>
				<h2 class="text-xl font-black text-zinc-900 dark:text-white mt-0.5">
					{project ? 'Project Bewerken' : 'Nieuw Sales Project Toevoegen'}
				</h2>
				<p class="text-xs text-zinc-400">Koppel een willekeurig leads CSV bestand op je schijf.</p>
			</div>

			<form onsubmit={handleSubmit} class="space-y-4">
				<div>
					<label for="prj-name" class="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Project Naam *</label>
					<input id="prj-name" type="text" bind:value={name} placeholder="bv. My SaaS Sales / FRÉ2028 Partners" class="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500" required />
				</div>

				<div>
					<label for="prj-desc" class="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Omschrijving (optioneel)</label>
					<input id="prj-desc" type="text" bind:value={description} placeholder="Korte toelichting over de doelgroep of campagne..." class="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500" />
				</div>

				<div>
					<label for="prj-path" class="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Volledig Pad naar CSV Bestand *</label>
					<input id="prj-path" type="text" bind:value={csvPath} placeholder="C:\\Users\\...\\leads_tracking_status.csv" class="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono" required />
					<span class="text-[10px] text-zinc-400 mt-1 block">
						Tip: Het bestand mag al bestaan of wordt automatisch aangemaakt met de standaard 10 kolommen.
					</span>
				</div>

				<div>
					<label for="prj-color-label" class="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Kleur Label</label>
					<div id="prj-color-label" class="flex items-center gap-2">
						{#each ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ec4899', '#06b6d4', '#64748b'] as c}
							<button
								type="button"
								onclick={() => (color = c)}
								class="w-6 h-6 rounded-full transition-transform {color === c ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'}"
								style="background-color: {c}"
								aria-label="Kleur {c}"
							></button>
						{/each}
					</div>
				</div>

				<div class="flex items-center justify-end gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
					<button type="button" onclick={() => onclose?.()} class="px-4 py-2 text-xs font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
						Annuleren
					</button>
					<button type="submit" class="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg flex items-center gap-1.5 shadow-sm">
						<Save class="w-3.5 h-3.5" /> Project Opslaan
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
`);

// 8. +layout.svelte
writeFile('src/routes/+layout.svelte', `<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Header from '$lib/components/Header.svelte';
	import LeadModal from '$lib/components/LeadModal.svelte';
	import NewLeadModal from '$lib/components/NewLeadModal.svelte';
	import ProjectModal from '$lib/components/ProjectModal.svelte';
	import { initTheme } from '$lib/stores/theme.svelte';
	import { loadProjects } from '$lib/stores/projects.svelte';
	import { loadLeads, getToastMessage } from '$lib/stores/leads.svelte';
	import type { LeadRecord } from '$lib/types';
	import { CheckCircle2 } from '@lucide/svelte';

	let { children } = $props();

	let mobileMenuOpen = $state(false);
	let newLeadModalOpen = $state(false);
	let projectModalOpen = $state(false);
	let editingLead = $state<LeadRecord | null>(null);

	let toastMsg = $derived(getToastMessage());

	onMount(async () => {
		initTheme();
		await loadProjects();
		await loadLeads();
	});
</script>

<div class="flex h-screen overflow-hidden bg-zinc-50 dark:bg-[#090b0e] text-zinc-900 dark:text-zinc-100">
	<!-- Sidebar -->
	<Sidebar
		open={mobileMenuOpen}
		onclose={() => (mobileMenuOpen = false)}
		onopenNewLead={() => (newLeadModalOpen = true)}
		onopenProjectModal={() => (projectModalOpen = true)}
	/>

	<!-- Main Content Area -->
	<div class="flex-1 flex flex-col min-w-0 overflow-hidden">
		<Header
			ontoggleMobileMenu={() => (mobileMenuOpen = !mobileMenuOpen)}
			onopenNewLead={() => (newLeadModalOpen = true)}
		/>

		<main class="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
			{@render children()}
		</main>
	</div>
</div>

<!-- Modals -->
{#if editingLead}
	<LeadModal lead={editingLead} onclose={() => (editingLead = null)} />
{/if}

<NewLeadModal open={newLeadModalOpen} onclose={() => (newLeadModalOpen = false)} />
<ProjectModal open={projectModalOpen} onclose={() => (projectModalOpen = false)} />

<!-- Toast Notification -->
{#if toastMsg}
	<div class="fixed bottom-6 right-6 z-50 bg-black dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-zinc-700 animate-in fade-in slide-in-from-bottom-4">
		<CheckCircle2 class="w-4 h-4 text-amber-500 shrink-0" />
		<span>{toastMsg}</span>
	</div>
{/if}
`);

// 9. +page.svelte (Overview Dashboard)
writeFile('src/routes/+page.svelte', `<script lang="ts">
	import { 
		Flame, 
		Send, 
		Clock, 
		MessageSquare, 
		CheckCircle2, 
		Sparkles, 
		ArrowRight,
		FileSpreadsheet
	} from '@lucide/svelte';
	import StatCard from '$lib/components/StatCard.svelte';
	import LeadsTable from '$lib/components/LeadsTable.svelte';
	import LeadModal from '$lib/components/LeadModal.svelte';
	import { getStats, getFilteredLeads, getLeads } from '$lib/stores/leads.svelte';
	import type { LeadRecord } from '$lib/types';

	let stats = $derived(getStats());
	let allLeads = $derived(getLeads());

	let editingLead = $state<LeadRecord | null>(null);

	let recentLeads = $derived(
		[...allLeads].sort((a, b) => (b.lastActionDate || '').localeCompare(a.lastActionDate || '')).slice(0, 8)
	);

	let warmLeads = $derived(
		allLeads.filter(l => l.personalConnection && l.personalConnection.trim() !== '').slice(0, 5)
	);
</script>

<div class="space-y-6">
	<!-- Top Title & KPI Cards -->
	<div>
		<h1 class="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
			Overview Dashboard
		</h1>
		<p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
			Overzicht van alle sales leads direct gesynchroniseerd vanuit het CSV bestand op schijf.
		</p>
	</div>

	<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
		<StatCard title="Totaal Leads" value={stats.totalLeads} subtitle="{stats.withConnection} warm" icon={FileSpreadsheet} color="amber" />
		<StatCard title="Verzonden" value={stats.sent} subtitle="{stats.sentPercentage}% van totaal" icon={Send} color="blue" />
		<StatCard title="Gmail Concepten" value={stats.draft} subtitle="Klaar voor verzending" icon={Clock} color="amber" />
		<StatCard title="In Gesprek" value={stats.inProgress} subtitle="Actief contact" icon={MessageSquare} color="purple" />
		<StatCard title="Bevestigde Deals" value={stats.deals} subtitle="Sponsoring / verkoop" icon={CheckCircle2} color="emerald" />
		<StatCard title="Warme Leads" value={stats.withConnection} subtitle="Persoonlijke connectie" icon={Sparkles} color="rose" />
	</div>

	<!-- High Priority / Warm Leads Section -->
	{#if warmLeads.length > 0}
		<div class="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 rounded-2xl border border-amber-500/20">
			<div class="flex items-center justify-between mb-3">
				<div class="flex items-center gap-2">
					<Sparkles class="w-4 h-4 text-amber-500" />
					<h2 class="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
						Belangrijkste Warme Connecties
					</h2>
				</div>
				<a href="/table" class="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1">
					Bekijk alles &rarr;
				</a>
			</div>
			<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
				{#each warmLeads as lead}
					<button
						type="button"
						onclick={() => (editingLead = lead)}
						class="text-left bg-white dark:bg-[#15171e] p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-amber-500 transition-all cursor-pointer space-y-1"
					>
						<div class="font-bold text-xs text-zinc-900 dark:text-white truncate">{lead.name}</div>
						<div class="text-[11px] text-zinc-500 truncate">{lead.company}</div>
						<div class="text-[10px] text-amber-700 dark:text-amber-300 line-clamp-2 leading-tight bg-amber-50 dark:bg-amber-500/10 p-1.5 rounded">
							{lead.personalConnection}
						</div>
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Recent Activity / Leads Table Preview -->
	<div class="space-y-3">
		<div class="flex items-center justify-between">
			<h2 class="text-sm font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
				Recente Leads ({recentLeads.length})
			</h2>
			<a href="/table" class="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1">
				Volledige tabel openen <ArrowRight class="w-3.5 h-3.5" />
			</a>
		</div>

		<LeadsTable leads={recentLeads} oneditLead={(l: LeadRecord) => (editingLead = l)} />
	</div>
</div>

{#if editingLead}
	<LeadModal lead={editingLead} onclose={() => (editingLead = null)} />
{/if}
`);

// 10. table/+page.svelte
writeFile('src/routes/table/+page.svelte', `<script lang="ts">
	import LeadsTable from '$lib/components/LeadsTable.svelte';
	import LeadModal from '$lib/components/LeadModal.svelte';
	import { getFilteredLeads, getFilters, getLeads } from '$lib/stores/leads.svelte';
	import type { LeadRecord } from '$lib/types';
	import { Sparkles } from '@lucide/svelte';

	let leads = $derived(getLeads());
	let filteredLeads = $derived(getFilteredLeads());
	let filters = getFilters();
	let editingLead = $state<LeadRecord | null>(null);

	const STATUS_OPTIONS = [
		'Concept in Gmail',
		'Verzonden',
		'In Gesprek',
		'Positief / Deal',
		'Opvolgen',
		'Gepland',
		'Bounced',
		'Niet contacteren'
	];
</script>

<div class="space-y-4">
	<!-- Header & Filters Toolbar -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
		<div>
			<h1 class="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
				Leads Data Grid
			</h1>
			<p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
				Volledige tabelweergave met directe inline statusaanpassingen en notitiebewerkingen.
			</p>
		</div>

		<!-- Quick Filter Chips -->
		<div class="flex items-center gap-2 flex-wrap">
			<button
				onclick={() => (filters.status = 'ALL')}
				class="px-2.5 py-1 text-xs rounded-lg font-bold transition-colors {filters.status === 'ALL' ? 'bg-amber-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-white'}"
			>
				Alles ({leads.length})
			</button>

			{#each STATUS_OPTIONS as opt}
				{@const count = leads.filter(l => l.status === opt).length}
				{#if count > 0 || filters.status === opt}
					<button
						onclick={() => (filters.status = filters.status === opt ? 'ALL' : opt)}
						class="px-2.5 py-1 text-xs rounded-lg font-bold transition-colors {filters.status === opt ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-white'}"
					>
						{opt} ({count})
					</button>
				{/if}
			{/each}

			<button
				onclick={() => (filters.connectionOnly = !filters.connectionOnly)}
				class="px-2.5 py-1 text-xs rounded-lg font-bold flex items-center gap-1 transition-colors {filters.connectionOnly ? 'bg-rose-500 text-white' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}"
			>
				<Sparkles class="w-3 h-3" /> Warm
			</button>
		</div>
	</div>

	<!-- Table Component -->
	<LeadsTable leads={filteredLeads} oneditLead={(l: LeadRecord) => (editingLead = l)} />
</div>

{#if editingLead}
	<LeadModal lead={editingLead} onclose={() => (editingLead = null)} />
{/if}
`);

// 11. pipeline/+page.svelte
writeFile('src/routes/pipeline/+page.svelte', `<script lang="ts">
	import LeadsKanban from '$lib/components/LeadsKanban.svelte';
	import LeadModal from '$lib/components/LeadModal.svelte';
	import { getFilteredLeads } from '$lib/stores/leads.svelte';
	import type { LeadRecord } from '$lib/types';

	let filteredLeads = $derived(getFilteredLeads());
	let editingLead = $state<LeadRecord | null>(null);
</script>

<div class="space-y-4">
	<div>
		<h1 class="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
			Sales Pipeline
		</h1>
		<p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
			Visualiseer leads per fase van de sales funnel.
		</p>
	</div>

	<LeadsKanban leads={filteredLeads} oneditLead={(l: LeadRecord) => (editingLead = l)} />
</div>

{#if editingLead}
	<LeadModal lead={editingLead} onclose={() => (editingLead = null)} />
{/if}
`);

// 12. projects/+page.svelte
writeFile('src/routes/projects/+page.svelte', `<script lang="ts">
	import { getProjectsList, deleteProjectApi, selectProject } from '$lib/stores/projects.svelte';
	import { loadLeads } from '$lib/stores/leads.svelte';
	import ProjectModal from '$lib/components/ProjectModal.svelte';
	import type { ProjectConfig } from '$lib/types';
	import { FolderGit2, Plus, Edit2, Trash2, FileSpreadsheet } from '@lucide/svelte';

	let projects = $derived(getProjectsList());
	let projectModalOpen = $state(false);
	let editingPrj = $state<ProjectConfig | null>(null);

	function handleSwitch(id: string) {
		selectProject(id);
		loadLeads();
	}
</script>

<div class="space-y-6 max-w-4xl">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
				Projecten & CSV Paden
			</h1>
			<p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
				Beheer alle verkoopcampagnes en koppel directe CSV-bestanden op je lokale schijf.
			</p>
		</div>

		<button
			onclick={() => { editingPrj = null; projectModalOpen = true; }}
			class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
		>
			<Plus class="w-4 h-4" />
			Nieuw Project Toevoegen
		</button>
	</div>

	<div class="grid grid-cols-1 gap-4">
		{#each projects as prj}
			<div class="bg-white dark:bg-[#12141a] p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div class="flex items-start gap-4">
					<div class="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md" style="background-color: {prj.color || '#f59e0b'}">
						<FolderGit2 class="w-5 h-5" />
					</div>
					<div>
						<div class="flex items-center gap-2">
							<h3 class="text-sm font-black text-zinc-900 dark:text-white">{prj.name}</h3>
							{#if prj.isDefault}
								<span class="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 px-2 py-0.2 rounded border border-amber-500/20">
									Standaard
								</span>
							{/if}
						</div>
						{#if prj.description}
							<p class="text-xs text-zinc-500 mt-0.5">{prj.description}</p>
						{/if}
						<div class="mt-2 text-xs font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800/60 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 break-all">
							<FileSpreadsheet class="w-3.5 h-3.5 text-zinc-400 shrink-0" />
							<span>{prj.csvPath}</span>
						</div>
					</div>
				</div>

				<div class="flex items-center gap-2 self-end sm:self-center">
					<button
						onclick={() => handleSwitch(prj.id)}
						class="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-500 hover:text-white text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-lg transition-colors"
					>
						Selecteer
					</button>
					<button
						onclick={() => { editingPrj = prj; projectModalOpen = true; }}
						class="p-2 text-zinc-400 hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
					>
						<Edit2 class="w-4 h-4" />
					</button>
					{#if !prj.isDefault}
						<button
							onclick={() => deleteProjectApi(prj.id)}
							class="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
						>
							<Trash2 class="w-4 h-4" />
						</button>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>

<ProjectModal open={projectModalOpen} project={editingPrj} onclose={() => (projectModalOpen = false)} />
`);

console.log('✅ ALL MY_LEADS FILES UPDATED SUCCESSFULLY!');
