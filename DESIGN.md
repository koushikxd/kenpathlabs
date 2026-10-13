---
name: kenpathlabs
description: >-
  Default design system for apps/web, defined by packages/ui/src/styles/globals.css and the
  packages/ui primitives. Values are written "light → dark" where the two themes differ.
colors:
  # Theme tokens. Achromatic (chroma 0) shadcn/base-ui palette; oklch is the literal in
  # the source. Binding: bg-<name> / text-<name> / border-<name>, or var(--<name>).
  background: "oklch(0.979 0 0) → oklch(0.182 0 0)" # #f8f8f8 → #121212
  foreground: "oklch(0.145 0 0) → oklch(0.985 0 0)"
  card: "oklch(1 0 0) → oklch(0.205 0 0)"
  card-foreground: "oklch(0.145 0 0) → oklch(0.985 0 0)"
  popover: "oklch(1 0 0) → oklch(0.205 0 0)"
  popover-foreground: "oklch(0.145 0 0) → oklch(0.985 0 0)"
  primary: "oklch(0.205 0 0) → oklch(0.87 0 0)"
  primary-foreground: "oklch(0.985 0 0) → oklch(0.205 0 0)"
  secondary: "oklch(0.97 0 0) → oklch(0.269 0 0)"
  secondary-foreground: "oklch(0.205 0 0) → oklch(0.985 0 0)"
  muted: "oklch(0.97 0 0) → oklch(0.269 0 0)"
  muted-foreground: "oklch(0.556 0 0) → oklch(0.708 0 0)"
  accent: "oklch(0.964 0 0) → oklch(0.252 0 0)" # #f3f3f3 → #222, the hover tint
  accent-foreground: "oklch(0.205 0 0) → oklch(0.985 0 0)"
  destructive: "oklch(0.58 0.22 27) → oklch(0.704 0.191 22.216)"
  success: "oklch(0.639 0.175 148)" # #1fa748, same in both themes
  success-muted: "oklch(0.941 0.074 147.9) → oklch(0.639 0.175 148 / 15%)" # #cbfad0 → success at 15%
  success-foreground: "oklch(0.485 0.129 148.8) → oklch(0.726 0.179 148.9)" # #137232 → #3cc463
  brand: "oklch(0.541 0.281 293.009) → oklch(0.702 0.183 293.541)" # violet-600 → violet-400, the one accent
  frozen: "oklch(0.685 0.169 237.323) → oklch(0.746 0.16 232.661)" # sky-500 → sky-400, frozen days only
  border: "oklch(0.922 0 0) → oklch(1 0 0 / 10%)"
  input: "oklch(0.922 0 0) → oklch(1 0 0 / 15%)"
  ring: "oklch(0.708 0 0) → oklch(0.556 0 0)"
  sidebar: "oklch(1 0 0) → oklch(0.209 0 0)" # #fff → #181818
  sidebar-foreground: "oklch(0.145 0 0) → oklch(0.985 0 0)"
  sidebar-primary: "oklch(0.205 0 0) → oklch(0.488 0.243 264.376)"
  sidebar-primary-foreground: "oklch(0.985 0 0) → oklch(0.985 0 0)"
  sidebar-accent: "oklch(0.964 0 0) → oklch(0.252 0 0)"
  sidebar-accent-foreground: "oklch(0.205 0 0) → oklch(0.985 0 0)"
  sidebar-border: "oklch(0.922 0 0) → oklch(1 0 0 / 10%)"
  sidebar-ring: "oklch(0.708 0 0) → oklch(0.556 0 0)"
  chart-1: "oklch(0.809 0.105 251.813)" # chart-* are a blue ramp, charts only
  chart-2: "oklch(0.623 0.214 259.815)"
  chart-3: "oklch(0.546 0.245 262.881)"
  chart-4: "oklch(0.488 0.243 264.376)"
  chart-5: "oklch(0.424 0.199 265.638)"
typography:
  # fontFamily is {typography.font-sans} everywhere except mono-12.
  hero-24: { fontSize: 24px, fontWeight: 600, lineHeight: 32px, letterSpacing: -0.025em } # text-2xl font-semibold tracking-tight
  title-18: { fontSize: 18px, fontWeight: 600, lineHeight: 28px } # text-lg font-semibold
  label-14: { fontSize: 14px, fontWeight: 500, lineHeight: 20px } # text-sm font-medium
  body-14: { fontSize: 14px, fontWeight: 400, lineHeight: 20px } # text-sm, the <body> default
  prose-16: { fontSize: 16px, fontWeight: 400, lineHeight: 24px } # text-base, long-form reading
  meta-12: { fontSize: 12px, fontWeight: 400, lineHeight: 16px } # text-xs
  meta-12-medium: { fontSize: 12px, fontWeight: 500, lineHeight: 16px } # text-xs font-medium
  card-12-relaxed: { fontSize: 12px, fontWeight: 400, lineHeight: 19.5px } # text-xs/relaxed
  mono-12: {
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: 12px,
      fontWeight: 400,
      lineHeight: 16px,
    } # font-mono text-xs, Tailwind's default stack (there is no --font-mono)
  font-sans: "-apple-system-body, ui-sans-serif, -apple-system, system-ui, 'Segoe UI', Helvetica, 'Apple Color Emoji', Arial, sans-serif, 'Segoe UI Emoji', 'Segoe UI Symbol'"
