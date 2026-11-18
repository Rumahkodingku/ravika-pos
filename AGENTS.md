# RAVIKA POS

Self-hosted, LAN-first POS for cafes. Phases 1 through 7 are implemented. The UI runs on the real backend API: TanStack Query server state, cookie sessions, permission guards, SQLite/Drizzle, RBAC, catalog, tables and QR, orders, payments, full-order refund, KDS with SSE, reports, license, and backup/restore. No mock data path remains.

## Commands

- Use pnpm only. `package-lock.json` is gone; do not create one.
- Node baseline: 26.9.0 (`.nvmrc`, `engines`). This is not LTS; re-check native modules before pilot.
- Dev: `pnpm dev`
- Build: `pnpm build` (also typechecks)
- Start: `pnpm start`
- Lint/format check: `pnpm lint` (`biome check`)
- Typecheck: `pnpm typecheck` (`tsc --noEmit`)
- Full check: `pnpm check` (lint + typecheck)
- Test: `pnpm test` (Vitest)
- Generate migration: `pnpm db:generate` (Drizzle Kit)
- Format: `pnpm format` (`biome format --write`)
- Recommended verification: `pnpm check`, then `pnpm test`, then `pnpm build`.

## Stack and config

- Next.js 16.4.6, React 19.3, TypeScript strict, Tailwind CSS 4.3, Lucide React.
- Backend: Drizzle ORM, SQLite `node:sqlite` through `drizzle-orm/sqlite-proxy`.
- Server state: TanStack Query 5.108 (`@tanstack/react-query`) with one client from `src/app/providers.tsx`; default stale time 30 seconds.
- Tests: Vitest 5.1 with Testing Library (`@testing-library/react`, `user-event`) and jsdom. Playwright is Phase 8 only.
- Do not add Zustand, Redux, SWR, or another data-fetching or state library. React state plus TanStack Query covers the approved UI.
- Forms use React Hook Form, Zod, and `@hookform/resolvers`. Do not add another form or validation library.
- QR rendering uses `qrcode.react`. Do not add another QR library.
- Path alias: `@/*` -> `./src/*`.
- Biome 2.4: 2-space indent, organize imports on, Tailwind directives enabled in CSS.
- No UI library. Build primitives with native HTML and local components; ask before adding Radix, shadcn, or similar.
- Design tokens live in `src/styles/tokens.css`; Tailwind mapping and base styles live in `src/app/globals.css`.
- Use `primary-action` for filled primary buttons, `primary-strong` for links and active icons, and `*-strong` for semantic text. Do not use raw `primary` as normal text on white.
- Cards are flat. Do not use drop shadows anywhere. Use borders, surface contrast, and backdrop for hierarchy. Focus rings remain. Do not reintroduce glassmorphism or header blur.
- `next.config.ts`: `experimental.agentFeedback`, `experimental.instantInsights.validationLevel = "manual-warning"`, `cacheComponents`, `partialPrefetching`, Turbopack `*.css` loader via `@tailwindcss/turbopack`.
- Do not edit `next-env.d.ts`; it is generated and references `.next` route types.
- `.next/` is build output and ignored.

## Architecture and scope

