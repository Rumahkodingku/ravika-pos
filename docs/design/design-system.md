# RAVIKA POS — Design System

> **Status:** Approved foundation; implementation values may be refined through visual QA  
> **Version:** 1.0.0  
> **Primary typeface:** Plus Jakarta Sans

## 1. Purpose and rules

Dokumen ini menetapkan fondasi visual dan komponen reusable RAVIKA POS. Semua halaman internal harus menggunakan design tokens, bukan nilai warna, spacing, radius, dan typography yang tersebar tanpa aturan.

### Rules

1. Prefer semantic tokens over raw color values in application components.
2. Every semantic token must have light and dark theme values.
3. Components must expose intentional variants and states.
4. Avoid one-off styling unless there is a documented reason.
5. Do not encode business state only through color.
6. Component behavior and permissions are governed by product/API rules, not visual state alone.

## 2. Foundations

### 2.1 Color palette

#### Brand primitives

| Name                | Value     |
| ------------------- | --------- |
| `brand.deepNavy`    | `#101828` |
| `brand.blue`        | `#315B91` |
| `brand.accent`      | `#3978D5` |
| `neutral.white`     | `#FFFFFF` |
| `neutral.lightGray` | `#F3F5F8` |
| `neutral.gray`      | `#667085` |

#### Semantic primitives

| Name        | Value     |
| ----------- | --------- |
| `green.600` | `#16A36A` |
| `amber.600` | `#D99019` |
| `red.600`   | `#DC4C4C` |
| `blue.600`  | `#3978D5` |

These are primitive reference values. Components should consume semantic theme tokens below.

### 2.2 Semantic theme tokens

Initial token proposal:

| Token                  | Light     | Dark      |
| ---------------------- | --------- | --------- |
| `background`           | `#FFFFFF` | `#101828` |
| `foreground`           | `#101828` | `#F8FAFC` |
| `surface`              | `#FFFFFF` | `#172235` |
| `surface-subtle`       | `#F3F5F8` | `#1D2A3D` |
| `surface-elevated`     | `#FFFFFF` | `#243247` |
| `muted`                | `#F3F5F8` | `#29384D` |
| `muted-foreground`     | `#667085` | `#A7B2C2` |
| `border`               | `#E4E7EC` | `#344256` |
| `input`                | `#D0D5DD` | `#46566D` |
| `primary`              | `#3978D5` | `#6EA5F5` |
| `primary-foreground`   | `#FFFFFF` | `#081B34` |
| `secondary`            | `#EEF2F7` | `#29384D` |
| `secondary-foreground` | `#101828` | `#E8EEF6` |
| `success`              | `#16A36A` | `#35C78A` |
| `success-subtle`       | `#E8F7EF` | `#123B2C` |
| `warning`              | `#B7791F` | `#F0B64D` |
| `warning-subtle`       | `#FFF5DF` | `#453414` |
| `danger`               | `#DC4C4C` | `#F07878` |
| `danger-subtle`        | `#FDECEC` | `#481F27` |
| `info`                 | `#3978D5` | `#6EA5F5` |
| `info-subtle`          | `#EAF2FF` | `#172F50` |
| `focus-ring`           | `#3978D5` | `#8AB8FF` |
| `primary-action`       | `#2F66B8` | `#6EA5F5` |
| `primary-action-foreground` | `#FFFFFF` | `#081B34` |
| `primary-strong`       | `#315B91` | `#8AB8FF` |
| `success-strong`       | `#0F7A4F` | `#35C78A` |
| `warning-strong`       | `#8A5A12` | `#F0B64D` |
| `danger-strong`        | `#B42318` | `#F07878` |
| `info-strong`          | `#315B91` | `#6EA5F5` |
| `teal`                 | `#0E9384` | `#2DD4BF` |
| `teal-subtle`          | `#E6F7F4` | `#123B36` |
| `teal-strong`          | `#0B7266` | `#5EEAD4` |
| `surface-inverse`      | `#101828` | `#101828` |
| `inverse-foreground`   | `#F8FAFC` | `#F8FAFC` |

**Important:** Values are starting tokens and must be contrast-tested before release. Do not assume every foreground/background pairing is accessible merely because both values are in this table.

**Contrast note:** The original light-theme `primary` and semantic text colors did not meet WCAG AA for normal text. Fase 1.5 adds `primary-action` for filled actions and `*-strong` tokens for text, links, icons, and badges. Use `primary` as an accent and chart color, not as normal text on white. `primary-action` with `primary-action-foreground` passes 5.65:1 in light theme. `success-strong`, `warning-strong`, `danger-strong`, `info-strong`, and `teal-strong` pass on their respective subtle backgrounds.