rounded:
  base: 10px # --radius: 0.625rem
  sm: 6px # calc(var(--radius) - 4px)
  md: 8px # calc(var(--radius) - 2px), the primitive default
  lg: 10px # var(--radius)
  xl: 14px # calc(var(--radius) + 4px), the dominant container radius
  2xl: 18px # calc(var(--radius) + 8px)
  3xl: 22px # calc(var(--radius) + 12px)
  4xl: 26px # calc(var(--radius) + 16px)
  full: 9999px
spacing:
  base: 4px # --spacing, Tailwind v4 default; every step is a multiple, halves included
  1: 4px
  2: 8px # the default inline gap
  2.5: 10px # the control-cluster gap
  3: 12px
  4: 16px
  5: 20px # the default gap between page sections
  6: 24px # the page padding
components:
  # Import the real primitives from @kenpathlabs/ui; these entries only fix the defaults.
  button-default:
    height: 32px # h-8; xs 24, sm 28, lg 36; icon-xs 24, icon-sm 28, icon 32, icon-lg 36
    rounded: "{rounded.md}"
    paddingInline: 10px # px-2.5
    typography: "{typography.label-14}"
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    hover: { backgroundColor: "{colors.primary} at 80%" }
    active: { transform: translateY(1px) } # suppressed on aria-haspopup triggers
    focus: { border: "{colors.ring}", ring: "1px {colors.ring} at 50%" }
    disabled: { opacity: 0.5, pointerEvents: none }
    touch: { minHeight: 44px, minWidth: 44px } # pointer-coarse:, every size
  input:
    height: 32px # 44px on touch (pointer-coarse:h-11)
    rounded: "{rounded.md}"
    paddingInline: 10px
    border: "{colors.input}"
    backgroundColor: transparent
    typography: "{typography.meta-12}" # 16px on touch (pointer-coarse:text-base), so phones do not zoom on focus
    focus: { border: "{colors.ring}", ring: "1px {colors.ring} at 50%" }
    disabled: { backgroundColor: "{colors.input} at 50%", opacity: 0.5 }
  card:
    rounded: "{rounded.md}"
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    ring: "1px {colors.foreground} at 10%"
    padding: "{spacing.4}" # --card-spacing; 12px at size="sm"
    typography: "{typography.card-12-relaxed}"
  badge:
    height: 20px
    rounded: "{rounded.md}"
    paddingInline: "{spacing.2}"
    typography: "{typography.meta-12-medium}"
  dialog:
    rounded: "{rounded.2xl}"
    backgroundColor: "{colors.popover}"
    ring: "1px {colors.foreground} at 10%"
    padding: "{spacing.6}"
    gap: "{spacing.5}"
    maxWidth: 384px # sm:max-w-sm
    overlay: "black at 10% + backdrop-blur-xs"
# --- extensions (not spec groups) ---
shadows:
  # Depth is carried by rings and borders, not shadows. These are the only real uses.
  toast: "shadow-lg" # also the command palette and sheet
  menu: "shadow-md" # dropdown-menu, popover, select, hover-card
  ring: "0 0 0 1px oklch(0.145 0 0 / 0.1)" # ring-1 ring-foreground/10, the elevated-surface edge
  hairline-outline: "0 0 0 1px oklch(0 0 0 / 0.1)" # outline-black/10 dark:outline-white/10, on photos only
motion:
  fast: 150ms # the most common duration
  base: 200ms
  slow: 300ms
  entrance: 500ms # the animate-in entrance for pages, rows, and heroes
  overlay-in: 180ms
  overlay-out: 130ms # out is always faster than in
  easing: "ease-out" # cubic-bezier(0, 0, 0.2, 1), the default in TSX
  easing-overlay-in: "cubic-bezier(0.165,0.84,0.44,1)"
  easing-overlay-out: "cubic-bezier(0.4,0,1,1)"
  cascade-base: 130ms # first row
  cascade-step: 45ms # per row, capped at 8 rows
  tooltip-open-delay: 400ms
  search-debounce: 180ms
