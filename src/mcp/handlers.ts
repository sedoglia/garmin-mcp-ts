// src/mcp/handlers.ts

import { GarminConnectClient } from '../garmin/client.js';
import logger from '../utils/logger.js';

// Tipo per gli argomenti dei tool
type ToolArgs = Record<string, unknown> | undefined | null;

export class ToolHandler {
  constructor(private client: GarminConnectClient) {}

  async handle(name: string, args: ToolArgs): Promise<unknown> {
    logger.info(`Handling tool: ${name}`);

    // Normalizza gli argomenti: undefined, null o oggetto
    const safeArgs: Record<string, unknown> = (args && typeof args === 'object') ? args : {};

    logger.info(`Safe args: ${JSON.stringify(safeArgs)}`);

    try {
      switch (name) {
        case 'list_recent_activities':
          return await this.handleListRecentActivities(safeArgs);
        case 'get_activity_details':
          return await this.handleGetActivityDetails(safeArgs);
        case 'get_health_metrics':
          return await this.handleGetHealthMetrics(safeArgs);
        case 'get_sleep_data':
          return await this.handleGetSleepData(safeArgs);
        case 'get_body_composition':
          return await this.handleGetBodyComposition(safeArgs);
        case 'get_devices':
          return await this.handleGetDevices();
        case 'get_user_profile':
          return await this.handleGetUserProfile();
        case 'get_training_status':
          return await this.handleGetTrainingStatus(safeArgs);
        // Nuovi tool v1.1
        case 'get_steps':
          return await this.handleGetSteps(safeArgs);
        case 'get_heart_rate':
          return await this.handleGetHeartRate(safeArgs);
        case 'get_hydration':
          return await this.handleGetHydration(safeArgs);
        case 'get_workouts':
          return await this.handleGetWorkouts(safeArgs);
        case 'get_activity_splits':
          return await this.handleGetActivitySplits(safeArgs);
        // Nuovi tool v1.2 - Wellness
        case 'get_stress_data':
          return await this.handleGetStressData(safeArgs);
        case 'get_body_battery':
          return await this.handleGetBodyBattery(safeArgs);
        case 'get_hrv_data':
          return await this.handleGetHrvData(safeArgs);
        case 'get_respiration_data':
          return await this.handleGetRespirationData(safeArgs);
        case 'get_spo2_data':
          return await this.handleGetSpO2Data(safeArgs);

        // ═══════════════════════════════════════════════════════════════
        // v2.0 - PRIORITÀ 1: WORKOUT MANAGEMENT
        // ═══════════════════════════════════════════════════════════════
        case 'get_workout_by_id':
          return await this.handleGetWorkoutById(safeArgs);
        case 'download_workout':
          return await this.handleDownloadWorkout(safeArgs);
        case 'create_workout':
          return await this.handleCreateWorkout(safeArgs);
        case 'update_workout':
          return await this.handleUpdateWorkout(safeArgs);
        case 'delete_workout':
          return await this.handleDeleteWorkout(safeArgs);
        case 'schedule_workout':
          return await this.handleScheduleWorkout(safeArgs);

        // ═══════════════════════════════════════════════════════════════
        // v2.0 - PRIORITÀ 2: ACTIVITY MANAGEMENT
        // ═══════════════════════════════════════════════════════════════
        case 'upload_activity':
          return await this.handleUploadActivity(safeArgs);
        case 'create_manual_activity':
          return await this.handleCreateManualActivity(safeArgs);
        case 'set_activity_name':
          return await this.handleSetActivityName(safeArgs);
        case 'set_activity_type':
          return await this.handleSetActivityType(safeArgs);
        case 'delete_activity':
          return await this.handleDeleteActivity(safeArgs);
        case 'download_activity':
          return await this.handleDownloadActivity(safeArgs);

        // ═══════════════════════════════════════════════════════════════
        // v2.0 - DEVICE & SETTINGS
        // ═══════════════════════════════════════════════════════════════
        case 'get_device_last_used':
          return await this.handleGetDeviceLastUsed();
        case 'get_device_settings':
          return await this.handleGetDeviceSettings(safeArgs);

        // ═══════════════════════════════════════════════════════════════
        // v2.0 - HEALTH & WELLNESS AVANZATI
        // ═══════════════════════════════════════════════════════════════
        case 'get_all_day_stress':
          return await this.handleGetAllDayStress(safeArgs);
        case 'get_floors':
          return await this.handleGetFloors(safeArgs);
        case 'get_intensity_minutes':
          return await this.handleGetIntensityMinutes(safeArgs);
        case 'get_max_metrics':
          return await this.handleGetMaxMetrics(safeArgs);
        case 'get_training_readiness':
          return await this.handleGetTrainingReadiness(safeArgs);
        case 'get_endurance_score':
          return await this.handleGetEnduranceScore(safeArgs);
        case 'get_fitness_age':
          return await this.handleGetFitnessAge(safeArgs);

        // ═══════════════════════════════════════════════════════════════
        // v2.0 - WEIGHT & BODY
        // ═══════════════════════════════════════════════════════════════
        case 'get_weigh_ins':
          return await this.handleGetWeighIns(safeArgs);
        case 'add_weigh_in':
          return await this.handleAddWeighIn(safeArgs);
        case 'delete_weigh_in':
          return await this.handleDeleteWeighIn(safeArgs);
        case 'get_blood_pressure':
          return await this.handleGetBloodPressure(safeArgs);
        case 'set_blood_pressure':
          return await this.handleSetBloodPressure(safeArgs);
        case 'delete_blood_pressure':
          return await this.handleDeleteBloodPressure(safeArgs);

        // ═══════════════════════════════════════════════════════════════
        // v2.0 - ACTIVITY DETAILS AVANZATI
        // ═══════════════════════════════════════════════════════════════
        case 'get_activity_weather':
          return await this.handleGetActivityWeather(safeArgs);
        case 'get_activity_hr_zones':
          return await this.handleGetActivityHRZones(safeArgs);
        case 'get_activity_gear':
          return await this.handleGetActivityGear(safeArgs);
        case 'get_activity_exercise_sets':
          return await this.handleGetActivityExerciseSets(safeArgs);
        // ═══════════════════════════════════════════════════════════════
        // v2.0 - GOALS, CHALLENGES & RECORDS
        // ═══════════════════════════════════════════════════════════════
        case 'get_goals':
          return await this.handleGetGoals(safeArgs);
        case 'get_adhoc_challenges':
          return await this.handleGetAdhocChallenges();
        case 'get_badge_challenges':
          return await this.handleGetBadgeChallenges();
        case 'get_earned_badges':
          return await this.handleGetEarnedBadges();
        case 'get_personal_records':
          return await this.handleGetPersonalRecords();
        case 'get_race_predictions':
          return await this.handleGetRacePredictions();

        // ═══════════════════════════════════════════════════════════════
        // v2.0 - GEAR MANAGEMENT
        // ═══════════════════════════════════════════════════════════════
        case 'get_gear':
          return await this.handleGetGear();
        case 'get_gear_defaults':
          return await this.handleGetGearDefaults();
        case 'get_gear_stats':
          return await this.handleGetGearStats(safeArgs);
        case 'link_gear_to_activity':
          return await this.handleLinkGearToActivity(safeArgs);

        // ═══════════════════════════════════════════════════════════════
        // v2.0 - REPORTS & PROGRESS
        // ═══════════════════════════════════════════════════════════════
        case 'get_progress_summary':
          return await this.handleGetProgressSummary(safeArgs);
        case 'get_daily_summary':
          return await this.handleGetDailySummary(safeArgs);

        // ═══════════════════════════════════════════════════════════════
        // v3.0 - NEW TOOLS FROM PYTHON API
        // ═══════════════════════════════════════════════════════════════
        case 'get_user_summary':
          return await this.handleGetUserSummary(safeArgs);
        case 'get_steps_data':
          return await this.handleGetStepsData(safeArgs);
        case 'get_daily_steps':
          return await this.handleGetDailySteps(safeArgs);
        case 'get_activities_by_date':
          return await this.handleGetActivitiesByDate(safeArgs);
        case 'get_activity_typed_splits':
          return await this.handleGetActivityTypedSplits(safeArgs);
        case 'get_rhr_day':
          return await this.handleGetRhrDay(safeArgs);
        case 'get_hill_score':
          return await this.handleGetHillScore(safeArgs);
        case 'get_all_day_events':
          return await this.handleGetAllDayEvents(safeArgs);
        case 'get_body_battery_events':
          return await this.handleGetBodyBatteryEvents(safeArgs);
        case 'add_hydration_data':
          return await this.handleAddHydrationData(safeArgs);
        case 'get_available_badges':
          return await this.handleGetAvailableBadges();
        case 'get_in_progress_badges':
          return await this.handleGetInProgressBadges();
        case 'get_available_badge_challenges':
          return await this.handleGetAvailableBadgeChallenges(safeArgs);
        case 'get_non_completed_badge_challenges':
          return await this.handleGetNonCompletedBadgeChallenges(safeArgs);
        case 'get_in_progress_virtual_challenges':
          return await this.handleGetInProgressVirtualChallenges(safeArgs);
        case 'remove_gear_from_activity':
          return await this.handleRemoveGearFromActivity(safeArgs);
        case 'get_gear_activities':
          return await this.handleGetGearActivities(safeArgs);
        case 'get_training_plans':
          return await this.handleGetTrainingPlans();
        case 'get_training_plan_by_id':
          return await this.handleGetTrainingPlanById(safeArgs);
        case 'get_menstrual_data':
          return await this.handleGetMenstrualData(safeArgs);
        case 'get_pregnancy_summary':
          return await this.handleGetPregnancySummary();
        case 'request_reload':
          return await this.handleRequestReload(safeArgs);
        case 'get_activity_types':
          return await this.handleGetActivityTypes();
        case 'get_primary_training_device':
          return await this.handleGetPrimaryTrainingDevice();
        case 'count_activities':
          return await this.handleCountActivities();
        case 'get_fitness_stats':
          return await this.handleGetFitnessStats(safeArgs);

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error(`Error in tool ${name}: ${error}`);
      throw err;
    }
  }

  private async handleListRecentActivities(args: Record<string, unknown>): Promise<unknown> {
    // Estrai e valida parametri con valori di default
    const limit = this.getNumberParam(args, 'limit', 10, 1, 100);
    const start = this.getNumberParam(args, 'start', 0, 0);

    logger.info(`Fetching activities: limit=${limit}, start=${start}`);

    const activities = await this.client.getRecentActivities(limit, start);

    // Assicurati che activities sia un array
    const activityList = Array.isArray(activities) ? activities : [];

    return {
      success: true,
      count: activityList.length,
      data: activityList,
    };
  }

  private async handleGetActivityDetails(args: Record<string, unknown>): Promise<unknown> {
    const activityId = this.getNumberParam(args, 'activityId', undefined);

    if (activityId === undefined) {
      throw new Error('Parameter "activityId" is required');
    }

    logger.info(`Fetching activity details: activityId=${activityId}`);

    const activity = await this.client.getActivityDetails(activityId);

    return {
      success: true,
      data: activity,
    };
  }

  private async handleGetHealthMetrics(args: Record<string, unknown>): Promise<unknown> {
    const date = this.getStringParam(args, 'date', this.getTodayDate());

    logger.info(`Fetching health metrics for date: ${date}`);

    const metrics = await this.client.getHealthMetrics(date);

    return {
      success: true,
      date,
      data: metrics,
    };
  }

  private async handleGetSleepData(args: Record<string, unknown>): Promise<unknown> {
    const date = this.getStringParam(args, 'date', this.getTodayDate());

    logger.info(`Fetching sleep data for date: ${date}`);

    const sleep = await this.client.getSleepData(date);

    return {
      success: true,
      date,
      data: sleep,
    };
  }

  private async handleGetBodyComposition(args: Record<string, unknown>): Promise<unknown> {
    const days = this.getNumberParam(args, 'days', 30, 1, 365);

    logger.info(`Fetching body composition for ${days} days`);

    const composition = await this.client.getBodyComposition(days);

    return {
      success: true,
      requestedDays: days,
      data: composition,
    };
  }

  private async handleGetDevices(): Promise<unknown> {
    logger.info('Fetching devices');

    const devices = await this.client.getDevices();

    return {
      success: true,
      data: devices,
    };
  }

  private async handleGetUserProfile(): Promise<unknown> {
    logger.info('Fetching user profile');

    const profile = await this.client.getUserProfile();

    // Estrai solo campi rilevanti se disponibili
    const safeProfile = profile && typeof profile === 'object' ? profile : {};

    return {
      success: true,
      data: {
        id: (safeProfile as any).id ?? null,
        displayName: (safeProfile as any).displayName ?? null,
        userName: (safeProfile as any).userName ?? null,
        fullName: (safeProfile as any).fullName ?? null,
        profileImageUrl: (safeProfile as any).profileImageUrlLarge ?? null,
      },
    };
  }

  private async handleGetTrainingStatus(args: Record<string, unknown>): Promise<unknown> {
    const days = this.getNumberParam(args, 'days', 7, 1, 365);

    logger.info(`Fetching training status for ${days} days`);

    const status = await this.client.getTrainingStatus(days);

    return {
      success: true,
      requestedDays: days,
      data: status,
    };
  }

  // Nuovi handler

  private async handleGetSteps(args: Record<string, unknown>): Promise<unknown> {
    const date = this.getStringParam(args, 'date', this.getTodayDate());

    logger.info(`Fetching steps for date: ${date}`);

    const steps = await this.client.getSteps(date);

    return {
      success: true,
      date,
      data: steps,
    };
  }

  private async handleGetHeartRate(args: Record<string, unknown>): Promise<unknown> {
    const date = this.getStringParam(args, 'date', this.getTodayDate());

    logger.info(`Fetching heart rate for date: ${date}`);

    const heartRate = await this.client.getHeartRate(date);

    return {
      success: true,
      date,
      data: heartRate,
    };
  }

  private async handleGetHydration(args: Record<string, unknown>): Promise<unknown> {
    const date = this.getStringParam(args, 'date', this.getTodayDate());

    logger.info(`Fetching hydration for date: ${date}`);

    const hydration = await this.client.getHydration(date);

    return {
      success: true,
      date,
      data: hydration,
    };
  }

  private async handleGetWorkouts(args: Record<string, unknown>): Promise<unknown> {
    const limit = this.getNumberParam(args, 'limit', 10, 1, 100);
    const start = this.getNumberParam(args, 'start', 0, 0);

    logger.info(`Fetching workouts: limit=${limit}, start=${start}`);

    const workouts = await this.client.getWorkouts(limit, start);
    const workoutList = Array.isArray(workouts) ? workouts : [];

    return {
      success: true,
      count: workoutList.length,
      data: workoutList,
    };
  }

  private async handleGetActivitySplits(args: Record<string, unknown>): Promise<unknown> {
    const activityId = this.getNumberParam(args, 'activityId', undefined);

    if (activityId === undefined) {
      throw new Error('Parameter "activityId" is required');
    }

    logger.info(`Fetching splits for activity: ${activityId}`);

    const splits = await this.client.getActivitySplits(activityId);

    return {
      success: true,
      data: splits,
    };
  }

  // Helper per estrarre parametri numerici con default e limiti
  private getNumberParam(
    args: Record<string, unknown>,
    key: string,
    defaultValue?: number,
    min?: number,
    max?: number
  ): number | undefined {
    const value = args[key];

    if (value === undefined || value === null) {
      return defaultValue;
    }

    let num: number;

    if (typeof value === 'number') {
      num = value;
    } else if (typeof value === 'string') {
      num = parseInt(value, 10);
      if (isNaN(num)) {
        return defaultValue;
      }
    } else {
      return defaultValue;
    }

    // Applica limiti
    if (min !== undefined && num < min) {
      num = min;
    }
    if (max !== undefined && num > max) {
      num = max;
    }

    return num;
  }

  // Helper per estrarre parametri stringa con default
  private getStringParam(
    args: Record<string, unknown>,
    key: string,
    defaultValue: string
  ): string {
    const value = args[key];

    if (value === undefined || value === null) {
      return defaultValue;
    }

    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim();
    }

    return defaultValue;
  }

