"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/app/components/Icons";
import CornerFrame from "@/app/components/CornerFrame";
import SupportContact from "@/app/components/SupportContact";
import { DEFAULT_SUPPORT_PHONE } from "@/lib/constants";

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
    <section className={`stat-card ${dark ? "stat-card-dark" : ""} ${className}`}>
      <CornerFrame size={dark ? 34 : 28} inset={9} tone={dark ? "gold-soft" : "gold"} />
      <p className="stat-label relative">{eyebrow}</p>
      <p
        className="stat-value relative"
        aria-label={value === NOT_CONNECTED ? "Not connected" : undefined}
      >
        {value}
      </p>
      <div className="relative mt-4 space-y-2 text-[0.85rem]">{children}</div>
    </section>
  );
}

function Row({ label, value, strong = false }) {
  return (
    <div className="stat-row">
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
    <article className="border border-line bg-surface p-4">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
        >
          <span
            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${read ? "bg-line-strong" : "bg-gold"}`}
            title={read ? "Read" : "Unread"}
          />
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-display text-[1.02rem] font-semibold text-ink-900">{notice.title}</span>
              {notice.urgent ? <span className="tag tag-error uppercase">Urgent</span> : null}
            </span>
            <span className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-muted">
              <span className="tag tag-gold">{notice.category}</span>
              {date ? <span>{date}</span> : null}
            </span>
          </span>
          <Icon name={open ? "chevronUp" : "chevronDown"} className="mt-1 h-4 w-4 shrink-0 text-muted-2" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(notice.id)}
          disabled={deleting}
          aria-label={`Delete notice: ${notice.title}`}
          className="rounded-xs p-1.5 text-muted-2 hover:bg-state-error-bg hover:text-state-error disabled:opacity-40"
        >
          <Icon name="trash" className="h-4 w-4" />
        </button>
      </div>
      {open ? (
        <p className="mt-3 whitespace-pre-line border-t border-line pt-3 text-sm leading-6 text-body-soft">
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
  const [supportPhone, setSupportPhone] = useState(DEFAULT_SUPPORT_PHONE);

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
    fetch("/api/admin/config")
      .then((res) => (res.ok ? res.json() : null))
      .then((config) => config?.support_phone && setSupportPhone(config.support_phone))
      .catch(() => {});
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
          <p className="eyebrow">Event console</p>
          <h1 className="font-display text-[clamp(2rem,4vw,2.9rem)] font-semibold leading-tight tracking-tight text-ink-950">
            Dashboard
          </h1>
          <p className="page-lead">Live overview of collections, students, and gate activity.</p>
        </div>
        <Link href="/admin/scan" className="btn btn-ink btn-shine self-start sm:self-auto">
          <Icon name="scan" className="h-4 w-4" /> Open gate scanner
        </Link>
      </div>

      {loadError ? (
        <p role="alert" className="alert alert-error">
          {loadError}
        </p>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard tone="dark" eyebrow="Fair Collections (Paid)" value={`৳ ${NOT_CONNECTED}`}>
          <div>
            <div
              className="meter"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={0}
              aria-label="Paid share"
            >
              <i style={{ width: "0%" }} />
            </div>
            <p className="mt-2 text-xs">Paid share — not connected yet</p>
          </div>
          <p className="border-t border-white/10 pt-3 text-xs">
            Class-wise balance appears once fee records exist.
          </p>
        </MetricCard>

        <MetricCard eyebrow="Current Balance" value={`৳ ${NOT_CONNECTED}`}>
          <Row label="Fees" value={NOT_CONNECTED} />
          <Row label="Guests" value={NOT_CONNECTED} />
          <Row label="Lunch" value={NOT_CONNECTED} />
          <Row label="Expenses" value={NOT_CONNECTED} />
          <div className="border-t border-line pt-2">
            <Row label="Surplus" value={NOT_CONNECTED} strong />
          </div>
        </MetricCard>

        <MetricCard eyebrow="Pending Funds" value={`৳ ${NOT_CONNECTED}`}>
          <p className="text-muted">Amounts awaiting verification will be listed here.</p>
        </MetricCard>

        <MetricCard eyebrow="Expenses" value={`৳ ${NOT_CONNECTED}`}>
          <p className="text-muted">Total event expenses across all approved memos.</p>
        </MetricCard>

        <MetricCard
          eyebrow="Students Paid"
          value={`${NOT_CONNECTED} / ${formatCount(stats?.registered)}`}
        >
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

      <section
        aria-labelledby="notices-heading"
        className="relative border border-line bg-surface p-5 sm:p-6"
      >
        <CornerFrame size={46} inset={10} tone="gold" className="hidden sm:block" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">Notice board</p>
            <h2 id="notices-heading" className="font-display text-2xl font-semibold text-ink-950">
              Notices &amp; Updates
            </h2>
            <p className="mt-1 text-xs text-muted">{unreadCount} unread on this device</p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((value) => !value)}
            aria-expanded={showForm}
            className="btn btn-outline btn-sm self-start"
          >
            <Icon name={showForm ? "close" : "plus"} className="h-4 w-4" />
            {showForm ? "Cancel" : "New notice"}
          </button>
        </div>

        <div
          role="tablist"
          aria-label="Filter notices"
          className="relative mt-5 flex gap-2 overflow-x-auto pb-1"
        >
          {FILTERS.map((item) => {
            const active = filter === item;
            return (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(item)}
                className={`tab ${active ? "tab-active" : ""}`}
              >
                {item}
                {item === "Unread" && unreadCount > 0 ? ` (${unreadCount})` : ""}
              </button>
            );
          })}
        </div>

        {showForm ? (
          <form
            onSubmit={publish}
            className="relative mt-5 grid gap-4 border border-line bg-paper-2 p-4 md:grid-cols-2"
          >
            <label className="field md:col-span-2">
              <span className="field-label">Title</span>
              <input
                required
                maxLength={160}
                value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                className="input"
              />
            </label>
            <label className="field md:col-span-2">
              <span className="field-label">Details</span>
              <textarea
                rows={3}
                maxLength={2000}
                value={draft.body}
                onChange={(event) => setDraft({ ...draft, body: event.target.value })}
                className="textarea"
              />
            </label>
            <label className="field">
              <span className="field-label">Category</span>
              <select
                value={draft.category}
                onChange={(event) => setDraft({ ...draft, category: event.target.value })}
                className="select"
              >
                {CATEGORIES.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label className="checkbox-row self-end pb-3.5">
              <input
                type="checkbox"
                checked={draft.urgent}
                onChange={(event) => setDraft({ ...draft, urgent: event.target.checked })}
              />
              Mark as urgent
            </label>
            <div className="md:col-span-2">
              <button type="submit" disabled={saving} className="btn btn-ink btn-sm">
                {saving ? "Publishing…" : "Publish notice"}
              </button>
            </div>
          </form>
        ) : null}

        {message.text ? (
          <p
            role={message.type === "error" ? "alert" : "status"}
            className={`alert relative mt-4 ${message.type === "error" ? "alert-error" : "alert-success"}`}
          >
            {message.text}
          </p>
        ) : null}

        <div className="relative mt-5 space-y-3">
          {visibleNotices.length === 0 ? (
            <p className="border border-dashed border-line-strong p-6 text-center text-sm text-muted">
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

      <section className="relative border border-line bg-paper-2 p-5">
        <CornerFrame size={30} inset={8} tone="ink" />
        <p className="eyebrow relative">Dashboard help</p>
        <p className="relative text-sm font-semibold text-ink-900">
          Need help with the scanner, passes, or staff access?
        </p>
        <SupportContact phone={supportPhone} className="relative mt-2 text-sm leading-6 text-body-soft" />
      </section>
    </div>
  );
}
