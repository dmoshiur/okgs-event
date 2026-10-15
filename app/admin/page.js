"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/app/components/Icons";

const READ_KEY = "okgs-read-notices";
const FILTERS = ["All", "Science Fair", "Notice", "Update", "Unread"];
const CATEGORIES = ["Science Fair", "Notice", "Update"];
const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "Asia/Dhaka" });

// Finance figures are not recorded yet, so they render as a dash rather than a made-up total.
const NOT_CONNECTED = "—";

function formatCount(value) {
  return typeof value === "number" ? value.toLocaleString("en-US") : NOT_CONNECTED;
}

function MetricCard({ tone = "light", eyebrow, value, children, className = "" }) {
  const dark = tone === "dark";
  return (
    <section
      className={`flex flex-col rounded-2xl border p-5 ${
        dark ? "border-slate-900 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-900"
      } ${className}`}
    >
      <p className={`text-[11px] font-bold uppercase tracking-[0.16em] ${dark ? "text-amber-300" : "text-slate-500"}`}>
        {eyebrow}
      </p>
      <p className="mt-2 font-serif text-3xl font-bold tracking-tight" aria-label={value === NOT_CONNECTED ? "Not connected" : undefined}>
        {value}
      </p>
      <div className={`mt-4 space-y-2 text-sm ${dark ? "text-white/70" : "text-slate-600"}`}>{children}</div>
    </section>
  );
}

function Row({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className={strong ? "font-bold" : "font-semibold"}>{value}</span>
    </div>
  );
}

