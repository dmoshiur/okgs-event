/**
 * 90-DEGREE CORNER FRAME ENGINE
 *
 * Renders four precise right-angle brackets (thin L-shaped strokes) inside the
 * edges of a relatively positioned parent — the signature framing device of the
 * thinktank-academia.onrender.com theme (see `.cta-banner::before/::after`
 * in the reference stylesheet, generalised here to all four corners).
 *
 * Usage:
 *   <div className="relative">
 *     <CornerFrame size={64} inset={12} tone="gold" />
 *     ...content...
 *   </div>
 *
 * Every dimension can be a number (pixels) or any CSS length string — including
 * a `clamp()` so one bracket set scales smoothly from phone to desktop:
 *
 *   <CornerFrame size="clamp(34px, 11vw, 56px)" inset={10} tone="amber" />
 *
 * `tone` picks one of the presets in globals.css (`gold`, `gold-soft`, `amber`,
 * `amber-soft`, `ink`, `white`, plus `hairline` for a 1px stroke). Any other
 * colour can be forced from the outside with a Tailwind arbitrary variant, for
 * example `[&>span]:border-amber-500/60`.
 */

/*
 * Tone presets, written out as complete literal class names on purpose: Tailwind
 * only keeps `@layer components` rules whose class name it can find in the
 * source, so a `corner-frame--${tone}` template string gets tree-shaken away and
 * every frame silently falls back to the default gold. Resolving the class
 * through this map keeps the presets in the built stylesheet.
 */
const FRAME_TONES = {
  gold: "corner-frame--gold",
  "gold-soft": "corner-frame--gold-soft",
  amber: "corner-frame--amber",
  "amber-soft": "corner-frame--amber-soft",
  ink: "corner-frame--ink",
  white: "corner-frame--white",
  hairline: "corner-frame--hairline",
};

const toneClass = (tone) => FRAME_TONES[tone] || `corner-frame--${tone}`;

export default function CornerFrame({
  size = 64,
  inset = 12,
  thickness = 1,
  tone = "gold",
  className = "",
  style,
}) {
  const toLength = (value) => (typeof value === "number" ? `${value}px` : value);

  return (
    <span
      aria-hidden="true"
      className={`corner-frame ${toneClass(tone)} ${className}`.trim()}
      style={{
        "--frame-size": toLength(size),
        "--frame-inset": toLength(inset),
        "--frame-thickness": toLength(thickness),
        ...style,
      }}
    >
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

/**
 * Full-viewport framing: brackets pinned to the corners of the screen rather
 * than to a card. Used on the sign-in and public registration screens so the
 * video viewport itself carries the 90-degree framing aesthetic.
 */
export function ViewportFrame({ size = 120, inset = 22, tone = "gold", className = "", style }) {
  const toLength = (value) => (typeof value === "number" ? `${value}px` : value);

  return (
    <span
      aria-hidden="true"
      className={`corner-frame ${toneClass(tone)} ${className}`.trim()}
      style={{
        "--frame-size": toLength(size),
        "--frame-inset": toLength(inset),
        position: "fixed",
        "--frame-thickness": "1px",
        ...style,
      }}
    >
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}
