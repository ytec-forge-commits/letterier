import {expect,test} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {PaperDecoration} from '../src/ui/PaperDecoration';
import {compose,rulingSegments} from '../src/core/compose';
import {createFromTemplate} from '../src/core/templates';
import {decorationMotifLayout} from '../src/core/stationery-layout';

test('図案1は既存の主役・脇役素材を表示する（旧IDも維持）',()=>{
 const props={width:210,height:297,writingMode:'horizontal' as const};
 const legacy=renderToStaticMarkup(<PaperDecoration {...props} design="sakura-first"/>);
 const variant=renderToStaticMarkup(<PaperDecoration {...props} design="sakura-v1"/>);
 expect(variant).toBe(legacy);expect(variant).toContain('/template-motifs/sakura.png');expect(variant).toContain('sakura-companion.png');
});

test.each(['horizontal','vertical'] as const)('新図案IDでも実際の飾り矩形から罫線を避ける: %s',mode=>{
 const p=createFromTemplate('sakura',mode,{design:1,cycle:false}),layout=compose(p,()=>5),rules=rulingSegments(layout,0,mode==='vertical');
 for(const rule of rules)for(const box of decorationMotifLayout('sakura',210,297,mode,false).placements){
  expect(mode==='vertical'?rule.x1>box.x&&rule.x1<box.x+box.width&&rule.y2>box.y&&rule.y1<box.y+box.height:rule.y1>box.y&&rule.y1<box.y+box.height&&rule.x2>box.x&&rule.x1<box.x+box.width).toBe(false);
 }
});

test('制作した桜の各図案に、別々の主役・脇役素材を表示する',()=>{
 for(const number of [2,3,4,5]){
  const markup=renderToStaticMarkup(<PaperDecoration design={`sakura-v${number}`} width={210} height={297} writingMode="horizontal"/>);
  expect(markup).toContain(`/template-motifs/sakura-v${number}.png`);expect(markup).toContain(`/template-motifs/sakura-v${number}-companion.png`);
  expect(markup).not.toContain('/template-motifs/sakura.png');
 }
});

test('未制作図案を既存素材の複製で完成扱いにせず、未知IDも描画しない',()=>{
 for(const design of ['dots-v6','sakura-v6','sakura-cycle-1','unknown-v1'])expect(renderToStaticMarkup(<PaperDecoration design={design} width={210} height={297} writingMode="horizontal"/>)).toBe('');
});
