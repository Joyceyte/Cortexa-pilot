const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,html}",  // 🔥 This tells Tailwind where to look for used classes
  ],
  theme: {
    extend: {
      colors: {
        ...colors, // keep all default Tailwind colors
      },
    },
  },
  // Optional but helps minify better if you want:
  // mode: 'jit',  // Just-In-Time compiler (usually default now)
};
