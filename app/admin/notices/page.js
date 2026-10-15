"use client";
import NoticeBoard from "@/app/components/NoticeBoard";

export default function NoticesPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Event communications</p>
        <h1 className="font-display text-[clamp(2rem,4vw,2.9rem)] font-semibold leading-tight tracking-tight text-ink-950">
          Notices
        </h1>
        <p className="page-lead">Publish event notices and updates for attendees and staff.</p>
      </div>
      <NoticeBoard />
    </div>
  );
}
