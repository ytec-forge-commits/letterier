export interface Revision { id:string;hash:string;time:number;label:string;protected:boolean;preview:string }
export function addRevision(existing:Revision[], next:Revision, limit=50):Revision[] {
  const duplicate=existing.find(e=>e.hash===next.hash);
  if(duplicate) return existing.map(e=>e.hash===next.hash&&next.protected?{...e,protected:true,label:next.label}:e);
  const entries=[...existing,next];
  const normal=entries.filter(e=>!e.protected).slice(-Math.max(1,limit));
  const kept=new Set(normal.map(e=>e.id));
  return entries.filter(e=>e.protected||kept.has(e.id));
}
