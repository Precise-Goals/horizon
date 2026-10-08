---
name: veltrix-ui-design
description: >-
  Use this skill when creating or modifying UI components, pages, layouts, or the
  design system for Veltrix. Covers the neo-brutalistic theme, component library
  integration, and accessibility requirements.
---

# Veltrix UI Design System Skill

## Design Tokens

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--cream` | #FFF8F0 | Primary background, cards, surfaces |
| `--black` | #1A1A1A | Primary text, heavy borders, shadows |
| `--cobalt` | #0047AB | Primary actions, links, brand accents |
| `--cobalt-light` | #3366CC | Hover states, secondary accents |
| `--cobalt-dark` | #003380 | Active states, pressed states |
| `--success` | #22C55E | Recovery success, healthy status |
| `--danger` | #EF4444 | Failures, critical alerts, destructive actions |
| `--warning` | #F59E0B | Approval needed, pending status, warnings |
| `--muted` | #6B7280 | Secondary text, disabled states |

### Typography
- **Headings**: Inter or similar grotesque sans-serif, bold/black weights.
- **Body**: Inter, regular/medium weights.
- **Monospace**: JetBrains Mono for code blocks, terminal outputs, and system logs.
- All text must rigorously meet WCAG 2.1 AA contrast ratios against its background.

### Neo-Brutalistic Style Rules
- **Borders**: Thick, stark borders (2-4px) on interactive elements like cards and buttons.
- **Shadows**: Solid, offset block shadows (e.g., `4px 4px 0px var(--black)`) instead of soft blurs.
- **Radii**: Use rounded corners sparingly (max 8px on large cards, 4px on small buttons).
- **Contrast**: Bold, chunky UI elements with high contrast and clear delineation.

## Component Libraries Integration Order
To maintain consistency and avoid CSS conflicts, use libraries in this priority order:
1. **Shadcn UI** — Foundation. Base accessible components (buttons, inputs, cards, dialogs, tables).
2. **DaisyUI** — Semantic utility classes, theme variable injection.
3. **Aceternity UI** — Complex sections (hero sections, glowing borders, animated feature cards).
4. **Magic UI** — Micro-interactions, particle effects, kinetic typography for premium feels.

## Layout Patterns
- **Bento Grid** — Dashboard layout utilizing variable-size masonry/grid cards.
- **Sidebar + Main** — Standard navigation pattern for the core app interface.
- **Split View** — Used heavily for the dependency graph (visual) alongside a details/action panel.

## Component Requirements
- Every component MUST accept a standard `className` prop.
- Every component MUST have a descriptive CSS class for conventional overrides (e.g., `veltrix-btn-primary`).
- Use `cn()` from shadcn utils for class merging to prevent Tailwind conflicts.
- All interactive elements must be fully keyboard navigable.
- All images, charts, and icons must have appropriate ARIA labels or alt text.
- Rely on semantic HTML5 elements (`<article>`, `<section>`, `<nav>`, `<aside>`).

## File Structure
```
apps/web/src/
├── components/
│   ├── ui/          # Shadcn base components (auto-generated)
│   ├── layout/      # Layout components (Sidebar, Header, BentoGrid)
│   ├── dashboard/   # Dashboard-specific widgets and views
│   ├── recovery/    # Recovery engine UI, DAG visualizers, logs
│   ├── blockchain/  # NFT/Web3 wallet connectors, minting UI
│   └── shared/      # Shared business-logic components
├── pages/         # Route definitions and page wrappers
├── hooks/         # Custom React hooks (e.g., useRecoveryGraph)
├── lib/           # Utility functions (e.g., cn, formatters)
├── styles/        # Global CSS, Tailwind directives
└── types/         # TypeScript interfaces and type definitions
```
