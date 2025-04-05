import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}", // Include all files in `src/pages`
    "./src/components/**/*.{js,ts,jsx,tsx}", // Include all files in `src/components`
    "./src/app/**/*.{js,ts,jsx,tsx}", // Include files in `src/app` (if using Next.js 13+)
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1D4ED8", // Example custom color
        secondary: "#9333EA",
      },
    },
  },
  plugins: [],
};

export default config;
