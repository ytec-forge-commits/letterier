import {expect,test} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {compose} from '../src/core/compose';
import {newProject,replaceRange} from '../src/core/model';
import {LineContent} from '../src/ui/Paper';
test('半角括弧を縦書きの横向きにし、文字列と縦中横は保持する',()=>{
 const p=replaceRange(newProject(),0,0,'(A)[B]{C}12');p.settings.writingMode='vertical';
 const line=compose(p,()=>3).pages[0].lines[0],html=renderToStaticMarkup(createElement(LineContent,{line,vertical:true}));
 expect(html.match(/text-orientation:mixed/g)).toHaveLength(6);
 expect(html).toContain('text-combine-upright:all');expect(line.tokens.map(t=>t.text).join('')).toBe('(A)[B]{C}12');
});
test('横書きの括弧には縦書き用の向きを追加しない',()=>{const p=replaceRange(newProject(),0,0,'(A)');const line=compose(p,()=>3).pages[0].lines[0];expect(renderToStaticMarkup(createElement(LineContent,{line,vertical:false}))).not.toContain('text-orientation:mixed');});
