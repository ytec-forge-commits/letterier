import { useMemo } from 'react';
import type { Project } from '../core/model';
import { compose,type Layout } from '../core/compose';
import { PageArtwork,LineContent } from './Paper';
import { ObjectArtwork,objectCss } from './ObjectLayer';
import { measureText } from './typography';
export function ReadonlyPage({project,layout,index}:{project:Project;layout:Layout;index:number}){
  return <><PageArtwork project={project} layout={layout} index={index}/><div className="page-text">{layout.pages[index].lines.map((line,i)=><LineContent key={i} line={line} vertical={project.settings.writingMode==='vertical'}/>)}</div>{layout.objects.filter(o=>o.actualPage===index).map(o=><div key={o.id} className="object-art" style={objectCss(o)}><ObjectArtwork object={o} project={project}/></div>)}</>;
}
export function ReadonlyPages({project,zoom=.43}:{project:Project;zoom?:number}){
  const layout=useMemo(()=>compose(project,measureText),[project]);
  return <div className="preview-pages">{layout.pages.map((_,i)=><div className="sheet-frame" key={i} style={{width:layout.width*96/25.4*zoom,height:layout.height*96/25.4*zoom}}><div className="paper" style={{width:`${layout.width}mm`,height:`${layout.height}mm`,transform:`scale(${zoom})`}}><ReadonlyPage project={project} layout={layout} index={i}/></div></div>)}</div>;
}
