import test from 'node:test';
import assert from 'node:assert/strict';
import {estimatePrice,seedanceTariff} from '../src/pricing.mjs';
const result={type:'description',pricing_description:seedanceTariff},model={id:'seedance25'},input={resolution:'720p',aspect_ratio:'16:9',duration:6},endpoint='bytedance/seedance-2.5/text-to-video';
test('Seedance derives an explicitly labelled estimate from the current tariff, never actual billing',()=>{
 const price=estimatePrice(result,model,input,endpoint);
 assert.equal(price.usd,2.77344);assert.equal(price.accountUsd,null);assert.equal(price.basis,'tariff');assert.match(price.assumption,/1280 × 720/);assert.match(price.assumption,/129600 Tokens/);
 assert.equal(estimatePrice(result,model,{...input,aspect_ratio:'9:16'},endpoint).usd,price.usd);
 assert.equal(estimatePrice({usd:'0.7'},model,input,endpoint).usd,.7);
});
test('Unknown formulas, resolution, models and reference prices never get a guessed price',()=>{
 for(const [r,m,i,p] of [[{...result,pricing_description:seedanceTariff+' Changed'},model,input,endpoint],[result,model,{...input,resolution:'480p'},endpoint],[result,model,{...input,aspect_ratio:'auto'},endpoint],[result,{id:'sunburst'},input,endpoint],[result,model,input,'bytedance/seedance-2.5/reference-to-video'],[result,model,{...input,video_urls:['reference']},endpoint]])assert.equal(estimatePrice(r,m,i,p).usd,null);
});
