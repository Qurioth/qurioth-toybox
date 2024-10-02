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
        filter: {
          "blur-20": "blur(20px)",
          "blur-25": "blur(25px)",
        },
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
      },
      typography: {
        DEFAULT: {
          css: {
            color: "#1f2937",
            a: {
              color: "#3b82f6",
              "&:hover": {
                color: "#1d4ed8",
              },
            },
          },
        },
        dark: {
          css: {
            color: "#f3f4f6",
            a: {
              color: "#60a5fa",
              "&:hover": {
                color: "#2563eb",
              },
            },
            h1: {
              color: "#f8fafc",
            },
            h2: {
              color: "#f8fafc",
            },
            h3: {
              color: "#f8fafc",
            },
            h4: {
              color: "#f8fafc",
            },
            h5: {
              color: "#f8fafc",
            },
            h6: {
              color: "#f8fafc",
            },
            p: {
              color: "#d1d5db",
            },
            strong: {
              color: "#f3f4f6",
            },
            blockquote: {
              color: "#9ca3af",
            },
          },
        },
      },
    },
  },
  plugins: [
    require("flowbite/plugin"),
    require("tailwindcss-animate"),
    require("tailwindcss-animated"),
    require("@tailwindcss/typography"),
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
