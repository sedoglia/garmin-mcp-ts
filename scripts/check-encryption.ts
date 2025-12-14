#!/usr/bin/env npx tsx
// scripts/check-encryption.ts
/**
 * Diagnostic Script for Garmin MCP Server Encryption
 *
 * This script displays:
 * - Data directory location
 * - Key storage method (native vault or file fallback)
 * - Existence of encryption key
 * - Existence of encrypted credentials and tokens
 * - Platform information
 */

import * as fs from 'fs';
import * as path from 'path';
import { secureStorage, getDataDir } from '../src/utils/secure-storage.js';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function print(message: string, color: string = colors.reset): void {
  console.log(`${color}${message}${colors.reset}`);
}

function printHeader(): void {
  console.log('');
  print('╔══════════════════════════════════════════════════════════════╗', colors.cyan);
  print('║     🔍 Garmin MCP Server - Encryption Diagnostics 🔍        ║', colors.cyan);
  print('╚══════════════════════════════════════════════════════════════╝', colors.cyan);
  console.log('');
}

function printSection(title: string): void {
  console.log('');
  print(`━━━ ${title} ━━━`, colors.blue);
  console.log('');
}

function formatBoolean(value: boolean): string {
  return value ? `${colors.green}✅ Yes${colors.reset}` : `${colors.red}❌ No${colors.reset}`;
}

function formatStatus(exists: boolean, label: string): string {
  return exists
    ? `${colors.green}✅ ${label}${colors.reset}`
    : `${colors.yellow}⏳ ${label}${colors.reset}`;
}

