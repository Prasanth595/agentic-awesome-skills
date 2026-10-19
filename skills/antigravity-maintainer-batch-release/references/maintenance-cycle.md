# Complete maintenance cycle

Use the current protected main tools. Do not reconstruct ordinary commands from
history. The guided runner schedules existing gates; it never replaces semantic
review or `merge:batch`, and never creates a release, tag or deployment.

## One source batch

First inventory the authorized PR numbers, then use a clean isolated `main` equal
to freshly fetched `origin/main`. Create a private external state directory (mode
0700). Start the clock before content triage/review, not when CI begins. The start
command rejects a dirty, topic-branch, stale or wrong-repository checkout. Use the
same directory through completion. If there are no source PRs, record audit time
separately; this source-batch runner requires a nonempty exact PR list:

```sh
npm run maintenance:cycle -- start --state-dir /absolute/private/state --prs 123,124
npm run maintenance:cycle -- intake --state-dir /absolute/private/state
```

Intake returns every PR, including each blocker and the required next action.
A blocked first PR does not suppress the rest. Read the complete changed skill
trees once; `npm run maintainer:dossier -- --prs 123,124 --output /absolute/private/dossier.json`
provides immutable file inventories. `skills` describes current trees;
`previousSkills` describes changed trees at the merge base, including deletions
and old rename paths. Inspect both as needed; no entry grants approval. Advisory
Jev priorities never exempt other changed skills from semantic review.

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
Run optional host probes before final verification. A new action invalidates
current completion, while the previous proof stays in attempt history and the
original timer is preserved. A failed re-verification cannot retain a completed
status. After the last merge, fast-forward the clean isolated main checkout. Wait for
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
park that PR and continue independent PRs. Pending CI is polled at the shared
20-second default; changed head/base, closure, conflicts or an explicit behind
state stop the wait instead of spending the remaining budget on stale checks.
PR IDs must be complete positive integers; malformed IDs are rejected, not truncated.
A policy repair is a separate protected
owner PR; never weaken a rule just to pass a contributor PR.

Reviewed extra support paths are exact entries in the protected fork ledger and
bind the complete skill tree. Hosted sources without a public repository and
immutable upstream repins use `tools/config/reviewed-source-exceptions.json`:
exact source, type, repository, before/after identity and complete tree must match.
Hosted additions also require their reviewed credit URL in README. Changed bytes
or modes invalidate the exception. Other regression blockers remain active.

## Release work only when requested

The source runner deliberately requires an unchanged runtime version. Complete
its `verify` **before** `release:prepare`; do not run it again to close a release.
Record a separate overall start/end covering source review through final
`release:verify` when measuring a combined source-and-release task.

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

This command needs an existing source-cycle state and belongs before its final
verification. For a release-only task, use `npm run release:verify -- --version X.Y.Z --hosts /absolute/private/hosts.json` instead. The JSON array is the complete
host inventory, replacing defaults; include every known configured host. Atlas
uses `{ "host": "codex", "config": "/absolute/home/.codex-atlas/config.toml" }`.
Use actual absolute paths and existing configurations only.

The source-cycle probe reuses `release_inspect` runtime integrity and MCP initialize/initialized/
tools-list checks. Never write an ad-hoc handshake or mistake it for native-client
reconnection. Host configuration updates remain separately authorized.
