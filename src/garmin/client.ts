// src/garmin/client.ts

import GarminConnectModule from 'garmin-connect';
import * as fs from 'fs';
import * as path from 'path';
import logger from '../utils/logger.js';

// La libreria è CommonJS, quindi l'export default contiene la classe
const GarminConnect = (GarminConnectModule as any).GarminConnect || GarminConnectModule;

// Token storage interface
interface OAuthTokens {
  oauth1: any;
  oauth2: any;
}

export class GarminConnectClient {
  private gc: any;
  private initialized: boolean = false;
  private displayName: string | null = null;

  constructor() {
    // Non inizializzare qui, lo faremo in initialize()
  }

  /**
   * Initialize with email/password credentials
   * Optionally load/save OAuth tokens from/to a directory
   */
  async initialize(email: string, password: string, tokenDir?: string): Promise<void> {
    try {
      logger.info('🔐 Authenticating with Garmin Connect...');

      this.gc = new GarminConnect({ username: email, password: password });

      // Try to load existing tokens first
      if (tokenDir && this.tryLoadTokens(tokenDir)) {
        logger.info('✅ Loaded existing OAuth tokens');
        this.initialized = true;

        // Verify tokens are still valid by making a simple request
        try {
          await this.gc.getUserProfile();
          logger.info('✅ OAuth tokens are valid');
          return;
        } catch {
          logger.info('⚠️ Stored tokens expired, re-authenticating...');
        }
      }

      // Login with credentials
      await this.gc.login();
      this.initialized = true;
      logger.info('✅ Authentication successful');

      // Save tokens if tokenDir is specified
      if (tokenDir) {
        this.saveTokens(tokenDir);
      }

      // Get display name for user-specific API calls
      try {
        const profile = await this.gc.getUserProfile();
        this.displayName = profile?.displayName || profile?.userName || null;
      } catch {
        // Non-critical, some endpoints may not need it
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Failed to initialize Garmin client:', error);
      throw err;
    }
  }

  /**
   * Initialize using only OAuth tokens (no credentials needed)
   */
  async initializeWithTokens(tokens: OAuthTokens): Promise<void> {
    try {
      logger.info('🔐 Authenticating with OAuth tokens...');
      this.gc = new GarminConnect({});
      this.gc.loadToken(tokens.oauth1, tokens.oauth2);
      this.initialized = true;

      // Verify tokens are valid
      const profile = await this.gc.getUserProfile();
      this.displayName = profile?.displayName || profile?.userName || null;
      logger.info('✅ OAuth token authentication successful');
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Failed to initialize with OAuth tokens:', error);
      throw err;
    }
  }

  /**
   * Export current OAuth tokens for later reuse
   */
  exportTokens(): OAuthTokens | null {
    if (!this.initialized || !this.gc) return null;
    try {
      return this.gc.exportToken();
    } catch {
      return null;
    }
  }

  /**
   * Save OAuth tokens to files in the specified directory
   */
  saveTokens(dirPath: string): void {
    try {
      const tokens = this.gc.exportToken();
      if (!tokens) return;

      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      fs.writeFileSync(
        path.join(dirPath, 'oauth1_token.json'),
        JSON.stringify(tokens.oauth1, null, 2)
      );
      fs.writeFileSync(
        path.join(dirPath, 'oauth2_token.json'),
        JSON.stringify(tokens.oauth2, null, 2)
      );
      logger.info(`✅ OAuth tokens saved to ${dirPath}`);
    } catch (err) {
      logger.warn('Failed to save OAuth tokens:', err);
    }
  }

  /**
   * Try to load OAuth tokens from files in the specified directory
   */
  private tryLoadTokens(dirPath: string): boolean {
    try {
      const oauth1Path = path.join(dirPath, 'oauth1_token.json');
      const oauth2Path = path.join(dirPath, 'oauth2_token.json');

      if (!fs.existsSync(oauth1Path) || !fs.existsSync(oauth2Path)) {
        return false;
      }

      const oauth1 = JSON.parse(fs.readFileSync(oauth1Path, 'utf-8'));
      const oauth2 = JSON.parse(fs.readFileSync(oauth2Path, 'utf-8'));

      this.gc.loadToken(oauth1, oauth2);
      return true;
    } catch {
      return false;
    }
  }

  private checkInitialized(): void {
    if (!this.initialized) {
      throw new Error('Garmin client not initialized. Call initialize() first.');
    }
  }

  /**
   * Get the display name of the logged-in user
   */
  getDisplayName(): string | null {
    return this.displayName;
  }

  async getRecentActivities(limit: number = 10, start: number = 0): Promise<any> {
    this.checkInitialized();
    try {
      const activities = await this.gc.getActivities(start, limit);
      return activities;
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error fetching recent activities:', error);
      throw err;
    }
  }

  async getActivityDetails(activityId: number): Promise<any> {
    this.checkInitialized();
    try {
      const activity = await this.gc.getActivity({ activityId });
      return activity;
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error fetching activity details:', error);
      throw err;
    }
  }

  async getHealthMetrics(date: string): Promise<any> {
    this.checkInitialized();
    try {
      const heartRate = await this.gc.getHeartRate(new Date(date));
      const steps = await this.gc.getSteps(new Date(date));
      return {
        heartRate,
        steps,
        date,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error fetching health metrics:', error);
      throw err;
    }
  }

  async getSleepData(date: string): Promise<any> {
    this.checkInitialized();
    try {
      const sleep = await this.gc.getSleepData(new Date(date));
      return sleep;
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error fetching sleep data:', error);
      throw err;
    }
  }

  async getBodyComposition(days: number = 30): Promise<any> {
    this.checkInitialized();
    try {
      // Ottieni il peso giornaliero per oggi (API non supporta range)
      const weight = await this.gc.getDailyWeightData(new Date());
      return {
        weight,
        requestedDays: days,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error fetching body composition:', error);
      throw err;
    }
  }

  async getDevices(): Promise<any> {
    this.checkInitialized();
    try {
      // La libreria non ha un metodo diretto per devices
      // Usiamo getUserSettings che contiene info sui dispositivi
      const settings = await this.gc.getUserSettings();
      return {
        message: 'Device info available through user settings',
        settings,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error fetching devices:', error);
      throw err;
    }
  }

  async getUserProfile(): Promise<any> {
    this.checkInitialized();
    try {
      const profile = await this.gc.getUserProfile();
      return profile;
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error fetching user profile:', error);
      throw err;
    }
  }

  async getTrainingStatus(_days: number = 7): Promise<any> {
    this.checkInitialized();
    try {
      // Ottieni conteggio attività e statistiche come proxy per training status
      const count = await this.gc.countActivities();
      const settings = await this.gc.getUserSettings();
      return {
        activityCount: count,
        userSettings: settings,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error fetching training status:', error);
      throw err;
    }
  }

  async getSteps(date: string): Promise<any> {
    this.checkInitialized();
    try {
      const steps = await this.gc.getSteps(new Date(date));
      return {
        date,
        steps,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error fetching steps:', error);
      throw err;
    }
  }

  async getHeartRate(date: string): Promise<any> {
    this.checkInitialized();
    try {
      const heartRate = await this.gc.getHeartRate(new Date(date));
      return heartRate;
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error fetching heart rate:', error);
      throw err;
    }
  }

  async getHydration(date: string): Promise<any> {
    this.checkInitialized();
    try {
      const hydration = await this.gc.getDailyHydration(new Date(date));
      return {
        date,
        hydrationOz: hydration,
        hydrationMl: Math.round(hydration * 29.5735), // Convert oz to ml
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      // Se non ci sono dati di idratazione, restituisci un oggetto vuoto invece di un errore
      if (error.includes('Invalid or empty hydration data')) {
        logger.info(`No hydration data available for ${date}`);
        return {
          date,
          hydrationOz: null,
          hydrationMl: null,
          message: 'No hydration data recorded for this date',
        };
      }
      logger.error('Error fetching hydration:', error);
      throw err;
    }
  }

  async getWorkouts(limit: number = 10, start: number = 0): Promise<any> {
    this.checkInitialized();
    try {
      const workouts = await this.gc.getWorkouts(start, limit);
      return workouts;
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error fetching workouts:', error);
      throw err;
    }
  }

  async getActivitySplits(activityId: number): Promise<any> {
    this.checkInitialized();
    try {
      // L'attività dettagliata contiene già i dati dei split
      const activity = await this.gc.getActivity({ activityId });
      // Estrai splits/laps se presenti
      const splits = (activity as any)?.splitSummaries || (activity as any)?.laps || [];
      return {
        activityId,
        activityName: (activity as any)?.activityName,
        splits,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error fetching activity splits:', error);
      throw err;
    }
  }

  getGarminConnect(): any {
    return this.gc;
  }

  // ═══════════════════════════════════════════════════════════════
  // NUOVI METODI: Stress e Body Battery (Priorità Alta)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get stress data for a specific date
   * Uses custom GET request to wellness-service API
   */
  async getStressData(date: string): Promise<any> {
    this.checkInitialized();
    try {
      // Endpoint corretto: connectapi.garmin.com (non connect.garmin.com/modern/proxy)
      const url = `https://connectapi.garmin.com/wellness-service/wellness/dailyStress/${date}`;
      const stressData = await this.gc.get(url);

      // Calcola statistiche aggiuntive se i dati sono presenti
      let avgStress: number | null = null;
      let maxStress: number | null = null;
      let minStress: number | null = null;
      let stressValues: Array<{ timestamp: number; stressLevel: number }> = [];

      if (stressData?.stressValuesArray) {
        const values = stressData.stressValuesArray
          .filter((v: [number, number]) => v[1] >= 0) // Filtra valori invalidi (-1, -2)
          .map((v: [number, number]) => ({ timestamp: v[0], stressLevel: v[1] }));

        stressValues = values;

        if (values.length > 0) {
          const levels = values.map((v: { stressLevel: number }) => v.stressLevel);
          avgStress = Math.round(levels.reduce((a: number, b: number) => a + b, 0) / levels.length);
          maxStress = Math.max(...levels);
          minStress = Math.min(...levels);
        }
      }

      return {
        date,
        calendarDate: stressData?.calendarDate,
        overallStressLevel: stressData?.overallStressLevel,
        restStressDuration: stressData?.restStressDuration,
        activityStressDuration: stressData?.activityStressDuration,
        lowStressDuration: stressData?.lowStressDuration,
        mediumStressDuration: stressData?.mediumStressDuration,
        highStressDuration: stressData?.highStressDuration,
        stressQualifier: stressData?.stressQualifier,
        avgStress,
        maxStress,
        minStress,
        stressValueCount: stressValues.length,
        stressValues,
        raw: stressData,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      // Se non ci sono dati, restituisci un oggetto con messaggio
      if (error.includes('404') || error.includes('Not Found')) {
        logger.info(`No stress data available for ${date}`);
        return {
          date,
          message: 'No stress data recorded for this date',
          stressValues: [],
        };
      }
      logger.error('Error fetching stress data:', error);
      throw err;
    }
  }

  /**
   * Get body battery data for a date range
   * Uses custom GET request to wellness-service API
   */
  async getBodyBattery(startDate: string, endDate?: string): Promise<any> {
    this.checkInitialized();
    try {
      const end = endDate || startDate;
      // Endpoint corretto: connectapi.garmin.com con query params
      const url = `https://connectapi.garmin.com/wellness-service/wellness/bodyBattery/reports/daily?startDate=${startDate}&endDate=${end}`;
      const batteryData = await this.gc.get(url);

      // Processa i dati per ogni giorno
      const days = Array.isArray(batteryData) ? batteryData : [batteryData];
      const processedDays = days.map((day: any) => {
        let bodyBatteryValues: Array<{ timestamp: number; level: number }> = [];
        let maxLevel: number | null = null;
        let minLevel: number | null = null;
        let charged = 0;
        let drained = 0;

        if (day?.bodyBatteryValuesArray) {
          bodyBatteryValues = day.bodyBatteryValuesArray
            .filter((v: [number, number]) => v[1] >= 0)
            .map((v: [number, number]) => ({ timestamp: v[0], level: v[1] }));

          if (bodyBatteryValues.length > 0) {
            const levels = bodyBatteryValues.map((v: { level: number }) => v.level);
            maxLevel = Math.max(...levels);
            minLevel = Math.min(...levels);
          }
        }

        // Calcola charged/drained dai dati
        if (day?.bodyBatteryFeedbackList) {
          for (const feedback of day.bodyBatteryFeedbackList) {
            if (feedback.feedbackType === 'CHARGED') {
              charged += feedback.feedbackValue || 0;
            } else if (feedback.feedbackType === 'DRAINED') {
              drained += feedback.feedbackValue || 0;
            }
          }
        }

        return {
          date: day?.calendarDate || day?.date,
          startLevel: day?.startTimestampLocal ? bodyBatteryValues[0]?.level : null,
          endLevel: bodyBatteryValues.length > 0 ? bodyBatteryValues[bodyBatteryValues.length - 1]?.level : null,
          maxLevel,
          minLevel,
          charged: day?.charged || charged,
          drained: day?.drained || drained,
          valueCount: bodyBatteryValues.length,
          bodyBatteryValues,
        };
      });

      return {
        startDate,
        endDate: end,
        dayCount: processedDays.length,
        days: processedDays,
        raw: batteryData,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      // Se non ci sono dati, restituisci un oggetto con messaggio
      if (error.includes('404') || error.includes('Not Found')) {
        logger.info(`No body battery data available for ${startDate}`);
        return {
          startDate,
          endDate: endDate || startDate,
          message: 'No body battery data recorded for this date range',
          days: [],
        };
      }
      logger.error('Error fetching body battery:', error);
      throw err;
    }
  }

  /**
   * Get body battery events for a specific date
   */
  async getBodyBatteryEvents(date: string): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/wellness-service/wellness/bodyBattery/events/${date}`;
      const events = await this.gc.get(url);
      return {
        date,
        events: events || [],
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      if (error.includes('404') || error.includes('Not Found')) {
        return {
          date,
          message: 'No body battery events for this date',
          events: [],
        };
      }
      logger.error('Error fetching body battery events:', error);
      throw err;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // ALTRI NUOVI METODI: HRV, Respiration, SpO2
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get Heart Rate Variability (HRV) data for a specific date
   */
  async getHrvData(date: string): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/hrv-service/hrv/${date}`;
      const hrvData = await this.gc.get(url);
      return {
        date,
        ...hrvData,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      if (error.includes('404') || error.includes('Not Found')) {
        return {
          date,
          message: 'No HRV data recorded for this date',
        };
      }
      logger.error('Error fetching HRV data:', error);
      throw err;
    }
  }

  /**
   * Get respiration data for a specific date
   */
  async getRespirationData(date: string): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/wellness-service/wellness/daily/respiration/${date}`;
      const respData = await this.gc.get(url);
      return {
        date,
        ...respData,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      if (error.includes('404') || error.includes('Not Found')) {
        return {
          date,
          message: 'No respiration data recorded for this date',
        };
      }
      logger.error('Error fetching respiration data:', error);
      throw err;
    }
  }

  /**
   * Get SpO2 (Pulse Oximetry) data for a specific date
   */
  async getSpO2Data(date: string): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/wellness-service/wellness/daily/spo2/${date}`;
      const spo2Data = await this.gc.get(url);
      return {
        date,
        ...spo2Data,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      if (error.includes('404') || error.includes('Not Found')) {
        return {
          date,
          message: 'No SpO2 data recorded for this date',
        };
      }
      logger.error('Error fetching SpO2 data:', error);
      throw err;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // v2.0 - PRIORITÀ 1: WORKOUT MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get workout details by ID
   */
  async getWorkoutById(workoutId: string): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/workout-service/workout/${workoutId}`;
      const workout = await this.gc.get(url);
      return workout;
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error fetching workout by ID:', error);
      throw err;
    }
  }

  /**
   * Download workout in FIT format
   */
  async downloadWorkout(workoutId: string): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/workout-service/workout/FIT/${workoutId}`;
      const fitData = await this.gc.get(url);
      return {
        workoutId,
        format: 'FIT',
        data: fitData,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error downloading workout:', error);
      throw err;
    }
  }

  /**
   * Create a new structured workout
   * @param workout Workout definition with steps
   */
  async createWorkout(workout: {
    workoutName: string;
    sportType: string;
    workoutSegments: Array<{
      segmentOrder: number;
      sportType: string;
      workoutSteps: Array<{
        stepOrder: number;
        stepType: string;
        childStepId?: number;
        endCondition: string;
        endConditionValue?: number;
        targetType?: string;
        targetValueLow?: number;
        targetValueHigh?: number;
        repeatValue?: number;
        repeatType?: string;
      }>;
    }>;
    description?: string;
  }): Promise<any> {
    this.checkInitialized();
    try {
      // Build the workout payload in Garmin's exact format
      const sportType = this.mapSportType(workout.sportType);

      // Build minimal payload - only required fields, let Garmin fill in defaults
      const workoutPayload = {
        workoutName: workout.workoutName,
        description: workout.description || null,
        sportType,
        workoutSegments: workout.workoutSegments.map(seg => ({
          segmentOrder: seg.segmentOrder,
          sportType: this.mapSportType(seg.sportType),
          workoutSteps: seg.workoutSteps.map(step => {
            const stepType = this.mapStepType(step.stepType);
            const endCondition = this.mapEndCondition(step.endCondition);
            const targetType = step.targetType
              ? this.mapTargetType(step.targetType)
              : { workoutTargetTypeId: 1, workoutTargetTypeKey: 'no.target' };

            return {
              type: 'ExecutableStepDTO',
              stepId: null,
              stepOrder: step.stepOrder,
              childStepId: step.childStepId || null,
              description: null,
              stepType: {
                stepTypeId: stepType.stepTypeId,
                stepTypeKey: stepType.stepTypeKey,
                displayOrder: step.stepOrder,
              },
              endCondition: {
                conditionTypeId: endCondition.conditionTypeId,
                conditionTypeKey: endCondition.conditionTypeKey,
                displayOrder: 1,
                displayable: true,
              },
              endConditionValue: step.endConditionValue || null,
              preferredEndConditionUnit: step.endCondition === 'distance'
                ? { unitKey: 'meter' }
                : step.endCondition === 'time'
                  ? { unitKey: 'second' }
                  : null,
              endConditionCompare: null,
              endConditionZone: null,
              targetType: {
                workoutTargetTypeId: targetType.workoutTargetTypeId,
                workoutTargetTypeKey: targetType.workoutTargetTypeKey,
                displayOrder: 1,
              },
              targetValueOne: step.targetValueLow || null,
              targetValueTwo: step.targetValueHigh || null,
              targetValueUnit: null,
              zoneNumber: null,
              secondaryTargetType: null,
              secondaryTargetValueOne: null,
              secondaryTargetValueTwo: null,
              secondaryTargetValueUnit: null,
              secondaryZoneNumber: null,
              strokeType: { strokeTypeId: 0, strokeTypeKey: null, displayOrder: 0 },
              equipmentType: { equipmentTypeId: 0, equipmentTypeKey: null, displayOrder: 0 },
              category: null,
              exerciseName: null,
              workoutProvider: null,
              providerExerciseSourceId: null,
              weightValue: null,
              weightUnit: null,
            };
          }),
        })),
      };

      // Use the library's addWorkout method with properly formatted payload
      const result = await this.gc.addWorkout(workoutPayload);
      return {
        success: true,
        workoutId: result?.workoutId,
        workoutName: workout.workoutName,
        ...result,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error creating workout:', error);
      // Return graceful error instead of throwing
      return {
        success: false,
        error,
        message: 'Workout creation failed. Please check the workout format.',
        workoutDefinition: workout,
      };
    }
  }

  /**
   * Update an existing workout
   */
  async updateWorkout(workoutId: string, updates: {
    workoutName?: string;
    description?: string;
    workoutSegments?: any[];
  }): Promise<any> {
    this.checkInitialized();
    try {
      // Prima ottieni il workout esistente
      const existing = await this.getWorkoutById(workoutId);

      const url = `https://connectapi.garmin.com/workout-service/workout/${workoutId}`;
      const payload = {
        ...existing,
        ...updates,
        workoutId,
      };

      const result = await this.gc.put(url, payload);
      return {
        success: true,
        workoutId,
        ...result,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error updating workout:', error);
      throw err;
    }
  }

  /**
   * Delete a workout
   */
  async deleteWorkout(workoutId: string): Promise<any> {
    this.checkInitialized();
    try {
      // Use the library's deleteWorkout method
      await this.gc.deleteWorkout({ workoutId });
      return {
        success: true,
        workoutId,
        message: 'Workout deleted successfully',
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error deleting workout:', error);
      throw err;
    }
  }

  /**
   * Schedule a workout on a specific date
   */
  async scheduleWorkout(workoutId: string, date: string): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/workout-service/schedule/${workoutId}`;
      const payload = {
        date,
      };
      const result = await this.gc.post(url, payload);
      return {
        success: true,
        workoutId,
        scheduledDate: date,
        ...result,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error scheduling workout:', error);
      throw err;
    }
  }

  // Helper per mappare sport types
  private mapSportType(sport: string): { sportTypeId: number; sportTypeKey: string } {
    const sportMap: Record<string, { sportTypeId: number; sportTypeKey: string }> = {
      running: { sportTypeId: 1, sportTypeKey: 'running' },
      cycling: { sportTypeId: 2, sportTypeKey: 'cycling' },
      swimming: { sportTypeId: 5, sportTypeKey: 'swimming' },
      strength: { sportTypeId: 4, sportTypeKey: 'strength_training' },
      cardio: { sportTypeId: 3, sportTypeKey: 'fitness_equipment' },
      walking: { sportTypeId: 9, sportTypeKey: 'walking' },
      hiking: { sportTypeId: 17, sportTypeKey: 'hiking' },
      yoga: { sportTypeId: 43, sportTypeKey: 'yoga' },
    };
    return sportMap[sport.toLowerCase()] || sportMap.running;
  }

  // Helper per mappare step types
  private mapStepType(stepType: string): { stepTypeId: number; stepTypeKey: string } {
    const stepMap: Record<string, { stepTypeId: number; stepTypeKey: string }> = {
      warmup: { stepTypeId: 1, stepTypeKey: 'warmup' },
      cooldown: { stepTypeId: 2, stepTypeKey: 'cooldown' },
      interval: { stepTypeId: 3, stepTypeKey: 'interval' },
      recovery: { stepTypeId: 4, stepTypeKey: 'recovery' },
      rest: { stepTypeId: 5, stepTypeKey: 'rest' },
      repeat: { stepTypeId: 6, stepTypeKey: 'repeat' },
      other: { stepTypeId: 7, stepTypeKey: 'other' },
    };
    return stepMap[stepType.toLowerCase()] || stepMap.interval;
  }

  // Helper per mappare end conditions
  private mapEndCondition(condition: string): { conditionTypeId: number; conditionTypeKey: string } {
    const conditionMap: Record<string, { conditionTypeId: number; conditionTypeKey: string }> = {
      time: { conditionTypeId: 2, conditionTypeKey: 'time' },
      distance: { conditionTypeId: 3, conditionTypeKey: 'distance' },
      lap_button: { conditionTypeId: 1, conditionTypeKey: 'lap.button' },
      iterations: { conditionTypeId: 7, conditionTypeKey: 'iterations' },
    };
    return conditionMap[condition.toLowerCase()] || conditionMap.time;
  }

  // Helper per mappare target types
  private mapTargetType(target: string): { workoutTargetTypeId: number; workoutTargetTypeKey: string } {
    const targetMap: Record<string, { workoutTargetTypeId: number; workoutTargetTypeKey: string }> = {
      pace: { workoutTargetTypeId: 6, workoutTargetTypeKey: 'pace.zone' },
      heart_rate: { workoutTargetTypeId: 4, workoutTargetTypeKey: 'heart.rate.zone' },
      power: { workoutTargetTypeId: 2, workoutTargetTypeKey: 'power.zone' },
      cadence: { workoutTargetTypeId: 3, workoutTargetTypeKey: 'cadence' },
      speed: { workoutTargetTypeId: 5, workoutTargetTypeKey: 'speed.zone' },
      no_target: { workoutTargetTypeId: 1, workoutTargetTypeKey: 'no.target' },
    };
    return targetMap[target.toLowerCase()] || targetMap.no_target;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // v2.0 - PRIORITÀ 2: ACTIVITY MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Upload an activity file (FIT, GPX, TCX)
   */
  async uploadActivity(filePath: string): Promise<any> {
    this.checkInitialized();
    try {
      const fileName = filePath.split(/[\\/]/).pop() || 'activity.fit';
      const ext = fileName.split('.').pop()?.toLowerCase();

      const result = await this.gc.uploadActivity(filePath);
      return {
        success: true,
        fileName,
        fileType: ext,
        ...result,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error uploading activity:', error);
      throw err;
    }
  }

  /**
   * Create a manual activity
   */
  async createManualActivity(params: {
    activityName: string;
    activityType: string;
    startTime: string;
    duration: number;
    distance?: number;
    description?: string;
    calories?: number;
  }): Promise<any> {
    this.checkInitialized();
    try {
      const url = 'https://connectapi.garmin.com/activity-service/activity';

      const payload = {
        activityName: params.activityName,
        activityTypeDTO: {
          typeKey: params.activityType,
        },
        summaryDTO: {
          startTimeLocal: params.startTime,
          duration: params.duration,
          distance: params.distance || 0,
          calories: params.calories || 0,
        },
        description: params.description || '',
        accessControlRuleDTO: {
          typeId: 2,
          typeKey: 'private',
        },
        timeZoneUnitDTO: {
          unitKey: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };

      const result = await this.gc.post(url, payload);
      return {
        success: true,
        activityName: params.activityName,
        ...result,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error creating manual activity:', error);
      throw err;
    }
  }

  /**
   * Set activity name
   */
  async setActivityName(activityId: number, name: string): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/activity-service/activity/${activityId}`;
      const payload = {
        activityId,
        activityName: name,
      };
      const result = await this.gc.put(url, payload);
      return {
        success: true,
        activityId,
        newName: name,
        ...result,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error setting activity name:', error);
      throw err;
    }
  }

  /**
   * Set activity type
   */
  async setActivityType(activityId: number, typeKey: string, typeId?: number): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/activity-service/activity/${activityId}`;
      const payload = {
        activityId,
        activityTypeDTO: {
          typeKey,
          typeId: typeId || null,
        },
      };
      const result = await this.gc.put(url, payload);
      return {
        success: true,
        activityId,
        newType: typeKey,
        ...result,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error setting activity type:', error);
      throw err;
    }
  }

  /**
   * Delete an activity
   */
  async deleteActivity(activityId: number): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/activity-service/activity/${activityId}`;
      await this.gc.delete(url);
      return {
        success: true,
        activityId,
        message: 'Activity deleted successfully',
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error deleting activity:', error);
      throw err;
    }
  }

  /**
   * Download activity in various formats
   */
  async downloadActivity(activityId: number, format: 'fit' | 'tcx' | 'gpx' | 'kml' | 'csv' = 'fit'): Promise<any> {
    this.checkInitialized();
    try {
      let url: string;
      switch (format) {
        case 'tcx':
          url = `https://connectapi.garmin.com/download-service/export/tcx/activity/${activityId}`;
          break;
        case 'gpx':
          url = `https://connectapi.garmin.com/download-service/export/gpx/activity/${activityId}`;
          break;
        case 'kml':
          url = `https://connectapi.garmin.com/download-service/export/kml/activity/${activityId}`;
          break;
        case 'csv':
          url = `https://connectapi.garmin.com/download-service/export/csv/activity/${activityId}`;
          break;
        default:
          url = `https://connectapi.garmin.com/download-service/files/activity/${activityId}`;
      }

      const data = await this.gc.get(url);
      return {
        activityId,
        format,
        data,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error downloading activity:', error);
      throw err;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // v2.0 - DEVICE & SETTINGS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get last used device info
   */
  async getDeviceLastUsed(): Promise<any> {
    this.checkInitialized();
    try {
      // Use getUserSettings which contains device info
      const settings = await this.gc.getUserSettings();
      return {
        message: 'Device info from user settings',
        settings,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error fetching last used device:', error);
      throw err;
    }
  }

  /**
   * Get device settings
   */
  async getDeviceSettings(deviceId: string): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/device-service/deviceservice/device-info/settings/${deviceId}`;
      const settings = await this.gc.get(url);
      return settings;
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error fetching device settings:', error);
      throw err;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // v2.0 - HEALTH & WELLNESS AVANZATI
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get all-day stress data with detailed breakdown
   */
  async getAllDayStress(date: string): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/wellness-service/wellness/dailyStress/${date}`;
      const stressData = await this.gc.get(url);
      return {
        date,
        ...stressData,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      if (error.includes('404')) {
        return { date, message: 'No stress data for this date' };
      }
      logger.error('Error fetching all day stress:', error);
      throw err;
    }
  }

  /**
   * Get floors climbed data
   */
  async getFloors(date: string): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/wellness-service/wellness/daily/floors/${date}`;
      const floors = await this.gc.get(url);
      return {
        date,
        ...floors,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      if (error.includes('404')) {
        return { date, message: 'No floors data for this date' };
      }
      logger.error('Error fetching floors:', error);
      throw err;
    }
  }

  /**
   * Get intensity minutes data
   */
  async getIntensityMinutes(date: string): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/wellness-service/wellness/daily/intensityMinutes/${date}`;
      const data = await this.gc.get(url);
      return {
        date,
        ...data,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      if (error.includes('404')) {
        return { date, message: 'No intensity minutes data for this date' };
      }
      logger.error('Error fetching intensity minutes:', error);
      throw err;
    }
  }

  /**
   * Get max metrics (VO2 max, fitness age, etc.)
   */
  async getMaxMetrics(date: string): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/metrics-service/metrics/maxmet/daily/${date}/${date}`;
      const metrics = await this.gc.get(url);
      return {
        date,
        ...metrics,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      if (error.includes('404')) {
        return { date, message: 'No max metrics data for this date' };
      }
      logger.error('Error fetching max metrics:', error);
      throw err;
    }
  }

  /**
   * Get training readiness score
   */
  async getTrainingReadiness(date: string): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/metrics-service/metrics/trainingreadiness/${date}`;
      const readiness = await this.gc.get(url);
      return {
        date,
        ...readiness,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      if (error.includes('404')) {
        return { date, message: 'No training readiness data for this date' };
      }
      logger.error('Error fetching training readiness:', error);
      throw err;
    }
  }

  /**
   * Get endurance score
   */
  async getEnduranceScore(date: string): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/metrics-service/metrics/endurancescore/${date}`;
      const score = await this.gc.get(url);
      return {
        date,
        ...score,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      if (error.includes('404')) {
        return { date, message: 'No endurance score data for this date' };
      }
      logger.error('Error fetching endurance score:', error);
      throw err;
    }
  }

  /**
   * Get fitness age
   */
  async getFitnessAge(date: string): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/metrics-service/metrics/fitnessage/${date}`;
      const age = await this.gc.get(url);
      return {
        date,
        ...age,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      if (error.includes('404')) {
        return { date, message: 'No fitness age data for this date' };
      }
      logger.error('Error fetching fitness age:', error);
      throw err;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // v2.0 - WEIGHT & BODY
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get weigh-ins for a date range
   */
  async getWeighIns(startDate: string, endDate: string): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/weight-service/weight/dateRange?startDate=${startDate}&endDate=${endDate}`;
      const weighIns = await this.gc.get(url);
      return {
        startDate,
        endDate,
        weighIns: weighIns || [],
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error fetching weigh-ins:', error);
      throw err;
    }
  }

  /**
   * Add a weigh-in
   */
  async addWeighIn(weight: number, date: string, bodyFatPercent?: number, bodyWaterPercent?: number, muscleMassPercent?: number, boneMassPercent?: number): Promise<any> {
    this.checkInitialized();
    try {
      const url = 'https://connectapi.garmin.com/weight-service/user-weight';
      const payload: any = {
        dateTimestamp: new Date(date).getTime(),
        gmtTimestamp: new Date(date).getTime(),
        weight: weight * 1000, // kg to grams
      };

      if (bodyFatPercent !== undefined) payload.bodyFat = bodyFatPercent;
      if (bodyWaterPercent !== undefined) payload.bodyWater = bodyWaterPercent;
      if (muscleMassPercent !== undefined) payload.muscleMass = muscleMassPercent;
      if (boneMassPercent !== undefined) payload.boneMass = boneMassPercent;

      const result = await this.gc.post(url, payload);
      return {
        success: true,
        weight,
        date,
        ...result,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error adding weigh-in:', error);
      throw err;
    }
  }

  /**
   * Delete a weigh-in
   */
  async deleteWeighIn(weighInId: string): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/weight-service/user-weight/${weighInId}`;
      await this.gc.delete(url);
      return {
        success: true,
        weighInId,
        message: 'Weigh-in deleted successfully',
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error deleting weigh-in:', error);
      throw err;
    }
  }

  /**
   * Get blood pressure data
   */
  async getBloodPressure(startDate: string, endDate: string): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/bloodpressure-service/bloodpressure/range/${startDate}/${endDate}`;
      const data = await this.gc.get(url);
      return {
        startDate,
        endDate,
        readings: data || [],
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error fetching blood pressure:', error);
      throw err;
    }
  }

  /**
   * Set blood pressure reading
   */
  async setBloodPressure(systolic: number, diastolic: number, pulse: number, dateTime: string, notes?: string): Promise<any> {
    this.checkInitialized();
    try {
      const url = 'https://connectapi.garmin.com/bloodpressure-service/bloodpressure';
      const payload = {
        systolic,
        diastolic,
        pulse,
        measurementTimestampLocal: dateTime,
        measurementTimestampGMT: new Date(dateTime).toISOString(),
        notes: notes || '',
      };
      const result = await this.gc.post(url, payload);
      return {
        success: true,
        systolic,
        diastolic,
        pulse,
        ...result,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error setting blood pressure:', error);
      throw err;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // v2.0 - ACTIVITY DETAILS AVANZATI
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get weather data for an activity
   */
  async getActivityWeather(activityId: number): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/activity-service/activity/${activityId}/weather`;
      const weather = await this.gc.get(url);
      return {
        activityId,
        ...weather,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      if (error.includes('404')) {
        return { activityId, message: 'No weather data for this activity' };
      }
      logger.error('Error fetching activity weather:', error);
      throw err;
    }
  }

  /**
   * Get heart rate zones for an activity
   */
  async getActivityHRZones(activityId: number): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/activity-service/activity/${activityId}/hrTimeInZones`;
      const zones = await this.gc.get(url);
      return {
        activityId,
        ...zones,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      if (error.includes('404')) {
        return { activityId, message: 'No HR zones data for this activity' };
      }
      logger.error('Error fetching activity HR zones:', error);
      throw err;
    }
  }

  /**
   * Get gear used in an activity
   */
  async getActivityGear(activityId: number): Promise<any> {
    this.checkInitialized();
    try {
      // Get activity details which may contain gear info
      const activity = await this.gc.getActivity({ activityId });
      const gear = (activity as any)?.gearDTO || (activity as any)?.gear || null;
      return {
        activityId,
        gear: gear ? [gear] : [],
        message: gear ? undefined : 'No gear linked to this activity',
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      if (error.includes('404') || error.includes('405')) {
        return { activityId, gear: [], message: 'No gear linked to this activity' };
      }
      logger.error('Error fetching activity gear:', error);
      throw err;
    }
  }

  /**
   * Get exercise sets for strength activities
   */
  async getActivityExerciseSets(activityId: number): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/activity-service/activity/${activityId}/exerciseSets`;
      const sets = await this.gc.get(url);
      return {
        activityId,
        sets: sets || [],
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      if (error.includes('404')) {
        return { activityId, sets: [], message: 'No exercise sets for this activity' };
      }
      logger.error('Error fetching activity exercise sets:', error);
      throw err;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // v2.0 - GOALS, CHALLENGES & RECORDS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get user goals
   */
  async getGoals(status?: 'active' | 'future' | 'past'): Promise<any> {
    this.checkInitialized();
    try {
      let url = 'https://connectapi.garmin.com/goal-service/goal/goals';
      if (status) {
        url += `?status=${status}`;
      }
      const goals = await this.gc.get(url);
      return {
        status: status || 'all',
        goals: goals || [],
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error fetching goals:', error);
      throw err;
    }
  }

  /**
   * Get adhoc challenges
   */
  async getAdhocChallenges(): Promise<any> {
    this.checkInitialized();
    try {
      const url = 'https://connectapi.garmin.com/adhocchallenge-service/adHocChallenge/historical';
      const challenges = await this.gc.get(url);
      return {
        challenges: challenges || [],
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error fetching adhoc challenges:', error);
      throw err;
    }
  }

  /**
   * Get badge challenges
   */
  async getBadgeChallenges(): Promise<any> {
    this.checkInitialized();
    try {
      const url = 'https://connectapi.garmin.com/badgechallenge-service/badgeChallenge/available';
      const challenges = await this.gc.get(url);
      return {
        challenges: challenges || [],
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error fetching badge challenges:', error);
      throw err;
    }
  }

  /**
   * Get earned badges
   */
  async getEarnedBadges(): Promise<any> {
    this.checkInitialized();
    try {
      const url = 'https://connectapi.garmin.com/badge-service/badge/earned';
      const badges = await this.gc.get(url);
      return {
        badges: badges || [],
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error fetching earned badges:', error);
      throw err;
    }
  }

  /**
   * Get personal records
   */
  async getPersonalRecords(): Promise<any> {
    this.checkInitialized();
    try {
      // Personal records are typically part of the user profile
      const profile = await this.gc.getUserProfile();
      return {
        records: (profile as any)?.personalRecords || [],
        message: 'Personal records are available through activity history',
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      if (error.includes('404')) {
        return { records: [], message: 'No personal records available' };
      }
      logger.error('Error fetching personal records:', error);
      throw err;
    }
  }

  /**
   * Get race predictions (5K, 10K, half, marathon)
   */
  async getRacePredictions(): Promise<any> {
    this.checkInitialized();
    try {
      const url = 'https://connectapi.garmin.com/metrics-service/metrics/racepredictions/latest';
      const predictions = await this.gc.get(url);
      return predictions;
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      if (error.includes('404')) {
        return { message: 'No race predictions available' };
      }
      logger.error('Error fetching race predictions:', error);
      throw err;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // v2.0 - GEAR MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get all user gear
   */
  async getGear(): Promise<any> {
    this.checkInitialized();
    try {
      // Try the library's gear method if available
      const gc = this.gc as any;
      if (typeof gc.getGear === 'function') {
        const gear = await gc.getGear();
        return { gear: gear || [] };
      }
      // Fallback: gear info may be in user settings
      const settings = await this.gc.getUserSettings();
      return {
        gear: [],
        message: 'Gear management requires Garmin Connect web interface',
        settings,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error fetching gear:', error);
      return {
        gear: [],
        message: 'Gear feature not available through API',
      };
    }
  }

  /**
   * Get default gear for activities
   */
  async getGearDefaults(): Promise<any> {
    this.checkInitialized();
    try {
      const gear = await this.getGear();
      return {
        defaults: [],
        message: 'Gear defaults are managed through Garmin Connect web interface',
        gear: gear.gear,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error fetching gear defaults:', error);
      return {
        defaults: [],
        message: 'Gear defaults feature not available through API',
      };
    }
  }

  /**
   * Get gear stats
   */
  async getGearStats(gearUUID: string): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/gear-service/gear/stats/${gearUUID}`;
      const stats = await this.gc.get(url);
      return {
        gearUUID,
        ...stats,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error fetching gear stats:', error);
      throw err;
    }
  }

  /**
   * Link gear to an activity
   */
  async linkGearToActivity(gearUUID: string, activityId: number): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/gear-service/gear/link/${gearUUID}/activity/${activityId}`;
      const result = await this.gc.put(url, {});
      return {
        success: true,
        gearUUID,
        activityId,
        ...result,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error linking gear to activity:', error);
      throw err;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // v2.0 - REPORTS & PROGRESS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get progress summary between dates
   */
  async getProgressSummary(startDate: string, endDate: string, metric: string = 'distance'): Promise<any> {
    this.checkInitialized();
    try {
      // Get activities in the date range and calculate summary
      const activities = await this.gc.getActivities(0, 100);
      const startTime = new Date(startDate).getTime();
      const endTime = new Date(endDate).getTime() + 86400000; // End of day

      const filtered = (activities as any[]).filter((a: any) => {
        const actTime = new Date(a.startTimeLocal || a.startTimeGMT).getTime();
        return actTime >= startTime && actTime <= endTime;
      });

      let totalDistance = 0;
      let totalDuration = 0;
      let totalCalories = 0;
      let activityCount = 0;

      for (const act of filtered) {
        totalDistance += act.distance || 0;
        totalDuration += act.duration || 0;
        totalCalories += act.calories || 0;
        activityCount++;
      }

      return {
        startDate,
        endDate,
        metric,
        activityCount,
        totalDistance: Math.round(totalDistance),
        totalDistanceKm: (totalDistance / 1000).toFixed(2),
        totalDuration: Math.round(totalDuration),
        totalDurationMinutes: Math.round(totalDuration / 60),
        totalCalories: Math.round(totalCalories),
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error fetching progress summary:', error);
      throw err;
    }
  }

  /**
   * Get daily summary for a date
   */
  async getDailySummary(date: string): Promise<any> {
    this.checkInitialized();
    try {
      // Use library method to get daily stats
      const dateObj = new Date(date);
      const steps = await this.gc.getSteps(dateObj);
      const heartRate = await this.gc.getHeartRate(dateObj);

      return {
        date,
        steps,
        heartRate,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      if (error.includes('404') || error.includes('403')) {
        return { date, message: 'No daily summary for this date' };
      }
      logger.error('Error fetching daily summary:', error);
      throw err;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // v3.0 - NEW TOOLS FROM PYTHON API
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get user summary/stats for a specific date (comprehensive daily summary)
   */
  async getUserSummary(date: string): Promise<any> {
    this.checkInitialized();
    try {
      const displayName = this.displayName || (await this.gc.getUserProfile())?.displayName;
      const url = `https://connectapi.garmin.com/usersummary-service/usersummary/daily/${displayName}`;
      const params = { calendarDate: date };
      const summary = await this.gc.get(url, { params });
      return summary;
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      if (error.includes('404')) {
        return { date, message: 'No user summary for this date' };
      }
      logger.error('Error fetching user summary:', error);
      throw err;
    }
  }

  /**
   * Get step data chart for a specific date
   */
  async getStepsData(date: string): Promise<any> {
    this.checkInitialized();
    try {
      const displayName = this.displayName || (await this.gc.getUserProfile())?.displayName;
      const url = `https://connectapi.garmin.com/wellness-service/wellness/dailySummaryChart/${displayName}`;
      const params = { date };
      const data = await this.gc.get(url, { params });
      return data || [];
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      if (error.includes('404')) {
        return [];
      }
      logger.error('Error fetching steps data:', error);
      throw err;
    }
  }

  /**
   * Get daily steps in a date range
   */
  async getDailySteps(startDate: string, endDate: string): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/usersummary-service/stats/steps/daily/${startDate}/${endDate}`;
      const data = await this.gc.get(url);
      return data || [];
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error fetching daily steps:', error);
      throw err;
    }
  }

  /**
   * Get activities filtered by date range
   */
  async getActivitiesByDate(
    startDate: string,
    endDate?: string,
    activityType?: string,
    sortOrder?: string
  ): Promise<any[]> {
    this.checkInitialized();
    try {
      const activities: any[] = [];
      let start = 0;
      const limit = 20;
      const url = 'https://connectapi.garmin.com/activitylist-service/activities/search/activities';

      const baseParams: Record<string, string> = {
        startDate,
        limit: String(limit),
      };

      if (endDate) baseParams.endDate = endDate;
      if (activityType) baseParams.activityType = activityType;
      if (sortOrder) baseParams.sortOrder = sortOrder;

      while (true) {
        baseParams.start = String(start);
        const result = await this.gc.get(url, { params: baseParams });
        if (result && result.length > 0) {
          activities.push(...result);
          start += limit;
        } else {
          break;
        }
      }

      return activities;
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error fetching activities by date:', error);
      throw err;
    }
  }

  /**
   * Get activities for a specific date
   */
  async getActivitiesForDate(date: string): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/mobile-gateway/heartRate/forDate/${date}`;
      const data = await this.gc.get(url);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error fetching activities for date:', error);
      throw err;
    }
  }

  /**
   * Get typed splits for an activity (more detailed than regular splits)
   */
  async getActivityTypedSplits(activityId: number): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/activity-service/activity/${activityId}/typedsplits`;
      const splits = await this.gc.get(url);
      return { activityId, splits };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      if (error.includes('404')) {
        return { activityId, message: 'No typed splits for this activity' };
      }
      logger.error('Error fetching typed splits:', error);
      throw err;
    }
  }

  /**
   * Get split summaries for an activity
   */
  async getActivitySplitSummaries(activityId: number): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/activity-service/activity/${activityId}/split_summaries`;
      const summaries = await this.gc.get(url);
      return { activityId, summaries };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      if (error.includes('404')) {
        return { activityId, message: 'No split summaries for this activity' };
      }
      logger.error('Error fetching split summaries:', error);
      throw err;
    }
  }

  /**
   * Get resting heart rate for a specific day
   */
  async getRhrDay(date: string): Promise<any> {
    this.checkInitialized();
    try {
      const displayName = this.displayName || (await this.gc.getUserProfile())?.displayName;
      const url = `https://connectapi.garmin.com/userstats-service/wellness/daily/${displayName}`;
      const params = { fromDate: date, untilDate: date, metricId: 60 };
      const data = await this.gc.get(url, { params });
      return { date, ...data };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      if (error.includes('404')) {
        return { date, message: 'No RHR data for this date' };
      }
      logger.error('Error fetching RHR:', error);
      throw err;
    }
  }

  /**
   * Get hill score data
   */
  async getHillScore(startDate: string, endDate?: string): Promise<any> {
    this.checkInitialized();
    try {
      if (!endDate) {
        const url = 'https://connectapi.garmin.com/metrics-service/metrics/hillscore';
        const params = { calendarDate: startDate };
        const data = await this.gc.get(url, { params });
        return { date: startDate, ...data };
      } else {
        const url = 'https://connectapi.garmin.com/metrics-service/metrics/hillscore/stats';
        const params = { startDate, endDate, aggregation: 'daily' };
        const data = await this.gc.get(url, { params });
        return { startDate, endDate, ...data };
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      if (error.includes('404')) {
        return { date: startDate, message: 'No hill score data' };
      }
      logger.error('Error fetching hill score:', error);
      throw err;
    }
  }

  /**
   * Get all day events (auto-detected activities, etc.)
   */
  async getAllDayEvents(date: string): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/wellness-service/wellness/dailyEvents`;
      const params = { calendarDate: date };
      const events = await this.gc.get(url, { params });
      return { date, events: events || [] };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      if (error.includes('404')) {
        return { date, events: [] };
      }
      logger.error('Error fetching all day events:', error);
      throw err;
    }
  }

  /**
   * Add hydration data
   */
  async addHydrationData(valueInMl: number, date?: string, timestamp?: string): Promise<any> {
    this.checkInitialized();
    try {
      const url = 'https://connectapi.garmin.com/usersummary-service/usersummary/hydration/log';
      const calendarDate = date || new Date().toISOString().split('T')[0];
      const timestampLocal = timestamp || new Date().toISOString().replace('Z', '');

      const payload = {
        calendarDate,
        timestampLocal,
        valueInML: valueInMl,
      };

      const result = await this.gc.put(url, payload);
      return { success: true, ...result };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error adding hydration data:', error);
      throw err;
    }
  }

  /**
   * Get available badges
   */
  async getAvailableBadges(): Promise<any> {
    this.checkInitialized();
    try {
      const url = 'https://connectapi.garmin.com/badge-service/badge/available';
      const params = { showExclusiveBadge: 'true' };
      const badges = await this.gc.get(url, { params });
      return { badges: badges || [] };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error fetching available badges:', error);
      throw err;
    }
  }

  /**
   * Get in-progress badges
   */
  async getInProgressBadges(): Promise<any> {
    this.checkInitialized();
    try {
      const earned = await this.getEarnedBadges();
      const available = await this.getAvailableBadges();

      const isInProgress = (badge: any) => {
        const progress = badge?.badgeProgressValue;
        if (!progress || progress === 0) return false;
        const target = badge?.badgeTargetValue;
        if (progress === target) {
          if (badge?.badgeLimitCount == null) return false;
          return (badge?.badgeEarnedNumber || 0) < badge.badgeLimitCount;
        }
        return true;
      };

      const earnedInProgress = (earned.badges || []).filter(isInProgress);
      const availableInProgress = (available.badges || []).filter(isInProgress);

      const combined: Record<string, any> = {};
      for (const b of earnedInProgress) {
        combined[b.badgeId] = b;
      }
      for (const b of availableInProgress) {
        combined[b.badgeId] = b;
      }

      return { badges: Object.values(combined) };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error fetching in-progress badges:', error);
      throw err;
    }
  }

  /**
   * Get available badge challenges
   */
  async getAvailableBadgeChallenges(start: number = 1, limit: number = 30): Promise<any> {
    this.checkInitialized();
    try {
      const url = 'https://connectapi.garmin.com/badgechallenge-service/badgeChallenge/available';
      const params = { start: String(Math.max(1, start)), limit: String(limit) };
      const challenges = await this.gc.get(url, { params });
      return { challenges: challenges || [] };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error fetching available badge challenges:', error);
      throw err;
    }
  }

  /**
   * Get non-completed badge challenges
   */
  async getNonCompletedBadgeChallenges(start: number = 1, limit: number = 30): Promise<any> {
    this.checkInitialized();
    try {
      const url = 'https://connectapi.garmin.com/badgechallenge-service/badgeChallenge/non-completed';
      const params = { start: String(Math.max(1, start)), limit: String(limit) };
      const challenges = await this.gc.get(url, { params });
      return { challenges: challenges || [] };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error fetching non-completed badge challenges:', error);
      throw err;
    }
  }

  /**
   * Get in-progress virtual challenges
   */
  async getInProgressVirtualChallenges(start: number = 1, limit: number = 30): Promise<any> {
    this.checkInitialized();
    try {
      const url = 'https://connectapi.garmin.com/badgechallenge-service/virtualChallenge/inProgress';
      const params = { start: String(Math.max(1, start)), limit: String(limit) };
      const challenges = await this.gc.get(url, { params });
      return { challenges: challenges || [] };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error fetching in-progress virtual challenges:', error);
      throw err;
    }
  }

  /**
   * Remove gear from an activity
   */
  async removeGearFromActivity(gearUUID: string, activityId: number): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/gear-service/gear/unlink/${gearUUID}/activity/${activityId}`;
      const result = await this.gc.put(url, {});
      return {
        success: true,
        gearUUID,
        activityId,
        message: 'Gear removed from activity',
        ...result,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error removing gear from activity:', error);
      throw err;
    }
  }

  /**
   * Get activities where gear was used
   */
  async getGearActivities(gearUUID: string, limit: number = 100): Promise<any[]> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/activitylist-service/activities/${gearUUID}/gear`;
      const params = { start: '0', limit: String(Math.min(limit, 1000)) };
      const activities = await this.gc.get(url, { params });
      return activities || [];
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      if (error.includes('404')) {
        return [];
      }
      logger.error('Error fetching gear activities:', error);
      throw err;
    }
  }

  /**
   * Get training plans
   */
  async getTrainingPlans(): Promise<any> {
    this.checkInitialized();
    try {
      const url = 'https://connectapi.garmin.com/trainingplan-service/trainingplan/plans';
      const plans = await this.gc.get(url);
      return { plans: plans || [] };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error fetching training plans:', error);
      throw err;
    }
  }

  /**
   * Get training plan by ID
   */
  async getTrainingPlanById(planId: string): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/trainingplan-service/trainingplan/phased/${planId}`;
      const plan = await this.gc.get(url);
      return plan;
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      if (error.includes('404')) {
        return { message: 'Training plan not found' };
      }
      logger.error('Error fetching training plan:', error);
      throw err;
    }
  }

  /**
   * Get menstrual data for a date
   */
  async getMenstrualDataForDate(date: string): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/periodichealth-service/menstrualcycle/dayview/${date}`;
      const data = await this.gc.get(url);
      return { date, ...data };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      if (error.includes('404')) {
        return { date, message: 'No menstrual data for this date' };
      }
      logger.error('Error fetching menstrual data:', error);
      throw err;
    }
  }

  /**
   * Get menstrual calendar data for a date range
   */
  async getMenstrualCalendarData(startDate: string, endDate: string): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/periodichealth-service/menstrualcycle/calendar/${startDate}/${endDate}`;
      const data = await this.gc.get(url);
      return { startDate, endDate, ...data };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      if (error.includes('404')) {
        return { startDate, endDate, message: 'No menstrual calendar data' };
      }
      logger.error('Error fetching menstrual calendar data:', error);
      throw err;
    }
  }

  /**
   * Get pregnancy summary/snapshot
   */
  async getPregnancySummary(): Promise<any> {
    this.checkInitialized();
    try {
      const url = 'https://connectapi.garmin.com/periodichealth-service/menstrualcycle/pregnancysnapshot';
      const data = await this.gc.get(url);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      if (error.includes('404')) {
        return { message: 'No pregnancy data available' };
      }
      logger.error('Error fetching pregnancy summary:', error);
      throw err;
    }
  }

  /**
   * Request data reload for a specific date (for older data that was offloaded)
   */
  async requestReload(date: string): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/wellness-service/wellness/epoch/request/${date}`;
      const result = await this.gc.post(url, {});
      return { success: true, date, ...result };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error requesting data reload:', error);
      throw err;
    }
  }

  /**
   * Get activity types available in Garmin
   */
  async getActivityTypes(): Promise<any> {
    this.checkInitialized();
    try {
      const url = 'https://connectapi.garmin.com/activity-service/activity/activityTypes';
      const types = await this.gc.get(url);
      return types || [];
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error fetching activity types:', error);
      throw err;
    }
  }

  /**
   * Get primary training device info
   */
  async getPrimaryTrainingDevice(): Promise<any> {
    this.checkInitialized();
    try {
      const url = 'https://connectapi.garmin.com/web-gateway/device-info/primary-training-device';
      const device = await this.gc.get(url);
      return device;
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      if (error.includes('404')) {
        return { message: 'No primary training device set' };
      }
      logger.error('Error fetching primary training device:', error);
      throw err;
    }
  }

  /**
   * Get device solar data
   */
  async getDeviceSolarData(deviceId: string, startDate: string, endDate?: string): Promise<any> {
    this.checkInitialized();
    try {
      const end = endDate || startDate;
      const singleDay = !endDate;
      const url = `https://connectapi.garmin.com/web-gateway/solar/${deviceId}/${startDate}/${end}`;
      const params = { singleDayView: singleDay };
      const data = await this.gc.get(url, { params });
      return data?.deviceSolarInput || [];
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      if (error.includes('404')) {
        return [];
      }
      logger.error('Error fetching device solar data:', error);
      throw err;
    }
  }

  /**
   * Count total activities
   */
  async countActivities(): Promise<number> {
    this.checkInitialized();
    try {
      const count = await this.gc.countActivities();
      return typeof count === 'object' ? count.totalCount || 0 : count;
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error counting activities:', error);
      throw err;
    }
  }

  /**
   * Get fitness stats for activities
   */
  async getFitnessStats(
    startDate: string,
    endDate: string,
    metric: string = 'distance',
    groupByActivities: boolean = true
  ): Promise<any> {
    this.checkInitialized();
    try {
      const url = 'https://connectapi.garmin.com/fitnessstats-service/activity';
      const params = {
        startDate,
        endDate,
        aggregation: 'lifetime',
        groupByParentActivityType: String(groupByActivities),
        metric,
      };
      const stats = await this.gc.get(url, { params });
      return stats;
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Error fetching fitness stats:', error);
      throw err;
    }
  }

  /**
   * Get scheduled workout by ID
   */
  async getScheduledWorkoutById(scheduledWorkoutId: string): Promise<any> {
    this.checkInitialized();
    try {
      const url = `https://connectapi.garmin.com/workout-service/schedule/${scheduledWorkoutId}`;
      const workout = await this.gc.get(url);
      return workout;
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      if (error.includes('404')) {
        return { message: 'Scheduled workout not found' };
      }
      logger.error('Error fetching scheduled workout:', error);
      throw err;
    }
  }
}
