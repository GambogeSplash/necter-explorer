# Necter Explorer — Style Guide

**Read this BEFORE writing any UI code.** This file is the single source of truth for design tokens and patterns. If you're tempted to invent something new (a new radius, a new font size, a new card variant), check here first. If it's not in this file, default to the existing token unless you have a written reason to deviate.

---

## 1. Colors — complementary 4-color palette

| Token | Hex | Use |
|---|---|---|
| **Gold** | `#FFC933` | Brand accent. **Max 3 uses per page.** Active nav, #1 ranks, hero metric, "hot" indicators. |
| **Green** | `#22C55E` | Positive. Up, active, healthy, success. |
| **Red** | `#EB5757` | Negative. Down, slashed, critical, error, warning. |
| **Blue** | `#6E9FFF` | Secondary accent (complement to gold). Links, info, ZK proofs, neutral data accents. |
| Grayscale | `text-foreground` / `text-muted-foreground` / `bg-card` / `bg-secondary` / `border-border` | Everything else. |

**Forbidden:**
- ❌ Orange `#F2994A` — analogous to gold, they fight. Fold into red or muted gray.
- ❌ Purple `#9985FF` — too close to blue, redundant. Use blue.
- ❌ Any hex not in the table above for primary content. (Chart-specific extra colors are OK with explicit reason.)

---

## 2. Typography scale

| Role | Tailwind class | Use |
|---|---|---|
| Page title (h1) | `text-xl font-semibold tracking-tight` | One per page, top of content. |
| Section/card title (h2) | `text-sm font-medium` | Inside cards, above tables, above charts. |
| Sub-heading (h3) | `text-[13px] font-medium` | Within cards, secondary groupings. |
| Body | `text-sm` (14px) | Default text in tables, descriptions. |
| Body small | `text-[13px]` | Dense table rows, secondary content. |
| Caption | `text-[11px] text-muted-foreground` | Hints, helper text. |
| Micro / label | `text-[10px] uppercase tracking-[0.06em] text-muted-foreground` | Column headers, status pills, badge labels. |
| Mono data | `font-mono-data tabular-nums` | Hashes, numbers, addresses, money. ALWAYS pair with `tabular-nums`. |
| Big mono | `text-[18px] font-semibold font-mono-data` | Stat values inside cards (matches `StatCard` component). |
| Hero metric | `text-2xl font-semibold font-mono-data` | Big-number callouts on detail pages (Address Balance, Gas Price, Treasury). Use sparingly. |
| Mega metric | `text-3xl font-semibold font-mono-data` | Reserved for the single most-important number on a page (homepage cycle, gas station price tiers). |

**Rules:**
- ❌ No `text-[22px]` or other arbitrary large h2s. Use `text-sm` or `text-xl` (h1 only).
- ❌ No `font-bold`. Use `font-semibold` (or `font-medium` for labels).
- ❌ No italic. Anywhere. The site has `* { font-style: normal; }` in globals to enforce this.
- ❌ No `"Satoshi"` font reference. Use the Geist stack via `var(--font-geist)`.

---

## 3. Spacing scale

| Where | Class |
|---|---|
| Page wrapper vertical rhythm | `space-y-4` (16px between top-level children) |
| Card internal padding | `p-5` (20px) standard, `p-4` (16px) for tight, `p-3` (12px) for chips |
| Card header strip | `px-5 py-3` |
| Table row | `px-5 py-2.5` (desktop) |
| Grid gap between cards | `gap-3` (12px) |
| Section gap (rare, between major page chunks) | `gap-4` |
| Stat row gap | `gap-3` |

**Rules:**
- Page wrapper is always: `max-w-[1480px] mx-auto px-2.5 py-2 space-y-4`
- ❌ No `space-y-3` or `space-y-6` at the page level. Always `space-y-4`.
- ❌ No `<section className="py-5 border-t border-border">` separators. Sections live inside the flat `space-y-4` flow.

---

## 4. Corner radii

| Element | Radius |
|---|---|
| Cards (`bg-card border border-border`) | `rounded-lg` (8px) |
| Buttons (default, including search input, nav buttons) | `rounded-md` (6px) |
| Status pills, badges, small chips | `rounded` (4px) or `rounded-sm` (2px) |
| Avatars (small thumbnails) | `rounded-sm` |
| Pulsing dots, dot indicators | `rounded-full` |
| Tiny decorative elements (heatmap cells) | `rounded-[2px]` |

**Forbidden:**
- ❌ `rounded-xl` (12px) — outlier, never use. Use `rounded-lg`.
- ❌ `rounded-full` for buttons or inputs. Use `rounded-md`.
- ❌ Custom `rounded-[Npx]` values without strong justification.

---

## 5. Components — REUSE, don't reinvent

**If a component exists, use it. Do NOT inline a custom version.** Run `ls src/components/` before inventing anything.

| Need | Component | Path |
|---|---|---|
| KPI / summary card | `<StatCard />` | `@/components/stat-card` |
| Truncated hash with hover-expand | `<HashLink />` | `@/components/hash-link` |
| Status pill (active / inactive / slashed / etc.) | `<StatusBadge />` | `@/components/status-badge` |
| Pagination control | `<Pagination />` | `@/components/pagination` |
| Mobile fallback for tables | `<MobileCard />` | `@/components/mobile-card` |
| Time-ago string | `<TimeAgo />` | `@/components/time-ago` |
| Page browser-tab title | `<PageTitle />` | `@/components/page-title` |
| Sortable column header in tables | `<SortableHeader />` | `@/components/sortable-header` |
| Filter dropdowns row above tables | `<FilterBar />` | `@/components/filter-bar` |
| Animated counting numbers | `<CountUp />` | `@/components/count-up` |
| Tab switcher (use the CSS classes) | `n-tabbar` / `n-tabbar-btn` / `n-tabbar-btn--active` | `globals.css` |
| Buttons | `n-btn` / `n-btn--primary` / `n-btn--sm` | `globals.css` |

