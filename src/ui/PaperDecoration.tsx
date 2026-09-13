import type {WritingMode} from '../core/model';
import {decorationMotifLayout} from '../core/stationery-layout';
import {templates} from '../core/templates';
export {decorationMotifLayout} from '../core/stationery-layout';
export const generatedArt:Record<string,string>={
  ichimatsu:'ichimatsu',sakura:'sakura',nanohana:'nanohana',asagao:'asagao',goldfish:'goldfish',momiji:'momiji',
  'snow-garden':'snow-garden',camellia:'camellia',moon:'moon',mimosa:'mimosa',tulip:'tulip',
  seaside:'seaside',lemon:'lemon','autumn-leaf':'autumn-leaf',woodland:'woodland',snowflake:'snowflake',christmas:'christmas'
};
export function templateArtPath(_id:string,art:string|undefined){
  return art?`/template-motifs/${art}.png?v=20260914`:'';
}
// Original vector artwork. All coordinates are in millimetres; no external assets or fonts.
function Leaf({x,y,angle=0,color='#7c9a77',size=1}:{x:number;y:number;angle?:number;color?:string;size?:number}){
  return <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${size})`}><path d="M0 0 Q-3-8 0-14 Q4-8 0 0" fill={color}/><path d="M0-1V-12" stroke="#ffffff" strokeWidth=".3" opacity=".65"/></g>;
}
function Flower({x,y,color='#e8b6c4',size=1,petals=5,center='#d5b56b'}:{x:number;y:number;color?:string;size?:number;petals?:number;center?:string}){
  return <g transform={`translate(${x} ${y}) scale(${size})`}>{Array.from({length:petals},(_,i)=><path key={i} d="M0 0 C-5-2-5-8-1-9 L0-7 1-9 C5-8 5-2 0 0" fill={color} fillOpacity=".82" transform={`rotate(${i*360/petals})`}/>)}<circle r="1.5" fill={center}/>{Array.from({length:5},(_,i)=><path key={i} d="M0 0 0-3" stroke={center} strokeWidth=".3" transform={`rotate(${i*72})`}/>)}</g>;
}
function Maple({x,y,color='#b95e39',angle=0,size=1}:{x:number;y:number;color?:string;angle?:number;size?:number}){
  return <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${size})`}><path d="M0 7-7 3-5 1-11-6-5-5-6-12-1-7 0-16 3-8 8-13 7-5 13-6 8 1 10 3 2 7 1 12Z" fill={color}/><path d="M1 10 0-11M0 3-7-3M0 3 9-3" stroke="#eac995" strokeWidth=".5" fill="none"/></g>;
}
function Snowflake({x,y,size=1}:{x:number;y:number;size?:number}){return <g transform={`translate(${x} ${y}) scale(${size})`} stroke="#8aaeba" strokeWidth=".65" fill="none">{Array.from({length:6},(_,i)=><path key={i} d="M0 0V-10M0-5-3-8M0-5 3-8M0-8-2-10M0-8 2-10" transform={`rotate(${i*60})`}/>)}</g>;}
function Wreath({christmas=false}:{christmas?:boolean}){
  return <g><circle cx="22" cy="16" r="12" fill="none" stroke={christmas?'#6c895f':'#a9ae74'} strokeWidth=".7"/>{Array.from({length:12},(_,i)=>{
    const a=i*Math.PI/6,x=22+Math.cos(a)*12,y=16+Math.sin(a)*12;
    return <g key={i}><Leaf x={x} y={y} angle={i*30+70} size={.45} color={christmas?'#5e835f':'#8fa076'}/><circle cx={x-1} cy={y-1} r={christmas?1.1:1.5} fill={christmas?'#b64d4a':'#e2bf50'}/>{!christmas&&<circle cx={x+1.5} cy={y+1} r="1.25" fill="#e9ca64"/>}</g>;
  })}{christmas&&<g fill="#af444b"><path d="M22 27Q12 21 15 30L22 28Q32 22 29 31Z"/><path d="M21 28 19 35 23 32 25 35 24 28Z"/><circle cx="22" cy="28" r="1.5"/></g>}</g>;
}
function Motif({id,paper}:{id:string;paper:string}){
  switch(id){
    case 'sakura':return <><path d="M-4 25Q18 21 43 1M13 19 11 7M24 14 37 14" stroke="#9b8279" strokeWidth=".8" fill="none"/><Flower x={11} y={9} size={.64}/><Flower x={24} y={14} size={.8}/><Flower x={38} y={4} size={.5}/><Flower x={38} y={17} size={.55}/><path d="M5 27Q8 20 10 26Q8 30 5 27M47 23Q43 28 48 28Q51 25 47 23" fill="#e9b9c9"/></>;
    case 'nanohana':return <><path d="M8 31 12 9M21 32 23 3M34 31 32 15" fill="none" stroke="#81985c" strokeWidth=".65"/><Leaf x={9} y={27} angle={-50} size={.6}/><Leaf x={24} y={25} angle={55} size={.5}/>{[[12,7],[7,12],[16,13],[23,4],[28,8],[20,10],[33,15],[28,20],[36,22]].map(([x,y],i)=><Flower key={i} x={x} y={y} size={.25} petals={4} color="#e7c655" center="#b2a15c"/>)}<path d="M42 5Q33-1 37 8L42 10Q48-1 48 7Q48 12 42 10Q37 16 38 10" fill="#e5cf86"/><path d="M42 6 42 13" stroke="#967d53" strokeWidth=".5"/></>;
    case 'asagao':return <><path d="M-2 27Q16 30 20 5Q27-1 31 7" fill="none" stroke="#839a76" strokeWidth=".8"/><Leaf x={13} y={24} angle={-60} size={.65}/><Leaf x={18} y={15} angle={50} size={.5}/><Flower x={12} y={11} size={1} color="#859acb" center="#f6f4db"/><Flower x={23} y={23} size={.55} color="#b8a1cf" center="#f6f4db"/><path d="M39 1V7M34 16Q33 6 39 6Q45 6 44 16ZM39 16V24" stroke="#88abb3" strokeWidth=".7" fill="#dcecef"/><path d="M38 22 42 23 41 32 37 30Z" fill="#a8bfd0"/></>;
    case 'goldfish':return <><ellipse cx="24" cy="17" rx="24" ry="10" fill="none" stroke="#a5c9ce" strokeWidth=".65"/><ellipse cx="24" cy="17" rx="18" ry="6" fill="none" stroke="#c3dade" strokeWidth=".5"/><g transform="translate(19 15) rotate(-18)"><path d="M8 0Q1-7-6 0Q1 7 8 0M-4 0Q-13-7-11 0Q-13 7-4 0" fill="#cf6d60"/><path d="M1-3-4-6-1 0" fill="#df9281"/><circle cx="5" cy="-1" r=".6" fill="#594843"/></g><g transform="translate(39 23) rotate(145) scale(.55)"><path d="M8 0Q1-7-6 0Q1 7 8 0M-4 0-12-5-10 1-12 5Z" fill="#c96358"/><circle cx="5" cy="-1" r=".6" fill="#594843"/></g></>;
    case 'momiji':return <><Maple x={16} y={17} color="#c47948" angle={-23} size={.75}/><Maple x={35} y={9} color="#b95743" angle={20} size={.62}/><Maple x={43} y={26} color="#d1a15b" angle={75} size={.38}/></>;
    case 'moon':return <><circle cx="13" cy="12" r="10" fill="#dfd7ac"/><circle cx="17" cy="9" r="8.5" fill={paper}/><g stroke="#a69c74" strokeWidth=".55" fill="none"><path d="M27 33Q25 20 29 6M30 33Q32 16 40 4M32 34Q40 21 46 16M26 33 20 17"/>{Array.from({length:6},(_,i)=><path key={i} d={`M${29-i*.25} ${7+i*1.5}l-3-2m3 2 3-2M${39-i*.65} ${5+i*1.5}l-3-2m3 2 3-2`}/>)}</g></>;
    case 'snow-garden':return <><path d="M-3 28Q20 18 45 3M13 21 9 7M28 12 39 18" stroke="#8a9290" strokeWidth=".8" fill="none"/>{[[8,8],[13,19],[24,14],[33,8],[40,18]].map(([x,y],i)=><g key={i}><ellipse cx={x} cy={y} rx="4" ry="1.7" fill="#cbd4d3"/><ellipse cx={x} cy={y-1} rx="4" ry="1.7" fill="#ffffff"/></g>)}{[[5,3],[21,5],[44,26],[29,27]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="1.2" fill="#d0dbe0"/>)}</>;
    case 'camellia':return <><Leaf x={21} y={24} angle={-55} color="#6c886e" size={1.25}/><Leaf x={24} y={20} angle={65} color="#88a080" size={1.15}/><Leaf x={39} y={25} angle={10} color="#759171" size={.8}/><Flower x={19} y={14} color="#bc5e67" size={1.12} petals={7} center="#e0bf69"/><Flower x={36} y={25} color="#d07b82" size={.55} petals={7} center="#e0bf69"/></>;
    case 'mimosa':return <Wreath/>;
    case 'tulip':return <><path d="M10 32V10M24 34V8M38 32V15" stroke="#8ea183" strokeWidth=".7" fill="none"/><Leaf x={9} y={31} angle={-25} size={1.1}/><Leaf x={25} y={33} angle={28} size={1.25}/><Leaf x={38} y={32} angle={40} size={.9}/>{[[10,9,'#d3a0b2'],[24,6,'#c47686'],[38,14,'#e4bac4']].map(([x,y,c],i)=><g key={i} transform={`translate(${x} ${y})`}><path d="M-5-7-1-3 1-8 3-3 6-6Q8 5 0 6Q-8 5-5-7" fill={String(c)} fillOpacity=".8"/><path d="M0-4Q3 0 0 5" stroke="#fff9f7" strokeWidth=".55" fill="none"/></g>)}</>;
    case 'seaside':return <><g stroke="#a2c5d0" strokeWidth=".65" fill="none"><path d="M-3 7Q5 2 14 7T31 7T48 7M-3 12Q5 7 14 12T31 12T48 12M-3 17Q5 12 14 17T31 17"/></g><g transform="translate(34 23)"><path d="M0 7-8-2Q-9-10-4-7Q-1-13 2-8Q8-12 8-5Q13-5 8 1L2 7Z" fill="#e0d4c1" stroke="#bfbaa8" strokeWidth=".4"/><path d="M1 6-5-6M1 6 1-8M1 6 7-5" stroke="#b9ad9b" strokeWidth=".4"/></g></>;
    case 'lemon':return <><Leaf x={25} y={14} angle={50} color="#91a276" size={1.15}/><Leaf x={22} y={19} angle={-65} color="#7f986a" size={.9}/><path d="M4 15Q8 4 20 9L23 9 24 12Q33 24 22 28Q10 33 5 20L3 18Z" fill="#e3c967"/><path d="M8 14Q11 10 18 12" stroke="#f4e5a5" strokeWidth="1.8" strokeLinecap="round"/><circle cx="39" cy="23" r="8" fill="#ead583" stroke="#d4bd62" strokeWidth=".8"/><circle cx="39" cy="23" r="6.5" fill="none" stroke="#fff6cc" strokeWidth=".7"/>{Array.from({length:7},(_,i)=><path key={i} d="M39 23 39 16.5" stroke="#fff6cc" strokeWidth=".6" transform={`rotate(${i*360/7} 39 23)`}/>)}</>;
    case 'autumn-leaf':return <><path d="M0 30Q27 23 45 3" stroke="#ac9370" strokeWidth=".6" fill="none"/>{[[8,25,-50,'#be9272'],[15,23,10,'#d0b583'],[23,18,-42,'#b08b65'],[29,14,28,'#bda47d'],[37,8,-30,'#d1b294']].map(([x,y,a,c],i)=><Leaf key={i} x={Number(x)} y={Number(y)} angle={Number(a)} color={String(c)} size={.8}/>)}</>;
    case 'woodland':return <><Leaf x={14} y={29} angle={-30} color="#a6a273" size={1.1}/><g transform="translate(16 15) rotate(-20)"><path d="M-5 0Q-5 12 0 14Q6 9 5 0" fill="#b48a5e"/><path d="M-6 1Q-5-5 0-5Q6-5 6 1Z" fill="#8e7355"/><path d="M0-5 1-8" stroke="#8e7355" strokeWidth=".8"/></g><g transform="translate(33 17)"><path d="M-2 0-3 12Q0 14 3 12L2 0" fill="#dcccae"/><path d="M-10 1Q-6-12 1-10Q9-9 11 1Z" fill="#b87962"/>{[[-4,-3],[2,-6],[6,-2]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="1.1" fill="#f2e4d0"/>)}</g></>;
    case 'snowflake':return <><Snowflake x={13} y={14} size={1.05}/><Snowflake x={36} y={9} size={.65}/><Snowflake x={36} y={28} size={.35}/><circle cx="26" cy="24" r="1" fill="#bfd4df"/><circle cx="46" cy="18" r=".7" fill="#bfd4df"/></>;
    case 'christmas':return <Wreath christmas/>;
    default:return null;
  }
}
export function PaperDecoration({design,width,height,writingMode}:{design:string;width:number;height:number;writingMode:WritingMode}){
  const id=design.replace(/-(first|continuation)$/,''),continuation=design.endsWith('-continuation'),template=templates.find(t=>t.id===id);
  if(!template||id==='blank')return null;
  const vertical=writingMode==='vertical';
  const art=generatedArt[id];
  const artPath=templateArtPath(id,art);
  const layout=decorationMotifLayout(id,width,height,writingMode,continuation);
  return <svg className="paper-decoration" width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
    {artPath&&layout.placements.map((placement,index)=><image key={index} href={artPath} x={placement.x} y={placement.y} width={placement.width} height={placement.height} opacity={placement.opacity} preserveAspectRatio="xMidYMid meet" transform={placement.rotation?`rotate(${placement.rotation} ${placement.x+placement.width/2} ${placement.y+placement.height/2})`:undefined}/>)}
    {id==='washi'&&<g stroke="#c4c0ab" strokeWidth=".12" opacity=".22">{Array.from({length:50},(_,i)=>{const x=(i*43.27)%width,y=(i*61.7)%height;return <path key={i} d={`M${x} ${y}l${2+i%3} ${.7-i%2}`}/>;})}</g>}
    {id==='ichimatsu'&&!art&&<g fill="#597e9c" opacity={continuation?.14:.22}>{Array.from({length:Math.floor(width/5)-2},(_,i)=><g key={i}><rect x={5+i*5} y={i%2?5:10} width="5" height="5"/><rect x={5+i*5} y={height-(i%2?10:15)} width="5" height="5"/></g>)}</g>}
    {id==='classic'&&<g fill="none" stroke="#b3a98e" strokeWidth=".3" opacity={continuation?.48:.75}><rect x="8" y="8" width={width-16} height={height-16}/>{[[8,8,0],[width-8,8,90],[width-8,height-8,180],[8,height-8,270]].map(([x,y,a],i)=><path key={i} transform={`translate(${x} ${y}) rotate(${a})`} d="M2 14V2H14M4 8Q8 8 8 4M4 4Q4 11 11 11Q11 4 4 4"/>)}</g>}
    {id==='dots'&&<g opacity={continuation?.35:.6}>{Array.from({length:Math.floor(width/14)},(_,i)=><g key={i} fill={['#d1b6c1','#b3cbd0','#d9cfaa','#c4bdd8'][i%4]}><circle cx={8+i*14} cy={6+i%3*2} r={1.2+i%2*.5}/><circle cx={14+i*14} cy={height-7-i%3} r="1.5"/></g>)}</g>}
    {!artPath&&!['washi','ichimatsu','classic','dots'].includes(id)&&<g opacity={continuation?.5:.82}>
      {!continuation&&<g transform={`translate(${vertical?6:width-38} 3) scale(.62)`}><Motif id={id} paper={template.paper}/></g>}
      <g transform={`translate(${vertical?width-40:8} ${height-25}) scale(${continuation?.46:.58})`}><Motif id={id} paper={template.paper}/></g>
      {!continuation&&<g transform={`translate(${vertical?7:width-27} ${height*.55}) scale(.31)`}><Motif id={id} paper={template.paper}/></g>}
    </g>}
  </svg>;
}