async function main(): Promise<void> {
  printHeader();

  try {
    // Initialize secure storage
    print('Initializing secure storage...', colors.dim);
    await secureStorage.initialize();

    const config = await secureStorage.getConfig();

    // Platform Information
    printSection('Platform Information');

    print(`💻 Operating System: ${getPlatformName(config.platform)}`, colors.reset);
    print(`📍 Node.js Version: ${process.version}`, colors.dim);
    print(`📍 Architecture: ${process.arch}`, colors.dim);

    // Key Storage
    printSection('Encryption Key Storage');

    if (config.keytarAvailable) {
      print('🔐 Native Vault (keytar): Available', colors.green);
    } else {
      print('🔐 Native Vault (keytar): Not Available', colors.yellow);
      print('   └─ Install with: npm install keytar', colors.dim);
    }

    if (config.keyStorageMethod === 'keytar') {
      print(`🔑 Key Location: Native OS Vault`, colors.green);
      switch (config.platform) {
        case 'win32':
          print('   └─ Windows Credential Manager', colors.dim);
          print('   └─ Service: garmin-mcp-server', colors.dim);
          print('   └─ Account: encryption-key', colors.dim);
          break;
        case 'darwin':
          print('   └─ macOS Keychain', colors.dim);
          print('   └─ Protected by Face ID/Touch ID', colors.dim);
          break;
        default:
          print('   └─ Linux Secret Service (D-Bus)', colors.dim);
          print('   └─ GNOME Keyring or KDE Wallet', colors.dim);
          break;
      }
    } else {
      const keyFilePath = path.join(config.dataDir, '.encryption.key');
      print(`🔑 Key Location: File Fallback`, colors.yellow);
      print(`   └─ ${keyFilePath}`, colors.dim);

      if (fs.existsSync(keyFilePath)) {
        const stats = fs.statSync(keyFilePath);
        const mode = (stats.mode & 0o777).toString(8);
        print(`   └─ Permissions: ${mode} (should be 600)`, colors.dim);
      }
    }

    print(`🔑 Key Exists: ${formatBoolean(config.keyExists)}`, colors.reset);

    // Data Directory
    printSection('Data Directory');

    print(`📁 Location: ${config.dataDir}`, colors.reset);

    if (fs.existsSync(config.dataDir)) {
      print(`📁 Directory Exists: ${formatBoolean(true)}`, colors.reset);

      try {
        const stats = fs.statSync(config.dataDir);
        const mode = (stats.mode & 0o777).toString(8);
        print(`📁 Permissions: ${mode} (should be 700)`, colors.dim);
      } catch {
        // Ignore permission check errors on Windows
      }

      // List files in directory
      const files = fs.readdirSync(config.dataDir);
      if (files.length > 0) {
        print(`📋 Contents:`, colors.dim);
        files.forEach((file) => {
          const filePath = path.join(config.dataDir, file);
          const stats = fs.statSync(filePath);
          const size = stats.size;
          const modified = stats.mtime.toISOString().substring(0, 19).replace('T', ' ');
          print(`   └─ ${file} (${size} bytes, modified: ${modified})`, colors.dim);
        });
      }
    } else {
      print(`📁 Directory Exists: ${formatBoolean(false)}`, colors.reset);
      print('   └─ Run: npm run setup-encryption', colors.yellow);
    }

    // Encrypted Files
    printSection('Encrypted Data Files');

    const credentialsPath = path.join(config.dataDir, 'garmin-credentials.enc');
    const tokensPath = path.join(config.dataDir, 'garmin-tokens.enc');

    print(`📧 Credentials (garmin-credentials.enc): ${formatStatus(config.credentialsExist, config.credentialsExist ? 'Encrypted' : 'Not configured')}`, colors.reset);

    if (config.credentialsExist) {
      const stats = fs.statSync(credentialsPath);
      print(`   └─ Size: ${stats.size} bytes`, colors.dim);
      print(`   └─ Modified: ${stats.mtime.toISOString().substring(0, 19).replace('T', ' ')}`, colors.dim);
    } else {
      print('   └─ Run: npm run setup-encryption', colors.yellow);
    }

    print(`🔑 OAuth Tokens (garmin-tokens.enc): ${formatStatus(config.tokensExist, config.tokensExist ? 'Saved' : 'Will be created on login')}`, colors.reset);

    if (config.tokensExist) {
      const stats = fs.statSync(tokensPath);
      print(`   └─ Size: ${stats.size} bytes`, colors.dim);
      print(`   └─ Modified: ${stats.mtime.toISOString().substring(0, 19).replace('T', ' ')}`, colors.dim);

      // Try to read token info (without exposing sensitive data)
      try {
        const tokens = await secureStorage.loadTokens();
        if (tokens?.savedAt) {
          print(`   └─ Token saved at: ${tokens.savedAt}`, colors.dim);
        }
        if (tokens?.oauth2?.expires_at) {
          const expiresAt = new Date(tokens.oauth2.expires_at * 1000);
          const now = new Date();
          const diffMs = expiresAt.getTime() - now.getTime();
          const diffHours = Math.round(diffMs / (1000 * 60 * 60));

          if (diffMs > 0) {
            print(`   └─ Token expires in: ~${diffHours} hours`, colors.green);
          } else {
            print(`   └─ Token expired: ${Math.abs(diffHours)} hours ago`, colors.red);
          }
        }
      } catch {
        print('   └─ Unable to read token details', colors.yellow);
      }
    }

    // Project .env File
    printSection('Project Configuration (.env)');

    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      print(`📄 .env File: ${formatBoolean(true)}`, colors.reset);

      const envContent = fs.readFileSync(envPath, 'utf-8');
      const hasEncryptedFlag = envContent.includes('GARMIN_CREDENTIALS_ENCRYPTED=true');
      const hasReadyFlag = envContent.includes('GARMIN_ENCRYPTION_READY=true');
      const hasPlainEmail = /^GARMIN_EMAIL=(?!.*ENCRYPTED).+$/m.test(envContent);
      const hasPlainPassword = /^GARMIN_PASSWORD=(?!.*ENCRYPTED).+$/m.test(envContent);

      print(`   └─ GARMIN_CREDENTIALS_ENCRYPTED: ${formatBoolean(hasEncryptedFlag)}`, colors.reset);
      print(`   └─ GARMIN_ENCRYPTION_READY: ${formatBoolean(hasReadyFlag)}`, colors.reset);

      if (hasPlainEmail || hasPlainPassword) {
        print(`   ⚠️  WARNING: Plain text credentials found in .env!`, colors.red);
        print(`   └─ Run: npm run setup-encryption to migrate`, colors.yellow);
      }
    } else {
      print(`📄 .env File: ${formatBoolean(false)}`, colors.reset);
    }

    // Summary
    printSection('Summary');

    const isReady = config.keyExists && config.credentialsExist;

    if (isReady) {
      print('✅ Encryption is properly configured!', colors.green);
      print('   └─ The server can use encrypted credentials', colors.dim);
    } else {
      print('⚠️  Encryption setup incomplete', colors.yellow);

      if (!config.keyExists) {
        print('   └─ Missing: Encryption key', colors.red);
      }
      if (!config.credentialsExist) {
        print('   └─ Missing: Encrypted credentials', colors.red);
      }

      print('', colors.reset);
      print('Run: npm run setup-encryption', colors.bright);
    }

    console.log('');

  } catch (error) {
    print(`\n❌ Diagnostic failed: ${error}`, colors.red);
    process.exit(1);
  }
}

function getPlatformName(platform: NodeJS.Platform): string {
  switch (platform) {
    case 'win32':
      return 'Windows';
    case 'darwin':
      return 'macOS';
    case 'linux':
      return 'Linux';
    case 'freebsd':
      return 'FreeBSD';
    default:
      return platform;
  }
}

// Run main
main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
