# Reveta Notebook — Figma Design System Documentation
**DS-FIGMA-FINAL · Design System §7 Export Deliverables · Version 1.0**

---

## 1. FIGMA ORGANISATION STRUCTURE

```
Reveta Notebook Design System
├── 🎨 Foundations
│   ├── Colour / Primary
│   ├── Colour / Secondary
│   ├── Colour / Accent / Signal
│   ├── Colour / Accent / Pulse
│   ├── Colour / Accent / Void
│   ├── Colour / Neutrals
│   ├── Colour / Semantic
│   ├── Typography / Scale
│   ├── Typography / Fonts
│   ├── Spacing / Grid
│   ├── Motion / Durations
│   ├── Motion / Easings
│   └── Surface / Elevation
├── 🧩 Components
│   ├── Tier 0: Foundational (8)
│   ├── Tier 1: Navigation (5 + Command Palette)
│   ├── Tier 2: Content (8)
│   ├── Tier 2: Feedback (5)
│   └── Tier 3: Immersive (6)
├── 🌊 Chromatic Moods (4 states)
├── 🔭 Parallax Planes (5)
├── 📱 Page Templates
│   ├── Dashboard
│   ├── Notebook View
│   └── Audio Share (Public)
└── 📖 Documentation
    ├── Token Usage Rules
    ├── Motion Taxonomy
    └── Accessibility Notes
```

---

## 2. TOKEN NAMING CONVENTION

Figma uses dot-notation. All tokens follow `group/subgroup/name`.
Dark mode is a **Variable Mode on the same collection** — not a separate set.

```
Colour/Primary/500        → --reveta-color-primary-500   → #2D2D96
Colour/Primary/950        → --reveta-color-primary-950   → #050318
Colour/Accent/Signal/500  → --reveta-accent-signal-500   → #00C8F0
Colour/Accent/Pulse/500   → --reveta-accent-pulse-500    → #FF1177
Colour/Neutral/950        → --reveta-neutral-950         → #0A0A14
Colour/Semantic/Error     → --reveta-semantic-error-500
Spacing/1                 → --reveta-space-1             → 4px
Spacing/2                 → --reveta-space-2             → 8px
Spacing/3                 → --reveta-space-3             → 16px
Spacing/4                 → --reveta-space-4             → 24px
Typography/T01/Size       → --reveta-type-t01-size       → clamp(2.5rem, 5vw+1rem, 4.5rem)
Typography/T07/Size       → --reveta-type-t07-size       → clamp(0.9rem, 0.8rem+0.4vw, 1rem)
Motion/Duration/Quick     → --reveta-duration-quick      → 200ms
Motion/Duration/Standard  → --reveta-duration-standard   → 300ms
Motion/Ease/Enter         → --reveta-ease-enter          → cubic-bezier(0.16, 1, 0.3, 1)
Motion/Ease/Spring        → --reveta-ease-spring         → cubic-bezier(0.34, 1.56, 0.64, 1)
Surface/Float             → --reveta-surface-float       → blur(16px) + shadow
```

---

## 3. COMPONENT SPECIFICATION (FIGMA LAYER NAMING)

Each component must have identical layer names across all variants for
Smart Animate to work. Layer naming format: `COMPONENT_ID / layer-name`.

### BTN-PRIMARY
```
Layers (all variants must match):
  BTN-PRIMARY / bg-layer       — fill layer, bound to Colour/Primary/500
  BTN-PRIMARY / label          — text layer, bound to Typography/T09
  BTN-PRIMARY / icon-slot      — optional icon frame (24×24)
  BTN-PRIMARY / loading-spinner — visible only in loading variant

Variants: [size: sm | md | lg] × [state: rest | hover | active | focus | disabled | loading]
Size tokens: sm h=32px, md h=40px, lg h=48px

Interactive States:
  rest:     bg=Primary/500, label=Neutral/50
  hover:    bg=Primary/400, translateY(-2px), shadow=Surface/Float
  active:   scale(0.97), bg=Primary/600, 80ms reveta-sharp
  focus:    outline=Signal/500 2px, offset=2px
  disabled: opacity=0.4, no hover
  loading:  label opacity→0, spinner visible
```

### INPUT-TEXT
```
Layers:
  INPUT-TEXT / container
  INPUT-TEXT / label
  INPUT-TEXT / input-field     — placeholder uses Neutral/500
  INPUT-TEXT / helper-text
  INPUT-TEXT / error-text

Variants: [state: default | focused | error | disabled | with-icon]
  focused: border=Signal/500, box-shadow=0 0 0 3px Signal/100
  error:   border=Semantic/Error
```

### BADGE
```
Layers:
  BADGE / container
  BADGE / label

Variants: [variant: default | brand | success | error | info | warning] × [size: sm | md]
```

### CARD (with 3D hover)
```
Layers:
  CARD / surface               — bound to Surface/Ground or Surface/Lift
  CARD / content-slot
  CARD / 3d-perspective-parent — perspective: 800px on THIS layer

3D Hover prototype: use Figma Smart Animate on CARD / 3d-perspective-parent
  rotateX and rotateY via Interactive Component property
```