breakpoints:
  sm: 640px
  md: 768px # also the JS sidebar/mobile breakpoint
  lg: 1024px
---

# kenpathlabs design system

## Overview

Quiet, flat, and dense in the way a tool you keep open all day has to be. The chrome is
achromatic: greys from `oklch(0.979)` down to `oklch(0.145)`, one red for danger, one green
for success, and no webfont, so nothing competes with the work. Depth comes from a hairline
`ring-1 ring-foreground/10` on floating surfaces and `border-border` everywhere else, so
screens read as sheets of paper on a light grey desk. Text is small by default (14px body,
12px metadata); long-form reading opens up to 16px.

Colour is reserved and load-bearing where it appears. Everything else is grey. If a new
surface wants colour, the answer is almost always no.

This file documents both themes; light and dark are the same tokens with different values,
so writing tokens gets dark mode for free. Everything here comes from
`packages/ui/src/styles/globals.css` and the `packages/ui` primitives.

## Consumption

Tailwind v4, no `tailwind.config`. Tokens are CSS custom properties in
`packages/ui/src/styles/globals.css`: raw values in `:root` and `.dark`, exposed as
utilities through the `@theme inline` block. So each token has exactly one binding:

- Colors: `bg-background`, `text-muted-foreground`, `border-border`, `ring-ring`. Reach
  for `var(--sidebar-border)` only inside an arbitrary value that needs it.
- Radii: `rounded-md`, `rounded-xl`. They resolve through `--radius`, so never write
  `rounded-[10px]`.
- Opacity modifiers are the house way to derive a shade: `bg-muted/40`,
  `bg-destructive/5`, `ring-foreground/10`, `text-sidebar-foreground/60`. Do not add a new
  colour token for a tint.
- Fonts: `font-sans` (already set on `html` and `body`), `font-mono` for code and raw
  text. There is no `--font-mono` token and no webfont.

`@layer base` sets more than you might expect, so don't restate it: `body` is
`font-sans text-sm font-normal bg-background text-foreground`, `html` is antialiased, `*`
gets `border-border outline-ring/50`, and **scrollbars are hidden globally**
(`scrollbar-width: none` plus a `::-webkit-scrollbar` reset). A scroll region needs its
own affordance, such as `scroll-fade-b`.

Shared primitives live in `@kenpathlabs/ui` and import one per file:
`import { Button } from "@kenpathlabs/ui/components/button"`. The same for every file in
`packages/ui/src/components`. Class merging is `cn` from `@kenpathlabs/ui/lib/utils`,
which re-exports the `cn` package (not `clsx` + `tailwind-merge`), so conflicting
utilities are **not** reliably deduped by later-wins order. Build a primitive from scratch
only if `packages/ui/src/components` has no equivalent.

Most primitives are Base UI (`@base-ui/react`); the command palette is `cmdk`, toasts are
`sonner`, and charts are `recharts`. CSS-first for anything that can be CSS.

Extra utility families come from `@import "shadcn/tailwind.css"` and need no setup:
`shimmer` / `shimmer-duration-*` (text shimmer, reduced-motion aware), `scroll-fade-b` /
`scroll-fade-x` (masked scroll edges, scroll-driven), `no-scrollbar`, and the
`data-open:` / `data-closed:` / `data-active:` / `data-selected:` / `data-disabled:`
variants the Base UI primitives are styled with.

Icons are `lucide-react`. `size-3.5` (14px) is the inline icon in product screens;
primitives default their own icons to `size-4`, and sidebar menu buttons force `size-4` on
any child svg. Never introduce a second icon set.

Reach for the binding, never the literal.

## Colors

The scale is semantic, not numeric. What each token is for:

- `background` is the page; `card` and `popover` are the surfaces that sit on it. In light
  mode the page is grey (`#f8f8f8`) and surfaces are white, so a card lifts without a
  shadow. In dark mode that inverts: the page is `#121212` and surfaces are lighter.
- `foreground` is body text. `muted-foreground` is every piece of secondary text:
  timestamps, counts, descriptions, placeholders, the label under a row title. If text is
  not the primary thing on its line, it is `text-muted-foreground text-xs`.
- `muted` is a fill, `muted-foreground` is text; they are not a pair. Row and list hover
  is `hover:bg-muted/40`, and the icon tile in an empty state is `bg-muted`.
- `accent` is the hover tint for sidebar and header affordances (`hover:bg-accent`), the
  selected state in a menu, and, at `/20` through `/60`, the resting fill of a soft card.
  `bg-accent/35` is the house "soft card" fill.
- `primary` is near-black in light and near-white in dark: the default button, a progress
  bar, a "working" status dot, a drop-target border. Hover is `hover:bg-primary/80`.
