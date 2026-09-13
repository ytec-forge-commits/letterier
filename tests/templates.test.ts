import {expect,test} from 'vitest';
import {bodyText,newProject,paperSize,replaceRange} from '../src/core/model';
import {packProject,unpackProject} from '../src/core/archive';
import {compose} from '../src/core/compose';
import {templates,createFromTemplate,applyTemplateDesign,makeUserTemplate,appThemes} from '../src/core/templates';
import {decorationMotifLayout,generatedArt,generatedCompanionArt,templateArtPath} from '../src/ui/PaperDecoration';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

function pngColorType(path:string){
  return readFileSync(path)[25];
}
test('白の和紙は画像なし、生成素材はテンプレート間で共有しない',()=>{
  expect(generatedArt.washi).toBeUndefined();
  expect(new Set(Object.values(generatedArt)).size).toBe(Object.values(generatedArt).length);
  expect(new Set(Object.values(generatedCompanionArt)).size).toBe(Object.values(generatedCompanionArt).length);
  expect(new Set([...Object.values(generatedArt),...Object.values(generatedCompanionArt)]).size).toBe(Object.values(generatedArt).length+Object.values(generatedCompanionArt).length);
});
test('藍の市松素材はチェッカー柄を背景に焼き込まずRGBA透過である',()=>{
  expect(pngColorType(fileURLToPath(new URL('../public/template-art/ichimatsu.png',import.meta.url)))).toBe(6);
});
test('描き直した便箋素材は更新後のURLを使い古いキャッシュを表示しない',()=>{
  for(const id of ['ichimatsu','sakura','nanohana','asagao','goldfish','momiji','snow-garden','camellia','moon','mimosa','tulip','seaside','lemon','autumn-leaf','woodland','snowflake','christmas']){
    expect(generatedArt[id]).toBe(id);
    expect(generatedCompanionArt[id]).toBe(`${id}-companion`);
    expect(pngColorType(fileURLToPath(new URL(`../public/template-motifs/${id}.png`,import.meta.url)))).toBe(6);
    expect(pngColorType(fileURLToPath(new URL(`../public/template-motifs/${id}-companion.png`,import.meta.url)))).toBe(6);
    expect(templateArtPath(id,generatedArt[id])).toBe(`/template-motifs/${id}.png?v=1.0.2`);
  }
});
test('和洋各10種・季節ごと各2種、別管理の外観21テーマを備える',()=>{
  expect(templates).toHaveLength(20);expect(appThemes).toHaveLength(21);
  for(const family of ['和風','洋風'])for(const season of ['通年','春','夏','秋','冬'])expect(templates.filter(t=>t.family===family&&t.season===season)).toHaveLength(2);
});
test('画面テーマは便箋画像を持たず配色だけで選べる',()=>{
  expect(appThemes.every(theme=>!('previewDesign' in theme))).toBe(true);
});
test('便箋ごとに四隅・左右・上辺・フッターを使い分け、固定本文領域へ重ねない',()=>{
  const signatures=new Set<string>();
  for(const id of Object.keys(generatedArt))for(const [width,height] of [[210,297],[297,210]] as const){
    const layout=decorationMotifLayout(id,width,height,'vertical',false);
    signatures.add(layout.pattern);
    expect(layout.reserved).toEqual({top:20,right:20,bottom:20,left:20});
    expect(layout.placements,`${id} ${width}x${height} で主役と脇役を一度ずつ使う`).toHaveLength(2);
    expect(new Set(layout.placements.map(p=>p.art))).toEqual(new Set(['primary','companion']));
    expect(Math.max(...layout.placements.map(p=>Math.max(p.width,p.height))),`${id} ${width}x${height} の主モチーフ`).toBeGreaterThanOrEqual(15);
    const body={left:20,top:20,right:width-20,bottom:height-20};
    for(const motif of layout.placements){
      const overlaps=motif.x<body.right&&motif.x+motif.width>body.left&&motif.y<body.bottom&&motif.y+motif.height>body.top;
      expect(overlaps,`${id} ${width}x${height}`).toBe(false);
    }
  }
  expect(signatures.size).toBeGreaterThanOrEqual(6);
  const footerIds=['goldfish','snow-garden','tulip','seaside'];
  expect(new Set(footerIds.map(id=>decorationMotifLayout(id,297,210,'horizontal',false).placements[0].x)).size).toBeGreaterThanOrEqual(3);
});
test('どの便箋・書字方向でも本文領域の広さを変えない',()=>{
  const standard={top:20,right:20,bottom:20,left:20};
  for(const template of templates)for(const mode of ['horizontal','vertical'] as const){
    const project=createFromTemplate(template.id,mode);
    expect(project.pages[0].ruling.margins,`${template.id} ${mode} 1ページ目`).toEqual(standard);
    expect(project.continuation.ruling.margins,`${template.id} ${mode} 続き`).toEqual(standard);
  }
});
test('旧版が自動拡張した余白だけを固定本文領域へ戻し、手動余白は守る',()=>{
  const old=newProject();old.templateId='lemon';old.settings.writingMode='horizontal';old.pages[0].design='lemon-first';old.continuation.design='lemon-continuation';
  old.pages[0].ruling.margins={top:54.1,right:20,bottom:20,left:54.1};
  old.continuation.ruling.margins={top:39.99,right:20,bottom:20,left:39.99};
  const restored=unpackProject(packProject(old));
  expect(restored.pages[0].ruling.margins).toEqual({top:20,right:20,bottom:20,left:20});
  expect(restored.continuation.ruling.margins).toEqual({top:20,right:20,bottom:20,left:20});
  old.pages[0].ruling.margins={top:18,right:22,bottom:25,left:19};
  expect(unpackProject(packProject(old)).pages[0].ruling.margins).toEqual({top:18,right:22,bottom:25,left:19});
});
test('既存文書へ便箋を適用すると用紙サイズと縦横に合う余白を使う',()=>{
  const source=newProject();source.settings.paper='POSTCARD';source.settings.orientation='landscape';source.pages.push({...structuredClone(source.continuation),id:'page-2'});
  const applied=applyTemplateDesign(source,'seaside'),{width,height}=paperSize(applied);
  expect([width,height]).toEqual([148,100]);
  expect(applied.pages[0].ruling.margins).toEqual({top:20,right:20,bottom:20,left:20});
  expect(applied.pages[1].ruling.margins).toEqual({top:20,right:20,bottom:20,left:20});
  expect(applied.continuation.ruling.margins).toEqual({top:20,right:20,bottom:20,left:20});
});
test('全20種で縦横・最初と続きのデザインを文書として保存できる',()=>{
  expect(templates.length).toBe(20);
  for(const t of templates)for(const mode of ['horizontal','vertical'] as const)for(const orientation of ['portrait','landscape'] as const){
    const p=replaceRange(createFromTemplate(t.id,mode),0,0,'第一頁\f第二頁');p.settings.orientation=orientation;
    const restored=unpackProject(packProject(p)),layout=compose(restored,()=>5);
    expect(layout.pages).toHaveLength(2);expect(layout.pages[0].visual.design).not.toBe(layout.pages[1].visual.design);
    expect(restored.settings.writingMode).toBe(mode);expect(restored.settings.orientation).toBe(orientation);
  }
});
test('デザインのみのユーザーテンプレートに本文や署名を混入しない',()=>{
  const p=replaceRange(newProject(),0,0,'持ち出さない本文');
  p.objects=[{id:'signature',kind:'text',text:'署名',style:p.baseStyle,anchorMode:'flow',anchorOffset:3,pageIndex:0,x:0,y:0,width:20,height:20,rotation:0,opacity:1,wrap:false,paddingMm:0,hideRuling:false,z:30}];
  const design=makeUserTemplate(p,false,()=>5),withText=makeUserTemplate(p,true,()=>5);
  expect(bodyText(design)).toBe('');expect(design.objects).toHaveLength(0);expect(design.id).not.toBe(p.id);
  expect(bodyText(withText)).toBe('持ち出さない本文');expect(withText.objects[0].text).toBe('署名');
});
