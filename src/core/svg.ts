import {DOMParser,onWarningStopParsing,type Element,type Node} from '@xmldom/xmldom';
import {chargePixels,staticRasterInfo,type PixelBudget} from './image-info';
const namespace='http://www.w3.org/2000/svg';
const tags=new Set('svg g defs symbol use path rect circle ellipse line polyline polygon text tspan textPath linearGradient radialGradient stop clipPath mask pattern image style title desc'.split(' '));
const properties=new Set('fill fill-opacity fill-rule stroke stroke-width stroke-opacity stroke-linecap stroke-linejoin stroke-miterlimit stroke-dasharray stroke-dashoffset opacity color stop-color stop-opacity font-family font-size font-weight font-style text-anchor dominant-baseline alignment-baseline letter-spacing word-spacing text-decoration display visibility paint-order clip-path clip-rule mask vector-effect'.split(' '));
const attributes=new Set('id class version viewBox preserveAspectRatio x y x1 y1 x2 y2 cx cy r rx ry width height d points transform gradientTransform patternTransform gradientUnits patternUnits patternContentUnits clipPathUnits maskUnits maskContentUnits offset spreadMethod fx fy fr dx dy rotate textLength lengthAdjust startOffset method spacing'.split(' '));
const fail=(reason:string):never=>{throw Error(`このSVGは${reason}ため読み込めません。静止したSVGとして、外部素材を埋め込んで書き出してください。`);};
function paint(value:string){
 if(value.length>100000||/[\\<>@\x00-\x08]/.test(value)||/\/\*/.test(value))fail('対応していないスタイルを含む');
 const clean=value.replace(/url\(\s*(['"]?)#[a-zA-Z0-9_.:-]+\1\s*\)/gi,'');
 if(/url\s*\(|(?:https?|file|data|javascript|vbscript):|expression\s*\(|image-set\s*\(/i.test(clean))fail('外部参照または動的なスタイルを含む');
}
function declarations(value:string){
 for(const part of value.split(';')){if(!part.trim())continue;const colon=part.indexOf(':');if(colon<1||!properties.has(part.slice(0,colon).trim().toLowerCase()))fail('対応していない装飾効果を含む');paint(part.slice(colon+1));}
}
function stylesheet(value:string){
 if(/[\\@]|\/\*/.test(value))fail('外部CSSまたは対応していないスタイルを含む');let rest=value;
 for(const match of value.matchAll(/([^{}]+)\{([^{}]*)\}/g)){if(!match[1].split(',').every(s=>/^\s*(?:[a-zA-Z][\w-]*)?(?:[.#][\w-]+)*\s*$/.test(s)&&s.trim()))fail('複雑なCSS選択条件を含む');declarations(match[2]);rest=rest.replace(match[0],'');}
 if(rest.trim())fail('正しくないCSSを含む');
}
function unit(value:string|null):number|null{if(!value||value.includes('%'))return null;const m=/^\s*(\d+(?:\.\d+)?)(px|pt|mm|cm|in)?\s*$/.exec(value);if(!m)return null;return Number(m[1])*({px:1,pt:96/72,mm:96/25.4,cm:96/2.54,in:96} as Record<string,number>)[m[2]??'px'];}
export function inspectSvg(source:string,budget:PixelBudget={pixels:0}):{width:number;height:number}{
 if(source.length>2*1024*1024)fail('2MBを超える');
 if(/<!\s*(?:DOCTYPE|ENTITY)|<\?\s*(?!xml\s)[\w-]+/i.test(source))fail('外部定義または処理命令を含む');
 if((source.match(/</g)?.length??0)>25000)fail('要素数が多すぎる');
 const root=(()=>{try{const root=new DOMParser({onError:onWarningStopParsing}).parseFromString(source,'image/svg+xml').documentElement;if(!root)return fail('図形がない');return root;}catch{return fail('XMLの構造が破損している');}})();
 if(root.localName!=='svg'||root.namespaceURI!==namespace)fail('SVG形式ではない');
 const viewBox=root.getAttribute('viewBox')?.trim().split(/[\s,]+/).map(Number);if(viewBox&&(viewBox.length!==4||viewBox.some(n=>!Number.isFinite(n))||viewBox[2]<=0||viewBox[3]<=0))fail('表示範囲が正しくない');
 const width=unit(root.getAttribute('width'))??viewBox?.[2]??300,height=unit(root.getAttribute('height'))??viewBox?.[3]??150;
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0||width>16384||height>16384||width*height>40_000_000)fail('画像サイズが大きすぎる');
 chargePixels(budget,width*height);
 const nodes:{node:Node;depth:number}[]=[{node:root,depth:0}];let count=0;
 while(nodes.length){const {node,depth}=nodes.pop()!;if(++count>10000||depth>64)fail('要素数または入れ子が多すぎる');
  if(node.nodeType===1){const element=node as Element;if(element.namespaceURI!==namespace||!tags.has(element.localName??''))fail('スクリプト・アニメーション・対応していない要素を含む');
   if(element.localName==='style')stylesheet(element.textContent??'');
   for(let i=0;i<element.attributes.length;i++){const a=element.attributes.item(i)!;const name=a.localName??a.name;
    if(a.name==='xmlns'||a.prefix==='xmlns')continue;
    if(/^on/i.test(name)||a.name==='xml:base')fail('イベント処理または外部基準URLを含む');
    if(name==='href'){if(/^#[a-zA-Z0-9_.:-]+$/.test(a.value))continue;const embedded=/^data:(image\/(?:png|jpeg|webp));base64,([a-zA-Z0-9+/]+={0,2})$/.exec(a.value);if(element.localName==='image'&&embedded){const raw=atob(embedded[2]),size=staticRasterInfo(Uint8Array.from(raw,c=>c.charCodeAt(0)),embedded[1]);chargePixels(budget,size.width*size.height);continue;}fail('外部画像または外部参照を含む');}
    if(name==='style'){declarations(a.value);continue;}
    if(properties.has(name)){paint(a.value);continue;}
    if(name==='lang'||name==='space')continue;
    if(!attributes.has(name))fail(`対応していない属性「${name.slice(0,40)}」を含む`);
   }
  }
  for(let child=node.lastChild;child;child=child.previousSibling)nodes.push({node:child,depth:depth+1});
 }
 return {width,height};
}
