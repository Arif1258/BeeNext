import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#E52532",
          redHover: "#CF1E2A",
          redLight: "#FF4D5A",
          redDark: "#94131D",
          redMuted: "rgba(229, 37, 50, 0.15)",
          black: "#111111",
          blackDeep: "#090909",
          card: "#161616",
          cardHover: "#1E1E1E",
          surface: "#242424",
          border: "#2A2A2A",
          borderHover: "#3D3D3D",
          muted: "#9CA3AF",
          subtle: "#6B7280",
          white: "#FFFFFF",
        },
      },
      fontFamily: {
        mono: ["var(--font-mono)", "Menlo", "Monaco", "Courier New", "monospace"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        'brand': '0 4px 20px -2px rgba(229, 37, 50, 0.25)',
        'brand-glow': '0 0 25px -3px rgba(229, 37, 50, 0.35)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
};
export default config;
