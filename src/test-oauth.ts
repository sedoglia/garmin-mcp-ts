// src/test-oauth.ts
// Test script per verificare salvataggio/caricamento OAuth tokens con encryption sicura

import { GarminConnectClient } from './garmin/client.js';
import { secureStorage, getDataDir } from './utils/secure-storage.js';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const DATA_DIR = getDataDir();
const TOKENS_FILE_PATH = path.join(DATA_DIR, 'garmin-tokens.enc');

function getTokenInfo(filePath: string): { exists: boolean; size: number; mtime: Date | null } {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      return { exists: true, size: stats.size, mtime: stats.mtime };
    }
  } catch {
    // ignore
  }
  return { exists: false, size: 0, mtime: null };
}

function formatDate(date: Date | null): string {
  if (!date) return 'N/A';
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

async function main() {
  const email = process.env.GARMIN_EMAIL;
  const password = process.env.GARMIN_PASSWORD;

  if (!email || !password) {
    console.error('Missing GARMIN_EMAIL or GARMIN_PASSWORD');
    process.exit(1);
  }

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('TEST OAUTH TOKEN PERSISTENCE (ENCRYPTED)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Initialize secure storage
  await secureStorage.initialize();
  const config = await secureStorage.getConfig();

  console.log('📋 CONFIGURAZIONE ENCRYPTION\n');
  console.log(`   Data Directory: ${config.dataDir}`);
  console.log(`   Key Storage: ${config.keyStorageMethod}`);
  console.log(`   Key Exists: ${config.keyExists}`);
  console.log(`   Keytar Available: ${config.keytarAvailable}`);

  // Test 1: Verifica stato iniziale dei token criptati
  console.log('\n📋 TEST 1: Stato iniziale dei token criptati\n');

  const tokensBefore = getTokenInfo(TOKENS_FILE_PATH);

  console.log(`   garmin-tokens.enc:`);
  console.log(`     - Exists: ${tokensBefore.exists}`);
  console.log(`     - Size: ${tokensBefore.size} bytes`);
  console.log(`     - Modified: ${formatDate(tokensBefore.mtime)}`);

  if (tokensBefore.exists) {
    const tokens = await secureStorage.loadTokens();
    if (tokens) {
      console.log(`     - Decryption: ✅ Success`);
      console.log(`     - Has oauth1: ${!!tokens.oauth1}`);
      console.log(`     - Has oauth2: ${!!tokens.oauth2}`);
      if (tokens.savedAt) {
        console.log(`     - Saved at: ${tokens.savedAt}`);
      }
      if (tokens.oauth2?.expires_at) {
        const expiresAt = new Date(tokens.oauth2.expires_at * 1000);
        const now = new Date();
        const diffMs = expiresAt.getTime() - now.getTime();
        const diffHours = Math.round(diffMs / (1000 * 60 * 60));
        console.log(`     - Token expires in: ~${diffHours} hours`);
      }
    } else {
      console.log(`     - Decryption: ❌ Failed`);
    }
  }

  // Test 2: Prima autenticazione
  console.log('\n📋 TEST 2: Prima autenticazione\n');

  const client1 = new GarminConnectClient();
  const startTime1 = Date.now();

  try {
    await client1.initialize(email!, password!);
    const duration1 = Date.now() - startTime1;
    console.log(`   ✅ Autenticazione completata in ${duration1}ms`);

    if (duration1 < 2000 && tokensBefore.exists) {
      console.log(`   ℹ️  Token criptati riutilizzati (autenticazione veloce)`);
    } else {
      console.log(`   ℹ️  Login completo eseguito`);
    }
  } catch (err) {
    console.log(`   ❌ Errore: ${err}`);
    process.exit(1);
  }

  // Verifica che i token siano stati salvati
  const tokensAfter1 = getTokenInfo(TOKENS_FILE_PATH);
  console.log(`\n   Stato token dopo autenticazione:`);
  console.log(`   garmin-tokens.enc: ${tokensAfter1.size} bytes, modified: ${formatDate(tokensAfter1.mtime)}`);

  // Test 3: Verifica API funzionante
  console.log('\n📋 TEST 3: Verifica chiamata API\n');

  try {
    const profile = await client1.getUserProfile();
    console.log(`   ✅ getUserProfile OK`);
    console.log(`   ℹ️  Display Name: ${profile?.displayName || 'N/A'}`);
  } catch (err) {
    console.log(`   ❌ Errore getUserProfile: ${err}`);
  }

  // Test 4: Nuova istanza client (deve riutilizzare token)
  console.log('\n📋 TEST 4: Nuova istanza client (riutilizzo token)\n');

  const client2 = new GarminConnectClient();
  const startTime2 = Date.now();

  try {
    await client2.initialize(email!, password!);
    const duration2 = Date.now() - startTime2;
    console.log(`   ✅ Autenticazione completata in ${duration2}ms`);

    if (duration2 < 2000) {
      console.log(`   ✅ Token criptati riutilizzati correttamente`);
    } else {
      console.log(`   ⚠️  Potrebbe aver fatto login completo`);
    }
  } catch (err) {
    console.log(`   ❌ Errore: ${err}`);
  }

  // Test 5: Verifica contenuto token decriptati
  console.log('\n📋 TEST 5: Verifica contenuto token decriptati\n');

  const tokens = await secureStorage.loadTokens();
  if (tokens) {
    console.log(`   oauth1 token:`);
    console.log(`     - Has oauth_token: ${!!tokens.oauth1?.oauth_token}`);
    console.log(`     - Has oauth_token_secret: ${!!tokens.oauth1?.oauth_token_secret}`);

    console.log(`   oauth2 token:`);
    console.log(`     - Has access_token: ${!!tokens.oauth2?.access_token}`);
    console.log(`     - Has refresh_token: ${!!tokens.oauth2?.refresh_token}`);
    console.log(`     - Has expires_at: ${!!tokens.oauth2?.expires_at}`);

    if (tokens.oauth2?.expires_at) {
      const expiresAt = new Date(tokens.oauth2.expires_at * 1000);
      const now = new Date();
      const diffMs = expiresAt.getTime() - now.getTime();
      const diffHours = Math.round(diffMs / (1000 * 60 * 60));
      const status = diffMs > 0 ? '✅ Valid' : '❌ Expired';
      console.log(`     - Expiration: ${status} (${diffHours > 0 ? 'in' : ''} ~${Math.abs(diffHours)} hours${diffMs < 0 ? ' ago' : ''})`);
    }

    console.log(`\n   ✅ Token decriptati con successo`);
  } else {
    console.log(`   ❌ Impossibile decriptare i token`);
  }

  // Test 6: Test cancellazione e ri-creazione token
  console.log('\n📋 TEST 6: Test cancellazione e ri-creazione token\n');

  // Backup dei token
  const tokensBackup = await secureStorage.loadTokens();

  // Cancella token
  await secureStorage.deleteTokens();
  console.log(`   ℹ️  Token cancellati`);

  const client3 = new GarminConnectClient();
  const startTime3 = Date.now();

  try {
    await client3.initialize(email!, password!);
    const duration3 = Date.now() - startTime3;
    console.log(`   ✅ Re-login completato in ${duration3}ms`);

    // Verifica token ri-creati
    const tokensRecreated = await secureStorage.loadTokens();
    if (tokensRecreated) {
      console.log(`   ✅ Token ri-creati e salvati criptati`);
    } else {
      console.log(`   ❌ Token non ri-creati`);
    }
  } catch (err) {
    console.log(`   ❌ Errore durante re-login: ${err}`);
    // Ripristina backup
    if (tokensBackup) {
      await secureStorage.saveTokens(tokensBackup);
      console.log(`   ℹ️  Token backup ripristinati`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TEST COMPLETATI');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Summary
  const finalConfig = await secureStorage.getConfig();
  console.log('📊 RIEPILOGO FINALE\n');
  console.log(`   Encryption Key: ${finalConfig.keyExists ? '✅ Presente' : '❌ Mancante'}`);
  console.log(`   Key Storage: ${finalConfig.keyStorageMethod === 'keytar' ? '🔐 Native Vault' : '📄 File Fallback'}`);
  console.log(`   Credentials: ${finalConfig.credentialsExist ? '✅ Criptate' : '⏳ Non configurate'}`);
  console.log(`   OAuth Tokens: ${finalConfig.tokensExist ? '✅ Criptati' : '❌ Mancanti'}`);
  console.log('');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
