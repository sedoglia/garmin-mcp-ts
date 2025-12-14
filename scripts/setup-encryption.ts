#!/usr/bin/env npx tsx
// scripts/setup-encryption.ts
/**
 * Interactive Setup Script for Garmin MCP Server Encryption
 *
 * This script:
 * 1. Initializes the secure storage directory structure
 * 2. Shows the key storage method being used (native vault or file fallback)
 * 3. Prompts for Garmin credentials (email and password)
 * 4. Optionally migrates credentials from existing .env file
 * 5. Encrypts and saves credentials securely
 * 6. Updates .env to indicate encryption is ready
 */

import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { secureStorage, getDataDir, GarminCredentials } from '../src/utils/secure-storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// ANSI color codes for terminal output
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
  print('║     🔐 Garmin MCP Server - Secure Encryption Setup 🔐       ║', colors.cyan);
  print('╚══════════════════════════════════════════════════════════════╝', colors.cyan);
  console.log('');
}

function printSection(title: string): void {
  console.log('');
  print(`━━━ ${title} ━━━`, colors.blue);
  console.log('');
}

/**
 * Creates a readline interface for user input
 */
function createReadlineInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * Prompts for user input
 */
async function prompt(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

/**
 * Prompts for password (hidden input on supported terminals)
 */
async function promptPassword(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    // Try to hide password input
    const stdin = process.stdin;
    const stdout = process.stdout;

    if (stdin.isTTY) {
      stdout.write(question);
      stdin.setRawMode(true);
      stdin.resume();
      stdin.setEncoding('utf8');

      let password = '';

      const onData = (char: string) => {
        const charCode = char.charCodeAt(0);

        if (charCode === 13 || charCode === 10) {
          // Enter pressed
          stdin.setRawMode(false);
          stdin.removeListener('data', onData);
          stdout.write('\n');
          resolve(password);
        } else if (charCode === 127 || charCode === 8) {
          // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            stdout.write('\b \b');
          }
        } else if (charCode === 3) {
          // Ctrl+C
          stdin.setRawMode(false);
          process.exit(1);
        } else if (charCode >= 32) {
          // Printable character
          password += char;
          stdout.write('*');
        }
      };

      stdin.on('data', onData);
    } else {
      // Fallback for non-TTY (warning: password will be visible)
      print('⚠️  Password will be visible (non-interactive terminal)', colors.yellow);
      rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    }
  });
}

/**
 * Checks for existing credentials in .env file
 */
function checkExistingEnv(): { email?: string; password?: string } {
  const envPath = path.join(PROJECT_ROOT, '.env');

  if (!fs.existsSync(envPath)) {
    return {};
  }

  try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const result: { email?: string; password?: string } = {};

    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('#') || !trimmed.includes('=')) return;

      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').trim();

      if (key === 'GARMIN_EMAIL' && value && !value.includes('ENCRYPTED')) {
        result.email = value;
      } else if (key === 'GARMIN_PASSWORD' && value && !value.includes('ENCRYPTED')) {
        result.password = value;
      }
    });

    return result;
  } catch {
    return {};
  }
}

/**
 * Updates .env file to indicate encryption is ready
 */
function updateEnvFile(): void {
  const envPath = path.join(PROJECT_ROOT, '.env');
  let content = '';

  // Read existing content if file exists
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf-8');

    // Remove old credential lines
    const lines = content.split('\n').filter((line) => {
      const trimmed = line.trim();
      return !trimmed.startsWith('GARMIN_EMAIL=') &&
             !trimmed.startsWith('GARMIN_PASSWORD=') &&
             !trimmed.startsWith('GARMIN_CREDENTIALS_ENCRYPTED=') &&
             !trimmed.startsWith('GARMIN_ENCRYPTION_READY=');
    });

    content = lines.join('\n').trim();
  }

  // Add encryption flags
  const newContent = `${content}

# Garmin MCP Encryption Configuration
# Credentials are securely encrypted - DO NOT add email/password here
GARMIN_CREDENTIALS_ENCRYPTED=true
GARMIN_ENCRYPTION_READY=true
`.trim() + '\n';

  fs.writeFileSync(envPath, newContent);
}

/**
 * Main setup function
 */
