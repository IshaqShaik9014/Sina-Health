/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        clinical: {
          teal: {
            DEFAULT: '#176B68',
            hover: '#135754',
            light: '#E6F3F2',
            dark: '#104F4C',
          },
          secondary: '#258C85',
          bg: '#F5F8FA',
          surface: '#FFFFFF',
          raised: '#EEF2F6',
          border: '#E5EAEE',
          darkBorder: '#CBD5E1',
          text: {
            primary: '#1C2935',
            secondary: '#4B5565',
            muted: '#718096',
          },
          status: {
            success: '#16A34A',
            'success-bg': '#F0FDF4',
            warning: '#D97706',
            'warning-bg': '#FFFBEB',
            error: '#DC2626',
            'error-bg': '#FEF2F2',
            info: '#2563EB',
            'info-bg': '#EFF6FF',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace'],
      },
      borderRadius: {
        'control': '8px',
        'card': '12px',
        'panel': '14px',
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'modal': '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
