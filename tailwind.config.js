/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          bg: '#f5f5f7',
          surface: '#ffffff',
          text: '#1d1d1f',
          subtext: '#86868b',
          border: 'rgba(0, 0, 0, 0.08)',
          cardBorder: 'rgba(0, 0, 0, 0.04)',
          blue: '#0071e3',
          blueHover: '#0077ed',
          blueLight: '#f0f6ff',
          gray: '#f5f5f7',
          grayHover: '#e8e8ed',
          darkNav: 'rgba(29, 29, 31, 0.85)',
          lightNav: 'rgba(255, 255, 255, 0.82)',
        },
        vulnerability: {
          safe: '#34c759',       // Apple Green
          caution: '#ff9500',    // Apple Orange/Yellow
          vulnerable: '#ff6934', // Apple Coral/Orange
          critical: '#ff3b30',   // Apple Red
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Pretendard"',
          '"Apple SD Gothic Neo"',
          'sans-serif',
        ],
      },
      boxShadow: {
        'apple-sm': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'apple-card': '0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'apple-hover': '0 12px 30px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)',
        'apple-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        '2.5xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