---

## 4. CHROMATIC MOOD STATES (FIGMA MODES)

Create as **Modes on the Colour collection** so any frame can switch mood:

```
Mode: ambient-rest
  Surface/Primary → Void (#050318)
  Surface/Secondary → Ground (#0A0A14)
  Accent/Opacity → 0%
  Ambient/PlayState → Running

Mode: focused-flow
  Surface/Primary → Ground (#0A0A14)
  Surface/Secondary → Ground (#0A0A14)
  Accent/Opacity → 0%
  Ambient/Opacity → 30%

Mode: interaction-peak
  Surface/Primary → Lift
  Surface/Secondary → Float
  Accent/Opacity → 100%
  Ambient/Orb → 25% opacity

Mode: revelation
  Surface/Primary → Float
  Surface/Secondary → Peak
  Accent/Opacity → 100%
  Ambient/Orb → 45% opacity
  Revelation/Pulse → Active (1800ms animation)
```

In Figma Make: bind `data-mood` attribute to the Mode selector.
Transitions use Smart Animate with `reveta-dramatic` easing (0.76, 0, 0.24, 1).

---

## 5. PARALLAX PLANES (FIGMA FRAMES)

Create as a Frame group `PARALLAX-SCENE` with 5 nested frames:

```
PARALLAX-SCENE (overflow: hidden, clip)
  ├── PLANE-BASE       z=0   parallax-coeff=0.2x  opacity≤0.07
  ├── PLANE-GROUND     z=10  parallax-coeff=0.4x  fog overlay
  ├── PLANE-CONTENT    z=20  parallax-coeff=0.7x  main content
  ├── PLANE-FOREGROUND z=30  parallax-coeff=1.1x  particle shards
  └── PLANE-SKY        z=100 fixed                atmospheric haze
```

For Figma prototype: use scroll trigger → Move layer (vertical offset)
scaled by each coefficient. PLANE-FOREGROUND moves 1.1× the scroll delta
(negative direction = upward parallax pop).

---

## 6. MOTION TOKENS AS NUMBER TYPE

Figma motion tokens must use **Number type** (not String) for prototype references:

```
Motion/Duration/Quick     → 200  (ms, as number)
Motion/Duration/Standard  → 300
Motion/Duration/Deliberate → 480
Motion/Duration/Cinematic → 600
Motion/Duration/Story     → 800

Motion/Ease/Enter    → [0.16, 1, 0.3, 1]    (array for cubic-bezier)
Motion/Ease/Spring   → [0.34, 1.56, 0.64, 1]
Motion/Ease/Sharp    → [0.4, 0, 0.6, 1]
Motion/Ease/Reveal   → [0.23, 1, 0.32, 1]
Motion/Ease/Dramatic → [0.76, 0, 0.24, 1]
```

---

## 7. FIGMA MAKE INTEGRATION

For Figma Make code generation to match the codebase exactly:

```json
{
  "framework": "nextjs",
  "styling": "tailwind",
  "tokenSource": "tokens/design-tokens.json",
  "cssVariablePrefix": "--reveta-",
  "componentOutput": "components/ui/",
  "classNaming": "reveta-{component}",
  "fontImports": [
    "Space_Grotesk (variable: --font-display)",
    "Inter (variable: --font-body)",
    "JetBrains_Mono (variable: --font-mono)"
  ],
  "darkMode": {
    "default": true,
    "attribute": "data-theme",
    "value": "dark"
  },
  "motionAccessibility": {
    "reducedMotionAttr": "prefers-reduced-motion: reduce",
    "comfortModeAttr": "data-comfort-mode=\"true\"",
    "tier1Classes": ".reveta-ambient",
    "tier4Classes": "[data-parallax-layer]"
  }
}
```

---

## 8. EXPORT CHECKLIST

```
□ All 9 colour stops for Primary palette in Figma Variables
□ All 13 Neutral stops in Figma Variables
□ Signal, Pulse, Void accent palettes in Figma Variables
□ Semantic colours (success/warning/error/info) in Figma Variables
□ 10 spacing tokens as Number variables
□ 9 typography scale steps as Text Style presets
□ Font pairing: Space Grotesk + Inter + JetBrains Mono installed
□ 7 motion duration tokens as Number variables
□ 7 easing curves as custom bezier presets
□ 4 Chromatic Mood states as Variable Modes
□ 5 Parallax Plane frames documented
□ All Tier-0 through Tier-3 components with Smart Animate layers
□ Dark mode = default Mode (not secondary)
□ Token naming verified: group/subgroup/name dot-notation
□ Figma Make config JSON matches codebase framework + token prefix
□ Contrast ratios annotated on all text components (min 4.5:1)
```

---

*Reveta Notebook Design System v1.0 · DS-FIGMA-FINAL · Document B §7*
*Source of truth: tokens/design-tokens.json + app/globals.css*
