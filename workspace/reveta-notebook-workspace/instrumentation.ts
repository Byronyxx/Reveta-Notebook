{
  "reveta": {
    "$description": "Reveta Notebook Design System Tokens v1.0",
    "$version": "1.0.0",
    "$schema": "https://design-tokens.github.io/community-group/format/",

    "color": {
      "primary": {
        "50":  { "value": "#E8E8F5", "type": "color", "description": "Haze — lightest primary, light mode backgrounds" },
        "100": { "value": "#C5C5E8", "type": "color", "description": "Mist — subtle UI elements" },
        "200": { "value": "#9494D4", "type": "color", "description": "Drift — borders, dividers" },
        "300": { "value": "#6B6BBF", "type": "color", "description": "Rise — secondary interactive" },
        "400": { "value": "#4A4AAB", "type": "color", "description": "Approach — hover states" },
        "500": { "value": "#2D2D96", "type": "color", "description": "Core — LOAD-BEARING colour, all primaries orbit this" },
        "600": { "value": "#201E7A", "type": "color", "description": "Descent — pressed states" },
        "700": { "value": "#150F5C", "type": "color", "description": "Depth — dark backgrounds" },
        "800": { "value": "#0C073F", "type": "color", "description": "Abyss — deep UI surfaces" },
        "950": { "value": "#050318", "type": "color", "description": "Void — darkest surface, dark mode base" }
      },
      "secondary": {
        "50":  { "value": "#FFF3E0", "type": "color", "description": "Warmth — lightest warm" },
        "100": { "value": "#FFD699", "type": "color", "description": "Amber — notification tints" },
        "300": { "value": "#FFB347", "type": "color", "description": "Ember — secondary CTA" },
        "500": { "value": "#E8820C", "type": "color", "description": "Ignite — counterpoint core, tension with primary" },
        "600": { "value": "#C4640A", "type": "color", "description": "Smoulder — pressed secondary" },
        "800": { "value": "#7A3A05", "type": "color", "description": "Char — dark secondary" },
        "950": { "value": "#2E1302", "type": "color", "description": "Coal — darkest secondary" }
      },
      "accent": {
        "pulse": {
          "100": { "value": "#FFE0F0", "type": "color", "description": "Whisper — lightest pulse" },
          "300": { "value": "#FF70B8", "type": "color", "description": "Spark" },
          "500": { "value": "#FF1177", "type": "color", "description": "Pulse — urgency, energy, CTA peak" },
          "700": { "value": "#B8004D", "type": "color", "description": "Surge" },
          "900": { "value": "#600026", "type": "color", "description": "Core" }
        },
        "signal": {
          "100": { "value": "#E0F8FF", "type": "color", "description": "Clarity — focus ring background" },
          "300": { "value": "#70E8FF", "type": "color", "description": "Ping" },
          "500": { "value": "#00C8F0", "type": "color", "description": "Signal — intelligence, precision, focus ring" },
          "700": { "value": "#008BAA", "type": "color", "description": "Lock" },
          "900": { "value": "#003D50", "type": "color", "description": "Deep" }
        },
        "void": {
          "100": { "value": "#F0E8FF", "type": "color", "description": "Shimmer" },
          "300": { "value": "#C070FF", "type": "color", "description": "Aurora" },
          "500": { "value": "#8822FF", "type": "color", "description": "Void Glow — depth, mystery, bioluminescent" },
          "700": { "value": "#5800C0", "type": "color", "description": "Rift" },
          "900": { "value": "#280060", "type": "color", "description": "Oblivion" }
        }
      },
      "semantic": {
        "success": {
          "100": { "value": "#D0F7E8", "type": "color", "description": "Success tint" },
          "500": { "value": "#00C87A", "type": "color", "description": "Success — bioluminescent green, distinct from all accents" },
          "700": { "value": "#008A52", "type": "color", "description": "Success dark" },
          "900": { "value": "#003D24", "type": "color", "description": "Success deep" }
        },
        "warning": {
          "100": { "value": "#FFF3CC", "type": "color", "description": "Warning tint" },
          "500": { "value": "#FFB300", "type": "color", "description": "Warning — warm amber, physiological recognition" },
          "700": { "value": "#CC8A00", "type": "color", "description": "Warning dark" },
          "900": { "value": "#664400", "type": "color", "description": "Warning deep" }
        },
        "error": {
          "100": { "value": "#FFE5E3", "type": "color", "description": "Error tint" },
          "500": { "value": "#FF3B30", "type": "color", "description": "Error — high-urgency red, peripheral vision recognition" },
          "700": { "value": "#CC1A10", "type": "color", "description": "Error dark" },
          "900": { "value": "#660D08", "type": "color", "description": "Error deep" }
        },
        "info": {
          "100": { "value": "#E0F0FF", "type": "color", "description": "Info tint" },
          "500": { "value": "#0A84FF", "type": "color", "description": "Info — bright blue, neutral intelligence" },
          "700": { "value": "#0060CC", "type": "color", "description": "Info dark" },
          "900": { "value": "#003066", "type": "color", "description": "Info deep" }
        }
      },
      "neutral": {
        "50":  { "value": "#FAFAF9", "type": "color", "description": "Warm — page background light mode" },
        "100": { "value": "#F3F3F0", "type": "color", "description": "Warm — card background light mode" },
        "200": { "value": "#E4E4DF", "type": "color", "description": "Warm — borders light mode" },
        "300": { "value": "#C8C8C0", "type": "color", "description": "Neutral — disabled text" },
        "400": { "value": "#A8A8A2", "type": "color", "description": "Neutral — placeholder text" },
        "500": { "value": "#888884", "type": "color", "description": "Neutral — secondary text" },
        "600": { "value": "#606060", "type": "color", "description": "Cool — body text" },
        "700": { "value": "#404048", "type": "color", "description": "Cool-blue — strong text" },
        "800": { "value": "#28283A", "type": "color", "description": "Cool-blue — page background dark mode" },
        "850": { "value": "#1E1E2E", "type": "color", "description": "Cool-blue — card background dark mode" },
        "900": { "value": "#14141F", "type": "color", "description": "Cold-blue — deep background dark mode" },
        "950": { "value": "#0A0A14", "type": "color", "description": "Cold-blue — void surface dark mode" }
      }
    },

    "typography": {
      "family": {
        "display": { "value": "'Space Grotesk', sans-serif", "type": "fontFamily", "description": "Display headlines — geometric grotesque with human irregularity" },
        "body":    { "value": "'Inter', sans-serif", "type": "fontFamily", "description": "Body text — screen-optimised, near-matching x-height to Space Grotesk" },
        "mono":    { "value": "'JetBrains Mono', monospace", "type": "fontFamily", "description": "Code, labels, technical — designed mono with ligatures" }
      },
      "scale": {
        "t-01": { "size": { "value": 72, "type": "dimension" }, "lineHeight": { "value": 1.0 }, "letterSpacing": { "value": "-0.04em" }, "weight": { "value": 700 }, "role": "Hero" },
        "t-02": { "size": { "value": 48, "type": "dimension" }, "lineHeight": { "value": 1.05 }, "letterSpacing": { "value": "-0.03em" }, "weight": { "value": 700 }, "role": "Display" },
        "t-03": { "size": { "value": 32, "type": "dimension" }, "lineHeight": { "value": 1.1 },  "letterSpacing": { "value": "-0.02em" }, "weight": { "value": 600 }, "role": "H1" },
        "t-04": { "size": { "value": 24, "type": "dimension" }, "lineHeight": { "value": 1.2 },  "letterSpacing": { "value": "-0.01em" }, "weight": { "value": 600 }, "role": "H2" },
        "t-05": { "size": { "value": 20, "type": "dimension" }, "lineHeight": { "value": 1.3 },  "letterSpacing": { "value": "0em" },     "weight": { "value": 600 }, "role": "H3" },
        "t-06": { "size": { "value": 18, "type": "dimension" }, "lineHeight": { "value": 1.6 },  "letterSpacing": { "value": "0.01em" },  "weight": { "value": 400 }, "role": "Body Large" },
        "t-07": { "size": { "value": 16, "type": "dimension" }, "lineHeight": { "value": 1.7 },  "letterSpacing": { "value": "0.01em" },  "weight": { "value": 400 }, "role": "Body" },
        "t-08": { "size": { "value": 14, "type": "dimension" }, "lineHeight": { "value": 1.5 },  "letterSpacing": { "value": "0.02em" },  "weight": { "value": 400 }, "role": "Caption" },
        "t-09": { "size": { "value": 12, "type": "dimension" }, "lineHeight": { "value": 1.4 },  "letterSpacing": { "value": "0.08em" },  "weight": { "value": 500 }, "role": "Label" }
      }
    },

    "space": {
      "1":  { "value": 4,   "type": "dimension", "description": "Micro — inline component spacing only" },
      "2":  { "value": 8,   "type": "dimension", "description": "Atom — base unit, component internal" },
      "3":  { "value": 16,  "type": "dimension", "description": "Beat — section internal" },
      "4":  { "value": 24,  "type": "dimension", "description": "Breath — between related elements" },
      "5":  { "value": 32,  "type": "dimension", "description": "Pause — between content groups" },
      "6":  { "value": 48,  "type": "dimension", "description": "Gap — between sections" },
      "7":  { "value": 64,  "type": "dimension", "description": "Rest — major section breaks" },
      "8":  { "value": 96,  "type": "dimension", "description": "Expanse — hero section padding" },
      "9":  { "value": 128, "type": "dimension", "description": "Field — full-bleed margins" },
      "10": { "value": 192, "type": "dimension", "description": "Void — dramatic hero whitespace" }
    },

    "elevation": {
      "base": { "zIndex": 0,   "parallaxCoefficient": 0.2, "shadow": "none",                                                       "backdropBlur": "none",    "description": "Base — background plane" },
      "ground": { "zIndex": 10,  "parallaxCoefficient": 0.4, "shadow": "0 1px 2px rgba(0,0,0,0.4)",                                  "backdropBlur": "none",    "description": "Ground — ground plane" },
      "content": { "zIndex": 20,  "parallaxCoefficient": 0.7, "shadow": "0 4px 16px rgba(0,0,0,0.3)",                                 "backdropBlur": "blur(8px)",  "description": "Content — main content plane" },
      "foreground": { "zIndex": 30,  "parallaxCoefficient": 1.1, "shadow": "0 8px 32px rgba(0,0,0,0.25)",                                "backdropBlur": "blur(16px)", "description": "Foreground — foreground plane" },
      "sticky": { "zIndex": 100, "parallaxCoefficient": null, "shadow": "0 2px 8px rgba(0,0,0,0.3)",                                 "backdropBlur": "blur(16px)", "description": "Sticky — navigation, fixed headers" },
      "overlay": { "zIndex": 200, "parallaxCoefficient": null, "shadow": "0 16px 48px rgba(0,0,0,0.2)",                               "backdropBlur": "blur(24px)", "description": "Overlay — dropdowns, popovers" },
      "modal": { "zIndex": 500, "parallaxCoefficient": null, "shadow": "0 24px 64px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.1)", "backdropBlur": "blur(32px)", "description": "Modal — dialogs, sheets" },
      "toast": { "zIndex": 700, "parallaxCoefficient": null, "shadow": "0 4px 16px rgba(0,0,0,0.3)",                                "backdropBlur": "none",    "description": "Toast — notifications, toasts" }
    },

    "motion": {
      "duration": {
        "instant":    { "value": 0,   "type": "duration", "description": "Synchronous state changes — no perceived delay" },
        "flicker":    { "value": 80,  "type": "duration", "description": "Fastest perceivable intentional motion" },
        "snap":       { "value": 120, "type": "duration", "description": "Button press, checkbox tick" },
        "quick":      { "value": 200, "type": "duration", "description": "Hover enter, tooltip appear" },
        "standard":   { "value": 300, "type": "duration", "description": "Most UI state transitions" },
        "deliberate": { "value": 480, "type": "duration", "description": "Zoom reveals, modal entrances" },
        "cinematic":  { "value": 600, "type": "duration", "description": "Page transitions, hero reveals" },
        "story":      { "value": 800, "type": "duration", "description": "Narrative parallax, scroll-driven sequences" }
      },
      "easing": {
        "enter":    { "value": "cubic-bezier(0.16, 1, 0.3, 1)",    "type": "cubicBezier", "description": "Elements arriving — fast start, smooth settle" },
        "exit":     { "value": "cubic-bezier(0.7, 0, 0.84, 0)",    "type": "cubicBezier", "description": "Elements departing — slow start, fast exit" },
        "spring":   { "value": "cubic-bezier(0.34, 1.56, 0.64, 1)","type": "cubicBezier", "description": "Bouncy confirms and delights — overshoots" },
        "float":    { "value": "cubic-bezier(0.45, 0, 0.55, 1)",   "type": "cubicBezier", "description": "Ambient, breathing, atmospheric motions" },
        "sharp":    { "value": "cubic-bezier(0.4, 0, 0.6, 1)",     "type": "cubicBezier", "description": "Technical, precise transitions" },
        "reveal":   { "value": "cubic-bezier(0.23, 1, 0.32, 1)",   "type": "cubicBezier", "description": "3D hover lift — the floating ease" },
        "dramatic": { "value": "cubic-bezier(0.76, 0, 0.24, 1)",   "type": "cubicBezier", "description": "Hero moments, page transitions, major reveals" }
      },
      "threed": {
        "perspectiveCard":   { "value": 800,  "type": "dimension", "description": "Perspective value for card 3D hover — apply to PARENT" },
        "perspectiveHero":   { "value": 1200, "type": "dimension", "description": "Perspective value for hero 3D — wider, more subtle" },
        "rotateMaxLuxury":   { "value": 8,    "type": "number",    "description": "Max rotation degrees for luxury (restrained) 3D effect" },
        "rotateMaxGaming":   { "value": 15,   "type": "number",    "description": "Max rotation degrees for gaming-grade (bold) 3D effect" },
        "translateZLift":    { "value": 16,   "type": "dimension", "description": "Z-axis lift on hover — creates shadow depth effect" }
      }
    },

    "radius": {
      "none":      { "value": 0,   "type": "dimension" },
      "sm":        { "value": 4,   "type": "dimension", "description": "Small elements: badges, chips" },
      "component": { "value": 8,   "type": "dimension", "description": "Standard components: buttons, inputs" },
      "card":      { "value": 12,  "type": "dimension", "description": "Cards and panels" },
      "large":     { "value": 16,  "type": "dimension", "description": "Large surfaces: modals, drawers" },
      "xl":        { "value": 24,  "type": "dimension", "description": "Hero elements" },
      "full":      { "value": 9999, "type": "dimension", "description": "Pill shape: fully rounded" }
    }
  }
}
