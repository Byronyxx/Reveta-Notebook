# Reveta Notebook — Figma Design System
**DS-FIGMA-FINAL · Version 1.0**

## TOKEN NAMING CONVENTION

Figma uses dot-notation. Dark mode is a **Variable Mode on the same collection** — not a separate set.

```
Colour/Primary/500        → --reveta-color-primary-500   → #2D2D96
Colour/Accent/Signal/500  → --reveta-accent-signal-500   → #00C8F0
Colour/Neutral/950        → --reveta-neutral-950         → #0A0A14
Spacing/1                 → --reveta-space-1             → 4px
Motion/Duration/Quick     → --reveta-duration-quick      → 200ms
Motion/Ease/Enter         → --reveta-ease-enter          → cubic-bezier(0.16, 1, 0.3, 1)
```

## COMPONENT LAYER NAMING

All layers must have identical names across variants for Smart Animate:

```
BTN-PRIMARY / bg-layer
BTN-PRIMARY / label
BTN-PRIMARY / icon-slot
BTN-PRIMARY / loading-spinner

INPUT-TEXT / container
INPUT-TEXT / label
INPUT-TEXT / input-field
INPUT-TEXT / error-text
```

## CHROMATIC MOOD STATES (Figma Modes)

```
Mode: ambient-rest      → Surface: Void + Ground, no accents
Mode: focused-flow      → Surface: Ground only, ambient 30%
Mode: interaction-peak  → Surface: Lift + Float, 1 accent
Mode: revelation        → Surface: Float + Peak, accent flash
```

## FIGMA MAKE CONFIG

```json
{
  "framework": "nextjs",
  "styling": "tailwind",
  "tokenSource": "tokens/design-tokens.json",
  "cssVariablePrefix": "--reveta-",
  "darkMode": { "default": true, "attribute": "data-theme", "value": "dark" }
}
```

## EXPORT CHECKLIST

```
□ All colour stops in Figma Variables
□ 4 Chromatic Mood states as Variable Modes
□ 5 Parallax Plane frames documented
□ All components with Smart Animate layers
□ Dark mode = default Mode
□ Token naming: group/subgroup/name dot-notation
□ Contrast ratios annotated (min 4.5:1)
```
