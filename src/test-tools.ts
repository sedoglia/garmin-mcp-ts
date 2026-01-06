// src/test-tools.ts
// Test script for all v2.0 tools with real Garmin data

import { GarminConnectClient } from './garmin/client.js';
import { ToolHandler } from './mcp/handlers.js';
import { secureStorage } from './utils/secure-storage.js';
import dotenv from 'dotenv';

dotenv.config();

interface TestResult {
  tool: string;
  success: boolean;
  duration: number;
  result?: any;
  error?: string;
}

const results: TestResult[] = [];

async function testTool(
  handler: ToolHandler,
  toolName: string,
  args: Record<string, unknown> = {}
): Promise<TestResult> {
  const start = Date.now();
  try {
    const result = await handler.handle(toolName, args);
    const duration = Date.now() - start;
    console.log(`✅ ${toolName} - ${duration}ms`);
    return { tool: toolName, success: true, duration, result };
  } catch (err) {
    const duration = Date.now() - start;
    const error = err instanceof Error ? err.message : String(err);
    console.log(`❌ ${toolName} - ${error}`);
    return { tool: toolName, success: false, duration, error };
  }
}

/**
 * Load credentials from multiple sources in priority order:
 * 1. Environment variables
 * 2. Encrypted secure storage
 * 3. .env file (already loaded by dotenv)
 */
async function loadCredentials(): Promise<{ email: string; password: string } | null> {
  // Try environment variables first
  if (process.env.GARMIN_EMAIL && process.env.GARMIN_PASSWORD) {
    return {
      email: process.env.GARMIN_EMAIL,
      password: process.env.GARMIN_PASSWORD
    };
  }

  // Try encrypted secure storage
  try {
    const encrypted = await secureStorage.loadCredentials();
    if (encrypted?.email && encrypted?.password) {
      console.log('📦 Using credentials from encrypted secure storage');
      return encrypted;
    }
  } catch {
    // Continue to next source
  }

  return null;
}

