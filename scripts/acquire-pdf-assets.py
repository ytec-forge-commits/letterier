from pathlib import Path
import subprocess,tarfile,io,shutil,hashlib,json
root=Path('public/pdf-assets');src=Path('node_modules/pdfjs-dist')
for folder in ['cmaps','wasm','standard_fonts']:
 dest=root/folder;dest.mkdir(parents=True,exist_ok=True)
 for file in (src/folder).iterdir():
  if not file.is_file() or file.name.startswith('quickjs') or file.name.startswith('Liberation') or file.name=='LICENSE_LIBERATION':continue
  shutil.copy2(file,dest/file.name)
url='https://github.com/liberationfonts/liberation-fonts/files/7261482/liberation-fonts-ttf-2.1.5.tar.gz'
data=subprocess.check_output(['curl.exe','--fail','--silent','--show-error','--location','--max-time','60',url]);archive=tarfile.open(fileobj=io.BytesIO(data))
for file in archive.getmembers():
 name=Path(file.name).name
 if name in ['LiberationSans-Regular.ttf','LiberationSans-Bold.ttf','LiberationSans-Italic.ttf','LiberationSans-BoldItalic.ttf','LICENSE']:
  raw=archive.extractfile(file).read()
  if name=='LICENSE':assert b'SIL OPEN FONT LICENSE' in raw;name='LICENSE_LIBERATION_OFL'
  (root/'standard_fonts'/name).write_bytes(raw)
(root/'manifest.json').write_text(json.dumps({'pdfjs':'6.3.289','liberationSource':url,'liberationArchiveSha256':hashlib.sha256(data).hexdigest(),'files':[{'path':str(p.relative_to(root)).replace('\\','/'),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in root.rglob('*') if p.is_file() and p.name!='manifest.json']},indent=2),encoding='utf8')
print('PDF assets copied, Liberation 2.1.5 OFL replacement verified')
