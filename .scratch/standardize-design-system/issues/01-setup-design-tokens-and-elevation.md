# 01: Setup Design Tokens and Elevation

**What to build:** The foundational styling configuration for the entire application, establishing a clean 3-tier Design Token architecture and official Neo-Brutalist hard elevation utilities in the global stylesheet. This eliminates duplicated CSS variables, provides dedicated semantic tokens for memorial/deceased states, and exposes official utility classes for hard shadows across Light and Dark themes, while ensuring existing screens continue to compile and render cleanly without visual breakage.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] Deduplicate CSS variables and configure clean OKLCH color palettes for Light and Dark modes.
- [x] Establish dedicated semantic tokens for memorial/deceased member states.
- [x] Define standardized hard elevation utilities (`shadow-brutal-sm`, `shadow-brutal-md`, `shadow-brutal-lg`) and their active primary variants in the styling configuration.
- [x] Verify that existing pages and components continue to build cleanly with zero compilation errors.
