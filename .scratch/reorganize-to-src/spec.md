# Spec: Reorganize Codebase into Feature-Based Architecture in src

Status: ready-for-agent

## Problem Statement

As the TreeMaker codebase has grown, its file structure has remained split across technical layers at the repository root (`components/`, `lib/`, `hooks/`, `types/`, `app/`). Domain logic for core concepts like FamilyTree, Person, Authentication, and AI Assistant is fragmented across multiple unrelated folders (for example, a single change to Person requires touching `components/tree/forms`, `components/tree/modals`, `lib/services`, `lib/store/slices`, `lib/validations`, and `lib/utils`).

This technical layering creates shallow modules where files lack locality, public boundaries are unenforced, and developers and AI agents must navigate scattered directories for a single cohesive change. Additionally, abandoned empty directories create noise, and root configuration files are intermingled with source code.

## Solution

Reorganize the entire application source code into a clean, feature-driven architecture housed under a dedicated `src/` directory.

The architecture establishes:

1. Four encapsulated feature modules (`tree`, `person`, `auth`, `ai`), each acting as a Deep Module with a single public entry point (`index.ts`) hiding internal components, hooks, services, and validations.
2. A Thin Routing Layer in `src/app/` where page and route files only handle URL parameters and mount top-level containers exported by features.
3. A clearly isolated Shared Layer (`src/components/ui`, `src/lib`, `src/types`, `src/hooks`) for primitives and infrastructure (such as the database client and global state engine), strictly governed by a unidirectional dependency rule: shared code never imports from features.
4. Total elimination of unused placeholder directories.

All changes must preserve existing functionality with zero behavioral regressions.

## User Stories

1. As a maintainer, I want all application source code located under `src/`, so that the repository root remains clean and contains only configuration files, documentation, and tooling definitions.
2. As a maintainer, I want feature-specific components, hooks, services, and validations colocated within dedicated feature modules, so that changes to a single business capability have high locality.
3. As an AI coding agent, I want each feature to expose its public capabilities through a single entry point, so that I can easily discover available interfaces without scanning private internal implementations.
4. As a developer working on FamilyTree visualization, I want canvas graphics, toolbar controls, layout algorithms, sharing settings, and legacy book export consolidated in the `tree` feature, so that all tree rendering and canvas mechanics are contained in one place.
5. As a developer working on Person profiles, I want form editing, avatar uploads, detail dialogs, sibling calculations, and person services consolidated in the `person` feature, so that member management logic does not bloat the tree canvas module.
6. As a developer working on authentication, I want login forms, authentication validation schemas, and session handlers grouped in the `auth` feature, so that identity workflows are decoupled from tree editing.
7. As a developer working on AI capabilities, I want the chatbot widget, AI streaming client, and model configurations grouped in the `ai` feature, so that AI assistant workflows are isolated and easily extendable with future capabilities.
8. As a developer, I want primitive UI components (buttons, dialogs, inputs) located in a shared UI module, so that all features can import standardized design system components without code duplication.
9. As a developer, I want global state slices and the state engine centralized in shared state infrastructure, so that cross-cutting state coordination remains clean without circular type references between features.
10. As a maintainer, I want page routes in the App Router to act purely as thin wrappers, so that user interface and business logic remain testable and decoupled from Next.js routing conventions.
11. As an AI coding agent, I want unused empty directories removed from the codebase, so that exploratory scans are not misled by dead paths.
12. As an end user, I want all existing family tree editing, canvas navigation, AI chatting, and sharing flows to work exactly as before, so that this architectural reorganization causes zero disruption to user experience.

## Implementation Decisions

- **Domain Model Adherence**: All module nomenclature and contracts adhere to the canonical domain definitions recorded in `GLOSSARY.md` (`FamilyTree`, `Person`, `Relationship`, `LegacyBook`).
- **Architectural Record Compliance**: The implementation adheres to ADR-0001, executing the migration to a Feature-Based architecture under `src/`.
- **Feature Encapsulation (Deep Modules)**: Four primary feature modules are established (`tree`, `person`, `auth`, `ai`). Each feature exposes a dedicated `index.ts` entry point. External modules and routing pages must import strictly from the feature entry point rather than reaching into private subfolders.
- **Unidirectional Dependency Rule**: Dependencies must flow inward and downward:
  - Routing layer (`src/app`) depends on Feature modules and Shared layer.
  - Feature modules depend on other Feature entry points and the Shared layer.
  - Shared layer (`src/components/ui`, `src/lib`, `src/types`, `src/hooks`) never imports from Feature modules.
- **Thin Routing Layer**: Next.js route files (`page.tsx`, `layout.tsx`, `route.ts`) are located in `src/app/`. They are strictly responsible for handling search parameters, route params, server headers, and mounting view containers exported by feature entry points.
- **State Infrastructure Location**: The global Zustand store is retained in the shared library infrastructure (`src/lib/store`) to support existing Immer slice composition while avoiding circular type dependencies across feature boundaries.
- **Single Path Alias**: The TypeScript configuration maintains a single, standard path alias (`@/*` mapping to `./src/*`) to keep module resolution clean and avoid tooling fragmentation.
- **Directory Pruning**: Empty directories with no active implementations (`components/dashboard`, `app/dashboard`) are completely removed.

## Testing Decisions

- **Testing Philosophy**: Testing focuses on external behavior and structural integrity rather than private file organization. Because this refactor is a non-behavioral architectural restructuring, the primary verification goal is confirming that all public module seams, TypeScript types, and bundling pipelines integrate flawlessly without runtime or compilation breakage.
- **Primary Verification Seam (Production Build)**: The overarching seam for verification is the Next.js production build (`next build`) and strict TypeScript type check (`tsc --noEmit`). Passing this gate proves that:
  - All path aliases and imports resolve correctly.
  - Zero dead or circular references exist across modules.
  - All public interfaces exported by feature entry points satisfy consumer requirements.
  - All client/server component boundaries (`"use client"`) remain valid.
- **Feature Seam Verification**: Validate that each feature entry point successfully exports its intended public surface (containers, hooks, schemas, services) and that no external files bypass the entry point.

## Out of Scope

- Modifying the underlying database schema, Supabase tables, or RLS policies.
- Adding new user-facing features or implementing the empty dashboard.
- Redesigning visual themes, Tailwind CSS styling, or Framer Motion animations.
- Modifying canvas mathematical layout algorithms (Dagre layout computations).
- Altering external API contracts (OpenRouter or Supabase API integrations).

## Further Notes

- Following this specification, the migration should be decomposed into atomic, sequentially unblocked tickets using `/to-tickets`.
- Verification via `npm run build` must be executed at the completion of each migration stage.
