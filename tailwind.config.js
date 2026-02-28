export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        dm: ['"DM Sans"', 'sans-serif'],
        playfair: ['"Playfair Display"', 'serif'],
      },
      colors: {
        dark: '#0c1421',
        navy: '#0f1a2e',
        gold: '#f59e0b',
        card: 'rgba(255,255,255,0.03)',
      },
    },
  },
  plugins: [],
}