- `secondary` is the low-emphasis fill (secondary buttons, a neutral "Archived" badge).
- `destructive` signals danger, not merely error. Destructive buttons and badges are
  `bg-destructive/10 text-destructive`, never solid red. Error text is
  `text-xs text-destructive`; the inline error block is
  `rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive`.
- `success` is the positive counterpart. `success-muted` is its fill and
  `success-foreground` is the text that sits on that fill, so a success badge or status
  plate is `bg-success-muted text-success-foreground`, and a bare indicator (a dot, a
  tick) is `text-success` or `bg-success`. There is no warning or info token.
- `brand` is the one accent: the active dock item, the activity graph, and emphasis on the
  game's own numbers. Derive its tints with opacity (`bg-brand/15`). There is no
  `brand-foreground` yet, because nothing puts text on a solid brand fill.
- `frozen` is only the colour of a frozen day (the activity graph, the freeze counter).
- `border` is every hairline. `input` is the border on form controls (a different alpha in
  dark). `ring` is focus only.
- The `sidebar-*` set exists so the rail can be a different tone from the page: white
  against grey in light, `#181818` against `#121212` in dark. Inside the sidebar use the
  `sidebar-*` tokens, and derive its quieter text with `text-sidebar-foreground/60` and
  `/45` rather than reaching for `muted-foreground`.
- `chart-1` … `chart-5` are a blue ramp used only by `@kenpathlabs/ui/components/chart`.

Photographic content gets a pure edge rather than a tinted one:
`outline outline-black/10 dark:outline-white/10` on any user image or thumbnail.

## Typography

One family: `font-sans`, a system stack starting with `-apple-system-body`, so on Apple
platforms the UI inherits the OS body font and its dynamic type size. `html` and `body`
already set `font-sans text-sm font-normal`, so a screen never sets a family.

What covers almost all text:

- `text-lg font-semibold` is the in-page title, in an `<h1>`, and belongs to screens that
  name a record or a collection. A screen named by the shell header does not repeat that
  name in its body.
- `text-xs text-muted-foreground text-pretty` is the one-line page description under it,
  and metadata everywhere.
- `text-sm font-medium` is a row title, card title, section heading, or anything
  clickable-and-named.
- `text-sm` is body copy, form values, menu rows, and table cells.
- `text-xs/relaxed` is card and empty-state body copy.
- `text-xs font-medium text-muted-foreground` is a group or section label.
- `text-base` is reserved for long-form reading and text the user is composing.
- `text-2xl font-semibold tracking-tight` is a hero: a centred landing question or a
  big-canvas dialog title. Use it rarely.
- `tabular-nums` goes on any number that changes in place: tab counts, timestamps, file
  sizes, page numbers.

Long strings are handled, not truncated by accident: `text-balance` on headings,
`text-pretty` on descriptions, `truncate` with `min-w-0` on rows, `line-clamp-2` /
`line-clamp-3` on preview cards.

## Layout

The frame is a `SidebarProvider` (`h-svh overflow-hidden`, 16rem open, 3rem
icon-collapsed, 18rem as a sheet below `md`) plus `SidebarInset`, flush against the
sidebar's `border-r` with no margin, rounding, or shadow. Inside it:

```tsx
<header className="flex h-12 shrink-0 items-center gap-1 border-b px-3">
<main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
```

That `<main>` is the app's single scroller, and the header's `border-b` continues the
sidebar's under-logo separator so the two meet as one line. The sidebar header is
`h-12 px-2 py-0` for exactly that reason. A screen never draws its own top bar.

Page scaffolding:

```tsx
<div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-5 p-6">
```

`p-6` padding, `gap-5` between sections, centred with a container cap that depends on the
screen: `max-w-4xl` for lists, `max-w-5xl` for a wide table, `max-w-3xl` for a reading
column, an editor, or a detail page, `sm:max-w-sm` for an ordinary dialog.

The spacing rhythm inside that: `gap-5` between sections, `gap-3` between a header row and
its controls, `gap-2.5` inside a control cluster, `gap-2` for list rows and inline
clusters, `gap-1` / `gap-1.5` inside a row (title next to badge, icon next to label),
`gap-0.5` between row-action icon buttons.

**Dock frame.** This app does not use the sidebar frame above. Every screen except the
public profile renders in the `(dock)` layout: a centred
`mx-auto flex w-full max-w-120 flex-col gap-5 px-4 pt-6` column (480px), with the document
as the scroller, and a floating pill dock fixed to the bottom. The column's bottom padding,
`pb-[calc(6rem+env(safe-area-inset-bottom))]`, keeps the last line of content above the
dock, so a screen adds no bottom padding of its own.

