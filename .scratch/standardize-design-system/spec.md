# Spec: Standardize Neo-Brutalist Design System

Status: ready-for-agent

## Problem Statement

The TreeMaker user interface currently suffers from fragmented styling implementations, scattered arbitrary CSS strings, and inconsistent component ergonomics across its features. Hardcoded shadow definitions (`shadow-[2px_2px_0px_0px_var(--color-foreground)]`, `shadow-[4px_4px_...]`, `shadow-[6px_6px_...]`) are duplicated across dozens of components. The root styling configuration (`globals.css`) contains duplicated variables (`--male`, `--female`), unorganized alpha opacity hacks, and lacks a coherent 3-tier token hierarchy. Furthermore, primitive components in `src/components/ui/` have disparate interaction states, while the Canvas Studio (toolbar, person cards, sidebar) and public pages (Dashboard, Share view) lack unified Neo-Brutalist tactile feedback (elevation hops, press depths, and focus states).

## Solution

Completely standardize and overhaul the UI/UX Design System while strictly preserving TreeMaker's signature Neo-Brutalist / Editorial Archive visual identity (2px solid borders, sharp rectangular corners with `rounded-none`, hard offset drop shadows, serif titles, bold uppercase tracking-wide metadata, and 3D flip card interactions).

The solution establishes:

1. A structured 3-tier Design Token architecture in `globals.css` (Primitives, Semantics, Components) with OKLCH color spaces, explicit deceased status tokens (`--deceased-bg`, `--deceased-border`, `--deceased-fg`), and official Hard Elevation Tokens (`shadow-brutal-sm`, `shadow-brutal-md`, `shadow-brutal-lg`, and primary variants).
2. Fully standardized UI atoms in `src/components/ui/` (`button`, `input`, `dialog`, `sheet`, `card`, `select`, `dropdown-menu`, `popover`, `date-picker`, etc.) with consistent 2px borders, zero radius, bold uppercase typography, and standardized hover/active elevation mechanics.
3. Ergonomic Canvas Studio HUD upgrade: Refined Floating Toolbar with synchronized brutalist button bounce, streamlined PersonNode front/back layouts with elegant handles, and organized Sidebar sections.
4. Editorial Dashboard & Public Share experience: High-contrast publication-style grid, prominent raised-shadow action triggers, and polished public family viewing ergonomics.

## User Stories

1. As a family genealogist, I want all buttons, cards, and inputs across the application to share a cohesive Neo-Brutalist aesthetic with crisp 2px borders and sharp corners, so that the platform feels distinctly intentional, dignified, and editorial.
2. As a user navigating in either bright daylight or dim lighting, I want full, consistent Dark Mode and Light Mode support across all pages without contrast washouts or illegible labels, so that viewing and editing family records is comfortable in any environment.
3. As a developer maintaining the codebase, I want hard elevation tokens (`shadow-brutal-sm`, `shadow-brutal-md`, `shadow-brutal-lg`) standardized in Tailwind configuration, so that I never have to write arbitrary `shadow-[..._0px_0px]` strings again.
4. As a user viewing a FamilyTree on the canvas, I want the PersonNode cards to provide tactile visual feedback when hovered or selected, with a distinct primary accent shadow and clean 3D flip interaction to view quick actions.
5. As a family historian, I want deceased members on the canvas to be visually distinguished with a solemn, respectful muted tone and clear memorial indicator, so that departed ancestors are recognized with dignity without disrupting tree readability.
6. As a tree editor on the canvas, I want connection handles on person nodes to remain unobtrusive and neatly styled until needed, so that the canvas view remains clean and uncluttered.
7. As a tree editor, I want the floating canvas toolbar to be ergonomically arranged with standardized buttons for zoom, fit-view, person creation, and view toggling, so that I can effortlessly manipulate large family graphs.
8. As a user viewing person details in the sidebar or edit form, I want the form inputs, date pickers, dropdowns, and file upload dropzones to adhere to the same crisp 2px border and uppercase label hierarchy, so that data entry feels robust and satisfying.
9. As a tree owner on the dashboard, I want my family tree cards laid out in a newspaper/editorial grid with bold serif typography, member statistics, and a prominent "Create New Tree" card with brutalist raised shadows, so that managing multiple genealogies is visually engaging.
10. As a relative visiting a shared public tree via share token, I want a simplified, elegant read-only interface that hides administrative clutter while providing rapid search and navigation, so that I can explore our family history seamlessly on desktop or mobile.
11. As a developer creating new features, I want the core UI primitives in `src/components/ui/` to enforce the design system variants out of the box, so that new screens automatically match the project's visual standards without custom CSS tweaks.
12. As a user generating a LegacyBook PDF, I want the document export template to mirror the editorial typography and styling standards of the platform, so that the printed keepsake is publication-ready.

