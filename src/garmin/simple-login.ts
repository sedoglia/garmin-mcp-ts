// src/garmin/simple-login.ts
// Login semplice con email/password

import 'dotenv/config';
import { GarminConnectClient } from './client.js';

async function testLogin(): Promise<void> {
  const email = process.env.GARMIN_EMAIL;
  const password = process.env.GARMIN_PASSWORD;

  if (!email || !password) {
    console.error('❌ Errore: GARMIN_EMAIL e GARMIN_PASSWORD devono essere impostati in .env');
    console.error('\nCrea un file .env con:');
    console.error('GARMIN_EMAIL=your.email@garmin.com');
    console.error('GARMIN_PASSWORD=your.password');
    process.exit(1);
  }

  console.log('\n🚀 Garmin Connect - Simple Login');
  console.log('=================================\n');

  try {
    const client = new GarminConnectClient();
    await client.initialize(email, password);

    console.log('✅ Login completato con successo!');
    console.log('\nPuoi avviare il server MCP con: npm run start\n');
  } catch (error) {
    console.error('❌ Errore durante il login:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

testLogin();
