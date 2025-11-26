/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background hierarchy (Deep Navy)
        'bg': {
          primary: '#0B0D17',
          secondary: '#111827',
          tertiary: '#1F2937',
          elevated: '#374151',
        },
        // Glass effects
        'glass': {
          bg: 'rgba(17, 24, 39, 0.7)',
          border: 'rgba(255, 255, 255, 0.08)',
          shine: 'rgba(255, 255, 255, 0.05)',
          hover: 'rgba(255, 255, 255, 0.03)',
        },
        // Call options (Cyan/Blue - Bullish)
        'call': {
          DEFAULT: '#00D4FF',
          glow: 'rgba(0, 212, 255, 0.2)',
          surface: 'rgba(0, 212, 255, 0.1)',
          dark: '#00A3CC',
          muted: '#0891B2',
        },
        // Put options (Magenta/Pink - Bearish)
        'put': {
          DEFAULT: '#FF3D71',
          glow: 'rgba(255, 61, 113, 0.2)',
          surface: 'rgba(255, 61, 113, 0.1)',
          dark: '#CC315A',
          muted: '#BE185D',
        },
        // Accent colors
        'accent': {
          purple: '#8B5CF6',
          'purple-glow': 'rgba(139, 92, 246, 0.2)',
          gold: '#F59E0B',
          emerald: '#10B981',
        },
        // Text hierarchy
        'text': {
          primary: '#F9FAFB',
          secondary: '#9CA3AF',
          tertiary: '#6B7280',
          disabled: '#4B5563',
        },
        // Semantic colors
        'profit': '#10B981',
        'loss': '#EF4444',
        'neutral': '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['DM Mono', 'SF Mono', 'Consolas', 'monospace'],
      },
      borderRadius: {
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.3)',
        'glass-lg': '0 8px 40px rgba(0, 0, 0, 0.4)',
        'glow-call': '0 0 20px rgba(0, 212, 255, 0.3), 0 0 40px rgba(0, 212, 255, 0.1)',
        'glow-put': '0 0 20px rgba(255, 61, 113, 0.3), 0 0 40px rgba(255, 61, 113, 0.1)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1)',
        'inner-light': 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
        'gradient-hero': 'linear-gradient(135deg, #0B0D17 0%, #1a1f35 50%, #0B0D17 100%)',
        'gradient-card': 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
        'gradient-call': 'linear-gradient(135deg, #00D4FF 0%, #00A3CC 100%)',
        'gradient-put': 'linear-gradient(135deg, #FF3D71 0%, #CC315A 100%)',
        'gradient-purple': 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
        'shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
      },
      animation: {
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fadeIn': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slideUp': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slideDown': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scaleIn': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.2)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
