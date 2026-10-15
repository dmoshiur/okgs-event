/**
 * Theme tokens cloned from the thinktank-academia.onrender.com design system:
 * deep academic navy ("ink"), restrained premium gold, warm paper neutrals,
 * hairline editorial lines, disciplined (near 90-degree) corner radii,
 * and display typography loaded from Fraunces.
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep academic ink — the dark navy chrome of the reference theme.
        ink: {
          950: "#050d18",
          900: "#081527",
          850: "#0b1d33",
          800: "#102540",
          700: "#173354",
          600: "#1f4166",
        },
        // Premium gold accent, used sparingly for framing and highlights.
        gold: {
          DEFAULT: "#c29a3b",
          deep: "#9c7826",
          soft: "#e4c97e",
          tint: "#f7f0dd",
        },
        // Rich editorial blue for links and interactive states.
        royal: {
          DEFAULT: "#1d5bbf",
          strong: "#174a9e",
          soft: "#e8eefb",
        },
        // Warm paper neutrals replace the previous cool slate scale.
        paper: {
          DEFAULT: "#faf8f3",
          2: "#f3f0e8",
          3: "#ece8dc",
          warm: "#fcfaf6",
        },
        line: {
          DEFAULT: "#e7e2d6",
          strong: "#d5cebe",
        },
        // Editorial text colors: `text-body`, `text-body-soft`, `text-muted`, `text-muted-2`.
        body: {
          DEFAULT: "#1b2430",
          soft: "#3c4858",
        },
        muted: {
          DEFAULT: "#5f6d80",
          2: "#8a94a4",
        },
        surface: {
          DEFAULT: "#ffffff",
          warm: "#fcfaf6",
        },
        state: {
          success: "#1e7a4c",
          "success-bg": "#ecf6f0",
          warning: "#b45309",
          "warning-bg": "#fdf3e3",
          error: "#b3352f",
          "error-bg": "#fbeeed",
        },
      },
      fontFamily: {
        display: ["Fraunces", "Hind Siliguri", "Georgia", "Times New Roman", "serif"],
        body: ["Inter", "Hind Siliguri", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        sans: ["Inter", "Hind Siliguri", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      borderRadius: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "14px",
      },
      boxShadow: {
        editorial: "0 1px 2px rgba(8,21,39,0.05), 0 2px 8px rgba(8,21,39,0.05)",
        raised: "0 2px 6px rgba(8,21,39,0.06), 0 10px 28px rgba(8,21,39,0.08)",
        floated: "0 6px 18px rgba(8,21,39,0.08), 0 24px 64px rgba(8,21,39,0.14)",
        gold: "0 14px 44px rgba(194,154,59,0.28)",
      },
      maxWidth: {
        container: "1200px",
        wide: "1380px",
        read: "720px",
      },
      letterSpacing: {
        eyebrow: "0.24em",
      },
    },
  },
  plugins: [],
};