Mobile: only `sm:` and `md:` are load-bearing, plus `max-sm:` to reveal hover-only actions
on touch. The sidebar becomes a sheet below `md` (a JS breakpoint at 768px, not a media
query). Anything pinned to the bottom pads for the home indicator with
`pb-[calc(1rem+env(safe-area-inset-bottom))]`.

Touch: everything tappable is at least 44x44px on a coarse pointer. `Button` and `Input`
grow to 44px with `pointer-coarse:`, and inputs switch to 16px text so the page does not
zoom on focus. A small inline control (a text link, a toast action) keeps its size and
takes the `tap-target` utility, which centres a 44x44px hit area on it without moving
layout. Toasts sit at the top centre on phones, below the safe area, clear of the dock.

`packages/ui/src/styles/globals.css` scans only the components the app imports (the
`@source` list). Add a component there when you first use it, or its classes are missing.

## Elevation & Depth

The system is close to shadowless. Hierarchy is tonal (page grey vs card white) plus a
hairline edge, and the two edge idioms are not interchangeable:

- `ring-1 ring-foreground/10` is the **elevated-surface** edge: card, dialog,
  alert-dialog, popover, dropdown-menu, context-menu, select, combobox, command,
  hover-card, menubar, navigation-menu. Whisper-thin, and derived from `foreground` so it
  is visible in both themes.
- `border` / `divide-border` groups things **in the flow of the page**, and is also what
  every form control uses (`border-input` on input, textarea, native-select, select
  trigger, input-group; `border-border` on item, attachment, toast, kbd, outline button,
  outline badge). A list is `divide-y divide-border overflow-hidden rounded-xl border
border-border`: one box with hairlines inside it, not a stack of cards.
- `shadow-md` is the menu layer (dropdown-menu, popover, select, hover-card). `shadow-lg`
  is the modal layer (command palette, sheet, toast).
- Modal separation is the overlay, not a shadow: `bg-black/10` with
  `supports-backdrop-filter:backdrop-blur-xs`. An image lightbox is the exception and uses
  `bg-black/70`, because a photo needs a dark room.
- Content scrolling under a pinned control gets a gradient scrim, not a shadow:
  `bg-gradient-to-t from-background from-70% to-transparent`.

Do not add a shadow to give something importance. Change its surface token, or give it a
ring if it floats and a border if it does not.

## Motion

`duration-150 ease-out` is the most common pair, with `duration-200` for something larger
and `duration-300` for a disclosure. Hover and focus changes are `transition-colors`; size
and position changes name their property (`transition-[transform,opacity]`,
`transition-[grid-template-rows]`, `transition-[width]`).

The motion that has a purpose:

- Entrances use `tw-animate-css` utilities, not a library:
  `animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out fill-mode-both`. Rows
  use `slide-in-from-bottom-1`.
- Lists cascade: `130 + Math.min(row, 8) * 45` ms, applied via inline `animationDelay`, so
  the first row lands at 130ms and a long page caps at 490ms. Skip the cascade while a
  search filter is active, because a re-render cascade reads as lag.
- Skeletons show at once, with no delay or fade. On a slow phone a delayed skeleton left the
  first paint empty.
- Overlays open in `180ms` on `cubic-bezier(0.165,0.84,0.44,1)` and close faster, in
  `130ms` on `cubic-bezier(0.4,0,1,1)`, via `data-open:` / `data-closed:`.
- Disclosures animate `grid-template-rows` between `0fr` and `1fr` with `duration-300
ease-out`, paired with `inert={!open}`.
- Controls acknowledge press: `Button` uses `active:translate-y-px` (suppressed on
  `aria-haspopup` triggers so a menu opener does not bounce), while icon-sized affordances
  outside it use `active:scale-[0.96]`.

Always honour reduced motion: anything hand-rolled pairs with
`motion-reduce:transition-none` or `motion-reduce:animate-none`.

## Shapes

Every radius resolves through `--radius: 0.625rem`, so the scale steps by 4px around 10px:

- `rounded-sm` 6px, barely-rounded: tooltips, small chips, inline quotes.
- `rounded-md` 8px, the primitive default: buttons, inputs, badges, cards, skeletons, menu
  items, icon plates.
- `rounded-lg` 10px, softly rounded: the tap target inside a list row, palette rows.
- `rounded-xl` 14px, the dominant container radius: list containers, error blocks,
  attachment tiles, toasts, popovers.
- `rounded-2xl` 18px: dialogs and the command palette, large panels, soft cards,
  dropzones, and the icon tile in an empty state (`size-11 rounded-2xl`).
- `rounded-3xl` 22px: big-canvas dialogs and large floating input surfaces.
- `rounded-full` for pills: status dots, avatars, icon buttons that float, remove buttons.

