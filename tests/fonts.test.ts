import {expect,test} from 'vitest';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {bundledFonts,bundledFamily} from '../src/core/bundled-fonts';
import {addRecentFont} from '../src/core/recent-fonts';
test('20種の同梱フォントの原本ハッシュ・ライセンスが揃い内部名がWindows版と分離される',()=>{
 expect(bundledFonts).toHaveLength(20);
 for(const f of bundledFonts){expect(bundledFamily(f.name)).not.toBe(f.name);expect(readFileSync(`public/fonts/${f.slug}/OFL.txt`,'utf8')).toMatch(/SIL OPEN FONT LICENSE/);for(const file of f.files)expect(createHash('sha256').update(readFileSync(`public/fonts/${f.slug}/${file.file}`)).digest('hex')).toBe(file.sha256);}
 expect(bundledFamily('游明朝')).toBe('游明朝');
});
test('使用履歴は直近5種に制限し、再使用を重複せず先頭へ移す',()=>{
 let recent:string[]=[];for(const f of ['A','B','C','D','E','F'])recent=addRecentFont(recent,f);
 expect(recent).toEqual(['F','E','D','C','B']);expect(addRecentFont(recent,'D')).toEqual(['D','F','E','C','B']);
});
