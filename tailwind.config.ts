import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // AI Coach Brand Colors - using CSS variables for dark mode support
        'st-blue': {
          DEFAULT: 'var(--st-blue-primary)',
          dark: 'var(--st-blue-dark)',
          light: 'var(--st-blue-light)',
        },
        'st-teal': {
          DEFAULT: 'var(--st-teal)',
          dark: 'var(--st-teal-dark)',
          light: 'var(--st-teal-light)',
        },
        'st-green': {
          DEFAULT: 'var(--st-green)',
          dark: 'var(--st-green-dark)',
          light: 'var(--st-green-light)',
        },
        // Legacy purple colors mapped to primary blue for compatibility
        'st-purple': {
          DEFAULT: 'var(--st-purple-primary)',
          dark: 'var(--st-purple-dark)',
          light: 'var(--st-purple-light)',
        },
        'st-gray': {
          50: 'var(--st-gray-50)',
          100: 'var(--st-gray-100)',
          200: 'var(--st-gray-200)',
          300: 'var(--st-gray-300)',
          400: 'var(--st-gray-400)',
          500: 'var(--st-gray-500)',
          600: 'var(--st-gray-600)',
          700: 'var(--st-gray-700)',
          800: 'var(--st-gray-800)',
          900: 'var(--st-gray-900)',
          950: 'var(--st-gray-950)',
        },
        // shadcn/ui colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Lato', 'sans-serif'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
