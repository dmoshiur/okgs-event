"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import CornerFrame from "@/app/components/CornerFrame";
import { Icon } from "@/app/components/Icons";

const READ_KEY = "okgs-read-notices";
const FILTERS = ["All", "Science Fair", "Notice", "Update", "Unread"];
const CATEGORIES = ["Science Fair", "Notice", "Update"];
const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "Asia/Dhaka" });

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

/** Notice board: list, filter, read-tracking, publish, and delete for event notices. */
export default function NoticeBoard() {
  const [notices, setNotices] = useState([]);
  const [readIds, setReadIds] = useState(() => new Set());
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ title: "", body: "", category: "Notice", urgent: false });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const loadNotices = useCallback(async () => {
    try {
      const res = await fetch("/api/notices", { cache: "no-store" });
      if (res.ok) setNotices((await res.json()).notices || []);
    } catch {
      setMessage({ type: "error", text: "Notices could not be loaded." });
    }
  }, []);

  useEffect(() => {
    loadNotices();
    try {
      const stored = JSON.parse(window.localStorage.getItem(READ_KEY) || "[]");
      setReadIds(new Set(Array.isArray(stored) ? stored : []));
    } catch {
      setReadIds(new Set());
    }
  }, [loadNotices]);

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
    <section aria-labelledby="notices-heading" className="relative border border-line bg-surface p-5 sm:p-6">
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

      <div role="tablist" aria-label="Filter notices" className="relative mt-5 flex gap-2 overflow-x-auto pb-1">
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
  );
}
