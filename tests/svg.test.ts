import {expect,test} from 'vitest';
import {inspectSvg} from '../src/core/svg';
const wrap=(content:string)=>`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="80">${content}</svg>`;
test('透明なベクターと内部グラデーション・安全なスタイルは原本を保持する',()=>{
 const svg=wrap('<defs><linearGradient id="g"><stop offset="0" stop-color="#f00"/><stop offset="1" stop-color="#00f"/></linearGradient></defs><style>.flower{fill:url(#g);stroke:#fff;stroke-width:2}</style><path class="flower" d="M0 0L50 70L100 0Z"/>');
 expect(inspectSvg(svg)).toEqual({width:100,height:80});expect(inspectSvg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 75"><circle cx="20" cy="20" r="10"/></svg>')).toEqual({width:50,height:75});
});
test('SVGからスクリプト・外部通信・外部CSS・動的要素を通さない',()=>{
 for(const source of ['<script>alert(1)</script>','<rect onload="alert(1)"/>','<image href="https://example.invalid/secret"/>','<use href="file:///private.svg#x"/>','<rect fill="url(https://example.invalid/a)"/>','<style>@import "https://example.invalid/a";</style>','<style>.x{fill:u\\72l(http://example.invalid)}</style>','<foreignObject><div>HTML</div></foreignObject>','<animate attributeName="x"/>'])expect(()=>inspectSvg(wrap(source))).toThrow();
 expect(()=>inspectSvg('<!DOCTYPE svg [<!ENTITY x SYSTEM "file:///private">]>'+wrap('&x;'))).toThrow();
 expect(()=>inspectSvg('<?xml-stylesheet href="https://example.invalid/a"?>'+wrap(''))).toThrow();
});
test('巨大サイズ・壊れたXML・過剰な要素数を描画前に拒否する',()=>{
 expect(()=>inspectSvg('<svg xmlns="http://www.w3.org/2000/svg" width="1000000" height="1000000"/>')).toThrow();
 expect(()=>inspectSvg(wrap('<g>'))).toThrow();expect(()=>inspectSvg(wrap('<g/>'.repeat(10001)))).toThrow();
});
