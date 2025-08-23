/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // UpNXT Design System - Dark Mode Colors
        'blue-ink': '#1E2244',
        'blue-accent': '#6D7BFF',
        'ivory': '#F8F6F0',
        'surface-dark': '#24294F',
        'surface-light': '#FFFFFF',
        'text-primary-dark': '#FFFFFF',
        'text-secondary-dark': '#BFC6FF',
        'text-primary-light': '#111318',
        'text-secondary-light': '#3A3F55',
        'success': '#22C55E',
        'warning': '#F59E0B',
        'danger': '#EF4444',
        'border-dark': '#3B3F66',
        'border-light': '#E5E7EB',
        
        // Legacy color mappings for backward compatibility
        primary: {
          50: '#F8F6F0',
          100: '#E5E7EB',
          200: '#BFC6FF',
          300: '#6D7BFF',
          400: '#6D7BFF',
          500: '#6D7BFF',
          600: '#5A67D8',
          700: '#4C51BF',
          800: '#3B3F66',
          900: '#1E2244',
        },
        secondary: {
          50: '#F8F6F0',
          100: '#E5E7EB',
          200: '#BFC6FF',
          300: '#6D7BFF',
          400: '#6D7BFF',
          500: '#6D7BFF',
          600: '#5A67D8',
          700: '#4C51BF',
          800: '#3B3F66',
          900: '#1E2244',
        },
        accent: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
        neutral: {
          50: '#F8F6F0',
          100: '#E5E7EB',
          200: '#D1D5DB',
          300: '#9CA3AF',
          400: '#6B7280',
          500: '#3A3F55',
          600: '#374151',
          700: '#1F2937',
          800: '#111318',
          900: '#0F172A',
        },
        success: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#22C55E',
          600: '#16A34A',
        },
        error: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#EF4444',
          600: '#DC2626',
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',
          600: '#D97706',
        },
      },
      fontFamily: {
        // Moonhouse for display/hero elements
        display: ['Moonhouse', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji'],
        // Body stack for readability
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji'],
        // Monospace for code elements
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
      },
      fontSize: {
        // Typography scale
        'display-xl': ['56px', { lineHeight: '1.1', letterSpacing: '0.5px' }],
        'display-lg': ['48px', { lineHeight: '1.1', letterSpacing: '0.5px' }],
        'display': ['40px', { lineHeight: '1.1', letterSpacing: '0.5px' }],
        'h1': ['32px', { lineHeight: '1.2' }],
        'h2': ['24px', { lineHeight: '1.25' }],
        'h3': ['20px', { lineHeight: '1.3' }],
        'body-lg': ['18px', { lineHeight: '1.55' }],
        'body': ['16px', { lineHeight: '1.6' }],
        'body-sm': ['14px', { lineHeight: '1.4' }],
        'caption': ['13px', { lineHeight: '1.4' }],
        'button': ['15px', { lineHeight: '1.4', fontWeight: '600' }],
      },
      spacing: {
        // Custom spacing scale
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'lg': '16px',
        'xl': '24px',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 8px 24px rgba(0,0,0,0.12)',
        'strong': '0 16px 40px rgba(0,0,0,0.18)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'shooting-star': 'shootingStar 2.5s ease-in-out infinite',
        'progress-pulse': 'progressPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shootingStar: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        progressPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
