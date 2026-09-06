# DOLCE AGENT — Flat PPC Views

A separate version based on `dolceagent-ppc-inline-controls-05sep2026`. Previous repositories and links remain unchanged.

## Open

- `?workspace=targets`: 29 independent targets — 18 keywords, 6 ASINs, 4 automatic targets and 1 category.
- `?workspace=asins`: the 6 ASIN targets.
- `?workspace=campaigns`: 4 independent campaigns.
- `?workspace=portfolios`: 3 independent portfolios.

The standard homepage remains Accounting. PPC in the page slider opens Targets on its first visit and retains the selected view on later visits. Campaigns, Targets, ASINs and Portfolios are available in the burger control panel.

## Flat records and totals

Every visible record stands alone. There are no parent headings, nested search-term rows, expansion controls, indentation, or black group separator rows. Keywords with the same wording but different match types remain distinct targets. The first frozen column identifies the current target, campaign or portfolio; the adjacent Type column explains the record type.

Exactly one TOTAL row precedes the records. It recalculates with type, status, text search, period and custom date/range filters. It remains visible with zero additive values when no records match. Totals use each matching daily search-term record once. Campaign and portfolio views aggregate the same filtered source; ratios use summed values rather than averages of row percentages. Aggregate status summarizes the statuses of the matching targets, and portfolio budgets sum their unique campaigns.

There are exactly two header rows: broad Performance/Context headings and column labels. Periods appear in metric names, such as `30D_CLICKS`, `30D_ORDERS`, `7D_SPEND`, `RANGE_SALES` and `DATE_IMPRESSIONS`. There is no separate date-range header row. Exact date/range choices stay in the controls and Info details.

## Info and appearance

The I letter and circle outline distinguish record types: blue keywords, purple ASINs, gold automatic targets, green categories, coral campaigns and aqua portfolios. Type text and accessible button labels also identify each kind. The original circular Info geometry is preserved, with full names, context, selected-period performance and matching search terms available in the dialog. Accounting action icon assets are unchanged.

The existing positive and negative metric fills remain exactly `rgb(183, 223, 207)` and `rgb(241, 198, 198)`. Campaign and portfolio records use the same normal row height and metric colors as targets. The visible heading and helper paragraphs remain removed.

## Controls and mobile behavior

The horizontal page slider stays directly below the header. PPC starts with its inline control panel closed. The burger opens the panel above the table, pushing the table down; closing it moves the table back up. The main content contains only the table and its Info/resize controls. Opening the panel preserves the table, scroll position and selected width. The panel scrolls independently on short screens and is limited to 48% of the workspace height.

The frozen first column defaults to 20% of the table viewport on mobile and 300px on desktop. Drag its right edge to resize, with a 48px minimum and a maximum of 75% of the viewport, capped at 720px. The chosen proportion survives filter and view changes, page navigation and orientation changes. Reload restores the default. Arrow keys adjust width; Shift makes larger changes, Home resets, End uses the maximum and double-click resets. Native table scrolling remains available.

The original Accounting report, all 215 action cells, 50-character action summaries, full action details, native Accounting settings, Login and chat are retained.

## Data

The read-only structural reference is [MAIN_KEYWORD](https://docs.google.com/spreadsheets/d/15GDQmpzYvHnZvdnSwH6NNLYuSGUCZmigYev3gntKoSQ/edit#gid=1233007547). Its original internal relationship structure remains solely to support calculations and Info details; it is no longer displayed as grouped rows.

The source fixture contains 4 campaigns, 14 ad groups, 29 targets and 52 search terms, with daily example values for 8 July–5 September 2026. All performance figures and ASIN examples are fictional; reference-sheet performance is not published. TACoS remains unavailable because total product sales are not attributed to targets. No live advertising operations are performed.

## Verification

89 unit/model tests and 57 DOM integration tests passed (146 total). Coverage includes unique entity rows, totals across all view/type/status/period combinations, summed ratios, searches, empty results, dates, two-row headers, type-colored Info letters, complete details, direct links, resizing, page navigation, inline controls and existing Accounting actions.

Run `npm test` and `DOLCE_QA_JSDOM=/path/to/jsdom node --max-old-space-size=4096 --test tests/*.integration.mjs`.

Browser checks covered 320×640 and 390×700 phone viewports, 844×390 landscape and 1440×900 desktop: no document overflow, drag in both directions, the frozen column during horizontal scrolling, all period headers, Campaigns/Portfolios, full Info dialogs and independently scrolling settings. No browser errors were logged. Physical iPhone testing was not available.
