export interface EditGroup {kind:'typing'|'deleting';nextCursor:number;time:number}
const PAUSE_MS=900;
export function shouldCoalesceEdit(previous:EditGroup|null,kind:EditGroup['kind'],cursor:number,time:number):boolean{
  if(!previous||previous.kind!==kind||time-previous.time>PAUSE_MS)return false;
  return kind==='deleting'||previous.nextCursor===cursor;
}
