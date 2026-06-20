/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Hamara Metallic Gold
        brand: {
          gold: '#D4AF37',
          goldDark: '#B2912F',
        }
      },
      fontFamily: {
        // Modern legal font feeling
        sans: ['Inter', 'sans-serif'],
      },
      // 👇 YE HAIN ADVANCED ANIMATIONS DEFINITIONS
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUpFade: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(15px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(15px) rotate(-360deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.2', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(1.05)' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        slideUpFade: 'slideUpFade 0.6s ease-out forwards',
        scaleIn: 'scaleIn 0.5s ease-out forwards',
        orbit: 'orbit 8s linear infinite',
        pulseGlow: 'pulseGlow 4s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}