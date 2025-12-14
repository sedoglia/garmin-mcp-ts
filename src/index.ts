// src/index.ts

import 'dotenv/config';
import { runServer } from './mcp/server.js';
import { GarminConnectClient } from './garmin/client.js';
import { secureStorage, GarminCredentials } from './utils/secure-storage.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// IMPORTANTE: Intercetta console.log per evitare che librerie esterne
// contaminino stdout (che deve contenere solo JSON-RPC per MCP)
console.log = (...args: unknown[]) => {
  // Reindirizza tutto su stderr
  console.error('[LOG]', ...args);
};

// Intercetta anche process.stdout.write per sicurezza
const originalStdoutWrite = process.stdout.write.bind(process.stdout);
process.stdout.write = (chunk: any, encoding?: any, callback?: any): boolean => {
  // Se è una stringa che non sembra JSON-RPC, reindirizza su stderr
  if (typeof chunk === 'string' && !chunk.trim().startsWith('{')) {
    process.stderr.write(chunk, encoding, callback);
    return true;
  }
  return originalStdoutWrite(chunk, encoding, callback);
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Loads credentials from various sources in order of priority:
 * 1. Encrypted secure storage (preferred)
 * 2. Environment variables (GARMIN_EMAIL, GARMIN_PASSWORD)
 * 3. .env file
 * 4. config.json file
 */
async function loadCredentials(): Promise<GarminCredentials | null> {
  // Priority 1: Try to load from encrypted secure storage
  try {
    const encryptedCredentials = await secureStorage.loadCredentials();
    if (encryptedCredentials?.email && encryptedCredentials?.password) {
      console.error('🔐 Loaded credentials from secure encrypted storage');
      return encryptedCredentials;
    }
  } catch (err) {
    console.error('⚠️  Failed to load encrypted credentials:', err);
  }

  // Priority 2: Check environment variables (may be set by Claude Desktop config)
  if (process.env.GARMIN_EMAIL && process.env.GARMIN_PASSWORD) {
    // Check if these are real credentials or just flags
    if (process.env.GARMIN_CREDENTIALS_ENCRYPTED !== 'true') {
      console.error('📋 Using credentials from environment variables');
      return {
        email: process.env.GARMIN_EMAIL,
        password: process.env.GARMIN_PASSWORD
      };
    }
  }

  // Priority 3: Load from .env file (legacy support)
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    let email: string | undefined;
    let password: string | undefined;

    envContent.split('\n').forEach((line) => {
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

    if (email && password) {
      console.error('📋 Using credentials from .env file (consider migrating to encrypted storage)');
      return { email, password };
    }
  }

  // Priority 4: Load from config.json (legacy support)
  const configPath = path.join(__dirname, '..', 'config.json');
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (config.garmin?.email && config.garmin?.password) {
        console.error('📋 Using credentials from config.json (consider migrating to encrypted storage)');
        return {
          email: config.garmin.email,
          password: config.garmin.password
        };
      }
    } catch {
      // Ignore parsing errors
    }
  }

  return null;
}

async function main(): Promise<void> {
  console.error('🚀 Starting Garmin MCP Server...\n');

  // Load credentials from secure storage or fallback sources
  const credentials = await loadCredentials();

  if (!credentials) {
    console.error('');
    console.error('❌ Errore: Credenziali Garmin non trovate!');
    console.error('');
    console.error('Per configurare le credenziali in modo sicuro, esegui:');
    console.error('   npm run setup-encryption');
    console.error('');
    console.error('Oppure imposta GARMIN_EMAIL e GARMIN_PASSWORD in:');
    console.error('   - Variabili d\'ambiente');
    console.error('   - File .env nella root del progetto');
    console.error('   - File config.json nella root del progetto');
    console.error('');
    process.exit(1);
  }

  try {
    const garminClient = new GarminConnectClient();
    await garminClient.initialize(credentials.email, credentials.password);

    console.error('✅ Authenticated with Garmin Connect\n');

    // Avvia il server e mantieni il processo vivo
    await runServer(garminClient);

    // Il processo rimane vivo finché runServer non termina
    // Non aggiungere process.exit() qui!
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Gestisci i segnali di terminazione
process.on('SIGINT', () => {
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.exit(0);
});

main();
