import React, { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, BookOpen, CalendarDays, Inbox, Lightbulb, Save, Send } from 'lucide-react';

// Local content planning: calendar, ideas + inbox, diary. Reads and writes the files in
// _communicatie/social-media through /api/admin/content, so it only works under `npm run dev`.
// Approving and posting happen in the Claude chat, never from this page.
const API = '/api/admin/content';

type Post = {
  id: string; channel: string; language: string; date: string; time: string; status: string; series: string; format: string;
  media: string; link: string; post_url: string; posted_at: string; approved_at: string;
  text: string; firstComment: string; notes: string; results: string; lockValid: boolean;
};
type Data = { posts: Post[]; diary: { month: string; content: string }[]; ideas: string; inbox: { name: string; size: number; modified: string }[]; inboxDir: string };

const STATUS_STYLE: Record<string, string> = {
  idea: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  draft: 'bg-sky-50 text-sky-800 border-sky-200',
  waiting: 'bg-amber-50 text-amber-800 border-amber-300',
  approved: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  posted: 'bg-zinc-900 text-white border-zinc-900',
  skipped: 'bg-zinc-50 text-zinc-400 border-zinc-200 line-through',
};
const STATUS_LABEL: Record<string, string> = {
  idea: 'idea', draft: 'draft', waiting: 'waiting for approval', approved: 'approved', posted: 'posted', skipped: 'skipped',
};
const EDITABLE = ['idea', 'draft', 'waiting', 'skipped'];
const TABS = [
  { key: 'calendar', label: 'Calendar', icon: CalendarDays },
  { key: 'ideas', label: 'Ideas & inbox', icon: Lightbulb },
  { key: 'diary', label: 'Diary', icon: BookOpen },
] as const;

const weekday = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const isVideo = (f: string) => /\.(mp4|mov)$/i.test(f);
const isImage = (f: string) => /\.(png|jpe?g|webp|gif)$/i.test(f);
const mediaUrl = (rel: string) => `${API}?media=${encodeURIComponent(rel)}`;

