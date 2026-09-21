/**
 * Writes the project's Software Bill of Materials, sbom.cdx.json, in CycloneDX
 * format, and checks that the committed one is still current.
 *
 * The SBOM lists what the .mcpb bundle actually ships: the production and
 * optional dependencies, resolved from package-lock.json. Dev dependencies are
 * left out for the same reason scripts/pack.mjs leaves them out of the bundle
 * - no user ever loads them. Reading the lockfile rather than node_modules
 * keeps the result independent of which platform-specific packages happen to
 * be installed on the machine that runs this, and the reproducible flag drops
 * the serial number and timestamp, so two runs against the same lockfile
 * produce the same bytes and the file only changes when a dependency does.
 *
 * The one thing that still varies between machines is metadata.tools, which
 * records the npm version the generator ran under. --check ignores it, so CI
 * on a different npm does not report drift that is not there.
 *
 * Usage:
 *   node scripts/sbom.mjs          rewrite sbom.cdx.json
 *   node scripts/sbom.mjs --check  fail if it is out of date (CI)
 */

import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sbomPath = path.join(root, 'sbom.cdx.json');
const cli = path.join(root, 'node_modules', '@cyclonedx', 'cyclonedx-npm', 'bin', 'cyclonedx-npm-cli.js');
const check = process.argv.includes('--check');

function generate(outputFile) {
  execFileSync(
    process.execPath,
    [
      cli,
      '--package-lock-only',
      '--omit', 'dev',
      '--output-reproducible',
      '--validate',
      '--spec-version', '1.6',
      '--output-format', 'JSON',
      '--output-file', outputFile,
    ],
    { cwd: root, stdio: ['ignore', 'ignore', 'inherit'] },
  );
}

// Everything but the generator's own record of itself.
function comparable(file) {
  const bom = JSON.parse(fs.readFileSync(file, 'utf8'));
  delete bom.metadata?.tools;
  return JSON.stringify(bom);
}

if (!check) {
  generate(sbomPath);
  console.log(`wrote ${path.relative(root, sbomPath)}`);
  process.exit(0);
}

if (!fs.existsSync(sbomPath)) {
  console.error('sbom.cdx.json is missing. Run: npm run sbom');
  process.exit(1);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'garmin-mcp-sbom-'));
try {
  const fresh = path.join(tmp, 'sbom.cdx.json');
  generate(fresh);
  if (comparable(fresh) !== comparable(sbomPath)) {
    console.error('sbom.cdx.json is out of date with package-lock.json. Run: npm run sbom');
    process.exit(1);
  }
  console.log('sbom.cdx.json is up to date');
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
