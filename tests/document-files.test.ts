import { beforeEach, expect, test, vi } from 'vitest';
// React scheduling and native dialogs are external boundaries; persistence and archives run unchanged.
const h=vi.hoisted(()=>({refs:[] as {current:unknown}[],at:0,state:0,effects:[] as (()=>unknown)[],disk:new Uint8Array() as Uint8Array,loaded:null as any,errors:[] as string[],grants:new Map<string,Uint8Array>(),next:0,native:false,queued:false}));
vi.mock('react',()=>({
 useRef:(initial:unknown)=>h.refs[h.at++]??=( {current:initial}),
 useState:(initial:unknown)=>[h.state++===1?true:initial,()=>{}],
 useEffect:(effect:()=>unknown)=>h.effects.push(effect),
}));
async function readFile(){const token=String(++h.next);h.grants.set(token,h.disk.slice());return {token,name:'synthetic.binsen',bytes:Array.from(h.disk)};}
vi.mock('@tauri-apps/api/core',()=>({isTauri:()=>h.native,invoke:async()=>{if(!h.queued)return null;h.queued=false;return readFile();}}));
vi.mock('../src/persistence/platform',()=>({
 PlatformStorage:class {data=new Map<string,Uint8Array>();async get(k:string){return this.data.get(k)??null;}async put(k:string,b:Uint8Array){this.data.set(k,b);}async remove(k:string){this.data.delete(k);}},
 pickDocument:()=>readFile(),
 saveDocument:async(bytes:Uint8Array,_title:string,token:string)=>{
  if(token&& !Buffer.from(h.grants.get(token)!).equals(Buffer.from(h.disk)))throw new Error('external file changed');
  h.disk=bytes.slice();h.grants.set(token,h.disk.slice());return {token,name:'synthetic.binsen'};
 },
}));
import {useDocumentFiles} from '../src/ui/useDocumentFiles';
import {newProject,replaceRange,bodyText,type Project} from '../src/core/model';
import {packProject,unpackProject} from '../src/core/archive';
function render(p:Project){h.at=0;h.state=0;h.effects=[];return useDocumentFiles(p,value=>{h.loaded=value;},error=>{if(error)h.errors.push(error);});}
beforeEach(()=>{h.refs=[];h.at=0;h.state=0;h.effects=[];h.errors=[];h.grants.clear();h.next=0;h.native=false;h.queued=false;h.loaded=null;});
test.each(['dialog','activation'] as const)('reopening the current file through %s preserves pending edits and subsequent saves',async path=>{
 const first=replaceRange(newProject(),0,0,'保存済み');h.disk=packProject(first);h.native=path==='activation';
 let files=render(first);await files.open();
 const edited=replaceRange(first,4,4,'直前の追記');files=render(edited);
 if(path==='dialog')await files.open();
 else {h.queued=true;h.effects[1]();await vi.waitFor(()=>expect(bodyText(h.loaded)).toBe('保存済み直前の追記'));}
 expect(bodyText(h.loaded)).toBe('保存済み直前の追記');
 expect(bodyText(unpackProject(h.disk))).toBe('保存済み直前の追記');
 const further=replaceRange(h.loaded,9,9,'次の編集');files=render(further);await files.saveNow();
 expect(h.errors).toEqual([]);
 expect(bodyText(unpackProject(h.disk))).toBe('保存済み直前の追記次の編集');
});
