/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ["Orbitron", "sans-serif"],
        "share-tech-mono": ["Share Tech Mono", "monospace"],
      },
      animation: {
        flicker: "flicker 0.1s infinite",
        shimmer: "shimmer 0.4s ease-out",
        crashShake: "crashShake 0.5s ease-in-out",
        crashRed: "crashRed 2s ease",
        fadeIn: "fadeIn 0.5s ease",
        "pulse-granted": "pulseGranted 2s infinite alternate",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        shimmer: {
          "0%": { left: "-100%" },
          "100%": { left: "100%" },
        },
        crashShake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-10px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(10px)" },
        },
        crashRed: {
          "0%": { backgroundColor: "#070911" },
          "50%": { backgroundColor: "#330000" },
          "100%": { backgroundColor: "#070911" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        pulseGranted: {
          "0%, 100%": {
            transform: "scale(1)",
            textShadow: "0 0 20px rgba(0, 255, 255, 0.8)",
          },
          "50%": {
            transform: "scale(1.05)",
            textShadow: "0 0 30px rgba(0, 255, 255, 1)",
          },
        },
      },
      boxShadow: {
        "inner-red":
          "inset 0 4px 12px rgba(235, 42, 65, 0.7), inset 0 -2px 0 rgba(235, 42, 65, 1), inset 0 -3px 0 #000",
        "red-glow": "0 4px 12px rgba(235, 42, 65, 0.3)",
        "cyan-glow": "0 4px 12px rgba(0, 255, 255, 0.3)",
      },
      textShadow: {
        cyan: "0 0 10px rgba(0, 255, 255, 0.5)",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        ".text-shadow-cyan": {
          textShadow: "0 0 10px rgba(0, 255, 255, 0.5)",
        },
        ".shadow-inner-red": {
          boxShadow:
            "inset 0 4px 12px rgba(235, 42, 65, 0.7), inset 0 -2px 0 rgba(235, 42, 65, 1), inset 0 -3px 0 #000",
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
