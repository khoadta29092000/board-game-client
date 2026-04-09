// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      screens: {
        xs: "480px"
      },
      fontFamily: {
        "geist-sans": "var(--font-geist-sans)",
        mono: "var(--font-geist-mono)",
        manrope: ["var(--font-manrope)", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
