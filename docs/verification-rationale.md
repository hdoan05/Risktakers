# Verification Agents and Skills: Rationale

## Quality gates
| Gate | What it checks | Pass criteria | If it fails | Why we added it |
|------|----------------|---------------|-------------|-----------------|
| 1. Unit tests | Automated test suite (Vitest) | 0 failures | Stop, report failing tests, propose fix | Catches broken behavior before a milestone |
| 2. Coverage | Line coverage of src/ | ≥ 70% | Stop, list uncovered areas | UI-heavy app with mocked Supabase; 70% is realistic but meaningful |
| 3. Lint | ESLint | 0 errors (warnings OK) | Stop, list errors | Keeps code consistent across 4 teammates |
| 4. Build | npm ci + npm run build | Both exit 0 | Stop, show build error | Confirms the app actually ships |
| 5. Traceability | Black Box Test Plan → tests | Every scenario has ≥ 1 test | Stop, list unmapped scenarios | Ties tests back to our requirements |

## Skills
- **/test** (`.opencode/skills/test/SKILL.md`): generates tests from the Black Box Test Plan, runs them, and returns pass/fail, coverage, and traceability. Run it after new features or bug fixes. Outputs tests in `tests/` and a test run summary. Needed because our project had no automated tests.
- **/verify** (`.opencode/skills/verify/SKILL.md`): checks all 5 gates in order and writes `docs/verification-report.md` with a READY / NOT READY recommendation. Run it before each milestone submission. Needed so we have a consistent, evidence-based readiness check.

## Agents
- **tester** (`.opencode/agents/tester.md`): adversarial tester that tries to break the app with edge cases. Can read code, write only in `tests/`, and run test commands. It can't edit source, .env files, or templates, touch Supabase, delete files, or commit, because its job is finding problems, not fixing them. Uses `/test`.
- **reviewer** (`.opencode/agents/reviewer.md`): decides if the project is milestone-ready. Read-only except for writing the report; can run test, lint, and build commands. It can't fix code, so it gives an unbiased judgment instead of grading its own fixes. Uses `/verify`.

## Results and changes
The tester installed Vitest (with our approval) and wrote 28 tests covering all 5 scenarios. 25 passed and 3 failed, exposing real bugs: Home crashes on null event data, the leaderboard crashes with no players, and unknown routes render a blank page (no 404). The reviewer marked the project NOT READY at Gate 1 and proposed fixes without applying them. Changes needed: fix the 3 bugs, add an ESLint config, add our Black Box Test Plan to the repo, then rerun /verify.