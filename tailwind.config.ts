import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./store/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#fff8fb",
        petal: "#ff86bd",
        blush: "#ffd4e8",
        lilac: "#d9c8ff",
        cloud: "#dff3ff",
        ink: "#332832",
      },
      boxShadow: {
        glass: "0 24px 80px rgba(255, 134, 189, 0.22)",
        button: "0 14px 30px rgba(255, 112, 178, 0.35)",
      },
      borderRadius: {
        booth: "24px",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui"],
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-140%)" },
          "100%": { transform: "translateX(140%)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.45", transform: "scale(0.8) rotate(0deg)" },
          "50%": { opacity: "1", transform: "scale(1.18) rotate(12deg)" },
        },
        flash: {
          "0%": { opacity: "0" },
          "24%": { opacity: "0.95" },
          "100%": { opacity: "0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.8s ease-in-out infinite",
        twinkle: "twinkle 2.4s ease-in-out infinite",
        flash: "flash 560ms ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
