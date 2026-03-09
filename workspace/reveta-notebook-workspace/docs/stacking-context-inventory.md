# Reveta Notebook — CSS Stacking Context Inventory
## Source: docs/02_Design_System.md §03 Z-Axis Elevation System

| Layer     | z-index | Tailwind Class   | Parallax Coeff | Components |
|-----------|---------|------------------|---------------|------------|
| base      | 0       | z-base           | 0.2x          | Background planes |
| ground    | 10      | z-ground         | 0.4x          | Page surface |
| content   | 20      | z-content        | 0.7x          | Main content |
| foreground| 30      | z-foreground     | 1.1x          | Foreground elements |
| sticky    | 100     | z-sticky         | fixed         | NAV-TOP |
| overlay   | 200     | z-overlay        | fixed         | Dropdowns, popovers |
| modal     | 500     | z-modal          | fixed         | MODAL, CMD-PALETTE |
| toast     | 700     | z-toast          | fixed         | TOAST notifications |

## Rule: New stacking contexts require [STACKING-CONTEXT] CHANGELOG entry.
## Any z-index value not in this table is a Bug Class 05 instance.
