import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0f",
        card: "#1a1a2e",
        accent: "#00e5ff",
      },
      fontFamily: {
        sans: ["Inter", "Space Grotesk", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
