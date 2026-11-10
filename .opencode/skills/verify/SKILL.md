---
name: verify
description: "Run every quality gate in order (pytest, 85% line coverage, zero lint errors, clean install and import, story-to-test traceability, assertion substance), stop at the first failure, and write docs/verification-report.md with a ready/not-ready recommendation. Use when deciding whether a milestone is ready."
license: CC-BY-4.0
---

# Verify Skill

Runs the project's quality gates end to end, records the evidence, and writes the one artifact that says whether the milestone is ready: `docs/verification-report.md`.

Used by `@review` through the `/verify` skill. `@tester` uses `test/SKILL.md` to close the gaps this skill reports.

This file is the **single source of truth** for gate ids, thresholds, and commands. Other agents and skills reference it instead of restating the gates.

## Gates

| Id | Gate | Pass condition | Command |
|----|------|----------------|---------|
| G1 | Tests pass | `pytest` exits 0 with zero failures and zero errors | `pytest -q` |
| G2 | Coverage | Line coverage of the configured source >= 85% | `pytest --cov --cov-report=term-missing -q` |
| G3 | Lint | Zero lint errors (warnings are reported, not gating) | project linter, see below |
| G4 | Clean install and import | Dependency manifest is consistent and every module imports | see below |
| G5 | Traceability | Every user story and acceptance criterion maps to at least one test | see below |
| G6 | Assertion substance | Every test asserts on a real expected value | see below |

G1 and G2 are read from the same run.

### G3 - lint

Use whichever linter the project configures, in this order of preference: `ruff check .`, `flake8`, `pylint`, then `eslint` / `npm run lint` for a JS project. Report the exact command in the table. If no linter is configured, G3 is `BLOCKED` with the message "no lint configuration found" — not a pass.

### G4 - clean install and import

Three checks, all read-only:

1. Manifest consistency: `pip check` (Python) or `npm ls --depth=0` (JS). No missing or conflicting dependencies.
2. Import resolution: `pytest --collect-only -q` must succeed. Collection imports every test module, so a collection error is an import failure.
3. Syntax/import of the entry module: `python -m compileall -q <source dir>` (Python) or `node --check` on the entry file (JS).

A genuine reinstall (`pip install -e .`, `pip install -r requirements.txt`, `npm ci`) mutates the tree and is **out of scope** for this skill. If the manifest is consistent but the environment is stale, mark the gate `BLOCKED`, name the exact install command, and hand it to the student or `@build`.

### G5 - traceability

1. Locate the requirement sources: `docs/requirements/**`, `docs/templates/user-story.md`-shaped files, and any `PM*.md` / `HW*.md` at the repo root.
2. Extract every `US-###` and its `AC-##` acceptance criteria.
3. Build the map by grepping `tests/` for those tokens in test docstrings or names.
4. A story or criterion with no matching test is a G5 failure. A requirement source that does not exist is `BLOCKED` — traceability cannot be demonstrated, so it cannot pass.

Never invent a requirement id to close a row. An id that appears in no requirement document is a traceability defect.

### G6 - assertion substance

For every test in scope, confirm at least one assertion compares against a concrete expected value. Flag as failures:

- A test body with no assertion.
- `assert x` / `assert x is not None` as the only assertion.
- `assert f(x) == f(x)` or an assertion that compares the function to itself.
- An assertion whose expected value was clearly copied from a captured run of the implementation.
- `skip` / `xfail` markers used to keep a failing test out of the suite.

Report the test node id and the offending line for each.

## Procedure

1. **Scope.** Confirm the milestone and the requirement set. Default to the most recent report's scope; ask if ambiguous (one question per call).
2. **Snapshot.** Record `git rev-parse --short HEAD`, the branch, and any uncommitted change count. The report is about a specific tree state.
3. **Run gates in order** G1 -> G6. On the first `FAIL` or `BLOCKED`, stop: mark the remaining gates `not run` and go to step 4.
4. **Write the report** to `docs/verification-report.md`, following `docs/templates/verification-report.md`. Overwrite the gate, coverage, failing-test, and traceability sections; append one row to the run history.
5. **Explain.** Summarize to the student in chat: the gate that failed, the command, the evidence, the likely cause, and the proposed fix. Proposals only — no edits.
6. **Recommend.** `READY` only if G1-G6 are all `PASS`. Anything else is `NOT READY`, with the blocking gates named first.

## Failure behavior

When a gate fails: **stop, explain, propose.** Do not continue gate-hunting, do not retry with looser flags, and do not fix anything.

For the failing gate, the report and the chat summary must each contain:

- Gate id, name, and exact command.
- Evidence: the assertion message with expected vs actual, the lint rule id with file:line, the coverage total against 85%, or the missing traceability row.
- The most likely cause, at file:line.
- A proposed fix, explicitly marked as a proposal needing approval, owned by `@build` (source) or `@tester` (tests).

`@review` may write only the report. New tests may be added automatically by `@tester`; **source changes require the student's explicit approval** before anything is edited.

## Recommendation language

Write the verdict as a statement about gate status, never about graded work:

- `READY` — "All six gates pass on <commit>; evidence is in the tables above."
- `NOT READY` — "G2 fails: line coverage is 78% (gate 85%). G1, G3-G6 are not run because the run stops at the first failure."

Never say a milestone "will earn" a grade, never estimate points, and never imply that the recommendation substitutes for the instructor's evaluation.

## Constraints

- Read-only except `docs/verification-report.md`. Do not edit source, tests, config, requirements, or the template.
- Do not install, upgrade, or uninstall anything.
- Do not `git commit`, `git push`, reset, or clean.
- Do not delete, rename, or move files.
- Do not read, print, or pass `ARC_API_KEY`, `.env*`, or any secret. If a gate command would print the environment, do not run it.
- Never lower a threshold, add a lint ignore, or skip a test to make a gate pass. A gate that cannot be met as written is reported as `FAIL`.

---

*Generated for the CS-3704 course; licensed under CC-BY-4.0.*
