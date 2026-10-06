import {expect,test} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {createFromTemplate} from '../src/core/templates';
import {pageVisual} from '../src/core/model';
import {packProject,unpackProject} from '../src/core/archive';
import {PaperDecoration} from '../src/ui/PaperDecoration';

test.each(['nanohana','asagao','goldfish','momiji','moon','snow-garden','camellia','mimosa','tulip','seaside','lemon','autumn-leaf','woodland','snowflake','christmas','washi','ichimatsu','classic','dots'])('追加した%sの図案2〜5はそれぞれ独立した画像を表示する',series=>{
 for(const number of [2,3,4,5]){
  const html=renderToStaticMarkup(<PaperDecoration design={`${series}-v${number}`} width={210} height={297} writingMode="horizontal"/>);
  expect(html).toContain(`/template-motifs/${series}-v${number}.png`);expect(html).toContain(`/template-motifs/${series}-v${number}-companion.png`);
  expect(html).not.toContain(`/template-motifs/${series}.png`);
 }
});

test.each([
 ['nanohana',['nanohana-v5','nanohana-v1','nanohana-v2','nanohana-v3','nanohana-v4','nanohana-v5']],
 ['asagao',['asagao-v5','asagao-v1','asagao-v2','asagao-v3','asagao-v4','asagao-v5']],
 ['goldfish',['goldfish-v5','goldfish-v1','goldfish-v2','goldfish-v3','goldfish-v4','goldfish-v5']],
 ['momiji',['momiji-v5','momiji-v1','momiji-v2','momiji-v3','momiji-v4','momiji-v5']],
 ['moon',['moon-v5','moon-v1','moon-v2','moon-v3','moon-v4','moon-v5']],
 ['snow-garden',['snow-garden-v5','snow-garden-v1','snow-garden-v2','snow-garden-v3','snow-garden-v4','snow-garden-v5']],
 ['camellia',['camellia-v5','camellia-v1','camellia-v2','camellia-v3','camellia-v4','camellia-v5']],
 ['mimosa',['mimosa-v5','mimosa-v1','mimosa-v2','mimosa-v3','mimosa-v4','mimosa-v5']],
 ['tulip',['tulip-v5','tulip-v1','tulip-v2','tulip-v3','tulip-v4','tulip-v5']],
 ['seaside',['seaside-v5','seaside-v1','seaside-v2','seaside-v3','seaside-v4','seaside-v5']],
 ['lemon',['lemon-v5','lemon-v1','lemon-v2','lemon-v3','lemon-v4','lemon-v5']],
 ['autumn-leaf',['autumn-leaf-v5','autumn-leaf-v1','autumn-leaf-v2','autumn-leaf-v3','autumn-leaf-v4','autumn-leaf-v5']],
 ['woodland',['woodland-v5','woodland-v1','woodland-v2','woodland-v3','woodland-v4','woodland-v5']],
 ['snowflake',['snowflake-v5','snowflake-v1','snowflake-v2','snowflake-v3','snowflake-v4','snowflake-v5']],
 ['christmas',['christmas-v5','christmas-v1','christmas-v2','christmas-v3','christmas-v4','christmas-v5']],
 ['washi',['washi-v5','washi-v1','washi-v2','washi-v3','washi-v4','washi-v5']],
 ['ichimatsu',['ichimatsu-v5','ichimatsu-v1','ichimatsu-v2','ichimatsu-v3','ichimatsu-v4','ichimatsu-v5']],
 ['classic',['classic-v5','classic-v1','classic-v2','classic-v3','classic-v4','classic-v5']],
 ['dots',['dots-v5','dots-v1','dots-v2','dots-v3','dots-v4','dots-v5']],
] as const)('%sの5図案巡回を作成して保存後も続ける',(series,want)=>{
 const p=createFromTemplate(series,'vertical',{design:5,cycle:true}),loaded=unpackProject(packProject(p));
 expect([0,1,2,3,4,5].map(index=>pageVisual(loaded,index).design)).toEqual(want);
});
