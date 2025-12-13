// src/test-tools.ts
// Test script for all v2.0 tools with real Garmin data

import { GarminConnectClient } from './garmin/client.js';
import { ToolHandler } from './mcp/handlers.js';
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

async function main() {
  const email = process.env.GARMIN_EMAIL;
  const password = process.env.GARMIN_PASSWORD;

  if (!email || !password) {
    console.error('❌ Missing GARMIN_EMAIL or GARMIN_PASSWORD in environment');
    process.exit(1);
  }

  console.log('🔐 Connecting to Garmin Connect...\n');

  const client = new GarminConnectClient();
  await client.initialize(email, password);

  const handler = new ToolHandler(client);
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const lastWeek = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
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
    results.push(await testTool(handler, 'schedule_workout', {
      workoutId: newWorkoutId,
      date: nextWeek,
    }));

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
    results.push(await testTool(handler, 'get_activity_gear', { activityId }));
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

  results.push(await testTool(handler, 'get_gear'));
  results.push(await testTool(handler, 'get_gear_defaults'));

  // Get gear UUID for stats test
  const gearResult = results.find(r => r.tool === 'get_gear');
  if (gearResult?.success && gearResult.result?.data?.gear?.length > 0) {
    const gearUUID = gearResult.result.data.gear[0].uuid;
    console.log(`\n📍 Using gear UUID: ${gearUUID}\n`);
    results.push(await testTool(handler, 'get_gear_stats', { gearUUID }));
  }

  // Skip link_gear_to_activity to preserve data
  console.log('⚠️  Skipping link_gear_to_activity to preserve data');

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TESTING v2.0 NEW TOOLS - REPORTS & PROGRESS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  results.push(await testTool(handler, 'get_progress_summary', {
    startDate: lastMonth,
    endDate: today,
    metric: 'distance',
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
