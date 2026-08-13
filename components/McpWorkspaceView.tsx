"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BellRing,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDot,
  CloudOff,
  Database,
  FileText,
  HeartPulse,
  Link2,
  ListChecks,
  LockKeyhole,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TimerReset,
  Utensils,
  X,
} from "lucide-react";
import type { TwinEntry } from "@/lib/types";

type WorkspaceSection = "health" | "insights" | "appointments" | "medications";

type Props = {
  latest: TwinEntry;
  entries: TwinEntry[];
};

type ActivityItem = {
  label: string;
  detail: string;
  time: string;
  tone: "black" | "amber" | "muted";
};

const SECTION_ITEMS: Array<{
  id: WorkspaceSection;
  label: string;
  kicker: string;
  icon: typeof HeartPulse;
  description: string;
}> = [
  { id: "health", label: "Health data", kicker: "01", icon: HeartPulse, description: "One timeline for your signals" },
  { id: "insights", label: "AI insights", kicker: "02", icon: Sparkles, description: "A grounded weekly readout" },
  { id: "appointments", label: "Appointments", kicker: "03", icon: CalendarDays, description: "Prepare for your care team" },
  { id: "medications", label: "Reminders", kicker: "04", icon: BellRing, description: "Keep routines visible" },
];

const INITIAL_MEDICATIONS = [
  { id: "metformin", name: "Morning routine", detail: "Daily · 08:00 · With breakfast", active: true },
  { id: "evening", name: "Evening check-in", detail: "Daily · 20:00 · Personal reminder", active: true },
];

const INITIAL_ACTIVITY: ActivityItem[] = [
  { label: "Fixture health source ready", detail: "5 normalized records available", time: "Just now", tone: "black" },
  { label: "Weekly insight prepared", detail: "Based on your latest 3 entries", time: "Today", tone: "muted" },
  { label: "Calendar connection waiting", detail: "Read-only preview mode", time: "Yesterday", tone: "amber" },
];

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function SourceBadge({ children, muted = false }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] ${muted ? "border-[#dfdfdc] text-neutral-400" : "border-[#cfcfca] bg-white text-neutral-600"}`}>
      <CircleDot className="h-2.5 w-2.5" />
      {children}
    </span>
  );
}

function MetricCard({ label, value, unit, note, icon: Icon, accent = "bg-[#f0f0ec]" }: { label: string; value: string; unit?: string; note: string; icon: typeof HeartPulse; accent?: string }) {
  return (
    <div className="rounded-2xl border border-[#dededb] bg-white p-4 shadow-[0_12px_30px_rgba(20,20,18,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent}`}><Icon className="h-4 w-4" /></div>
        <span className="eyebrow text-neutral-400">Live view</span>
      </div>
      <p className="eyebrow mt-5 text-neutral-500">{label}</p>
      <p className="num mt-2 text-3xl font-semibold tracking-[-0.05em]">{value}{unit ? <span className="ml-1 text-sm font-medium tracking-normal text-neutral-400">{unit}</span> : null}</p>
      <p className="mt-2 text-xs leading-5 text-neutral-500">{note}</p>
    </div>
  );
}

function SectionHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <header className="flex flex-col justify-between gap-5 border-b border-[#d9d9d6] pb-7 md:flex-row md:items-end">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-[-0.06em] text-black md:text-5xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">{description}</p>
      </div>
      {action}
    </header>
  );
}

