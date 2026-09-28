import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [tool = 'tauri', ...args] = process.argv.slice(2);
if (!['tauri', 'cargo'].includes(tool)) throw new Error('Unknown native tool');
const command = tool === 'cargo' ? 'cargo' : process.execPath;
const cli = path.join(root, 'node_modules/@tauri-apps/cli/tauri.js');
const cargoArgs=[args[0], '--manifest-path', path.join(root, 'src-tauri/Cargo.toml'), ...args.slice(1)];
const result = spawnSync(command, tool === 'cargo' ? cargoArgs : [cli, ...args], {
  cwd: root, stdio: 'inherit', env: { ...process.env, CARGO_TARGET_DIR: path.join(root, '.local/cargo-target') },
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
