import {expect,test} from 'vitest';
import {bodyText,newProject,replaceRange} from '../src/core/model';
import {packProject,unpackProject} from '../src/core/archive';
import {compose} from '../src/core/compose';
import {templates,createFromTemplate,makeUserTemplate,appThemes} from '../src/core/templates';
import {generatedArt,templateArtPath} from '../src/ui/PaperDecoration';
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
    expect(pngColorType(fileURLToPath(new URL(`../public/template-art/${id}.png`,import.meta.url)))).toBe(6);
    expect(templateArtPath(id,generatedArt[id])).toBe(`/template-art/${id}.png?v=20260913`);
  }
});
test('和洋各10種・季節ごと各2種、別管理の外観21テーマを備える',()=>{
  expect(templates).toHaveLength(20);expect(appThemes).toHaveLength(21);
  for(const family of ['和風','洋風'])for(const season of ['通年','春','夏','秋','冬'])expect(templates.filter(t=>t.family===family&&t.season===season)).toHaveLength(2);
});
test('便箋由来の画面テーマは、選択用プレビューに同じイラストデザインを持つ',()=>{
  expect(appThemes.find(theme=>theme.id==='plain')?.previewDesign).toBeUndefined();
  expect(appThemes.find(theme=>theme.id==='sakura')?.previewDesign).toBe('sakura-first');
});
test('全20種で縦横・最初と続きのデザインを文書として保存できる',()=>{
  expect(templates.length).toBe(20);
  for(const t of templates)for(const mode of ['horizontal','vertical'] as const){
    const p=replaceRange(createFromTemplate(t.id,mode),0,0,'第一頁\f第二頁');
    const restored=unpackProject(packProject(p)),layout=compose(restored,()=>5);
    expect(layout.pages).toHaveLength(2);expect(layout.pages[0].visual.design).not.toBe(layout.pages[1].visual.design);
    expect(restored.settings.writingMode).toBe(mode);
  }
});
test('デザインのみのユーザーテンプレートに本文や署名を混入しない',()=>{
  const p=replaceRange(newProject(),0,0,'持ち出さない本文');
  p.objects=[{id:'signature',kind:'text',text:'署名',style:p.baseStyle,anchorMode:'flow',anchorOffset:3,pageIndex:0,x:0,y:0,width:20,height:20,rotation:0,opacity:1,wrap:false,paddingMm:0,hideRuling:false,z:30}];
  const design=makeUserTemplate(p,false,()=>5),withText=makeUserTemplate(p,true,()=>5);
  expect(bodyText(design)).toBe('');expect(design.objects).toHaveLength(0);expect(design.id).not.toBe(p.id);
  expect(bodyText(withText)).toBe('持ち出さない本文');expect(withText.objects[0].text).toBe('署名');
});
