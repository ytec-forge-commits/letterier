import { useEffect, useId, useRef, type ReactNode } from 'react';
export function Modal({title,onClose,children,wide=false}:{title:string;onClose?:()=>void;children:ReactNode;wide?:boolean}){
  const ref=useRef<HTMLDialogElement>(null);
  const outsideStart=useRef(false);
  const isOutside=(x:number,y:number)=>{const box=ref.current!.getBoundingClientRect();return x<box.left||x>box.right||y<box.top||y>box.bottom;};
  useEffect(()=>{const dialog=ref.current!;dialog.showModal();return ()=>dialog.close();},[]);
  const titleId=useId();
  return <dialog ref={ref} className={`modal ${wide?'modal-wide':''}`} aria-labelledby={titleId} onPointerDown={e=>{outsideStart.current=e.target===e.currentTarget&&isOutside(e.clientX,e.clientY);}} onPointerCancel={()=>{outsideStart.current=false;}} onClick={e=>{const close=outsideStart.current&&e.target===e.currentTarget&&isOutside(e.clientX,e.clientY);outsideStart.current=false;if(close)onClose?.();}} onCancel={e=>{e.preventDefault();onClose?.();}}><header><h2 id={titleId}>{title}</h2>{onClose&&<button aria-label="閉じる" title="閉じる" onClick={onClose}>✕</button>}</header>{children}</dialog>;
}
