const colors = require('tailwindcss/colors');

module.exports = {
  theme: {
    extend: {
      colors: {
        ...colors,  // This includes all default Tailwind colors
      },
    },
  },
};
