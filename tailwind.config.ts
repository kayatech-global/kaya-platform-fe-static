import type { Config } from 'tailwindcss';

export default {
    darkMode: ['class'],
    content: [
        './src/**/*.{js,ts,jsx,tsx,mdx}',
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        fontSize: {
            xs: ['12px', '18px'],
            sm: ['14px', '20px'],
            md: ['16px', '24px'],
            lg: ['18px', '28px'],
            xl: ['20px', '30px'],
            'd-xs': ['24px', '32px'],
            'd-sm': ['30px', '38px'],
            'd-md': ['36px', '44px'],
            'd-lg': ['48px', '60px'],
            'd-xl': ['60px', '72px'],
        },
        colors: {
            transparent: 'transparent',
            current: 'currentColor',
            white: 'var(--white, #FFFFFF)',
            black: 'var(--black, #000000)',

            gray: {
                50: 'var(--gray-50, #F9FAFB)',
                100: 'var(--gray-100, #F3F4F6)',
                200: 'var(--gray-200, #E5E7EB)',
                300: 'var(--gray-300, #D1D5DB)',
                400: 'var(--gray-400, #9CA3AF)',
                500: 'var(--gray-500, #6B7280)',
                600: 'var(--gray-600, #4B5563)',
                700: 'var(--gray-700, #384151)',
                800: 'var(--gray-800, #1F2937)',
                900: 'var(--gray-900, #111827)',
            },

            blue: {
                50: 'var(--blue-50, #F0F5FF)',
                100: 'var(--blue-100, #DCE7FE)',
                200: 'var(--blue-200, #BED3FE)',
                300: 'var(--blue-300, #91B5FD)',
                400: 'var(--blue-400, #6194FA)',
                500: 'var(--blue-500, #3B7AF7)',
                600: 'var(--blue-600, #316FED)',
                700: 'var(--blue-700, #1D5BD6)',
                800: 'var(--blue-800, #1E4EAE)',
                900: 'var(--blue-900, #1E428A)',
            },

            sky: {
                50: 'var(--sky-50, #F0F9FF)',
                100: 'var(--sky-100, #E0F2FE)',
                200: 'var(--sky-200, #BAE6FD)',
                300: 'var(--sky-300, #7ED4FC)',
                400: 'var(--sky-400, #3ABFF8)',
                500: 'var(--sky-500, #0DA2E7)',
                600: 'var(--sky-600, #0284C5)',
                700: 'var(--sky-700, #0369A0)',
                800: 'var(--sky-800, #075783)',
                900: 'var(--sky-900, #0C4A6E)',
            },

            amber: {
                50: 'var(--amber-50, #FFFBEB)',
                100: 'var(--amber-100, #FEF3C8)',
                200: 'var(--amber-200, #FDE68B)',
                300: 'var(--amber-300, #FCD44F)',
                400: 'var(--amber-400, #FBBD23)',
                500: 'var(--amber-500, #F59F0A)',
                600: 'var(--amber-600, #DB7706)',
                700: 'var(--amber-700, #B35309)',
                800: 'var(--amber-800, #91400D)',
                900: 'var(--amber-900, #76350F)',
            },

            green: {
                50: 'var(--green-50, #F2FDF5)',
                100: 'var(--green-100, #DEFCE9)',
                200: 'var(--green-200, #BBF7D0)',
                300: 'var(--green-300, #85EFAC)',
                400: 'var(--green-400, #4ADE80)',
                500: 'var(--green-500, #21C45D)',
                600: 'var(--green-600, #16A249)',
                700: 'var(--green-700, #157F3C)',
                800: 'var(--green-800, #166434)',
                900: 'var(--green-900, #14522D)',
            },

            red: {
                50: 'var(--red-50, #FEF1F1)',
                100: 'var(--red-100, #FEE1E1)',
                200: 'var(--red-200, #FEC8C8)',
                300: 'var(--red-300, #FCA6A6)',
                400: 'var(--red-400, #F87272)',
                500: 'var(--red-500, #EF4343)',
                600: 'var(--red-600, #DC2828)',
                700: 'var(--red-700, #BA1C1C)',
                800: 'var(--red-800, #981B1B)',
                900: 'var(--red-900, #811D1D)',
            },
        },
        extend: {
            colors: {
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                card: {
                    DEFAULT: 'var(--card)',
                    foreground: 'var(--card-foreground)',
                },
                popover: {
                    DEFAULT: 'var(--popover)',
                    foreground: 'var(--popover-foreground)',
                },
                primary: {
                    DEFAULT: 'var(--primary)',
                    foreground: 'var(--primary-foreground)',
                },
                secondary: {
                    DEFAULT: 'var(--secondary)',
                    foreground: 'var(--secondary-foreground)',
                },
                muted: {
                    DEFAULT: 'var(--muted)',
                    foreground: 'var(--muted-foreground)',
                },
                accent: {
                    DEFAULT: 'var(--accent)',
                    foreground: 'var(--accent-foreground)',
                },
                destructive: {
                    DEFAULT: 'var(--destructive)',
                    foreground: 'var(--destructive-foreground)',
                },
                border: 'var(--border)',
                input: 'var(--input)',
                ring: 'var(--ring)',
                chart: {
                    '1': 'var(--chart-1)',
                    '2': 'var(--chart-2)',
                    '3': 'var(--chart-3)',
                    '4': 'var(--chart-4)',
                    '5': 'var(--chart-5)',
                },
            },
            spacing: {
                '8': '2rem',
            },
        },
    },
    plugins: [require('tailwindcss-animate'), require('tailwindcss-animated')],
} satisfies Config;