- Phase 7 connected the approved UI to the Phase 6 API. Do not reintroduce mock data or a mock-first path.
- MVP is single-business and single-location. Do not add location management or location switching.
- Modular monolith. No microservices, Redis, PostgreSQL, NestJS, or cloud dependencies without a product/architecture decision.
- Backend boundary: Route Handler -> application service -> repository -> Drizzle. Do not query the database from components or Route Handlers.
- Server modules (`src/infrastructure/database/**`, `src/modules/**`) import `server-only`. Never import them from client components.
- Client server state goes through `apiFetch` in `src/lib/api/client.ts` and domain hooks in `src/features/**/api.ts`. Query keys come from `src/lib/api/keys.ts`; do not write literal key arrays in pages.
- Do not call `fetch` directly from pages or components. The only exception is the public restore health poll in `src/features/system/restart-required.tsx`.
- Order, payment, refund, and public-order mutations send `Idempotency-Key`. Reuse the key after network or 5xx failures; rotate it after 4xx.
- Do not use optimistic updates for orders, payments, or refunds. The server is the source of truth.
- Four separate experiences/shells: Owner management, Dedicated POS, KDS, Customer QR menu. Do not build one universal layout.
- Route groups are already reserved: `(auth)`, `(dashboard)`, `(cashier)`, `(kds)`, `(customer)`.
- UI structure: `src/components/ui`, `src/components/shells`, `src/components/feedback`, `src/components/theme`, `src/features`, `src/lib` (including `src/lib/api`), `src/styles`, `src/types`. There is no `src/mocks` directory.
- Management navigation uses quick links plus `MegaMenu` on desktop and `MobileMenuSheet` below `1024px`. Keep permission filtering.
- There is no `/app/design-system` route or mock-control surface. Phase 7 removed both.
- Product behavior and business rules live in `docs/PRD.md`. Read PRD plus `docs/design/*` before new pages or shared components.
- Do not invent business rules, fields, states, or permissions.
- The UI reads and writes the SQLite/Drizzle backend through Route Handlers. Session state is an HttpOnly cookie issued by the backend; the browser never reads the token.
- Layouts call `requireLayoutSession()`; pages use `PermissionGate`/`RequirePermission` with permission codes. Never guard on a role code.
- Roles are dynamic. `SessionUser.role` and `ManagementUser.role` are role codes with `roleLabel` for display; custom roles can be assigned to users.
- POS order flow: create `NEW`/`UNPAID`, then record payment from POS. Management Payments stays read-only.
- KDS only moves `NEW -> ACCEPTED -> PREPARING -> READY -> COMPLETED`. Cancel stays in management Orders.
- Dine-in tables become `OCCUPIED` automatically and return to `AVAILABLE` when no active order remains.
- Cancel is blocked when a recorded payment exists. Full-order refund is available from order detail for `PAID` orders with `payments.refund`.
- POS cart uses sessionStorage key `ravika-pos-cart`. QR table tokens and order public tokens are separate.
- QR table codes are scannable. Product images are optional; products without one use a neutral placeholder.
- Product images are optional and stored as BLOB in `product_images` (one per product), never as files in `public/` or `data/uploads/`. Uploads use `PUT /api/products/:id/image`, deletes use `DELETE`, and public reads use versioned `GET /api/product-images/:productId`.
- Product image upload allows JPEG/PNG/WebP, max 5 MB after client compression. The client resizes to 1600px and encodes WebP 0.82 with JPEG fallback. SVG/GIF are rejected.
- Public menu uses top-level `addOns` from the public menu response. Public order status polls every 10 seconds through TanStack Query.
- Public order status uses `publicToken` and must never show internal user data or other orders.

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
- No Playwright or browser E2E yet (Phase 8). Vitest covers backend integration and RTL flows for auth, users/roles, catalog, tables, orders/refund, POS, payments, KDS SSE, public menu/status, reports, and restore.
- Do not add Zustand. TanStack Query, query keys, and the KDS SSE client already exist; use them.
- Database file lives in `data/` by default and is ignored. Bootstrap owner production requires env variables from `.env.example`.
- Order/payment/refund/public-order mutations require `Idempotency-Key`. Refund endpoint is `POST /api/orders/:id/refund` and is full-order only.
- QR tokens require `RAVIKA_QR_TOKEN_KEY` (base64 32 bytes) in production. License verification uses `RAVIKA_LICENSE_FILE`, `RAVIKA_LICENSE_PUBLIC_KEY`, and `RAVIKA_INSTALLATION_ID`. Backup goes to `data/backups/`.
- Restore succeeds only after the database is replaced, then sets `ravika-restart-required` in localStorage. The blocking restart screen polls `/api/health` every 3 seconds; after health 200 it clears the flag and reloads. Do not show a normal success toast instead.
- Backend SSE is in-process only. Do not add Redis or a worker for it without an architecture decision.
- Phase 7 added no database migration. Backend changes are response enrichment and the `roles/options` route only.

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
