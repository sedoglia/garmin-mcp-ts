// src/utils/credentials.ts
/**
 * Credential resolution for the Garmin MCP Server.
 *
 * Credentials can reach the server from four places. They are resolved in this
 * order, and the first hit wins:
 *
 * 1. Environment variables (GARMIN_EMAIL / GARMIN_PASSWORD). These are what
 *    Claude Desktop injects from the `user_config` block in manifest.json, so
 *    they represent what the user last typed in the extension settings and
 *    therefore outrank the encrypted copy on disk.
 * 2. Encrypted secure storage (written by `setup_credentials` or by
 *    `npm run setup-encryption`).
 * 3. .env file in the project root (legacy).
 * 4. config.json in the project root (legacy).
 *
 * When the environment wins and disagrees with the encrypted copy, the copy is
 * refreshed and the stored OAuth tokens are dropped: those tokens belong to the
 * previous email/password pair and would otherwise keep a stale session alive.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { secureStorage, GarminCredentials } from './secure-storage.js';
import logger from './logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// dist/utils/credentials.js -> project root
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

export type CredentialSource = 'env' | 'secure-storage' | 'dotenv' | 'config-json';

export interface ResolvedCredentials extends GarminCredentials {
  source: CredentialSource;
}

/** Human-readable label for each source, used in tool output and logs. */
export const SOURCE_LABELS: Record<CredentialSource, string> = {
  env: 'extension settings / environment variables',
  'secure-storage': 'encrypted secure storage',
  dotenv: '.env file (legacy)',
  'config-json': 'config.json (legacy)',
};

/**
 * Masks an email for display: sedoglia@gmail.com -> s******a@gmail.com
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  const visible = local.length > 2 ? `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}` : '**';
  return `${visible}@${domain}`;
}

/**
 * Reads a credential pair from the environment, ignoring blank values.
 * Claude Desktop substitutes empty strings for user_config fields the user
 * left blank, so a present-but-empty variable must not count as configured.
 */
function fromEnvironment(): GarminCredentials | null {
  const email = process.env.GARMIN_EMAIL?.trim();
  const password = process.env.GARMIN_PASSWORD?.trim();

  if (!email || !password) return null;

  // Legacy placeholders: older setups wrote a marker such as "ENCRYPTED" in
  // place of the real values, meaning "the real ones live in secure storage".
  // Note that GARMIN_CREDENTIALS_ENCRYPTED is deliberately NOT consulted: that
  // flag lingers in old .env files and would silently disable the credentials
  // configured in the extension settings.
  if (email.includes('ENCRYPTED') || password.includes('ENCRYPTED')) return null;

  return { email, password };
}

function fromDotEnvFile(): GarminCredentials | null {
  const envPath = path.join(PROJECT_ROOT, '.env');
  if (!fs.existsSync(envPath)) return null;

  let email: string | undefined;
  let password: string | undefined;

  fs.readFileSync(envPath, 'utf-8')
    .split('\n')
    .forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('#') || !trimmed.includes('=')) return;

      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').trim();

      if (key === 'GARMIN_EMAIL' && value && !value.includes('ENCRYPTED')) {
        email = value;
      } else if (key === 'GARMIN_PASSWORD' && value && !value.includes('ENCRYPTED')) {
        password = value;
      }
    });

  return email && password ? { email, password } : null;
}

function fromConfigJson(): GarminCredentials | null {
  const configPath = path.join(PROJECT_ROOT, 'config.json');
  if (!fs.existsSync(configPath)) return null;

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    if (config.garmin?.email && config.garmin?.password) {
      return { email: config.garmin.email, password: config.garmin.password };
    }
  } catch {
    // Ignore parsing errors
  }

  return null;
}

/**
 * Reads the credential pair currently provided by the environment, if any.
 */
export function getEnvironmentCredentials(): GarminCredentials | null {
  return fromEnvironment();
}

