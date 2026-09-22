import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID,randomBytes} from 'node:crypto';
import {models,selections,prepare} from './src/models.mjs';
import {api,dollars,publicFetch} from './src/provider.mjs';
import {estimatePrice} from './src/pricing.mjs';
import {zip} from './src/zip.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
try{process.loadEnvFile(path.join(root,'.env'));}catch(e){if(e.code!=='ENOENT')throw e;}
const credentials=process.env.HF_CREDENTIALS||process.env.HIGGSFIELD_API_KEY||process.env.HF_KEY||'';
const port=Number(process.env.PORT||3210);let limit=dollars(process.env.MAX_SPEND_USD??1);
if(limit===null)throw new Error('MAX_SPEND_USD muss eine nichtnegative Zahl sein.');
const dir=path.join(root,'data'),media=path.join(dir,'media'),uploads=path.join(dir,'uploads');
for(const d of [dir,media,uploads])fs.mkdirSync(d,{recursive:true});
const lockPath=path.join(dir,'server.lock');
if(fs.existsSync(lockPath)){const previous=Number(fs.readFileSync(lockPath,'utf8'));let alive=false;try{process.kill(previous,0);alive=true;}catch{}if(alive)throw new Error('Für diese Daten läuft bereits eine App-Instanz.');fs.unlinkSync(lockPath);}
fs.writeFileSync(lockPath,String(process.pid),{flag:'wx'});
process.on('exit',()=>{try{if(fs.readFileSync(lockPath,'utf8')===String(process.pid))fs.unlinkSync(lockPath);}catch{}});
const statePath=path.join(dir,'state.json');
const state=fs.existsSync(statePath)?JSON.parse(fs.readFileSync(statePath,'utf8')):{runs:[],uploads:[],access:{}};
state.access||={};
limit=dollars(state.budgetLimitUsd)??limit;
const save=()=>{fs.writeFileSync(statePath+'.tmp',JSON.stringify(state,null,2));fs.renameSync(statePath+'.tmp',statePath);};
const used=()=>state.runs.flatMap(r=>r.jobs).reduce((s,j)=>s+j.reservedUsd,0);
const token=randomBytes(32).toString('hex'),quotes=new Map();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const active=new Set();let workers=0;
const modelById=id=>models.find(m=>m.id===id);
function safeJob(job){const {remoteUrl,...rest}=job;return rest;}
function publicRuns(){return state.runs.map(r=>({...r,jobs:r.jobs.map(safeJob),actualUsd:r.jobs.every(j=>j.actualUsd!==null)?r.jobs.reduce((a,j)=>a+j.actualUsd,0):null}));}
function json(res,body,status=200){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(body));}
async function body(req,max=1024*1024){let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>max)throw new Error('Datei oder Anfrage zu groß.');chunks.push(chunk);}return Buffer.concat(chunks);}
async function requestJson(req){if(!req.headers['content-type']?.startsWith('application/json'))throw new Error('JSON erforderlich.');return JSON.parse((await body(req)).toString());}
function budget(){return {limitUsd:limit,reservedUsd:used(),remainingUsd:Math.max(0,limit-used())};}
async function estimate(input){
 const {modelIds,settings,referenceIds=[],mode='single',resolutionOverrides={}}=input;
 if(!Array.isArray(modelIds)||!modelIds.length||modelIds.length>6||new Set(modelIds).size!==modelIds.length)throw new Error('Ungültige Modellauswahl.');
 if(!settings||!['image','video'].includes(settings.kind))throw new Error('Medientyp fehlt.');
 if(!Array.isArray(referenceIds)||referenceIds.length>4||new Set(referenceIds).size!==referenceIds.length)throw new Error('Ungültige Referenzen.');
 if(!['single','comparison','free'].includes(mode))throw new Error('Ungültiger Laufmodus.');
 if(mode!=='comparison'&&modelIds.length!==1)throw new Error('Einzelstart braucht genau ein Modell.');
 if(!resolutionOverrides||typeof resolutionOverrides!=='object'||Array.isArray(resolutionOverrides)||Object.entries(resolutionOverrides).some(([id,value])=>!modelIds.includes(id)||typeof value!=='string'))throw new Error('Ungültige Auflösungen pro Modell.');
 if(mode==='free'&&Object.keys(resolutionOverrides).length)throw new Error('Freies Testfeld nutzt die gemeinsamen Einstellungen.');
 const refs=referenceIds.map(id=>{const ref=state.uploads.find(r=>r.id===id);if(!ref)throw new Error('Referenz nicht gefunden.');return ref;});
 const entries=[];
 for(const id of modelIds){const m=modelById(id);if(!m||m.kind!==settings.kind||mode==='comparison'&&!m.fixed||mode==='free'&&!selections[settings.kind].includes(id))throw new Error('Modell passt nicht zu diesem Lauf.');
  const effectiveSettings={...settings,...(resolutionOverrides[id]?{resolution:resolutionOverrides[id]}:{})};const adapter=prepare(m,effectiveSettings,refs.map(r=>r.url));const entry={modelId:id,name:m.name,variant:m.variant,resolution:effectiveSettings.resolution,...adapter,usd:null};
  if(!adapter.errors.length){try{const result=await api('estimate/'+adapter.path,credentials,adapter.input);Object.assign(entry,estimatePrice(result,m,adapter.input,adapter.path));entry.credits=result.credits;entry.pricingDescription=typeof result.pricing_description==='string'?result.pricing_description:null;if(entry.usd===null)entry.errors.push('USD-Schätzung fehlt. Start gesperrt.'+(m.id==='seedance25'?' Für die Tarifschätzung 720p ohne Referenz wählen.':''));state.access[id]={status:entry.usd===null?'missing-price':entry.basis==='tariff'?'tariff':'verified',checkedAt:new Date().toISOString(),message:entry.usd===null?'API liefert keinen kontobezogenen USD-Wert. Start gesperrt.':entry.assumption||'Kostenschätzung mit diesem Account erfolgreich.'};}catch(e){entry.errors.push(e.message);if([403,404,423,503].includes(e.status))state.access[id]={status:'unavailable',checkedAt:new Date().toISOString(),message:e.message};}}
  entries.push(entry);
 }
 save();const total=entries.every(e=>e.usd!==null)?entries.reduce((s,e)=>s+e.usd,0):null;
 const quote={id:randomUUID(),createdAt:Date.now(),expiresAt:Date.now()+120000,settings,resolutionOverrides,referenceIds,mode,entries,totalUsd:total};
 quotes.set(quote.id,quote);for(const [id,q] of quotes)if(q.expiresAt<Date.now())quotes.delete(id);
 return {...quote,budget:budget(),canStart:entries.every(e=>!e.errors.length)&&total!==null&&total+used()<=limit+1e-9};
}
function start(quoteId){
 const q=quotes.get(quoteId);if(!q)throw new Error('Schätzung fehlt oder wurde bereits verwendet.');if(q.runId)return state.runs.find(r=>r.id===q.runId);
 if(q.expiresAt<Date.now())throw new Error('Schätzung abgelaufen. Kosten neu prüfen.');
 if(q.entries.some(e=>e.errors.length)||q.totalUsd===null)throw new Error('Inkompatible Einstellungen oder fehlende Kosten.');
 if(used()+q.totalUsd>limit+1e-9)throw new Error('Budgetgrenze erreicht. Kein Auftrag gesendet.');
 const run={id:randomUUID(),mode:q.mode,createdAt:new Date().toISOString(),settings:q.settings,resolutionOverrides:q.resolutionOverrides,referenceIds:q.referenceIds,estimateUsd:q.totalUsd,jobs:q.entries.map(e=>({id:randomUUID(),modelId:e.modelId,name:e.name,variant:e.variant,path:e.path,input:e.input,status:'waiting',estimateUsd:e.usd,estimateBasis:e.basis,estimateSource:e.source,estimateAssumption:e.assumption||null,accountEstimateUsd:e.accountUsd,reservedUsd:e.usd,actualUsd:null,actualSource:null,createdAt:new Date().toISOString(),requestId:null,file:null,error:null}))};
 state.runs.unshift(run);q.runId=run.id;save();pump();return run;
}
async function storeResult(job){
 if(!job.remoteUrl)return;job.saveError=null;
 try{const response=await publicFetch(job.remoteUrl);const type=response.headers.get('content-type')?.split(';')[0],extensions={'image/png':'png','image/jpeg':'jpg','image/webp':'webp','video/mp4':'mp4','video/quicktime':'mov'};const ext=extensions[type];if(!ext)throw new Error('Unbekanntes Ausgabeformat.');
 const filename=job.id+'.'+ext,tmp=path.join(media,filename+'.part');let bytes=0;const handle=fs.openSync(tmp,'w');try{for await(const chunk of response.body){bytes+=chunk.length;if(bytes>250*1024*1024)throw new Error('Ausgabe größer als 250 MB.');fs.writeSync(handle,chunk);}}finally{fs.closeSync(handle);}fs.renameSync(tmp,path.join(media,filename));job.file=filename;
 }catch(e){job.saveError=e.message;}save();
}
async function poll(job){
 const begin=Date.now();let delay=1500,failures=0;
 while(Date.now()-begin<30*60*1000){
  try{const result=await api(`requests/${encodeURIComponent(job.requestId)}/status`,credentials);failures=0;job.status=result.status;job.lastCheckedAt=new Date().toISOString();job.error=null;
   if(['completed','failed','nsfw','canceled'].includes(result.status)){
    job.finishedAt=new Date().toISOString();job.elapsedMs=Date.now()-Date.parse(job.startedAt||job.createdAt);
    // No documented machine-readable actual billing field. Do not infer it from an estimate.
    if(result.status!=='completed'){job.error=result.status==='nsfw'?'Inhalt vom Anbieter abgelehnt.':result.status==='canceled'?'Auftrag abgebrochen.':'Generierung beim Anbieter fehlgeschlagen.';job.reservedUsd=0;}
    else{job.remoteUrl=result.images?.[0]?.url||result.video?.url;if(!job.remoteUrl)job.saveError='Fertig gemeldet, aber keine Medien-URL vorhanden.';}
    save();if(job.remoteUrl)await storeResult(job);return;
   }
   if(!['queued','in_progress'].includes(result.status))throw new Error('Unbekannter API-Status.');save();
  }catch(e){failures++;job.error=e.message;save();if(failures>=5)break;}
  await sleep(delay);delay=Math.min(15000,Math.round(delay*1.4));
 }
 job.status='paused';job.error='Statusabfrage pausiert. Der API-Auftrag kann weiterlaufen. Nur Status erneut prüfen, keinen Doppelauftrag starten.';save();
}
async function execute(job){
 job.status='submitting';job.startedAt=new Date().toISOString();save();
 try{const result=await api(job.path,credentials,job.input);if(typeof result.request_id!=='string')throw new Error('Keine Request-ID erhalten. Annahme unklar.');job.requestId=result.request_id;job.status='queued';save();await poll(job);}
 catch(e){job.status=e.status>=400&&e.status<500?'rejected':'uncertain';job.error=e.message;if(job.status==='rejected')job.reservedUsd=0;job.finishedAt=new Date().toISOString();save();}
}
function pump(){for(const job of state.runs.flatMap(r=>r.jobs)){if(workers>=2)return;if(job.status!=='waiting'||active.has(job.id))continue;workers++;active.add(job.id);execute(job).finally(()=>{workers--;active.delete(job.id);pump();});}}
for(const j of state.runs.flatMap(r=>r.jobs)){if(['waiting','submitting','queued','in_progress'].includes(j.status)){j.status=j.requestId?'paused':j.status==='waiting'?'interrupted':'uncertain';j.error='App neu gestartet. Kein Auftrag wurde erneut gesendet.';if(j.status==='interrupted')j.reservedUsd=0;}}save();
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4','.mov':'video/quicktime','.woff2':'font/woff2','.json':'application/json','.md':'text/plain; charset=utf-8'};
function sendFile(req,res,file,download){const stat=fs.statSync(file),type=mime[path.extname(file)]||'application/octet-stream';res.setHeader('Content-Type',type);if(download)res.setHeader('Content-Disposition',`attachment; filename="${path.basename(file)}"`);const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);if(range){const start=Number(range[1]),end=range[2]?Math.min(Number(range[2]),stat.size-1):stat.size-1;if(start>end||start>=stat.size){res.writeHead(416);res.end();return;}res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${stat.size}`,'Accept-Ranges':'bytes','Content-Length':end-start+1});fs.createReadStream(file,{start,end}).pipe(res);}else{res.setHeader('Content-Length',stat.size);fs.createReadStream(file).pipe(res);}}
const server=http.createServer(async(req,res)=>{
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('Content-Security-Policy',"default-src 'self'; img-src 'self' blob:; media-src 'self'; style-src 'self'; font-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
 try{
  if(![`127.0.0.1:${port}`,`localhost:${port}`].includes(req.headers.host)){json(res,{error:'Ungültiger Host.'},403);return;}
  const url=new URL(req.url,`http://127.0.0.1:${port}`),p=url.pathname;
  if(!['GET','HEAD'].includes(req.method)){
   if(req.headers['x-csrf-token']!==token||req.headers.origin&&!['http://127.0.0.1:'+port,'http://localhost:'+port].includes(req.headers.origin)){json(res,{error:'Anfrage abgelehnt. Seite neu laden.'},403);return;}
  }
  if(p==='/models.mjs'&&req.method==='GET'){res.setHeader('Content-Type','text/javascript; charset=utf-8');return res.end(fs.readFileSync(path.join(root,'src/models.mjs')));}
  if(p==='/api/bootstrap'&&req.method==='GET')return json(res,{token,models,selections,keyConfigured:!!credentials,budget:budget(),access:state.access,uploads:state.uploads.map(({url,...x})=>x)});
  if(p==='/api/budget'&&req.method==='POST'){const data=await requestJson(req);const next=dollars(data.limitUsd);if(next===null||next<used())throw new Error('Das Limit darf nicht kleiner als die bestehenden Reservierungen sein.');limit=next;state.budgetLimitUsd=next;save();return json(res,budget());}
  if(p==='/api/runs'&&req.method==='GET')return json(res,{runs:publicRuns(),budget:budget()});
  if(p==='/api/estimate'&&req.method==='POST')return json(res,await estimate(await requestJson(req)));
  if(p==='/api/start'&&req.method==='POST'){const data=await requestJson(req);return json(res,{runId:start(data.quoteId).id});}
  if(p==='/api/upload'&&req.method==='POST'){
   const type=req.headers['content-type'];const ext={'image/png':'png','image/jpeg':'jpg','image/webp':'webp'}[type];if(!ext)throw new Error('PNG, JPEG oder WebP erforderlich.');const data=await body(req,10*1024*1024);
   const valid=ext==='png'?data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):ext==='jpg'?data[0]===255&&data[1]===216&&data[2]===255:data.subarray(0,4).toString()==='RIFF'&&data.subarray(8,12).toString()==='WEBP';if(!valid)throw new Error('Dateiinhalt passt nicht zum Bildformat.');
   const slot=await api('files/generate-upload-url',credentials,{content_type:type});if(!slot.upload_url||!slot.public_url)throw new Error('Upload-URL fehlt.');
   const headers=slot.upload_headers||{'Content-Type':type};if(Object.keys(headers).some(k=>/authorization|cookie|hf-api|hf-secret/i.test(k)))throw new Error('Unsichere Upload-Header abgelehnt.');
   await publicFetch(slot.upload_url,{method:'PUT',headers,body:data});const id=randomUUID(),file=id+'.'+ext;fs.writeFileSync(path.join(uploads,file),data);
   const record={id,file,name:decodeURIComponent(req.headers['x-file-name']||'Referenzbild').slice(0,150),url:slot.public_url,createdAt:new Date().toISOString()};state.uploads.push(record);save();const {url:remote,...safe}=record;return json(res,safe);
  }
  if(p==='/api/resume'&&req.method==='POST'){const {jobId}=await requestJson(req);const j=state.runs.flatMap(r=>r.jobs).find(j=>j.id===jobId);if(!j?.requestId||j.status!=='paused'||active.has(j.id)||workers>=2)throw new Error('Statusprüfung derzeit nicht möglich.');workers++;active.add(j.id);j.status='queued';save();poll(j).finally(()=>{workers--;active.delete(j.id);pump();});return json(res,{ok:true});}
  if(p==='/api/save-result'&&req.method==='POST'){const {jobId}=await requestJson(req);const j=state.runs.flatMap(r=>r.jobs).find(j=>j.id===jobId);if(!j?.remoteUrl||j.file||active.has(j.id))throw new Error('Ergebnis kann derzeit nicht gespeichert werden.');active.add(j.id);try{await storeResult(j);}finally{active.delete(j.id);}return json(res,{ok:!!j.file});}
  const zipMatch=p.match(/^\/api\/runs\/([a-f0-9-]+)\/zip$/);
  if(zipMatch&&req.method==='GET'){const run=state.runs.find(r=>r.id===zipMatch[1]);if(!run)throw new Error('Lauf nicht gefunden.');const files=run.jobs.filter(j=>j.file).map(j=>({name:j.modelId+'-'+j.file,data:fs.readFileSync(path.join(media,j.file))}));files.push({name:'lauf.json',data:JSON.stringify({...run,jobs:run.jobs.map(safeJob)},null,2)});const buffer=zip(files);res.writeHead(200,{'Content-Type':'application/zip','Content-Disposition':`attachment; filename="vergleich-${run.id}.zip"`});return res.end(buffer);}
  if(req.method!=='GET'&&req.method!=='HEAD')return json(res,{error:'Nicht gefunden.'},404);
  const asset=p.match(/^\/(media|uploads)\/([a-f0-9-]+\.(?:png|jpg|webp|mp4|mov))$/);
  if(asset){const file=path.join(asset[1]==='media'?media:uploads,asset[2]);if(!fs.existsSync(file))return json(res,{error:'Datei fehlt.'},404);return sendFile(req,res,file,url.searchParams.has('download'));}
  const relative=decodeURIComponent(p==='/'?'/index.html':p),base=path.join(root,'public'),file=path.resolve(base,'.'+relative);
  if(!file.startsWith(base+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())return json(res,{error:'Nicht gefunden.'},404);sendFile(req,res,file,false);
 }catch(e){json(res,{error:e.message},400);}
});
server.listen(port,'127.0.0.1',()=>console.log(`AI mit Arnie · http://127.0.0.1:${port} · Budgetlimit $${limit.toFixed(2)}`));
server.on('error',e=>{console.error(e.code==='EADDRINUSE'?`Port ${port} ist belegt. PORT in .env ändern.`:'Server konnte nicht starten.');process.exit(1);});