  // Helper per ottenere la data di oggi in formato YYYY-MM-DD
  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // ═══════════════════════════════════════════════════════════════
  // NUOVI HANDLER v1.2 - Wellness (Stress, Body Battery, HRV, etc.)
  // ═══════════════════════════════════════════════════════════════

  private async handleGetStressData(args: Record<string, unknown>): Promise<unknown> {
    const date = this.getStringParam(args, 'date', this.getTodayDate());

    logger.info(`Fetching stress data for date: ${date}`);

    const stressData = await this.client.getStressData(date);

    return {
      success: true,
      date,
      data: stressData,
    };
  }

  private async handleGetBodyBattery(args: Record<string, unknown>): Promise<unknown> {
    const startDate = this.getStringParam(args, 'startDate', this.getTodayDate());
    const endDate = this.getStringParam(args, 'endDate', startDate);

    logger.info(`Fetching body battery from ${startDate} to ${endDate}`);

    const batteryData = await this.client.getBodyBattery(startDate, endDate);

    return {
      success: true,
      startDate,
      endDate,
      data: batteryData,
    };
  }

  private async handleGetHrvData(args: Record<string, unknown>): Promise<unknown> {
    const date = this.getStringParam(args, 'date', this.getTodayDate());

    logger.info(`Fetching HRV data for date: ${date}`);

    const hrvData = await this.client.getHrvData(date);

    return {
      success: true,
      date,
      data: hrvData,
    };
  }