**Anti-pattern:** if you write `<div className="bg-card border border-border rounded-lg p-4 ..."` followed by a label, an icon, and a value — **stop**. You're rebuilding `StatCard`. Import it.

---

## 6. Page layout template

Every list/index page follows this skeleton:

```tsx
<div className="max-w-[1480px] mx-auto px-2.5 py-2 space-y-4">
  <PageTitle title="Page Name" />

  {/* Header — h1 + optional live indicator */}
  <div className="flex items-center justify-between">
    <h1 className="text-xl font-semibold tracking-tight">Page Name</h1>
    {/* optional right-side: live badge, status pulse */}
  </div>

  {/* Stats — exactly 4 StatCards in a 2/4 grid */}
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
    <StatCard ... />
    <StatCard ... />
    <StatCard ... />
    <StatCard ... />
  </div>

  {/* Optional signature visual (chart, map, pipeline) */}
  <div className="rounded-lg border border-border bg-card p-5">
    {/* card content */}
  </div>

  {/* Main table card */}
  <div className="rounded-lg border border-border bg-card overflow-hidden">
    {/* Header strip: title left, controls right */}
    <div className="flex items-center justify-between px-5 py-3 border-b border-border">
      <h2 className="text-sm font-medium">Section Title</h2>
      <div className="flex items-center gap-3">
        {/* tabs, search, filter chips */}
      </div>
    </div>
    {/* Table */}
  </div>
</div>
```

---

## 7. Card patterns

**Card with header strip + table:**
```tsx
<div className="rounded-lg border border-border bg-card overflow-hidden">
  <div className="flex items-center justify-between px-5 py-3 border-b border-border">
    <h2 className="text-sm font-medium">Title</h2>
    <span className="text-[11px] text-muted-foreground">meta</span>
  </div>
  {/* table or list */}
</div>
```

**Card with internal padding (charts, dashboards):**
```tsx
<div className="rounded-lg border border-border bg-card p-5">
  <h2 className="text-sm font-medium mb-4">Title</h2>
  {/* content */}
</div>
```

**Empty state inside a table card:**
```tsx
<div className="px-5 py-12 text-center">
  <p className="text-sm text-muted-foreground">No results match.</p>
  <button onClick={clear} className="mt-2 text-[11px] text-primary hover:underline">
    Clear filter
  </button>
</div>
```

---

## 8. Icons

- Library: **lucide-react only.** No other icon libraries.
- Inline icon size: `h-3.5 w-3.5` (small contexts) or `h-4 w-4` (table rows, buttons).
- StatCard icons: `h-3.5 w-3.5 text-muted-foreground` (handled by component).

**Forbidden:**
- ❌ **Icons beside h1, h2, or h3 titles.** The text is the differentiator. Decorative icons next to titles are clutter.
- ❌ Icons inside section header bars (`px-5 py-3 border-b border-border`) unless they're functional (e.g., a status pulse dot).
- ❌ 3D illustrations (`/brand/3d/*.png`) anywhere except hero banners and error states.

---

## 9. Tables

- Desktop: `<div className="hidden md:block">` with grid columns.
- Mobile: `<div className="md:hidden p-3 space-y-3">` with `<MobileCard>`.
- Column headers: `text-[10px] text-muted-foreground uppercase tracking-[0.06em]`
- Row hover: `hover:bg-secondary/30 transition-colors`
- Always include pagination via `<Pagination />`.
- Always include an empty state when filterable.

---

## 10. Anti-patterns — things I keep doing wrong

1. ❌ Inventing a custom hero strip or stat row instead of using `<StatCard />`
2. ❌ `text-[13px] font-medium` for h2 instead of `text-sm font-medium`
3. ❌ `text-[22px] font-semibold` for section titles (only h1 is xl, h2 is sm)
4. ❌ `rounded-xl` cards
5. ❌ `<section className="py-5 border-t border-border">` separators between page sections
6. ❌ Decorative icons beside title text
7. ❌ `space-y-3` or `space-y-6` at the page level (always `space-y-4`)
8. ❌ Using orange or purple anywhere
9. ❌ Custom inline `Sparkline` or other "components" — check `src/components/` first
10. ❌ `font-bold` (use `font-semibold`)
11. ❌ Italic anywhere (globals enforces normal)
12. ❌ Forgetting `tabular-nums` next to `font-mono-data` for aligned numbers

---

## 11. Workflow before any UI change

1. **Read this file.** All of it. It's <300 lines.
2. **`ls src/components/`** to see what already exists.
3. **`grep -rn "<StatCard"` or similar** to see how it's being used elsewhere.
4. **Match an existing page.** If you're building a new list page, copy the skeleton from `src/app/blocks/page.tsx` or similar — don't reinvent the wrapper.
5. **Only invent if no equivalent exists** — and write a one-line comment explaining why.

If you find yourself writing a new utility function, a new color hex, a new font size, or a new layout pattern: **stop and check this file**. The point of a system is that constraint produces consistency.
