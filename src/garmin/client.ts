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
      // Endpoint: /wellness-service/wellness/dailyStress/{date}
      const url = `https://connect.garmin.com/modern/proxy/wellness-service/wellness/dailyStress/${date}`;
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
      // Endpoint: /wellness-service/wellness/bodyBattery/reports/daily
      const url = `https://connect.garmin.com/modern/proxy/wellness-service/wellness/bodyBattery/reports/daily`;
      const params = { startDate: startDate, endDate: end };
      const batteryData = await this.gc.get(url, params);

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
      const url = `https://connect.garmin.com/modern/proxy/wellness-service/wellness/bodyBattery/events/${date}`;
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
      const url = `https://connect.garmin.com/modern/proxy/hrv-service/hrv/${date}`;
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
      const url = `https://connect.garmin.com/modern/proxy/wellness-service/wellness/daily/respiration/${date}`;
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
      const url = `https://connect.garmin.com/modern/proxy/wellness-service/wellness/daily/spo2/${date}`;
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
}
