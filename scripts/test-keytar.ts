/**
 * Test script for keytar (native vault) integration
 * This script tests the migration from file-based key storage to Windows Credential Manager
 */

import { secureStorage } from '../src/utils/secure-storage';
import { GarminConnectClient } from '../src/garmin/client';
import * as fs from 'fs';
import * as path from 'path';

const DIVIDER = '═'.repeat(65);
const SECTION = '─'.repeat(50);

async function main() {
  console.log(`\n${DIVIDER}`);
  console.log('TEST KEYTAR (NATIVE VAULT) INTEGRATION');
  console.log(`${DIVIDER}\n`);

  // ─────────────────────────────────────────────────────────────
  // TEST 1: Check initial configuration
  // ─────────────────────────────────────────────────────────────
  console.log(`📋 TEST 1: Initial Configuration\n`);

  let config = await secureStorage.getConfig();

  console.log(`   Platform: ${config.platform}`);
  console.log(`   Data Directory: ${config.dataDir}`);
  console.log(`   Keytar Available: ${config.keytarAvailable ? '✅ Yes' : '❌ No'}`);
  console.log(`   Key Storage Method: ${config.keyStorageMethod}`);
  console.log(`   Key Exists: ${config.keyExists ? '✅ Yes' : '❌ No'}`);
  console.log(`   Tokens Exist: ${config.tokensExist ? '✅ Yes' : '❌ No'}`);

  if (!config.keytarAvailable) {
    console.log(`\n❌ KEYTAR NOT AVAILABLE - Cannot proceed with tests`);
    console.log(`   Install keytar: npm install keytar`);
    process.exit(1);
  }

  // ─────────────────────────────────────────────────────────────
  // TEST 2: Migrate key to vault (if using file fallback)
  // ─────────────────────────────────────────────────────────────
  console.log(`\n${SECTION}`);
  console.log(`📋 TEST 2: Migrate Key to Native Vault\n`);

  if (config.keyStorageMethod === 'file-fallback') {
    console.log(`   Current storage: File Fallback`);
    console.log(`   Attempting migration to Windows Credential Manager...`);

    const migrated = await secureStorage.migrateKeyToVault();

    if (migrated) {
      console.log(`   ✅ Migration successful!`);

      // Reset and reinitialize to verify
      secureStorage.resetInitialization();
      config = await secureStorage.getConfig();

      console.log(`   New key storage method: ${config.keyStorageMethod}`);
    } else {
      console.log(`   ❌ Migration failed`);
    }
  } else {
    console.log(`   ✅ Key already in native vault`);
  }

  // ─────────────────────────────────────────────────────────────
  // TEST 3: Verify key is loaded from vault
  // ─────────────────────────────────────────────────────────────
  console.log(`\n${SECTION}`);
  console.log(`📋 TEST 3: Verify Key Loading from Vault\n`);

  // Reset and reinitialize
  secureStorage.resetInitialization();

  // Get fresh config
  config = await secureStorage.getConfig();

  console.log(`   Key Storage Method: ${config.keyStorageMethod}`);
  console.log(`   Key Loaded: ${config.keyExists ? '✅ Yes' : '❌ No'}`);

  if (config.keyStorageMethod === 'keytar') {
    console.log(`   ✅ Key successfully loaded from Windows Credential Manager`);
  } else {
    console.log(`   ⚠️  Key still loaded from file fallback`);
  }

  // ─────────────────────────────────────────────────────────────
  // TEST 4: Test token decryption with vault key
  // ─────────────────────────────────────────────────────────────
  console.log(`\n${SECTION}`);
  console.log(`📋 TEST 4: Token Decryption with Vault Key\n`);

  const tokens = await secureStorage.loadTokens();

  if (tokens) {
    console.log(`   ✅ Tokens decrypted successfully with vault key`);
    console.log(`   Has oauth1: ${tokens.oauth1 ? '✅' : '❌'}`);
    console.log(`   Has oauth2: ${tokens.oauth2 ? '✅' : '❌'}`);
    console.log(`   Saved at: ${tokens.savedAt || 'unknown'}`);

    if (tokens.oauth2?.expires_at) {
      const expiresAt = new Date(tokens.oauth2.expires_at);
      const now = new Date();
      const hoursRemaining = Math.round((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60));
      console.log(`   Token expires in: ~${hoursRemaining} hours`);
    }
  } else {
    console.log(`   ⚠️  No tokens found or decryption failed`);
  }

  // ─────────────────────────────────────────────────────────────
  // TEST 5: Full authentication test with vault key
  // ─────────────────────────────────────────────────────────────
  console.log(`\n${SECTION}`);
  console.log(`📋 TEST 5: Full Authentication with Vault Key\n`);

  const email = process.env.GARMIN_EMAIL;
  const password = process.env.GARMIN_PASSWORD;

  if (!email || !password) {
    console.log(`   ⚠️  Credentials not found in environment`);
    console.log(`   Set GARMIN_EMAIL and GARMIN_PASSWORD to test authentication`);
  } else {
    try {
      const startTime = Date.now();
      const client = new GarminConnectClient();
      await client.initialize(email, password);
      const elapsed = Date.now() - startTime;

      console.log(`   ✅ Authentication successful in ${elapsed}ms`);

      if (elapsed < 1000) {
        console.log(`   ✅ Token reuse detected (fast auth)`);
      } else {
        console.log(`   ℹ️  Full login performed`);
      }

      // Test API call
      const profile = await client.getUserProfile();
      console.log(`   ✅ API call successful`);
      console.log(`   Display Name: ${profile?.displayName || 'N/A'}`);

    } catch (err: any) {
      console.log(`   ❌ Authentication failed: ${err.message}`);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // TEST 6: New token save/load cycle
  // ─────────────────────────────────────────────────────────────
  console.log(`\n${SECTION}`);
  console.log(`📋 TEST 6: Token Save/Load Cycle with Vault Key\n`);

  // Save a test token
  const testTokens = {
    oauth1: { test: 'oauth1_data' },
    oauth2: { test: 'oauth2_data', expires_at: Date.now() + 86400000 }
  };

  await secureStorage.saveTokens(testTokens);
  console.log(`   ✅ Test tokens saved`);

  // Reset and reload
  secureStorage.resetInitialization();

  const loadedTokens = await secureStorage.loadTokens();

  if (loadedTokens && loadedTokens.oauth1?.test === 'oauth1_data') {
    console.log(`   ✅ Test tokens loaded and verified`);
  } else {
    console.log(`   ❌ Token load/verify failed`);
  }

  // Restore real tokens if we had them
  if (tokens) {
    await secureStorage.saveTokens(tokens);
    console.log(`   ✅ Original tokens restored`);
  }

  // ─────────────────────────────────────────────────────────────
  // Final Summary
  // ─────────────────────────────────────────────────────────────
  console.log(`\n${DIVIDER}`);
  console.log('TEST SUMMARY');
  console.log(`${DIVIDER}\n`);

  // Get final config
  secureStorage.resetInitialization();
  config = await secureStorage.getConfig();

  console.log(`📊 Final Configuration:`);
  console.log(`   Key Storage: ${config.keyStorageMethod === 'keytar' ? '🔐 Windows Credential Manager' : '📄 File Fallback'}`);
  console.log(`   Keytar Available: ${config.keytarAvailable ? '✅ Yes' : '❌ No'}`);
  console.log(`   Key Exists: ${config.keyExists ? '✅ Yes' : '❌ No'}`);
  console.log(`   Tokens Encrypted: ${config.tokensExist ? '✅ Yes' : '❌ No'}`);

  // Check if fallback file was removed
  const fallbackKeyPath = path.join(config.dataDir, '.encryption.key');
  const fallbackExists = fs.existsSync(fallbackKeyPath);
  console.log(`   Fallback Key File: ${fallbackExists ? '⚠️  Still exists' : '✅ Removed'}`);

  console.log(`\n✅ All keytar tests completed!\n`);
}

main().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
