---
name: verify
description: "Check the five quality gates (tests, coverage, lint, build, traceability) and write docs/verification-report.md with pass/fail, numbers, failed tests, and a ready/not-ready recommendation."
license: CC-BY-4.0
---

# Verify Skill

Runs the five quality gates, writes `docs/verification-report.md`, and recommends whether the project is milestone-ready. This skill is loaded by the `reviewer` agent; the agent's permission boundary is narrower than this document.

## Preconditions

1. Resolve the **application root**: the directory containing `package.json` and `src/`. Run every command there.
2. Locate the **Black Box Test Plan** (`docs/test-plan.md`, `docs/testing/black-box-test-plan.md`, `docs/qa/*test-plan*.md`, or `TEST_PLAN.md`). If it is missing, use the five canonical scenarios below and record that source in the report.
3. Confirm the run will not read or edit `.env*`, touch the live Supabase database, delete files, commit, push, or add dependencies.
4. Detect the package manager and available scripts from `package.json` and the lockfile. Do not assume a script exists.

## Gates

Process the gates in this order.

| # | Gate | Pass condition | How to check |
|---|------|----------------|--------------|
| 1 | Unit tests | All tests run with 0 failures | Run the non-watch test command; capture passed/failed/total |
| 2 | Coverage | At least 70% line coverage | Run the coverage command; parse the line-coverage percentage |
| 3 | Lint | ESLint runs with 0 errors (warnings allowed) | Run the lint command; capture error and warning counts |
| 4 | Build | Install and build complete with no errors | Prefer `npm ci`, then run the build; capture both exit codes |
| 5 | Traceability | Every Black Box Test Plan scenario maps to at least one automated test | Build the plan-to-test matrix from the plan and the test files |

### Gate 1: Unit tests

- Prefer an explicit non-watch command: `npm test -- --run`, `npx vitest run`, `npx jest --ci`, or the project's configured test script.
- Never leave a watcher running.
- Pass only when the command exits 0, at least one test ran, and the failed count is 0.
- If no test runner or test script exists, mark the gate `FAIL` and propose adding the smallest compatible runner with approval.

### Gate 2: Coverage

- Use the project's coverage script or the runner's coverage flag (for example `npm run coverage`, `npm test -- --coverage`, or `npx vitest run --coverage`).
- Parse **line** coverage specifically. Do not substitute statement, branch, or function coverage.
- Pass when line coverage is `>= 70.0%`.
- If coverage tooling is not configured, mark the gate `FAIL` and propose the smallest compatible coverage setup with approval. Do not estimate or invent a percentage.

### Gate 3: Lint

- Run `npm run lint` or `npx eslint .` using the project's existing ESLint configuration.
- Pass when ESLint exits 0 and reports 0 errors. Warnings are allowed.
- If ESLint is not installed or configured, mark the gate `FAIL` and propose the minimal configuration with approval. Do not add packages automatically.
- Never suppress, disable, or ignore lint errors to obtain a pass.

### Gate 4: Build

- Prefer `npm ci` when a lockfile exists; otherwise use `npm install` only if the user has approved it. Do not add dependencies.
- Run `npm run build` (or the detected build command).
- Pass only when both install and build exit 0.
- Record the commands, exit codes, and any build warnings that matter.

### Gate 5: Traceability

Map every scenario from the Black Box Test Plan to at least one automated test. If the plan file is missing, use these canonical scenarios:

| Plan scenario | Traceability ID |
|---|---|
| Page navigation | `BB-NAV` |
| Category filtering | `BB-FILTER` |
| Bet selection | `BB-BET` |
| Leaderboard display | `BB-LEADER` |
| Data-loading failure | `BB-DATA-FAIL` |

Pass only when every scenario has at least one automated test that targets it, regardless of whether the test currently passes. Record the file and test name for each mapping. Mark an unmapped scenario `FAIL`.

## Failure behavior

- By default, **stop at the first failing gate**. Mark the report's verification status as `stopped at Gate N` and mark every later gate `NOT RUN (blocked)`.
- If the user explicitly asks for a full diagnostic sweep, continue running the remaining gates after a failure, but still never fix anything. Label the report `full diagnostic sweep`.
- For every failing or blocked gate, explain:
  - which gate failed,
  - what command ran and what it reported,
  - why it failed,
  - a concrete proposed fix, marked **not applied**,
  - whether the fix needs approval (source edit, dependency, configuration).
