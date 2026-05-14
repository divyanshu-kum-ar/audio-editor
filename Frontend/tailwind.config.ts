import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        body: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        void: "#050508",
        obsidian: "#0a0a0f",
        surface: "#0f0f18",
        elevated: "#14141f",
        border: "#1e1e2e",
        muted: "#2a2a3e",
        subtle: "#3a3a52",
        ember: {
          DEFAULT: "#ff4d2e",
          dim: "#cc3d24",
          glow: "rgba(255,77,46,0.15)",
        },
        neon: {
          DEFAULT: "#00e5ff",
          dim: "#00b8cc",
          glow: "rgba(0,229,255,0.12)",
        },
        lime: {
          DEFAULT: "#a3ff3c",
          dim: "#82cc30",
          glow: "rgba(163,255,60,0.12)",
        },
        violet: {
          DEFAULT: "#7c3aed",
          soft: "#a855f7",
          glow: "rgba(124,58,237,0.2)",
        },
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(30,30,46,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(30,30,46,0.4) 1px, transparent 1px)",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        glow: "0 0 20px rgba(0,229,255,0.15), 0 0 40px rgba(0,229,255,0.05)",
        "glow-ember": "0 0 20px rgba(255,77,46,0.2), 0 0 40px rgba(255,77,46,0.05)",
        "glow-lime": "0 0 20px rgba(163,255,60,0.15), 0 0 40px rgba(163,255,60,0.05)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scan": "scan 2s linear infinite",
        "shimmer": "shimmer 2s linear infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100vw)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
