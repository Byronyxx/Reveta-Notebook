# DOCUMENT B — Reveta Notebook Immersive Design System v1.0
## Global Design Director Brief · Gaming-Grade Experience Architecture

**Authority Tier:** 2 — EXPERIENCE TRUTH
**Status:** Active · Version 1.0
**Role in System:** Defines HOW everything looks, moves, and feels

---

> **Reading Note:** This is the visual and interaction constitution for Reveta Notebook.
> Every token, every curve, every colour is a cause with measurable psychological effects.
> A design system is not a style guide — it is a physics engine for perception.

---

## BRAND INTELLIGENCE

**Brand Name:** Reveta Notebook

**Personality Pillars** (design lives in the tension between these):
- `MINIMAL` — brutally intentional negative space; silence as design element
- `BOLD` — when something speaks, it commands the room
- `LUXURY` — quality felt in what is absent, not what is added
- `PLAYFUL` — micro-delights that reward exploration
- `MODERN` — forward-positioned; never nostalgic
- `TECHNICAL` — precision-engineered aesthetics; grids felt even when invisible

**Experiential Direction:** Gaming-grade immersion. The interface is not a flat surface — it is a dimensional space the user inhabits. Every interaction should feel like the environment is aware of the user.

**Environmental References:** Journey (environmental storytelling) + Monument Valley (interface poetry) + Bloomberg Terminal reimagined for luxury + Dark Souls UI (atmospheric depth)

**Core Experiential Laws:**
1. The interface breathes — ambient animations run at rest, not only on interaction
2. Depth is earned — elements exist on Z-axis planes, not a flat canvas
3. Cursor presence is acknowledged — the world responds to where attention lands
4. Narrative lives in transition — state A to state B tells a story
5. Silence amplifies — empty space is the frame for drama

---

## SECTION 01 — COLOUR SYSTEM

### Governing Philosophy
Colour in Reveta is atmosphere engineering. Every palette decision must answer:
"What does the user feel in their body when this colour occupies their visual field?"

**Ambience Target:** Deep-space luxury with moments of bioluminescent revelation.
The chromatic mood of Blade Runner 2049 — darkness as the dominant surface,
colour emerging from within. The interface should **glow**, not shine.

**Dark mode is the PRIMARY mode.** Light mode is the high-contrast accessibility variant.

---

### Primary Palette — "The Reveta Signature" (9-stop scale)

| Token | Stop | Hex | Atmospheric Name | Role |
|-------|------|-----|-----------------|------|
| `--reveta-color-primary-50` | 50 | `#E8E8F5` | Haze | Lightest tint, backgrounds on light mode |
| `--reveta-color-primary-100` | 100 | `#C5C5E8` | Mist | Subtle UI elements |
| `--reveta-color-primary-200` | 200 | `#9494D4` | Drift | Borders, dividers |
| `--reveta-color-primary-300` | 300 | `#6B6BBF` | Rise | Secondary interactive |
| `--reveta-color-primary-400` | 400 | `#4A4AAB` | Approach | Hover states |
| `--reveta-color-primary-500` | 500 | `#2D2D96` | **Core** | **LOAD-BEARING COLOUR** |
| `--reveta-color-primary-600` | 600 | `#201E7A` | Descent | Pressed states |
| `--reveta-color-primary-700` | 700 | `#150F5C` | Depth | Dark backgrounds |
| `--reveta-color-primary-800` | 800 | `#0C073F` | Abyss | Deep UI surfaces |
| `--reveta-color-primary-950` | 950 | `#050318` | **Void** | Darkest surface |

**Psychological Intent:** Primary-500 (Core) is a deep electric indigo — it reads as intelligent, focused, and slightly otherworldly without being aggressive. It is the colour of a mind working at full capacity in a dark room.

---

### Secondary Palette — "The Counterpoint" (7-stop scale)

| Token | Stop | Hex | Name | Role |
|-------|------|-----|------|------|
| `--reveta-color-secondary-50` | 50 | `#FFF3E0` | Warmth | Lightest warm accent |
| `--reveta-color-secondary-100` | 100 | `#FFD699` | Amber | Notification tints |
| `--reveta-color-secondary-300` | 300 | `#FFB347` | Ember | Secondary CTA |
| `--reveta-color-secondary-500` | 500 | `#E8820C` | **Ignite** | Counter-accent core |
| `--reveta-color-secondary-600` | 600 | `#C4640A` | Smoulder | Pressed secondary |
| `--reveta-color-secondary-800` | 800 | `#7A3A05` | Char | Dark secondary |
| `--reveta-color-secondary-950` | 950 | `#2E1302` | Coal | Darkest secondary |

