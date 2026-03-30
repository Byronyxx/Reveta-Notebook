{
  "$schema": "https://antigravity.dev/schemas/design-tokens.json",
  "source": "../tokens/design-tokens.json",
  "cssOutput": "../app/globals.css",
  "tailwindConsumer": "../tailwind.config.ts",

  "prefix": "--reveta-",

  "categories": {
    "color.primary": {
      "cssPrefix": "--reveta-color-primary-",
      "tailwindKey": "primary",
      "description": "9-stop signature palette. primary-500 is the load-bearing colour."
    },
    "color.secondary": {
      "cssPrefix": "--reveta-color-secondary-",
      "tailwindKey": "secondary"
    },
    "color.accent.signal": {
      "cssPrefix": "--reveta-accent-signal-",
      "tailwindKey": "signal",
      "description": "Cyan accent — interactive focus states, signal indicators"
    },
    "color.accent.pulse": {
      "cssPrefix": "--reveta-accent-pulse-",
      "tailwindKey": "pulse",
      "description": "Pink accent — revelation moments, AI-response signals"
    },
    "color.accent.void": {
      "cssPrefix": "--reveta-accent-void-",
      "tailwindKey": "void-glow",
      "description": "Deep purple — ambient glow, atmospheric depth"
    },
    "color.neutral": {
      "cssPrefix": "--reveta-neutral-",
      "tailwindKey": "neutral",
      "description": "13-stop neutral scale. neutral-950 is page background."
    },
    "color.semantic": {
      "cssPrefix": "--reveta-semantic-",
      "tailwindKey": { "success": "success", "warning": "warning", "error": "error", "info": "info" }
    },
    "spacing": {
      "cssPrefix": "--reveta-space-",
      "tailwindKey": "reveta-{n}",
      "scale": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      "pxValues": [4, 8, 16, 24, 32, 48, 64, 96, 128, 192],
      "note": "reveta-1.5 (6px) is defined directly in tailwind.config.ts, not in token file"
    },
    "typography": {
      "cssPrefix": "--reveta-type-",
      "scaleSteps": ["t01", "t02", "t03", "t04", "t05", "t06", "t07", "t08", "t09"],
      "fonts": {
        "display": "--reveta-font-display",
        "body": "--reveta-font-body",
        "mono": "--reveta-font-mono"
      }
    },
    "motion": {
      "cssPrefix": "--reveta-duration-",
      "easingPrefix": "--reveta-ease-",
      "tiers": {
        "1": "ambient — background loops, 3000-8000ms",
        "2": "responsive — hover/cursor, 150-400ms",
        "3": "transitional — state changes, 250-600ms",
        "4": "narrative — parallax scroll, real-time"
      },
      "comfortModeDisables": ["tier1", "tier4"],
      "comfortModeAttr": "data-comfort-mode=\"true\""
    },
    "surface": {
      "cssPrefix": "--reveta-surface-",
      "planes": ["void", "ground", "lift", "float", "hover", "peak"],
      "zIndex": [0, 10, 20, 30, 100, 200],
      "parallaxCoefficients": [0.2, 0.4, 0.7, 1.1, "fixed", "fixed"]
    },
    "radius": {
      "cssPrefix": "--reveta-radius-",
      "values": ["component", "large", "pill"]
    },
    "elevation": {
      "cssPrefix": "--reveta-z-",
      "values": ["base", "ground", "content", "foreground", "sticky", "overlay", "modal", "toast"]
    }
  },

  "chromaticMoods": {
    "states": {
      "ambient-rest": {
        "attr": "data-mood=\"ambient-rest\"",
        "description": "Default state — Void+Ground surfaces, Tier-1 motion, low brightness"
      },
      "focused-flow": {
        "attr": "data-mood=\"focused-flow\"",
        "description": "Input focused — Ground only, motion paused, reduced brightness"
      },
      "interaction-peak": {
        "attr": "data-mood=\"interaction-peak\"",
        "description": "Hover active — Lift+Float, 1 accent, Tier-2 motion, high brightness"
      },
      "revelation": {
        "attr": "data-mood=\"revelation\"",
        "description": "AI response arrives — Float+Peak, accent flash, 1800ms then returns"
      }
    },
    "hook": "useChromaticMood",
    "provider": "ChromaticMoodProvider",
    "source": "../lib/chromatic-moods.tsx"
  }
}
