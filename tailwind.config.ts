import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/flowbite/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        "fade-in-down": "fade-in-down 0.5s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "pop-blob": "pop-blob 5s infinite",
        "flip-in-ver-left":
          "flip-in-ver-left 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940)   both",
      },
      keyframes: {
        "fade-in-down": {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pop-blob": {
          "0%": { transform: "scale(1)" },
          "33%": { transform: "scale(1.2)" },
          "66%": { transform: "scale(0.8)" },
          "100%": { transform: "scale(1)" },
        },
        "flip-in-ver-left": {
          "0%": {
            transform: "rotateY(80deg)",
            opacity: "0",
          },
          to: {
            transform: "rotateY(0)",
            opacity: "1",
          },
        },
        colors: {
          filter: {
            "blur-20": "blur(20px)",
            "blur-25": "blur(25px)",
          },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("tailwindcss-animated"),
    require("flowbite/plugin"),
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".scrollbar-none": {
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
        ".scrollbar-thin": {
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#64748b",
            width: "6px",
            "border-radius": "5px",
          },
        },
      });
    }),
  ],
};
export default config;
