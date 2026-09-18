// 디자인 토큰 — docs/ui_ux.md §1.1 그대로 매핑
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        surface: '#FFFFFF',
        border: '#E2E8F0',
        text: {
          primary: '#1E293B',
          secondary: '#64748B',
          tertiary: '#94A3B8',
          strong: '#0F172A',
        },
        brand: {
          primary: '#4F46E5',
          soft: '#EEF2FF',
          alt: '#EEEFFA',
        },
        status: {
          error: {
            text: '#EF4444',
            bg: '#FEF2F2',
          },
          warning: {
            text: '#92400E',
            border: '#FDE68A',
            bg: '#FFFBEB',
          },
          success: {
            text: '#16A34A',
            bg: '#DCFCE7',
            bgAlt: '#F0FDF4',
          },
          info: {
            text: '#3B82F6',
          },
        },
        focusBg: '#FAFAF8',
        pdfPage: '#F1F0EE',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Pretendard Variable', 'Pretendard', 'sans-serif'],
        serif: ['Lora', 'Nanum Myeongjo', 'serif'],
      },
      boxShadow: {
        sheet: '0 1px 3px rgba(0,0,0,.03)',
        focusSheet: '0 2px 8px rgba(0,0,0,.0196)',
        modal: '0 8px 30px rgba(0,0,0,.1216)',
      },
    },
  },
  plugins: [],
};

export default config;
