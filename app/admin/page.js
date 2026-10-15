"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/app/components/Icons";
import CornerFrame from "@/app/components/CornerFrame";
import SupportContact from "@/app/components/SupportContact";
import { DEFAULT_SUPPORT_PHONE } from "@/lib/constants";

const NOT_AVAILABLE = "—";

function formatCount(value) {
  return typeof value === "number" ? value.toLocaleString("en-US") : NOT_AVAILABLE;
}

function MetricCard({ tone = "light", eyebrow, value, children, className = "" }) {
  const dark = tone === "dark";
  return (
    <section className={`stat-card ${dark ? "stat-card-dark" : ""} ${className}`}>
      <CornerFrame size={dark ? 34 : 28} inset={9} tone={dark ? "gold-soft" : "gold"} />
      <p className="stat-label relative">{eyebrow}</p>
      <p className="stat-value relative" aria-label={value === NOT_AVAILABLE ? "Not available" : undefined}>
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

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [supportPhone, setSupportPhone] = useState(DEFAULT_SUPPORT_PHONE);

  const loadDashboard = useCallback(async () => {
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        fetch("/api/admin/stats", { cache: "no-store" }),
        fetch("/api/admin/analytics", { cache: "no-store" }),
      ]);
      if (!statsRes.ok || !analyticsRes.ok) throw new Error("dashboard");
      setStats(await statsRes.json());
      setAnalytics(await analyticsRes.json());
      setLoadError("");
    } catch {
      setLoadError("Live figures could not be loaded. Refresh to try again.");
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    fetch("/api/admin/config")
      .then((res) => (res.ok ? res.json() : null))
      .then((config) => config?.support_phone && setSupportPhone(config.support_phone))
      .catch(() => {});
  }, [loadDashboard]);

  const batches = analytics?.batches || [];
  const topBatches = batches.slice(0, 5);
  const admitted = stats?.admitted_at_gate;
  const inside = stats?.inside_now;
  const exited = stats?.exited_now;
  const insideShare = typeof admitted === "number" && admitted > 0 ? Math.round((inside / admitted) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Event console</p>
          <h1 className="font-display text-[clamp(2rem,4vw,2.9rem)] font-semibold leading-tight tracking-tight text-ink-950">
            Dashboard
          </h1>
          <p className="page-lead">Live overview of registrations, batches, and gate activity.</p>
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

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard tone="dark" eyebrow="Total Registered Users" value={formatCount(stats?.registered)}>
          <Row label="Not yet admitted" value={formatCount(stats?.not_yet_admitted)} />
          <Row label="Admitted at gate" value={formatCount(stats?.admitted_at_gate)} />
        </MetricCard>

        <MetricCard eyebrow="Batch-wise User Count" value={formatCount(batches.length)}>
          {topBatches.length === 0 ? (
            <p className="text-muted">No registrations yet.</p>
          ) : (
            topBatches.map((row) => <Row key={row.batch} label={row.batch} value={formatCount(row.registered)} />)
          )}
          {batches.length > 5 ? <p className="text-xs text-muted">+ {batches.length - 5} more batches</p> : null}
          <Link href="/admin/analytics" className="link-underline inline-block pt-1 text-xs">
            Open batch analytics
          </Link>
        </MetricCard>

        <MetricCard eyebrow="Admitted at Gate" value={formatCount(admitted)}>
          <Row label="Admitted today" value={formatCount(stats?.admitted_today)} strong />
          <Row label="Check-ins today" value={formatCount(stats?.check_ins_today)} />
          <Row label="Exits today" value={formatCount(stats?.exits_today)} />
        </MetricCard>

        <MetricCard eyebrow="Currently Inside vs Exited" value={`${formatCount(inside)} / ${formatCount(exited)}`}>
          <div>
            <div
              className="meter"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={insideShare}
              aria-label="Share of admitted attendees still inside"
            >
              <i style={{ width: `${insideShare}%` }} />
            </div>
            <p className="mt-2 text-xs text-muted">
              Inside: {formatCount(inside)} • Exited: {formatCount(exited)}
            </p>
          </div>
        </MetricCard>
      </div>

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
