# Component validation

`tools/config/maintenance-policy.json` defines the conservative path policy.
`maintenance_validate.cjs` resolves immutable base/head commits, classifies their
raw Git diff and executes the complete ordered plan. A missing, failed or skipped
required result fails the receipt. Copies affect their destination; renames affect
both paths. Unsafe modes, unknown paths, shared dependencies, workflow changes and
operational maintainer instructions use the full lane.

| Lane | Required work |
| --- | --- |
| Editorial | Repository documentation consistency and documentation security |
| Catalog | Schema/warning budget, security, ephemeral generation, global references and catalog integrity |
| Runtime | Catalog checks plus Core tests and installer/package regressions |
| Web | Catalog checks plus web coverage and build |
| Full | Catalog checks, complete repository suite, web coverage and build |

The four protected check names remain unchanged. `pr-policy` still controls fork
execution, `pr-evidence` still checks the complete changed skill bundle and
`artifact-preview` still verifies the exact-head preview. Semantic review remains
independent. A narrow validation plan never grants approval or changes skill
eligibility. No required workflow is skipped by a path trigger.

Use `npm run maintenance:validate -- --base <base-sha> --head <head-sha> --plan`
to inspect the plan. Execution regenerates temporary outputs: use a disposable
checkout, or use `pr:preflight`, which creates that checkout for you. The receipt
includes policy digest, immutable endpoints, ordered checks, durations and outcomes.

Public release verification binds the immutable tag to protected-main ancestry;
successor commits do not invalidate it. `publicReleaseComplete` and `complete`
describe public distribution. `personalEnvironmentUpdated` separately describes
configured clients and explicit session reload evidence. A successful stdio probe
does not prove that an already-open client reloaded.

## Migration status

The implementation branch is not yet the production contract. Before integration,
complete the distribution-candidate pipeline, snapshot transition, review receipts,
resumable coordination and independent catalog identity; reconcile the release
guides and all completion rules with that final implementation. Historical timing
observations are not a controlled before/after benchmark.
