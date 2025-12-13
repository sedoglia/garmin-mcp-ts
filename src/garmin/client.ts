// src/garmin/client.ts

import GarminConnectModule from 'garmin-connect';
import logger from '../utils/logger.js';

// La libreria è CommonJS, quindi l'export default contiene la classe
const GarminConnect = (GarminConnectModule as any).GarminConnect || GarminConnectModule;

export class GarminConnectClient {
  private gc: any;
  private initialized: boolean = false;

  constructor() {
    // Non inizializzare qui, lo faremo in initialize()
  }

  async initialize(email: string, password: string): Promise<void> {
    try {
      logger.info('🔐 Authenticating with Garmin Connect...');
      // Passa le credenziali al costruttore
      this.gc = new GarminConnect({ username: email, password: password });
      await this.gc.login();
      this.initialized = true;
      logger.info('✅ Authentication successful');
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error('Failed to initialize Garmin client:', error);
      throw err;
    }
  }

  private checkInitialized(): void {
    if (!this.initialized) {
      throw new Error('Garmin client not initialized. Call initialize() first.');
    }
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

      // Calculate estimated duration from steps
      let estimatedDuration = 0;
      for (const segment of workout.workoutSegments) {
        for (const step of segment.workoutSteps) {
          if (step.endCondition === 'time' && step.endConditionValue) {
            estimatedDuration += step.endConditionValue;
          } else if (step.endCondition === 'distance' && step.endConditionValue) {
            // Estimate ~6 min/km for running
            estimatedDuration += (step.endConditionValue / 1000) * 360;
          }
        }
      }

      const workoutPayload = {
        workoutName: workout.workoutName,
        description: workout.description || null,
        sportType,
        estimatedDurationInSecs: estimatedDuration || 1800,
        estimatedDistanceInMeters: null,
        estimateType: null,
        estimatedDistanceUnit: { unitId: null, unitKey: null, factor: null },
        poolLength: 0,
        poolLengthUnit: { unitId: null, unitKey: null, factor: null },
        workoutProvider: null,
        workoutSourceId: null,
        consumer: null,
        atpPlanId: null,
        workoutNameI18nKey: null,
        descriptionI18nKey: null,
        shared: false,
        estimated: false,
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
}
