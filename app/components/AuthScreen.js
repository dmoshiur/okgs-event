import { ViewportFrame } from "@/app/components/CornerFrame";
import { THEME_VIDEO_URL } from "@/lib/constants";

/**
 * Shared full-screen canvas for the public sign-in / registration / recovery
 * screens: the school montage video, a deep-navy overlay tint, and 90-degree
 * corner brackets framing the viewport itself.
 */
export { THEME_VIDEO_URL };

export default function AuthScreen({ children, className = "" }) {
  return (
    <main
      className={`relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-950 px-4 py-10 sm:px-6 ${className}`.trim()}
    >
      <video
        aria-hidden="true"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="fixed inset-0 h-full w-full object-cover"
      >
        <source src={THEME_VIDEO_URL} type="video/mp4" />
      </video>

      {/* Subtle dark overlay over the video background. */}
      <div aria-hidden="true" className="fixed inset-0 bg-ink-950/72" />
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-[radial-gradient(900px_520px_at_108%_-12%,rgba(29,91,191,0.28),transparent_58%)]"
      />
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-[linear-gradient(135deg,rgba(5,13,24,0.55),rgba(5,13,24,0.12)_48%,rgba(5,13,24,0.62))]"
      />

      {/* Viewport-level 90-degree framing. */}
      <ViewportFrame size={150} inset={26} tone="gold-soft" className="hidden md:block" />
      <ViewportFrame size={64} inset={14} tone="gold-soft" className="md:hidden" />

      {children}
    </main>
  );
}
