import {expect,test} from 'vitest';
import {newProject,replaceRange,type FloatingObject} from '../src/core/model';
import {compose} from '../src/core/compose';
import {changeWritingMode,moveFixedObjectToPage} from '../src/core/objects';
import {autoScrollDelta,dropObjectOnPage,nearestPageIndex} from '../src/core/object-drag';
import {packProject,unpackProject} from '../src/core/archive';

test('本文を全削除してもページ固定文字箱の位置と保存可能性を保つ',()=>{
  const p=replaceRange(newProject(),0,0,'消す本文');
  p.objects=[{id:'signature',kind:'text',text:'残す署名',style:{...p.baseStyle},anchorMode:'page',anchorOffset:4,pageIndex:0,x:30,y:40,width:50,height:20,rotation:0,opacity:1,wrap:false,paddingMm:0,hideRuling:false,z:1}];
  const changed=replaceRange(p,0,4,'');
  const loaded=unpackProject(packProject(changed));
  expect(loaded.objects[0]).toMatchObject({text:'残す署名',x:30,y:40,anchorMode:'page',anchorOffset:0});
});
test('縦横の切替で本文追従を保ちつつ画像を用紙外へ跳ばさない',()=>{
  const p=replaceRange(newProject(),0,0,'拝啓\n合成テスト');
  const object:FloatingObject={id:'picture',kind:'image',assetId:'test',anchorMode:'flow',anchorOffset:0,pageIndex:0,x:55,y:0,width:60,height:60,rotation:0,opacity:1,wrap:true,paddingMm:3,hideRuling:true,z:10};
  p.objects=[object];const before=compose(p,()=>5).objects[0];
  const changed=changeWritingMode(p,'vertical',()=>5),after=compose(changed,()=>5).objects[0];
  expect(after.actualX).toBeCloseTo(before.actualX);expect(after.actualY).toBeCloseTo(before.actualY);
  expect(after.anchorMode).toBe('flow');expect(after.anchorOffset).toBe(0);
  const back=changeWritingMode(changed,'horizontal',()=>5);expect(back.objects[0].x).toBeCloseTo(object.x);
});
test('ページ固定の画像は座標を保ったまま指定ページへ移動する',()=>{
  const p=newProject();
  p.objects=[{id:'picture',kind:'image',assetId:'test',anchorMode:'page',anchorOffset:0,pageIndex:0,x:32,y:48,width:60,height:40,rotation:0,opacity:1,wrap:false,paddingMm:0,hideRuling:false,z:10}];
  expect(moveFixedObjectToPage(p,'picture',2).objects[0]).toMatchObject({pageIndex:2,x:32,y:48});
});
test('ドラッグ位置に最も近いページと、そのページ内の画像座標を求める',()=>{
  const pages=[
    {left:100,top:100,right:500,bottom:700,width:400,height:600},
    {left:100,top:760,right:500,bottom:1360,width:400,height:600},
  ];
  expect(nearestPageIndex(260,800,pages)).toBe(1);
  expect(dropObjectOnPage(260,800,{x:20,y:10},pages[1],200,300,40,30)).toEqual({x:60,y:10});
});
test('画像ドラッグが表示領域の上下端へ近づくほど自動スクロールする',()=>{
  expect(autoScrollDelta(105,100,700)).toBeLessThan(0);
  expect(autoScrollDelta(400,100,700)).toBe(0);
  expect(autoScrollDelta(695,100,700)).toBeGreaterThan(0);
});
