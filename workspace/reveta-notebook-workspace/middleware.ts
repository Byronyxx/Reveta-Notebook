/**
 * REVETA NOTEBOOK — CSS CUSTOM PROPERTIES v1.0
 * Design System Token Bridge · Document B → Implementation
 *
 * USAGE RULES:
 * 1. NEVER use hardcoded values in components. Always reference these variables.
 * 2. Dark mode [data-theme="dark"] is DEFAULT — apply it on <html> or <body>
 * 3. Light mode is the accessibility variant — applied on user preference
 * 4. A grep for hex values in component files should return empty.
 *
 * STRUCTURE:
 * @layer tokens       → raw design token values
 * @layer semantic     → semantic aliases (text-primary references neutral-900)
 * @layer dark-mode    → dark mode overrides
 * @layer reduced-motion → accessibility motion overrides
 */

/* ============================================================
   LAYER: TOKENS — Raw design token values (light mode base)
   ============================================================ */
@layer tokens {
  :root {

    /* ─── PRIMARY PALETTE ─── */
    --reveta-color-primary-50: #E8E8F5;
    --reveta-color-primary-100: #C5C5E8;
    --reveta-color-primary-200: #9494D4;
    --reveta-color-primary-300: #6B6BBF;
    --reveta-color-primary-400: #4A4AAB;
    --reveta-color-primary-500: #2D2D96;
    /* CORE — load-bearing */
    --reveta-color-primary-600: #201E7A;
    --reveta-color-primary-700: #150F5C;
    --reveta-color-primary-800: #0C073F;
    --reveta-color-primary-950: #050318;

    /* ─── SECONDARY PALETTE ─── */
    --reveta-color-secondary-50: #FFF3E0;
    --reveta-color-secondary-100: #FFD699;
    --reveta-color-secondary-300: #FFB347;
    --reveta-color-secondary-500: #E8820C;
    /* IGNITE — counterpoint core */
    --reveta-color-secondary-600: #C4640A;
    --reveta-color-secondary-800: #7A3A05;
    --reveta-color-secondary-950: #2E1302;

    /* ─── ACCENT: PULSE (Urgency / Energy) ─── */
    --reveta-accent-pulse-100: #FFE0F0;
    --reveta-accent-pulse-300: #FF70B8;
    --reveta-accent-pulse-500: #FF1177;
    --reveta-accent-pulse-700: #B8004D;
    --reveta-accent-pulse-900: #600026;

    /* ─── ACCENT: SIGNAL (Intelligence / Precision) ─── */
    --reveta-accent-signal-100: #E0F8FF;
    --reveta-accent-signal-300: #70E8FF;
    --reveta-accent-signal-500: #00C8F0;
    --reveta-accent-signal-700: #008BAA;
    --reveta-accent-signal-900: #003D50;

    /* ─── ACCENT: VOID GLOW (Depth / Mystery) ─── */
    --reveta-accent-void-100: #F0E8FF;
    --reveta-accent-void-300: #C070FF;
    --reveta-accent-void-500: #8822FF;
    --reveta-accent-void-700: #5800C0;
    --reveta-accent-void-900: #280060;

    /* ─── SEMANTIC ─── */
    --reveta-semantic-success-100: #D0F7E8;
    --reveta-semantic-success-500: #00C87A;
    --reveta-semantic-success-700: #008A52;
    --reveta-semantic-success-900: #001A0F;

    --reveta-semantic-warning-100: #FFF3CC;
    --reveta-semantic-warning-500: #FFB300;
    --reveta-semantic-warning-700: #CC8A00;
    --reveta-semantic-warning-900: #332200;

    --reveta-semantic-error-100: #FFE5E3;
    --reveta-semantic-error-500: #FF3B30;
    --reveta-semantic-error-700: #CC1A10;
    --reveta-semantic-error-900: #1A0300;

    --reveta-semantic-info-100: #E0F0FF;
    --reveta-semantic-info-500: #0A84FF;
    --reveta-semantic-info-700: #0060CC;
    --reveta-semantic-info-900: #001433;

    /* ─── NEUTRAL PALETTE (temperature-biased — never pure grey) ─── */
    --reveta-neutral-50: #FAFAF9;
    /* warm */
    --reveta-neutral-100: #F3F3F0;
    /* warm */
    --reveta-neutral-200: #E4E4DF;
    /* warm */
    --reveta-neutral-300: #C8C8C0;
    /* neutral */
    --reveta-neutral-400: #A8A8A2;
    /* neutral */
    --reveta-neutral-500: #888884;
    /* neutral */
    --reveta-neutral-600: #606060;
    /* cool */
    --reveta-neutral-700: #404048;
    /* cool-blue */
    --reveta-neutral-800: #28283A;
    /* cool-blue */
    --reveta-neutral-850: #1E1E2E;
    /* cool-blue */
    --reveta-neutral-900: #14141F;
    /* cold-blue */
    --reveta-neutral-950: #0A0A14;
    /* cold-blue */

    /* ─── TYPOGRAPHY ─── */
    --reveta-font-display: var(--font-display), sans-serif;
    --reveta-font-body: var(--font-body), sans-serif;
    --reveta-font-mono: var(--font-mono), monospace;

    /* Type scale — sizes in rem */
    --reveta-type-t01-size: clamp(2.5rem, 5vw + 1rem, 4.5rem);
    --reveta-type-t01-line: 1.0;
    --reveta-type-t01-tracking: -0.04em;
    --reveta-type-t01-weight: 700;

    --reveta-type-t02-size: clamp(2rem, 4vw + 0.5rem, 3rem);
    --reveta-type-t02-line: 1.05;
    --reveta-type-t02-tracking: -0.03em;
    --reveta-type-t02-weight: 700;

    --reveta-type-t03-size: clamp(1.5rem, 3vw + 0.25rem, 2rem);
    --reveta-type-t03-line: 1.1;
    --reveta-type-t03-tracking: -0.02em;
    --reveta-type-t03-weight: 600;

    --reveta-type-t04-size: clamp(1.25rem, 2vw, 1.5rem);
    --reveta-type-t04-line: 1.2;
    --reveta-type-t04-tracking: -0.01em;
    --reveta-type-t04-weight: 600;

    --reveta-type-t05-size: 1.25rem;
    --reveta-type-t05-line: 1.3;
    --reveta-type-t05-tracking: 0em;
    --reveta-type-t05-weight: 600;

    --reveta-type-t06-size: 1.125rem;
    --reveta-type-t06-line: 1.6;
    --reveta-type-t06-tracking: 0.01em;
    --reveta-type-t06-weight: 400;

    --reveta-type-t07-size: 1rem;
    --reveta-type-t07-line: 1.7;
    --reveta-type-t07-tracking: 0.01em;
    --reveta-type-t07-weight: 400;

    --reveta-type-t08-size: 0.875rem;
    --reveta-type-t08-line: 1.5;
    --reveta-type-t08-tracking: 0.02em;
    --reveta-type-t08-weight: 400;

    --reveta-type-t09-size: 0.75rem;
    --reveta-type-t09-line: 1.4;
    --reveta-type-t09-tracking: 0.08em;
    --reveta-type-t09-weight: 500;

    /* ─── SPATIAL TOKENS (8px grid) ─── */
    --reveta-space-1: 4px;
    /* Micro */
    --reveta-space-2: 8px;
    /* Atom */
    --reveta-space-3: 16px;
    /* Beat */
    --reveta-space-4: 24px;
    /* Breath */
    --reveta-space-5: 32px;
    /* Pause */
    --reveta-space-6: 48px;
    /* Gap */
    --reveta-space-7: 64px;
    /* Rest */
    --reveta-space-8: 96px;
    /* Expanse */
    --reveta-space-9: 128px;
    /* Field */
    --reveta-space-10: 192px;
    /* Void */

    /* ─── BORDER RADIUS ─── */
    --reveta-radius-none: 0px;
    --reveta-radius-sm: 4px;
    --reveta-radius-component: 8px;
    --reveta-radius-card: 12px;
    --reveta-radius-large: 16px;
    --reveta-radius-xl: 24px;
    --reveta-radius-full: 9999px;

    /* ─── ELEVATION / Z-INDEX ─── */
    --reveta-z-base: 0;
    --reveta-z-ground: 10;
    --reveta-z-content: 20;
    --reveta-z-foreground: 30;
    --reveta-z-sticky: 100;
    --reveta-z-overlay: 200;
    --reveta-z-modal: 500;
    --reveta-z-toast: 700;

    /* ─── ELEVATION SHADOWS ─── */
    --reveta-shadow-void: none;
    --reveta-shadow-ground: 0 1px 2px rgba(0, 0, 0, 0.4);
    --reveta-shadow-lift: 0 4px 16px rgba(0, 0, 0, 0.3);
    --reveta-shadow-float: 0 8px 32px rgba(0, 0, 0, 0.25);
    --reveta-shadow-hover: 0 16px 48px rgba(0, 0, 0, 0.2);
    --reveta-shadow-peak: 0 24px 64px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.1);

    /* ─── BACKDROP BLUR ─── */
    --reveta-blur-lift: blur(8px);
    --reveta-blur-float: blur(16px);
    --reveta-blur-hover: blur(24px);
    --reveta-blur-peak: blur(32px);

    /* ─── MOTION DURATIONS (in ms as raw numbers for JS; use with calc() or directly) ─── */
    --reveta-duration-instant: 0ms;
    --reveta-duration-flicker: 80ms;
    --reveta-duration-snap: 120ms;
    --reveta-duration-quick: 200ms;
    --reveta-duration-standard: 300ms;
    --reveta-duration-deliberate: 480ms;
    --reveta-duration-cinematic: 600ms;
    --reveta-duration-story: 800ms;

    /* ─── MOTION EASING ─── */
    --reveta-ease-enter: cubic-bezier(0.16, 1, 0.3, 1);
    --reveta-ease-exit: cubic-bezier(0.7, 0, 0.84, 0);
    --reveta-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
    --reveta-ease-float: cubic-bezier(0.45, 0, 0.55, 1);
    --reveta-ease-sharp: cubic-bezier(0.4, 0, 0.6, 1);
    --reveta-ease-reveal: cubic-bezier(0.23, 1, 0.32, 1);
    --reveta-ease-dramatic: cubic-bezier(0.76, 0, 0.24, 1);

    /* ─── 3D PERSPECTIVE ─── */
    --reveta-3d-perspective-card: 800px;
    --reveta-3d-perspective-hero: 1200px;
    --reveta-3d-rotate-max-luxury: 8deg;
    --reveta-3d-rotate-max-gaming: 15deg;
    --reveta-3d-translatez-lift: 16px;
  }
}


