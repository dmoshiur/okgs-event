import Link from "next/link";
import { Icon } from "@/app/components/Icons";

// Shown for admin modules whose data model is not defined yet. It states that plainly
// instead of displaying invented figures.
export default function ModulePlaceholder({ title, description, icon = "collections" }) {
  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-slate-900">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">{description}</p>

      <div className="mt-8 flex flex-col items-start gap-4 rounded-2xl border border-dashed border-slate-300 bg-white p-8 sm:flex-row sm:items-center">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-amber-400">
          <Icon name={icon} />
        </div>
        <div className="flex-1">
          <p className="font-bold text-slate-900">Not connected yet</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            This module needs its own data tables before it can record figures. Until then no amounts are shown here,
            so nothing is reported that has not been entered.
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