export default function McpWorkspaceView({ latest, entries }: Props) {
  const [section, setSection] = useState<WorkspaceSection>("health");
  const [dateRange, setDateRange] = useState("7D");
  const [syncLabel, setSyncLabel] = useState("Sync now");
  const [medications, setMedications] = useState(INITIAL_MEDICATIONS);
  const [activity, setActivity] = useState(INITIAL_ACTIVITY);
  const [showAppointmentPreview, setShowAppointmentPreview] = useState(false);
  const [appointmentAdded, setAppointmentAdded] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [newReminder, setNewReminder] = useState("");

  const averageGlucose = useMemo(() => {
    const values = entries.slice(-7).map((entry) => entry.fastingGlucoseMgDl);
    return Math.round(values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1));
  }, [entries]);

  const sync = () => {
    setSyncLabel("Synced just now");
    setActivity((current) => [{ label: "Fixture sync completed", detail: "5 records checked · no conflicts", time: "Just now", tone: "black" as const }, ...current].slice(0, 4));
    window.setTimeout(() => setSyncLabel("Sync now"), 2600);
  };

  const confirmAppointment = () => {
    setAppointmentAdded(true);
    setShowAppointmentPreview(false);
    setActivity((current) => [{ label: "Appointment preview saved", detail: "No external calendar write made", time: "Just now", tone: "black" as const }, ...current].slice(0, 4));
  };

  const toggleMedication = (id: string) => {
    setMedications((current) => current.map((medication) => medication.id === id ? { ...medication, active: !medication.active } : medication));
  };

  const addReminder = () => {
    const name = newReminder.trim();
    if (!name) return;
    setMedications((current) => [...current, { id: `custom-${Date.now()}`, name, detail: "Daily · Choose a time in settings", active: true }]);
    setNewReminder("");
    setShowReminderForm(false);
    setActivity((current) => [{ label: "Reminder added", detail: `${name} · local-only fixture`, time: "Just now", tone: "black" as const }, ...current].slice(0, 4));
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Connected care / fixture mode"
        title="A calmer view of the signals around you."
        description="The first four MCP-ready workflows are here as a provider-neutral preview. Your local signals stay in this browser until you connect an external source."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <SourceBadge muted><CloudOff className="h-3 w-3" /> Fixture data</SourceBadge>
            <button className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2.5 text-xs font-bold text-white transition hover:bg-neutral-700" onClick={sync}><RefreshCw className="h-3.5 w-3.5" />{syncLabel}</button>
          </div>
        }
      />

      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard label="Latest fasting glucose" value={String(latest.fastingGlucoseMgDl)} unit="mg/dL" note={`Recorded ${formatDate(latest.timestamp)} · source: local log`} icon={HeartPulse} accent="bg-[#e4f2ed]" />
        <MetricCard label="7-day average" value={String(averageGlucose)} unit="mg/dL" note="A descriptive trend, not a diagnosis" icon={Activity} accent="bg-[#f5ead7]" />
        <MetricCard label="Next care touchpoint" value="Thu 14" note="Preparation checklist ready below" icon={CalendarDays} accent="bg-[#e9e5f4]" />
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {SECTION_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = item.id === section;
              return <button key={item.id} onClick={() => setSection(item.id)} className={`group rounded-2xl border p-4 text-left transition ${active ? "border-black bg-black text-white shadow-lg" : "border-[#dededb] bg-white hover:-translate-y-0.5 hover:border-neutral-400"}`}>
                <div className="flex items-start justify-between gap-3"><Icon className={`h-5 w-5 ${active ? "text-white" : "text-neutral-500"}`} /><span className={`eyebrow ${active ? "text-neutral-400" : "text-neutral-400"}`}>{item.kicker}</span></div>
                <p className="mt-8 text-sm font-semibold">{item.label}</p>
                <p className={`mt-1 text-xs leading-5 ${active ? "text-neutral-400" : "text-neutral-500"}`}>{item.description}</p>
              </button>;
            })}
          </div>

          <div className="mt-5 rounded-3xl border border-[#dededb] bg-white p-5 shadow-[0_16px_40px_rgba(20,20,18,0.04)] md:p-7">
            {section === "health" ? <HealthDataPanel entries={entries} dateRange={dateRange} setDateRange={setDateRange} /> : null}
            {section === "insights" ? <InsightsPanel latest={latest} averageGlucose={averageGlucose} onOpenHealth={() => setSection("health")} /> : null}
            {section === "appointments" ? <AppointmentsPanel appointmentAdded={appointmentAdded} onPreview={() => setShowAppointmentPreview(true)} /> : null}
            {section === "medications" ? <MedicationPanel medications={medications} onToggle={toggleMedication} showForm={showReminderForm} setShowForm={setShowReminderForm} newReminder={newReminder} setNewReminder={setNewReminder} onAdd={addReminder} /> : null}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-[#dededb] bg-[#11110f] p-5 text-white shadow-xl">
            <div className="flex items-start justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10"><Link2 className="h-5 w-5" /></div><span className="eyebrow text-neutral-500">MCP bridge</span></div>
            <h2 className="mt-8 text-xl font-semibold tracking-[-0.04em]">Connect when you are ready.</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-400">Bring in a calendar, task list, or approved data source without changing the way this workspace feels.</p>
            <button className="mt-5 inline-flex w-full items-center justify-between rounded-xl border border-white/20 px-3 py-3 text-left text-xs font-semibold transition hover:bg-white/10"><span>Open Connections Center</span><ArrowUpRight className="h-4 w-4" /></button>
            <div className="mt-5 flex items-center gap-2 text-xs text-neutral-400"><ShieldCheck className="h-4 w-4 text-[#b9f4db]" /> Read-only preview · no account linked</div>
          </div>

          <div className="rounded-3xl border border-[#dededb] bg-white p-5">
            <div className="flex items-center justify-between"><div><p className="eyebrow">Activity log</p><h2 className="mt-2 text-lg font-semibold tracking-[-0.04em]">What just happened</h2></div><Activity className="h-4 w-4 text-neutral-400" /></div>
            <div className="mt-5 space-y-4">{activity.map((item, index) => <div key={`${item.label}-${index}`} className="flex gap-3"><div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.tone === "black" ? "bg-black" : item.tone === "amber" ? "bg-[#d69c3b]" : "bg-neutral-300"}`} /><div className="min-w-0"><p className="text-xs font-semibold">{item.label}</p><p className="mt-1 text-[11px] leading-4 text-neutral-500">{item.detail}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[.12em] text-neutral-400">{item.time}</p></div></div>)}</div>
            <button onClick={() => setActivity((current) => [{ label: "Activity history opened", detail: "Full audit view is ready for live connections", time: "Just now", tone: "muted" as const }, ...current].slice(0, 4))} className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-neutral-600 hover:text-black">View full activity <ChevronRight className="h-3.5 w-3.5" /></button>
          </div>

          <div className="rounded-3xl border border-[#dededb] bg-[#f8f8f5] p-5"><div className="flex gap-3"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" /><p className="text-xs leading-5 text-neutral-500">External writes will always show a preview and wait for your confirmation. Nothing is sent in fixture mode.</p></div></div>
        </aside>
      </div>

      {showAppointmentPreview ? <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 backdrop-blur-sm md:items-center"><div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl md:p-8"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">External write preview</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em]">Save care-team appointment?</h2></div><button aria-label="Close preview" onClick={() => setShowAppointmentPreview(false)} className="rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-black"><X className="h-4 w-4" /></button></div><div className="mt-6 rounded-2xl border border-[#dededb] bg-[#f8f8f5] p-4"><div className="flex items-start gap-3"><CalendarDays className="mt-0.5 h-5 w-5" /><div><p className="font-semibold">DiabetX care review</p><p className="mt-1 text-sm text-neutral-500">Thursday, 14 August · 10:30–11:00 · Local time</p><p className="mt-2 text-xs leading-5 text-neutral-500">Target: not connected. This preview will be stored locally only.</p></div></div></div><div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button onClick={() => setShowAppointmentPreview(false)} className="rounded-xl px-4 py-3 text-xs font-bold text-neutral-500 hover:bg-neutral-100">Cancel</button><button onClick={confirmAppointment} className="rounded-xl bg-black px-4 py-3 text-xs font-bold text-white hover:bg-neutral-700">Confirm local preview</button></div></div></div> : null}
    </div>
  );
}

function HealthDataPanel({ entries, dateRange, setDateRange }: { entries: TwinEntry[]; dateRange: string; setDateRange: (range: string) => void }) {
  const data = entries.slice(-4).reverse();
  return <div>
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="eyebrow">Unified timeline</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em]">Signals, in one place.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">A normalized view of glucose, activity, meals, and weight. Each record keeps its source and freshness visible.</p></div><div className="flex rounded-xl border border-[#dededb] bg-[#f8f8f5] p-1">{["7D", "14D", "30D"].map((range) => <button key={range} onClick={() => setDateRange(range)} className={`rounded-lg px-3 py-2 text-[10px] font-bold tracking-[.12em] ${dateRange === range ? "bg-black text-white" : "text-neutral-500"}`}>{range}</button>)}</div></div>
    <div className="mt-7 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-[#eef7f2] p-4"><p className="eyebrow text-neutral-500">Glucose</p><p className="num mt-2 text-xl font-semibold">{entries[entries.length - 1]?.fastingGlucoseMgDl ?? "—"}<span className="ml-1 text-xs font-normal text-neutral-500">mg/dL</span></p><p className="mt-2 text-xs text-neutral-500">latest fasting reading</p></div><div className="rounded-2xl bg-[#faf1df] p-4"><p className="eyebrow text-neutral-500">Movement</p><p className="num mt-2 text-xl font-semibold">{entries[entries.length - 1]?.exerciseMinutesPerWeek ?? "—"}<span className="ml-1 text-xs font-normal text-neutral-500">min/wk</span></p><p className="mt-2 text-xs text-neutral-500">logged activity signal</p></div><div className="rounded-2xl bg-[#eeeaf7] p-4"><p className="eyebrow text-neutral-500">Data window</p><p className="num mt-2 text-xl font-semibold">{dateRange}</p><p className="mt-2 text-xs text-neutral-500">fixture records in view</p></div></div>
    <div className="mt-7 overflow-hidden rounded-2xl border border-[#dededb]"><div className="grid grid-cols-[1.2fr_.8fr_.8fr_auto] gap-3 border-b border-[#dededb] bg-[#f8f8f5] px-4 py-3 text-[10px] font-bold uppercase tracking-[.12em] text-neutral-400"><span>Record</span><span>Value</span><span>Occurred</span><span>Source</span></div>{data.map((entry) => <div key={entry.id} className="grid grid-cols-[1.2fr_.8fr_.8fr_auto] items-center gap-3 border-b border-[#eeeeeb] px-4 py-4 last:border-0"><div><p className="text-xs font-semibold">Fasting glucose</p><p className="mt-1 text-[11px] text-neutral-500">Recorded with your daily entry</p></div><span className="num text-sm font-semibold">{entry.fastingGlucoseMgDl} <span className="text-[10px] font-medium text-neutral-400">mg/dL</span></span><span className="text-xs text-neutral-500">{formatDate(entry.timestamp)}</span><SourceBadge>Local log</SourceBadge></div>)}</div>
  </div>;
}

function InsightsPanel({ latest, averageGlucose, onOpenHealth }: { latest: TwinEntry; averageGlucose: number; onOpenHealth: () => void }) {
  return <div><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Grounded reflection</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em]">Your week, without the noise.</h2></div><Sparkles className="h-5 w-5 text-neutral-400" /></div><div className="mt-7 rounded-2xl bg-[#11110f] p-5 text-white md:p-7"><div className="flex items-center gap-2 text-[#b9f4db]"><Sparkles className="h-4 w-4" /><span className="eyebrow text-[#b9f4db]">Fixture insight · informational</span></div><p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-200">Your latest fasting glucose is <strong className="text-white">{latest.fastingGlucoseMgDl} mg/dL</strong>, while the recent average in view is <strong className="text-white">{averageGlucose} mg/dL</strong>. That gives you a concrete trend to discuss with your care team alongside sleep, movement, and meal context.</p><div className="mt-6 flex flex-wrap gap-2"><span className="rounded-full border border-white/15 px-3 py-2 text-xs text-neutral-400">3 entries reviewed</span><span className="rounded-full border border-white/15 px-3 py-2 text-xs text-neutral-400">No clinical conclusion</span></div></div><div className="mt-5 grid gap-3 md:grid-cols-3"><div className="rounded-2xl border border-[#dededb] p-4"><p className="eyebrow">Observed trend</p><p className="mt-3 text-sm font-semibold">Glucose is moving down across the latest entries.</p></div><div className="rounded-2xl border border-[#dededb] p-4"><p className="eyebrow">Data caveat</p><p className="mt-3 text-sm font-semibold">This view has a small sample and local-only coverage.</p></div><div className="rounded-2xl border border-[#dededb] p-4"><p className="eyebrow">Next step</p><p className="mt-3 text-sm font-semibold">Bring the timeline to your next appointment.</p></div></div><button onClick={onOpenHealth} className="mt-6 inline-flex items-center gap-2 text-xs font-bold hover:underline">View supporting records <ArrowUpRight className="h-3.5 w-3.5" /></button><p className="mt-5 border-t border-[#dededb] pt-5 text-xs leading-5 text-neutral-500">DiabetX insights are educational reflections, not a diagnosis or treatment recommendation. If you feel unwell, contact an appropriate healthcare professional.</p></div>;
}

function AppointmentsPanel({ appointmentAdded, onPreview }: { appointmentAdded: boolean; onPreview: () => void }) {
  return <div><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="eyebrow">Care calendar</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em]">Arrive with better questions.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">A read-only calendar preview today, with confirmation-gated writes ready for a connected provider.</p></div><SourceBadge muted><CloudOff className="h-3 w-3" /> Not connected</SourceBadge></div><div className="mt-7 grid gap-5 lg:grid-cols-[1fr_.8fr]"><div className="rounded-2xl border border-[#dededb] bg-[#f8f8f5] p-5"><div className="flex items-start justify-between gap-3"><div className="flex gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white"><Stethoscope className="h-5 w-5" /></div><div><p className="text-sm font-semibold">DiabetX care review</p><p className="mt-1 text-xs text-neutral-500">Thursday, 14 August · 10:30–11:00</p></div></div><span className="rounded-full bg-[#e4f2ed] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-neutral-600">Upcoming</span></div><div className="mt-6 space-y-3"><div className="flex items-center gap-3 text-xs text-neutral-600"><Check className="h-4 w-4 text-[#3f9575]" /> Review recent glucose timeline</div><div className="flex items-center gap-3 text-xs text-neutral-600"><Check className="h-4 w-4 text-[#3f9575]" /> Note your biggest questions</div><div className="flex items-center gap-3 text-xs text-neutral-400"><TimerReset className="h-4 w-4" /> Add a medication update</div></div><button onClick={onPreview} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-4 py-3 text-xs font-bold text-white hover:bg-neutral-700">{appointmentAdded ? "Preview saved locally" : "Preview calendar write"}<ArrowUpRight className="h-3.5 w-3.5" /></button></div><div className="rounded-2xl border border-[#dededb] p-5"><p className="eyebrow">Prep note</p><p className="mt-3 text-sm font-semibold leading-6">Take the last 7–14 days of context, not just a single number.</p><p className="mt-3 text-xs leading-5 text-neutral-500">The health data hub keeps source, date, and unit visible so your care conversation starts from shared context.</p><button onClick={onPreview} className="mt-5 inline-flex items-center gap-2 text-xs font-bold hover:underline">Add a local placeholder <Plus className="h-3.5 w-3.5" /></button></div></div></div>;
}

function MedicationPanel({ medications, onToggle, showForm, setShowForm, newReminder, setNewReminder, onAdd }: { medications: typeof INITIAL_MEDICATIONS; onToggle: (id: string) => void; showForm: boolean; setShowForm: (show: boolean) => void; newReminder: string; setNewReminder: (value: string) => void; onAdd: () => void }) {
  return <div><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="eyebrow">Routine support</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em]">Keep the next small thing visible.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">Local reminders are the source of truth in this preview. Optional task or calendar sync can be added after you connect a provider.</p></div><button onClick={() => setShowForm(!showForm)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-xs font-bold text-white hover:bg-neutral-700"><Plus className="h-3.5 w-3.5" /> Add reminder</button></div>{showForm ? <div className="mt-5 flex flex-col gap-2 rounded-2xl border border-[#dededb] bg-[#f8f8f5] p-4 sm:flex-row"><input autoFocus value={newReminder} onChange={(event) => setNewReminder(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") onAdd(); }} placeholder="e.g. Evening walk" className="min-w-0 flex-1 rounded-xl border border-[#d8d8d4] bg-white px-3 py-3 text-sm outline-none ring-black/10 focus:ring-4" /><button onClick={onAdd} className="rounded-xl bg-black px-4 py-3 text-xs font-bold text-white">Save locally</button></div> : null}<div className="mt-7 space-y-3">{medications.map((medication) => <div key={medication.id} className="flex items-center justify-between gap-4 rounded-2xl border border-[#dededb] p-4"><div className="flex min-w-0 items-center gap-3"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${medication.active ? "bg-[#e4f2ed]" : "bg-[#f0f0ec]"}`}><BellRing className="h-4 w-4" /></div><div className="min-w-0"><p className="truncate text-sm font-semibold">{medication.name}</p><p className="mt-1 truncate text-xs text-neutral-500">{medication.detail}</p></div></div><button onClick={() => onToggle(medication.id)} className={`relative h-7 w-12 shrink-0 rounded-full p-1 transition ${medication.active ? "bg-black" : "bg-[#d6d6d1]"}`} aria-label={`${medication.active ? "Pause" : "Resume"} ${medication.name}`}><span className={`block h-5 w-5 rounded-full bg-white shadow-sm transition ${medication.active ? "translate-x-5" : "translate-x-0"}`} /></button></div>)}</div><div className="mt-6 flex gap-3 rounded-2xl bg-[#f8f8f5] p-4"><ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" /><p className="text-xs leading-5 text-neutral-500">A reminder only signals a planned routine. It does not confirm that medication was taken and should not be used to change a prescription.</p></div></div>;
}