## Implementation Decisions

- **Domain Model & Architectural Record Compliance**: Adhere strictly to canonical terms in `GLOSSARY.md` (`FamilyTree`, `Person`, `Relationship`, `LegacyBook`) and architecture decisions in ADR-0001 (Feature-Based architecture under `src/`) and ADR-0002 (Standardized Neo-Brutalist & Editorial Archive Design System).
- **3-Tier Design Token Hierarchy**:
  - Primitive Tokens: Base OKLCH hues, absolute radius zero (`0rem`), typographic scale, hard shadow offsets (2px, 4px, 6px).
  - Semantic Tokens: Color roles for canvas, surfaces, text contrast, borders, gender accents (`--male`, `--female`), and deceased states (`--deceased-bg`, `--deceased-border`, `--deceased-fg`).
  - Hard Elevation Tokens: Registered in Tailwind theme inline as utilities `shadow-brutal-sm`, `shadow-brutal-md`, `shadow-brutal-lg`, and primary variants (`shadow-brutal-primary-sm`, `shadow-brutal-primary-md`, `shadow-brutal-primary-lg`).
- **Zero-Radius & 2px Border Policy**: All primitive components in `src/components/ui/` explicitly use `rounded-none`, `border-2`, and `border-foreground` or semantic equivalents.
- **Component Tactile Interaction Standards**: Standardize the brutalist raised effect:
  - Default: `shadow-brutal-md` (or `shadow-brutal-sm` for small controls).
  - Hover: subtle translate shift `hover:translate-x-[1px] hover:translate-y-[1px]`.
  - Active: full press `active:translate-x-[2px] active:translate-y-[2px] active:shadow-none`.
- **Canvas HUD Ergonomics**:
  - Floating Toolbar: Fixed ergonomic layout, unified button sizes, and brutalist tooltip styling.
  - PersonNode Card: Optimized front face hierarchy (flag, avatar with 2px border, serif name, birth-death dates, nickname) and back face quick actions, with smooth 3D spring transition.
  - Connection Handles: Refined 8px square handles matching 2px border styling.
- **Zero Database / Schema Changes**: No backend migrations, no Supabase schema alterations, and no API changes. The contract between frontend and backend remains 100% intact.

## Testing Decisions

- **Testing Philosophy**: Test external behavior, design system consistency, and production build integrity. Since this is a comprehensive UI/UX Design System overhaul without backend changes, verification must confirm that all components compile, styles resolve cleanly, and zero visual or runtime regressions are introduced.
- **Primary Seam (Production Build & Type Check)**: `npm run build` (`next build` + `tsc --noEmit`). Verifies that all token references, component props, and page routes assemble cleanly with zero compilation errors.
- **Code Standards Seam**: `npm run lint` (`eslint .`). Ensures clean code, no broken imports, and strict lint compliance across all modified components.
- **Design System Consistency Gate**:
  - Verify that arbitrary hardcoded shadow classes (`shadow-[..._0px_0px]`) are eliminated from primitives and features in favor of `shadow-brutal-*`.
  - Verify that all shared UI primitives have `rounded-none` and `border-2` consistently applied.

## Out of Scope

- Modifying the PostgreSQL schema, Supabase migrations, or RLS policies.
- Modifying canvas graph layout algorithms (Dagre layout computations).
- Altering AI assistant API streaming contracts or backend chat routes.
- Adding new domain entities (e.g. multi-spouse unions, branches, generations).

## Further Notes

- Following approval of this specification, work will be broken down into vertical tracer-bullet tickets via `/to-tickets`.
- Verification via `npm run build` and `npm run lint` must be executed at the completion of each migration stage.
