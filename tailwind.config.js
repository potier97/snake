/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'game-bg': '#0f0f23',
        'game-accent': '#00ff41',
        'game-secondary': '#ff0080',
        'game-surface': '#1a1a2e',
        'game-border': '#16213e',
      },
      fontFamily: {
        'game': ['Orbitron', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-in': 'slideIn 0.5s ease-out',
      },
      keyframes: {
        glow: {
          from: { 'box-shadow': '0 0 20px #00ff41' },
          to: { 'box-shadow': '0 0 30px #00ff41, 0 0 40px #00ff41' },
        },
        slideIn: {
          from: { transform: 'translateY(-20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-game': 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        'gradient-button': 'linear-gradient(45deg, #00ff41, #00cc33)',
      },
    },
  },
  plugins: [],
}