The pattern is that the further out a surface floats, the rounder it gets, and small
controls inside it stay at 8-14px. Nothing is square; `rounded-none` appears only to undo
an inherited radius. Circles are for controls and indicators, never for content.

## Components

Import them, do not rebuild them. The specs that matter when composing:

**Button** (`variant` × `size`, cva). Variants: `default` (solid `primary`), `outline`,
`secondary`, `ghost`, `destructive` (tinted `bg-destructive/10 text-destructive`, not
solid), `link`. Sizes: `xs` 24px, `sm` 28px, `default` 32px, `lg` 36px, and the square
`icon-xs` 24px / `icon-sm` 28px / `icon` 32px / `icon-lg` 36px. All compact by design,
and at least 44x44px on touch.
Focus is `focus-visible:border-ring focus-visible:ring-1 ring-ring/50`, press is
`active:not-aria-[haspopup]:translate-y-px`, disabled is `opacity-50 pointer-events-none`.
Icons are sized automatically; mark leading and trailing icons with
`data-icon="inline-start"` / `data-icon="inline-end"` so the button tightens that side's
padding. To render a button as a menu trigger, pass `render={…}` (Base UI's render prop,
not `asChild`). A link styled as a button is `<Link className={buttonVariants(…)}>`: the
render form gives the `<a>` `role="button"`.

**Input** 32px, `rounded-md`, transparent background, `border-input`, `text-xs`; 44px and
16px text on touch. A search
field is an `Input` with `className="pl-7.5"` and an absolutely positioned
`pointer-events-none size-3.5 text-muted-foreground` icon at `left-2.5 top-1/2
-translate-y-1/2`, inside a `relative w-44 sm:w-56` wrapper. **Textarea** is `min-h-16`
and `text-xs` (not `text-sm`), `field-sizing-content`, so a raw-text editor is a
`Textarea` with `className="font-mono text-xs"`.

**Card** `Card` / `CardHeader` / `CardTitle` / `CardDescription` / `CardAction` /
`CardContent` / `CardFooter`. Body text is `text-xs/relaxed`, internal spacing comes from
`--card-spacing` (16px, 12px with `size="sm"`), so set padding through that variable and
not with `p-*`. Prefer a bordered `<ul>`, a `rounded-xl border` section, or a
`bg-accent/35 rounded-2xl` soft card when the content is a list or a group.

**Badge** 20px, `rounded-md`, `text-xs font-medium`. `secondary` for a neutral state
("Archived"), `outline` for a qualifier ("Paused", "Owner"), `destructive` for a failure,
`bg-success-muted text-success-foreground` for a positive state, and `brand`
(`bg-brand/15 text-brand`) for the one standout rank, `da goat`. Hover only applies
to link badges.

**Dialog** / **AlertDialog** `rounded-2xl`, `p-6`, `gap-5`, `sm:max-w-sm`, ringed, with a
`ghost` `icon-sm` close button at `top-4 right-4`. `DialogTitle` is
`text-lg font-semibold`, `DialogDescription` is `text-sm/relaxed text-muted-foreground`.
Footers are `flex-col-reverse gap-2 sm:flex-row sm:justify-end`, so the primary action is
last in DOM order and rightmost on desktop. Widen with `sm:max-w-lg` / `sm:max-w-xl` when
a form needs it. Use `AlertDialog` for destructive confirmation, with the object named in
the title and the consequence in the description.

There is a second, larger dialog dialect for a create-or-upload canvas:
`rounded-3xl p-8 gap-6 sm:max-w-xl` (or `sm:max-w-3xl`), a `text-2xl font-semibold`
title, and `h-10 rounded-xl` footer buttons. Use it only for a step-through flow with a
dropzone or a grid of choices.

**Empty** `Empty` / `EmptyHeader` / `EmptyMedia` / `EmptyTitle` / `EmptyDescription` /
`EmptyContent`. The house form of the media slot is
`<EmptyMedia variant="icon" className="size-11 rounded-2xl [&_svg]:size-5">`.

**Skeleton** `animate-pulse rounded-md bg-muted`; screens override to `rounded-xl` and
size it to the row it stands in.

**Spinner** 16px spinning icon with `role="status"`. Inside a button, pass
`data-icon="inline-start"` and swap it in for the leading icon while pending.

**Tabs** always `<TabsList variant="line">`, rendered only when more than one tab is
populated, with the count beside the label as
`<span className="text-muted-foreground tabular-nums">`, never a badge.

