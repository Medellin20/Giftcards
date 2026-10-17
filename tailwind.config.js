/** Couleurs de marque : à ajuster pour coller exactement à la charte Carte cadeau */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 50: "#f7f1e8", 100: "#e8dbc9", 500: "#8a7056", 600: "#70583f", 700: "#594431", 900: "#3f3025" },
        accent: { 400: "#e5cfad", 500: "#d8bc95", 600: "#805d39" },
      },
      fontFamily: { sans: ["ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"] },
    },
  },
  plugins: [],
};
