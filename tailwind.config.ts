import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        spin_in: {
          "0%": { transform: "rotateY(90deg) scale(0.8)", opacity: "0" },
          "100%": { transform: "rotateY(0deg) scale(1)", opacity: "1" },
        },
        slot_blur: {
          "0%, 100%": { filter: "blur(0px)", transform: "translateY(0)" },
          "50%": { filter: "blur(4px)", transform: "translateY(-8px)" },
        },
        bounce_in: {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "60%": { transform: "scale(1.1)", opacity: "1" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        spin_in: "spin_in 0.4s ease-out forwards",
        slot_blur: "slot_blur 0.8s ease-in-out",
        bounce_in: "bounce_in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
      },
    },
  },
  plugins: [],
};

export default config;
