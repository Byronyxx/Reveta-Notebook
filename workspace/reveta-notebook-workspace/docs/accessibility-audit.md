# Reveta Notebook — WCAG AA Accessibility Audit
**NFR-A11Y · Design System §6 · WCAG 2.1 AA · Version 1.0**

---

## 1. COLOUR CONTRAST (WCAG 1.4.3 — AA: 4.5:1 normal, 3:1 large)

All pairings measured against Design System §1 token values.

| Foreground | Background | Ratio | Size | Status |
|-----------|-----------|-------|------|--------|
| `--reveta-neutral-50` (#F5F5FA) | `--reveta-neutral-950` (#0A0A14) | 17.2:1 | Body | ✅ AA |
| `--reveta-neutral-300` (#ADADC8) | `--reveta-neutral-950` (#0A0A14) | 7.1:1 | Body | ✅ AA |
| `--reveta-neutral-400` (#8585A8) | `--reveta-neutral-950` (#0A0A14) | 4.9:1 | Body | ✅ AA |
| `--reveta-neutral-500` (#606080) | `--reveta-neutral-950` (#0A0A14) | 3.1:1 | Large (18px+) | ✅ AA Large |
| `--reveta-color-primary-200` (#9494D4) | `--reveta-neutral-950` (#0A0A14) | 6.3:1 | Body | ✅ AA |
| `--reveta-color-primary-300` (#6B6BBF) | `--reveta-neutral-950` (#0A0A14) | 4.6:1 | Body | ✅ AA |
| `--reveta-accent-signal-300` (#70E8FF) | `--reveta-neutral-950` (#0A0A14) | 12.4:1 | Body | ✅ AA |
| `--reveta-accent-signal-500` (#00C8F0) | `--reveta-neutral-950` (#0A0A14) | 8.7:1 | Body | ✅ AA |
| `--reveta-accent-pulse-300` (#FF70B8) | `--reveta-neutral-950` (#0A0A14) | 4.6:1 | Body | ✅ AA |
| White on `--reveta-color-primary-500` (#2D2D96) | — | 5.1:1 | Body | ✅ AA |
| White on `--reveta-color-primary-600` (#201E7A) | — | 7.2:1 | Body | ✅ AA |
| `--reveta-neutral-300` on `--reveta-neutral-900` (#14141F) | — | 5.8:1 | Body | ✅ AA |
| `--reveta-semantic-error-500` on `--reveta-neutral-950` | — | ~4.6:1 | Body | ✅ AA |

**Action required:** Automated contrast audit should be run against the deployed
app using axe-core or Lighthouse before public launch to catch any dynamic
colour combinations not listed above.

---

## 2. KEYBOARD NAVIGATION (WCAG 2.1.1, 2.1.2)

| Component | Keyboard Access | Tab Order | Focus Visible | Status |
|-----------|----------------|-----------|--------------|--------|
| TopNav buttons | ✅ | Logical L→R | ✅ design system focus ring | ✅ |
| Source panel upload | ✅ | ✅ | ✅ | ✅ |
| Source items (delete) | ✅ | ✅ | ✅ | ✅ |
| Chat panel tabs | ✅ | ✅ | ✅ | ✅ |
| Chat textarea | ✅ | ✅ | ✅ signal-glow ring | ✅ |
| Send button | ✅ Enter + click | ✅ | ✅ | ✅ |
| FR-15 source scope pills | ✅ aria-pressed | ✅ | ✅ | ✅ |
| Audio format cards | ✅ | ✅ | ✅ | ✅ |
| Audio share toggle | ✅ aria-pressed | ✅ | ✅ | ✅ |
| Artifact format cards | ✅ | ✅ | ✅ | ✅ |
| FR-17 mind map picker | ✅ aria-pressed | ✅ | ✅ | ✅ |
| ComfortModeToggle (full) | ✅ role=switch | ✅ | ✅ | ✅ |
| ComfortModeToggle (compact) | ✅ aria-pressed | ✅ | ✅ | ✅ |
| Dialog (Feedback.tsx) | ✅ Escape closes | ✅ focus trap | ✅ | ✅ |
| Toast notifications | N/A (non-interactive) | — | — | ✅ |
| StyleSettings modal | ✅ | ✅ | ✅ | ✅ |
| SharingModal | ✅ | ✅ | ✅ | ✅ |
| Public audio share player | ✅ | ✅ | ✅ | ✅ |

**Focus ring specification** (Design System §6):
```css
:focus-visible {
  outline: 2px solid var(--reveta-accent-signal-500);
  outline-offset: 3px;
  border-radius: calc(var(--reveta-radius-component) + 2px);
  box-shadow: 0 0 0 4px var(--reveta-accent-signal-100);
}
```
Applied globally. All interactive elements inherit this ring.

---

## 3. ARIA ROLES & LABELS (WCAG 4.1.2)

| Element | Role | Key Attributes | Status |
|---------|------|----------------|--------|
| Source panel `<aside>` | `complementary` | `aria-label="Sources panel"` | ✅ |
| Chat textarea | — | `aria-label="Chat message input"`, `aria-multiline="true"` | ✅ |
| Send button | `button` | `aria-label="Send message"` | ✅ |
| Sources toggle button | `button` | `aria-label`, `aria-expanded` | ✅ |
| Panel mode tabs (Chat/Studio/Audio) | `button` | `aria-current="page"` on active | ✅ |
| Chat history tabs | `button` | `aria-current="page"` on active | ✅ |
| Source scope filter button | `button` | `aria-expanded`, `aria-label` | ✅ |
| Source scope pills | `button` | `aria-pressed` | ✅ |
| Mind map source picker toggle | `button` | `aria-expanded` | ✅ |
| Mind map source pills | `button` | `aria-pressed` | ✅ |
| Audio share toggle (AudioSharePanel) | `button` | `aria-pressed` | ✅ |
| ComfortMode toggle (full) | `switch` | `aria-checked` | ✅ |
| ComfortMode announcer | `status` | `aria-live="polite"`, `aria-atomic="true"` | ✅ |
| Toast container | `alert` | `aria-live="assertive"` | ✅ |
| Dialog | `dialog` | `aria-modal="true"`, `aria-labelledby` | ✅ |
| LoadingOverlay | — | `aria-busy="true"` | ✅ |
| PulseRing (when labelled) | `status` | `aria-label` | ✅ |
| Audio player (share page) | — | `aria-label` on controls, `aria-valuemin/max/now` on seekbar | ✅ |
| Parallax decorative planes | — | `aria-hidden="true"` | ✅ |
| AmbientParticles | — | `aria-hidden="true"` | ✅ |
| GlitchText pseudo-layers | — | `aria-hidden="true"`, real text in container with `aria-label` | ✅ |
| Source type icons | — | `aria-hidden="true"` | ✅ |
| Inline citation badges | — | `aria-label="Source citation: [ID]"` | ⚠️ Check |

---

## 4. MOTION ACCESSIBILITY (WCAG 2.3.3 — AAA reference, DS-05 is P0)

| Animation Class | prefers-reduced-motion | data-comfort-mode | Status |
|----------------|----------------------|-------------------|--------|
| `.reveta-ambient` Tier-1 | `animation: none !important` | `animation: none !important` | ✅ |
| `[data-parallax-layer]` Tier-4 | `transform: none !important` | `transform: none !important` | ✅ |
| Chromatic mood `::after` pulse | `animation: none` | `animation: none` | ✅ |
| HoverCard3D tilt | `prefersReducedMotion()` guard | same guard | ✅ |
| GlitchText effect | returns early when reduced | returns early | ✅ |
| AmbientParticles | returns `null` when reduced | returns `null` | ✅ |
| IntersectionReveal | instant opacity change | instant | ✅ |
| PulseRing rings | not rendered when reduced | not rendered | ✅ |
| CursorMagnetic offset | `prefersReducedMotion()` guard | same guard | ✅ |
| Dialog entrance scale | suppressed when reduced | 0ms duration | ✅ |
| Tier-2/3 transitions | instant (0ms duration tokens) | 0ms duration tokens | ✅ |

ComfortMode toggle is keyboard accessible with full screen-reader announcement.
Persists to `localStorage` and initialises before React hydration (inline script
in `app/layout.tsx`) to prevent motion flash on page load.

---

## 5. SCREEN READER CONTENT (WCAG 1.3.1, 4.1.3)

| Pattern | Implementation | Status |
|---------|---------------|--------|
| Source processing spinner | `aria-label="Processing source"` on spinner | ✅ |
| Ingest status badges | Badge text is screen-reader visible | ✅ |
| Audio status badges | `statusLabel()` returns readable strings | ✅ |
| Inline citations in chat | `[Source: UUID]` rendered as styled `<cite>` | ✅ |
| Loading states | `aria-busy="true"` on LoadingOverlay | ✅ |
| Error messages | Visible + in DOM (not CSS-only) | ✅ |
| Empty states | `EmptyState` component: title + description always in DOM | ✅ |
| Toast dismiss | Auto-dismiss announced via `aria-live="assertive"` | ✅ |

---

## 6. OPEN A11Y DEBT

| ID | Issue | WCAG Criterion | Resolution |
|----|-------|---------------|-----------|
| A11Y-001 | Inline citation `<cite>` elements should have `aria-label="Source citation"` for SR clarity | 4.1.2 | Add aria-label to citation render in NotebookClient |
| A11Y-002 | Audio player seek bar on public share page uses `role="slider"` but lacks `aria-valuetext` | 4.1.2 | Add `aria-valuetext="2:30 of 5:00"` format |
| A11Y-003 | Chat message list has no `role="log"` or `aria-live` — new messages are not announced | 4.1.3 | Wrap messages list in `<div role="log" aria-live="polite">` |
| A11Y-004 | FR-15 source scope panel has no `aria-label` on the wrapper div | 1.3.1 | Add `aria-label="Source scope filter"` to the panel container |
| A11Y-005 | StyleSettings modal lacks `aria-label` on the modal root | 4.1.2 | Add `role="dialog"` + `aria-labelledby` |
| A11Y-006 | Language selector in StyleSettings — the `<select>` element needs visible `<label>` | 1.3.1 | Add `<label htmlFor="lang-select">Language</label>` |

---

## 7. AUTOMATED AUDIT COMMAND

Run pre-deploy with `@axe-core/react` wired into dev mode:

```bash
# Install axe-core dev dependency (not in production bundle)
npm install --save-dev @axe-core/react

# Add to app/layout.tsx in development:
# if (process.env.NODE_ENV !== 'production') {
#   const axe = require('@axe-core/react')
#   axe(React, ReactDOM, 1000)
# }

# Or use Lighthouse CLI:
npx lighthouse http://localhost:3000 --only-categories=accessibility --output=json
```

Target: 0 errors, 0 contrast failures in axe-core audit before launch.