/**
 * Keeps the encrypted copy in sync with the credentials supplied through the
 * environment. Never throws: a failure here must not block authentication.
 *
 * Must run *before* a login attempt, not after: the stored OAuth tokens belong
 * to the previous pair and would otherwise let a changed password authenticate
 * against the old session. Callers are limited to the authentication path —
 * simply reporting the credential state must not write anything.
 */
export async function syncEnvCredentials(envCredentials: GarminCredentials): Promise<void> {
  try {
    const stored = await secureStorage.loadCredentials();

    if (stored?.email === envCredentials.email && stored?.password === envCredentials.password) {
      return;
    }

    await secureStorage.saveCredentials(envCredentials);

    // Tokens belong to the previous credentials, so they cannot be reused.
    if (stored) {
      await secureStorage.deleteTokens();
      logger.info('Credentials changed in extension settings: stored OAuth tokens dropped');
    }
  } catch (err) {
    logger.warn('Could not sync environment credentials to secure storage:', err);
  }
}

/**
 * Resolves Garmin credentials from the first available source.
 * @returns The credentials and where they came from, or null if none configured
 */
export async function resolveCredentials(): Promise<ResolvedCredentials | null> {
  const envCredentials = fromEnvironment();
  if (envCredentials) {
    return { ...envCredentials, source: 'env' };
  }

  try {
    const stored = await secureStorage.loadCredentials();
    if (stored?.email && stored?.password) {
      return { ...stored, source: 'secure-storage' };
    }
  } catch (err) {
    logger.warn('Failed to load encrypted credentials:', err);
  }

  const dotEnvCredentials = fromDotEnvFile();
  if (dotEnvCredentials) {
    return { ...dotEnvCredentials, source: 'dotenv' };
  }

  const configCredentials = fromConfigJson();
  if (configCredentials) {
    return { ...configCredentials, source: 'config-json' };
  }

  return null;
}

/**
 * Encrypts and stores credentials, replacing any previous pair.
 * Existing OAuth tokens are dropped so the next login uses the new pair.
 */
export async function saveCredentials(credentials: GarminCredentials): Promise<void> {
  await secureStorage.saveCredentials(credentials);
  await secureStorage.deleteTokens();
}

/**
 * Removes stored credentials and OAuth tokens from secure storage.
 * Environment-provided credentials are outside this module's reach and are
 * reported separately by `describeCredentialState`.
 */
export async function clearStoredCredentials(): Promise<void> {
  await secureStorage.deleteCredentials();
  await secureStorage.deleteTokens();
}

/**
 * Drops only the stored OAuth tokens, forcing the next login to go through
 * email and password. Used before verifying a new credential pair, so that
 * tokens belonging to the previous one cannot make an invalid pair look valid.
 */
export async function clearStoredTokens(): Promise<void> {
  await secureStorage.deleteTokens();
}

export interface CredentialState {
  configured: boolean;
  source: CredentialSource | null;
  sourceLabel: string | null;
  email: string | null;
  environmentOverride: boolean;
  dataDir: string;
  keyStorageMethod: 'keytar' | 'file-fallback';
  nativeVaultAvailable: boolean;
  storedCredentialsExist: boolean;
  storedTokensExist: boolean;
}

/**
 * Describes how credentials are currently configured, without ever exposing
 * the password.
 */
export async function describeCredentialState(): Promise<CredentialState> {
  const resolved = await resolveCredentials();
  const config = await secureStorage.getConfig();

  return {
    configured: resolved !== null,
    source: resolved?.source ?? null,
    sourceLabel: resolved ? SOURCE_LABELS[resolved.source] : null,
    email: resolved ? maskEmail(resolved.email) : null,
    environmentOverride: fromEnvironment() !== null,
    dataDir: config.dataDir,
    keyStorageMethod: config.keyStorageMethod,
    nativeVaultAvailable: config.keytarAvailable,
    storedCredentialsExist: config.credentialsExist,
    storedTokensExist: config.tokensExist,
  };
}
