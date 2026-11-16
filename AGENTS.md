# RAVIKA POS

Self-hosted, LAN-first POS for cafes. Phase 1 foundation, Phase 1.5 operational UI, and Phase 2 management UI are implemented with mock data, mock auth, and a mock service. Backend is intentionally not implemented yet.

## Commands

- Use pnpm only. `package-lock.json` is gone; do not create one.
- Node baseline: 26.9.0 (`.nvmrc`, `engines`). This is not LTS; re-check native modules in Phase 5.
- Dev: `pnpm dev`
- Build: `pnpm build` (also typechecks)
- Start: `pnpm start`
- Lint/format check: `pnpm lint` (`biome check`)
- Typecheck: `pnpm typecheck` (`tsc --noEmit`)
- Full check: `pnpm check` (lint + typecheck)
- Format: `pnpm format` (`biome format --write`)
- No test script yet. Roadmap plans Vitest + Playwright, but they are not installed.
- Recommended verification: `pnpm lint`, then `pnpm typecheck`, then `pnpm build` for touched routes.

## Stack and config

- Next.js 16.4.6, React 19.3, TypeScript strict, Tailwind CSS 4.3, Lucide React.
- Forms use React Hook Form, Zod, and `@hookform/resolvers`. Do not add another form or validation library.
- Path alias: `@/*` -> `./src/*`.
- Biome 2.4: 2-space indent, organize imports on, Tailwind directives enabled in CSS.
- No UI library. Build primitives with native HTML and local components; ask before adding Radix, shadcn, or similar.
- Design tokens live in `src/styles/tokens.css`; Tailwind mapping and base styles live in `src/app/globals.css`.
- Use `primary-action` for filled primary buttons, `primary-strong` for links and active icons, and `*-strong` for semantic text. Do not use raw `primary` as normal text on white.
- Cards are flat by default. Shadow is reserved for overlays. Do not reintroduce glassmorphism or header blur.
- `next.config.ts`: `experimental.agentFeedback`, `experimental.instantInsights.validationLevel = "manual-warning"`, `cacheComponents`, `partialPrefetching`, Turbopack `*.css` loader via `@tailwindcss/turbopack`.
- Do not edit `next-env.d.ts`; it is generated and references `.next` route types.
- `.next/` is build output and ignored.

## Architecture and scope

- Frontend-first strategy: build UI with mock data, review, then backend. Do not implement operational backend until UI is approved.
- Keep data types and service contracts consistent so mock implementations can be swapped for APIs.
- Modular monolith. No microservices, Redis, PostgreSQL, NestJS, or cloud dependencies without a product/architecture decision.
- Four separate experiences/shells: Owner management, Dedicated POS, KDS, Customer QR menu. Do not build one universal layout.
- Route groups are already reserved: `(auth)`, `(dashboard)`, `(cashier)`, `(kds)`, `(customer)`.
- UI structure: `src/components/ui`, `src/components/shells`, `src/components/feedback`, `src/components/theme`, `src/features`, `src/lib`, `src/mocks`, `src/styles`, `src/types`.
- Management navigation uses quick links plus `MegaMenu` on desktop and `MobileMenuSheet` below `1024px`. Keep permission filtering.
- `/app/design-system` is the component preview and mock-control surface. Keep it for visual QA.
- Product behavior and business rules live in `docs/PRD.md`. Read PRD plus `docs/design/*` before new pages or shared components.
- Do not invent business rules, fields, states, or permissions.
- Management data lives in one in-memory mock store and resets on reload. Mutations go through `managementService`.
- Mock auth uses `sessionStorage` key `ravika-session-user-id`. Demo accounts: `owner@ravika.id`, `cashier@ravika.id`, `barista@ravika.id`, password `demo123`.
- Payments are read-only. Orders are read-only except cancellation from `NEW`, `ACCEPTED`, or `PREPARING` with a reason.
- QR previews are not scannable. Product images are neutral placeholders with no upload.

## Design

- Tokens and component specs: `docs/design/design-system.md`.
- Visual direction: `docs/design/design-direction.md`.
- Interaction, responsive, accessibility, and QA rules: `docs/design/ui-ux-guidelines.md`.
- Use semantic design tokens, not raw hex values.
- Theme defaults: management follows system with light fallback; POS light; KDS dark; QR menu light.
- Theme state is global (`ravika-theme`); each shell passes its default to `ThemeProvider`.
- The theme bootstrap script lives in the root layout head. Do not move it back into `ShellTheme`; that causes a client script warning.
- UI copy is Indonesian; code and comments are English. Use documented state labels.
- UI copy must not use em dashes or middle dots for metadata. Empty values use "Tidak ada" or "Belum ada".
- Payment status and preparation status must remain separate.
- Native `<dialog>` is used for Dialog/Drawer/MobileMenuSheet; preserve focus, Escape, and backdrop behavior.
- Badge labels use `rounded-md` and semantic text. Do not turn every label into a pill.

## Documentation authority

1. `docs/PRD.md` — product scope, business rules, workflows, permissions.
2. `docs/design/design-system.md` — tokens and component foundations.
3. `docs/design/design-direction.md` and `docs/design/ui-ux-guidelines.md` — visual and interaction rules.
4. `docs/ROADMAP.md` — phase order only; it does not change product requirements.

If docs conflict with config or scripts, trust the executable source. If a requirement is ambiguous and affects workflow, data, payment, permission, or state, stop and ask.

## Gotchas

- Next.js 16 has breaking changes. Read `node_modules/next/dist/docs/` before framework code.
- The order status route uses `export const instant = false` to avoid the `cacheComponents` URL-data prerender warning; review before removing.
- Customer menu uses `useParams` in a client page and does not need `instant = false`.
- No automated tests are configured; manual and visual checks are required. Use `/app/design-system` for component QA.
- Do not add SQLite, Drizzle, Zustand, TanStack Query, or other planned dependencies until the relevant phase.
- No API, database, auth, or SSE exists. Do not add them before the UI approval gate.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->