**Pairing Rule:** Secondary creates visual tension with Primary (indigo vs amber) — not harmony. This tension produces depth. Never use both at equal weight in the same viewport zone.

---

### Accent Palette — "The Bioluminescent" (3 accents × 5 stops)

**Rule: No UI surface may use more than ONE accent simultaneously.**

**Accent-A: Pulse** (Urgency / Energy)
| Token | Hex | Name |
|-------|-----|------|
| `--reveta-accent-pulse-100` | `#FFE0F0` | Whisper |
| `--reveta-accent-pulse-300` | `#FF70B8` | Spark |
| `--reveta-accent-pulse-500` | `#FF1177` | **Pulse** |
| `--reveta-accent-pulse-700` | `#B8004D` | Surge |
| `--reveta-accent-pulse-900` | `#600026` | Core |

**Accent-B: Signal** (Intelligence / Precision)
| Token | Hex | Name |
|-------|-----|------|
| `--reveta-accent-signal-100` | `#E0F8FF` | Clarity |
| `--reveta-accent-signal-300` | `#70E8FF` | Ping |
| `--reveta-accent-signal-500` | `#00C8F0` | **Signal** |
| `--reveta-accent-signal-700` | `#008BAA` | Lock |
| `--reveta-accent-signal-900` | `#003D50` | Deep |

**Accent-C: Void Glow** (Depth / Mystery)
| Token | Hex | Name |
|-------|-----|------|
| `--reveta-accent-void-100` | `#F0E8FF` | Shimmer |
| `--reveta-accent-void-300` | `#C070FF` | Aurora |
| `--reveta-accent-void-500` | `#8822FF` | **Void Glow** |
| `--reveta-accent-void-700` | `#5800C0` | Rift |
| `--reveta-accent-void-900` | `#280060` | Oblivion |

---

### Semantic Palette — "The Grammar"

| Category | 500 (Core) | Notes |
|----------|------------|-------|
| Success | `#00C87A` | Bioluminescent green — distinct from all accents |
| Warning | `#FFB300` | Warm amber — near secondary but distinguishable |
| Error | `#FF3B30` | High-urgency red — physiological recognition |
| Info | `#0A84FF` | Bright blue — near signal but lighter and more neutral |

**Rule:** Semantic colours must communicate meaning in peripheral vision.
Never use semantic colours adjacent to accent colours of similar hue.

---

### Neutral Palette — "The Architecture" (12-stop scale)

**Pure grey is forbidden.** Every neutral carries a temperature bias:
cold-blue in darks, warm-amber in lights.

| Token | Hex | Temperature | Role |
|-------|-----|-------------|------|
| `--reveta-neutral-50` | `#FAFAF9` | Warm | Page background (light mode) |
| `--reveta-neutral-100` | `#F3F3F0` | Warm | Card background (light mode) |
| `--reveta-neutral-200` | `#E4E4DF` | Warm | Borders (light mode) |
| `--reveta-neutral-300` | `#C8C8C0` | Neutral | Disabled text |
| `--reveta-neutral-400` | `#A8A8A2` | Neutral | Placeholder text |
| `--reveta-neutral-500` | `#888884` | Neutral | Secondary text |
| `--reveta-neutral-600` | `#606060` | Cool | Body text |
| `--reveta-neutral-700` | `#404048` | Cool-blue | Strong text |
| `--reveta-neutral-800` | `#28283A` | Cool-blue | Page background (dark mode) |
| `--reveta-neutral-850` | `#1E1E2E` | Cool-blue | Card background (dark mode) |
| `--reveta-neutral-900` | `#14141F` | Cold-blue | Deep background (dark mode) |
| `--reveta-neutral-950` | `#0A0A14` | Cold-blue | Void surface (dark mode) |

---

### Surface Palette — "The Depth Planes" (6 elevation levels)

