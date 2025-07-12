/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./.storybook/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Custom extensions will be added here in future phases
      // for user-customizable design tokens
      colors: {
        // Builder-specific colors for overlay indicators
        'builder-primary': '#3b82f6',
        'builder-secondary': '#10b981',
        'builder-accent': '#f59e0b',
        'builder-danger': '#ef4444',
      },
      zIndex: {
        'overlay': '9999',
        'selection': '10000',
      }
    },
  },
  plugins: [],
};