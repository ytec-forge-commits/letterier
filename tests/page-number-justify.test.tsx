import {expect,test} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {newProject,replaceRange} from '../src/core/model';
import {compose} from '../src/core/compose';
import {packProject,unpackProject,validateProject} from '../src/core/archive';
import {PageArtwork,LineContent} from '../src/ui/Paper';

test.each(['horizontal','vertical'] as const)('印刷用の複数桁ページ番号も%sでアラビア数字を使う',writingMode=>{
 const p=replaceRange(newProject(),0,0,Array.from({length:12},(_,i)=>`合成本文${i+1}`).join('\f'));
 Object.assign(p.settings,{writingMode,showPageNumbers:true});
 const layout=compose(p,()=>5);
 const html=renderToStaticMarkup(<PageArtwork project={p} layout={layout} index={11}/>);
 expect(html).toMatch(/class="paper-page-number"[^>]*>12<\/span>/);
 expect(html).not.toContain('１２');expect(html).not.toContain('十二');
});

test('ページ番号と両端揃えを保存し、旧文書では表示を変えない',()=>{
 const p=newProject();Object.assign(p.settings,{showPageNumbers:true,justifyText:true});
 const read=unpackProject(packProject(p));
 expect(read.settings).toMatchObject({showPageNumbers:true,justifyText:true});
 const legacy=newProject();expect(validateProject(legacy).settings).toEqual(legacy.settings);expect(!!validateProject(legacy).settings.showPageNumbers).toBe(false);expect(!!validateProject(legacy).settings.justifyText).toBe(false);
 for(const key of ['showPageNumbers','justifyText'])expect(()=>validateProject({...p,settings:{...p.settings,[key]:'yes'}})).toThrow();
});
test.each(['horizontal','vertical'] as const)('下中央のページ番号は%sでも横向きで、OFFでは出力されない',writingMode=>{
 const p=replaceRange(newProject(),0,0,'一枚目\f二枚目');p.settings.writingMode=writingMode;
 Object.assign(p.settings,{showPageNumbers:true});
 const layout=compose(p,()=>5),html=renderToStaticMarkup(<PageArtwork project={p} layout={layout} index={1}/>);
 expect(html).toMatch(/class="paper-page-number"[^>]*>2<\/span>/);
 expect(html).toContain('writing-mode:horizontal-tb');expect(html).toContain('text-align:center');
 Object.assign(p.settings,{showPageNumbers:false});
 expect(renderToStaticMarkup(<PageArtwork project={p} layout={compose(p,()=>5)} index={1}/>)).not.toContain('paper-page-number');
});
test.each(['horizontal','vertical'] as const)('両端揃えは%sの折返し行だけを広げ、文字・書式・手動改行を保つ',writingMode=>{
 const p=replaceRange(newProject({automaticRuling:false}),0,0,'あいうえおかき\n短い\f次');p.settings.writingMode=writingMode;
 // 5mm幅の文字を4個ずつ置く22mmの行。余り2mmを3か所へ配る。
 p.baseStyle.sizePt=5*72/25.4;p.pages[0].design='none';p.continuation.design='none';
 p.pages[0].ruling.margins=writingMode==='horizontal'?{top:20,bottom:20,left:94,right:94}:{top:137.5,bottom:137.5,left:20,right:20};
 Object.assign(p.settings,{justifyText:true});
 const before=JSON.stringify(p.body),layout=compose(p,()=>5),lines=layout.pages[0].lines;
 expect(lines[0].tokens.reduce((n,t)=>n+t.advance,0)).toBeCloseTo(22);
 expect(lines[0].tokens.map(t=>t.text).join('')).toBe('あいうえ');
 expect(lines[0].tokens[0].advance).toBeCloseTo(5+2/3);
 expect(lines[0].tokens.at(-1)!.advance).toBeCloseTo(5);
 expect(lines[1].tokens.reduce((n,t)=>n+t.advance,0)).toBeCloseTo(15);
 expect(lines[2].tokens.reduce((n,t)=>n+t.advance,0)).toBeCloseTo(10);
 expect(JSON.stringify(p.body)).toBe(before);
 const html=renderToStaticMarkup(<LineContent line={lines[0]} vertical={writingMode==='vertical'}/>);
 expect(html).toContain('margin-inline-end:');
});
test('ページ番号が有効なとき本文は下端の番号領域を避ける',()=>{
 const p=replaceRange(newProject({automaticRuling:false}),0,0,'あ\n'.repeat(50));p.pages[0].ruling.margins.bottom=0;p.continuation.ruling.margins.bottom=0;
 Object.assign(p.settings,{showPageNumbers:true});
 const layout=compose(p,()=>5);
 expect(Math.max(...layout.pages.flatMap(p=>p.lines.map(l=>l.y+l.spacing)))) .toBeLessThanOrEqual(281.001);
});
