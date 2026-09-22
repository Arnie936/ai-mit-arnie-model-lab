export const API='https://api.higgsfield.ai';
export class ProviderError extends Error {constructor(message,status=0){super(message);this.status=status;}}
export function dollars(value){if(typeof value!=='number'&&(typeof value!=='string'||!/^\d+(?:\.\d+)?$/.test(value.trim())))return null;const n=Number(value);return Number.isFinite(n)&&n>=0?n:null;}
export async function api(path,credentials,input,method=input===undefined?'GET':'POST'){
 if(!credentials)throw new ProviderError('API-Key fehlt. .env einrichten und App neu starten.',401);
 let response;
 try {response=await fetch(API+'/'+path,{method,headers:{Authorization:`Key ${credentials}`,'Content-Type':'application/json'},...(input!==undefined?{body:JSON.stringify(input)}:{}),redirect:'error',signal:AbortSignal.timeout(45000)});}catch{throw new ProviderError('API-Verbindung unterbrochen. Bei einem Start ist die Annahme des Auftrags unklar. Keine automatische Wiederholung.');}
 let body;try{body=await response.json();}catch{throw new ProviderError('Ungültige API-Antwort.',response.status>=400?response.status:0);}
 if(!response.ok){const messages={401:'API-Key wurde abgelehnt.',402:'API-Guthaben reicht nicht aus.',403:'Kein Zugriff auf dieses Modell.',404:'Modell oder Auftrag ist für diesen Account nicht verfügbar.',422:'API lehnt die Parameter ab.',423:'Modell momentan gesperrt.',429:'API-Ratenlimit erreicht.',503:'Modell momentan nicht verfügbar.'};throw new ProviderError(messages[response.status]||`API-Fehler ${response.status}.`,response.status);}
 return body;
}
export async function publicFetch(url,options={}){
 const u=new URL(url);if(u.protocol!=='https:'||u.username||u.password||u.port)throw new Error('Ungültige Medien-URL.');
 // Only URLs returned by the provider reach this function. No user-supplied URLs.
 const {lookup}=await import('node:dns/promises');const records=await lookup(u.hostname,{all:true});
 if(!records.length||records.some(({address:a})=>a.includes(':')||/^(0\.|10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(a)))throw new Error('Private Medienadresse abgelehnt.');
 const r=await fetch(url,{...options,redirect:'error',signal:AbortSignal.timeout(120000)});if(!r.ok)throw new Error(`Medienübertragung fehlgeschlagen (${r.status}).`);return r;
}