async function main() {
  const credentials = await loadCredentials();

  if (!credentials) {
    console.error('❌ No credentials found. Please either:');
    console.error('   1. Run: npm run setup-encryption (recommended)');
    console.error('   2. Set GARMIN_EMAIL and GARMIN_PASSWORD environment variables');
    console.error('   3. Create a .env file with GARMIN_EMAIL and GARMIN_PASSWORD');
    process.exit(1);
  }

  console.log('🔐 Connecting to Garmin Connect...\n');

  const client = new GarminConnectClient();
  await client.initialize(credentials.email, credentials.password);

  const handler = new ToolHandler(client);
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const lastMonth = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('TESTING v1.x TOOLS (existing)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // v1.x tools
  results.push(await testTool(handler, 'list_recent_activities', { limit: 5 }));
  results.push(await testTool(handler, 'get_user_profile'));
  results.push(await testTool(handler, 'get_devices'));
  results.push(await testTool(handler, 'get_training_status', { days: 7 }));
  results.push(await testTool(handler, 'get_health_metrics', { date: today }));
  results.push(await testTool(handler, 'get_sleep_data', { date: yesterday }));
  results.push(await testTool(handler, 'get_body_composition', { days: 30 }));
  results.push(await testTool(handler, 'get_steps', { date: today }));
  results.push(await testTool(handler, 'get_heart_rate', { date: today }));
  results.push(await testTool(handler, 'get_hydration', { date: today }));
  results.push(await testTool(handler, 'get_workouts', { limit: 5 }));

  // Get an activity ID for detail tests
  const activitiesResult = results.find(r => r.tool === 'list_recent_activities');
  let activityId: number | undefined;
  if (activitiesResult?.success && activitiesResult.result?.data?.length > 0) {
    activityId = activitiesResult.result.data[0].activityId;
    console.log(`\n📍 Using activity ID: ${activityId} for detail tests\n`);
    results.push(await testTool(handler, 'get_activity_details', { activityId }));
    results.push(await testTool(handler, 'get_activity_splits', { activityId }));
  }

  // v1.2 wellness tools
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TESTING v1.2 WELLNESS TOOLS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  results.push(await testTool(handler, 'get_stress_data', { date: today }));
  results.push(await testTool(handler, 'get_body_battery', { startDate: yesterday, endDate: today }));
  results.push(await testTool(handler, 'get_hrv_data', { date: yesterday }));
  results.push(await testTool(handler, 'get_respiration_data', { date: yesterday }));
  results.push(await testTool(handler, 'get_spo2_data', { date: yesterday }));

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TESTING v2.0 NEW TOOLS - PRIORITY 1: WORKOUT MANAGEMENT');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // First get existing workouts
  const workoutsResult = await testTool(handler, 'get_workouts', { limit: 5 });
  results.push(workoutsResult);

  let workoutId: string | undefined;
  if (workoutsResult.success && workoutsResult.result?.data?.length > 0) {
    workoutId = String(workoutsResult.result.data[0].workoutId);
    console.log(`\n📍 Using workout ID: ${workoutId} for detail tests\n`);
    results.push(await testTool(handler, 'get_workout_by_id', { workoutId }));
    results.push(await testTool(handler, 'download_workout', { workoutId }));
  }

  // Test create_workout (creates a test workout)
  console.log('\n🏃 Testing workout creation...');
  const createResult = await testTool(handler, 'create_workout', {
    workoutName: 'MCP Test Workout - DELETE ME',
    sportType: 'running',
    description: 'Test workout created by MCP test script',
    workoutSegments: [{
      segmentOrder: 1,
      sportType: 'running',
      workoutSteps: [
        { stepOrder: 1, stepType: 'warmup', endCondition: 'time', endConditionValue: 300 },
        { stepOrder: 2, stepType: 'interval', endCondition: 'time', endConditionValue: 180 },
        { stepOrder: 3, stepType: 'recovery', endCondition: 'time', endConditionValue: 120 },
        { stepOrder: 4, stepType: 'cooldown', endCondition: 'time', endConditionValue: 300 },
      ],
    }],
  });
  results.push(createResult);

  // If created, test update and schedule, then delete
  if (createResult.success && createResult.result?.data?.workoutId) {
    const newWorkoutId = String(createResult.result.data.workoutId);
    console.log(`\n📍 Created workout ID: ${newWorkoutId}\n`);

    results.push(await testTool(handler, 'update_workout', {
      workoutId: newWorkoutId,
      workoutName: 'MCP Test Workout UPDATED',
      description: 'Updated description',
    }));

    // Schedule for next week
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    const scheduleResult = await testTool(handler, 'schedule_workout', {
      workoutId: newWorkoutId,
      date: nextWeek,
    });
    results.push(scheduleResult);

    // IMPORTANT: Unschedule before deleting to avoid ghost scheduled workouts
    if (scheduleResult.success && scheduleResult.result?.data?.workoutScheduleId) {
      const scheduleId = String(scheduleResult.result.data.workoutScheduleId);
      console.log(`\n📍 Unscheduling workout (scheduleId: ${scheduleId})...\n`);
      results.push(await testTool(handler, 'unschedule_workout', { scheduleId }));
    }

    // Delete the test workout
    results.push(await testTool(handler, 'delete_workout', { workoutId: newWorkoutId }));
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TESTING v2.0 NEW TOOLS - PRIORITY 2: ACTIVITY MANAGEMENT');
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (activityId) {
    results.push(await testTool(handler, 'download_activity', { activityId, format: 'tcx' }));
    results.push(await testTool(handler, 'get_activity_weather', { activityId }));
    results.push(await testTool(handler, 'get_activity_hr_zones', { activityId }));
    results.push(await testTool(handler, 'get_activity_exercise_sets', { activityId }));
  }

  // Skip create_manual_activity, upload_activity, set_activity_name, set_activity_type, delete_activity
  // as they modify data
  console.log('⚠️  Skipping activity modification tools (create, upload, set, delete) to preserve data');

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TESTING v2.0 NEW TOOLS - DEVICE & SETTINGS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  results.push(await testTool(handler, 'get_device_last_used'));

  // Get device ID from last used device
  const lastUsedDevice = results.find(r => r.tool === 'get_device_last_used');
  if (lastUsedDevice?.success && lastUsedDevice.result?.data?.deviceId) {
    const deviceId = String(lastUsedDevice.result.data.deviceId);
    results.push(await testTool(handler, 'get_device_settings', { deviceId }));
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TESTING v2.0 NEW TOOLS - HEALTH & WELLNESS ADVANCED');
  console.log('═══════════════════════════════════════════════════════════════\n');

  results.push(await testTool(handler, 'get_all_day_stress', { date: today }));
  results.push(await testTool(handler, 'get_floors', { date: today }));
  results.push(await testTool(handler, 'get_intensity_minutes', { date: today }));
  results.push(await testTool(handler, 'get_max_metrics', { date: today }));
  results.push(await testTool(handler, 'get_training_readiness', { date: today }));
  results.push(await testTool(handler, 'get_endurance_score', { date: today }));
  results.push(await testTool(handler, 'get_fitness_age', { date: today }));
  results.push(await testTool(handler, 'get_daily_summary', { date: today }));

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TESTING v2.0 NEW TOOLS - WEIGHT & BODY');
  console.log('═══════════════════════════════════════════════════════════════\n');

  results.push(await testTool(handler, 'get_weigh_ins', { startDate: lastMonth, endDate: today }));
  results.push(await testTool(handler, 'get_blood_pressure', { startDate: lastMonth, endDate: today }));

  // Skip add_weigh_in, delete_weigh_in, set_blood_pressure to preserve data
  console.log('⚠️  Skipping weight/BP modification tools to preserve data');

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TESTING v2.0 NEW TOOLS - GOALS, CHALLENGES & RECORDS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  results.push(await testTool(handler, 'get_goals', { status: 'active' }));
  results.push(await testTool(handler, 'get_adhoc_challenges'));
  results.push(await testTool(handler, 'get_badge_challenges'));
  results.push(await testTool(handler, 'get_earned_badges'));
  results.push(await testTool(handler, 'get_personal_records'));
  results.push(await testTool(handler, 'get_race_predictions'));

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TESTING v2.0 NEW TOOLS - GEAR MANAGEMENT');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Note: get_gear and get_gear_defaults were removed - OAuth API doesn't support listing gear
  // Gear tools require UUID from Garmin Connect web interface
  console.log('⚠️  Gear listing tools (get_gear, get_gear_defaults) not available via OAuth API');
  console.log('⚠️  To test gear tools, provide gearUUID from Garmin Connect web interface');
  console.log('⚠️  Skipping link_gear_to_activity, get_gear_stats, get_gear_activities (require gearUUID)');

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TESTING v2.0 NEW TOOLS - REPORTS & PROGRESS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  results.push(await testTool(handler, 'get_progress_summary', {
    startDate: lastMonth,
    endDate: today,
    metric: 'distance',
  }));

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TESTING v3.0 NEW TOOLS - FROM PYTHON API');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // User & Activity Summary
  results.push(await testTool(handler, 'get_user_summary', { date: today }));
  results.push(await testTool(handler, 'get_steps_data', { date: today }));
  // Note: get_daily_steps has a 28-day limit
  const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0];
  results.push(await testTool(handler, 'get_daily_steps', { startDate: twoWeeksAgo, endDate: today }));
  results.push(await testTool(handler, 'get_activities_by_date', { startDate: lastMonth, endDate: today }));

  // Activity typed splits (using activityId if available)
  if (activityId) {
    results.push(await testTool(handler, 'get_activity_typed_splits', { activityId }));
  }

  // Health metrics
  results.push(await testTool(handler, 'get_rhr_day', { date: today }));
  results.push(await testTool(handler, 'get_hill_score', { startDate: lastMonth, endDate: today }));
  results.push(await testTool(handler, 'get_all_day_events', { date: today }));
  results.push(await testTool(handler, 'get_body_battery_events', { date: today }));

  // Badges & Challenges
  results.push(await testTool(handler, 'get_available_badges'));
  results.push(await testTool(handler, 'get_in_progress_badges'));
  results.push(await testTool(handler, 'get_available_badge_challenges'));
  results.push(await testTool(handler, 'get_non_completed_badge_challenges'));
  results.push(await testTool(handler, 'get_in_progress_virtual_challenges'));

  // Gear activities - skipped (requires gearUUID from web interface)
  // results.push(await testTool(handler, 'get_gear_activities', { gearUUID }));

  // Training plans
  results.push(await testTool(handler, 'get_training_plans', { locale: 'it-IT' }));

  // Menstrual & Pregnancy (may return empty for male users)
  results.push(await testTool(handler, 'get_menstrual_data', { date: today }));
  results.push(await testTool(handler, 'get_pregnancy_summary'));

  // Utility tools
  results.push(await testTool(handler, 'get_activity_types'));
  results.push(await testTool(handler, 'get_primary_training_device'));
  results.push(await testTool(handler, 'count_activities'));
  results.push(await testTool(handler, 'get_fitness_stats', { startDate: lastMonth, endDate: today }));

  // Skip add_hydration_data, remove_gear_from_activity to preserve data
  console.log('⚠️  Skipping modification tools (add_hydration_data, remove_gear_from_activity) to preserve data');

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TESTING v4.0 NEW TOOLS - GEAR MANAGEMENT COMPLETE (UUID SOLVED!)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // THE BIG ONE: get_all_gear - finally solves the UUID problem!
  const getAllGearResult = await testTool(handler, 'get_all_gear');
  results.push(getAllGearResult);

  let gearUUID: string | undefined;
  if (getAllGearResult.success && getAllGearResult.result?.data?.gear?.length > 0) {
    gearUUID = getAllGearResult.result.data.gear[0].uuid;
    console.log(`\n📍 Found gear UUID: ${gearUUID} for detail tests\n`);

    // Now we can test gear stats with discovered UUID
    results.push(await testTool(handler, 'get_gear_stats', { gearUUID }));
    results.push(await testTool(handler, 'get_gear_activities', { gearUUID, limit: 5 }));
  }

  // Test create, update, delete gear
  console.log('\n🔧 Testing gear CRUD operations...');
  const createGearResult = await testTool(handler, 'create_gear', {
    gearTypePk: 1, // Running shoes
    displayName: 'MCP Test Shoes - DELETE ME',
    modelName: 'Test Model',
    brandName: 'Test Brand',
  });
  results.push(createGearResult);

  if (createGearResult.success && createGearResult.result?.data?.gearUUID) {
    const newGearUUID = createGearResult.result.data.gearUUID;
    console.log(`\n📍 Created gear UUID: ${newGearUUID}\n`);

    // Test update
    results.push(await testTool(handler, 'update_gear', {
      gearUUID: newGearUUID,
      displayName: 'MCP Test Shoes UPDATED',
      maximumMeter: 500000,
    }));

    // Test delete
    results.push(await testTool(handler, 'delete_gear', { gearUUID: newGearUUID }));
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TESTING v4.0 NEW TOOLS - SOCIAL FEATURES');
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (activityId) {
    // Get comments
    results.push(await testTool(handler, 'get_activity_comments', { activityId }));

    // REMOVED: add_activity_comment - Not supported by Garmin OAuth API
    console.log('⚠️  add_activity_comment removed - not supported by Garmin OAuth API');

    // Test privacy - cycle through public/private to verify it works
    console.log('🔒 Testing set_activity_privacy (public/private only)...');
    const privacyTest1 = await testTool(handler, 'set_activity_privacy', {
      activityId,
      privacy: 'private',
    });
    results.push(privacyTest1);

    // Wait a moment then set back to public to restore original state
    await new Promise(resolve => setTimeout(resolve, 1000));
    const privacyTest2 = await testTool(handler, 'set_activity_privacy', {
      activityId,
      privacy: 'public',
    });
    results.push(privacyTest2);
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TESTING v4.0 NEW TOOLS - ADVANCED TRAINING METRICS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  results.push(await testTool(handler, 'get_training_load', { startDate: lastMonth, endDate: today }));
  results.push(await testTool(handler, 'get_load_ratio', { date: today }));
  results.push(await testTool(handler, 'get_performance_condition', { date: today }));

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TESTING v4.0 NEW TOOLS - ADVANCED SLEEP & DEVICE');
  console.log('═══════════════════════════════════════════════════════════════\n');

  results.push(await testTool(handler, 'get_sleep_movement', { date: yesterday }));

  // Get device alarms (requires deviceId)
  const devicesResult = results.find(r => r.tool === 'get_devices');
  if (devicesResult?.success && devicesResult.result?.data?.settings) {
    // Try to extract device ID from settings
    console.log('⚠️  Note: get_device_alarms requires a valid deviceId from your Garmin device');
    // Skip for now as we don't have an easy way to get the correct deviceId
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TESTING v4.0 NEW TOOLS - COURSES & ANALYSIS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  results.push(await testTool(handler, 'get_courses', { start: 0, limit: 10 }));

  // Analysis tools require multiple activities
  if (activityId && activitiesResult && activitiesResult.result?.data?.length >= 2) {
    const activityIds = activitiesResult.result.data
      .slice(0, 3)
      .map((a: any) => a.activityId);

    console.log(`\n📊 Comparing ${activityIds.length} activities...\n`);
    results.push(await testTool(handler, 'compare_activities', { activityIds }));

    console.log(`\n🔍 Finding similar activities to ${activityId}...\n`);
    results.push(await testTool(handler, 'find_similar_activities', { activityId, limit: 5 }));
  }

  console.log(`\n📈 Analyzing training period ${lastMonth} to ${today}...\n`);
  results.push(await testTool(handler, 'analyze_training_period', {
    startDate: lastMonth,
    endDate: today,
  }));

  // ═══════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TEST RESULTS SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const total = results.length;

  console.log(`Total tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success rate: ${((passed / total) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n❌ FAILED TOOLS:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.tool}: ${r.error}`);
    });
  }

  console.log('\n✅ SUCCESSFUL TOOLS:');
  results.filter(r => r.success).forEach(r => {
    console.log(`  - ${r.tool} (${r.duration}ms)`);
  });
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
