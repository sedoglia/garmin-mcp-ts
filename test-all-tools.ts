// test-all-tools.ts
// Test completo di tutti i 18 tool MCP Garmin

import { GarminConnectClient } from './src/garmin/client.js';
import { ToolHandler } from './src/mcp/handlers.js';

// Le credenziali DEVONO essere passate via variabili d'ambiente
const EMAIL = process.env.GARMIN_EMAIL;
const PASSWORD = process.env.GARMIN_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error('❌ Errore: GARMIN_EMAIL e GARMIN_PASSWORD devono essere impostati come variabili d\'ambiente');
  console.error('   Esempio: GARMIN_EMAIL=email@example.com GARMIN_PASSWORD=password npx tsx test-all-tools.ts');
  process.exit(1);
}

interface TestResult {
  tool: string;
  status: 'PASS' | 'FAIL';
  duration: number;
  error?: string;
  dataPreview?: string;
}

async function runTests(): Promise<void> {
  console.error('\n' + '='.repeat(70));
  console.error('🧪 GARMIN MCP SERVER - TEST SUITE COMPLETA (18 Tool)');
  console.error('='.repeat(70) + '\n');

  const results: TestResult[] = [];
  let client: GarminConnectClient;
  let handler: ToolHandler;
  let activityId: number | null = null;

  // Test 1: Autenticazione
  console.error('📋 Test: Autenticazione Garmin Connect');
  const authStart = Date.now();
  try {
    client = new GarminConnectClient();
    await client.initialize(EMAIL, PASSWORD);
    const authDuration = Date.now() - authStart;
    console.error(`✅ PASS (${authDuration}ms)\n`);
    results.push({ tool: 'authentication', status: 'PASS', duration: authDuration });
  } catch (err: any) {
    const authDuration = Date.now() - authStart;
    console.error(`❌ FAIL: ${err.message}\n`);
    results.push({ tool: 'authentication', status: 'FAIL', duration: authDuration, error: err.message });
    console.error('\n⛔ Autenticazione fallita, impossibile continuare i test.\n');
    process.exit(1);
  }

  handler = new ToolHandler(client);

  // Ottieni la data di oggi in formato YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Definizione dei test per tutti i 13 tool
  const tests = [
    // ═══════════════════════════════════════════════════════════════
    // TOOL 1: list_recent_activities
    // ═══════════════════════════════════════════════════════════════
    { name: 'list_recent_activities', args: undefined, description: 'Lista attività (no params)' },
    { name: 'list_recent_activities', args: {}, description: 'Lista attività (empty object)' },
    { name: 'list_recent_activities', args: { limit: 5 }, description: 'Lista attività (limit=5)' },
    { name: 'list_recent_activities', args: { limit: 3, start: 0 }, description: 'Lista attività (limit=3, start=0)' },
    { name: 'list_recent_activities', args: { limit: '5' }, description: 'Lista attività (limit as string)' },

    // ═══════════════════════════════════════════════════════════════
    // TOOL 2: get_user_profile
    // ═══════════════════════════════════════════════════════════════
    { name: 'get_user_profile', args: undefined, description: 'Profilo utente' },
    { name: 'get_user_profile', args: {}, description: 'Profilo utente (empty object)' },

    // ═══════════════════════════════════════════════════════════════
    // TOOL 3: get_devices
    // ═══════════════════════════════════════════════════════════════
    { name: 'get_devices', args: undefined, description: 'Dispositivi' },
    { name: 'get_devices', args: {}, description: 'Dispositivi (empty object)' },

    // ═══════════════════════════════════════════════════════════════
    // TOOL 4: get_health_metrics
    // ═══════════════════════════════════════════════════════════════
    { name: 'get_health_metrics', args: undefined, description: 'Metriche salute (oggi)' },
    { name: 'get_health_metrics', args: {}, description: 'Metriche salute (empty object)' },
    { name: 'get_health_metrics', args: { date: yesterday }, description: `Metriche salute (${yesterday})` },

    // ═══════════════════════════════════════════════════════════════
    // TOOL 5: get_sleep_data
    // ═══════════════════════════════════════════════════════════════
    { name: 'get_sleep_data', args: undefined, description: 'Dati sonno (oggi)' },
    { name: 'get_sleep_data', args: {}, description: 'Dati sonno (empty object)' },
    { name: 'get_sleep_data', args: { date: yesterday }, description: `Dati sonno (${yesterday})` },

    // ═══════════════════════════════════════════════════════════════
    // TOOL 6: get_body_composition
    // ═══════════════════════════════════════════════════════════════
    { name: 'get_body_composition', args: undefined, description: 'Composizione corporea (default 30 days)' },
    { name: 'get_body_composition', args: {}, description: 'Composizione corporea (empty object)' },
    { name: 'get_body_composition', args: { days: 7 }, description: 'Composizione corporea (7 days)' },

    // ═══════════════════════════════════════════════════════════════
    // TOOL 7: get_training_status
    // ═══════════════════════════════════════════════════════════════
    { name: 'get_training_status', args: undefined, description: 'Stato allenamento (default)' },
    { name: 'get_training_status', args: {}, description: 'Stato allenamento (empty object)' },
    { name: 'get_training_status', args: { days: 14 }, description: 'Stato allenamento (14 days)' },

    // ═══════════════════════════════════════════════════════════════
    // TOOL 8: get_steps (NUOVO)
    // ═══════════════════════════════════════════════════════════════
    { name: 'get_steps', args: undefined, description: 'Passi (oggi)' },
    { name: 'get_steps', args: {}, description: 'Passi (empty object)' },
    { name: 'get_steps', args: { date: yesterday }, description: `Passi (${yesterday})` },

    // ═══════════════════════════════════════════════════════════════
    // TOOL 9: get_heart_rate (NUOVO)
    // ═══════════════════════════════════════════════════════════════
    { name: 'get_heart_rate', args: undefined, description: 'Frequenza cardiaca (oggi)' },
    { name: 'get_heart_rate', args: {}, description: 'Frequenza cardiaca (empty object)' },
    { name: 'get_heart_rate', args: { date: yesterday }, description: `Frequenza cardiaca (${yesterday})` },

    // ═══════════════════════════════════════════════════════════════
    // TOOL 10: get_hydration (NUOVO)
    // ═══════════════════════════════════════════════════════════════
    { name: 'get_hydration', args: undefined, description: 'Idratazione (oggi)' },
    { name: 'get_hydration', args: {}, description: 'Idratazione (empty object)' },
    { name: 'get_hydration', args: { date: yesterday }, description: `Idratazione (${yesterday})` },

    // ═══════════════════════════════════════════════════════════════
    // TOOL 11: get_workouts (NUOVO)
    // ═══════════════════════════════════════════════════════════════
    { name: 'get_workouts', args: undefined, description: 'Workouts pianificati (default)' },
    { name: 'get_workouts', args: {}, description: 'Workouts pianificati (empty object)' },
    { name: 'get_workouts', args: { limit: 5 }, description: 'Workouts pianificati (limit=5)' },

    // ═══════════════════════════════════════════════════════════════
    // TOOL 14: get_stress_data (NUOVO v1.2 - PRIORITÀ ALTA)
    // ═══════════════════════════════════════════════════════════════
    { name: 'get_stress_data', args: undefined, description: 'Stress (oggi)' },
    { name: 'get_stress_data', args: {}, description: 'Stress (empty object)' },
    { name: 'get_stress_data', args: { date: yesterday }, description: `Stress (${yesterday})` },

    // ═══════════════════════════════════════════════════════════════
    // TOOL 15: get_body_battery (NUOVO v1.2 - PRIORITÀ ALTA)
    // ═══════════════════════════════════════════════════════════════
    { name: 'get_body_battery', args: undefined, description: 'Body Battery (oggi)' },
    { name: 'get_body_battery', args: {}, description: 'Body Battery (empty object)' },
    { name: 'get_body_battery', args: { startDate: yesterday, endDate: today }, description: `Body Battery (${yesterday} - ${today})` },

    // ═══════════════════════════════════════════════════════════════
    // TOOL 16: get_hrv_data (NUOVO v1.2)
    // ═══════════════════════════════════════════════════════════════
    { name: 'get_hrv_data', args: undefined, description: 'HRV (oggi)' },
    { name: 'get_hrv_data', args: { date: yesterday }, description: `HRV (${yesterday})` },

    // ═══════════════════════════════════════════════════════════════
    // TOOL 17: get_respiration_data (NUOVO v1.2)
    // ═══════════════════════════════════════════════════════════════
    { name: 'get_respiration_data', args: undefined, description: 'Respirazione (oggi)' },
    { name: 'get_respiration_data', args: { date: yesterday }, description: `Respirazione (${yesterday})` },

    // ═══════════════════════════════════════════════════════════════
    // TOOL 18: get_spo2_data (NUOVO v1.2)
    // ═══════════════════════════════════════════════════════════════
    { name: 'get_spo2_data', args: undefined, description: 'SpO2 (oggi)' },
    { name: 'get_spo2_data', args: { date: yesterday }, description: `SpO2 (${yesterday})` },
  ];

  // Esegui ogni test
  for (const test of tests) {
    console.error(`📋 Test: ${test.description}`);
    console.error(`   Tool: ${test.name}`);
    console.error(`   Args: ${JSON.stringify(test.args)}`);

    const start = Date.now();
    try {
      const result = await handler.handle(test.name, test.args as any);
      const duration = Date.now() - start;

      const resultStr = JSON.stringify(result);
      const preview = resultStr.length > 150 ? resultStr.substring(0, 150) + '...' : resultStr;

      console.error(`✅ PASS (${duration}ms)`);
      console.error(`   Response: ${preview}\n`);

      // Salva l'activityId dalla prima attività trovata per i test successivi
      if (test.name === 'list_recent_activities' && !activityId) {
        const data = (result as any)?.data;
        if (Array.isArray(data) && data.length > 0 && data[0].activityId) {
          activityId = data[0].activityId;
          console.error(`   📌 ActivityId salvato per test successivi: ${activityId}\n`);
        }
      }

      results.push({
        tool: `${test.name}${test.args ? ` (${JSON.stringify(test.args)})` : ''}`,
        status: 'PASS',
        duration,
        dataPreview: preview,
      });
    } catch (err: any) {
      const duration = Date.now() - start;
      console.error(`❌ FAIL (${duration}ms): ${err.message}\n`);
      results.push({
        tool: `${test.name}${test.args ? ` (${JSON.stringify(test.args)})` : ''}`,
        status: 'FAIL',
        duration,
        error: err.message,
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // TOOL 12 & 13: Test che richiedono activityId
  // ═══════════════════════════════════════════════════════════════
  if (activityId) {
    const activityTests = [
      // TOOL 12: get_activity_details
      { name: 'get_activity_details', args: { activityId }, description: `Dettagli attività (ID: ${activityId})` },

      // TOOL 13: get_activity_splits (NUOVO)
      { name: 'get_activity_splits', args: { activityId }, description: `Splits attività (ID: ${activityId})` },
    ];

    for (const test of activityTests) {
      console.error(`📋 Test: ${test.description}`);
      console.error(`   Tool: ${test.name}`);
      console.error(`   Args: ${JSON.stringify(test.args)}`);

      const start = Date.now();
      try {
        const result = await handler.handle(test.name, test.args as any);
        const duration = Date.now() - start;

        const resultStr = JSON.stringify(result);
        const preview = resultStr.length > 150 ? resultStr.substring(0, 150) + '...' : resultStr;

        console.error(`✅ PASS (${duration}ms)`);
        console.error(`   Response: ${preview}\n`);

        results.push({
          tool: `${test.name}`,
          status: 'PASS',
          duration,
          dataPreview: preview,
        });
      } catch (err: any) {
        const duration = Date.now() - start;
        console.error(`❌ FAIL (${duration}ms): ${err.message}\n`);
        results.push({
          tool: `${test.name}`,
          status: 'FAIL',
          duration,
          error: err.message,
        });
      }
    }

    // Test errore: activityId mancante
    console.error(`📋 Test: get_activity_details senza activityId (deve fallire)`);
    const start = Date.now();
    try {
      await handler.handle('get_activity_details', {});
      const duration = Date.now() - start;
      console.error(`❌ FAIL (${duration}ms): Avrebbe dovuto generare un errore\n`);
      results.push({
        tool: 'get_activity_details (no activityId - should fail)',
        status: 'FAIL',
        duration,
        error: 'Expected error but got success',
      });
    } catch (err: any) {
      const duration = Date.now() - start;
      if (err.message.includes('activityId') || err.message.includes('required')) {
        console.error(`✅ PASS (${duration}ms): Errore atteso ricevuto\n`);
        results.push({
          tool: 'get_activity_details (no activityId - should fail)',
          status: 'PASS',
          duration,
        });
      } else {
        console.error(`❌ FAIL (${duration}ms): Errore inatteso: ${err.message}\n`);
        results.push({
          tool: 'get_activity_details (no activityId - should fail)',
          status: 'FAIL',
          duration,
          error: err.message,
        });
      }
    }
  } else {
    console.error('⚠️  Nessuna attività trovata, skip test get_activity_details e get_activity_splits\n');
  }

  // Sommario
  console.error('\n' + '='.repeat(70));
  console.error('📊 SOMMARIO RISULTATI TEST');
  console.error('='.repeat(70));

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const totalTime = results.reduce((sum, r) => sum + r.duration, 0);

  console.error(`\n✅ Passati: ${passed}`);
  console.error(`❌ Falliti: ${failed}`);
  console.error(`📊 Totale:  ${passed + failed}`);
  console.error(`⏱️  Tempo totale: ${(totalTime / 1000).toFixed(2)}s`);

  if (failed > 0) {
    console.error('\n❌ TEST FALLITI:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.error(`   - ${r.tool}: ${r.error}`);
    });
  }

  // Lista dei tool testati
  const uniqueTools = new Set(results.map(r => r.tool.split(' ')[0]));
  console.error(`\n📋 Tool testati: ${uniqueTools.size}`);
  console.error('   ' + Array.from(uniqueTools).join(', '));

  console.error('\n' + '='.repeat(70) + '\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Errore fatale:', err);
  process.exit(1);
});
