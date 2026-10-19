# Complete maintenance cycle

Use the current protected main tools. Do not reconstruct ordinary commands from
history. The guided runner schedules existing gates; it never replaces semantic
review or `merge:batch`, and never creates a release, tag or deployment.

## One source batch

Create a private external state directory (mode 0700). Start the clock before
triage/review, not when CI begins. Use the same directory through completion:

```sh
npm run maintenance:cycle -- start --state-dir /absolute/private/state --prs 123,124
npm run maintenance:cycle -- intake --state-dir /absolute/private/state
```

Intake returns every PR, including each blocker and the required next action.
A blocked first PR does not suppress the rest. Read the complete changed skill
trees once; `maintainer:dossier -- --prs 123,124 --output /absolute/private/dossier.json`
provides immutable file inventories. Do not treat a dossier as approval.

After actual review, use the full SHA and describe the reviewed evidence:

```sh
npm run maintenance:cycle -- merge --state-dir /absolute/private/state --prs 123 --reviewed-head FULL_40_CHARACTER_SHA --reviewer maintainer --review-evidence 'Complete bundle, source, safety and limitations reviewed'
```

Strict protection may make the next PR behind after a merge. Deliberately update
that one branch, bound to its observed head; this is one request, not an automatic
retry loop. Re-intake and review any changed content before resuming:

```sh
npm run maintenance:cycle -- align --state-dir /absolute/private/state --prs 124 --expected-head FULL_40_CHARACTER_SHA
```

Use the existing authenticated receipt only if content and context still match.
Never fabricate a new attestation from an old head or an automated score.
After the last merge, fast-forward the clean isolated main checkout. Wait for
its exact CI and CodeQL runs to finish, then close the recorded cycle:

```sh
npm run maintenance:cycle -- verify --state-dir /absolute/private/state
npm run maintenance:cycle -- status --state-dir /absolute/private/state
```

Verification fetches current protection, proves every merge reachable from main,
requires successful latest push CI/CodeQL on that exact SHA, and confirms the
runtime version is unchanged. Pending/failed/missing runs are not completion.
The report includes original start, elapsed wall time, blocked attempts, explicit
branch updates and raw final job timings. Keep agent review gaps and retries in
elapsed time. A no-release source batch is not comparable to a full release.

## Stop repeated investigation, not independent work

Classify each blocker once. Record its exact head, reason, and repair or required
policy decision. Do not reread the same history when neither head, protected
policy nor relevant evidence changed. After two equivalent unproductive checks,
park that PR and continue independent PRs. A policy repair is a separate protected
owner PR; never weaken a rule just to pass a contributor PR.

Reviewed extra support paths are exact entries in the protected fork ledger and
bind the complete skill tree. Hosted sources without a public repository and
immutable upstream repins use `tools/config/reviewed-source-exceptions.json`:
exact source, type, repository, before/after identity and complete tree must match.
Hosted additions also require their reviewed credit URL in README. Changed bytes
or modes invalidate the exception. Other regression blockers remain active.

## Release work only when requested

Write/review the changelog against the actual tag diff before pushing its PR;
exclude pre-existing behavior and maintainer bookkeeping from skill counts.
Do not create a second correction PR for a known error in an unmerged first PR.
`release:prepare` already runs its suite. Do not run `release:preflight` first
unless diagnosing a specific failure: it is now an isolated diagnostic preview
and discards expected generated drift without modifying source main.

After publication, dispatch legacy synchronization in **sickn33/sickn33.github.io**:
`gh workflow run legacy-redirect-sync.yml --repo sickn33/sickn33.github.io -f live_mode=all`.
Do not search for that workflow in the catalog repository.

For a read-only fresh-process host check, use the existing verified implementation:

```sh
npm run maintenance:cycle -- hosts --state-dir /absolute/private/state --version X.Y.Z --config /absolute/existing/config.toml
```

This reuses `release_inspect` runtime integrity and MCP initialize/initialized/
tools-list checks. Never write an ad-hoc handshake or mistake it for native-client
reconnection. Host configuration updates remain separately authorized.
