// Read-only, synthetic QA evidence. This does not attest to a running WebView2 or process restart.
import {readFileSync,realpathSync} from 'node:fs';
import {dirname,resolve,relative,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {unzipSync,strFromU8} from 'fflate';
const project=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2),options=new Map();
for(let i=0;i<args.length;i+=2){if(!['--root','--file','--stage'].includes(args[i])||!args[i+1])throw Error('Invalid evidence arguments');options.set(args[i],args[i+1]);}
const within=(parent,child)=>{const part=relative(parent,child);return part!==''&&!part.startsWith('..')&&!isAbsolute(part);};
const root=realpathSync(resolve(options.get('--root')??''));
if(!within(realpathSync(resolve(project,'.local')),root))throw Error('Dedicated project .local QA directory required');
const file=options.get('--file');if(!/^manual(?:-round2)?\.binsen$/.test(file??''))throw Error('Dedicated synthetic document required');
const first='合成保存試験：最初の本文',manual=first+'／Windows手動保存',latest=manual+'／Windows回復専用';
const stage=options.get('--stage'),expected={autosave:[first,manual],manual:[manual,manual],recovery:[manual,latest]}[stage];
if(!expected)throw Error('Invalid evidence stage');
const read=path=>{const actual=realpathSync(resolve(root,path));if(!within(root,actual))throw Error('QA evidence path escaped its root');return readFileSync(actual);};
const pointer=JSON.parse(read('store/session-current.data').toString('utf8'));
if(!/^[a-zA-Z0-9_-]{1,100}$/.test(pointer?.id??''))throw Error('Invalid recovery pointer');
const decode=bytes=>{const entry=unzipSync(bytes)['project.json'];if(!entry)throw Error('Missing archived project');const value=JSON.parse(strFromU8(entry));if(value.version!==2||!Array.isArray(value.body?.runs)||value.body.runs.some(run=>typeof run.text!=='string'))throw Error('Invalid evidence archive');return {id:value.id,body:value.body.runs.map(run=>run.text).join('')};};
const original=decode(read(file)),draft=decode(read(`store/draft-${pointer.id}.data`));
if(draft.id!==pointer.id||original.body!==expected[0]||draft.body!==expected[1])throw Error('Native save evidence mismatch');
console.log(JSON.stringify({stage,file,id:pointer.id,manualBody:original.body,draftBody:draft.body,scope:'native files only; runtime/process evidence must be checked separately'}));
