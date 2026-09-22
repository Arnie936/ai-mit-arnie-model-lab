// Test-only preload. Never loaded by npm start. It blocks every external request.
import fs from 'node:fs';
import {seedanceTariff} from '../src/pricing.mjs';
const calls=[];let serial=0,unfinished=0,maxUnfinished=0;const jobs=new Map();
const dump=()=>fs.writeFileSync('mock-calls.json',JSON.stringify({calls,unfinished,maxUnfinished}));
globalThis.fetch=async(url,options={})=>{
 const u=new URL(url);if(u.hostname!=='api.higgsfield.ai')throw new Error('External network forbidden in tests');
 const body=options.body?JSON.parse(options.body):null;calls.push({path:u.pathname,body,method:options.method});dump();
 if(u.pathname.startsWith('/estimate/')&&body.prompt==='seedance tariff')return Response.json({type:'description',pricing_description:seedanceTariff});
 if(u.pathname.startsWith('/estimate/'))return Response.json(body.prompt==='missing price'?{type:'description',pricing_description:'A metered tariff'}:{usd:body.prompt==='over budget'?'2.00':'0.20'});
 if(u.pathname.startsWith('/requests/')){const id=u.pathname.split('/')[2],job=jobs.get(id);if(job.polls++===0)return Response.json({request_id:id,status:'queued'});unfinished--;dump();return Response.json({request_id:id,status:'failed'});}
 if(body?.prompt==='uncertain'){throw new Error('Connection lost after submission');}
 const id='fake-'+(++serial);jobs.set(id,{polls:0});unfinished++;maxUnfinished=Math.max(maxUnfinished,unfinished);dump();return Response.json({request_id:id,status:'queued'});
};