**Table** `<Table className="table-fixed text-sm">`, fixed column widths in a local `COL`
map, `TableRow className="hover:bg-transparent"` on header rows, heads
`text-sm font-medium text-muted-foreground` with `hidden sm:table-cell` on the columns
that drop on mobile, cells `py-2.5`. A sortable head is `TableHead className="p-0"`
wrapping a full-bleed `h-10` button whose arrow is `opacity-0 group-hover:opacity-60`
until active.

**Tooltip** wrap the app in `<TooltipProvider delay={400}>`. Content is inverted
(`bg-primary text-primary-foreground`), `rounded-sm`, `px-3 py-1.5 text-xs`. A `Kbd`
inside a tooltip inverts itself automatically.

**Sidebar** compose with `SidebarGroup` / `SidebarGroupLabel` / `SidebarMenu` /
`SidebarMenuItem` / `SidebarMenuButton`. Group labels are
`text-sm text-sidebar-foreground/60`; the active state comes from
`isActive` (`data-active:bg-sidebar-accent data-active:font-medium`), never from a
hand-written class. `SidebarMenuButton variant="outline"` is the search-field look.

**Toaster** Sonner, mounted once in `providers.tsx` with `richColors`, themed to
`background` / `border` / `shadow-lg` / `rounded-xl`.

**Avatar** always circular with a `border-border` faux ring.

Raw text and commands are `font-mono text-xs`: a command block is
`rounded-md bg-muted px-2 py-1.5 font-mono text-xs whitespace-pre-wrap` on a `<code>`.

## Patterns

**Index page.** Every list screen is the same five blocks in the same order, inside
`mx-auto flex w-full max-w-4xl flex-1 flex-col gap-5 p-6`:

1. Header row: `flex flex-wrap items-start justify-between gap-3`. Left is a
   `flex flex-col gap-1` with (optionally) an `<h1>` and a
   `text-xs text-muted-foreground text-pretty` one-line description of what the screen is
   for. Right is a `flex items-center gap-2` with the search field, filters, and the
   primary action.
2. `<TabsList variant="line">` with counts, rendered only when there is more than one
   populated tab.
3. Loading: three `Skeleton` rows sized like the real rows, delayed 500ms.
4. Error: the inline `border-destructive/30 bg-destructive/5` block with a fallback
   message.
5. Success: the list, or a search-specific empty state ("No matches" with a Clear search
   button), or the tab's own empty state. Check the search-empty branch first.

**List rows.** A list is one bordered box, not a stack of cards:

```tsx
<ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
  <li className="group flex items-center gap-2 px-3 transition-colors hover:bg-muted/40 focus-within:bg-muted/40">
    <Link className="flex min-w-0 flex-1 flex-col gap-1 rounded-lg py-3 outline-none focus-visible:ring-1 focus-visible:ring-ring">
      <span className="flex items-center gap-2">
        <span className="min-w-0 truncate text-sm font-medium">{title}</span>
        <Badge variant="outline">{qualifier}</Badge>
      </span>
      <span className="truncate text-xs text-muted-foreground tabular-nums">{meta}</span>
    </Link>
    <RowActions />
  </li>
</ul>
```

Note the split: the `<li>` owns padding, hover, and the group; the `<Link>` owns the
vertical padding and the focus ring, so the whole row highlights but only the link is
focusable.

**Row actions.** Icon-only `ghost` buttons that appear on hover and stay visible on touch,
each wrapped in a `Tooltip` whose content is the same string as its `aria-label`:

```tsx
<div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 max-sm:opacity-100">
```

Colour by consequence: `text-muted-foreground hover:text-foreground` for ordinary actions,
`hover:text-destructive` for delete. Inside the sidebar the same idea uses the named group
(`group-hover/menu-item:opacity-100 group-has-focus-visible/menu-item:opacity-100
md:opacity-0`), because touch has no hover.

**Grouped lists.** Group by recency into `Today` / `Yesterday` / `Previous 7 days` /
`Older`, each a `<section className="flex flex-col gap-2">` with an
`<h2 className="text-xs font-medium text-muted-foreground">` above its own bordered
`<ul>`, and `gap-5` between groups.

**Detail page.** A back link
(`inline-flex w-fit items-center gap-1.5 rounded-md py-1 text-xs text-muted-foreground
hover:text-foreground`), a title block (`h1` `text-lg font-semibold text-balance` plus a
status `Badge`, then a `text-xs text-muted-foreground tabular-nums` line), an action row,
then sections. A section is `flex flex-col gap-3 rounded-xl border border-border p-4` with
an `h2` of `text-xs font-medium text-muted-foreground`. Key/value data is a
`<dl className="grid gap-x-6 gap-y-3 sm:grid-cols-[10rem_1fr]">` whose rows are
`className="contents"`.

