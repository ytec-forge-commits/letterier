import {expect,test} from 'vitest';
import {newProject} from '../src/core/model';
import {backgroundRect,moveBackground,resizeBackground} from '../src/core/background';
const paper={width:210,height:297},image={width:100,height:100};
const bg={...newProject().pages[0].background,fit:'contain' as const};

test('ハンドルの矩形は画像の実際の収まり方と一致する',()=>{
  expect(backgroundRect(bg,paper,image)).toEqual({x:0,y:43.5,width:210,height:210});
  expect(backgroundRect({...bg,fit:'cover'},paper,image)).toEqual({x:-43.5,y:0,width:297,height:297});
});
test('倍率に関係なくマウス移動量どおりに縦横へ移動する',()=>{
  const start={...bg,scale:2,offsetXmm:0,offsetYmm:0};
  const moved=moveBackground(start,paper,image,12,-7);
  expect(backgroundRect(moved,paper,image)).toEqual({x:-93,y:-68.5,width:420,height:420});
});
test('旧形式の位置指定を直接編集に移しても最初に画像が跳ねない',()=>{
  const start={...bg,scale:.63,x:0};
  const rect=backgroundRect(start,paper,image);
  expect(backgroundRect(moveBackground(start,paper,image,0,0),paper,image)).toEqual(rect);
  expect(backgroundRect(moveBackground(start,paper,image,5,-2),paper,image).x).toBeCloseTo(5);
});
test('画像全体が見失われる移動を防ぐ',()=>{
  const moved=moveBackground(bg,paper,image,9999,-9999);
  const rect=backgroundRect(moved,paper,image);
  expect(rect.x).toBe(200);
  expect(rect.y+rect.height).toBe(10);
});
test('右下ハンドルは縦横比と左上位置を保って縮小する',()=>{
  const resized=resizeBackground(bg,paper,image,'se',-105,-105);
  expect(resized.scale).toBe(.5);
  expect(backgroundRect(resized,paper,image)).toEqual({x:0,y:43.5,width:105,height:105});
});
test('右上ハンドルは左下位置を保って拡大する',()=>{
  const resized=resizeBackground(bg,paper,image,'ne',105,-105);
  expect(resized.scale).toBe(1.5);
  expect(backgroundRect(resized,paper,image)).toEqual({x:0,y:-61.5,width:315,height:315});
});
test('拡縮の反転や極端なドラッグで負の倍率を作らない',()=>{
  expect(resizeBackground(bg,paper,image,'se',-9999,-9999).scale).toBe(.1);
  expect(resizeBackground(bg,paper,image,'se',9999,9999).scale).toBe(5);
});
