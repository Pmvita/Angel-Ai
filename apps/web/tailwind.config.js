import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        angel: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          900: "#14532d",
        },
      },
      animation: {
        pulse-slow: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        listen: "listen 1.5s ease-in-out infinite",
      },
      keyframes: {
        listen: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