/* ============================================================
   LAYER: SEMANTIC — Contextual alias variables
   These reference raw tokens; update raw tokens above, not here
   ============================================================ */
@layer semantic {
  :root {
    /* Text */
    --reveta-color-text-primary: var(--reveta-neutral-700);
    --reveta-color-text-secondary: var(--reveta-neutral-500);
    --reveta-color-text-tertiary: var(--reveta-neutral-400);
    --reveta-color-text-disabled: var(--reveta-neutral-300);
    --reveta-color-text-inverse: var(--reveta-neutral-50);
    --reveta-color-text-brand: var(--reveta-color-primary-500);
    --reveta-color-text-link: var(--reveta-accent-signal-500);

    /* Backgrounds */
    --reveta-color-bg-page: var(--reveta-neutral-50);
    --reveta-color-bg-card: var(--reveta-neutral-100);
    --reveta-color-bg-elevated: var(--reveta-neutral-100);
    --reveta-color-bg-sunken: var(--reveta-neutral-200);

    /* Borders */
    --reveta-color-border-default: var(--reveta-neutral-200);
    --reveta-color-border-strong: var(--reveta-neutral-300);
    --reveta-color-border-focus: var(--reveta-accent-signal-500);
    --reveta-color-border-brand: var(--reveta-color-primary-500);

    /* Interactive */
    --reveta-color-interactive-primary: var(--reveta-color-primary-500);
    --reveta-color-interactive-primary-hover: var(--reveta-color-primary-400);
    --reveta-color-interactive-secondary: var(--reveta-color-secondary-500);

    /* Semantic */
    --reveta-color-status-success: var(--reveta-semantic-success-500);
    --reveta-color-status-warning: var(--reveta-semantic-warning-500);
    --reveta-color-status-error: var(--reveta-semantic-error-500);
    --reveta-color-status-info: var(--reveta-semantic-info-500);
  }
}


