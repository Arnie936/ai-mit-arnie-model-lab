// Only REST paths read from model-specific official documentation on 2026-09-22.
const commonRatios = ['16:9','4:3','1:1','3:4','9:16'];
const imageRatios = ['1:1','2:3','3:2','3:4','4:3','7:9','9:7','9:16','16:9','21:9'];
const make = (id,name,kind,path,settings={}) => ({id,name,kind,path,enabled:!!path,variant:'Standard',ratios:commonRatios,resolutions:['720p'],references:0,extras:{},...settings,source:path?`https://open.higgsfield.ai/models/${path}/api-reference`:'https://open.higgsfield.ai/explore/'+kind,checkedAt:'2026-09-22'});
export const models = [
 make('seedance25','Seedance 2.5','video','bytedance/seedance-2.5/text-to-video',{fixed:true,resolutions:['480p','720p'],ratios:[...commonRatios,'21:9'],duration:[4,30],audio:'generate_audio',extras:{output_format:'mp4'},note:'Text to Video · 4–30 s. Bei 720p: Tarifschätzung ohne Rabatt. Kontobezogener USD-Wert fehlt; bei 480p derzeit keine belastbare Schätzung.'}),
 make('kling30','Kling 3.0','video','kling-video/v3.0/std/text-to-video',{fixed:true,comparisonResolution:'model',variant:'Standard · Text to Video',resolutions:['model'],ratios:['16:9','9:16','1:1'],duration:[3,15],audio:'sound',extras:{multi_shots:false},note:'Kein Auflösungsparameter. Für einen Start „Modellvorgabe“ wählen. Referenzadapter nicht bestätigt.'}),
 make('minimaxh3','MiniMax H3','video','minimax/h3/text-to-video',{variant:'Preview · Text to Video',resolutions:['2k'],ratios:[...commonRatios,'21:9','auto','adaptive'],resolutionMap:{'2k':'2K'},duration:[5,15],note:'Preview. Kein Audio-Schalter dokumentiert; Audio muss auf „Modellvorgabe“ stehen.'}),
 make('grokimage2','Grok Imagine 2.0','image','xai/grok-imagine-image-2.0',{fixed:true,resolutions:['1k','2k'],ratios:[...commonRatios,'auto','1:2','2:1','3:2','2:3'],references:4,referenceField:'image_urls',extras:{quality:'medium'}}),
 make('soul2','Soul 2','image','higgsfield-ai/soul/v2/standard',{fixed:true,comparisonResolution:'720p',resolutions:['720p','1080p'],ratios:[...commonRatios,'2:3','3:2'],extras:{batch_size:1,enhance_prompt:false}}),
 make('ideogram4','Ideogram 4.0','image','ideogram/v4.0',{fixed:true,comparisonResolution:'model',resolutions:['model'],ratios:[...commonRatios,'1:2','2:1','2:3','3:2','4:5','5:4','5:8','8:5','9:22','22:9','9:23','23:9','3:8','8:3','5:12','12:5','1:3','3:1'],references:1,referenceField:'image_url',maxPrompt:2048,minPrompt:2,extras:{rendering_speed:'DEFAULT'},note:'Kein Auflösungsparameter; „Modellvorgabe“ wählen.'}),
 make('recraft41','Recraft 4.1','image','recraft/v4.1/text-to-image',{fixed:true,resolutions:['1k'],ratios:[...commonRatios,'2:1','1:2','3:2','2:3','5:4','4:5','6:10','14:10','10:14'],extras:{output_format:'png'},maxPrompt:10000}),
 make('qwen3','Qwen Image 3','image','alibaba/qwen-image-3/text-to-image',{fixed:true,resolutions:['1k','2k'],ratios:imageRatios,references:3,referencePath:'alibaba/qwen-image-3/edit',referenceField:'image_urls',extras:{prompt_extend:false,enable_thinking:false}}),
 make('zimage','Z-Image Turbo','image','z-image/turbo',{fixed:true,resolutions:['1k','2k'],ratios:imageRatios,maxPrompt:800,extras:{prompt_extend:false}}),
 make('wanprime','Wan 3.0 Prime','video','alibaba/wan-3.0-prime/text-to-video',{fixed:true,resolutions:['480p','720p','1080p'],ratios:[...commonRatios,'adaptive'],duration:[2,30],audio:'generate_audio',references:1,referencePath:'alibaba/wan-3.0-prime/image-to-video',referenceField:'image_url',extras:{enable_thinking:false}}),
 make('ltxfast','LTX 2.5 Fast','video','lightricks/ltx-2.5/text-to-video/fast',{fixed:true,references:1,referencePath:'lightricks/ltx-2.5/image-to-video/fast',referenceField:'image_url',resolutions:['720p','1080p','2k','4k'],ratios:['16:9','9:16'],durations:[6,8,10],audio:'generate_audio',minPrompt:2,maxPrompt:5000,extras:{fps:25}}),
 make('ltxpro','LTX 2.5 Pro','video','lightricks/ltx-2.5/text-to-video/pro',{fixed:true,references:1,referencePath:'lightricks/ltx-2.5/image-to-video/pro',referenceField:'image_url',resolutions:['720p','1080p'],ratios:['16:9','9:16'],durations:[6,8,10],audio:'generate_audio',minPrompt:2,maxPrompt:5000,extras:{fps:25}}),
 make('pixverse6','PixVerse 6','video','pixverse/v6/text-to-video',{fixed:true,resolutions:['360p','540p','720p','1080p'],duration:[1,15],audio:'generate_audio',maxPrompt:5000,note:'Text to Video. Für Referenzbilder Wan Prime oder LTX wählen.'}),
 make('klingturbo','Kling 3.0 Turbo','video','kling-video/v3.0-turbo/text-to-video',{resolutions:['720p','1080p'],ratios:['16:9','9:16','1:1'],duration:[3,15],note:'Kein Audio-Schalter; Audio ausdrücklich auf Modellvorgabe setzen.'}),
 make('wan27','Wan 2.7','video','wan/v2.7/text-to-video',{resolutions:['720p','1080p'],duration:[2,15],extras:{prompt_extend:false},note:'Kein Audio-Schalter; Audio ausdrücklich auf Modellvorgabe setzen.'}),
 make('hailuo23','MiniMax Hailuo 2.3','video','minimax/hailuo-2.3/standard/text-to-video',{variant:'Standard · Text to Video',resolutions:['model'],ratios:['model'],durations:[6,10],extras:{prompt_optimizer:false},note:'Auflösung, Seitenverhältnis und Audio ohne Parameter. Modellvorgabe ausdrücklich wählen.'}),
 make('grokvideo','Grok Imagine Video 1.5','video','xai/grok-imagine-video/v1.5/reference-to-video',{resolutions:['480p','720p','1080p'],ratios:[...commonRatios,'auto','3:2','2:3'],duration:[1,15],references:4,referenceField:'image_urls',note:'Kein Audio-Schalter dokumentiert; „Modellvorgabe“ wählen.'})
];
export const selections = {video:['wanprime','ltxfast','ltxpro','pixverse6','seedance25','kling30','klingturbo','minimaxh3','grokvideo','wan27','hailuo23'],image:['grokimage2','recraft41','qwen3','zimage','soul2','ideogram4']};
export const defaults = {image:{resolution:'1k',aspectRatio:'1:1',duration:6,audio:'off'},video:{resolution:'720p',aspectRatio:'16:9',duration:6,audio:'off'}};
export function modelDefaults(model){return {resolution:model.resolutions.includes(defaults[model.kind].resolution)?defaults[model.kind].resolution:model.resolutions[0],aspectRatio:model.ratios.includes(defaults[model.kind].aspectRatio)?defaults[model.kind].aspectRatio:model.ratios[0],duration:model.durations?.[0]||Math.max(5,model.duration?.[0]||5),audio:model.audio?'off':'model'};}
export function prepare(model, settings, refs=[]) {
 const errors=[];
 if (!model?.enabled) return {errors:[model?.reason || 'Modell nicht verfügbar.']};
 if (typeof settings.prompt!=='string' || settings.prompt.trim().length<(model.minPrompt||1)) errors.push('Prompt fehlt oder ist zu kurz.');
 if (settings.prompt?.length>(model.maxPrompt||10000)) errors.push(`Prompt zu lang, maximal ${model.maxPrompt||10000} Zeichen.`);
 if (!model.ratios.includes(settings.aspectRatio)) errors.push(`Seitenverhältnis: ${model.ratios.join(', ')}.`);
 if (!model.resolutions.includes(settings.resolution)) errors.push(`Auflösung: ${model.resolutions.map(x=>x==='model'?'Modellvorgabe':x).join(', ')}.`);
 if (refs.length>model.references) errors.push(model.references?`Höchstens ${model.references} Referenzen unterstützt.`:'Kein bestätigter Referenzadapter für dieses Modell.');
 if (model.kind==='video') {
  if (!Number.isInteger(settings.duration) || (model.durations?!model.durations.includes(settings.duration):settings.duration<model.duration[0]||settings.duration>model.duration[1])) errors.push(`Dauer: ${model.durations?.join(', ')||model.duration.join(' bis ')} Sekunden.`);
  if (!['on','off','model'].includes(settings.audio)) errors.push('Ungültige Audio-Einstellung.');
  if (!model.audio && settings.audio!=='model') errors.push('Kein Audio-Schalter. „Modellvorgabe“ ausdrücklich wählen.');
  if (model.audio && settings.audio==='model') errors.push('Audio ausdrücklich ein- oder ausschalten.');
 }
 if (errors.length) return {errors};
 const input={prompt:settings.prompt,...model.extras};
 if(settings.aspectRatio!=='model')input.aspect_ratio=settings.aspectRatio;
 if(settings.resolution!=='model') input.resolution=model.resolutionMap?.[settings.resolution]||settings.resolution;
 if(model.kind==='video') {input.duration=settings.duration;if(model.audio)input[model.audio]=model.audio==='sound'?settings.audio:settings.audio==='on';}
 if(refs.length) input[model.referenceField]=model.referenceField==='image_url'?refs[0]:refs;
 return {errors:[],path:refs.length&&model.referencePath?model.referencePath:model.path,input};
}
