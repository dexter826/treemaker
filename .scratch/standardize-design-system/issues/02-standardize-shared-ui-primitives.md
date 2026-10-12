# 02: Standardize Shared UI Primitives

**What to build:** Comprehensive standardization of all shared UI primitives (buttons, inputs, cards, dialogs, sheets, selects, dropdown menus, popovers, date pickers) to strictly embody Neo-Brutalist rules: sharp rectangular corners (`rounded-none`), solid 2px borders, uppercase bold typography, and standardized hover/active elevation translations. Any consumer of these primitives across features will automatically render with consistent, tactile styling without needing custom inline CSS.

**Blocked by:** 01: Setup Design Tokens and Elevation

**Status:** ready-for-agent

- [ ] Standardize buttons with unified height scales, border-2 styling, uppercase bold tracking, and consistent `shadow-brutal-md` press feedback.
- [ ] Standardize form input primitives (text input, textarea, input groups, date picker, select) with 2px borders, sharp corners, and high-contrast focus states.
- [ ] Standardize overlay surfaces (dialogs, sheets, popovers, dropdown menus) with bold borders, hard offset shadows, and clean backdrop blurring.
- [ ] Ensure all modified primitives pass TypeScript typechecks and production build verification.
