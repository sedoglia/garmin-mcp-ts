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
}
