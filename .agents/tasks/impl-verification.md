# Implementation verification

## Pass 2: fixes for implementation review 1 (IR1-1 to IR1-5)

`impl-review.json` (verdict CHANGES_REQUESTED) existed, so this pass fixed its five findings. No new increment was started. Increment 2 is next.

### What changed
| Finding | Change |
|---|---|
| IR1-1 (blocking) | `client/src/index.css`: `@import "./theme/base.css" layer(base);`, and the unlayered `button, input, select { font: inherit }` and `button { border: 0 }` resets were deleted. Preflight applies the same rules inside `@layer base`. New browser check: `audit-tools/primitive-cascade.mjs`. |
| IR1-2 (blocking) | `audit-tools/inpage.js` `overflow(deviceWidth)` now compares `scrollWidth` with the emulated width the driver passes in (fallback: `visualViewport.width`), and lists culprit elements by right edge. `inc-check.mjs` runs at 1280×800, 390×844, **768×1024** and **1536×900**, and prints every overflowing view. The false "no horizontal overflow" line in pass 1 is corrected below. |
| IR1-3 | Both contrast regressions (brand mark, Department hero) are listed under "Not verified" below. Ownership was added to proposal §16: increment 2 for the brand mark, 4a for the Department hero. |
| IR1-4 | `index.css`: `.head-card span` became `.head-card span:not(.avatar)` in both rules. The sidebar initials "AM" now get the normal `.avatar-saffron` style: #915F1B on #F9DDB0, 4.15:1 at 9 px (was #8A8A82, 2.65:1). This is the same legacy avatar scale as every other avatar until it is ported. The scoping goes away when the Sidebar moves to `PersonAvatar` in increment 2 (noted in §16). |
| IR1-5 | Added to proposal §16: 768 px My feed overflow → 4a, the same markup in Notices & feedback → 4c, Access matrix at 768 → 4d. |

### Commands run (in `jambavan-app/`; `pnpm` is not on PATH, so `corepack pnpm@10.18.0 …`)
| Command | Result |
|---|---|
| `check` (`tsc --noEmit`) | exit 0 |
| `test` (`vitest run`) | 9 files, **153 tests passed** |
| `build` | ✓ built; JS 1,296 kB (gzip 255 kB); 11 woff2 files. In the built CSS, `:focus-visible` and the button resets are no longer top-level (unlayered) rules, and `@layer base` holds base.css. |
| `curl http://localhost:3000/` | 200. The existing dev server was not restarted. |

### Browser evidence (headless Chrome over CDP, dev server on :3000)
- **Primitive cascade check** (`node primitive-cascade.mjs`, run at 1280×800 and 390×844): **PASS**. The real `Button`, `IconButton`, `ToggleButton`, `Input`, `Select` and `Textarea` are imported from the dev server and rendered into an 11 px / 400 host. Measured:
  - Button 15 px / 600, `leading-none` = 15 px, Mukta, 1 px solid stone-500 border. `sm` is 14 px with a 36 px minimum height at 1280 and 44 px at 390.
  - IconButton 44 px with its border. ToggleButton 15 px / 500 with its border.
  - Input, Select and Textarea at 16 px with their borders; Input 44 px tall; Textarea 24 px line height.
  - A focused Input shows the blue-700 border and the 3 px ring, with **no** outline. A focused Button shows the 2 px blue-700 outline.
  - **Negative control:** with only the `layer(base)` reverted, the same check FAILS (11 px / 400, 13.2 px leading, Input focus with a double outline). After restoring the layer it passes again.
