/**
 * Downloads the keytar native binary for every platform the bundle targets.
 *
 * `npm install` builds or fetches keytar for the machine doing the install, so
 * a bundle packed on Linux carries a Linux binary and loads nothing anywhere
 * else — the extension then falls back to the file-based key store on exactly
 * the two platforms Claude Desktop runs on. The binaries collected here ship
 * alongside it, and src/utils/secure-storage.ts picks the matching one.
 *
 * The binaries come from keytar's own prebuild-install, so they are the same
 * artifacts npm would have fetched on each platform.
 *
 * Usage: node scripts/fetch-keytar-prebuilds.mjs
 */

import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const keytarDir = path.join(root, 'node_modules', 'keytar');
const prebuildInstall = path.join(root, 'node_modules', 'prebuild-install', 'bin.js');
const builtBinary = path.join(keytarDir, 'build', 'Release', 'keytar.node');
const vendorDir = path.join(root, 'vendor', 'keytar');

// Every platform/arch pair keytar 7.9.0 publishes. All are required: a missing
// one would ship a bundle that silently loses the OS vault there, which is the
// failure this script exists to prevent.
const targets = [
  ['darwin', 'x64'],
  ['darwin', 'arm64'],
  ['win32', 'x64'],
  ['win32', 'ia32'],
  ['linux', 'x64'],
  ['linux', 'arm64'],
];

if (!fs.existsSync(prebuildInstall)) {
  console.error('prebuild-install not found: run npm ci first');
  process.exit(1);
}

fs.rmSync(vendorDir, { recursive: true, force: true });

for (const [platform, arch] of targets) {
  fs.rmSync(builtBinary, { force: true });

  execFileSync(
    process.execPath,
    [prebuildInstall, '--runtime', 'napi', '--platform', platform, '--arch', arch, '--force'],
    { cwd: keytarDir, stdio: ['ignore', 'ignore', 'pipe'] }
  );

  if (!fs.existsSync(builtBinary)) {
    console.error(`no keytar prebuild for ${platform}-${arch}`);
    process.exit(1);
  }

  const target = path.join(vendorDir, `${platform}-${arch}`);
  fs.mkdirSync(target, { recursive: true });
  fs.copyFileSync(builtBinary, path.join(target, 'keytar.node'));
  console.log(`${platform}-${arch}: ${fs.statSync(builtBinary).size} bytes`);
}

// The loop left whichever platform came last in node_modules. Put this
// machine's own binary back, so a dev install keeps working afterwards.
fs.rmSync(builtBinary, { force: true });
execFileSync(process.execPath, [prebuildInstall, '--runtime', 'napi', '--force'], {
  cwd: keytarDir,
  stdio: ['ignore', 'ignore', 'pipe'],
});

console.log(`${targets.length} prebuilds in vendor/keytar`);
