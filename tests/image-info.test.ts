import {expect,test} from 'vitest';
import {imageInfo} from '../src/core/image-info';
test('巨大PNGの宣言サイズは画像の復号前に拒否する',()=>{
 const bytes=new Uint8Array(33);bytes.set([137,80,78,71,13,10,26,10]);const v=new DataView(bytes.buffer);v.setUint32(8,13);bytes.set(new TextEncoder().encode('IHDR'),12);v.setUint32(16,1000000);v.setUint32(20,1000000);expect(()=>imageInfo(bytes)).toThrow(/画素|サイズ/);
 v.setUint32(16,120);v.setUint32(20,80);expect(imageInfo(bytes)).toMatchObject({mime:'image/png',width:120,height:80});
});
test('静止GIFのサイズとフレーム数を取得し壊れたブロックを拒否する',()=>{
 const bytes=Uint8Array.from(atob('R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='),c=>c.charCodeAt(0));expect(imageInfo(bytes)).toMatchObject({mime:'image/gif',width:1,height:1,frames:1});expect(()=>imageInfo(bytes.slice(0,18))).toThrow();
});