| Token | Name | Z-level | Backdrop Blur | Shadow |
|-------|------|---------|--------------|--------|
| `--reveta-surface-void` | Void | 0 | none | none |
| `--reveta-surface-ground` | Ground | 1 | none | `0 1px 2px rgba(0,0,0,0.4)` |
| `--reveta-surface-lift` | Lift | 2 | `blur(8px)` | `0 4px 16px rgba(0,0,0,0.3)` |
| `--reveta-surface-float` | Float | 3 | `blur(16px)` | `0 8px 32px rgba(0,0,0,0.25)` |
| `--reveta-surface-hover` | Hover | 4 | `blur(24px)` | `0 16px 48px rgba(0,0,0,0.2)` |
| `--reveta-surface-peak` | Peak | 5 | `blur(32px)` | `0 24px 64px rgba(0,0,0,0.15)` |

---

### Chromatic Mood Map — 4 Atmospheric States

| State | Dominant Surface | Active Accents | Motion Tier | Brightness |
|-------|-----------------|----------------|-------------|-----------|
| STATE-1: Ambient Rest | Void + Ground | None | Tier-1 only | Low |
| STATE-2: Focused Flow | Ground only | None | Paused | Reduced |
| STATE-3: Interaction Peak | Lift + Float | 1 accent active | Tier-2 | High |
| STATE-4: Revelation | Float + Peak | Accent flash | Tier-3 | Burst |

---

## SECTION 02 — TYPOGRAPHY FRAMEWORK

### Font Pairing — Option A (Recommended)

**Display:** `Space Grotesk` (Google Fonts, Open Font License)
- Geometric grotesque with slightly irregular letterforms that feel human
- Distinctive 'R', 'G', and 'S' shapes that read as designed, not defaulted
- Carries authority without rigidity — the "technical luxury" personality in one face

**Body:** `Inter` (Google Fonts, OFL)
- x-height ratio to Space Grotesk: 0.95 (near-match — reads as designed pairing)
- Optimised for screen legibility at all sizes
- Axis: Regular optical weight compensates for dark mode rendering

**Mono:** `JetBrains Mono` (Google Fonts, OFL)
- Designed — not defaulted. Distinctive ligatures for code clarity
- Weight matches body at regular, heavier at bold

---

### 9-Step Type Scale

| Token | Role | rem | px | Line-height | Letter-spacing | Weight |
|-------|------|-----|-----|------------|----------------|--------|
| `t-01` | Hero | 4.5rem | 72px | 1.0 | -0.04em | 700 |
| `t-02` | Display | 3rem | 48px | 1.05 | -0.03em | 700 |
| `t-03` | H1 | 2rem | 32px | 1.1 | -0.02em | 600 |
| `t-04` | H2 | 1.5rem | 24px | 1.2 | -0.01em | 600 |
| `t-05` | H3 | 1.25rem | 20px | 1.3 | 0em | 600 |
| `t-06` | Body Large | 1.125rem | 18px | 1.6 | 0.01em | 400 |
| `t-07` | Body | 1rem | 16px | 1.7 | 0.01em | 400 |
| `t-08` | Caption | 0.875rem | 14px | 1.5 | 0.02em | 400 |
| `t-09` | Label | 0.75rem | 12px | 1.4 | 0.08em | 500 |

**Fluid Type Formula (CSS clamp):**
```css
/* t-01 Hero */
font-size: clamp(2.5rem, 5vw + 1rem, 4.5rem);
/* t-07 Body */
font-size: clamp(0.9rem, 0.8rem + 0.4vw, 1rem);
```

**Dark Mode Weight Compensation:**
- Body text: Regular → Medium (+100 weight) in dark mode
- Caption: Regular → Regular (no change needed at small sizes)

---

## SECTION 03 — SPATIAL SYSTEM

### 8px Grid Tokens

| Token | px | rem | Named Role | Usage |
|-------|-----|-----|-----------|-------|
| `--reveta-space-1` | 4px | 0.25rem | Micro | Inline spacing within components only |
| `--reveta-space-2` | 8px | 0.5rem | Atom | Base unit — component internal spacing |
| `--reveta-space-3` | 16px | 1rem | Beat | Section internal spacing |
| `--reveta-space-4` | 24px | 1.5rem | Breath | Between related elements |
| `--reveta-space-5` | 32px | 2rem | Pause | Between content groups |
| `--reveta-space-6` | 48px | 3rem | Gap | Between sections |
| `--reveta-space-7` | 64px | 4rem | Rest | Major section breaks |
| `--reveta-space-8` | 96px | 6rem | Expanse | Hero section padding |
| `--reveta-space-9` | 128px | 8rem | Field | Full-bleed section margins |
| `--reveta-space-10` | 192px | 12rem | Void | Dramatic hero whitespace |