- Never edit application source, tests, configuration, or environment files to make a gate pass. Never lower a threshold, skip a test, or suppress a lint error.

## Report

Write the report to `docs/verification-report.md` in the application root. Create the `docs/` directory if needed. Use exactly this structure:

```markdown
# Verification Report

- **Date:** <ISO-8601>
- **Project:** <name>
- **Milestone:** <milestone or "not specified">
- **Application root:** <path>
- **Revision:** <git SHA or "not available">
- **Test plan source:** <path or "canonical five scenarios (plan file not found)">
- **Verification status:** <all gates run | stopped at Gate N | full diagnostic sweep>
- **Overall recommendation:** <READY | NOT READY>

## Gate Results

| # | Gate | Result | Numbers | Evidence |
|---|------|--------|---------|----------|
| 1 | Unit tests | <PASS/FAIL/NOT RUN> | <passed> passed, <failed> failed, <total> total | `<command>` exit <code> |
| 2 | Coverage | <PASS/FAIL/NOT RUN> | <line %> line coverage (threshold 70%) | `<command>` exit <code> |
| 3 | Lint | <PASS/FAIL/NOT RUN> | <errors> errors, <warnings> warnings | `<command>` exit <code> |
| 4 | Build | <PASS/FAIL/NOT RUN> | install: <exit>; build: <exit> | `<command>` |
| 5 | Traceability | <PASS/FAIL/NOT RUN> | <covered>/<total> plan scenarios mapped | see matrix |

## Failed Tests

<List failing test names and concise output, or "none".>

## Coverage

- **Line coverage:** <percentage or "not measured">
- **Threshold:** 70%
- **Result:** <PASS/FAIL>

## Test Plan Traceability

| Plan scenario | Plan ID | Automated test(s) | File | Covered |
|---------------|---------|-------------------|------|---------|
| Page navigation | BB-NAV | <test name(s)> | <path> | <yes/no> |
| Category filtering | BB-FILTER | <test name(s)> | <path> | <yes/no> |
| Bet selection | BB-BET | <test name(s)> | <path> | <yes/no> |
| Leaderboard display | BB-LEADER | <test name(s)> | <path> | <yes/no> |
| Data-loading failure | BB-DATA-FAIL | <test name(s)> | <path> | <yes/no> |

## Failure Analysis

For each failed or blocked gate:

- **Gate:** <number and name>
- **Why it failed:** <evidence and root cause>
- **Proposed fix (not applied):** <specific change>
- **Approval needed:** <yes/no and what kind>

## Recommendation

**<READY | NOT READY>**

<One short paragraph. READY only when all five gates pass. Otherwise list the blocking gates and the next action. Do not imply a grading decision.>

## Commands Run

| Command | Working directory | Exit code | Purpose |
|---------|-------------------|-----------|---------|
| ... | ... | ... | ... |

## Constraints Honored

- [ ] No `.env` files read or edited
- [ ] No live Supabase database access
- [ ] No files deleted
- [ ] No commit or push
- [ ] No template, agent, or skill files edited
- [ ] No dependencies added without approval
- [ ] No source code fixed automatically
```

## Recommendation rules

- `READY` only when all five gates are `PASS`.
- `NOT READY` if any gate is `FAIL` or `NOT RUN`.
- A `NOT RUN` gate is not a pass. Do not describe a stopped run as ready.
- If a gate is blocked by missing tooling, recommend the smallest setup that would let the gate run, and mark it as needing approval.

## Guardrails

- Read-only except for `docs/verification-report.md`.
- Never edit `.env*`, `docs/templates/**`, `AGENTS.md`, `PHASE.md`, `opencode.json`, `.opencode/`, application source, or tests.
- Never touch the live Supabase database, delete files, commit, push, or add dependencies without approval.
- Never report a gate as passing unless the command actually ran and the numbers support it.
- If a fix is needed, delegate it to `build` via `Task()` only after explicit approval.