/* ============================================================
   DARK MODE — Primary mode for Reveta Notebook
   Dark mode is DEFAULT. Apply [data-theme="dark"] to <html>
   ============================================================ */
@layer dark-mode {

  [data-theme="dark"],
  :root {
    /* Text — inverted + weight-compensated for dark surfaces */
    --reveta-color-text-primary: var(--reveta-neutral-100);
    --reveta-color-text-secondary: var(--reveta-neutral-400);
    --reveta-color-text-tertiary: var(--reveta-neutral-600);
    --reveta-color-text-disabled: var(--reveta-neutral-700);
    --reveta-color-text-inverse: var(--reveta-neutral-950);
    --reveta-color-text-brand: var(--reveta-color-primary-200);
    --reveta-color-text-link: var(--reveta-accent-signal-300);

    /* Backgrounds — deep space palette */
    --reveta-color-bg-page: var(--reveta-neutral-950);
    --reveta-color-bg-card: var(--reveta-neutral-900);
    --reveta-color-bg-elevated: var(--reveta-neutral-850);
    --reveta-color-bg-sunken: var(--reveta-color-primary-950);

    /* Borders */
    --reveta-color-border-default: var(--reveta-neutral-800);
    --reveta-color-border-strong: var(--reveta-neutral-700);
    --reveta-color-border-focus: var(--reveta-accent-signal-500);
    --reveta-color-border-brand: var(--reveta-color-primary-400);

    /* Interactive — slightly lighter for visibility against dark bg */
    --reveta-color-interactive-primary: var(--reveta-color-primary-400);
    --reveta-color-interactive-primary-hover: var(--reveta-color-primary-300);
    --reveta-color-interactive-secondary: var(--reveta-color-secondary-300);

    /* Semantic — same in dark mode; contrast checked */
    --reveta-color-status-success: var(--reveta-semantic-success-500);
    --reveta-color-status-warning: var(--reveta-semantic-warning-500);
    --reveta-color-status-error: var(--reveta-semantic-error-500);
    --reveta-color-status-info: var(--reveta-semantic-info-500);

    /* Dark mode body type weight compensation */
    --reveta-type-t07-weight: 450;
    /* body text +50 in dark mode */
  }

  /* Light mode override — apply [data-theme="light"] for accessibility variant */
  [data-theme="light"] {
    --reveta-color-text-primary: var(--reveta-neutral-700);
    --reveta-color-text-secondary: var(--reveta-neutral-500);
    --reveta-color-text-tertiary: var(--reveta-neutral-400);
    --reveta-color-text-disabled: var(--reveta-neutral-300);
    --reveta-color-text-inverse: var(--reveta-neutral-50);
    --reveta-color-text-brand: var(--reveta-color-primary-500);
    --reveta-color-text-link: var(--reveta-accent-signal-500);

    --reveta-color-bg-page: var(--reveta-neutral-50);
    --reveta-color-bg-card: var(--reveta-neutral-100);
    --reveta-color-bg-elevated: var(--reveta-neutral-100);
    --reveta-color-bg-sunken: var(--reveta-neutral-200);

    --reveta-color-border-default: var(--reveta-neutral-200);
    --reveta-color-border-strong: var(--reveta-neutral-300);

    --reveta-type-t07-weight: 400;
    /* standard weight in light mode */
  }
}


/* ============================================================
   ACCESSIBILITY — Reduced Motion
   Pauses Tier-1 (ambient) and Tier-4 (parallax) completely
   Snaps Tier-2 and Tier-3 to instant transitions
   ============================================================ */
@layer reduced-motion {
  @media (prefers-reduced-motion: reduce) {

    /* TIER-1: Ambient animations — pause completely */
    .ambient-animation,
    [data-motion="ambient"],
    .reveta-ambient-breathe,
    .reveta-ambient-drift,
    .reveta-ambient-pulse {
      animation: none !important;
      transition: none !important;
    }

    /* TIER-4: Parallax — disable completely */
    .parallax-layer,
    [data-parallax],
    .reveta-parallax-plane {
      transform: none !important;
      transition: none !important;
    }

    /* TIER-2 and TIER-3: Snap to instant (functional but not animated) */
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }

    /* 3D hover: flatten to standard hover (colour/shadow only) */
    .reveta-3d-card:hover,
    [data-3d-hover]:hover {
      transform: none !important;
    }
  }
}