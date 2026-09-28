import type { CSSProperties } from 'react';
import { type Project, type Background } from '../core/model';
import { rulingSegments, type Layout, type LayoutLine } from '../core/compose';
import { textCss } from './typography';
import { PaperDecoration } from './PaperDecoration';

export function backgroundImageStyle(bg: Pick<Background, 'fit'|'x'|'y'|'scale'|'opacity'>): CSSProperties {
  return {
    objectFit: bg.fit === 'stretch' ? 'fill' : bg.fit,
    objectPosition: `${bg.x}% ${bg.y}%`,
    opacity: bg.opacity,
    transform: `translate(${bg.fit === 'contain' ? (bg.x - 50) * (1 - bg.scale) : 0}%, 0%) scale(${bg.scale})`,
  };
}

export function PageArtwork({project,layout,index}:{project:Project;layout:Layout;index:number}) {
  const visual=layout.pages[index].visual;
  const bg=visual.background;
  const asset=bg.assetId?project.assets[bg.assetId]:undefined;
  return <div className="paper-art" aria-hidden="true" style={{backgroundColor:bg.color}}>
    {asset&&<img className="paper-background" draggable={false} src={asset.data} style={backgroundImageStyle(bg)} />}
    <PaperDecoration design={visual.design} width={layout.width} height={layout.height} writingMode={project.settings.writingMode}/>
    <svg className="ruling" width="100%" height="100%" viewBox={`0 0 ${layout.width} ${layout.height}`}>
      {rulingSegments(layout,index,project.settings.writingMode==='vertical').map((l,i)=><line key={i} {...l} stroke={visual.ruling.color} strokeWidth={visual.ruling.widthMm} />)}
    </svg>
  </div>;
}

export function LineContent({line,vertical,index}:{line:LayoutLine;vertical:boolean;index?:number}) {
  const style: CSSProperties={position:'absolute',left:`${line.x}mm`,top:`${line.y}mm`,width:`${vertical?line.spacing:line.extent}mm`,height:`${vertical?line.extent:line.spacing}mm`,lineHeight:`${line.spacing}mm`,writingMode:vertical?'vertical-rl':'horizontal-tb'};
  return <span className="body-line" data-line-index={index} data-line-start={line.start} data-line-end={line.end} style={style}>
    {line.tokens.map(token=><span key={token.start} data-token="" data-offset={token.start} data-end={token.end} style={{...textCss(token.style),textCombineUpright:token.tcy?'all':'none'}}>{token.text}</span>)}
    {line.breakAfter&&<span data-offset={line.end-(line.breakText??line.breakAfter).length} data-end={line.end} data-separator={line.breakAfter==='\f'?'page':'paragraph'} className="text-separator">{line.breakText??line.breakAfter}</span>}
    {!line.tokens.length&&!line.breakAfter&&<span data-offset={line.start} data-end={line.end} data-empty="">{'\u200b'}</span>}
  </span>;
}
