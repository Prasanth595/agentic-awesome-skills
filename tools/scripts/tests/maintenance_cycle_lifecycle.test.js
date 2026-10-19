const assert = require('node:assert/strict');
const {main} = require('../maintenance_cycle.cjs');
const sha = 'a'.repeat(40);
let saved, pending = false, trusted = true;
const store = {readBatch: () => saved && structuredClone(saved), writeBatch: (_, state) => {saved=structuredClone(state);}};
const dependencies = {
  openStore: () => store, readVersion: () => '19.11.0', run: () => '',
  batch: {
    parsePrList: require('../merge_batch.cjs').parsePrList,
    readRepositorySlug: () => 'sickn33/agentic-awesome-skills',
    ensureTrustedMain: () => {if (!trusted) throw Error('Not clean current main'); return sha;},
    assertEffectiveMainProtection: () => {}, assertFullSha: () => {},
  },
  gh: args => {
    const endpoint = args.at(-1);
    if (endpoint.endsWith('/pulls/1')) return {number:1, merged:true, base:{ref:'main'}, head:{sha}, merge_commit_sha:sha};
    if (endpoint.includes('/jobs?')) return [{jobs:[]}];
    return [{workflow_runs:['ci.yml','codeql.yml'].map((name,i)=>({id:i+1,path:'.github/workflows/'+name,head_sha:sha,head_branch:'main',event:'push',status:pending?'in_progress':'completed',conclusion:pending?null:'success'}))}];
  },
};
(async () => {
  const oldLog=console.log, oldExit=process.exitCode;
  console.log=()=>{};
  try {
    trusted=false;
    await assert.rejects(main(['start','--state-dir','/unused','--prs','1'],dependencies),/Not clean/);
    assert.equal(saved,undefined,'do not start from an untrusted source head');
    trusted=true;
    await main(['start','--state-dir','/unused','--prs','1'],dependencies);
    const start=saved.startedAt;
    await main(['verify','--state-dir','/unused'],dependencies);
    assert.ok(saved.completedAt); assert.equal(saved.attempts.at(-1).success,true);
    pending=true;
    await main(['verify','--state-dir','/unused'],dependencies);
    assert.equal(process.exitCode,1);
    assert.equal(saved.completedAt,undefined,'a failed recheck cannot retain the prior completion');
    assert.equal(saved.elapsedMs,undefined);
    assert.equal(saved.measurement,undefined);
    assert.equal(saved.startedAt,start,'never reset the original timer');
    assert.equal(saved.attempts[0].success,true,'retain historical proof');
    assert.equal(saved.attempts[1].success,false);
    await assert.rejects(main(['start','--state-dir','/unused','--prs','1'],dependencies),/already exists/);
  } finally {console.log=oldLog;process.exitCode=oldExit;}
})().catch(error=>{console.error(error);process.exitCode=1;});
