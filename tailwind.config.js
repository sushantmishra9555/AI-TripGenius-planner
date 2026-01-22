/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./app/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#667eea',
        accent: '#764ba2',
        secondary: '#f093fb',
        muted: '#6b7280',
        'muted-foreground': '#9ca3af',
        foreground: '#1f2937',
        background: '#ffffff',
        border: '#e5e7eb',
        // Keep dark theme colors for compatibility
        'dark-navy': '#1a1d2e',
        'dark-card': '#252a3d',
        'dark-border': '#2d3447',
        'lime-accent': '#d4fc3c',
        'text-gray': '#a1a8b8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