async function main(): Promise<void> {
  printHeader();

  const rl = createReadlineInterface();

  try {
    // Step 1: Initialize secure storage and show configuration
    printSection('Step 1: Initializing Secure Storage');

    await secureStorage.initialize();
    const config = await secureStorage.getConfig();

    print(`📁 Data Directory: ${config.dataDir}`, colors.dim);
    print(`💻 Platform: ${config.platform}`, colors.dim);

    if (config.keyStorageMethod === 'keytar') {
      print('🔐 Key Storage: Native OS Vault', colors.green);
      switch (config.platform) {
        case 'win32':
          print('   └─ Windows Credential Manager', colors.dim);
          break;
        case 'darwin':
          print('   └─ macOS Keychain', colors.dim);
          break;
        default:
          print('   └─ Linux Secret Service (D-Bus)', colors.dim);
          break;
      }
    } else {
      print('🔐 Key Storage: File-based fallback', colors.yellow);
      print(`   └─ ${path.join(config.dataDir, '.encryption.key')}`, colors.dim);
      print('   ⚠️  Install keytar for native vault support: npm install keytar', colors.yellow);
    }

    print(`🔑 Encryption Key: ${config.keyExists ? 'Exists' : 'Will be generated'}`, colors.dim);

    // Step 2: Check for existing credentials
    printSection('Step 2: Checking Existing Configuration');

    const existingEnv = checkExistingEnv();
    let email = '';
    let password = '';

    if (existingEnv.email || existingEnv.password) {
      print('📋 Found existing credentials in .env file', colors.yellow);

      if (existingEnv.email) {
        print(`   └─ Email: ${existingEnv.email}`, colors.dim);
      }

      const migrate = await prompt(rl, '\n🔄 Migrate existing credentials? (Y/n): ');

      if (migrate.toLowerCase() !== 'n') {
        email = existingEnv.email || '';
        password = existingEnv.password || '';
        print('✅ Using existing credentials from .env', colors.green);
      }
    }

    if (config.credentialsExist) {
      print('📋 Encrypted credentials already exist', colors.yellow);
      const overwrite = await prompt(rl, '\n🔄 Overwrite existing encrypted credentials? (y/N): ');

      if (overwrite.toLowerCase() !== 'y') {
        print('⏭️  Skipping credential setup', colors.dim);
        rl.close();
        printSummary(config);
        return;
      }
    }

    // Step 3: Get credentials from user
    printSection('Step 3: Enter Garmin Credentials');

    if (!email) {
      email = await prompt(rl, '📧 Garmin Email: ');
    }

    if (!password) {
      password = await promptPassword(rl, '🔑 Garmin Password: ');
    }

    if (!email || !password) {
      print('❌ Email and password are required', colors.red);
      rl.close();
      process.exit(1);
    }

    // Step 4: Encrypt and save credentials
    printSection('Step 4: Encrypting Credentials');

    const credentials: GarminCredentials = { email, password };
    await secureStorage.saveCredentials(credentials);

    print('✅ Credentials encrypted and saved', colors.green);

    // Step 5: Update .env file
    printSection('Step 5: Updating Configuration');

    updateEnvFile();
    print('✅ .env file updated', colors.green);

    rl.close();

    // Print summary
    const finalConfig = await secureStorage.getConfig();
    printSummary(finalConfig);

  } catch (error) {
    rl.close();
    print(`\n❌ Setup failed: ${error}`, colors.red);
    process.exit(1);
  }
}

/**
 * Prints the final summary
 */
function printSummary(config: EncryptionConfig): void {
  printSection('Setup Complete');

  print('🔐 Security Architecture:', colors.bright);
  console.log('');

  // Key location
  if (config.keyStorageMethod === 'keytar') {
    switch (config.platform) {
      case 'win32':
        print('   🔑 Encryption Key: Windows Credential Manager', colors.green);
        break;
      case 'darwin':
        print('   🔑 Encryption Key: macOS Keychain (Face ID/Touch ID protected)', colors.green);
        break;
      default:
        print('   🔑 Encryption Key: Linux Secret Service (GNOME/KDE)', colors.green);
        break;
    }
  } else {
    print(`   🔑 Encryption Key: ${path.join(config.dataDir, '.encryption.key')}`, colors.yellow);
  }

  // Data location
  print(`   📁 Encrypted Data: ${config.dataDir}`, colors.dim);
  print(`      └─ garmin-credentials.enc: ${config.credentialsExist ? '✅ Exists' : '❌ Missing'}`, colors.dim);
  print(`      └─ garmin-tokens.enc: ${config.tokensExist ? '✅ Exists' : '⏳ Will be created on first login'}`, colors.dim);

  console.log('');
  print('📋 Next Steps:', colors.bright);
  print('   1. Run: npm run build', colors.dim);
  print('   2. Run: npm start', colors.dim);
  print('   3. The server will automatically use encrypted credentials', colors.dim);

  console.log('');
  print('🔒 Security Notes:', colors.bright);
  print('   • Credentials are encrypted with AES-256-GCM', colors.dim);
  print('   • Encryption key is stored in OS native vault (or protected file)', colors.dim);
  print('   • Never commit the data directory or .env with credentials', colors.dim);
  print('   • If you move to a new computer, run setup-encryption again', colors.dim);

  console.log('');
  print('✅ Encryption setup complete!', colors.green);
  console.log('');
}

// Run main
main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
