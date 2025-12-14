// src/utils/secure-storage.ts
/**
 * Secure Storage Module for Garmin MCP Server
 *
 * This module provides encrypted storage for sensitive data (credentials and OAuth tokens)
 * using AES-256 encryption. The encryption key is stored in the OS native vault when available,
 * with a file-based fallback for systems without vault support.
 *
 * Architecture:
 * - Windows: Key in Windows Credential Manager, data in %LOCALAPPDATA%\garmin-mcp\
 * - macOS: Key in Keychain, data in ~/Library/Application Support/garmin-mcp/
 * - Linux: Key in Secret Service (D-Bus), data in ~/.config/garmin-mcp/
 * - Fallback: Key in {dataDir}/.encryption.key (with restricted permissions)
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Constants for keytar service
const KEYTAR_SERVICE = 'garmin-mcp-server';
const KEYTAR_ACCOUNT = 'encryption-key';

// File names for encrypted data
const CREDENTIALS_FILE = 'garmin-credentials.enc';
const TOKENS_FILE = 'garmin-tokens.enc';
const FALLBACK_KEY_FILE = '.encryption.key';

/**
 * Interface for Garmin credentials
 */
export interface GarminCredentials {
  email: string;
  password: string;
}

/**
 * Interface for OAuth tokens
 */
export interface OAuthTokens {
  oauth1: any;
  oauth2: any;
  savedAt?: string;
}

/**
 * Interface for encryption configuration status
 */
export interface EncryptionConfig {
  dataDir: string;
  keyStorageMethod: 'keytar' | 'file-fallback';
  keyExists: boolean;
  credentialsExist: boolean;
  tokensExist: boolean;
  platform: NodeJS.Platform;
  keytarAvailable: boolean;
}

/**
 * Determines the data directory based on the operating system
 * @returns The path to the data directory
 */
export function getDataDir(): string {
  const platform = process.platform;
  const homeDir = os.homedir();

  switch (platform) {
    case 'win32':
      // Windows: Use LOCALAPPDATA or fallback to AppData/Local
      const localAppData = process.env.LOCALAPPDATA || path.join(homeDir, 'AppData', 'Local');
      return path.join(localAppData, 'garmin-mcp');

    case 'darwin':
      // macOS: Use Application Support
      return path.join(homeDir, 'Library', 'Application Support', 'garmin-mcp');

    default:
      // Linux and others: Use XDG_CONFIG_HOME or fallback to ~/.config
      const configHome = process.env.XDG_CONFIG_HOME || path.join(homeDir, '.config');
      return path.join(configHome, 'garmin-mcp');
  }
}

/**
 * SecureStorage class for managing encrypted credentials and tokens
 */
class SecureStorage {
  private dataDir: string;
  private encryptionKey: string | null = null;
  private keytarAvailable: boolean = false;
  private keytar: any = null;
  private initialized: boolean = false;

  constructor() {
    this.dataDir = getDataDir();
  }

  /**
   * Initialize the secure storage system
   * - Creates data directory if needed
   * - Loads or generates encryption key
   * - Sets up .gitignore in data directory
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Create data directory with restricted permissions
    this.ensureDataDirectory();

    // Try to load keytar for native vault access
    await this.loadKeytar();

    // Load or generate encryption key
    await this.loadOrGenerateKey();

    this.initialized = true;
  }

  /**
   * Ensures the data directory exists with proper permissions
   */
  private ensureDataDirectory(): void {
    if (!fs.existsSync(this.dataDir)) {
      // Create directory with 0o700 permissions (owner only)
      fs.mkdirSync(this.dataDir, { recursive: true, mode: 0o700 });
      console.error(`📁 Created secure data directory: ${this.dataDir}`);
    }

    // Create .gitignore to prevent accidental commits
    const gitignorePath = path.join(this.dataDir, '.gitignore');
    if (!fs.existsSync(gitignorePath)) {
      fs.writeFileSync(gitignorePath, '# Ignore all encrypted files and keys\n*.enc\n*.key\n.encryption.key\n', { mode: 0o600 });
    }
  }

  /**
   * Attempts to load keytar for native vault access
   */
  private async loadKeytar(): Promise<void> {
    try {
      // Dynamic import to make keytar optional
      // Using Function constructor to avoid TypeScript static analysis
      const importKeytar = new Function('return import("keytar")');
      const keytarModule = await importKeytar();
      // Handle ESM/CJS interop: use .default if available, otherwise use the module directly
      this.keytar = keytarModule.default || keytarModule;
      this.keytarAvailable = typeof this.keytar.setPassword === 'function';
      if (this.keytarAvailable) {
        console.error('🔐 Native vault (keytar) available');
      } else {
        console.error('⚠️  Keytar loaded but setPassword not available');
        this.keytarAvailable = false;
      }
    } catch {
      this.keytarAvailable = false;
      console.error('⚠️  Native vault (keytar) not available, using file-based fallback');
    }
  }

