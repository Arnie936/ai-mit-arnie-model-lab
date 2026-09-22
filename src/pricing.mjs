import {dollars} from './provider.mjs';

// Current authenticated /estimate response, checked 2026-09-22. Fail closed if
// its formula changes. This is a tariff estimate, never a quoted account price.
export const seedanceTariff = 'Token-metered pricing. Billable video tokens = ceil((input video seconds + generated video seconds) × output width × output height × 24 fps / 1024). Image and audio references do not count as video input. At 480p or 720p, each 1,000 video tokens cost $0.0214. Rates shown are before any applicable customer discount.';
// Nominal 720p pixel dimensions published by BytePlus. Actual generated output
// may differ: the assumption is displayed in the quote and saved in history.
const dimensions = {'16:9':[1280,720],'9:16':[720,1280],'1:1':[960,960],'4:3':[1112,834],'3:4':[834,1112],'21:9':[1470,630]};
export function estimatePrice(result, model, input, endpoint) {
 const usd=dollars(result.usd);
 if(usd!==null)return {usd,accountUsd:usd,source:'Higgsfield /estimate',basis:'account'};
 const size=dimensions[input.aspect_ratio];
 if(model.id!=='seedance25'||endpoint!=='bytedance/seedance-2.5/text-to-video'||result.type!=='description'||result.pricing_description!==seedanceTariff||input.resolution!=='720p'||!size||!Number.isInteger(input.duration)||input.duration<4||input.duration>30||input.video_urls?.length)return {usd:null,accountUsd:null,source:'Higgsfield /estimate',basis:'missing'};
 const tokens=Math.ceil(input.duration*size[0]*size[1]*24/1024);
 return {usd:Number((tokens*.0214/1000).toFixed(8)),accountUsd:null,basis:'tariff',source:'Higgsfield /estimate: Token-Tarif ohne Rabatt',assumption:`Tarifschätzung ohne Rabatt; Konto-Schätzung fehlt. Angenommene Ausgabe: ${size[0]} × ${size[1]} Pixel, 24 fps, ${input.duration} Sekunden (${tokens} Tokens). Die tatsächliche Ausgabe und Abrechnung können abweichen.`,dimensionsSource:'https://docs.byteplus.com/en/docs/Byteplus_LAS/Large_model_billing'};
}