---

### Z-Axis Elevation System (8 layers)

| Layer | Name | z-index | Parallax Coefficient |
|-------|------|---------|---------------------|
| z-0 | Base | 0 | 0.2x (background) |
| z-1 | Ground | 10 | 0.4x |
| z-2 | Content | 20 | 0.7x |
| z-3 | Foreground | 30 | 1.1x |
| z-4 | Sticky | 100 | Fixed |
| z-5 | Overlay | 200 | Fixed |
| z-6 | Modal | 500 | Fixed |
| z-7 | Toast | 700 | Fixed |

---

## SECTION 04 — COMPONENT LIBRARY

### Component Specification Standard

Every component requires:
1. **Anatomy** — all sub-elements named with token references
2. **7+ Interaction States** — rest, hover, focus, active, loading, disabled, error, success
3. **Motion Lifecycle** — hover-enter, hover-exit, mount, unmount, 3D-transform
4. **Usage Rules** — when to use AND when NOT to use
5. **Anti-patterns** — explicitly prohibited misuse cases

---

### FOUNDATIONAL TIER (8 components)

**BTN-PRIMARY**
```
Anatomy:   bg-layer | label | icon-slot (optional) | loading-spinner
Variants:  sm (32px h) | md (40px h) | lg (48px h)
Rest:      bg: primary-500 | label: neutral-50 | radius: space-2
Hover:     bg: primary-400 | translateY(-2px) | shadow: surface-float
Active:    scale(0.97) | bg: primary-600 | 80ms reveta-sharp
Focus:     outline: 2px solid accent-signal-500 | offset: 2px
Disabled:  opacity: 0.4 | cursor: not-allowed | no hover effects
Loading:   label fades | spinner appears | no pointer events
Mount:     opacity 0→1 | translateY(8px)→0 | 300ms reveta-enter
3D-hover:  translateZ(+8px) | shadow deepens proportionally
```

**INPUT-TEXT**
```
Anatomy:   container | label | input-field | helper-text | error-text
Variants:  default | focused | error | disabled | with-icon
Rest:      border: neutral-700 | bg: surface-ground
Hover:     border: neutral-600
Focus:     border: accent-signal-500 | box-shadow: 0 0 0 3px signal-100
Error:     border: semantic-error | helper-text → error-text (red)
```

---

### NAVIGATION TIER (5 components)

**NAV-TOP** (Parallax-aware)
```
Behaviour: Transparent at scroll-top → surface-float + blur at scroll > 40px
Transition: backdrop-filter 0→blur(16px) | background opacity 0→0.8
            Duration: 200ms reveta-sharp
Z-index:    z-4 (sticky — see Z-axis system)
```

**CMD-PALETTE** (Gaming-grade power-user surface)
```
Trigger:    ⌘K / Ctrl+K
Mount:      scale(0.96)→1 | opacity 0→1 | 200ms reveta-enter
            backdrop: blur(32px) + primary-950 at 70% opacity
ARIA:       role="combobox" | aria-expanded | aria-activedescendant
```

---

### IMMERSIVE TIER (6+ components)

**PARALLAX-HERO** (5-layer depth scroll scene)
```
Plane 1 (bg):         scroll coefficient 0.2x | z-0
Plane 2 (scene):      scroll coefficient 0.4x | z-1
Plane 3 (subject):    scroll coefficient 0.7x | z-2
Plane 4 (foreground): scroll coefficient 1.1x | z-3
Plane 5 (overlay):    fixed | z-4

Scroll Narrative Beats:
  0%:   Only Plane 1 visible — dark, breathing
  25%:  Plane 2 fades in — story begins
  50%:  Plane 3 arrives — subject revealed
  75%:  Plane 4 enters — depth dramatic
  100%: All planes — story complete

Implementation: transform: translateY() ONLY (not top/margin — no layout reflow)
Fallback:       IntersectionObserver for Safari CSS Scroll Timeline
```

