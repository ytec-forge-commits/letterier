import {expect,test} from 'vitest';
import {build} from 'vite';

// Catch accidentally reintroducing license text into editing/startup imports.
// Inspect the real emitted module graph, not source spelling or mock import calls.
test('編集開始の静的読込にはフォントライセンス全文を含めず、要求時のチャンクに残す',async()=>{
 const built=await build({build:{write:false},logLevel:'silent'});
 const result=Array.isArray(built)?built[0]:built;
 if(!('output' in result))throw Error('Expected a non-watch build');
 const chunks=result.output.filter(item=>item.type==='chunk');
 const files=new Map(chunks.map(chunk=>[chunk.fileName,chunk]));
 const initial=new Set<string>();
 const visit=(chunk:typeof chunks[number])=>{if(initial.has(chunk.fileName))return;initial.add(chunk.fileName);for(const name of chunk.imports){const imported=files.get(name);if(imported)visit(imported);}};
 for(const chunk of chunks.filter(chunk=>chunk.isEntry))visit(chunk);
 const licenseChunks=chunks.filter(chunk=>Object.keys(chunk.modules).some(id=>id.endsWith('/ui/font-licenses.json')));
 expect(licenseChunks.length).toBeGreaterThan(0);
 expect(licenseChunks.filter(chunk=>initial.has(chunk.fileName)).map(chunk=>chunk.fileName)).toEqual([]);
},20000);
