// src/index.ts

// DEVE restare il primo import: protegge stdout prima che qualunque altro
// modulo (dotenv incluso) possa scriverci sopra.
import './utils/stdio-guard.js';
import dotenv from 'dotenv';
import { runServer } from './mcp/server.js';
import { GarminConnectClient } from './garmin/client.js';
import { AuthManager } from './garmin/auth.js';

// Il .env viene caricato senza toccare GARMIN_EMAIL / GARMIN_PASSWORD: quelle
// due variabili identificano le credenziali configurate nell'estensione, che
// hanno priorità sul file. Il file viene letto al suo posto in graduatoria da
// utils/credentials.ts, che così può anche riportare la fonte corretta.
const dotEnvValues = dotenv.config({ processEnv: {} as NodeJS.ProcessEnv, quiet: true }).parsed ?? {};
for (const [key, value] of Object.entries(dotEnvValues)) {
  if (key === 'GARMIN_EMAIL' || key === 'GARMIN_PASSWORD') continue;
  if (process.env[key] === undefined) process.env[key] = value;
}

async function main(): Promise<void> {
  console.error('🚀 Starting Garmin MCP Server...');

  const garminClient = new GarminConnectClient();
  const auth = new AuthManager(garminClient);

  // Il transport MCP viene collegato PRIMA di qualsiasi operazione che possa
  // fallire. Se il server uscisse qui (credenziali mancanti, login rifiutato,
  // rete assente), il client vedrebbe solo "Server transport closed
  // unexpectedly" senza alcun messaggio utile.
  await runServer(auth);

  // Login opportunistico in background: se fallisce il server resta comunque
  // in ascolto e l'errore viene restituito, leggibile, alla prima chiamata.
  auth
    .ensureAuthenticated()
    .then(() => {
      console.error('✅ Authenticated with Garmin Connect');
    })
    .catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      console.error('⚠️  Garmin Connect not available yet:');
      console.error(message);
      console.error('');
      console.error('Il server MCP resta attivo: i tool restituiranno questo');
      console.error('messaggio finché le credenziali non saranno configurate.');
    });
}

// Gestisci i segnali di terminazione
process.on('SIGINT', () => {
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.exit(0);
});

main().catch((err: unknown) => {
  // Solo un fallimento del transport arriva qui: senza transport non c'è modo
  // di comunicare con il client, quindi uscire è l'unica opzione sensata.
  const message = err instanceof Error ? err.message : String(err);
  console.error('❌ Fatal error starting MCP server:', message);
  process.exit(1);
});
