/**
 * Keeps manifest.json in step with the code it describes.
 *
 * Two things drift silently and both are visible to the MCP Directory review:
 * the `tools` array (the directory lists what the manifest declares) and the
 * version, which appears in package.json, manifest.json and in the handshake
 * the server sends to the client.
 *
 * Usage:
 *   npx tsx scripts/sync-manifest.ts          rewrite manifest.json
 *   npx tsx scripts/sync-manifest.ts --check  fail if it is out of date (CI)
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { toolDefinitions } from '../src/mcp/tools.js';
import { SERVER_VERSION } from '../src/utils/constants.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(root, 'manifest.json');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf-8'));

const problems: string[] = [];
if (manifest.version !== pkg.version) {
  problems.push(`manifest.json version ${manifest.version} != package.json version ${pkg.version}`);
}
if (SERVER_VERSION !== pkg.version) {
  problems.push(`SERVER_VERSION ${SERVER_VERSION} in src/utils/constants.ts != package.json version ${pkg.version}`);
}
if (manifest.name !== pkg.name) {
  problems.push(`manifest.json name ${manifest.name} != package.json name ${pkg.name}`);
}

// The supported Node floor is written twice - engines for npm, compatibility
// for the MCP Directory - and nothing used to compare them, so they could
// drift apart and only the directory would notice.
const engineFloor = pkg.engines?.node;
const runtimeFloor = manifest.compatibility?.runtimes?.node;
if (engineFloor !== runtimeFloor) {
  problems.push(
    `manifest.json compatibility.runtimes.node ${runtimeFloor} != package.json engines.node ${engineFloor}`,
  );
}
if (typeof manifest.icon === 'string' && !manifest.icon.startsWith('https://')) {
  const iconPath = path.join(root, manifest.icon);
  if (manifest.icon.includes('\\') || manifest.icon.startsWith('./') || manifest.icon.startsWith('.\\')) {
    problems.push(`manifest.json icon "${manifest.icon}" must be a plain bundle-relative path`);
  } else if (!fs.existsSync(iconPath)) {
    problems.push(`manifest.json icon "${manifest.icon}" does not exist in the bundle`);
  }
}
if (!Array.isArray(manifest.privacy_policies) || manifest.privacy_policies.length === 0) {
  problems.push('manifest.json is missing privacy_policies (an MCP Directory rejection reason)');
}
if (!manifest.display_name) {
  problems.push('manifest.json is missing display_name');
}

// Ogni tool deve dichiarare title e una fra readOnlyHint e destructiveHint:
// è così che la directory classifica i tool letti da tools/list.
for (const tool of toolDefinitions) {
  if (!tool.title) problems.push(`tool ${tool.name} has no title`);
  if (!tool.annotations?.readOnlyHint && !tool.annotations?.destructiveHint) {
    problems.push(`tool ${tool.name} declares neither readOnlyHint nor destructiveHint`);
  }
}

const tools = toolDefinitions.map((tool) => ({
  name: tool.name,
  description: tool.description,
}));

const updated = { ...manifest, tools };
// `tools` sta subito dopo `server`, come negli esempi della specifica MCPB.
const ordered: Record<string, unknown> = {};
for (const key of Object.keys(manifest)) {
  ordered[key] = updated[key];
  if (key === 'server') ordered.tools = tools;
}
if (!('tools' in ordered)) ordered.tools = tools;

const serialised = JSON.stringify(ordered, null, 2) + '\n';
const current = fs.readFileSync(manifestPath, 'utf-8');

if (process.argv.includes('--check')) {
  if (serialised !== current) {
    problems.push('manifest.json tools are out of date: run `npm run sync:manifest`');
  }
  if (problems.length > 0) {
    console.error('manifest check failed:');
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }
  console.log(`manifest.json is up to date (${tools.length} tools)`);
} else {
  for (const problem of problems) console.warn(`warning: ${problem}`);
  fs.writeFileSync(manifestPath, serialised);
  console.log(`manifest.json updated with ${tools.length} tools`);
}
