---
name: test
description: "Generate and run automated tests from the Black Box Test Plan. Use when the tester agent must create tests, close traceability gaps, or execute the unit test suite."
license: CC-BY-4.0
---

# Test Skill

Generates automated tests from the project's Black Box Test Plan, runs the suite, and reports results and traceability. This skill is loaded by the `tester` agent; the agent's permission boundary is narrower than this document.

## Sources of truth

1. **Black Box Test Plan.** Look for `docs/test-plan.md`, `docs/testing/black-box-test-plan.md`, `docs/qa/*test-plan*.md`, or `TEST_PLAN.md` in the application root. Read it and preserve its scenario IDs.
2. **Canonical scenarios.** If no plan file exists, use the five scenarios below and state in the report that the plan file was not found. Do not invent extra requirements.
3. **Existing code and tests.** Read routes, components, data-loading paths, and current tests before writing anything.

| Plan scenario | Traceability ID | Minimum automated coverage |
|---|---|---|
| Page navigation | `BB-NAV` | Every route renders the expected page; nav links navigate; unknown route is handled |
| Category filtering | `BB-FILTER` | All categories, one category, no matches, and reset behavior |
| Bet selection | `BB-BET` | Select/deselect, single versus multiple, duplicate click, and displayed state |
| Leaderboard display | `BB-LEADER` | Rows render in correct order with ranks/points; empty and loading states; ties |
| Data-loading failure | `BB-DATA-FAIL` | Rejected/malformed/missing data surfaces an error or fallback without an unhandled rejection |

## Workflow

1. **Resolve the application root.** Use the directory containing `package.json` and `src/`. Run all commands there. Do not assume the agent configuration directory is the application root.
2. **Detect the test stack.** Read `package.json`, `vite.config.*`, and any test config. Prefer the existing runner (Vitest, Jest, Playwright, React Testing Library, etc.). Do not add or replace libraries just to match a preference.
3. **Check for missing tooling.** If there is no test runner, no test script, or no DOM environment, stop and propose the smallest compatible setup (for this React 18 + Vite 5 project, typically Vitest + jsdom + React Testing Library as devDependencies). Ask for approval via the `question` tool. Do not install anything before approval. If approved, delegate the setup to `build` via `Task()`; do not edit `package.json` yourself.
4. **Build the traceability matrix.** Map each plan scenario to one or more test names before writing code. Use stable IDs such as `BB-NAV-01` in test titles or comments.
5. **Write tests only under `tests/`.** Match the project's conventions. Use deterministic fixtures and mock the data layer; never call the live Supabase database.
6. **Run the suite.** Use the project's test command (for example `npm test`, `npm run test`, `npx vitest run`, or `npx playwright test`). Capture the exact command, exit code, total, passed, failed, and failed test names.
7. **Run coverage when configured.** Use the project's coverage command (for example `npm run coverage`, `npm test -- --coverage`, or `npx vitest run --coverage`). Capture line coverage percentage. If coverage tooling is missing, report it as a blocker rather than inventing a number.
8. **Stop on failure.** Do not edit application source, configuration, or environment files to make a test pass. Report the failure, the suspected cause, and a proposed fix. Source edits and new dependencies require explicit approval.

## Test design rules

- Prefer behavior-level assertions over implementation details.
- Mock `src/data/api.js` / the Supabase client at the boundary; never read `.env*` secrets.
- Cover the error path explicitly: rejected promise, timeout, malformed shape, and missing fields.
- Keep each test independent and deterministic. Clean up timers, listeners, and mocks.
- Do not delete or weaken existing tests. Add tests; if an existing test is wrong, report it.
- Do not use real network calls, real credentials, or the live database.
- Use accessible queries (`getByRole`, labels, text) where possible so navigation and selection tests exercise the user-visible contract.

## Failure behavior

When a command fails, stop the workflow and report:

- The exact command and exit code.
- The failing test names and concise failure output.
- Whether the failure is a test bug, a missing tool, or a product defect.
- A proposed fix, marked **not applied**.
- Any approval needed (dependency, source edit, configuration change).

Never fix source code automatically. Never change thresholds or skip tests to get a pass.

## Output

Return a concise report in this shape:

```markdown
## Test Run

- Application root:
- Test plan source:
- Test command:
- Result: PASS | FAIL | BLOCKED
- Totals: <passed> passed, <failed> failed, <total> total
- Coverage: <line %> (or "not configured")

## Tests Added

| Test | Plan ID | File | Status |
|------|---------|------|--------|
| ... | BB-NAV-01 | tests/... | pass/fail |

## Traceability

| Plan scenario | ID | Automated test(s) | Covered |
|---|---|---|---|
| Page navigation | BB-NAV | ... | yes/no |
| Category filtering | BB-FILTER | ... | yes/no |
| Bet selection | BB-BET | ... | yes/no |
| Leaderboard display | BB-LEADER | ... | yes/no |
| Data-loading failure | BB-DATA-FAIL | ... | yes/no |

## Failures

<failed test names and concise output, or "none">

## Proposed Fixes (not applied)

<gate/test, cause, proposal, approval needed>

## Blockers

<missing runner, coverage tooling, lint config, dependency approval, or "none">
```

## Guardrails

- Write only under `tests/`.
- Never edit `.env*`, `docs/templates/**`, `AGENTS.md`, `PHASE.md`, `opencode.json`, or `.opencode/`.
- Never touch the live Supabase database, delete files, commit, push, or add dependencies without approval.
- Never report a gate as passing unless the command actually ran and the numbers support it.