- **Computed-style equivalence for legacy views** (`node style-snap.mjs`): the computed style of every element, plus the focus outline and shadow of every focusable element, across 13 views and 12 modals at 1280 and 390 (50 surfaces).
  - The fingerprint is deterministic: two captures before the fix were IDENTICAL.
  - Before vs after IR1-1: the **only** difference is `border-top-style: none → solid` on 0-width button borders (1,846 elements). That comes from preflight's `border: 0 solid`. It renders nothing: no border width, size, font, outline or focus value changed anywhere.
  - After IR1-1 vs after IR1-4: the only differences are the sidebar initials span (colour #8A8A82 → #915F1B, `display: block → grid`, `margin-top: 3px → 0`) and the head card's height (62 → 59 px), on all 50 surfaces.
- **DOM equivalence** (`node equiv.mjs ir1`, then `node equiv-diff.mjs inc1 ir1`): **IDENTICAL**, with 0 console entries. The checkpoint features (My Day, blocker check-in, dependencies, handover) behave as before.
- **Smoke check** (`node inc-check.mjs ir1`, 13 views × 4 widths, screenshots in `screenshots/ir1/`): 0 console errors or warnings, 0 failed requests, 0 broken images. Body font is Mukta at every width. With `prefers-reduced-motion: reduce`, 0 of 2,034 elements have a transition or animation longer than 0.01 ms, so the kill switch still wins from `layer(base)`.
  - **Horizontal overflow, measured against the emulated width (4 view/width pairs, all pre-existing in the baseline CSS and owned by later increments):**
    - 390: Dashboard 609 px (`.reward-card`, `.planner-card`) → 4a (B5)
    - 390: Access matrix 766 px (`.access-matrix-hero`, `.access-matrix-card`, `.access-matrix-footer`) → 4d (B5)
    - 768: My feed 849 px (`.hanuman-mini-list`) → 4a; the same markup moves to Notices & feedback in increment 2 → 4c
    - 768: Access matrix 996 px (same elements) → 4d
    - 1280 and 1536: none. At 1536, `innerWidth` was 1536.
  - The raw data shows why the old probe was blind. At 390, `innerWidth` read 390, 609 or 766 depending on the view, while `visualViewport.width` stayed 390.
- Evidence files in `audit-tools/`: `primitive-cascade.json`, `style-pre.json`, `style-ir1-1.json`, `style-ir1-4.json`, `equiv-ir1.json`, `inc-check-ir1.json`.

### Not verified in this pass
- The Dialog focus trap, Escape and return focus are still untested in a browser, because nothing renders `Dialog` yet. Increment 2 must cover them; `primitive-cascade.mjs` can be extended to do it.
- The audit tools are not yet promoted to `scripts/ui-audit/`. That happens in increment 2, now with the fixed probe.

---

## Pass 1 (increments 0 and 1)

`impl-review.json` did not exist, so this was the first implementation pass. Increments 0 and 1 of §16 are done. Increment 2 is next.

## What changed

### Increment 0: extraction with identical behaviour
- Split the 1226-line `client/src/pages/Home.tsx` into `client/src/components/jambavan/`:
  - `state/`: `types`, `seed`, `format`, `dependencies` (with `findBlockingDependency` moved verbatim and `wouldCycle` made pure), `exports`, `useJambavanStore` (all state and handlers, same names), `JambavanProvider`, `MyDayProvider`
  - `layout/`: `AppShell`, `Sidebar`, `Topbar`, `PageHeader`, `Toast`, `navItems`
  - `views/`: 13 views plus `TrendChart`
  - `task/`: `TaskCard`, `TaskDialog`, `HandoverDialog`, `AttachmentDialog`, `StatusIcon`
  - `modals/`: 7 legacy dialogs
  - `art/Avatar`
- `Home.tsx` is now the composition root.
- The code was moved by a generator script that copies lines verbatim: `.agents/tasks/impl-tools/gen_inc0.py`. The untouched originals are in `.agents/tasks/baseline-5f248af/`.
- **My Day boundary (IA-10).** My Day state lives only in `MyDayProvider`. The only components that use `useMyDay()` are `MyDayView` and the TaskCard's "Add to My Day" control.
- **No git.** The task said "no git", so the proposal's `git init` and baseline commit were not done. The baseline copy above replaces them.

### Increment 1: tokens, fonts and base components
- **Theme files** in `client/src/theme/`:
  - `tokens.css`: the `--jb-*` colour, type, space, radius, elevation and motion tokens, plus Tailwind `@theme`. The shadcn variables now point at these tokens.
  - `base.css`: focus ring, reduced-motion kill switch, `.sr-only` and `.jb-sacred`.
  - `legacy-aliases.css`: the old Monsoon Ledger variable names, mapped onto the new tokens. Their old definitions were deleted from `index.css`.
  - `fonts.css`, `setu.ts` and `contrast.ts`.
- **Fonts.** Added exactly `@fontsource/mukta`, `@fontsource/cormorant-garamond` and `@fontsource/tiro-devanagari-hindi`, each pinned at 5.3.0 with `pnpm add -E`, so the lockfile is updated.
  - This deviates from the proposal: `fonts.css` replaces the proposed `fonts.ts`. In 5.3.0 the per-subset CSS files have no `unicode-range`, so importing two subsets would break.
  - `fonts.css` declares only the needed faces, each with `unicode-range`: Mukta 400–700 (latin and devanagari), Cormorant Garamond 600/700 (latin) and Tiro Devanagari Hindi 400 (devanagari).
  - The build emits exactly those 11 woff2 files.
- **Primitives** in `components/jambavan/primitives/`:
  - `Button` and `IconButton` (its `aria-label` is required by the type)
  - Field family: `Field`, `Input`, `Select`, `Textarea`, `CheckboxRow`, `ToggleButton`
  - Badge family: `FamilyBadge`, `SourceBadge` (uses `sourceLabel`), `StatusBadge`, `PriorityBadge`
  - `Card`
  - `Dialog`, with a scrolling body, a sticky footer, an error slot, focus on the first invalid field and `aria-modal`
  - `dialogRegistry`, which provides `useRegisterOpenDialog` and calls `toast.dismiss()` when the open-dialog count goes from 0 to 1. It is a tiny external store rather than context, so `notify()` can read it synchronously in increment 2.
  - `ConfirmDialog`, `EmptyState` and `InlineError`
- **Other new components:**
  - `icons/RamayanaIcons`: symbols only, no figures
  - `art/PersonAvatar`: initials avatar with an `onError` fallback
  - `progress/RamSetuProgress`, including the `from` prop
- **State modules:**
  - `clock.ts`: `TODAY_LABEL`, `NOW_LABEL`, `TODAY_ISO`, `TODAY_LONG`, `todayIso()`
  - `identity.ts`
  - `selectors.ts`: IA-7, §10.1, `isHanumanMission`, `reflectionFor` verbatim, `sourceLabel`, and the `Project` type
  - Nothing renders these yet, as the plan says.
- **Fixes:**
  - F8: `maximum-scale=1` removed from the viewport meta; theme-color is now `#7A1E2C`.
  - F11: `peoplePhotos` and both `/manus-storage` CSS backgrounds removed. Avatars now show initials.
  - F9 (Role matrix keyed Fragment) was pulled forward from increment 4d, so the app now logs **0** console errors.
- **Tests.** `vitest.config.ts` now includes `client/src/**/*.test.ts(x)` and uses `esbuild.jsx = "automatic"`. Component tests use `react-dom/server` and need no new dependencies.

## Commands run (in `jambavan-app/`, with `corepack pnpm@10.18.0`, because `pnpm` is not on PATH)

| Command | Result |
|---|---|
| `check` (`tsc --noEmit`) | exit 0 |
| `test` (`vitest run`) | **9 files, 153 tests passed**. Before this pass: 2 files, 6 tests. |
| `build` | ✓ built. JS 1,296 kB (gzip 255 kB), CSS 232 kB, 11 font files |
| `curl http://localhost:3000/` | 200. The existing dev server was not restarted. |

New test files: `theme/setu.test.ts`, `theme/contrast.test.ts`, and in `state/`: `selectors.test.ts`, `identity.test.ts`, `dependencies.test.ts` and `clock.test.ts`, plus `primitives/primitives.test.tsx`.

They cover:
- every value the seed should produce: 43%, 3 active, my open tasks 4 (2 due today), needs attention 2 (1 · 2), team follow-ups 9, reminders 6, projects 34/0/24, institute 69, and the three `reflectionFor` lines
- the 53% → 87% → 100% sequence, and that completion never lowers progress
- Setu stone and stage boundaries
- the contrast allowlist and forbidden pairs
- identity aliases and the 11 owner options
- `wouldCycle` and `findBlockingDependency` on the seed chain
- markup and ARIA of the primitives
- that no source file references `/manus-storage`

## Browser evidence (headless Chrome over CDP, dev server on :3000)

**Equivalence gate (§13.3), checked against a baseline captured on the untouched app before any edit.** The baseline was captured twice to confirm the fingerprint is deterministic: `equiv-baseline` vs `equiv-baseline2` was IDENTICAL. The fingerprint covers:
- the DOM of all 13 views and 14 modals
- a scripted sequence: complete, add subtask, archive, post update, blocker, notice, hand task 2 over to Manav Shah, create a task that depends on task 2, MOM, then the Dashboard, audit log and notifications
- a My Day sequence

Results:
- **After increment 0:** `node equiv-diff.mjs baseline inc0` → **IDENTICAL**. This ignores only the dev-only `data-loc` file-path attribute. The baseline's console error (the B11 key warning) still reproduced, as expected.
- **After increment 1:** 34 HTML fingerprints were compared. **0 differ** once avatar spans are normalised. The only DOM change is F11: the broken `<img src="/manus-storage…">` became initials. Audit text is the same apart from the visible initials.
- The My Day sequence adds no audit entry and no notification, both before and after.
- Console errors: baseline 1 (B11), after increment 1 **0**.

**Smoke check** (`audit-tools/inc-check.mjs inc1`) across 13 views at 1280×800 and 390×844:
- 0 console errors or warnings, 0 failed requests, 0 broken images
- **Correction (IR1-2):** pass 1 said "no horizontal overflow". That was wrong. The probe compared `scrollWidth` with `innerWidth`, which both widen under mobile emulation, and its own JSON showed Dashboard 609 px and Access matrix 766 px at 390. The fixed probe's results are in pass 2 below.
- `body` font-family is Mukta, and Mukta latin and devanagari load
- Screenshots: `.agents/tasks/screenshots/inc1/` (26 PNGs)

Tools (temporary, promoted to `scripts/ui-audit/` in increment 2): `audit-tools/equiv.mjs`, `equiv-diff.mjs` and `inc-check.mjs`. Their output is in `equiv-*.json` and `inc-check-inc1.json`.

## Not verified, and known interim state
- **Primitives in the browser.** The Dialog primitive's focus trap, Escape and return focus, and the sonner dismiss, are not browser-tested, because nothing renders them yet. They are first used in increment 2/3. Only their static markup is tested.
- **Contrast in unported views.** The legacy aliases follow §3.2 exactly, for example `--saffron` → saffron-700. Some legacy rules now pair poorly. Each is fixed when its surface is ported; AC-1.2 applies at increment 6. Known cases (IR1-3):
  - the sidebar `.brand-mark` "J", saffron-700 on the indigo gradient, about 1.9–2.2:1, **on every view** (was #F2A93B). Owner: increment 2 Sidebar rebuild.
  - the Department hero "76%" (30 px), saffron-700 on ink, 2.61:1. Owner: increment 4a.
- **Clock literals.** No call site uses the clock constants yet: the page eyebrow still reads "Tuesday, 29 September 2026". Each one switches over in the increment that touches it.
- **Bug reproductions still present by design** until their increments: A1, A2, A4, A6 and D1–D24.
- **Design review round 4 findings.**
  - R4-M1 (archived upstream), R4-M2 (`canHandOver(task, ctx)`) and R4-M3 (the branching `ChainSetu` rule) all land in increment-3 code. They are scheduled to be fixed before or inside increment 3, as approved.
  - R4-N1 to R4-N9 are scheduled in the increments they affect.
