# Reveta Notebook — Stacking Context Inventory

All z-index values follow the Design System elevation system. No ad-hoc z-index values outside this scale.

| z-index | Token | Component |
|---------|-------|-----------|
| 0 | `--reveta-z-base` | Base plane, page background |
| 10 | `--reveta-z-ground` | Source panel, sidebar |
| 20 | `--reveta-z-content` | Main content area |
| 30 | `--reveta-z-foreground` | Foreground parallax elements |
| 100 | `--reveta-z-sticky` | TopNav, sticky headers |
| 200 | `--reveta-z-overlay` | Dropdowns, tooltips |
| 500 | `--reveta-z-modal` | Modals, dialogs, SharingModal, StyleSettings |
| 700 | `--reveta-z-toast` | Toast notifications |

**Rule:** No component should use a hardcoded z-index. All z-values must reference a CSS variable from the elevation system.

**Known stacking contexts:**
- `TopNav`: `position: fixed` + `z-sticky` creates a stacking context
- Modal backdrop: `position: fixed` + `z-modal` creates a stacking context
- `surface-hover/float/lift` with `backdrop-filter` create stacking contexts on their parent
- ParallaxScene: `perspective` creates a stacking context on the container
