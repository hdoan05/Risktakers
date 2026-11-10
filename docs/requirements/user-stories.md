# User Stories: VTRisk (The Clubhouse)

**Provenance:** No stakeholder-authored requirements existed in this repository. These stories
were derived from the behaviour implemented in `src/` (components, pages, data layer) on
2026-11-10 so that tests can be traced to requirements. They describe the product as built, not
as negotiated with a stakeholder, and should be reviewed and confirmed by the team/product owner.

**Conventions:** One story per `US-###` block; acceptance criteria are numbered `AC-###` globally
(never reused); each criterion is testable and written Given/When/Then; every story links to the
spec file(s) that verify it.

---

## US-001 — Browse campus event markets

**Story:** As a student trader, I want to browse a grid of open campus event markets and narrow
them by category, so that I can find a market I care about without scrolling through everything.

**Acceptance Criteria**
1. **AC-001** Given the Events page is open, when it renders, then every event in the dataset is
   shown as a card, and the category tab bar begins with an `All` tab that is active.
2. **AC-002** Given the Events page is open, when the user clicks a category tab, then only events
   whose `category` matches are shown and that tab becomes the active tab.
3. **AC-003** Given no events exist, when the Events page renders, then only the `All` tab is
   shown and the card grid is empty.
4. **AC-004** Given categories are derived from the events, when the data contains no event of a
   category, then no tab is rendered for that category.

**Priority:** Must-have

**Related requirements:** Events page (`src/pages/Events.jsx`)

**Assumptions / dependencies:** The event dataset is already loaded by `DataProvider`.

---

## US-002 — Inspect an event card

**Story:** As a student trader, I want each market card to show its status, title, category and
the probability of each outcome, so that I can judge a market at a glance.

**Acceptance Criteria**
1. **AC-005** Given an event with a tag and category, when its card renders, then the tag is
   styled with the event's `tagColor` and the category, title and subtitle are displayed.
2. **AC-006** Given an event with options, when its card renders, then each option renders as a
   button showing its label and its probability as a percentage, and the probability bar's width
   equals that percentage.
3. **AC-007** Given an option's recent probability history, when its card renders, then the card
   shows a sparkline for that option and a change indicator using ▲ for non-negative changes and
   ▼ for negative changes, with the change shown as an absolute value to one decimal place.
4. **AC-008** Given an event with no options, when its card renders, then no option buttons are
   rendered and the footer still shows the closing time and the traded points total.
5. **AC-009** Given an event with a points volume, when its card renders, then the volume is
   displayed with thousands separators and the suffix `pts traded`.

**Priority:** Must-have

**Related requirements:** `src/components/EventCard.jsx`, `src/components/Sparkline.jsx`

**Assumptions / dependencies:** Option `probability` is an integer 0–100.

---

## US-003 — Pick an outcome on an event

**Story:** As a student trader, I want to select the outcome I believe in, so that I can register
my pick before the market closes.

**Acceptance Criteria**
1. **AC-010** Given an event card, when the user clicks an option, then that option is marked
   selected (`aria-pressed="true"` plus the selected style) and clicking it again deselects it.
2. **AC-011** Given an option is selected, when the user clicks a different option, then the first
   option is deselected and only the second is selected.

**Priority:** Must-have

**Related requirements:** `src/components/EventCard.jsx`

**Assumptions / dependencies:** Selection is local to a single card; no wallet transaction is
performed yet.

---

## US-004 — View the top-5 leaderboard

**Story:** As a student trader, I want to see the top five players and their points, so that I can
compare my performance against the leaders.

**Acceptance Criteria**
1. **AC-012** Given five leaderboard entries, when the table renders, then one row is shown per
   entry with rank, name, year and major, trend and points, and ranks 1–3 show 🥇/🥈/🥉.
2. **AC-013** Given each entry's trend, when the table renders, then rising entries show ▲ with an
   `lb-trend--up` class and falling entries show ▼ with an `lb-trend--down` class.
3. **AC-014** Given an entry's points, when the table renders, then the value is displayed with
   thousands separators.
4. **AC-015** Given the Leaderboard page is open, when it renders, then it shows the page heading,
   the ranking explanation, and the shared leaderboard table.

**Priority:** Must-have

**Related requirements:** `src/components/LeaderboardTable.jsx`, `src/pages/Leaderboard.jsx`

**Assumptions / dependencies:** The leaderboard is delivered pre-sorted by rank.

---

## US-005 — See my own standing

**Story:** As a student trader, I want to see my rank, balance and distance from the last shown
rank, so that I know how far I am from the top five.

**Acceptance Criteria**
1. **AC-016** Given the current user and the last shown leaderboard row, when the table renders,
   then a "Your current position" footer row shows the user's rank, name with a "You" tag,
   `<lastShownPoints − userBalance>` formatted as `N pts behind #<lastRank>`, the trend arrow with
   the absolute percentage change, and the balance with thousands separators.

**Priority:** Must-have

**Related requirements:** `src/components/LeaderboardTable.jsx`

**Assumptions / dependencies:** The user's points are below the fifth-ranked player's points.

---

## US-006 — See my current bets on the home page

**Story:** As a student trader, I want the home page to show only the markets I have a bet on, so
that I can track my open positions.

**Acceptance Criteria**
1. **AC-017** Given the user has bet on a subset of events, when the home page renders, then only
   those events are shown under "Current Bets", in dataset order.
