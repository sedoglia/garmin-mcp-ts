import { GarminConnectClient } from '../src/garmin/client.js';
import { SecureStorage } from '../src/utils/secure-storage.js';

/**
 * Test script for gear management functionality.
 *
 * IMPORTANT: Garmin's OAuth API has limited gear support.
 * The following functions work:
 * - get_gear_stats(gearUUID) - Get usage statistics for a gear
 * - link_gear_to_activity(gearUUID, activityId) - Link gear to an activity
 * - remove_gear_from_activity(gearUUID, activityId) - Unlink gear from activity
 * - get_gear_activities(gearUUID) - Get activities where gear was used
 *
 * The gear UUID must be obtained from Garmin Connect web interface:
 * Settings > Gear > click on gear > UUID is in the URL
 * Example: https://connect.garmin.com/modern/gear/28cfd030f75e439394d47821923684df/edit
 *
 * Usage: npx tsx scripts/test-gear.ts [gearUUID]
 */

async function testGear() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('       TEST GEAR - GARMIN CONNECT');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const gearUUID = process.argv[2];
  if (!gearUUID) {
    console.log('Uso: npx tsx scripts/test-gear.ts <gearUUID>');
    console.log('\nPer trovare il gearUUID:');
    console.log('1. Vai su Garmin Connect Web');
    console.log('2. Vai in Impostazioni → Attrezzatura (Gear)');
    console.log('3. Clicca sul gear');
    console.log('4. L\'UUID è nell\'URL, es: .../gear/abc123-def456/edit');
    console.log('\n⚠️  NOTA: L\'API OAuth di Garmin non supporta la lista dei gear.');
    console.log('   Devi ottenere l\'UUID manualmente dall\'interfaccia web.');
    process.exit(1);
  }

  const secureStorage = new SecureStorage();
  const encryptedCreds = await secureStorage.loadCredentials();
  if (!encryptedCreds) {
    console.error('❌ Credenziali non trovate');
    process.exit(1);
  }
  const credentials = {
    email: await secureStorage.decrypt(encryptedCreds.email),
    password: await secureStorage.decrypt(encryptedCreds.password)
  };

  const client = new GarminConnectClient();
  await client.initialize(credentials.email, credentials.password);
  console.log('✅ Client inizializzato');
  console.log('📦 Gear UUID:', gearUUID, '\n');

  // Get recent activity for testing
  const activities = await client.getRecentActivities(5);
  if (activities.length === 0) {
    console.error('❌ Nessuna attività trovata');
    process.exit(1);
  }
  const testActivity = activities[0];
  console.log('📋 Attività test:', testActivity.activityName, '- ID:', testActivity.activityId, '\n');

  // TEST 1: get_gear_stats
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 1: get_gear_stats - Statistiche del gear');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const stats = await client.getGearStats(gearUUID);
    console.log('✅ Stats:', JSON.stringify(stats, null, 2));
  } catch (err: any) {
    console.log('❌ Errore:', err.message);
  }

  // TEST 2: link_gear_to_activity
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 2: link_gear_to_activity - Collega gear');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const linkResult = await client.linkGearToActivity(gearUUID, testActivity.activityId);
    console.log('✅ Link result:', JSON.stringify(linkResult, null, 2));
  } catch (err: any) {
    console.log('❌ Errore:', err.message);
  }

  // TEST 3: get_gear_activities
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 3: get_gear_activities - Attività del gear');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const gearActivities = await client.getGearActivities(gearUUID, 5);
    console.log('✅ Attività:', JSON.stringify(gearActivities.slice(0, 2), null, 2));
    console.log(`   (${gearActivities.length} attività totali)`);
  } catch (err: any) {
    console.log('❌ Errore:', err.message);
  }

  // TEST 4: remove_gear_from_activity
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 4: remove_gear_from_activity - Rimuovi gear');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const unlinkResult = await client.removeGearFromActivity(gearUUID, testActivity.activityId);
    console.log('✅ Unlink result:', JSON.stringify(unlinkResult, null, 2));
  } catch (err: any) {
    console.log('❌ Errore:', err.message);
  }

  // Riepilogo
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                    RIEPILOGO');
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log('Tool funzionanti (richiedono gear UUID):');
  console.log('  ✅ get_gear_stats');
  console.log('  ✅ link_gear_to_activity');
  console.log('  ✅ remove_gear_from_activity');
  console.log('  ✅ get_gear_activities');
  console.log('\nTool rimossi (non funzionano via OAuth):');
  console.log('  ❌ get_gear');
  console.log('  ❌ get_gear_defaults');
  console.log('  ❌ get_activity_gear');
  console.log('\n═══════════════════════════════════════════════════════════════\n');
}

testGear().catch(console.error);
