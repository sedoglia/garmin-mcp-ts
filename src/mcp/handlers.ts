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
}