**CARD-3D-HOVER**
```
Parent perspective: var(--reveta-3d-perspective-card) [800px]
Hover transform:    rotateX(±8deg) | rotateY(±8deg) | translateZ(+16px)
Shadow:             deepens proportionally with translateZ lift
Easing:             reveta-reveal (cubic-bezier(0.23, 1, 0.32, 1))
Duration:           250ms hover-enter | 150ms hover-exit
Safari:             Test perspective-origin — known iOS interpretation diff
```

**ZOOM-PORTAL** (Click-to-zoom viewport expansion)
```
Trigger:    click on designated element
From:       current bounding box
To:         100vw × 100vh
Animation:  scale + position morph | 480ms reveta-dramatic
Backdrop:   black fade-in | 300ms
Exit:       reverse animation on close trigger
```

**MAGNETIC-BTN** (Cursor-warp on hover)
```
Radius:     80px detection zone
Effect:     element warps toward cursor within radius
Max warp:   ±24px
Ease:       real-time, lerp(current, target, 0.15) per frame
Fallback:   standard hover state when JavaScript unavailable
ARIA:       no functional dependence on magnetic effect
```

**SCROLL-STORY-SECTION**
```
Reveal trigger: 15% of section in viewport (IntersectionObserver)
From:           scale(0.94) + opacity(0) + translateY(16px)
To:             scale(1) + opacity(1) + translateY(0)
Duration:       480ms reveta-reveal
Stagger:        60ms between child elements
```

**AMBIENT-CANVAS**
```
Type:       WebGL particle system OR CSS gradient animation (per performance budget)
Behaviour:  Procedural drift at rest | responds to cursor position
GPU:        will-change: transform | transform + opacity only
Tier:       Tier-1 ambient — pauses under prefers-reduced-motion
Performance: IntersectionObserver pause when off-viewport
```

---

## SECTION 05 — MOTION PRINCIPLES

### Motion Taxonomy

**TIER-1 — AMBIENT** (background, looping, non-interactive)
- Duration: 3000ms–8000ms loops
- Easing: always sinusoidal (ease-in-out)
- Opacity impact: ≤30% — felt but not seen
- Implementation: CSS @keyframes with animation-iteration: infinite
- A11y: pauses completely under prefers-reduced-motion

**TIER-2 — RESPONSIVE** (cursor-triggered, pre-click)
- Duration: 150ms–400ms
- hover-enter: 200ms | hover-exit: 150ms
- 3D hover: perspective on PARENT not child
- All transitions specify exact property — never `transition: all`

**TIER-3 — TRANSITIONAL** (state changes, modal open/close)
- Duration: 250ms–600ms
- Every transition has a narrative meaning

**TIER-4 — NARRATIVE** (scroll-driven parallax storytelling)
- Real-time, scroll-position-tied
- Implementation: CSS Scroll Timeline + JS fallback for Safari
- Planes move at defined coefficients (see Parallax-Hero spec)

---

### Easing Library

