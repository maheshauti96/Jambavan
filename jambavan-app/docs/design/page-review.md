# Page review after the guide correction

The previous review opened all 14 views but missed the guide's incomplete section containers and oversized action. The user's screenshot exposed the gap. This follow-up reviewed complete desktop pages through native-size crops, then checked the corrected guide and changed avatar lists at smaller widths.

## Evidence

Evidence directory: `/Users/maheshauti/Documents/Jambavan-design-review-2026-10-12/redesign/guide-review/`.

The supplied guide screenshot is `/var/folders/ln/_48k6vkx6591tnf0byryq3_40000gn/T/codex-clipboard-32e9a6fd-0a25-4807-a161-55450bcaaa16.png`, 3352 × 1880 pixels. The existing cream, maroon and padded Card components provide the design direction for the correction.

Fresh before and after guide captures use a 1440 × 1000 CSS viewport. Browser captures are 1425 pixels wide. `guide-comparison.png` places the two sections together at the same crop, 256–1425 horizontally and 240–740 vertically. Each half is 1169 × 500 pixels; no image scaling was applied. The source screenshot's device density was not independently measured, so it is used to identify the defect without pixel-offset claims.

Full responsive guide captures are `after-guide-tablet.png`, 753 × 1906; `after-guide-phone.png`, 375 × 2618; and `after-guide-wide.png`, 2185 × 1543. Their CSS viewports are 768 × 1024, 390 × 844 and 2200 × 1100. `guide-*-detail-*.png` files retain native pixels so copy and padding can be inspected. `dashboard-phone-ack-comparison.png` places the broken and corrected acknowledgment rows together. All of these comparisons and their readable detail regions were opened and inspected.

State: light theme, initial institute example data, closed task disclosures. The guide action check opened Create a task, closed it with Escape, confirmed trigger focus return and followed each destination link. The profile edit form was also opened to verify its corrected photo copy.

## Findings and fixes

- P2, guide section framing. The headings and cards touched the edge of white section rectangles. The guide now uses the existing Card component, with consistent inner padding, borders and radii.
- P2, guide hierarchy. Create task stretched across the section, while four ownership entries occupied an uneven three-column grid. The action is now compact and placed in the header. Ownership uses two columns on larger screens and one on phones, with dividers and 16 px descriptions.
- P2, mobile acknowledgment rows. A direct-span selector moved the avatar into the counter column. Explicit avatar, copy and count layout rules replace that dependency on element types. The two counters stay together below the task copy on phones.
- P2, inaccurate copy. Upcoming tasks were called overdue; avatar initials were described as photos; and the activity view claimed a daily email digest was ready. Copy now describes the visible data and in-app summary. Department contacts include names, and event totals separate events from templates.
- P2, avatar legibility. Negative margins covered initials in dashboard and meeting groups. Those legacy rules were removed. Shared list styles now leave space between avatars.
- P3, component type floor. The source guard omitted component styles, which retained a 12 px eyebrow rule. It now checks all source CSS files, and the rule uses 13 px type.

## Complete desktop page checks

The evidence column identifies the full capture. Matching `desktop-detail-<index>-<part>.png` files expose lower sections at readable size. Unchanged pages were checked for the guide's missing padding and stretched controls. Changed pages received fresh post-fix captures.

| Step | Page | Result | Evidence |
| --- | --- | --- | --- |
| 1 | Task feed | Card spacing, collapsed details, owner actions and lower Setu checked. | desktop-full-0.png |
| 2 | My day | Field labels, planning cards, linked-task empty state and day review checked. | desktop-full-1.png |
| 3 | Department | Shared task cards and footer alignment checked. | desktop-full-2.png |
| 4 | Dashboard | Corrected contacts, acknowledgments, blockers, dependencies, charts and planner checked. | desktop-full-3.png |
| 5 | MOM directory | Record padding, roles, readable attendee initials and action rows checked. | desktop-full-4.png |
| 6 | Event planner | Event/template counts, card spacing, edit and reuse controls checked. | desktop-full-5.png |
| 7 | Projects | Setu cards, status copy, actions and short-page alignment checked. | desktop-full-6.png |
| 8 | Calendar | All month cards, event wrapping and footer checked. | desktop-full-7.png |
| 9 | Notices & feedback | Reply fields, media labels, polls and feedback form checked. | desktop-full-8.png |
| 10 | People | Directory cards, availability notes, department summaries and audit rows checked. | desktop-full-9.png |
| 11 | My profile | Profile copy, attendance and schedule cards checked. | desktop-full-10.png |
| 12 | Roles & permissions | Table alignment, permission labels and visibility note checked. | desktop-full-11.png |
| 13 | Activity log | Records, filters, chart and corrected follow-up summary checked. | desktop-full-12.png |
| 14 | Jambavan guide | All four sections, family cards, compact action and destination links checked. | desktop-full-13.png |

## Verification

Typography retains Mukta body text and Cormorant headings. Guide descriptions use 16 px text. Native-size crops confirm wrapping and hierarchy. Cream, maroon, ink and sand tokens match the existing controls. The existing guide illustration and family symbols remain sharp at the checked sizes. The shortened copy describes actual ownership, destinations and visible data.

TypeScript, the design guard, 158 tests in 10 files and the frontend/server build passed. The production browser reported no console errors or warnings. Guide creation, Escape, focus return and all three destination links passed. The guide was checked at desktop, tablet, phone and wide widths. Dashboard contacts and acknowledgment rows, plus meeting attendees, were also checked on a phone.

The targeted follow-up did not repeat every workflow on every view or establish screen-reader compliance. The application still uses in-memory example data. The existing build warning about a large JavaScript chunk remains.

No actionable P0, P1 or P2 finding remains in these captured states.

final result: passed
