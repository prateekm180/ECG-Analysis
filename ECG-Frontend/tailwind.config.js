/** @type {import('tailwindcss').Config} */
export default {
  // Ye batata hai ki Tailwind ko kin files mein CSS dhoondni hai
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Medical theme colors agar aap custom use karna chahein
        brand: {
          black: "#050505",
          red: "#ef4444",
          zinc: "#09090b"
        }
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}