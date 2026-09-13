import { useEffect, useRef, type ReactNode } from 'react';
export function Modal({title,onClose,children,wide=false}:{title:string;onClose?:()=>void;children:ReactNode;wide?:boolean}){
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{const dialog=ref.current!;dialog.showModal();return ()=>dialog.close();},[]);
  return <dialog ref={ref} className={`modal ${wide?'modal-wide':''}`} aria-label={title} onCancel={e=>{e.preventDefault();onClose?.();}}><header><h2>{title}</h2>{onClose&&<button aria-label="閉じる" onClick={onClose}>✕</button>}</header>{children}</dialog>;
}
