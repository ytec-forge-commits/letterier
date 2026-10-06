import {cloneProject,newProject,clone,uid,pageVisual,pruneAssets,type Project,type WritingMode} from './model';
import {compose,type Measure} from './compose';
import {stationeryBodyMargins} from './stationery-layout';
import {resolveStationeryArtwork} from './stationery-artwork';
export interface Template {id:string;name:string;family:'和風'|'洋風';season:'通年'|'春'|'夏'|'秋'|'冬';description:string;color:string;accent:string;paper:string}
const catalog=[
  ['washi','白の和紙','白に近い和紙の質感と、静かな細い罫線。','#a6b5aa','#405c4c','#fffefa'],
  ['ichimatsu','藍の市松','端に添えた藍の市松。すっきりとした和の一枚。','#8fabc1','#294b6a','#fcfdff'],
  ['sakura','桜の便り','淡い桜の枝と、風に舞う花びら。','#d8a7b4','#8a425a','#fffdfd'],
  ['nanohana','菜の花と蝶','黄色い菜の花に、小さな蝶がひと休み。','#c2bd81','#74652e','#fffef6'],
  ['asagao','朝顔と風鈴','青紫の朝顔と、涼やかな風鈴。','#a3b5cf','#415b84','#fcfdff'],
  ['goldfish','金魚と水紋','朱色の金魚が、淡い水紋を泳ぎます。','#9dc3c7','#39676c','#fbfeff'],
  ['momiji','紅葉の彩り','赤と橙のもみじを、用紙の隅へ。','#c9aa93','#865437','#fffdf9'],
  ['moon','月とすすき','淡い月と細いすすき。余白の美しい秋の夜。','#bbb58e','#6c653f','#fffef9'],
  ['snow-garden','雪の庭','墨色の枝に積もる雪。白を生かした冬の庭。','#b7c2c4','#52646c','#fefeff'],
  ['camellia','椿の便り','赤い椿と深緑の葉が、冬に温もりを添えます。','#c5aaa7','#804549','#fffdfb'],
  ['classic','クラシックレター','細い飾り枠と角飾り。改まったお手紙にも。','#b6b1a7','#625a4b','#fffefa'],
  ['dots','パステルドット','淡い水玉を端に。軽やかで親しみやすく。','#bfbbcb','#67577a','#fffdff'],
  ['mimosa','ミモザのリース','黄色い小花と細い葉の、小さなリース。','#c6bf94','#74683b','#fffef8'],
  ['tulip','チューリップガーデン','ピンクと赤の花を、水彩のように重ねて。','#d6b0b0','#8b505c','#fffdfc'],
  ['seaside','シーサイドブルー','淡い波と小さな貝殻。余白に潮風を。','#a0c2d0','#3d657f','#fcfeff'],
  ['lemon','レモンの便り','黄色いレモンと緑の葉。明るく爽やかな一枚。','#c4c88e','#606f35','#fffff7'],
  ['autumn-leaf','秋色リーフ','くすんだ橙と金色の葉を、控えめに。','#c7b29f','#7c5b3e','#fffdf9'],
  ['woodland','森の実り','どんぐり、木の実、小さなきのこ。森からのお便り。','#c7b2a2','#795840','#fffdf9'],
  ['snowflake','スノークリスタル','淡い青の結晶がきらめく、静かな冬の便箋。','#afc6d1','#496979','#fdfeff'],
  ['christmas','クリスマスリース','緑のリースと赤い実。小さなリボンを添えて。','#a9bbaa','#42634b','#fffefb'],
] as const;
export const templates:Template[]=catalog.map(([id,name,description,color,accent,paper],i)=>({id,name,description,color,accent,paper,family:i<10?'和風':'洋風',season:(['通年','春','夏','秋','冬'] as const)[Math.floor(i%10/2)]}));
export interface AppTheme {id:string;name:string;accent:string;soft:string}
export const appThemes:AppTheme[]=[{id:'plain',name:'無地',accent:'#315a45',soft:'#eef2e9'},...templates.map(t=>({id:t.id,name:t.name,accent:t.accent,soft:t.color}))];
export interface StationeryChoice {design:number;cycle:boolean}
export function createFromTemplate(id:string,mode:WritingMode='horizontal',choice?:StationeryChoice):Project{
  const t=templates.find(t=>t.id===id);if(!t)throw new Error('この便箋テンプレートが見つかりません。');
  if(choice&&(!Number.isInteger(choice.design)||choice.design<1||choice.design>5||typeof choice.cycle!=='boolean'))throw Error('便箋の図案は1〜5から選んでください。');
  if(choice&&(!resolveStationeryArtwork(`${id}-v${choice.design}`)||choice.cycle&&[1,2,3,4,5].some(number=>!resolveStationeryArtwork(`${id}-v${number}`))))throw Error('この図案はまだ利用できません。');
  const p=newProject();p.templateId=id;p.settings.writingMode=mode;
  p.pages[0].design=`${id}-first`;p.pages[0].background.color=t.paper;p.pages[0].ruling.color=t.color;
  p.pages[0].ruling.margins={...stationeryBodyMargins};
  p.pages[0].ruling.autoSpacing=true;p.pages[0].ruling.autoWidth=true;
  p.continuation={...clone(p.pages[0]),id:uid(),design:`${id}-continuation`};
  if(choice){p.pages[0].design=`${id}-v${choice.design}`;p.continuation.design=choice.cycle?`${id}-cycle-${choice.design}`:p.pages[0].design;}
  return p;
}
export function applyTemplateDesign(p:Project,id:string,choice?:StationeryChoice):Project{
  const template=createFromTemplate(id,p.settings.writingMode,choice),next=cloneProject(p);
  next.templateId=id;next.pages=next.pages.map((page,index)=>({...clone(pageVisual(template,index)),id:page.id}));next.continuation=clone(template.continuation);
  next.pages=next.pages.map(visual=>({...visual,ruling:{...visual.ruling,margins:{...stationeryBodyMargins}}}));
  next.continuation={...next.continuation,ruling:{...next.continuation.ruling,margins:{...stationeryBodyMargins}}};
  next.objects=next.objects.filter(o=>!o.stationery);
  return next;
}
export function applyBuiltinTemplateDesign(p:Project,id:string,measure:Measure,scope:'all'|{start:number;end:number}='all',choice?:StationeryChoice):Project{
  if(scope==='all')return pruneAssets(applyTemplateDesign(p,id,choice));
  const layout=compose(p,measure),{start,end}=scope;
  if(!Number.isInteger(start)||!Number.isInteger(end)||start<0||end<start||end>=layout.pages.length)throw Error('対象ページが見つかりません。');
  const template=createFromTemplate(id,p.settings.writingMode,choice),next=cloneProject(p);
  while(next.pages.length<=end)next.pages.push({...clone(pageVisual(p,next.pages.length)),id:uid()});
  for(let index=start;index<=end;index++)next.pages[index]={...clone(pageVisual(template,index-start)),id:next.pages[index].id};
  const owners=new Map(layout.objects.map(object=>[object.id,object.actualPage]));
  next.objects=next.objects.filter(object=>{const owner=owners.get(object.id)??object.pageIndex;return !object.stationery||owner<start||owner>end;});
  return pruneAssets(next);
}
export function makeUserTemplate(p:Project,withText:boolean,measure:Measure):Project{
  const next=cloneProject(p),layout=compose(p,measure);next.id=uid();next.title='新しい手紙';
  next.pages=next.pages.map(v=>({...v,id:uid()}));next.continuation.id=uid();
  if(!withText){
    next.body={runs:[{text:'',style:{}}]};
    next.objects=layout.objects.filter(o=>o.kind!=='text').map(o=>({id:uid(),kind:o.kind,assetId:o.assetId,anchorMode:'page',anchorOffset:0,pageIndex:o.actualPage,x:o.actualX,y:o.actualY,width:o.width,height:o.height,rotation:o.rotation,opacity:o.opacity,wrap:o.wrap,paddingMm:o.paddingMm,hideRuling:o.hideRuling,z:o.z}));
  }else next.objects=next.objects.map(o=>({...o,id:uid()}));
  const used=new Set([...next.pages,next.continuation].map(v=>v.background.assetId));for(const o of next.objects)if(o.assetId)used.add(o.assetId);
  next.assets=Object.fromEntries(Object.entries(next.assets).filter(([id])=>used.has(id)));return next;
}
export function applyUserTemplateDesign(p:Project,template:Project,measure:Measure,scope:'all'|{start:number;end:number}='all'):Project{
  const layout=compose(p,measure),count=layout.pages.length;
  const start=scope==='all'?0:scope.start,end=scope==='all'?count-1:scope.end;
  if(!Number.isInteger(start)||!Number.isInteger(end)||start<0||end<start||end>=count)throw Error('対象ページが見つかりません。');
  const design=makeUserTemplate(template,false,measure),next=cloneProject(p),assetIds=new Map<string,string>();
  for(const asset of Object.values(design.assets)){const id=uid();assetIds.set(asset.id,id);next.assets[id]={...asset,id};}
  const copyVisual=(index:number,id:string)=>{
    const visual=clone(pageVisual(design,index));
    if(visual.background.assetId)visual.background.assetId=assetIds.get(visual.background.assetId);
    return {...visual,id};
  };
  while(next.pages.length<=end)next.pages.push({...clone(next.continuation),id:uid()});
  const owners=new Map(layout.objects.map(o=>[o.id,o.actualPage]));
  next.objects=next.objects.filter(o=>{const owner=owners.get(o.id)??o.pageIndex;return !o.stationery||owner<start||owner>end;});
  for(let i=start;i<=end;i++){
    const source=(i-start)%design.pages.length;
    next.pages[i]=copyVisual(source,next.pages[i].id);
    next.objects.push(...design.objects.filter(o=>o.pageIndex===source).map(o=>({...o,id:uid(),assetId:o.assetId?assetIds.get(o.assetId):undefined,pageIndex:i,stationery:true})));
  }
  if(next.objects.length>200)throw Error('便箋の飾りを含む自由配置の要素は200個までです。対象ページを減らしてください。');
  if(scope==='all'){next.continuation=copyVisual(design.pages.length,next.continuation.id);next.templateId=design.templateId;}
  return pruneAssets(next);
}
