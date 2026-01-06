/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // PwC Brand Colors
        'pwc-orange': '#D04A02',
        'pwc-orange-hover': '#B84102',
        'pwc-dark': '#2D2D2D',
        'pwc-gray': '#464646',
        'pwc-light-gray': '#E6E6E6',
        
        // Status Colors
        'status-open': '#3B82F6',
        'status-in-progress': '#F59E0B',
        'status-resolved': '#10B981',
        'status-closed': '#6B7280',
        
        // Priority Colors
        'priority-critical': '#DC2626',
        'priority-high': '#F97316',
        'priority-medium': '#EAB308',
        'priority-low': '#22C55E',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
