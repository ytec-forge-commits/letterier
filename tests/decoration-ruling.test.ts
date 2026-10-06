import {expect,test} from 'vitest';
import {compose,rulingSegments} from '../src/core/compose';
import {createFromTemplate} from '../src/core/templates';
import {decorationMotifLayout} from '../src/core/stationery-layout';
test.each(['horizontal','vertical'] as const)('飾り画像の矩形へ罫線を描かず、設定余白を保持する: %s',mode=>{
 const p=createFromTemplate('sakura',mode),layout=compose(p,()=>5),rules=rulingSegments(layout,0,mode==='vertical');
 const placements=decorationMotifLayout('sakura',210,297,mode,false).placements;
 for(const rule of rules)for(const box of placements){
  const inside=mode==='vertical'?rule.x1>box.x&&rule.x1<box.x+box.width&&rule.y2>box.y&&rule.y1<box.y+box.height:rule.y1>box.y&&rule.y1<box.y+box.height&&rule.x2>box.x&&rule.x1<box.x+box.width;
  expect(inside).toBe(false);
 }
 expect(layout.pages[0].visual.ruling.margins).toEqual({top:20,right:20,bottom:20,left:20});
 // Only the bands beside artwork are shortened; blank middle bands retain
 // the configured full body width/height instead of shrinking all margins.
 expect(layout.pages[0].caretLines.some(line=>line.extent===(mode==='vertical'?257:170))).toBe(true);
});
test('無地の和紙は従来の全面の罫線を保持する',()=>{const layout=compose(createFromTemplate('washi'),()=>5);expect(rulingSegments(layout,0,false).some(r=>r.x1===20&&r.x2===190)).toBe(true);});
test.each((['washi','classic','dots'] as const).flatMap(series=>(['horizontal','vertical'] as const).map(mode=>({series,mode}))))('$series : 追加図案は画像の矩形へ罫線を描かない: $mode',({series,mode})=>{
 const p=createFromTemplate(series,mode);p.pages[0].design=`${series}-v2`;
 const layout=compose(p,()=>5),rules=rulingSegments(layout,0,mode==='vertical');
 const boxes=mode==='vertical'?[{x:0,y:0,w:46,h:46},{x:164,y:251,w:46,h:46}]:[{x:164,y:0,w:46,h:46},{x:0,y:251,w:46,h:46}];
 expect(rules.length).toBeGreaterThan(0);
 for(const r of rules)for(const b of boxes)expect(mode==='vertical'?r.x1>b.x&&r.x1<b.x+b.w&&r.y2>b.y&&r.y1<b.y+b.h:r.y1>b.y&&r.y1<b.y+b.h&&r.x2>b.x&&r.x1<b.x+b.w).toBe(false);
});
test.each(['horizontal','vertical'] as const)('手動間隔の続きページでも飾りと罫線を分ける: %s',mode=>{
 const p=createFromTemplate('sakura',mode);p.pages[0].design='sakura-continuation';p.pages[0].ruling.autoSpacing=false;
 const layout=compose(p,()=>5),rules=rulingSegments(layout,0,mode==='vertical'),boxes=decorationMotifLayout('sakura',210,297,mode,true).placements;
 expect(rules.length).toBeGreaterThan(0);
 for(const rule of rules)for(const box of boxes)expect(mode==='vertical'?rule.x1>box.x&&rule.x1<box.x+box.width&&rule.y2>box.y&&rule.y1<box.y+box.height:rule.y1>box.y&&rule.y1<box.y+box.height&&rule.x2>box.x&&rule.x1<box.x+box.width).toBe(false);
});
