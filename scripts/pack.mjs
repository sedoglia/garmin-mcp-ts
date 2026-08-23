/**
 * Packs the .mcpb bundle from a staging copy carrying production dependencies
 * only.
 *
 * mcpb pack archives node_modules exactly as it finds it on disk. The release
 * workflow installs with `npm ci --omit=dev` before packing, so what it
 * publishes holds runtime packages and nothing else. A developer's tree also
 * holds typescript, tsx, esbuild and the packer itself, which is why packing
 * by hand produced a 20+ MB bundle against the workflow's 6.5 MB - the
 * difference being build tooling no user ever loads.
 *
 * Pruning the developer's own node_modules to match would cost them the dev
 * dependencies on every pack, so the packages that belong in the bundle are
 * copied into a throwaway directory instead and mcpb runs against that.
 * `npm ls --omit=dev` reads the installed tree, which npm resolved from the
 * same lockfile the workflow installs from, so the two agree package for
 * package.
 *
 * Usage: node scripts/pack.mjs [output.mcpb]
 */

import { execFileSync, execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.resolve(root, process.argv[2] ?? 'garmin-mcp-ts.mcpb');

// Kept out of the staging copy rather than left to .mcpbignore. A bundle from
// an earlier run would otherwise be packed into the next one, and .env and
// .claude carry credentials that have no reason to be copied anywhere at all.
const skippedEntries = new Set(['.git', 'node_modules', '.claude', '.github', 'releases']);

const skipEntry = (name) =>
  skippedEntries.has(name) ||
  name.startsWith('.env') ||
  name.endsWith('.mcpb') ||
  name.endsWith('.mcpb.sha256');

function npm(args) {
  // npm_execpath is npm's own CLI script and is set whenever this runs from an
  // npm script.
  const cli = process.env.npm_execpath;
  if (cli && cli.endsWith('.js')) {
    return execFileSync(process.execPath, [cli, ...args], { cwd: root, encoding: 'utf8' });
  }
  // Off that path npm has to be found on PATH, which on Windows means npm.cmd
  // and so a shell. The arguments are fixed strings, so building the command
  // line by hand is safe here and keeps execFileSync's shell deprecation out.
  return execSync(['npm', ...args].join(' '), { cwd: root, encoding: 'utf8' });
}

// The top-level directories a production install would leave in node_modules.
// Nested copies (a/node_modules/b, which npm lists separately) travel with the
// parent directory, so listing them here would only copy them twice.
function productionPackages() {
  const listed = npm(['ls', '--omit=dev', '--all', '--parseable']);
  const packages = new Set();

  for (const line of listed.split(/\r?\n/)) {
    if (!line.startsWith(root + path.sep)) continue;
    const rel = path.relative(root, line).split(path.sep).join('/');
    if (/^node_modules\/(@[^/]+\/)?[^/]+$/.test(rel)) packages.add(rel);
  }

  return [...packages].sort();
}

const packages = productionPackages();

// npm records a failed optional install and carries on, so without this a tree
// missing keytar packs quietly and ships an extension that reaches no OS vault.
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const missing = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.optionalDependencies ?? {}),
].filter((name) => !packages.includes(`node_modules/${name}`));

if (missing.length > 0) {
  console.error(`missing from node_modules: ${missing.join(', ')} - run npm ci`);
  process.exit(1);
}

// Read from its own package.json rather than assumed: the packer is a dev
// dependency and its entry point is free to move between versions.
const packerDir = path.join(root, 'node_modules', '@anthropic-ai', 'mcpb');
if (!fs.existsSync(path.join(packerDir, 'package.json'))) {
  console.error('@anthropic-ai/mcpb not installed: run npm ci');
  process.exit(1);
}
const { bin } = JSON.parse(fs.readFileSync(path.join(packerDir, 'package.json'), 'utf8'));
const packer = path.join(packerDir, typeof bin === 'string' ? bin : bin.mcpb);

const stage = fs.mkdtempSync(path.join(os.tmpdir(), 'garmin-mcp-ts-pack-'));

try {
  for (const entry of fs.readdirSync(root)) {
    if (skipEntry(entry)) continue;
    fs.cpSync(path.join(root, entry), path.join(stage, entry), { recursive: true });
  }

  for (const name of packages) {
    fs.cpSync(path.join(root, name), path.join(stage, name), { recursive: true });
  }

  // keytar's build/ holds the binary npm compiled for this machine, which loads
  // on no other; vendor/keytar carries one per platform instead. .mcpbignore
  // drops it as well, and this keeps it out of the staging copy too.
  fs.rmSync(path.join(stage, 'node_modules', 'keytar', 'build'), { recursive: true, force: true });

  execFileSync(process.execPath, [packer, 'pack', stage, output], { stdio: 'inherit' });
} finally {
  fs.rmSync(stage, { recursive: true, force: true });
}

// The same pair of files a release publishes, in sha256sum's own format so the
// checksum can be verified with it.
const bundle = fs.readFileSync(output);
const digest = createHash('sha256').update(bundle).digest('hex');
fs.writeFileSync(`${output}.sha256`, `${digest}  ${path.basename(output)}\n`);

console.log(
  `${path.relative(root, output)}: ${(bundle.length / 1024 / 1024).toFixed(1)} MB, ` +
    `${packages.length} production packages`
);
