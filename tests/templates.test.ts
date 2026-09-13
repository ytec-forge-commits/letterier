import {expect,test} from 'vitest';
import {bodyText,newProject,replaceRange} from '../src/core/model';
import {packProject,unpackProject} from '../src/core/archive';
import {compose} from '../src/core/compose';
import {templates,createFromTemplate,makeUserTemplate,appThemes} from '../src/core/templates';
import {decorationMotifPlacement,generatedArt,templateArtPath} from '../src/ui/PaperDecoration';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

function pngColorType(path:string){
  return readFileSync(path)[25];
}
test('白の和紙は画像なし、生成素材はテンプレート間で共有しない',()=>{
  expect(generatedArt.washi).toBeUndefined();
  expect(new Set(Object.values(generatedArt)).size).toBe(Object.values(generatedArt).length);
});
test('藍の市松素材はチェッカー柄を背景に焼き込まずRGBA透過である',()=>{
  expect(pngColorType(fileURLToPath(new URL('../public/template-art/ichimatsu.png',import.meta.url)))).toBe(6);
});
test('描き直した便箋素材は更新後のURLを使い古いキャッシュを表示しない',()=>{
  for(const id of ['ichimatsu','sakura','nanohana','asagao','goldfish','momiji','snow-garden','camellia','moon','mimosa','tulip','seaside','lemon','autumn-leaf','woodland','snowflake','christmas']){
    expect(generatedArt[id]).toBe(id);
    expect(pngColorType(fileURLToPath(new URL(`../public/template-motifs/${id}.png`,import.meta.url)))).toBe(6);
    expect(templateArtPath(id,generatedArt[id])).toBe(`/template-motifs/${id}.png?v=20260914`);
  }
});
test('和洋各10種・季節ごと各2種、別管理の外観21テーマを備える',()=>{
  expect(templates).toHaveLength(20);expect(appThemes).toHaveLength(21);
  for(const family of ['和風','洋風'])for(const season of ['通年','春','夏','秋','冬'])expect(templates.filter(t=>t.family===family&&t.season===season)).toHaveLength(2);
});
test('画面テーマは便箋画像を持たず配色だけで選べる',()=>{
  expect(appThemes.every(theme=>!('previewDesign' in theme))).toBe(true);
});
test('便箋イラストは大画像の断片ではなく本文外のワンポイント1点として配置する',()=>{
  const horizontal=decorationMotifPlacement(210,297,'horizontal',false);
  const vertical=decorationMotifPlacement(210,297,'vertical',false);
  const continuation=decorationMotifPlacement(210,297,'horizontal',true);
  expect(horizontal).toEqual({x:176,y:263,width:30,height:30,reserved:{top:20,right:36,bottom:36,left:20}});
  expect(vertical).toEqual({x:4,y:4,width:30,height:30,reserved:{top:36,right:20,bottom:20,left:36}});
  expect(continuation).toEqual({x:182,y:269,width:24,height:24,reserved:{top:20,right:30,bottom:30,left:20}});
  for(const placement of [horizontal,vertical,continuation]){
    const body={left:placement.reserved.left,top:placement.reserved.top,right:210-placement.reserved.right,bottom:297-placement.reserved.bottom};
    const overlaps=placement.x<body.right&&placement.x+placement.width>body.left&&placement.y<body.bottom&&placement.y+placement.height>body.top;
    expect(overlaps).toBe(false);
  }
});
test('イラスト付き便箋は書字方向に応じてワンポイント用の本文余白を確保する',()=>{
  const horizontal=createFromTemplate('lemon','horizontal');
  const vertical=createFromTemplate('lemon','vertical');
  expect(horizontal.pages[0].ruling.margins).toEqual({top:20,right:36,bottom:36,left:20});
  expect(horizontal.continuation.ruling.margins).toEqual({top:20,right:30,bottom:30,left:20});
  expect(vertical.pages[0].ruling.margins).toEqual({top:36,right:20,bottom:20,left:36});
  expect(createFromTemplate('washi').pages[0].ruling.margins).toEqual({top:20,right:20,bottom:20,left:20});
});
test('旧版の標準余白で保存されたイラスト便箋だけを安全余白へ補正する',()=>{
  const old=newProject();old.templateId='lemon';old.settings.writingMode='horizontal';old.pages[0].design='lemon-first';old.continuation.design='lemon-continuation';
  const restored=unpackProject(packProject(old));
  expect(restored.pages[0].ruling.margins).toEqual({top:20,right:36,bottom:36,left:20});
  expect(restored.continuation.ruling.margins).toEqual({top:20,right:30,bottom:30,left:20});
  old.pages[0].ruling.margins={top:18,right:22,bottom:25,left:19};
  expect(unpackProject(packProject(old)).pages[0].ruling.margins).toEqual({top:18,right:22,bottom:25,left:19});
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