function NoticeCard({ notice, read, onToggle, onDelete, deleting }) {
  const [open, setOpen] = useState(false);
  const date = notice.created_at ? DATE_FORMAT.format(new Date(notice.created_at)) : "";

  function toggle() {
    setOpen((value) => !value);
    if (!open) onToggle(notice.id);
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
        >
          <span
            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${read ? "bg-slate-300" : "bg-amber-500"}`}
            title={read ? "Read" : "Unread"}
          />
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-900">{notice.title}</span>
              {notice.urgent ? (
                <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  Urgent
                </span>
              ) : null}
            </span>
            <span className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
              <span className="rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-800">{notice.category}</span>
              {date ? <span>{date}</span> : null}
            </span>
          </span>
          <Icon name={open ? "chevronUp" : "chevronDown"} className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(notice.id)}
          disabled={deleting}
          aria-label={`Delete notice: ${notice.title}`}
          className="rounded-full p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
        >
          <Icon name="trash" className="h-4 w-4" />
        </button>
      </div>
      {open ? (
        <p className="mt-3 whitespace-pre-line border-t border-slate-100 pt-3 text-sm leading-6 text-slate-600">
          {notice.body || "No further details."}
        </p>
      ) : null}
    </article>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [notices, setNotices] = useState([]);
  const [readIds, setReadIds] = useState(() => new Set());
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ title: "", body: "", category: "Notice", urgent: false });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loadError, setLoadError] = useState("");

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats", { cache: "no-store" });
      if (!res.ok) throw new Error("stats");
      setStats(await res.json());
      setLoadError("");
    } catch {
      setLoadError("Live figures could not be loaded. Refresh to try again.");
    }
  }, []);

  const loadNotices = useCallback(async () => {
    try {
      const res = await fetch("/api/notices", { cache: "no-store" });
      if (res.ok) setNotices((await res.json()).notices || []);
    } catch {
      setMessage({ type: "error", text: "Notices could not be loaded." });
    }
  }, []);

  useEffect(() => {
    loadStats();
    loadNotices();
    try {
      const stored = JSON.parse(window.localStorage.getItem(READ_KEY) || "[]");
      setReadIds(new Set(Array.isArray(stored) ? stored : []));
    } catch {
      setReadIds(new Set());
    }
  }, [loadStats, loadNotices]);

  function markRead(id) {
    setReadIds((previous) => {
      if (previous.has(id)) return previous;
      const next = new Set(previous);
      next.add(id);
      try {
        window.localStorage.setItem(READ_KEY, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }

  const visibleNotices = useMemo(() => {
    if (filter === "All") return notices;
    if (filter === "Unread") return notices.filter((notice) => !readIds.has(notice.id));
    return notices.filter((notice) => notice.category === filter);
  }, [filter, notices, readIds]);

  const unreadCount = notices.filter((notice) => !readIds.has(notice.id)).length;

  async function publish(event) {
    event.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to publish this notice.");
      setNotices((previous) => [data.notice, ...previous]);
      setDraft({ title: "", body: "", category: "Notice", urgent: false });
      setShowForm(false);
      setMessage({ type: "success", text: "Notice published." });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }

  async function removeNotice(id) {
    if (!window.confirm("Delete this notice? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/notices/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Unable to delete this notice.");
      setNotices((previous) => previous.filter((notice) => notice.id !== id));
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-4xl font-bold tracking-tight text-slate-950">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Live overview of collections, students, and gate activity.</p>
        </div>
        <Link
          href="/admin/scan"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
        >
          <Icon name="scan" className="h-4 w-4" /> Open gate scanner
        </Link>
      </div>

      {loadError ? (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {loadError}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard tone="dark" eyebrow="Fair Collections (Paid)" value={`৳ ${NOT_CONNECTED}`}>
          <div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0} aria-label="Paid share">
              <div className="h-full w-0 rounded-full bg-amber-400" />
            </div>
            <p className="mt-2 text-xs">Paid share — not connected yet</p>
          </div>
          <p className="border-t border-white/10 pt-3 text-xs">Class-wise balance appears once fee records exist.</p>
        </MetricCard>

        <MetricCard eyebrow="Current Balance" value={`৳ ${NOT_CONNECTED}`}>
          <Row label="Fees" value={NOT_CONNECTED} />
          <Row label="Guests" value={NOT_CONNECTED} />
          <Row label="Lunch" value={NOT_CONNECTED} />
          <Row label="Expenses" value={NOT_CONNECTED} />
          <div className="border-t border-slate-100 pt-2">
            <Row label="Surplus" value={NOT_CONNECTED} strong />
          </div>
        </MetricCard>

        <MetricCard eyebrow="Pending Funds" value={`৳ ${NOT_CONNECTED}`}>
          <p>Amounts awaiting verification will be listed here.</p>
        </MetricCard>

        <MetricCard eyebrow="Expenses" value={`৳ ${NOT_CONNECTED}`}>
          <p>Total event expenses across all approved memos.</p>
        </MetricCard>

        <MetricCard eyebrow="Students Paid" value={`${NOT_CONNECTED} / ${formatCount(stats?.registered)}`}>
          <Row label="Paid" value={NOT_CONNECTED} />
          <Row label="Unpaid roster" value={NOT_CONNECTED} />
          <Row label="Registered attendees" value={formatCount(stats?.registered)} strong />
        </MetricCard>

        <MetricCard eyebrow="Admitted At The Gate" value={formatCount(stats?.inside_now)}>
          <Row label="Inside now" value={formatCount(stats?.inside_now)} strong />
          <Row label="Admitted today" value={formatCount(stats?.admitted_today)} />
          <Row label="Exits today" value={formatCount(stats?.exits_today)} />
          <Row label="Duplicates / invalids" value={NOT_CONNECTED} />
        </MetricCard>
      </div>

      <section aria-labelledby="notices-heading" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="notices-heading" className="font-serif text-2xl font-bold text-slate-950">Notices &amp; Updates</h2>
            <p className="text-xs text-slate-500">{unreadCount} unread on this device</p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((value) => !value)}
            aria-expanded={showForm}
            className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            <Icon name={showForm ? "close" : "plus"} className="h-4 w-4" />
            {showForm ? "Cancel" : "New notice"}
          </button>
        </div>

        <div role="tablist" aria-label="Filter notices" className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((item) => {
            const active = filter === item;
            return (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(item)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                  active ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {item}
                {item === "Unread" && unreadCount > 0 ? ` (${unreadCount})` : ""}
              </button>
            );
          })}
        </div>

        {showForm ? (
          <form onSubmit={publish} className="mt-5 grid gap-4 rounded-2xl bg-slate-50 p-4 md:grid-cols-2">
            <label className="block text-xs font-semibold text-slate-700 md:col-span-2">
              Title
              <input
                required
                maxLength={160}
                value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-amber-500"
              />
            </label>
            <label className="block text-xs font-semibold text-slate-700 md:col-span-2">
              Details
              <textarea
                rows={3}
                maxLength={2000}
                value={draft.body}
                onChange={(event) => setDraft({ ...draft, body: event.target.value })}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-amber-500"
              />
            </label>
            <label className="block text-xs font-semibold text-slate-700">
              Category
              <select
                value={draft.category}
                onChange={(event) => setDraft({ ...draft, category: event.target.value })}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-amber-500"
              >
                {CATEGORIES.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 self-end pb-2.5 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={draft.urgent}
                onChange={(event) => setDraft({ ...draft, urgent: event.target.checked })}
                className="h-4 w-4 rounded border-slate-300"
              />
              Mark as urgent
            </label>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
              >
                {saving ? "Publishing…" : "Publish notice"}
              </button>
            </div>
          </form>
        ) : null}

        {message.text ? (
          <p
            role={message.type === "error" ? "alert" : "status"}
            className={`mt-4 rounded-xl px-4 py-2.5 text-sm ${
              message.type === "error" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {message.text}
          </p>
        ) : null}

        <div className="mt-5 space-y-3">
          {visibleNotices.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
              {filter === "Unread" ? "You are all caught up." : "No notices in this category yet."}
            </p>
          ) : (
            visibleNotices.map((notice) => (
              <NoticeCard
                key={notice.id}
                notice={notice}
                read={readIds.has(notice.id)}
                onToggle={markRead}
                onDelete={removeNotice}
                deleting={deletingId === notice.id}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
