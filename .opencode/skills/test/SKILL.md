---
name: test
description: "Generate tests for uncovered code, run them with coverage, and report the gap against the 85% line-coverage gate. Use when coverage is below the gate, when new source code has no matching tests, or when a milestone needs adversarial tests under tests/."
license: CC-BY-4.0
---

# Test Skill

Raises coverage and finds defects by writing adversarial tests for code that has none. This skill writes **only** under `tests/`; it never edits source.

Used by `@tester` through the `/test` skill. `/verify` is the separate gate run — see `verify/SKILL.md`. The gate ids and thresholds are defined there and are not redefined here, with one exception: this skill enforces the 85% line-coverage gate (G2) and the assertion-substance bar (G6).

## Inputs

- An optional target: a file, module, package, or symbol. `$ARGUMENTS` when invoked with a target.
- Absent a target: the modules named in the most recent `docs/verification-report.md`, or the lowest-coverage modules in the current run. If neither is available, ask which scope to cover (one question per call).

## Step 0 - confirm the runner

The gates assume `pytest`. Before writing anything, check that the project actually has Python sources and a pytest configuration (`pytest.ini`, `pyproject.toml`, `setup.cfg`, or `tests/`).

If the code under test is not Python — this repository's `src/` is currently JSX — **stop and ask** which runner the student intends (`vitest`, `jest`, or adding Python). Do not write Python tests for JavaScript modules, and do not silently substitute a different runner and report it as the pytest gate. A scope mismatch is reported, not worked around.

## Step 1 - establish the baseline

```bash
pytest --cov --cov-report=term-missing -q
```

Record the total percentage and the `Missing` column for every file. That column is the work list.

If the suite does not run at all, stop: a broken suite is gate G1, and generating tests on top of it hides the failure. Report the error and hand it to `@review` / `@build`.

## Step 2 - rank the gaps

Do not chase the largest `Missing` column. Rank by risk:

1. Money, pricing, auth, permissions, and persistence paths.
2. Error and exception branches.
3. Branching logic and conditionals (the `Missing` column is usually decision points).
4. Pure formatting and display helpers.

Skip generated code, vendored code, and `__main__`/bootstrap blocks unless the project config excludes them — in which case say so in the report rather than padding coverage.

## Step 3 - read before writing

Read each target's source, its callers, and any existing test file for that module. Note the public contract, the documented preconditions, and every branch that is currently uncovered.

## Step 4 - enumerate cases with the break-it heuristics

For each target, walk the checklist below and keep only the cases that would catch a real defect.

| Heuristic | Cases to try |
|---|---|
| Boundary values | `0`, `1`, `-1`, `len`, `len + 1`, first/last valid index, type `MIN`/`MAX` |
| Empty and null | Empty string, empty collection, `None`, missing optional key |
| Type and shape | Wrong type, numeric string, unexpected extra keys, wrong arity |
| Error branches | Each `raise`/`except` path, invalid state, permission denied |
| Ranges and dates | Inclusive vs exclusive slices, timezone/DST rollover, leap day, pagination edges |
| Ordering | Reversed input, duplicate keys, ties, stability of sort |
| Text | Whitespace, unicode, emoji, long strings, casing, trailing newline |
| Limits | Very large input, deep nesting, timeout, retry exhaustion |
| State | Repeated calls, partial failure, rollback after error, idempotency |

## Step 5 - write the tests

Write under `tests/`, mirroring the source layout and matching the naming of existing test files.

- One behavior per test; name it `test_<unit>_<behavior>_<condition>`.
- Follow Arrange-Act-Assert; keep the Act to one call where possible.
- Use `pytest.mark.parametrize` for boundary tables instead of near-duplicate tests.
- Fix time and randomness; never use `sleep` or the network.
- Mock collaborators, never the unit under test.
- Assert exception **type and message** (`pytest.raises(ValueError, match="quantity must be positive")`).

### Assertion substance (gate G6)

Every test MUST assert on a real expected value. Allowed:

```python
def test_total_applies_tier_discount():
    """US-012 / AC-1: 10% off orders of 100 or more."""
    assert total(quantity=4, unit_price=25.0) == 90.0

def test_withdraw_rejects_overdraft():
    account = Account(balance=50)
    with pytest.raises(ValueError, match="insufficient funds"):
        account.withdraw(60)
```

Rejected — these pass while the code is wrong:

```python
assert total(4, 25.0)                 # no expected value
assert total(4, 25.0) is not None     # truthiness only
assert total(4, 25.0) == total(4, 25.0)  # compares to itself
assert True                            # always passes
```

Expected values must come from the specification, a hand-computed example, or a known-good fixture. Never copy the implementation's current output into the assertion — that turns the test into a change-detector.

## Step 6 - map to requirements

Tag each test with the requirement it protects, in the first line of its docstring:

```python
"""US-003 / AC-2: a zero quantity is rejected before pricing."""
```

Use the `US-###` / `AC-##` identifiers from the project's requirements artifacts (`docs/requirements/`, `PM*.md`). If a requirement has no identifier, report that as a traceability gap instead of inventing one — gate G5 in `verify/SKILL.md` depends on these tokens being real.

## Step 7 - re-run and report

```bash
pytest --cov --cov-report=term-missing -q
```

Report, in chat:

| Item | Content |
|---|---|
| Coverage | Before -> after, per file and total, against the 85% gate |
| Tests added | File, count, and the requirement ids they cover |
| Gate status | G1 pass/fail, G2 pass/fail, G6 pass/fail |
| Remaining gaps | Uncovered lines with a one-line reason each |
| Defects found | Input, expected, actual, likely cause at file:line |

You do not write `docs/verification-report.md` — that is `@review`'s artifact. Hand your table over instead.

## Constraints

- Never edit, delete, or weaken a source file or an existing test to make coverage rise. Coverage gained by deleting assertions is a defect, and it is reported as one.
- Never mark a test `skip`/`xfail` to turn the suite green.
- Never read or print `ARC_API_KEY`, `.env*`, or any secret.
- Never `git commit`, `git push`, or delete files.
- If a test exposes a real bug, report the failing input and the proposed fix. Ask for approval with the `question` tool (one question per call) before any source change, then delegate the approved change to `@build` via `Task()`.

---

*Generated for the CS-3704 course; licensed under CC-BY-4.0.*
