# Increments 0 and 1, pass 2: cascade-layer fix, honest overflow probe, sidebar initials

This pass fixes the five findings from implementation review 1 and starts no new work. `base.css` now goes into `layer(base)` and the two legacy unlayered resets are gone, so the primitives keep their Tailwind styles in the live cascade. The overflow probe now measures against the emulated width at all four target widths, and the false "no horizontal overflow" claim has been corrected in place. The sidebar initials are visible again. The two interim contrast regressions and the 768 px overflow now have owners in proposal §16. I re-checked both blocking fixes in a separate browser session and got the same numbers as the coder.

Watch for:
- **Brand-mark contrast is still about 2:1 on every screen (confirmed, non-blocking, tracked).** This is accepted until the increment 2 Sidebar rebuild, and §16 now requires an allowlisted pair there.
- **Pre-existing overflow at 390 and 768 (confirmed, non-blocking, tracked).** It affects Dashboard, Access matrix, My feed, and Notices & feedback. It comes from baseline CSS and is owned by 4a, 4c, and 4d.
- **The cascade check covers only 2 of the 4 widths and none of `Dialog`'s behaviour (confirmed, non-blocking).** That check becomes the increment 2 gate.

**Verdict**: APPROVED

## High-level view

Base rules now sit in the same layer as preflight, so Tailwind utilities beat them. Legacy component classes stay unlayered and beat everything else, which keeps legacy views unchanged. I rendered the real `Button` (danger and ghost), `Input`, and `Textarea` from the dev server into an 11 px / 400 host. They computed 15 px / 600 and 16 px / 24 px with their borders, which matches the coder's `primitive-cascade.json`. That file also includes a negative control: reverting only the layer makes the check fail. Diffing `style-pre` against `style-ir1-4` gives exactly two changes. One is `border-top-style: none → solid` on zero-width button borders, which renders nothing. The other is the sidebar initials span.

I measured `scrollWidth` against `visualViewport.width` in my own emulated session and found the same four view/width pairs as `inc-check-ir1.json`. At 390 they are Dashboard (609 px) and Access matrix (766 px). At 768 they are My feed and Notices & feedback (849 px) and Access matrix (996 px). There is no overflow at 1280 or 1536. All four pairs come from baseline CSS and are assigned in §16.

The artwork rules hold. The document has no `<img>` elements and no `url()` backgrounds. Every avatar renders initials. The brand mark is a CSS "J" with a leaf accent, not a figure. The sidebar user card now shows "AM" at #915F1B on #F9DDB0 (4.15:1), the same legacy avatar scale used elsewhere.

<details>
<summary>Issues (4)</summary>

1. **Brand-mark contrast (non-blocking, tracked)**: the `.brand-mark` "J" is still saffron-700 (rgb 154,74,18) on the indigo gradient, about 1.9–2.2:1 on every view. The increment 2 Sidebar rebuild must use an allowlisted §3.2 pair, as §16 now requires. Confirm this in the increment 2 review.
2. **Pre-existing overflow at 390 and 768 (non-blocking, tracked)**: Dashboard, Access matrix, My feed, and Notices & feedback overflow because of `.reward-card`, `.access-matrix-*`, and `.hanuman-mini-list`. These are B5 and IR1-5, owned by 4a, 4c, and 4d. AC-9.1 cannot pass until those increments land.
3. **Cascade gate coverage (non-blocking)**: `primitive-cascade.mjs` runs only at 1280 and 390 and checks only static computed styles. When it is promoted to `scripts/ui-audit/` in increment 2, also run it at 768 and 1536, and extend it to cover:
   - `Dialog`'s focus trap
   - Escape
   - return focus
   - the `toast.dismiss()` on first open
   - 16 px fields inside a dialog at 390
4. **Layered base loses to legacy rules in later ports (likely, non-blocking)**: unlayered legacy rules now beat `:focus-visible` and `.jb-sacred` regardless of specificity. When a surface is ported, delete its legacy rules rather than layering new ones on top of them. Keep running style-snap's focus-outline capture per increment.

</details>

<details>
<summary>Details</summary>

### What the layer move gives up

Now that `base.css` is layered, any unlayered legacy rule beats the global `:focus-visible` outline and the `.jb-sacred` font, whatever its specificity. The style-snap fingerprint records the focus outline of every focusable element on 50 surfaces. It shows no outline change today, because the legacy rules that suppress outlines already won on specificity.

The risk is in later ports (likely). A ported surface that relies on `.jb-sacred` or the global focus ring will lose to any legacy rule still matching it. One example is a legacy `font-family` on the "॥ श्री राम ॥" ribbon spans. Each port should delete the legacy rules for its surface rather than layering new ones on top of them.

The reduced-motion kill switch still wins, because layered `!important` beats unlayered `!important`. The smoke check measured 0 of 2,034 elements still animating.

### Not verified

- Check, test, and build were not re-run. The 153 passing tests and `tsc` exit 0 are taken from the record.
- `Dialog` behaviour in a browser is still unexercised, because nothing renders it yet. This carries into increment 2.
- My own 1280 and 1536 screenshots timed out in the DevTools session. I assessed those widths from three sources:
  - the coder's `screenshots/ir1/wide-*` images
  - the coder's `screenshots/ir1/desktop-*` images
  - my own overflow measurement at 1536

  At 390 and 768, I took my own screenshots.

</details>

<details>
<summary>File map</summary>

- `client/src/index.css`: `base.css` imported into `layer(base)`; legacy button/input resets removed; `.head-card span` scoped to `:not(.avatar)`
- `.agents/tasks/audit-tools/inpage.js`: `overflow(deviceWidth)` measures against the emulated width and lists culprits
- `.agents/tasks/audit-tools/inc-check.mjs`: four widths (1280, 390, 768, 1536)
- `.agents/tasks/audit-tools/primitive-cascade.mjs`, `style-snap.mjs`: new browser checks for primitive computed styles and for whole-app computed-style equivalence
- `.agents/tasks/redesign-proposal.md` §16: owners for IR1-3, IR1-4, and IR1-5
- `.agents/tasks/impl-verification.md`: pass 2 record, plus the pass 1 overflow correction

Evidence:
- `audit-tools/primitive-cascade.json`
- `audit-tools/style-pre.json`
- `audit-tools/style-ir1-1.json`
- `audit-tools/style-ir1-4.json`
- `audit-tools/equiv-ir1.json`
- `audit-tools/inc-check-ir1.json`
- `screenshots/ir1/`

There is no git repository. The baseline is `.agents/tasks/baseline-5f248af/`.

</details>
