#!/usr/bin/env node
"use strict";
// Scheduling and measurement only. merge_batch remains the sole merge authority.
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const batch = require('./merge_batch.cjs');
const {openStore} = require('../lib/maintenance-state');
const ROOT = path.resolve(__dirname, '../..');
const REPO = 'sickn33/agentic-awesome-skills';
function run(command, args) { return execFileSync(command, args, {cwd:ROOT, encoding:'utf8', timeout:120000, maxBuffer:16*1024*1024}).trim(); }
const gh = args => JSON.parse(run('gh', args));
function parse(argv) {
  const command=argv.shift(), options={command, reviewedHeads:[]};
  if(!['start','intake','merge','align','verify','status','hosts'].includes(command)) throw Error('Use start, intake, merge, align, verify, status or hosts');
  for(let i=0;i<argv.length;i+=2) {
    if(!['--state-dir','--prs','--reviewed-head','--reviewer','--review-evidence','--version','--config','--expected-head'].includes(argv[i]) || !argv[i+1] || argv[i+1].startsWith('--')) throw Error('Unknown or incomplete option: '+argv[i]);
    if(argv[i]==='--reviewed-head') options.reviewedHeads.push(batch.assertFullSha(argv[i+1], 'Reviewed head'));
    else options[argv[i].slice(2)]=argv[i+1];
  }
  if(!options['state-dir']) throw Error('A private external --state-dir is required');
  return options;
}
function nextAction(result) {
  if(result.merged) return 'Verify protected-main ancestry and exact-main CI.';
  if(!result.reason) return 'Review the complete immutable skill tree once; then merge with exact-head attestation.';
  if(/BEHIND|behind|base.*drift/i.test(result.reason)) return 'Use align once with the observed --expected-head, then re-intake; never loop or bypass strict protection.';
  if(/provenance|unapproved_path|approval-safe/.test(result.reason)) return 'Record this blocker once. A reviewed protected-base policy PR or source repair is required; continue other PRs.';
  if(/conflict/i.test(result.reason)) return 'Resolve the source branch conflict and review the resulting diff.';
  return 'Inspect the exact failure once; repair its cause before repeating this stage.';
}
function proofForRuns(runs, sha) {
  return ['.github/workflows/ci.yml','.github/workflows/codeql.yml'].map(workflow=>{
    const candidates=runs.filter(r=>r.head_sha===sha && r.head_branch==='main' && r.event==='push' && r.path===workflow).sort((a,b)=>b.id-a.id);
    const latest=candidates[0];
    if(!latest || latest.status!=='completed' || latest.conclusion!=='success') throw Error(`${workflow}: missing, pending or failed on exact main ${sha}`);
    return latest;
  });
}
async function main(argv) {
  const o=parse(argv), store=openStore(o['state-dir'], ROOT);
  let state=store.readBatch('cycle');
  if(o.command==='start') {
    if(state) throw Error('Cycle already exists; use status/resume, never reset its timer');
    const prs=batch.parsePrList(o.prs);
    state={schemaVersion:1,repository:REPO,scope:'source-maintenance-no-release',startedAt:new Date().toISOString(),prs,attempts:[],baselineMain:run('git',['rev-parse','HEAD']), baselineVersion:JSON.parse(fs.readFileSync(path.join(ROOT,'package.json'))).version};
    store.writeBatch('cycle', state);
  } else if(!state) throw Error('Run start before analysis/review to include their elapsed time');
  if(o.prs && o.command!=='start' && batch.parsePrList(o.prs).some(n=>!state.prs.includes(n))) throw Error('PR outside the recorded cycle');
  if(state.repository!==REPO) throw Error('Repository mismatch');
  if(o.command==='status' || o.command==='start') { console.log(JSON.stringify(state,null,2)); return; }
  const attempt={stage:o.command,startedAt:new Date().toISOString()};state.attempts.push(attempt);store.writeBatch('cycle',state);
  try {
    if(o.command==='intake' || o.command==='merge') {
      const results=await batch.runBatch(ROOT,o.prs?batch.parsePrList(o.prs):state.prs,{stateDir:o['state-dir'],prepareOnly:o.command==='intake',dryRun:o.command==='intake',reviewedHeads:o.reviewedHeads,reviewer:o.reviewer,reviewEvidence:o['review-evidence']});
      attempt.results=results.map(result=>({...result,nextAction:nextAction(result)}));
      attempt.success=results.every(r=>r.status!=='blocked');
      if(!attempt.success) process.exitCode=1;
    } else if(o.command==='align') {
      const prs=batch.parsePrList(o.prs); if(prs.length!==1) throw Error('Align one exact PR deliberately');
      const expected=batch.assertFullSha(o['expected-head'],'Expected head');
      const pr=gh(['api',`repos/${REPO}/pulls/${prs[0]}`]);
      if(pr.state!=='open' || pr.base.ref!=='main' || pr.head.sha!==expected) throw Error('PR identity changed; re-intake');
      // One explicit request; never force push or retry automatically.
      attempt.result=gh(['api','--method','PUT',`repos/${REPO}/pulls/${prs[0]}/update-branch`,'-f',`expected_head_sha=${expected}`]);
      attempt.success=true;
    } else if(o.command==='hosts') {
      if(!o.version || !o.config) throw Error('hosts requires --version and --config (existing Codex/Atlas config)');
      attempt.result=await require('./release_inspect.cjs').hostProof('codex',path.resolve(o.config),o.version);
      attempt.success=attempt.result.status==='verified';
      if(!attempt.success) throw Error('Host not verified');
    } else if(o.command==='verify') {
      const sha=batch.ensureTrustedMain(ROOT);batch.assertEffectiveMainProtection(ROOT, REPO);
      const version=JSON.parse(fs.readFileSync(path.join(ROOT,'package.json'))).version;
      if(version!==state.baselineVersion) throw Error('Runtime version changed during no-release maintenance');
      const pulls=state.prs.map(n=>gh(['api',`repos/${REPO}/pulls/${n}`]));
      for(const pr of pulls) {
        if(!pr.merged || pr.base.ref!=='main') throw Error(`PR #${pr.number} not merged into main`);
        batch.assertFullSha(pr.merge_commit_sha,'Merge SHA');run('git',['merge-base','--is-ancestor',pr.merge_commit_sha,sha]);
      }
      const runs=gh(['api','--paginate','--slurp',`repos/${REPO}/actions/runs?head_sha=${sha}&per_page=100`]).flatMap(p=>p.workflow_runs);
      const proofs=proofForRuns(runs,sha);
      const raw=proofs.map(r=>({run:r,jobs:gh(['api','--paginate','--slurp',`repos/${REPO}/actions/runs/${r.id}/jobs?per_page=100`]).flatMap(p=>p.jobs)}));
      if(batch.ensureTrustedMain(ROOT)!==sha) throw Error('Main changed during final verification');
      attempt.result={main:sha,pulls:pulls.map(p=>({number:p.number,head:p.head.sha,merge:p.merge_commit_sha,mergedAt:p.merged_at})),workflows:raw};
      attempt.success=true;state.completedAt=new Date().toISOString();state.elapsedMs=Date.parse(state.completedAt)-Date.parse(state.startedAt);
      state.measurement='observed-source-maintenance-through-final-verification';
      state.limitations=['Includes review, agent gaps, blocked attempts and branch updates since start.','Not comparable to a release cycle or CI-only timing.','No runtime/catalog publication or native-client restart is performed.'];
    }
  } catch(error) {attempt.success=false;attempt.error=error.message;process.exitCode=1;}
  finally {attempt.completedAt=new Date().toISOString();attempt.elapsedMs=Date.parse(attempt.completedAt)-Date.parse(attempt.startedAt);store.writeBatch('cycle',state);console.log(JSON.stringify({startedAt:state.startedAt,completedAt:state.completedAt,elapsedMs:state.elapsedMs,attempt},null,2));}
}
module.exports={parse,nextAction,proofForRuns};
if(require.main===module)main(process.argv.slice(2)).catch(e=>{console.error(e.message);process.exitCode=1;});