  private async handleGetRespirationData(args: Record<string, unknown>): Promise<unknown> {
    const date = this.getStringParam(args, 'date', this.getTodayDate());

    logger.info(`Fetching respiration data for date: ${date}`);

    const respData = await this.client.getRespirationData(date);

    return {
      success: true,
      date,
      data: respData,
    };
  }

  private async handleGetSpO2Data(args: Record<string, unknown>): Promise<unknown> {
    const date = this.getStringParam(args, 'date', this.getTodayDate());

    logger.info(`Fetching SpO2 data for date: ${date}`);

    const spo2Data = await this.client.getSpO2Data(date);

    return {
      success: true,
      date,
      data: spo2Data,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // v2.0 - PRIORITÀ 1: WORKOUT MANAGEMENT HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  private async handleGetWorkoutById(args: Record<string, unknown>): Promise<unknown> {
    const workoutId = this.getStringParam(args, 'workoutId', '');

    if (!workoutId) {
      throw new Error('Parameter "workoutId" is required');
    }

    logger.info(`Fetching workout by ID: ${workoutId}`);

    const workout = await this.client.getWorkoutById(workoutId);

    return {
      success: true,
      data: workout,
    };
  }

  private async handleDownloadWorkout(args: Record<string, unknown>): Promise<unknown> {
    const workoutId = this.getStringParam(args, 'workoutId', '');

    if (!workoutId) {
      throw new Error('Parameter "workoutId" is required');
    }

    logger.info(`Downloading workout: ${workoutId}`);

    const data = await this.client.downloadWorkout(workoutId);

    return {
      success: true,
      data,
    };
  }

  private async handleCreateWorkout(args: Record<string, unknown>): Promise<unknown> {
    const workoutName = this.getStringParam(args, 'workoutName', '');
    const sportType = this.getStringParam(args, 'sportType', 'running');
    const description = this.getStringParam(args, 'description', '');
    const workoutSegments = args.workoutSegments as any[];

    if (!workoutName) {
      throw new Error('Parameter "workoutName" is required');
    }
    if (!workoutSegments || !Array.isArray(workoutSegments)) {
      throw new Error('Parameter "workoutSegments" is required and must be an array');
    }

    logger.info(`Creating workout: ${workoutName}`);

    const result = await this.client.createWorkout({
      workoutName,
      sportType,
      description,
      workoutSegments,
    });

    return {
      success: true,
      data: result,
    };
  }

  private async handleUpdateWorkout(args: Record<string, unknown>): Promise<unknown> {
    const workoutId = this.getStringParam(args, 'workoutId', '');

    if (!workoutId) {
      throw new Error('Parameter "workoutId" is required');
    }

    const updates: any = {};
    if (args.workoutName) updates.workoutName = args.workoutName;
    if (args.description) updates.description = args.description;
    if (args.workoutSegments) updates.workoutSegments = args.workoutSegments;

    logger.info(`Updating workout: ${workoutId}`);

    const result = await this.client.updateWorkout(workoutId, updates);

    return {
      success: true,
      data: result,
    };
  }

  private async handleDeleteWorkout(args: Record<string, unknown>): Promise<unknown> {
    const workoutId = this.getStringParam(args, 'workoutId', '');

    if (!workoutId) {
      throw new Error('Parameter "workoutId" is required');
    }

    logger.info(`Deleting workout: ${workoutId}`);

    const result = await this.client.deleteWorkout(workoutId);

    return {
      success: true,
      data: result,
    };
  }

  private async handleScheduleWorkout(args: Record<string, unknown>): Promise<unknown> {
    const workoutId = this.getStringParam(args, 'workoutId', '');
    const date = this.getStringParam(args, 'date', '');

    if (!workoutId) {
      throw new Error('Parameter "workoutId" is required');
    }
    if (!date) {
      throw new Error('Parameter "date" is required');
    }

    logger.info(`Scheduling workout ${workoutId} for ${date}`);

    const result = await this.client.scheduleWorkout(workoutId, date);

    return {
      success: true,
      data: result,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // v2.0 - PRIORITÀ 2: ACTIVITY MANAGEMENT HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  private async handleUploadActivity(args: Record<string, unknown>): Promise<unknown> {
    const filePath = this.getStringParam(args, 'filePath', '');

    if (!filePath) {
      throw new Error('Parameter "filePath" is required');
    }

    logger.info(`Uploading activity from: ${filePath}`);

    const result = await this.client.uploadActivity(filePath);

    return {
      success: true,
      data: result,
    };
  }

  private async handleCreateManualActivity(args: Record<string, unknown>): Promise<unknown> {
    const activityName = this.getStringParam(args, 'activityName', '');
    const activityType = this.getStringParam(args, 'activityType', '');
    const startTime = this.getStringParam(args, 'startTime', '');
    const duration = this.getNumberParam(args, 'duration', 0);
    const distance = this.getNumberParam(args, 'distance', 0);
    const calories = this.getNumberParam(args, 'calories', 0);
    const description = this.getStringParam(args, 'description', '');

    if (!activityName || !activityType || !startTime || !duration) {
      throw new Error('Parameters "activityName", "activityType", "startTime", and "duration" are required');
    }

    logger.info(`Creating manual activity: ${activityName}`);

    const result = await this.client.createManualActivity({
      activityName,
      activityType,
      startTime,
      duration: duration!,
      distance,
      calories,
      description,
    });

    return {
      success: true,
      data: result,
    };
  }

  private async handleSetActivityName(args: Record<string, unknown>): Promise<unknown> {
    const activityId = this.getNumberParam(args, 'activityId', undefined);
    const name = this.getStringParam(args, 'name', '');

    if (activityId === undefined || !name) {
      throw new Error('Parameters "activityId" and "name" are required');
    }

    logger.info(`Setting activity ${activityId} name to: ${name}`);

    const result = await this.client.setActivityName(activityId, name);

    return {
      success: true,
      data: result,
    };
  }

  private async handleSetActivityType(args: Record<string, unknown>): Promise<unknown> {
    const activityId = this.getNumberParam(args, 'activityId', undefined);
    const typeKey = this.getStringParam(args, 'typeKey', '');
    const typeId = this.getNumberParam(args, 'typeId', undefined);

    if (activityId === undefined || !typeKey) {
      throw new Error('Parameters "activityId" and "typeKey" are required');
    }

    logger.info(`Setting activity ${activityId} type to: ${typeKey}`);

    const result = await this.client.setActivityType(activityId, typeKey, typeId);

    return {
      success: true,
      data: result,
    };
  }

  private async handleDeleteActivity(args: Record<string, unknown>): Promise<unknown> {
    const activityId = this.getNumberParam(args, 'activityId', undefined);

    if (activityId === undefined) {
      throw new Error('Parameter "activityId" is required');
    }

    logger.info(`Deleting activity: ${activityId}`);

    const result = await this.client.deleteActivity(activityId);

    return {
      success: true,
      data: result,
    };
  }

  private async handleDownloadActivity(args: Record<string, unknown>): Promise<unknown> {
    const activityId = this.getNumberParam(args, 'activityId', undefined);
    const format = this.getStringParam(args, 'format', 'fit') as 'fit' | 'tcx' | 'gpx' | 'kml' | 'csv';

    if (activityId === undefined) {
      throw new Error('Parameter "activityId" is required');
    }

    logger.info(`Downloading activity ${activityId} in ${format} format`);

    const result = await this.client.downloadActivity(activityId, format);

    return {
      success: true,
      data: result,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // v2.0 - DEVICE & SETTINGS HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  private async handleGetDeviceLastUsed(): Promise<unknown> {
    logger.info('Fetching last used device');

    const device = await this.client.getDeviceLastUsed();

    return {
      success: true,
      data: device,
    };
  }

  private async handleGetDeviceSettings(args: Record<string, unknown>): Promise<unknown> {
    const deviceId = this.getStringParam(args, 'deviceId', '');

    if (!deviceId) {
      throw new Error('Parameter "deviceId" is required');
    }

    logger.info(`Fetching device settings for: ${deviceId}`);

    const settings = await this.client.getDeviceSettings(deviceId);

    return {
      success: true,
      data: settings,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // v2.0 - HEALTH & WELLNESS AVANZATI HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  private async handleGetAllDayStress(args: Record<string, unknown>): Promise<unknown> {
    const date = this.getStringParam(args, 'date', this.getTodayDate());

    logger.info(`Fetching all day stress for: ${date}`);

    const stress = await this.client.getAllDayStress(date);

    return {
      success: true,
      date,
      data: stress,
    };
  }

  private async handleGetFloors(args: Record<string, unknown>): Promise<unknown> {
    const date = this.getStringParam(args, 'date', this.getTodayDate());

    logger.info(`Fetching floors for: ${date}`);

    const floors = await this.client.getFloors(date);

    return {
      success: true,
      date,
      data: floors,
    };
  }

  private async handleGetIntensityMinutes(args: Record<string, unknown>): Promise<unknown> {
    const date = this.getStringParam(args, 'date', this.getTodayDate());

    logger.info(`Fetching intensity minutes for: ${date}`);

    const minutes = await this.client.getIntensityMinutes(date);

    return {
      success: true,
      date,
      data: minutes,
    };
  }

  private async handleGetMaxMetrics(args: Record<string, unknown>): Promise<unknown> {
    const date = this.getStringParam(args, 'date', this.getTodayDate());

    logger.info(`Fetching max metrics for: ${date}`);

    const metrics = await this.client.getMaxMetrics(date);

    return {
      success: true,
      date,
      data: metrics,
    };
  }

  private async handleGetTrainingReadiness(args: Record<string, unknown>): Promise<unknown> {
    const date = this.getStringParam(args, 'date', this.getTodayDate());

    logger.info(`Fetching training readiness for: ${date}`);

    const readiness = await this.client.getTrainingReadiness(date);

    return {
      success: true,
      date,
      data: readiness,
    };
  }

  private async handleGetEnduranceScore(args: Record<string, unknown>): Promise<unknown> {
    const date = this.getStringParam(args, 'date', this.getTodayDate());

    logger.info(`Fetching endurance score for: ${date}`);

    const score = await this.client.getEnduranceScore(date);

    return {
      success: true,
      date,
      data: score,
    };
  }

  private async handleGetFitnessAge(args: Record<string, unknown>): Promise<unknown> {
    const date = this.getStringParam(args, 'date', this.getTodayDate());

    logger.info(`Fetching fitness age for: ${date}`);

    const age = await this.client.getFitnessAge(date);

    return {
      success: true,
      date,
      data: age,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // v2.0 - WEIGHT & BODY HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  private async handleGetWeighIns(args: Record<string, unknown>): Promise<unknown> {
    const startDate = this.getStringParam(args, 'startDate', '');
    const endDate = this.getStringParam(args, 'endDate', '');

    if (!startDate || !endDate) {
      throw new Error('Parameters "startDate" and "endDate" are required');
    }

    logger.info(`Fetching weigh-ins from ${startDate} to ${endDate}`);

    const weighIns = await this.client.getWeighIns(startDate, endDate);

    return {
      success: true,
      data: weighIns,
    };
  }

  private async handleAddWeighIn(args: Record<string, unknown>): Promise<unknown> {
    const weight = this.getNumberParam(args, 'weight', undefined);
    const date = this.getStringParam(args, 'date', '');
    const bodyFatPercent = this.getNumberParam(args, 'bodyFatPercent', undefined);
    const bodyWaterPercent = this.getNumberParam(args, 'bodyWaterPercent', undefined);
    const muscleMassPercent = this.getNumberParam(args, 'muscleMassPercent', undefined);
    const boneMassPercent = this.getNumberParam(args, 'boneMassPercent', undefined);

    if (weight === undefined || !date) {
      throw new Error('Parameters "weight" and "date" are required');
    }

    logger.info(`Adding weigh-in: ${weight}kg on ${date}`);

    const result = await this.client.addWeighIn(weight, date, bodyFatPercent, bodyWaterPercent, muscleMassPercent, boneMassPercent);

    return {
      success: true,
      data: result,
    };
  }

  private async handleDeleteWeighIn(args: Record<string, unknown>): Promise<unknown> {
    const weighInId = this.getStringParam(args, 'weighInId', '');

    if (!weighInId) {
      throw new Error('Parameter "weighInId" is required');
    }

    logger.info(`Deleting weigh-in: ${weighInId}`);

    const result = await this.client.deleteWeighIn(weighInId);

    return {
      success: true,
      data: result,
    };
  }

  private async handleGetBloodPressure(args: Record<string, unknown>): Promise<unknown> {
    const startDate = this.getStringParam(args, 'startDate', '');
    const endDate = this.getStringParam(args, 'endDate', '');

    if (!startDate || !endDate) {
      throw new Error('Parameters "startDate" and "endDate" are required');
    }

    logger.info(`Fetching blood pressure from ${startDate} to ${endDate}`);

    const data = await this.client.getBloodPressure(startDate, endDate);

    return {
      success: true,
      data,
    };
  }

  private async handleSetBloodPressure(args: Record<string, unknown>): Promise<unknown> {
    const systolic = this.getNumberParam(args, 'systolic', undefined);
    const diastolic = this.getNumberParam(args, 'diastolic', undefined);
    const pulse = this.getNumberParam(args, 'pulse', undefined);
    const dateTime = this.getStringParam(args, 'dateTime', '');
    const notes = this.getStringParam(args, 'notes', '');

    if (systolic === undefined || diastolic === undefined || pulse === undefined || !dateTime) {
      throw new Error('Parameters "systolic", "diastolic", "pulse", and "dateTime" are required');
    }

    logger.info(`Recording blood pressure: ${systolic}/${diastolic} mmHg`);

    const result = await this.client.setBloodPressure(systolic, diastolic, pulse, dateTime, notes);

    return {
      success: true,
      data: result,
    };
  }

  private async handleDeleteBloodPressure(args: Record<string, unknown>): Promise<unknown> {
    const samplePk = this.getStringParam(args, 'samplePk', '');

    if (!samplePk) {
      throw new Error('Parameter "samplePk" is required');
    }

    logger.info(`Deleting blood pressure reading: ${samplePk}`);

    const result = await this.client.deleteBloodPressure(samplePk);

    return {
      success: true,
      data: result,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // v2.0 - ACTIVITY DETAILS AVANZATI HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  private async handleGetActivityWeather(args: Record<string, unknown>): Promise<unknown> {
    const activityId = this.getNumberParam(args, 'activityId', undefined);

    if (activityId === undefined) {
      throw new Error('Parameter "activityId" is required');
    }

    logger.info(`Fetching weather for activity: ${activityId}`);

    const weather = await this.client.getActivityWeather(activityId);

    return {
      success: true,
      data: weather,
    };
  }

  private async handleGetActivityHRZones(args: Record<string, unknown>): Promise<unknown> {
    const activityId = this.getNumberParam(args, 'activityId', undefined);

    if (activityId === undefined) {
      throw new Error('Parameter "activityId" is required');
    }

    logger.info(`Fetching HR zones for activity: ${activityId}`);

    const zones = await this.client.getActivityHRZones(activityId);

    return {
      success: true,
      data: zones,
    };
  }

  private async handleGetActivityGear(args: Record<string, unknown>): Promise<unknown> {
    const activityId = this.getNumberParam(args, 'activityId', undefined);

    if (activityId === undefined) {
      throw new Error('Parameter "activityId" is required');
    }

    logger.info(`Fetching gear for activity: ${activityId}`);

    const gear = await this.client.getActivityGear(activityId);

    return {
      success: true,
      data: gear,
    };
  }

  private async handleGetActivityExerciseSets(args: Record<string, unknown>): Promise<unknown> {
    const activityId = this.getNumberParam(args, 'activityId', undefined);

    if (activityId === undefined) {
      throw new Error('Parameter "activityId" is required');
    }

    logger.info(`Fetching exercise sets for activity: ${activityId}`);

    const sets = await this.client.getActivityExerciseSets(activityId);

    return {
      success: true,
      data: sets,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // v2.0 - GOALS, CHALLENGES & RECORDS HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  private async handleGetGoals(args: Record<string, unknown>): Promise<unknown> {
    const status = this.getStringParam(args, 'status', '') as 'active' | 'future' | 'past' | undefined;

    logger.info(`Fetching goals with status: ${status || 'all'}`);

    const goals = await this.client.getGoals(status || undefined);

    return {
      success: true,
      data: goals,
    };
  }

  private async handleGetAdhocChallenges(): Promise<unknown> {
    logger.info('Fetching adhoc challenges');

    const challenges = await this.client.getAdhocChallenges();

    return {
      success: true,
      data: challenges,
    };
  }

  private async handleGetBadgeChallenges(): Promise<unknown> {
    logger.info('Fetching badge challenges');

    const challenges = await this.client.getBadgeChallenges();

    return {
      success: true,
      data: challenges,
    };
  }

  private async handleGetEarnedBadges(): Promise<unknown> {
    logger.info('Fetching earned badges');

    const badges = await this.client.getEarnedBadges();

    return {
      success: true,
      data: badges,
    };
  }

  private async handleGetPersonalRecords(): Promise<unknown> {
    logger.info('Fetching personal records');

    const records = await this.client.getPersonalRecords();

    return {
      success: true,
      data: records,
    };
  }

  private async handleGetRacePredictions(): Promise<unknown> {
    logger.info('Fetching race predictions');

    const predictions = await this.client.getRacePredictions();

    return {
      success: true,
      data: predictions,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // v2.0 - GEAR MANAGEMENT HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  private async handleGetGear(): Promise<unknown> {
    logger.info('Fetching all gear');

    const gear = await this.client.getGear();

    return {
      success: true,
      data: gear,
    };
  }

  private async handleGetGearDefaults(): Promise<unknown> {
    logger.info('Fetching gear defaults');

    const defaults = await this.client.getGearDefaults();

    return {
      success: true,
      data: defaults,
    };
  }

  private async handleGetGearStats(args: Record<string, unknown>): Promise<unknown> {
    const gearUUID = this.getStringParam(args, 'gearUUID', '');

    if (!gearUUID) {
      throw new Error('Parameter "gearUUID" is required');
    }

    logger.info(`Fetching stats for gear: ${gearUUID}`);

    const stats = await this.client.getGearStats(gearUUID);

    return {
      success: true,
      data: stats,
    };
  }

  private async handleLinkGearToActivity(args: Record<string, unknown>): Promise<unknown> {
    const gearUUID = this.getStringParam(args, 'gearUUID', '');
    const activityId = this.getNumberParam(args, 'activityId', undefined);

    if (!gearUUID || activityId === undefined) {
      throw new Error('Parameters "gearUUID" and "activityId" are required');
    }

    logger.info(`Linking gear ${gearUUID} to activity ${activityId}`);

    const result = await this.client.linkGearToActivity(gearUUID, activityId);

    return {
      success: true,
      data: result,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // v2.0 - REPORTS & PROGRESS HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  private async handleGetProgressSummary(args: Record<string, unknown>): Promise<unknown> {
    const startDate = this.getStringParam(args, 'startDate', '');
    const endDate = this.getStringParam(args, 'endDate', '');
    const metric = this.getStringParam(args, 'metric', 'distance');

    if (!startDate || !endDate) {
      throw new Error('Parameters "startDate" and "endDate" are required');
    }

    logger.info(`Fetching progress summary from ${startDate} to ${endDate}`);

    const summary = await this.client.getProgressSummary(startDate, endDate, metric);

    return {
      success: true,
      data: summary,
    };
  }

  private async handleGetDailySummary(args: Record<string, unknown>): Promise<unknown> {
    const date = this.getStringParam(args, 'date', this.getTodayDate());

    logger.info(`Fetching daily summary for: ${date}`);

    const summary = await this.client.getDailySummary(date);

    return {
      success: true,
      date,
      data: summary,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // v3.0 - NEW HANDLERS FROM PYTHON API
  // ═══════════════════════════════════════════════════════════════════════════

  private async handleGetUserSummary(args: Record<string, unknown>): Promise<unknown> {
    const date = this.getStringParam(args, 'date', '');
    if (!date) {
      throw new Error('Parameter "date" is required');
    }

    logger.info(`Fetching user summary for: ${date}`);
    const summary = await this.client.getUserSummary(date);

    return {
      success: true,
      date,
      data: summary,
    };
  }

  private async handleGetStepsData(args: Record<string, unknown>): Promise<unknown> {
    const date = this.getStringParam(args, 'date', '');
    if (!date) {
      throw new Error('Parameter "date" is required');
    }

    logger.info(`Fetching steps data for: ${date}`);
    const data = await this.client.getStepsData(date);

    return {
      success: true,
      date,
      data,
    };
  }

  private async handleGetDailySteps(args: Record<string, unknown>): Promise<unknown> {
    const startDate = this.getStringParam(args, 'startDate', '');
    const endDate = this.getStringParam(args, 'endDate', '');

    if (!startDate || !endDate) {
      throw new Error('Parameters "startDate" and "endDate" are required');
    }

    logger.info(`Fetching daily steps from ${startDate} to ${endDate}`);
    const data = await this.client.getDailySteps(startDate, endDate);

    return {
      success: true,
      startDate,
      endDate,
      data,
    };
  }

  private async handleGetActivitiesByDate(args: Record<string, unknown>): Promise<unknown> {
    const startDate = this.getStringParam(args, 'startDate', '');
    const endDate = this.getStringParam(args, 'endDate', '') || undefined;
    const activityType = this.getStringParam(args, 'activityType', '') || undefined;
    const sortOrder = this.getStringParam(args, 'sortOrder', '') || undefined;

    if (!startDate) {
      throw new Error('Parameter "startDate" is required');
    }

    logger.info(`Fetching activities by date from ${startDate}`);
    const activities = await this.client.getActivitiesByDate(startDate, endDate, activityType, sortOrder);

    return {
      success: true,
      startDate,
      endDate,
      count: activities.length,
      data: activities,
    };
  }

  private async handleGetActivityTypedSplits(args: Record<string, unknown>): Promise<unknown> {
    const activityId = this.getNumberParam(args, 'activityId', undefined);
    if (activityId === undefined) {
      throw new Error('Parameter "activityId" is required');
    }

    logger.info(`Fetching typed splits for activity: ${activityId}`);
    const data = await this.client.getActivityTypedSplits(activityId);

    return {
      success: true,
      data,
    };
  }

  private async handleGetRhrDay(args: Record<string, unknown>): Promise<unknown> {
    const date = this.getStringParam(args, 'date', '');
    if (!date) {
      throw new Error('Parameter "date" is required');
    }

    logger.info(`Fetching RHR for: ${date}`);
    const data = await this.client.getRhrDay(date);

    return {
      success: true,
      date,
      data,
    };
  }

  private async handleGetHillScore(args: Record<string, unknown>): Promise<unknown> {
    const startDate = this.getStringParam(args, 'startDate', '');
    const endDate = this.getStringParam(args, 'endDate', '') || undefined;

    if (!startDate) {
      throw new Error('Parameter "startDate" is required');
    }

    logger.info(`Fetching hill score for: ${startDate}`);
    const data = await this.client.getHillScore(startDate, endDate);

    return {
      success: true,
      data,
    };
  }

  private async handleGetAllDayEvents(args: Record<string, unknown>): Promise<unknown> {
    const date = this.getStringParam(args, 'date', '');
    if (!date) {
      throw new Error('Parameter "date" is required');
    }

    logger.info(`Fetching all day events for: ${date}`);
    const data = await this.client.getAllDayEvents(date);

    return {
      success: true,
      date,
      data,
    };
  }

  private async handleGetBodyBatteryEvents(args: Record<string, unknown>): Promise<unknown> {
    const date = this.getStringParam(args, 'date', '');
    if (!date) {
      throw new Error('Parameter "date" is required');
    }

    logger.info(`Fetching body battery events for: ${date}`);
    const data = await this.client.getBodyBatteryEvents(date);

    return {
      success: true,
      date,
      data,
    };
  }

  private async handleAddHydrationData(args: Record<string, unknown>): Promise<unknown> {
    const valueInMl = this.getNumberParam(args, 'valueInMl', undefined);
    const date = this.getStringParam(args, 'date', '') || undefined;
    const timestamp = this.getStringParam(args, 'timestamp', '') || undefined;

    if (valueInMl === undefined) {
      throw new Error('Parameter "valueInMl" is required');
    }

    logger.info(`Adding hydration data: ${valueInMl}ml`);
    const data = await this.client.addHydrationData(valueInMl, date, timestamp);

    return {
      success: true,
      data,
    };
  }

  private async handleGetAvailableBadges(): Promise<unknown> {
    logger.info('Fetching available badges');
    const data = await this.client.getAvailableBadges();

    return {
      success: true,
      data,
    };
  }

  private async handleGetInProgressBadges(): Promise<unknown> {
    logger.info('Fetching in-progress badges');
    const data = await this.client.getInProgressBadges();

    return {
      success: true,
      data,
    };
  }

  private async handleGetAvailableBadgeChallenges(args: Record<string, unknown>): Promise<unknown> {
    const start = this.getNumberParam(args, 'start', 0);
    const limit = this.getNumberParam(args, 'limit', 30);

    logger.info('Fetching available badge challenges');
    const data = await this.client.getAvailableBadgeChallenges(start, limit);

    return {
      success: true,
      data,
    };
  }

  private async handleGetNonCompletedBadgeChallenges(args: Record<string, unknown>): Promise<unknown> {
    const start = this.getNumberParam(args, 'start', 0);
    const limit = this.getNumberParam(args, 'limit', 30);

    logger.info('Fetching non-completed badge challenges');
    const data = await this.client.getNonCompletedBadgeChallenges(start, limit);

    return {
      success: true,
      data,
    };
  }

  private async handleGetInProgressVirtualChallenges(args: Record<string, unknown>): Promise<unknown> {
    const start = this.getNumberParam(args, 'start', 0);
    const limit = this.getNumberParam(args, 'limit', 30);

    logger.info('Fetching in-progress virtual challenges');
    const data = await this.client.getInProgressVirtualChallenges(start, limit);

    return {
      success: true,
      data,
    };
  }

  private async handleRemoveGearFromActivity(args: Record<string, unknown>): Promise<unknown> {
    const gearUUID = this.getStringParam(args, 'gearUUID', '');
    const activityId = this.getNumberParam(args, 'activityId', undefined);

    if (!gearUUID || activityId === undefined) {
      throw new Error('Parameters "gearUUID" and "activityId" are required');
    }

    logger.info(`Removing gear ${gearUUID} from activity ${activityId}`);
    const data = await this.client.removeGearFromActivity(gearUUID, activityId);

    return {
      success: true,
      data,
    };
  }

  private async handleGetGearActivities(args: Record<string, unknown>): Promise<unknown> {
    const gearUUID = this.getStringParam(args, 'gearUUID', '');
    const limit = this.getNumberParam(args, 'limit', 100);

    if (!gearUUID) {
      throw new Error('Parameter "gearUUID" is required');
    }

    logger.info(`Fetching activities for gear: ${gearUUID}`);
    const activities = await this.client.getGearActivities(gearUUID, limit);

    return {
      success: true,
      count: activities.length,
      data: activities,
    };
  }

  private async handleGetTrainingPlans(): Promise<unknown> {
    logger.info('Fetching training plans');
    const data = await this.client.getTrainingPlans();

    return {
      success: true,
      data,
    };
  }

  private async handleGetTrainingPlanById(args: Record<string, unknown>): Promise<unknown> {
    const planId = this.getStringParam(args, 'planId', '');

    if (!planId) {
      throw new Error('Parameter "planId" is required');
    }

    logger.info(`Fetching training plan: ${planId}`);
    const data = await this.client.getTrainingPlanById(planId);

    return {
      success: true,
      data,
    };
  }

  private async handleGetMenstrualData(args: Record<string, unknown>): Promise<unknown> {
    const date = this.getStringParam(args, 'date', '');

    if (!date) {
      throw new Error('Parameter "date" is required');
    }

    logger.info(`Fetching menstrual data for: ${date}`);
    const data = await this.client.getMenstrualDataForDate(date);

    return {
      success: true,
      date,
      data,
    };
  }

  private async handleGetPregnancySummary(): Promise<unknown> {
    logger.info('Fetching pregnancy summary');
    const data = await this.client.getPregnancySummary();

    return {
      success: true,
      data,
    };
  }

  private async handleRequestReload(args: Record<string, unknown>): Promise<unknown> {
    const date = this.getStringParam(args, 'date', '');

    if (!date) {
      throw new Error('Parameter "date" is required');
    }

    logger.info(`Requesting data reload for: ${date}`);
    const data = await this.client.requestReload(date);

    return {
      success: true,
      date,
      data,
    };
  }

  private async handleGetActivityTypes(): Promise<unknown> {
    logger.info('Fetching activity types');
    const data = await this.client.getActivityTypes();

    return {
      success: true,
      data,
    };
  }

  private async handleGetPrimaryTrainingDevice(): Promise<unknown> {
    logger.info('Fetching primary training device');
    const data = await this.client.getPrimaryTrainingDevice();

    return {
      success: true,
      data,
    };
  }

  private async handleCountActivities(): Promise<unknown> {
    logger.info('Counting activities');
    const count = await this.client.countActivities();

    return {
      success: true,
      totalCount: count,
    };
  }

  private async handleGetFitnessStats(args: Record<string, unknown>): Promise<unknown> {
    const startDate = this.getStringParam(args, 'startDate', '');
    const endDate = this.getStringParam(args, 'endDate', '');
    const metric = this.getStringParam(args, 'metric', 'distance');
    const groupByActivities = args.groupByActivities !== false;

    if (!startDate || !endDate) {
      throw new Error('Parameters "startDate" and "endDate" are required');
    }

    logger.info(`Fetching fitness stats from ${startDate} to ${endDate}`);
    const data = await this.client.getFitnessStats(startDate, endDate, metric, groupByActivities);

    return {
      success: true,
      startDate,
      endDate,
      metric,
      data,
    };
  }
}
