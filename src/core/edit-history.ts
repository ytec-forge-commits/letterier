import type {Project,Asset} from './model';
const sizes=new WeakMap<Project,number>();
function stateBytes(p:Project){let value=sizes.get(p);if(value===undefined){value=4096+p.body.runs.reduce((n,r)=>n+512+r.text.length*2,0)+p.pages.length*1024+p.objects.reduce((n,o)=>n+1024+(o.text?.length??0)*2,0);sizes.set(p,value);}return value;}
export function trimUndo(history:Project[],current:Project,budget=256*1024*1024){
 const seen=new Set<Asset>();let bytes=0;
 const add=(p:Project)=>{bytes+=stateBytes(p);for(const a of Object.values(p.assets))if(!seen.has(a)){seen.add(a);bytes+=512+(a.data.length+(a.original?.data.length??0))*2;}};
 add(current);let keep=history.length;
 for(let i=history.length-1;i>=0&&history.length-i<=150;i--){add(history[i]);if(bytes>budget)break;keep=i;}
 if(keep>0)history.splice(0,keep);
}
