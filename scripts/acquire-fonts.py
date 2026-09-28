from pathlib import Path
import subprocess, urllib.parse, json, concurrent.futures, re, hashlib
root=Path('public/fonts');root.mkdir(parents=True,exist_ok=True)
names=['Klee One','Yomogi','Yuji Syuku','Yuji Mai','Yuji Boku','Zen Kurenaido','Yusei Magic','Mochiy Pop One','Hachi Maru Pop','Potta One','Caveat','Dancing Script','Patrick Hand','Kalam','Indie Flower','Shadows Into Light','Architects Daughter','Nothing You Could Do','Reenie Beanie','Kaushan Script']
def get(url):
 return subprocess.check_output(['curl.exe','--fail','--silent','--show-error','--location','--max-time','60','--user-agent','Letarie-font-bundle-build',url])
sha='5e35378e6bda803962ee6fd257e444a7d459660d'
def download(item):
 i,name=item;slug=name.lower().replace(' ','');url=f'https://raw.githubusercontent.com/google/fonts/{sha}/ofl/{slug}/';folder=root/slug;folder.mkdir(exist_ok=True)
 meta=get(url+'METADATA.pb').decode();lic=get(url+'OFL.txt').decode();assert 'SIL OPEN FONT LICENSE' in lic.upper() and '1.1' in lic
 (folder/'OFL.txt').write_text(lic,encoding='utf-8');(folder/'METADATA.pb').write_text(meta,encoding='utf-8')
 files=[]
 for block in re.findall(r'fonts \{(.*?)\n\}',meta,re.S):
  file=re.search(r'filename: "([^"]+)"',block)
  if not file or 'style: "normal"' not in block:continue
  filename=file[1];data=get(url+urllib.parse.quote(filename));(folder/filename).write_bytes(data)
  weight=int(re.search(r'weight: (\d+)',block)[1]);files.append({'file':filename,'weight':weight,'variable':'[' in filename,'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data)})
 assert files
 return {'name':name,'slug':slug,'language':'日本語' if i<10 else 'English','source':f'https://github.com/google/fonts/tree/{sha}/ofl/{slug}','license':'OFL-1.1','copyright':lic.split('SIL OPEN FONT LICENSE')[0].strip(),'files':files}
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:fonts=list(pool.map(download,enumerate(names)))
manifest={'repository':'https://github.com/google/fonts','commit':sha,'retrieved':'2026-09-06','fonts':fonts}
(root/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
Path('src/core/bundled-fonts.ts').write_text('export const bundledFonts = '+json.dumps(fonts,ensure_ascii=False,indent=2)+' as const;\nexport const bundledFamily=(name:string)=>bundledFonts.some(f=>f.name===name)?`Letarie Bundled ${name}`:name;\n',encoding='utf-8')
css=[]
for font in fonts:
 for file in font['files']:
  weight='400 700' if file['variable'] else str(file['weight'])
  css.append('@font-face{font-family:"Letarie Bundled '+font['name']+'";src:url("/fonts/'+font['slug']+'/'+urllib.parse.quote(file['file'])+'");font-style:normal;font-weight:'+weight+';font-display:block;}')
Path('public/fonts/bundled.css').write_text('\n'.join(css),encoding='utf-8')
print(json.dumps({'commit':sha,'families':len(fonts),'files':sum(len(f['files']) for f in fonts),'MB':round(sum(x['bytes'] for f in fonts for x in f['files'])/1024**2,2)},ensure_ascii=False))
