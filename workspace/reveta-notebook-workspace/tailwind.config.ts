import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            spacing: {
                'reveta-1': 'var(--reveta-space-1)',   // 4px
                'reveta-2': 'var(--reveta-space-2)',   // 8px
                'reveta-3': 'var(--reveta-space-3)',   // 16px
                'reveta-4': 'var(--reveta-space-4)',   // 24px
                'reveta-5': 'var(--reveta-space-5)',   // 32px
                'reveta-6': 'var(--reveta-space-6)',   // 48px
                'reveta-7': 'var(--reveta-space-7)',   // 64px
                'reveta-8': 'var(--reveta-space-8)',   // 96px
                'reveta-9': 'var(--reveta-space-9)',   // 128px
                'reveta-10': 'var(--reveta-space-10)',  // 192px
            },
            colors: {
                // Primary palette
                'primary': {
                    50: 'var(--reveta-color-primary-50)',
                    100: 'var(--reveta-color-primary-100)',
                    200: 'var(--reveta-color-primary-200)',
                    300: 'var(--reveta-color-primary-300)',
                    400: 'var(--reveta-color-primary-400)',
                    500: 'var(--reveta-color-primary-500)',
                    600: 'var(--reveta-color-primary-600)',
                    700: 'var(--reveta-color-primary-700)',
                    800: 'var(--reveta-color-primary-800)',
                    950: 'var(--reveta-color-primary-950)',
                },
                // Secondary palette
                'secondary': {
                    50: 'var(--reveta-color-secondary-50)',
                    100: 'var(--reveta-color-secondary-100)',
                    300: 'var(--reveta-color-secondary-300)',
                    500: 'var(--reveta-color-secondary-500)',
                    600: 'var(--reveta-color-secondary-600)',
                    800: 'var(--reveta-color-secondary-800)',
                    950: 'var(--reveta-color-secondary-950)',
                },
                // Accent palettes
                'pulse': {
                    100: 'var(--reveta-accent-pulse-100)',
                    300: 'var(--reveta-accent-pulse-300)',
                    500: 'var(--reveta-accent-pulse-500)',
                    700: 'var(--reveta-accent-pulse-700)',
                    900: 'var(--reveta-accent-pulse-900)',
                },
                'signal': {
                    100: 'var(--reveta-accent-signal-100)',
                    300: 'var(--reveta-accent-signal-300)',
                    500: 'var(--reveta-accent-signal-500)',
                    700: 'var(--reveta-accent-signal-700)',
                    900: 'var(--reveta-accent-signal-900)',
                },
                'void-glow': {
                    100: 'var(--reveta-accent-void-100)',
                    300: 'var(--reveta-accent-void-300)',
                    500: 'var(--reveta-accent-void-500)',
                    700: 'var(--reveta-accent-void-700)',
                    900: 'var(--reveta-accent-void-900)',
                },
                // Semantic colours
                'success': 'var(--reveta-semantic-success-500)',
                'warning': 'var(--reveta-semantic-warning-500)',
                'error': 'var(--reveta-semantic-error-500)',
                'info': 'var(--reveta-semantic-info-500)',
                // Neutrals
                'neutral': {
                    50: 'var(--reveta-neutral-50)',
                    100: 'var(--reveta-neutral-100)',
                    200: 'var(--reveta-neutral-200)',
                    300: 'var(--reveta-neutral-300)',
                    400: 'var(--reveta-neutral-400)',
                    500: 'var(--reveta-neutral-500)',
                    600: 'var(--reveta-neutral-600)',
                    700: 'var(--reveta-neutral-700)',
                    800: 'var(--reveta-neutral-800)',
                    850: 'var(--reveta-neutral-850)',
                    900: 'var(--reveta-neutral-900)',
                    950: 'var(--reveta-neutral-950)',
                },
                // Semantic aliases (for direct utility use in components)
                'text-primary': 'var(--reveta-color-text-primary)',
                'text-secondary': 'var(--reveta-color-text-secondary)',
                'bg-page': 'var(--reveta-color-bg-page)',
                'bg-card': 'var(--reveta-color-bg-card)',
                'border-default': 'var(--reveta-color-border-default)',
            },
            fontSize: {
                't-01': ['var(--reveta-type-t01-size)', {
                    lineHeight: 'var(--reveta-type-t01-line)',
                    letterSpacing: 'var(--reveta-type-t01-tracking)',
                    fontWeight: 'var(--reveta-type-t01-weight)',
                }],
                't-02': ['var(--reveta-type-t02-size)', {
                    lineHeight: 'var(--reveta-type-t02-line)',
                    letterSpacing: 'var(--reveta-type-t02-tracking)',
                    fontWeight: 'var(--reveta-type-t02-weight)',
                }],
                't-03': ['var(--reveta-type-t03-size)', {
                    lineHeight: 'var(--reveta-type-t03-line)',
                    letterSpacing: 'var(--reveta-type-t03-tracking)',
                    fontWeight: 'var(--reveta-type-t03-weight)',
                }],
                't-04': ['var(--reveta-type-t04-size)', {
                    lineHeight: 'var(--reveta-type-t04-line)',
                    letterSpacing: 'var(--reveta-type-t04-tracking)',
                    fontWeight: 'var(--reveta-type-t04-weight)',
                }],
                't-05': ['var(--reveta-type-t05-size)', {
                    lineHeight: 'var(--reveta-type-t05-line)',
                    letterSpacing: 'var(--reveta-type-t05-tracking)',
                    fontWeight: 'var(--reveta-type-t05-weight)',
                }],
                't-06': ['var(--reveta-type-t06-size)', {
                    lineHeight: 'var(--reveta-type-t06-line)',
                    letterSpacing: 'var(--reveta-type-t06-tracking)',
                    fontWeight: 'var(--reveta-type-t06-weight)',
                }],
                't-07': ['var(--reveta-type-t07-size)', {
                    lineHeight: 'var(--reveta-type-t07-line)',
                    letterSpacing: 'var(--reveta-type-t07-tracking)',
                    fontWeight: 'var(--reveta-type-t07-weight)',
                }],
                't-08': ['var(--reveta-type-t08-size)', {
                    lineHeight: 'var(--reveta-type-t08-line)',
                    letterSpacing: 'var(--reveta-type-t08-tracking)',
                    fontWeight: 'var(--reveta-type-t08-weight)',
                }],
                't-09': ['var(--reveta-type-t09-size)', {
                    lineHeight: 'var(--reveta-type-t09-line)',
                    letterSpacing: 'var(--reveta-type-t09-tracking)',
                    fontWeight: 'var(--reveta-type-t09-weight)',
                }],
            },
            fontFamily: {
                'display': ['var(--reveta-font-display)'],
                'body': ['var(--reveta-font-body)'],
                'mono': ['var(--reveta-font-mono)'],
            },
            fontWeight: {
                'display-regular': '300',
                'display-medium': '400',
                'display-semi': '500',
                'display-bold': '600',
                'display-black': '700',
                'body-dark': '450',
            },
            zIndex: {
                'base': 'var(--reveta-z-base)',
                'ground': 'var(--reveta-z-ground)',
                'content': 'var(--reveta-z-content)',
                'foreground': 'var(--reveta-z-foreground)',
                'sticky': 'var(--reveta-z-sticky)',
                'overlay': 'var(--reveta-z-overlay)',
                'modal': 'var(--reveta-z-modal)',
                'toast': 'var(--reveta-z-toast)',
            },
            borderRadius: {
                'component': 'var(--reveta-radius-component)',
                'card': 'var(--reveta-radius-card)',
                'large': 'var(--reveta-radius-large)',
                'xl-reveta': 'var(--reveta-radius-xl)',
            },
            transitionDuration: {
                'flicker': 'var(--reveta-duration-flicker)',
                'snap': 'var(--reveta-duration-snap)',
                'quick': 'var(--reveta-duration-quick)',
                'standard': 'var(--reveta-duration-standard)',
                'deliberate': 'var(--reveta-duration-deliberate)',
                'cinematic': 'var(--reveta-duration-cinematic)',
            },
            transitionTimingFunction: {
                'reveta-enter': 'var(--reveta-ease-enter)',
                'reveta-exit': 'var(--reveta-ease-exit)',
                'reveta-spring': 'var(--reveta-ease-spring)',
                'reveta-reveal': 'var(--reveta-ease-reveal)',
                'reveta-dramatic': 'var(--reveta-ease-dramatic)',
            },
        },
    },
    plugins: [],
}

export default config