### 2.3 Typography

Primary: Plus Jakarta Sans.  
Fallback: Inter, system-ui, sans-serif.

| Token           |  Size | Line height | Weight |
| --------------- | ----: | ----------: | ------ |
| `display`       | 32 px |       40 px | 700    |
| `page-title`    | 28 px |       36 px | 700    |
| `section-title` | 20 px |       28 px | 600    |
| `card-title`    | 16 px |       24 px | 600    |
| `body`          | 14 px |       20 px | 400    |
| `body-medium`   | 14 px |       20 px | 500    |
| `label`         | 13 px |       18 px | 500    |
| `caption`       | 12 px |       16 px | 400    |
| `button`        | 14 px |       20 px | 600    |

Guidance:

- Use tabular numerals for currency, quantities, and timers where available.
- Avoid using caption size for essential transaction information.
- Do not use more than a small set of weights on one screen.

### 2.4 Spacing scale

Use a 4 px base scale.

| Token      | Value |
| ---------- | ----: |
| `space-1`  |  4 px |
| `space-2`  |  8 px |
| `space-3`  | 12 px |
| `space-4`  | 16 px |
| `space-5`  | 20 px |
| `space-6`  | 24 px |
| `space-8`  | 32 px |
| `space-10` | 40 px |
| `space-12` | 48 px |
| `space-16` | 64 px |

Default page padding:

- Desktop: 24–32 px.
- Tablet: 20–24 px.
- Mobile: 16 px.

### 2.5 Radius

| Token         |   Value | Use                                     |
| ------------- | ------: | --------------------------------------- |
| `radius-sm`   |    6 px | Small controls, chips                   |
| `radius-md`   |    8 px | Inputs, buttons                         |
| `radius-lg`   |   12 px | Cards, panels                           |
| `radius-xl`   |   16 px | Large panels/dialogs                    |
| `radius-full` | 9999 px | Circular controls and intentional pills |

Do not make every container fully rounded.

### 2.6 Borders and elevation

- Standard border: 1 px solid semantic `border`.
- Strong border: 1 px solid `input` or a stronger semantic border.
- Default cards: flat with subtle border.
- Do not use drop shadows. Elevation comes from borders, surface contrast, and backdrop.
- Focus rings remain because they are accessibility indicators, not decoration.

### 2.7 Iconography

Use Lucide Icons. Keep a consistent stroke style.

Suggested sizes:

- 16 px: inline and dense controls.
- 18 px: standard controls.
- 20 px: navigation and common actions.
- 24 px: prominent action or empty-state context.

Always pair ambiguous icons with visible text or an accessible label.

## 3. Layout tokens

### 3.1 Breakpoints

| Name  |   Width |
| ----- | ------: |
| `sm`  |  640 px |
| `md`  |  768 px |
| `lg`  | 1024 px |
| `xl`  | 1280 px |
| `2xl` | 1440 px |

Use content-driven responsive rules. The breakpoint values are defaults, not an excuse to ignore actual component constraints.

### 3.2 Containers

- Management content may use full width for data-heavy tables.
- Dashboard content may use a readable max-width where appropriate.
- POS uses available viewport width and a two-region desktop layout.
- QR Menu uses a centered mobile content column with a sensible max width on desktop.

### 3.3 Grid

- Dashboard: responsive 12-column conceptual grid.
- Product catalog: adaptive card grid.
- POS: product area plus cart region on desktop.
- KDS: status columns or adaptive board.
- Customer menu: single column on narrow screens; responsive grid when useful.

## 4. Component specifications

### 4.1 Buttons

Variants:

- `primary`: main action.
- `secondary`: alternative action.
- `outline`: neutral action with border.
- `ghost`: low-emphasis action.
- `danger`: destructive action.
- `link`: inline navigation/action.

Sizes:

- `sm`: compact secondary controls.
- `md`: default.
- `lg`: prominent POS/customer actions.
- `icon`: square icon-only control with accessible name.

States:

- default, hover, focus-visible, active, disabled, loading.

Rules:

- One visually dominant primary action per local action group where possible.
- Destructive action must not look like a normal primary action.
- Loading state must prevent duplicate submission where appropriate.
- Do not remove focus indication.

### 4.2 Inputs and form controls

Components:

