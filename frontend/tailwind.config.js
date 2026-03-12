export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#0f172a",
        panel: "#111827",
        accent: "#22d3ee",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(34, 211, 238, 0.25), 0 10px 40px rgba(15, 23, 42, 0.45)",
      },
    },
  },
  plugins: [],
}