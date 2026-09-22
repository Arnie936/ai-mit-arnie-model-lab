// Free estimate calls only. No generation or upload endpoint is called.
import fs from 'node:fs';
import {modelDefaults} from '../src/models.mjs';
const base=process.env.LAB_URL||'http://127.0.0.1:3210';
const boot=await fetch(base+'/api/bootstrap').then(r=>r.json());
const results=[];
for(const m of boot.models){
 if(!m.enabled){results.push({model:m.name,id:m.id,enabled:false,reason:m.reason,source:m.source});continue;}
 const settings={kind:m.kind,prompt:'A lime green ceramic cup on a charcoal desk.',...modelDefaults(m)};
 const r=await fetch(base+'/api/estimate',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':boot.token},body:JSON.stringify({modelIds:[m.id],settings,mode:'single'})});
 const q=await r.json();results.push({model:m.name,id:m.id,endpoint:m.path,source:m.source,settings,estimateUsd:q.totalUsd,estimateBasis:q.entries?.[0]?.basis,assumption:q.entries?.[0]?.assumption||null,errors:q.entries?.[0]?.errors||[q.error],pricingDescription:q.entries?.[0]?.pricingDescription||null});
}
const report={checkedAt:new Date().toISOString(),billing:'No paid requests. Account estimates and explicitly labelled tariff estimates; not actual costs.',results};
fs.mkdirSync('docs',{recursive:true});
fs.writeFileSync('docs/api-audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(results.map(r=>({model:r.model,estimateUsd:r.estimateUsd,errors:r.errors,enabled:r.enabled})),null,2));