  /**
   * Loads existing encryption key or generates a new one
   */
  private async loadOrGenerateKey(): Promise<void> {
    // Try to load from native vault first
    if (this.keytarAvailable && this.keytar) {
      try {
        const storedKey = await this.keytar.getPassword(KEYTAR_SERVICE, KEYTAR_ACCOUNT);
        if (storedKey) {
          this.encryptionKey = storedKey;
          console.error('🔑 Encryption key loaded from native vault');
          return;
        }
      } catch (err) {
        console.error('⚠️  Failed to access native vault:', err);
      }
    }

    // Try to load from fallback file
    const keyFilePath = path.join(this.dataDir, FALLBACK_KEY_FILE);
    if (fs.existsSync(keyFilePath)) {
      try {
        this.encryptionKey = fs.readFileSync(keyFilePath, 'utf-8').trim();
        console.error('🔑 Encryption key loaded from fallback file');
        return;
      } catch (err) {
        console.error('⚠️  Failed to read fallback key file:', err);
      }
    }

    // Generate new key
    await this.generateNewKey();
  }

  /**
   * Generates a new encryption key and stores it securely
   */
  private async generateNewKey(): Promise<void> {
    // Generate 32 bytes (256 bits) random key
    const keyBuffer = crypto.randomBytes(32);
    this.encryptionKey = keyBuffer.toString('hex');

    console.error('🔑 Generated new encryption key');

    // Try to store in native vault first
    if (this.keytarAvailable && this.keytar) {
      try {
        await this.keytar.setPassword(KEYTAR_SERVICE, KEYTAR_ACCOUNT, this.encryptionKey);
        console.error('✅ Encryption key saved to native vault');
        return;
      } catch (err) {
        console.error('⚠️  Failed to save to native vault, using file fallback:', err);
      }
    }

    // Save to fallback file with restricted permissions
    const keyFilePath = path.join(this.dataDir, FALLBACK_KEY_FILE);
    fs.writeFileSync(keyFilePath, this.encryptionKey, { mode: 0o600 });
    console.error(`✅ Encryption key saved to fallback file: ${keyFilePath}`);
  }

  /**
   * Encrypts data using AES-256-GCM
   * @param data The data to encrypt
   * @returns Encrypted data as base64 string with IV and auth tag
   */
  private encryptData(data: string): string {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    // Generate random IV (12 bytes for GCM)
    const iv = crypto.randomBytes(12);

    // Create cipher with key (convert hex to buffer)
    const keyBuffer = Buffer.from(this.encryptionKey, 'hex');
    const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);

    // Encrypt data
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    // Get auth tag
    const authTag = cipher.getAuthTag();

    // Combine IV + authTag + encrypted data
    const combined = {
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      data: encrypted
    };