export default function ContentAdminPage() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('calendar');
  const [entry, setEntry] = useState('');
  const [entryIdea, setEntryIdea] = useState(false);
  const [entrySaved, setEntrySaved] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch(API)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `HTTP ${r.status}`);
        return r.json();
      })
      .then((d: Data) => { setData(d); setError(''); })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(load, [load]);

  const saveEntry = async () => {
    if (!entry.trim()) return;
    const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'entry', text: entry, idea: entryIdea }) });
    if (!r.ok) return setError('Could not save the entry');
    setEntry('');
    setEntryIdea(false);
    setEntrySaved(true);
    setTimeout(() => setEntrySaved(false), 2000);
    load();
  };

  const posts = data?.posts || [];
  const upcoming = posts.find((p) => p.status !== 'posted' && p.status !== 'skipped');

  return (
    <div className="min-h-screen bg-zinc-50">
      <Head>
        <title>Content planning</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3">
          <Link href="/admin" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-black">
            <ArrowLeft className="h-4 w-4" /> Admin
          </Link>
          <div className="h-4 w-px bg-zinc-200" />
          <h1 className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <Send className="h-5 w-5" /> Content planning
          </h1>
        </div>
        <nav className="mx-auto flex max-w-4xl gap-1 px-4">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-semibold ${tab === key ? 'border-black text-black' : 'border-transparent text-zinc-500 hover:text-black'}`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error === 'Local only' ? 'This page only works locally: run npm run dev and open localhost:3000/admin/content.' : error}
          </div>
        )}

        {/* Quick add: everything lands in the diary; ideas are also copied to ideas.md */}
        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">What's going on? (diary or idea)</label>
          <textarea
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) saveEntry(); }}
            rows={3}
            placeholder="e.g. Call with print partner in Ohio on Thursday. Or: Idea: post about the 150 kg test"
            className="mt-2 w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
          />
          <div className="mt-2 flex items-center gap-4">
            <button onClick={saveEntry} disabled={!entry.trim()} className="flex items-center gap-1.5 rounded bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">
              <Save className="h-4 w-4" /> Save
            </button>
            <label className="flex items-center gap-1.5 text-sm text-zinc-600">
              <input type="checkbox" checked={entryIdea} onChange={(e) => setEntryIdea(e.target.checked)} /> also add to ideas
            </label>
            <span className="text-xs text-zinc-400">{entrySaved ? 'Saved to today\'s diary' : 'Ctrl+Enter to save'}</span>
          </div>
        </section>

        {tab === 'calendar' && (
          <section className="mt-6">
            {upcoming && (
              <p className="mb-3 text-sm text-zinc-600">
                Next: <span className="font-semibold">{weekday(upcoming.date)} {upcoming.time}</span> on {upcoming.channel}, {STATUS_LABEL[upcoming.status]}.
                {' '}Approve and post in the Claude chat.
              </p>
            )}
            <div className="divide-y divide-zinc-100 overflow-hidden rounded-lg border border-zinc-200 bg-white">
              {!data && !error && <div className="p-6 text-sm text-zinc-500">Loading…</div>}
              {posts.map((p) => (
                <PostRow key={p.id} post={p} open={openId === p.id} onToggle={() => setOpenId(openId === p.id ? null : p.id)} onSaved={load} />
              ))}
            </div>
          </section>
        )}

        {tab === 'ideas' && data && (
          <section className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <h2 className="flex items-center gap-2 text-sm font-bold"><Lightbulb className="h-4 w-4" /> Ideas</h2>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-sm text-zinc-700">{data.ideas.replace(/^# Ideas\s*/, '')}</pre>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <h2 className="flex items-center gap-2 text-sm font-bold"><Inbox className="h-4 w-4" /> Content inbox</h2>
              <p className="mt-1 text-xs text-zinc-500">Drop photos and videos in <code className="rounded bg-zinc-100 px-1">{data.inboxDir}</code></p>
              {data.inbox.length === 0 && <p className="mt-3 text-sm text-zinc-400">Empty.</p>}
              <div className="mt-3 grid grid-cols-2 gap-3">
                {data.inbox.map((f) => {
                  const rel = `${data.inboxDir}/${f.name}`;
                  return (
                    <a key={f.name} href={mediaUrl(rel)} target="_blank" rel="noreferrer" className="block overflow-hidden rounded border border-zinc-200 text-xs hover:border-black">
                      {isImage(f.name) && <img src={mediaUrl(rel)} alt={f.name} className="aspect-square w-full object-cover" />}
                      {isVideo(f.name) && <video src={mediaUrl(rel)} className="aspect-square w-full bg-black object-cover" muted preload="metadata" />}
                      <div className="truncate px-2 py-1">{f.name}</div>
                      <div className="px-2 pb-1 text-zinc-400">{(f.size / 1e6).toFixed(1)} MB</div>
                    </a>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {tab === 'diary' && data && (
          <section className="mt-6 space-y-4">
            {data.diary.length === 0 && <p className="text-sm text-zinc-400">No diary entries yet.</p>}
            {data.diary.map((m) => (
              <div key={m.month} className="rounded-lg border border-zinc-200 bg-white p-4">
                <pre className="whitespace-pre-wrap font-sans text-sm text-zinc-700">{m.content}</pre>
              </div>
            ))}
            <p className="text-xs text-zinc-400">Private: the diary is not in git and is never posted. Edit older entries in _communicatie/social-media/diary/.</p>
          </section>
        )}
      </main>
    </div>
  );
}

function PostRow({ post, open, onToggle, onSaved }: { post: Post; open: boolean; onToggle: () => void; onSaved: () => void }) {
  const [draft, setDraft] = useState(post);
  const [msg, setMsg] = useState('');
  useEffect(() => setDraft(post), [post]);

  const locked = post.status === 'posted';
  const dirty = (['text', 'firstComment', 'notes', 'results', 'date', 'time', 'status'] as const).some((k) => draft[k] !== post[k]);
  const set = (k: keyof Post) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setDraft({ ...draft, [k]: e.target.value });

  const save = async () => {
    const r = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'savePost', id: post.id, post: draft }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return setMsg(d.error || 'Save failed');
    setMsg(post.status === 'approved' && d.status === 'waiting' ? 'Saved. The text changed, so it needs your approval again.' : 'Saved');
    onSaved();
  };

  const title = post.text.split('\n')[0] || post.notes.split('.')[0] || post.id;

  return (
    <div>
      <button onClick={onToggle} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50">
        <div className="w-36 shrink-0 text-xs font-semibold text-zinc-500">{weekday(post.date)}<br />{post.time} · {post.channel} · {post.language}</div>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[post.status] || STATUS_STYLE.idea}`}>
          {STATUS_LABEL[post.status] || post.status}{post.status === 'approved' && !post.lockValid ? ' (changed)' : ''}
        </span>
        <span className="min-w-0 truncate text-sm">{post.series && <span className="mr-2 text-xs uppercase tracking-wider text-zinc-400">{post.series}</span>}{title}</span>
      </button>

      {open && (
        <div className="grid gap-4 border-t border-zinc-100 bg-zinc-50/60 px-4 py-4 md:grid-cols-[1fr_260px]">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <input type="date" value={draft.date} onChange={set('date')} disabled={locked} className="rounded border border-zinc-300 px-2 py-1 text-sm" />
              <input type="time" value={draft.time} onChange={set('time')} disabled={locked} className="rounded border border-zinc-300 px-2 py-1 text-sm" />
              <select value={draft.status} onChange={set('status')} disabled={locked || !EDITABLE.includes(post.status) && post.status !== 'approved'} className="rounded border border-zinc-300 px-2 py-1 text-sm">
                {(EDITABLE.includes(draft.status) ? EDITABLE : [draft.status, ...EDITABLE]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
            </div>
            <Field label={`Text (${draft.text.length} chars)`} value={draft.text} onChange={set('text')} rows={12} disabled={locked} />
            <Field label="First comment" value={draft.firstComment} onChange={set('firstComment')} rows={4} disabled={locked} />
            <Field label="Notes" value={draft.notes} onChange={set('notes')} rows={3} disabled={locked} />
            <Field label="Results" value={draft.results} onChange={set('results')} rows={7} />
            <div className="flex items-center gap-3">
              <button onClick={save} disabled={!dirty} className="flex items-center gap-1.5 rounded bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">
                <Save className="h-4 w-4" /> Save
              </button>
              <span className="text-xs text-zinc-500">{msg}</span>
            </div>
          </div>
          <aside className="space-y-3 text-xs text-zinc-600">
            {post.media && (
              <div>
                <div className="mb-1 font-bold uppercase tracking-wider text-zinc-500">Media</div>
                {isVideo(post.media) && <video src={mediaUrl(post.media)} controls className="w-full rounded bg-black" preload="metadata" />}
                {isImage(post.media) && <img src={mediaUrl(post.media)} alt="" className="w-full rounded" />}
                <div className="mt-1 break-all text-zinc-400">{post.media}</div>
              </div>
            )}
            {post.link && <div className="break-all"><span className="font-bold">Link:</span> {post.link}</div>}
            {post.approved_at && <div><span className="font-bold">Approved:</span> {new Date(post.approved_at).toLocaleString('en-GB')}</div>}
            {post.post_url && <a href={post.post_url} target="_blank" rel="noreferrer" className="block font-semibold underline">Open the live post</a>}
            <p className="text-zinc-400">To approve or post, tell Claude in the chat. Editing an approved post sets it back to waiting.</p>
          </aside>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, rows, disabled }: { label: string; value: string; onChange: React.ChangeEventHandler<HTMLTextAreaElement>; rows: number; disabled?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</span>
      <textarea value={value} onChange={onChange} rows={rows} disabled={disabled} className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none disabled:bg-zinc-100" />
    </label>
  );
}