2. **AC-018** Given the user has no bets, or bet ids that match no event, when the home page
   renders, then no bet cards are shown.
3. **AC-019** Given the home page renders, then it also shows the "Leaderboard (top 5)" heading and
   the shared leaderboard table.

**Priority:** Must-have

**Related requirements:** `src/pages/Home.jsx`, `src/data/mockData.js`

**Assumptions / dependencies:** `myBetEventIds` is supplied by the data layer.

---

## US-007 — Navigate the app and see my balance

**Story:** As a student trader, I want a persistent header with the main sections and my balance,
so that I can move around and always know my point total.

**Acceptance Criteria**
1. **AC-020** Given the app shell renders, when it loads, then the brand, Home/Leaderboard/Events
   links (pointing at `/`, `/leaderboard`, `/events`), and the current page's outlet content are
   shown.
2. **AC-021** Given the current route, when the header renders, then the matching link is styled
   with the accent colour and accent bottom border while other links use the default text colour
   and a transparent border.
3. **AC-022** Given the current user's balance, when the header renders, then the balance is shown
   with thousands separators.

**Priority:** Must-have

**Related requirements:** `src/App.jsx`, `src/main.jsx`

**Assumptions / dependencies:** Routing is provided by `react-router-dom`.

---

## US-008 — Load data from Supabase, falling back to demo data

**Story:** As a developer/demo operator, I want the app to run on seeded data when Supabase is not
configured, so that the app is demonstrable without a live backend.

**Acceptance Criteria**
1. **AC-023** Given `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are absent, when the
   Supabase module loads, then no client is created, no error is recorded, and an informational
   message is logged.
2. **AC-024** Given both env vars are present, when the module loads, then a client exposing
   `from()` is created.
3. **AC-025** Given a malformed Supabase URL, when the module loads, then client construction is
   caught and exposed as a configuration error instead of throwing.
4. **AC-026** Given Supabase is unconfigured, when the provider mounts, then it immediately
   provides the mock dataset and never calls `fetchAppData`.
5. **AC-027** Given a configuration error exists, when the provider renders, then it shows
   `Couldn't load data from Supabase: <message>` and renders no children.
6. **AC-028** Given Supabase is configured, when the provider mounts, then it shows a loading state
   until `fetchAppData` resolves, then provides the fetched dataset, or shows the error message if
   the fetch rejects.
7. **AC-029** Given Supabase rows, when `fetchAppData` runs, then events, leaderboard rows, the
   demo user and bet event ids are converted to the same camelCase shapes as `mockData.js`, event
   options are sorted by `sort_order`, trends are derived from the sign of `change_pct`, the peak
   is the maximum of `points_history`, and bet event ids are de-duplicated.
8. **AC-030** Given any query returns a database error, when `fetchAppData` runs, then it rejects
   with that error.
9. **AC-031** Given the mock dataset, when it is inspected, then every event has the merged shape
   the components read (title, subtitle, tag colour, closing text, volume, options), all option
   probabilities are within 0–100, every event has at least one option, the leaderboard is sorted
   by descending points with gap-free ranks 1–5, and the current user's balance is below the last
   ranked player's.

**Priority:** Must-have

**Related requirements:** `src/lib/supabase.js`, `src/data/api.js`, `src/data/mockData.js`,
`src/data/DataProvider.jsx`

**Assumptions / dependencies:** Supabase tables (`events`, `event_options`, `leaderboard`, `bets`)
match the seeded schema; the demo username is `jd`.

---

## US-009 — See probability trend sparklines

**Story:** As a student trader, I want a small line chart of each outcome's recent probability, so
that I can see momentum without opening a detail view.

**Acceptance Criteria**
1. **AC-032** Given a series of probabilities, when the sparkline renders, then it draws a
   decorative (`aria-hidden`) 64×22 SVG polyline that maps the series across the full width, with
   the lowest value at the bottom and the highest at the top.
2. **AC-033** Given a series whose values are all equal, when the sparkline renders, then it draws
   a flat line at the bottom instead of dividing by a zero range.
3. **AC-034** Given a series with a single value, when the sparkline renders, then it draws a valid
   point instead of `NaN` coordinates.

**Priority:** Should-have

**Related requirements:** `src/components/Sparkline.jsx`

**Assumptions / dependencies:** `probHistory` is a non-negative numeric array in chronological
order.

---

## Traceability index

| Story | Acceptance criteria | Verifying spec |
|-------|---------------------|----------------|
| US-001 | AC-001 – AC-004 | `tests/pages/Events.test.jsx` |
| US-002 | AC-005 – AC-009 | `tests/components/EventCard.test.jsx` (AC-007 also `tests/components/Sparkline.test.jsx`) |
| US-003 | AC-010 – AC-011 | `tests/components/EventCard.test.jsx` |
| US-004 | AC-012 – AC-015 | `tests/components/LeaderboardTable.test.jsx`, `tests/pages/Leaderboard.test.jsx` |
| US-005 | AC-016 | `tests/components/LeaderboardTable.test.jsx` |
| US-006 | AC-017 – AC-019 | `tests/pages/Home.test.jsx` |
| US-007 | AC-020 – AC-022 | `tests/App.test.jsx` |
| US-008 | AC-023 – AC-031 | `tests/lib/supabase.test.js`, `tests/data/DataProvider.test.jsx`, `tests/data/api.test.js`, `tests/data/mockData.test.js` |
| US-009 | AC-032 – AC-034 | `tests/components/Sparkline.test.jsx` |