    return JSON.stringify(combined);
  }

  /**
   * Decrypts data using AES-256-GCM
   * @param encryptedStr The encrypted data string
   * @returns Decrypted data as string
   */
  private decryptData(encryptedStr: string): string {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    const { iv, authTag, data } = JSON.parse(encryptedStr);

    // Convert from base64
    const ivBuffer = Buffer.from(iv, 'base64');
    const authTagBuffer = Buffer.from(authTag, 'base64');
    const keyBuffer = Buffer.from(this.encryptionKey, 'hex');

    // Create decipher
    const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, ivBuffer);
    decipher.setAuthTag(authTagBuffer);

    // Decrypt
    let decrypted = decipher.update(data, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Encrypts and saves data to a file
   * @param data The data to encrypt
   * @param filename The filename (without path) to save to
   */
  async encrypt<T>(data: T, filename: string): Promise<void> {
    await this.initialize();

    const jsonData = JSON.stringify(data);
    const encrypted = this.encryptData(jsonData);

    const filePath = path.join(this.dataDir, filename);
    fs.writeFileSync(filePath, encrypted, { mode: 0o600 });

    console.error(`✅ Data encrypted and saved to: ${filePath}`);
  }

  /**
   * Decrypts and loads data from a file
   * @param filename The filename (without path) to load from
   * @returns The decrypted data or null if file doesn't exist
   */
  async decrypt<T>(filename: string): Promise<T | null> {
    await this.initialize();

    const filePath = path.join(this.dataDir, filename);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      const encrypted = fs.readFileSync(filePath, 'utf-8');
      const decrypted = this.decryptData(encrypted);
      return JSON.parse(decrypted) as T;
    } catch (err) {
      console.error(`⚠️  Failed to decrypt ${filename}:`, err);
      return null;
    }
  }

  /**
   * Saves Garmin credentials (email and password) encrypted
   * @param credentials The credentials to save
   */
  async saveCredentials(credentials: GarminCredentials): Promise<void> {
    await this.encrypt(credentials, CREDENTIALS_FILE);
  }

  /**
   * Loads Garmin credentials
   * @returns The credentials or null if not found
   */
  async loadCredentials(): Promise<GarminCredentials | null> {
    return await this.decrypt<GarminCredentials>(CREDENTIALS_FILE);
  }

  /**
   * Saves OAuth tokens encrypted
   * @param tokens The OAuth tokens to save
   */
  async saveTokens(tokens: OAuthTokens): Promise<void> {
    const tokensWithTimestamp = {
      ...tokens,
      savedAt: new Date().toISOString()
    };
    await this.encrypt(tokensWithTimestamp, TOKENS_FILE);
  }

  /**
   * Loads OAuth tokens
   * @returns The tokens or null if not found
   */
  async loadTokens(): Promise<OAuthTokens | null> {
    return await this.decrypt<OAuthTokens>(TOKENS_FILE);
  }

  /**
   * Checks if credentials file exists
   * @returns True if credentials exist
   */
  credentialsExist(): boolean {
    return fs.existsSync(path.join(this.dataDir, CREDENTIALS_FILE));
  }

  /**
   * Checks if tokens file exists
   * @returns True if tokens exist
   */
  tokensExist(): boolean {
    return fs.existsSync(path.join(this.dataDir, TOKENS_FILE));
  }

  /**
   * Deletes stored credentials
   */
  async deleteCredentials(): Promise<void> {
    const filePath = path.join(this.dataDir, CREDENTIALS_FILE);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.error('🗑️  Credentials deleted');
    }
  }

  /**
   * Deletes stored tokens
   */
  async deleteTokens(): Promise<void> {
    const filePath = path.join(this.dataDir, TOKENS_FILE);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.error('��️  Tokens deleted');
    }
  }

  /**
   * Gets encryption configuration and status
   * @returns Configuration object with status information
   */
  async getConfig(): Promise<EncryptionConfig> {
    await this.initialize();

    // Determine key storage method
    let keyStorageMethod: 'keytar' | 'file-fallback' = 'file-fallback';
    let keyExists = false;

    if (this.keytarAvailable && this.keytar) {
      try {
        const storedKey = await this.keytar.getPassword(KEYTAR_SERVICE, KEYTAR_ACCOUNT);
        if (storedKey) {
          keyStorageMethod = 'keytar';
          keyExists = true;
        }
      } catch {
        // Fall through to file check
      }
    }

    if (keyStorageMethod === 'file-fallback') {
      const keyFilePath = path.join(this.dataDir, FALLBACK_KEY_FILE);
      keyExists = fs.existsSync(keyFilePath);
    }

    return {
      dataDir: this.dataDir,
      keyStorageMethod,
      keyExists,
      credentialsExist: this.credentialsExist(),
      tokensExist: this.tokensExist(),
      platform: process.platform,
      keytarAvailable: this.keytarAvailable
    };
  }

  /**
   * Gets the data directory path
   * @returns The data directory path
   */
  getDataDirectory(): string {
    return this.dataDir;
  }

  /**
   * Checks if the secure storage is properly initialized with a key
   * @returns True if initialized with a key
   */
  isInitialized(): boolean {
    return this.initialized && this.encryptionKey !== null;
  }

  /**
   * Migrates the encryption key from file fallback to native vault (keytar)
   * @returns True if migration was successful
   */
  async migrateKeyToVault(): Promise<boolean> {
    await this.initialize();

    if (!this.keytarAvailable || !this.keytar) {
      console.error('❌ Native vault (keytar) not available');
      return false;
    }

    if (!this.encryptionKey) {
      console.error('❌ No encryption key to migrate');
      return false;
    }

    // Check if key is already in vault
    try {
      const existingKey = await this.keytar.getPassword(KEYTAR_SERVICE, KEYTAR_ACCOUNT);
      if (existingKey) {
        console.error('✅ Key already exists in native vault');
        return true;
      }
    } catch (err) {
      console.error('⚠️  Error checking vault:', err);
    }

    // Save key to vault
    try {
      await this.keytar.setPassword(KEYTAR_SERVICE, KEYTAR_ACCOUNT, this.encryptionKey);
      console.error('✅ Encryption key migrated to native vault');

      // Remove the fallback file after successful migration
      const keyFilePath = path.join(this.dataDir, FALLBACK_KEY_FILE);
      if (fs.existsSync(keyFilePath)) {
        fs.unlinkSync(keyFilePath);
        console.error('🗑️  Removed fallback key file');
      }

      return true;
    } catch (err) {
      console.error('❌ Failed to migrate key to vault:', err);
      return false;
    }
  }

  /**
   * Resets the initialization state to force re-initialization
   * Useful after migrating key to vault
   */
  resetInitialization(): void {
    this.initialized = false;
    this.encryptionKey = null;
  }
}

// Export singleton instance
export const secureStorage = new SecureStorage();

// Export class for testing
export { SecureStorage };