- Text input
- Search input
- Textarea
- Select/combobox
- Checkbox
- Radio group
- Switch
- Date picker
- Quantity control

States:

- default, hover, focus, filled, disabled, invalid, read-only.

Rules:

- Every control requires a visible label or an accessible name.
- Placeholder is not a label.
- Validation message should explain how to fix the error.
- Preserve user input after recoverable validation errors.

### 4.3 Cards and panels

Variants:

- `default`
- `interactive`
- `stat`
- `product`
- `order`
- `surface-subtle`

Rules:

- Use consistent padding and border.
- Interactive cards must communicate interactivity.
- Do not nest interactive controls inside a clickable card without clear event behavior.

### 4.4 Tables

Required capabilities:

- Column headers.
- Numeric alignment.
- Row hover only when row interaction exists.
- Empty state.
- Loading state.
- Error state.
- Responsive overflow or alternate mobile presentation.

Rules:

- Do not hide critical transaction fields without an accessible detail path.
- Use consistent currency formatting.
- Keep action menus predictable.
- Use pagination or bounded result sets when necessary.

### 4.5 Badges and status labels

Status labels must include text. Semantic colors are supporting cues.

Examples:

- Payment: Unpaid, Partially paid, Paid, Refunded.
- Preparation: New, Accepted, Preparing, Ready, Completed, Cancelled.
- System: Connected, Disconnected, Reconnecting, Backup required.

Payment state and preparation state must remain visually separate. Never collapse them into one status badge.

Stepper status colors:

- `NEW`: `primary`
- `ACCEPTED`: `teal`
- `PREPARING`: `warning`
- `READY`: `success`
- `COMPLETED`: `neutral`
- `CANCELLED`: `danger`

Labels always carry the status text. Color is a supporting cue, not the only cue.

### 4.6 Dialogs and drawers

Use dialogs for:

- Focused confirmation.
- Short forms.
- Critical destructive decisions.

Use drawers for:

- Mobile cart.
- Secondary details.
- Contextual editing where preserving the page behind is useful.

Rules:

- Provide a clear title.
- Provide a close/cancel path unless the flow truly requires completion.
- Manage focus correctly.
- Prevent accidental background interaction.
- On mobile, use a drawer or full-screen sheet when a dialog would be cramped.

### 4.7 Toasts and alerts

- Toast: transient confirmation for non-critical outcomes.
- Inline alert: persistent context or actionable warning.
- Dialog: decision requiring explicit confirmation.

Do not use a toast as the only record of a critical transaction outcome.

### 4.8 Charts

- Use restrained, theme-aware colors.
- Include labels, units, date context, and meaningful tooltips.
- Do not rely on color alone to distinguish series.
- Avoid chart types that obscure the data.
- Provide an accessible textual/table alternative for important figures.

### 4.9 Management patterns

- `FormDrawer`: right drawer on desktop, full-screen sheet on mobile. Sticky footer, submit loading state, dirty-form confirmation, Escape and focus restoration.
- `ConfirmDialog`: title, description, optional consequence, cancel, confirm. Destructive confirmation uses the danger variant.
- `DataTableToolbar`: debounced search (250 ms), filter slots, reset, result count, and a mobile filter sheet.
- `SortableTableHead`: button header with `aria-sort` and asc/desc indicator.
- `TableSkeleton`, `TableEmpty`, and `TablePagination`: preserve columns, show a specific empty message, and expose `aria-current` on the active page.
- `ResponsiveList`: table on desktop, card list below `1024px`.
- `TableQrCode`: scannable QR generated with `qrcode.react`. Copy and print actions use the real menu URL. Keep the table name and URL visible next to the QR.
- `PermissionGate` and `RequirePermission`: hide actions or show `PermissionDeniedState` based on session permissions.
- `MockControls`: latency, fail-next-request, and store reset. Only on `/app/design-system`.

## 5. Domain-specific components

### 5.1 POS components

- `ProductGrid`
- `ProductCard`
- `CategoryFilter`
- `ProductSearch`
- `VariantSelector`
- `AddonSelector`
- `CartPanel`
- `CartLineItem`
- `OrderTypeSelector`
- `TableSelector`
- `CheckoutSummary`
- `PaymentMethodSelector`
- `PaymentEntry`
- `ChangeDueSummary`
- `TransactionConfirmation`

POS-specific rules:

- Product card must expose name, price, and availability.
- Add action must have immediate feedback.
- Cart item quantity and customization must be editable.
- Totals must remain visually prominent.
- Payment status must be distinct from preparation status.
- Prevent accidental duplicate payment submission.

