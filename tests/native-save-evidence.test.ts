import {afterEach,expect,test} from 'vitest';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync,readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {zipSync,strToU8} from 'fflate';
const roots:string[]=[];
afterEach(()=>{for(const root of roots.splice(0))rmSync(root,{recursive:true,force:true});});
const first='合成保存試験：最初の本文',manual=first+'／Windows手動保存',latest=manual+'／Windows回復専用';
function fixture(fileBody:string,draftBody:string){
 mkdirSync('.local',{recursive:true});const root=mkdtempSync(resolve('.local/native-save-evidence-test-'));roots.push(root);
 mkdirSync(join(root,'store'));
 const archive=(text:string)=>zipSync({'project.json':strToU8(JSON.stringify({version:2,id:'synthetic-native',body:{runs:[{text,style:{}}]}}))});
 writeFileSync(join(root,'manual.binsen'),archive(fileBody));
 writeFileSync(join(root,'store/session-current.data'),JSON.stringify({id:'synthetic-native'}));
 writeFileSync(join(root,'store/draft-synthetic-native.data'),archive(draftBody));return root;
}
function run(root:string,stage:string){return spawnSync(process.execPath,['scripts/verify-native-save-files.mjs','--root',root,'--file','manual.binsen','--stage',stage],{encoding:'utf8'});}
test('native保存証跡は復旧本文と元ファイルを別々に検証する',()=>{
 const root=fixture(manual,latest),result=run(root,'recovery');
 expect(result.status,result.stderr).toBe(0);expect(JSON.parse(result.stdout)).toMatchObject({stage:'recovery',manualBody:manual,draftBody:latest});
});
test('自動保存が元ファイルも更新した証跡を成功扱いしない',()=>{
 const root=fixture(manual,manual),before=readFileSync(join(root,'manual.binsen'));const result=run(root,'autosave');
 expect(result.status).not.toBe(0);expect(result.stderr).toContain('Native save evidence mismatch');expect(readFileSync(join(root,'manual.binsen'))).toEqual(before);
});
test('最新の復旧本文が古い場合と不正なpointerを成功扱いしない',()=>{
 const root=fixture(manual,manual),stale=run(root,'recovery');expect(stale.status).not.toBe(0);expect(stale.stderr).toContain('Native save evidence mismatch');
 writeFileSync(join(root,'store/session-current.data'),JSON.stringify({id:'../outside'}));
 const invalid=run(root,'recovery');expect(invalid.status).not.toBe(0);expect(invalid.stderr).toContain('Invalid recovery pointer');
});
