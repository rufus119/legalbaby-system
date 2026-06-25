# LEGALBABY Design Notes

## Objective
Rebuilt the frontend UX as a premium SaaS surface while preserving existing backend APIs, scheduling, reports, snapshots, and business logic.

## Brand Direction
- Reframed the product as LEGALBABY / Playlist Intelligence.
- Replaced green palette with electric orange centered visual identity.
- Implemented logo-inspired geometry in both UI brand mark and favicon icon.

## Visual System
- Primary color: #FF6A00
- Secondary glow: #FF8E3C
- Background stack: #05070B, #09111F, #0D1525
- Borders: rgba(255,255,255,0.05)
- Text: #F7F8FA and #95A1B5
- Accent statuses: success #19F08B, danger #FF5A77

## Typography
- Headings: Space Grotesk via next/font for performance.
- Body: Inter via next/font for readability and consistency.

## Interaction and Motion
- Added sticky glass floating navbar.
- Introduced page and section entrance transitions with Framer Motion.
- Added animated hero chart and ambient particle field.
- Added numeric count-up animation for key stats.
- Added hover lift and glow states on all major cards and action surfaces.
- Added modal detail expansion interaction for daily and weekly report deep dives.

## Information Architecture
- New modular component structure:
  - components/layout
  - components/dashboard
  - components/cards
  - components/charts
  - components/animations
  - components/providers
- Daily report cards now focus on Added/Removed/Moved with trend cues.
- Weekly section now uses timeline layout with Top Entries/Momentum/Drops/Movers.

## Performance and Responsiveness
- Lazy-loaded daily and weekly sections with dynamic imports.
- Skeleton loading shell for perceived performance.
- Reduced motion support for accessibility.
- Responsive behavior tuned for desktop/tablet/mobile with app-like card stacking on small screens.

## Business Logic Integrity
- Kept existing API contract and data loading paths:
  - /api/dates
  - /api/daily
  - /api/weekly
  - /api/status
- No backend or scheduler code was modified.

## Branding/Favicon Update
- Added new brand icon file at app/icon.svg.
- Wired metadata icons in app/layout.tsx to ensure consistent tab/app branding.
