# 06: Consistency Sweep and Production Gate

**What to build:** The final verification and cleanup phase, sweeping the entire codebase to eliminate any remaining arbitrary hardcoded shadow classes (`shadow-[..._0px_0px]`) and radius inconsistencies. Verifies that all screens, components, and interactions cleanly compile under strict TypeScript checks and Next.js production build without warnings or regressions.

**Blocked by:** 05: Overhaul Dashboard, Share, Login, and AI

**Status:** ready-for-agent

- [ ] Perform a global sweep across `src/` to remove any remaining arbitrary shadow declarations, ensuring 100% adherence to `shadow-brutal-*`.
- [ ] Verify that all shared UI components strictly maintain `rounded-none` and `border-2` consistency.
- [ ] Run `npm run lint` and verify zero ESLint errors or unused imports.
- [ ] Run `npm run build` and verify that production compilation and static page generation pass cleanly.
