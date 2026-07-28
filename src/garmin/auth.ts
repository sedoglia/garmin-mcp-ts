// src/garmin/auth.ts
/**
 * Lazy authentication for the Garmin MCP Server.
 *
 * The server must connect its stdio transport before doing anything that can
 * fail, otherwise the MCP client sees the process die mid-handshake and reports
 * "Server transport closed unexpectedly" with no usable diagnostics. So login
 * no longer happens at startup: it happens on the first tool call that needs
 * it, and a failure becomes a readable error in the conversation instead.
 */

import { GarminConnectClient } from './client.js';
import {
  resolveCredentials,
  saveCredentials,
  clearStoredCredentials,
  clearStoredTokens,
  describeCredentialState,
  getEnvironmentCredentials,
  syncEnvCredentials,
  maskEmail,
  CredentialSource,
  CredentialState,
  SOURCE_LABELS,
} from '../utils/credentials.js';
import logger from '../utils/logger.js';

/** How long a failed login is remembered before the next attempt is allowed. */
const FAILURE_COOLDOWN_MS = 60_000;

export const CREDENTIAL_SETUP_HINT = [
  'Garmin credentials are not configured.',
  '',
  'Configure them in one of these ways:',
  '  1. Claude Desktop -> Settings -> Extensions -> garmin-mcp-ts, fill in',
  '     "Garmin Email" and "Garmin Password", then restart the extension.',
  '  2. Ask in this conversation: "configure my Garmin credentials", which runs',
  '     the setup_credentials tool.',
  '  3. From a clone of the repository: npm run setup-encryption',
].join('\n');

export class MissingCredentialsError extends Error {
  constructor() {
    super(CREDENTIAL_SETUP_HINT);
    this.name = 'MissingCredentialsError';
  }
}

export class GarminLoginError extends Error {
  constructor(reason: string) {
    super(
      [
        `Garmin Connect login failed: ${reason}`,
        '',
        'Check the email and password, then update them with the setup_credentials',
        'tool or in Claude Desktop -> Settings -> Extensions -> garmin-mcp-ts.',
      ].join('\n')
    );
    this.name = 'GarminLoginError';
  }
}

export interface AuthStatus extends CredentialState {
  authenticated: boolean;
  lastError: string | null;
}

export class AuthManager {
  private pending: Promise<void> | null = null;
  private lastError: string | null = null;
  private lastFailureAt = 0;
  private activeSource: CredentialSource | null = null;

  constructor(private client: GarminConnectClient) {}

  getClient(): GarminConnectClient {
    return this.client;
  }

  /**
   * Ensures the Garmin client is logged in, logging in on first use.
   * Concurrent callers share a single login attempt.
   *
   * @throws MissingCredentialsError when no credentials are configured
   * @throws GarminLoginError when Garmin rejects the credentials
   */
  async ensureAuthenticated(): Promise<void> {
    if (this.client.isReady()) return;

    if (this.pending) return this.pending;

    // Don't retry a rejected login on every single tool call.
    if (this.lastError && Date.now() - this.lastFailureAt < FAILURE_COOLDOWN_MS) {
      throw new GarminLoginError(this.lastError);
    }

    this.pending = this.authenticate();

    try {
      await this.pending;
    } finally {
      this.pending = null;
    }
  }

  private async authenticate(): Promise<void> {
    const credentials = await resolveCredentials();

    if (!credentials) {
      logger.warn('No Garmin credentials configured');
      throw new MissingCredentialsError();
    }

    logger.info(`Authenticating with credentials from ${SOURCE_LABELS[credentials.source]}`);

    // Prima del login, così un cambio di credenziali nelle impostazioni
    // dell'estensione invalida i token OAuth della coppia precedente.
    if (credentials.source === 'env') {
      await syncEnvCredentials({ email: credentials.email, password: credentials.password });
    }

    try {
      await this.client.initialize(credentials.email, credentials.password);
      this.activeSource = credentials.source;
      this.lastError = null;
      this.lastFailureAt = 0;
      logger.info(`Authenticated with Garmin Connect as ${maskEmail(credentials.email)}`);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      this.lastError = reason;
      this.lastFailureAt = Date.now();
      this.client.reset();
      throw new GarminLoginError(reason);
    }
  }

  /**
   * Stores a new credential pair and logs in with it immediately, so the change
   * takes effect without restarting the extension.
   */
  async configure(email: string, password: string): Promise<AuthStatus> {
    this.client.reset();
    this.lastError = null;
    this.lastFailureAt = 0;
    this.activeSource = null;

    // The tokens on disk belong to the previous pair and would happily
    // authenticate the old account, making any password look valid.
    await clearStoredTokens();

    try {
      await this.client.initialize(email, password);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      this.lastError = reason;
      this.lastFailureAt = Date.now();
      this.client.reset();
      // Credentials that do not work are not worth storing.
      throw new GarminLoginError(reason);
    }

    await saveCredentials({ email, password });
    await this.client.saveTokens();

    this.activeSource = 'secure-storage';
    logger.info(`Credentials stored and verified for ${maskEmail(email)}`);

    return this.getStatus();
  }

  /**
   * Whether the environment provides a credential pair other than the given
   * one. Those values are re-applied at every restart, so the user must be told
   * that what they just saved is not what will be used next time.
   */
  isOverriddenByEnvironment(email: string, password: string): boolean {
    const envCredentials = getEnvironmentCredentials();
    if (!envCredentials) return false;

    return envCredentials.email !== email || envCredentials.password !== password;
  }

  /**
   * Deletes stored credentials and OAuth tokens, and drops the live session.
   */
  async clear(): Promise<AuthStatus> {
    await clearStoredCredentials();
    this.client.reset();
    this.lastError = null;
    this.lastFailureAt = 0;
    this.activeSource = null;

    return this.getStatus();
  }

  async getStatus(): Promise<AuthStatus> {
    const state = await describeCredentialState();

    return {
      ...state,
      authenticated: this.client.isReady(),
      lastError: this.lastError,
    };
  }

  /**
   * The source the current session was authenticated from, if any.
   */
  getActiveSource(): CredentialSource | null {
    return this.client.isReady() ? this.activeSource : null;
  }
}