### 5.2 KDS components

- `KDSBoard`
- `KDSColumn`
- `OrderTicket`
- `OrderTimer`
- `OrderStatusAction`
- `ConnectionIndicator`

KDS-specific rules:

- Ticket displays order number, order type/table, time, items, quantities, and notes.
- Next valid action must be obvious.
- READY tickets remain visible until picked up/completed.
- Reconnection state must be visible.
- New events must not cause disorienting layout shifts.

### 5.3 Customer menu components

- `MenuHeader`
- `MenuCategoryNavigation`
- `MenuSearch`
- `MenuProductCard`
- `MenuProductDetail`
- `CartBar`
- `CustomerCart`
- `TableQrCode`
- `CheckoutForm`
- `OrderSubmittedState`

Customer menu rules:

- Mobile-first.
- No account requirement.
- Product price and availability are easy to see.
- Cart remains reachable.
- Checkout errors preserve the cart where possible.

## 6. Theme architecture

Support `light`, `dark`, and `system` preference.

Resolution:

1. If user explicitly selects light or dark, use that choice.
2. If user selects system, follow operating system preference.
3. If preference is not available, fallback to light.

Initial experience defaults:

- Management: system preference, fallback light.
- POS: light.
- KDS: dark.
- QR Menu: light.

These are initial defaults, not restrictions. Theme selection must not change business data or behavior.

All components must be tested in both themes. Check charts, images, overlays, disabled controls, status colors, focus rings, and table borders.

## 7. Interaction and motion tokens

Suggested timing:

- Micro feedback: 100–150 ms.
- Standard transition: 150–220 ms.
- Overlay transition: 180–240 ms.

Use restrained easing. Avoid animation that blocks input or delays transaction completion. Respect reduced-motion settings.

## 8. Data formatting

- Currency: Indonesian Rupiah (`Rp`) using Indonesian locale conventions.
- Date/time: use the business timezone configured by the product; do not hardcode a timezone in UI components.
- Quantities: display units consistently.
- Large values: do not abbreviate monetary amounts if abbreviation could cause transaction ambiguity.
- Order numbers: preserve exact identifiers returned by the system.
- Empty/unknown values: use "Tidak ada" or "Belum ada", not misleading zero values or an em dash.

## 9. Accessibility requirements

- Target WCAG 2.2 AA contrast.
- Keyboard-operable navigation, forms, dialogs, and menus.
- Visible focus indicators.
- Proper heading hierarchy.
- Semantic labels and accessible names.
- Error messages associated with their fields.
- Status communicated by text/icon as well as color.
- Touch target recommendation: at least 44 × 44 CSS px for primary touch actions.
- Reduced-motion support.
- Do not trap users in modal or drawer interactions.

## 10. Tailwind CSS v4 implementation guidance

- Define tokens as CSS custom properties and map them to Tailwind theme utilities.
- Use semantic CSS variables for theme-dependent colors.
- Avoid scattering raw hex values in component markup.
- Use shared variants for reusable components.
- Keep domain-specific components composed from shared primitives.
- Do not create a new token for every isolated one-off value.
- Validate dark mode and responsive states in actual pages, not only in a token showcase.

Illustrative semantic token pattern (adapt to project conventions):

```css
:root {
  --background: #ffffff;
  --foreground: #101828;
  --surface: #ffffff;
  --surface-subtle: #f3f5f8;
  --border: #e4e7ec;
  --primary: #3978d5;
  --primary-foreground: #ffffff;
}

.dark {
  --background: #101828;
  --foreground: #f8fafc;
  --surface: #172235;
  --surface-subtle: #1d2a3d;
  --border: #344256;
  --primary: #6ea5f5;
  --primary-foreground: #081b34;
}
```

This is a token illustration, not a complete production stylesheet. Confirm contrast and naming against the implementation.

## 11. Design QA checklist

- [ ] Every screen uses semantic tokens.
- [ ] Light theme verified.
- [ ] Dark theme verified.
- [ ] Responsive behavior verified at supported widths.
- [ ] Loading, empty, error, disabled, and success states exist.
- [ ] Keyboard navigation works.
- [ ] Focus indicators are visible.
- [ ] Contrast checked.
- [ ] Currency and date formatting are consistent.
- [ ] Payment and preparation states are distinct.
- [ ] Critical actions have appropriate confirmation.
- [ ] Touch targets are practical.
- [ ] No layout shift from image loading or status updates.
- [ ] No decorative animation blocks operational work.
