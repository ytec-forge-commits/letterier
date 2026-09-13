"""Collect pinned installed dependency notices; run after npm ci and cargo fetch.
Writes only public/legal and the root inventory. Network reads are pinned upstream license files.
"""
import json, re, subprocess, zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public/legal'
OUT.mkdir(parents=True, exist_ok=True)
meta = json.loads(subprocess.check_output(['cargo', 'metadata', '--format-version', '1', '--filter-platform', 'x86_64-pc-windows-msvc', '--offline'], cwd=ROOT/'src-tauri'))
nodes = {n['id']: n for n in meta['resolve']['nodes']}
seen, pending = set(), [meta['resolve']['root']]
while pending:
    pid = pending.pop()
    if pid in seen: continue
    seen.add(pid)
    pending.extend(d['pkg'] for d in nodes[pid]['deps'] if any(k['kind'] is None for k in d['dep_kinds']))
packages = sorted((p for p in meta['packages'] if p['id'] in seen and p['source']), key=lambda p:(p['name'],p['version']))
blocks, rows, source_rows = [], [], []

def notices(folder):
    return sorted(p for p in folder.iterdir() if p.is_file() and re.match(r'^(licen[cs]e|notice|copying|copyright|unlicense)',p.name,re.I))

def upstream_notices(p, folder):
    vcs=json.loads((folder/'.cargo_vcs_info.json').read_text())
    repo=p['repository'].removesuffix('.git').replace('https://github.com/','')
    commit=vcs['git']['sha1']
    base=f'https://raw.githubusercontent.com/{repo}/{commit}/'
    result=[]
    for name in ['LICENSE','LICENSE-MIT','LICENSE-APACHE','LICENSE-MPL','LICENSE.txt']:
        response=subprocess.run(['curl.exe','--silent','--show-error','--location','--max-time','30','--write-out','\n%{http_code}',base+name],capture_output=True,check=True)
        content,status=response.stdout.decode('utf-8').rsplit('\n',1)
        if status=='404': continue
        if status!='200': raise RuntimeError('License HTTP '+status+': '+base+name)
        result.append((base+name,content))
    return result

with zipfile.ZipFile(OUT/'MPL-Corresponding-Source.zip','w',zipfile.ZIP_DEFLATED) as archive:
    for p in packages:
        folder=Path(p['manifest_path']).parent
        found=[(f.name,f.read_text(encoding='utf-8',errors='strict')) for f in notices(folder)]
        if not found: found=upstream_notices(p,folder)
        if not found and p['name']=='selectors' and p['license']=='MPL-2.0':
            mpl=next(x for x in packages if x['name']=='cssparser')
            standard=Path(mpl['manifest_path']).parent/'LICENSE'
            found=[('MPL-2.0 full text (same license; original selectors source notices preserved in source ZIP)',standard.read_text(encoding='utf-8'))]
        if not found: raise RuntimeError('No license texts: '+p['name'])
        heading=f"{p['name']} {p['version']} | {p['license']} | {p['repository']}"
        blocks.append('\n\n'+'='*78+'\n'+heading+'\n'+'\n'.join(f'--- {n} ---\n{t}' for n,t in found))
        rows.append({'ecosystem':'Cargo','name':p['name'],'version':p['version'],'license':p['license'],'source':p['repository']})
        if 'MPL-2.0' in p['license']:
            prefix=f"{p['name']}-{p['version']}"
            for f in sorted(folder.rglob('*')):
                if f.is_file(): archive.writestr(zipfile.ZipInfo(prefix+'/'+f.relative_to(folder).as_posix(),(2026,9,6,0,0,0)),f.read_bytes(),compress_type=zipfile.ZIP_DEFLATED)
            for n,t in found:
                if n.startswith('https:'): archive.writestr(prefix+'/UPSTREAM-'+n.rsplit('/',1)[1],t)
            source_rows.append(prefix)

for name in ['@tauri-apps/api','@xmldom/xmldom','ag-psd','base64-js','pako','fflate','pdfjs-dist','react','react-dom','scheduler']:
    folder=ROOT/'node_modules'/name
    p=json.loads((folder/'package.json').read_text())
    found=notices(folder)
    if not found: raise RuntimeError('No npm license: '+name)
    blocks.append('\n\n'+'='*78+f"\n{name} {p['version']} | {p['license']}\n"+'\n'.join(f'--- {f.name} ---\n'+f.read_text(encoding='utf-8') for f in found))
    rows.append({'ecosystem':'npm','name':name,'version':p['version'],'license':p['license'],'source':f'https://www.npmjs.com/package/{name}/v/{p["version"]}'})

for f in sorted((ROOT/'public/pdf-assets').rglob('LICENSE*'))+sorted((ROOT/'public/fonts').rglob('OFL.txt')):
    blocks.append('\n\n'+'='*78+'\n'+f.relative_to(ROOT).as_posix()+'\n'+f.read_text(encoding='utf-8'))
(OUT/'THIRD_PARTY_NOTICES.txt').write_text('Third-party notices for レタリエ\nOriginal licenses apply to their respective components.\n'+''.join(blocks),encoding='utf-8')
(OUT/'inventory.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(OUT/'MPL-SOURCE-NOTICE.txt').write_text('MPL-2.0 covered libraries are unmodified. Their exact corresponding source, including existing notices, is provided in MPL-Corresponding-Source.zip alongside this notice.\nYou may use, modify and distribute those files under MPL-2.0. The larger application is licensed separately under Apache-2.0.\n\n'+ '\n'.join(source_rows)+'\n',encoding='utf-8')
header='# 第三者コンポーネント\n\n`public/legal/THIRD_PARTY_NOTICES.txt`に著作権とライセンス全文を収録。アプリ内の「画面設定・使い方」から閲覧できます。MPL対象の未改変対応ソースは同ディレクトリのZIPに同梱します。\n\nCargoはWindows用の通常依存の推移的閉包を保守的に収録し、ビルド時だけに消えるproc-macro等を含む場合があります。npmはブラウザーに取り込む実行時モジュール。開発ツール、OS、WebView2ランタイム、Node専用のoptional canvasバイナリはアプリ本体に同梱しません。フォント・PDF静的資源は各manifestとASSETS_LICENSE.md、IMAGE-FORMATS.mdを参照。\n\n依存更新後は `python scripts/collect-licenses.py` で再生成して差分を確認してください。\n\n|系統|名前|版|元のライセンス|取得元|\n|---|---|---|---|---|\n'
(ROOT/'THIRD_PARTY_NOTICES.md').write_text(header+''.join(f"|{r['ecosystem']}|{r['name']}|{r['version']}|{r['license']}|{r['source']}|\n" for r in rows),encoding='utf-8')
print(json.dumps({'components':len(rows),'mpl_sources':source_rows,'notice_bytes':(OUT/'THIRD_PARTY_NOTICES.txt').stat().st_size}))
