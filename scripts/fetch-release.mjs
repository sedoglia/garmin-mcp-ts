/**
 * Mirrors the assets of a published release into releases/.
 *
 * The bundle is built by the Release workflow on GitHub, so nothing on a
 * developer machine changes when a release goes out. releases/ is the local
 * copy of what users actually download - the file handed to the MCP Directory,
 * or opened in Claude Desktop to try the shipped build - and this script is
 * what keeps it current: the last step of cutting a release.
 *
 * The assets come from the release itself, never from a local pack, so what
 * lands here is byte for byte what the release page serves. The .mcpb is then
 * checked against the .sha256 published beside it, the same check the README
 * asks users to run.
 *
 * Only published releases are considered: a draft is invisible to the
 * by-tag and latest endpoints until the workflow's publish step runs. Set
 * GH_TOKEN or GITHUB_TOKEN to lift the unauthenticated API rate limit.
 *
 * Usage:
 *   node scripts/fetch-release.mjs          the latest published release
 *   node scripts/fetch-release.mjs v4.6.0   a specific tag
 */

import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const releasesDir = path.join(root, 'releases');
const tag = process.argv[2];

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const repo = pkg.repository.url.match(/github\.com[/:]([^/]+\/[^/.]+)/)?.[1];

const headers = { Accept: 'application/vnd.github+json', 'User-Agent': pkg.name };
const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
if (token) headers.Authorization = `Bearer ${token}`;

// Errors are reported through the exit code rather than process.exit(): on
// Windows, exiting while a fetch connection is still being torn down trips an
// assertion inside libuv, and the message gets buried under it.
function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

async function lookUpRelease() {
  const endpoint = tag ? `releases/tags/${tag}` : 'releases/latest';
  const response = await fetch(`https://api.github.com/repos/${repo}/${endpoint}`, { headers });
  if (response.status === 404) {
    fail(
      tag
        ? `no published release for ${tag}: a draft does not count until the workflow publishes it`
        : `${repo} has no published release`
    );
    return null;
  }
  if (!response.ok) {
    fail(`${response.status} ${response.statusText} looking up ${endpoint}`);
    return null;
  }
  return response.json();
}

async function download(asset) {
  const target = path.join(releasesDir, asset.name);
  const response = await fetch(asset.browser_download_url, {
    headers: { ...headers, Accept: 'application/octet-stream' },
  });
  if (!response.ok) {
    fail(`${response.status} ${response.statusText} downloading ${asset.name}`);
    return false;
  }
  // Written beside the target and renamed over it, so an interrupted download
  // never leaves a truncated bundle under the real name.
  const partial = `${target}.part`;
  fs.writeFileSync(partial, Buffer.from(await response.arrayBuffer()));
  fs.renameSync(partial, target);
  console.log(`${asset.name}: ${asset.size} bytes`);
  return true;
}

// The .sha256 file is in sha256sum format: "<hex>  <filename>", one per line.
function verify(checksumFile) {
  for (const line of fs.readFileSync(path.join(releasesDir, checksumFile), 'utf8').split('\n')) {
    const match = line.match(/^([0-9a-f]{64})\s+\*?(.+)$/);
    if (!match) continue;
    const [, expected, name] = match;
    const file = path.join(releasesDir, name.trim());
    if (!fs.existsSync(file)) {
      fail(`${checksumFile} names ${name}, which the release does not carry`);
      return false;
    }
    const actual = createHash('sha256').update(fs.readFileSync(file)).digest('hex');
    if (actual !== expected) {
      fs.rmSync(file, { force: true });
      fail(`${name}: checksum mismatch, file removed`);
      return false;
    }
    console.log(`${name}: checksum OK`);
  }
  return true;
}

async function main() {
  if (!repo) {
    fail(`cannot read owner/repo from package.json repository.url: ${pkg.repository.url}`);
    return;
  }

  const release = await lookUpRelease();
  if (!release) return;
  if (release.assets.length === 0) {
    fail(`${release.tag_name} has no assets`);
    return;
  }

  fs.mkdirSync(releasesDir, { recursive: true });
  for (const asset of release.assets) {
    if (!(await download(asset))) return;
  }
  for (const asset of release.assets) {
    if (asset.name.endsWith('.sha256') && !verify(asset.name)) return;
  }

  // A mirror that disagrees with the working tree usually means the checkout
  // is behind the release, or the release has not gone out yet. Worth a line,
  // not a failure: fetching an older tag on purpose is a legitimate use.
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
  if (release.tag_name !== `v${manifest.version}`) {
    console.warn(`note: fetched ${release.tag_name}, the working tree declares ${manifest.version}`);
  }

  console.log(`releases/ mirrors ${release.tag_name} (${release.html_url})`);
}

await main();
