/** Couleurs de marque : à ajuster pour coller exactement à la charte Carte cadeau */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 50: "#f0f5ef", 100: "#dce8dc", 500: "#47765a", 600: "#355d45", 700: "#264936", 900: "#163b2c" },
        accent: { 400: "#ffb29a", 500: "#ff997b", 600: "#a7442d" },
      },
      fontFamily: { sans: ["ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"] },
    },
  },
  plugins: [],
};
