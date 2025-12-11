// src/index.ts

import 'dotenv/config';
import { runServer } from './mcp/server.js';
import { GarminConnectClient } from './garmin/client.js';
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

function loadEnvironment(): void {
  // Prova a leggere da .env nella root del progetto
  const envPath = path.join(__dirname, '..', '.env');
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach((line) => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
  }

  // Se ancora non abbiamo credenziali, leggi da config.json
  if (!process.env.GARMIN_EMAIL || !process.env.GARMIN_PASSWORD) {
    const configPath = path.join(__dirname, '..', 'config.json');
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        process.env.GARMIN_EMAIL = process.env.GARMIN_EMAIL || config.garmin?.email;
        process.env.GARMIN_PASSWORD = process.env.GARMIN_PASSWORD || config.garmin?.password;
      } catch (err) {
        // Ignora errori di parsing
      }
    }
  }
}

async function main(): Promise<void> {
  loadEnvironment();

  const email = process.env.GARMIN_EMAIL;
  const password = process.env.GARMIN_PASSWORD;

  if (!email || !password) {
    console.error('❌ Errore: GARMIN_EMAIL e GARMIN_PASSWORD devono essere impostati in .env o config.json');
    process.exit(1);
  }

  console.error('🚀 Starting Garmin MCP Server...\n');

  try {
    const garminClient = new GarminConnectClient();
    await garminClient.initialize(email, password);

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
