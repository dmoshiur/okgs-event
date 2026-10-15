const ICON_PATHS = {
  dashboard: [
    { d: "M4 4h6v6H4z" },
    { d: "M14 4h6v6h-6z" },
    { d: "M4 14h6v6H4z" },
    { d: "M14 14h6v6h-6z" },
  ],
  analytics: [{ d: "M4 20V10M10 20V4M16 20v-7M22 20H2" }],
  bell: [{ d: "M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9z" }, { d: "M10 20a2 2 0 0 0 4 0" }],
  students: [
    { d: "M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1" },
    { c: [9.5, 7.5, 3.5] },
    { d: "M21 19v-1a4 4 0 0 0-3-3.9M15.5 4.2a3.5 3.5 0 0 1 0 6.6" },
  ],
  scan: [
    { d: "M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" },
    { d: "M8 8h8v8H8z" },
  ],
  tickets: [{ d: "M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4z" }, { d: "M14 7v10" }],
  more: [
    { c: [5, 5, 1.6] }, { c: [12, 5, 1.6] }, { c: [19, 5, 1.6] },
    { c: [5, 12, 1.6] }, { c: [12, 12, 1.6] }, { c: [19, 12, 1.6] },
    { c: [5, 19, 1.6] }, { c: [12, 19, 1.6] }, { c: [19, 19, 1.6] },
  ],
  logs: [
    { d: "M9 6h11M9 12h11M9 18h11" },
    { c: [4.5, 6, 0.8] }, { c: [4.5, 12, 0.8] }, { c: [4.5, 18, 0.8] },
  ],
  print: [
    { d: "M7 8V3h10v5" },
    { r: [4, 8, 16, 9, 2] },
    { d: "M7 14h10v7H7z" },
  ],
  settings: [
    { c: [12, 12, 3] },
    { d: "M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" },
  ],
  admins: [{ d: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" }],
  chevronLeft: [{ d: "M15 6l-6 6 6 6" }],
  chevronRight: [{ d: "M9 6l6 6-6 6" }],
  chevronDown: [{ d: "M6 9l6 6 6-6" }],
  chevronUp: [{ d: "M6 15l6-6 6 6" }],
  logout: [
    { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" },
    { d: "M16 17l5-5-5-5M21 12H9" },
  ],
  phone: [
    { d: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" },
  ],
  chat: [{ d: "M21 11.5a8.5 8.5 0 0 1-12.4 7.5L3 21l2-5.4A8.5 8.5 0 1 1 21 11.5z" }],
  close: [{ d: "M6 6l12 12M18 6L6 18" }],
  help: [{ c: [12, 12, 9] }, { d: "M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01" }],
  plus: [{ d: "M12 5v14M5 12h14" }],
  user: [
    { d: "M20 21a8 8 0 0 0-16 0" },
    { c: [12, 7, 4] },
  ],
  key: [
    { c: [8, 15, 4] },
    { d: "M10.8 12.2 20 3M17 6l2 2M14.5 8.5l2 2" },
  ],
  eye: [
    { d: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" },
    { c: [12, 12, 3] },
  ],
  eyeOff: [
    { d: "M3 3l18 18" },
    { d: "M10.6 10.7a2 2 0 0 0 2.7 2.7" },
    { d: "M9.9 5.2A10.7 10.7 0 0 1 12 5c5.2 0 8.8 4.1 10 7-.4.9-1.1 2-2.1 3" },
    { d: "M6.2 6.2C3.9 7.7 2.5 10 2 12c1.2 2.9 4.8 7 10 7 1.3 0 2.5-.3 3.6-.8" },
  ],
  arrowRight: [{ d: "M4 12h15M13 6l6 6-6 6" }],
  search: [{ c: [11, 11, 6.5] }, { d: "M16 16l5 5" }],
  download: [{ d: "M12 3v12m0 0-4-4m4 4 4-4M4 21h16" }],
  refresh: [{ d: "M20 11a8 8 0 1 0-2.3 5.7" }, { d: "M20 4v7h-7" }],
  shield: [{ d: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" }, { d: "M9 12l2 2 4-4" }],
  check: [{ d: "M4 12.5 9 17.5 20 6.5" }],
  pin: [
    { d: "M12 21s7-6.4 7-11a7 7 0 1 0-14 0c0 4.6 7 11 7 11Z" },
    { c: [12, 10, 2.5] },
  ],
  calendar: [
    { r: [3, 5, 18, 16, 2] },
    { d: "M3 10h18M8 3v4M16 3v4" },
  ],
  camera: [
    { r: [3, 6, 18, 14, 2] },
    { c: [12, 13, 3.2] },
    { d: "M9 6l1.5-2h3L15 6" },
  ],
  mail: [{ r: [3, 5, 18, 14, 2] }, { d: "M3.5 7l8.5 6 8.5-6" }],
  upload: [{ d: "M12 17V5m0 0-4 4m4-4 4 4M4 21h16" }],
  filter: [{ d: "M4 5h16M7 12h10M10 19h4" }],
  list: [{ d: "M8 6h13M8 12h13M8 18h13" }, { d: "M3.5 6h.01M3.5 12h.01M3.5 18h.01" }],
  grid: [
    { r: [3, 3, 7, 7, 1] },
    { r: [14, 3, 7, 7, 1] },
    { r: [3, 14, 7, 7, 1] },
    { r: [14, 14, 7, 7, 1] },
  ],
  trash: [{ d: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" }],
  alert: [{ c: [12, 12, 9] }, { d: "M12 7v6M12 16.5v.5" }],
};

export function Icon({ name, className = "h-5 w-5", strokeWidth = 1.8 }) {
  const shapes = ICON_PATHS[name] || [];
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {shapes.map((shape, index) => {
        if (shape.d) return <path key={index} d={shape.d} />;
        if (shape.c) return <circle key={index} cx={shape.c[0]} cy={shape.c[1]} r={shape.c[2]} />;
        if (shape.r) {
          const [x, y, width, height, rx] = shape.r;
          return <rect key={index} x={x} y={y} width={width} height={height} rx={rx} />;
        }
        return null;
      })}
    </svg>
  );
}
