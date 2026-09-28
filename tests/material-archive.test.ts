import {expect,test} from 'vitest';
import {zipSync,strToU8} from 'fflate';
import {newProject} from '../src/core/model';
import {packProject,unpackProject,unpackProjectInfo} from '../src/core/archive';
const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==';
test('静止キャッシュと元GIF・選択コマを一つの文書で持ち運べる',()=>{
 const p=newProject();p.assets.flower={id:'flower',name:'花.gif',mime:'image/png',data:`data:image/png;base64,${png}`,original:{name:'花.gif',format:'gif',index:0,data:'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='}};
 expect(unpackProject(packProject(p)).assets.flower).toEqual(p.assets.flower);
});
test('保存形式1を読み込み、元ファイルを変えず新形式へ移行する',()=>{
 const source={...newProject(),version:1};const bytes=zipSync({'project.json':strToU8(JSON.stringify(source))});const before=bytes.slice();
 const info=unpackProjectInfo(bytes);expect(info.sourceVersion).toBe(1);expect(info.project.version).toBe(2);expect(bytes).toEqual(before);expect(unpackProject(packProject(info.project)).version).toBe(2);
});
test('元素材の形式偽装や整数でない配置位置番号を拒否する',()=>{
 const p=newProject();p.assets.flower={id:'flower',name:'bad.gif',mime:'image/png',data:`data:image/png;base64,${png}`,original:{name:'bad.gif',format:'gif',index:0,data:png}};expect(()=>packProject(p)).toThrow();
});
