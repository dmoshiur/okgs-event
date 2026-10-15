import Link from "next/link";
import { Icon } from "@/app/components/Icons";
import CornerFrame from "@/app/components/CornerFrame";

// Shown for admin modules whose data model is not defined yet. It states that plainly
// instead of displaying invented figures.
export default function ModulePlaceholder({ title, description, icon = "collections" }) {
  return (
    <div>
      <p className="eyebrow">Event console</p>
      <h1 className="font-display text-[clamp(1.9rem,3.6vw,2.6rem)] font-semibold tracking-tight text-ink-950">
        {title}
      </h1>
      <p className="page-lead">{description}</p>

      <div className="relative mt-8 flex flex-col items-start gap-4 border border-dashed border-line-strong bg-surface p-8 sm:flex-row sm:items-center">
        <CornerFrame size={34} inset={10} tone="gold" />
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xs bg-ink-950 text-gold">
          <Icon name={icon} />
        </div>
        <div className="relative flex-1">
          <p className="font-display font-semibold text-ink-900">Not connected yet</p>
          <p className="mt-1 text-sm leading-6 text-muted">
            This module needs its own data tables before it can record figures. Until then no amounts
            are shown here, so nothing is reported that has not been entered.
          </p>
        </div>
        <Link href="/admin" className="btn btn-outline btn-sm relative">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
