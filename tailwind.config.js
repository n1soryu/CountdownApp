/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        night: {
          900: '#05010A',
          800: '#0E0B16',
          700: '#171228',
        },
      },
      boxShadow: {
        glow: '0 10px 50px rgba(99, 102, 241, 0.35)',
      },
      animation: {
        float: 'float 18s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(5px, -15px, 0)' },
          '100%': { transform: 'translate3d(-5px, 10px, 0)' },
        },
      },
    },
  },
  plugins: [],
}
