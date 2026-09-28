import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const read=path=>readFileSync(resolve(root,path),'utf8');
const json=path=>JSON.parse(read(path));
const version=json('package.json').version,expectedMsix=`${version}.0`;
const lock=json('package-lock.json');
const checks=[
  ['package-lock.json',lock.version],
  ['package-lock.json packages[""]',lock.packages[''].version],
  ['src-tauri/tauri.conf.json',json('src-tauri/tauri.conf.json').version],
  ['src-tauri/Cargo.toml',/^\[package\][\s\S]*?^version = "([^"]+)"/m.exec(read('src-tauri/Cargo.toml'))?.[1]],
  ['src-tauri/Cargo.lock',/^name = "binsen-kobo"\r?\nversion = "([^"]+)"/m.exec(read('src-tauri/Cargo.lock'))?.[1]],
  ['src/app-version.ts',/APP_VERSION='([^']+)'/.exec(read('src/app-version.ts'))?.[1]],
];
const mismatches=checks.filter(([,actual])=>actual!==version);
if(!read('distribution/README.md').includes(`ベースversionは${version}、MSIXは${expectedMsix}`))mismatches.push(['distribution/README.md',`expected ${version} / ${expectedMsix}`]);
if(mismatches.length){for(const [file,actual] of mismatches)console.error(`${file}: ${actual??'missing'} (expected ${version})`);process.exit(1);}
console.log(`Version ${version}: all managed files are synchronized.`);
