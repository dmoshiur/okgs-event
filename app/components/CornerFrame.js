/**
 * 90-DEGREE CORNER FRAME ENGINE
 *
 * Renders four precise right-angle brackets inside the edges of a
 * relatively positioned parent — the signature framing device of the
 * thinktank-academia.onrender.com theme (see `.cta-banner::before/::after`
 * in the reference stylesheet, generalised here to all four corners).
 *
 * Usage:
 *   <div className="relative">
 *     <CornerFrame size={64} inset={12} tone="gold" />
 *     ...content...
 *   </div>
 *
 * Every dimension can be a number (pixels) or any CSS length string, and
 * accepts a responsive Tailwind class through `className` (for example
 * `hidden sm:block`) when a card is too small on phones for 130px brackets.
 */
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
      className={`corner-frame corner-frame--${tone} ${className}`.trim()}
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
      className={`corner-frame corner-frame--${tone} ${className}`.trim()}
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