| Name | cubic-bezier | Use Case |
|------|-------------|---------|
| `reveta-enter` | `cubic-bezier(0.16, 1, 0.3, 1)` | Elements arriving |
| `reveta-exit` | `cubic-bezier(0.7, 0, 0.84, 0)` | Elements departing |
| `reveta-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy confirms, delights |
| `reveta-float` | `cubic-bezier(0.45, 0, 0.55, 1)` | Ambient, breathing motions |
| `reveta-sharp` | `cubic-bezier(0.4, 0, 0.6, 1)` | Technical, precise transitions |
| `reveta-reveal` | `cubic-bezier(0.23, 1, 0.32, 1)` | 3D hover lift |
| `reveta-dramatic` | `cubic-bezier(0.76, 0, 0.24, 1)` | Hero moments, page transitions |

---

### Duration Token Set

| Token | Value | Use Case |
|-------|-------|---------|
| `--reveta-duration-instant` | 0ms | Synchronous state changes |
| `--reveta-duration-flicker` | 80ms | Fastest perceivable motion |
| `--reveta-duration-snap` | 120ms | Button press, checkbox |
| `--reveta-duration-quick` | 200ms | Hover enter, tooltip |
| `--reveta-duration-standard` | 300ms | Most UI state transitions |
| `--reveta-duration-deliberate` | 480ms | Zoom reveals, modal entrance |
| `--reveta-duration-cinematic` | 600ms | Page transitions |
| `--reveta-duration-story` | 800ms+ | Narrative parallax sequences |

---

## SECTION 06 — ACCESSIBILITY STANDARDS

### WCAG AA Requirements
- Normal text: minimum **4.5:1** contrast ratio
- Large text (18px+ / 14px+ bold): minimum **3:1**
- UI components / graphical objects: minimum **3:1**
- Every pairing must show the exact number — not just "passes AA"

### Motion Accessibility
```css
@media (prefers-reduced-motion: reduce) {
  /* Tier-1 and Tier-4: pause completely */
  .ambient-animation,
  .parallax-element {
    animation: none;
    transition: none;
    transform: none !important;
  }
  /* Tier-2 and Tier-3: instant transitions */
  .interactive-component {
    transition: opacity 0ms;
  }
}
```

### Focus Ring Specification
```css
:focus-visible {
  outline: 2px solid var(--reveta-accent-signal-500);
  outline-offset: 3px;
  border-radius: calc(var(--reveta-radius-component) + 2px);
  box-shadow: 0 0 0 4px var(--reveta-accent-signal-100);
}
```

### Comfort Mode Toggle
A first-class UI surface — not an afterthought:
- Accessible via: Settings → Display → Motion
- Shortcut: keyboard accessible, screen-reader announced
- State persists to localStorage
- Disables: all Tier-1 ambient, all Tier-4 parallax, all 3D hover effects
- Preserves: all functional Tier-2 and Tier-3 (with instant transitions)

### ARIA Specifications
| Component | ARIA Role | Key Attributes |
|-----------|-----------|----------------|
| Command Palette | `combobox` | `aria-expanded`, `aria-activedescendant` |
| Audio Player | `region` | `aria-label="Audio Overview Player"` |
| Parallax Sections | (decorative) | `aria-hidden="true"` if non-informational |
| Toast Notifications | `alert` | `aria-live="assertive"` |
| Skeleton Loaders | (container) | `aria-busy="true"` |
| Modal | `dialog` | `aria-modal="true"`, `aria-labelledby` |

---

## SECTION 07 — EXPORT DELIVERABLES

Three formats. All must be consistent. If they diverge — it is a bug.

**Format 1: Design Tokens (JSON)**
→ See `tokens/design-tokens.json` in this workspace

**Format 2: CSS Custom Properties**
→ See `tokens/css-variables.css` in this workspace

**Format 3: Figma Documentation**
→ Naming convention: `group/subgroup/name` (Figma dot-notation)
→ Dark mode as Variable Mode on same collection (not separate set)
→ Motion tokens as number type (not string) for prototype references
→ All animating layers named with component token IDs (e.g., `BTN-PRIMARY / bg-layer`)
→ Smart Animate: identical layer names across all variants — non-negotiable

---

## SECTION 08 — PRD INTEGRATION (DS-XX Requirements)

| ID | Requirement | Priority | Acceptance Criterion |
|----|------------|----------|---------------------|
| DS-01 | All interactive components implement Tier-2 hover animation | P1 | Hover renders within 200ms ±16ms |
| DS-02 | All text/background pairings achieve 4.5:1 minimum contrast | P0 | Automated audit: 0 failures |
| DS-03 | Parallax implements all 5 depth planes at specified coefficients | P1 | All planes at correct scroll depth |
| DS-04 | Token pipeline 100% consistent across JSON, CSS, Figma | P0 | Three-format audit: 0 mismatches |
| DS-05 | prefers-reduced-motion disables all Tier-1 and Tier-4 animations | P0 | All ambient/parallax paused |
| DS-06 | All components have ARIA roles and labels specified | P1 | Zero unlabelled interactive elements |
| DS-07 | Dark mode is default — light mode is accessibility variant | P0 | data-theme="dark" is default |
| DS-08 | Comfort Mode toggle is first-class accessible surface | P1 | Keyboard navigable, SR announced |

---

*Reveta Notebook Design System v1.0 · Document B · Authority Tier 2 — Experience Truth*
*Reference: tokens/design-tokens.json + tokens/css-variables.css for implementation values*