**Action rows.** `flex flex-wrap items-center gap-2`, primary first, `outline` for the
rest, and the destructive action pushed to the far edge with
`variant="destructive" className="ml-auto"`. One shared `busy` flag disables the whole
cluster. On an editor page the row is primary then `variant="outline"` "Discard changes",
both disabled until the draft is dirty.

**Filters.** `Select` (or `NativeSelect`) at `size="sm"` with an `aria-label`, in a
`flex flex-wrap items-center gap-2` row, with the popup content always
`align="start" alignItemWithTrigger={false}`. Search is debounced 180ms with a minimum
query length, not searched per keystroke.

**Async state.** Every screen branches `isPending` → skeleton, `isError` → inline message
with a fallback, `isSuccess` → content or empty state. Index pages inline those three with
`&&`; detail pages early-return a full page per state and add a fourth "not found" branch
after `isSuccess`. Mutations disable their trigger, swap the leading icon for a `Spinner`,
and target a single row by comparing `mutation.variables === row.id`.

## Voice & Content

Sentence case everywhere, in headings, buttons, labels, and toasts. No title case, no
exclamation marks, no emoji.

- Buttons are a verb or a short verb phrase: `Save`, `Restore`, `Run now`, `Upload`,
  `Clear search`, `Clear filters`, `Discard changes`, `Done`, `Next`, `Back`. A
  destructive confirmation states what it does: `Delete permanently`, `Delete project`,
  never `Confirm`.
- Errors are `Could not <verb> <object>.`, a full sentence with a period:
  `Could not load your projects.`, `Could not save changes.` Never blame the user, never
  show a raw status code, never say "Oops" or "Something went wrong".
- Where an error has a fix, the sentence carries it: `This changed somewhere else. Reload
to get the latest version, then reapply your edits.`
- Success toasts are terse fragments with no period: `Project deleted`, `Uploaded 3 files`.
  Only confirm what the user cannot see for themselves; do not toast a visible change. A
  toast may carry a consequence as a second sentence when there is one.
- Counts inline their own pluralisation: `${n} file${n === 1 ? "" : "s"}`. There is no i18n
  layer.
- Page descriptions are one line, second person, saying what the screen is for.
- Empty states are a short noun phrase title plus one sentence explaining what will fill
  it: `No files yet` / "Upload a document to get started."
- Placeholders use the ellipsis character: `Search…`, `Uploading 2/3…`. Never `...`.
- Curly quotes for interpolated user content: `Delete “{name}”?`,
  `Nothing here matches “{query}”.` Curly apostrophes in prose: `aren’t`.
- `·` is the metadata separator on every meta line (`{size} · {date}`). `—` stands in for
  an absent value.
- Lowercase machine-ish values pass through unstyled and unmodified: `never`,
  `one-time`, `every 15m`.
- Every icon-only control has an `aria-label`, and its tooltip repeats that exact string.

## Do's and Don'ts

- Do reference tokens through their utility. No raw hex, no `rounded-[10px]`.
- Do treat the theme as achromatic. `destructive`, `success`, `brand` and `frozen` are the
  only hues with a meaning; a new hue needs a new meaning, not a new screen.
- Do derive shades with an opacity modifier (`bg-muted/40`, `bg-accent/35`,
  `border-destructive/30`) instead of adding a colour.
- Do use `ring-1 ring-foreground/10` for a surface that floats and a `border` for one that
  sits in the page. Don't add a shadow for emphasis, and don't put a ring on a form
  control.
- Do import from `@kenpathlabs/ui/components/*`. Don't hand-roll a button, input, dialog,
  skeleton, table, or empty state. If a primitive is close but wrong, add a variant to it
  rather than a wall of `!` overrides at the call site.
- Do keep the body size at `text-sm` and metadata at `text-xs`. Don't introduce arbitrary
  pixel sizes, and never write `text-[12px]`, which is `text-xs`.
- Do pair `truncate` with `min-w-0`, and give headings `text-balance` and descriptions
  `text-pretty`.
- Do give every hand-rolled animation a `motion-reduce:` escape, and name the properties a
  transition applies to instead of using bare `transition-all` on layout.
- Do use `render={<Link />}` on Base UI primitives. `asChild` is not the API here.
- Don't rely on later-wins class ordering to override a primitive: `cn` here is not
  `tailwind-merge`, so conflicting utilities both ship and specificity decides.
- Don't mix radius families on one surface: a 14px container holds 8px controls, and a
  22px surface holds pill buttons.
- Don't use `success` to confirm an action the user just took. That is a toast. `success`
  marks a state that persists (a passing check, a completed job).
- Don't add a scrollbar affordance by styling one: scrollbars are hidden globally. Use
  `scroll-fade-b` or a scroll-to-bottom button.
