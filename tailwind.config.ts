import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
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
        space: {
          DEFAULT: "#1a1b2e",
          lighter: "#2a2b4e",
          darker: "#0a0b1e",
        },
        cosmic: {
          DEFAULT: "#9b87f5",
          light: "#b4a4f8",
          dark: "#7E69AB",
        },
        imperial: {
          50: "#F1F0FB",
          100: "#E6E5F0",
          200: "#C8C8C9",
          300: "#9F9EA1",
          400: "#8E9196",
          500: "#6E6F74",
          600: "#4D4E53",
          700: "#2D2E33",
          800: "#1D1E23",
          900: "#0D0E13",
        },
        rebel: {
          DEFAULT: "#F97316",
          hover: "#EA580C",
        },
        sith: {
          DEFAULT: "#ea384c",
          hover: "#dc2626",
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        },
        esm: {
          "blue": {
            "50": "#eef5ff",
            "100": "#d9e7ff",
            "200": "#bcd4ff",
            "300": "#8eb9ff",
            "400": "#5b93ff",
            "500": "#3a6dfc",
            "600": "#1F45FC", 
            "700": "#1938e4",
            "800": "#1930b9",
            "900": "#1a2e93",
            "950": "#141c59",
          },
          "status": {
            "pending": "#FFC107",
            "in-progress": "#3a6dfc",
            "completed": "#4CAF50",
            "cancelled": "#F44336"
          }
        },
      },
      backgroundImage: {
        'space-gradient': 'linear-gradient(to bottom right, rgb(17, 24, 39), rgb(88, 28, 135))',
      },
      fontFamily: {
        heading: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'neon': '0 0 5px theme(colors.cosmic.light / 20%), 0 0 20px theme(colors.cosmic.light / 15%)',
        'neon-hover': '0 0 10px theme(colors.cosmic.light / 30%), 0 0 40px theme(colors.cosmic.light / 20%)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      },
      opacity: {
        '10': '0.1',
        '20': '0.2',
        '90': '0.9'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
