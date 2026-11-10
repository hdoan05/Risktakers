<!--
Template: Verification report (milestone quality gates).
Producer: @review, via the verify skill.
Consumer:  read this file and follow its structure; replace every [placeholder].
Output:    docs/verification-report.md, written directly by @review (the only
           file that agent may write). Overwrite the gate, coverage,
           failing-test, and traceability sections each run; append one row to
           Run history.
Rules:     every row cites command + evidence; stop at the first failing gate and
           mark the rest "not run"; never soften a threshold, skip a test, or add
           a lint ignore to reach PASS; recommendations describe gate status, not
           a grade.
-->

# Verification Report: [milestone / assignment id]

- **Run at:** [YYYY-MM-DDThh:mm:ssZ]
- **Commit:** [short SHA] on [branch] ([N] uncommitted files)
- **Scope:** [modules, packages, or paths covered]
- **Runner:** [pytest / vitest / ...] at [version]
- **Produced by:** @review (course-provided AI assistant; not a grading decision)

## Recommendation

**Verdict: [READY | NOT READY]**

[One paragraph. If READY: all six gates pass on this commit, and here is what was
and was not exercised. If NOT READY: name the blocking gates first, then the
secondary concerns, each with its evidence in one clause.]

- Blocking: [gate ids]
- Secondary: [gate ids or none]
- Not verified by this report: [anything the gates do not cover]

## Gate results

Run in order; the run stops at the first `FAIL` or `BLOCKED`.

| Id | Gate | Threshold | Command | Status | Evidence |
|----|------|-----------|---------|--------|----------|
| G1 | Tests pass | 0 failures, 0 errors | `pytest -q` | [PASS/FAIL/BLOCKED/not run] | [e.g. 142 passed in 3.2s] |
| G2 | Line coverage | >= 85% | `pytest --cov --cov-report=term-missing -q` | [status] | [e.g. 87.4% (gate 85%)] |
| G3 | Lint | 0 errors | [`ruff check .` / `eslint` / ...] | [status] | [e.g. 0 errors, 6 warnings] |
| G4 | Clean install and import | manifest consistent, all imports resolve | [`pip check` + `pytest --collect-only -q` + `compileall`] | [status] | [e.g. no broken requirements] |
| G5 | Traceability | every US/AC mapped to a test | grep `tests/` for `US-###` / `AC-##` | [status] | [e.g. 18 of 18 criteria mapped] |
| G6 | Assertion substance | every test asserts a real value | manual + grep review | [status] | [e.g. 3 tests assert only non-null] |

## Coverage

**Total: [xx.x]% lines, [xx.x]% branches** against the 85% gate (G2).

| File | Lines | Missed | Cover | Missing lines |
|------|-------|--------|-------|---------------|
| [`src/...`] | [N] | [N] | [xx%] | [12-14, 31, 88-92] |

[If G2 was not run, say so here and give the reason.]

## Failing tests

[If G1 passed: "None." If it failed, one block per failure.]

### [`tests/test_x.py::test_name`]

- **Gate:** [G1]
- **Expected:** [`90.0`]
- **Actual:** [`100.0`]
- **Location:** [`src/pricing.py:47`]
- **Likely cause:** [one or two sentences]
- **Output excerpt:**
  ```
  [the assertion message, verbatim]
  ```

## Traceability

Requirement sources: [paths scanned]. Requirement ids found: [N].

| Story | Acceptance criterion | Test node id(s) | Status |
|-------|----------------------|-----------------|--------|
| [US-001] | [AC-1] | [`tests/test_x.py::test_y`] | [covered / NOT COVERED] |
| [US-001] | [AC-2] | [node id] | [covered / NOT COVERED] |

[Uncovered rows are a G5 failure. If no requirement source exists, state that
G5 is BLOCKED and traceability cannot be demonstrated.]

## Test-quality observations (G6)

| Test node id | Problem | Line |
|--------------|---------|------|
| [`tests/test_x.py::test_y`] | [asserts only `is not None`] | [42] |

[Flag any test deleted, skipped, or weakened relative to the previous run, and any
threshold or lint ignore that changed — those are not fixes.]

## Proposed fixes

Proposals only. Nothing here has been applied.

| Gate | Proposed change | Owner | Needs approval |
|------|-----------------|-------|----------------|
| [G2] | [add boundary tests for `pricing.apply_discount`] | [@tester] | [no — tests may be added automatically] |
| [G1] | [guard division by zero at `src/pricing.py:47`] | [@build] | [yes — source change] |

## Run history

| Run at | Commit | G1 | G2 | G3 | G4 | G5 | G6 | Verdict |
|--------|--------|----|----|----|----|----|----|---------|
| [timestamp] | [sha] | [PASS] | [87.4%] | [PASS] | [PASS] | [PASS] | [PASS] | [READY] |
