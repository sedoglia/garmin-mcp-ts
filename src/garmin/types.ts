// src/garmin/types.ts

import { z } from 'zod';

// Activity Types
export const ActivitySchema = z.object({
  activityId: z.number(),
  activityName: z.string(),
  description: z.string().optional(),
  startTimeInSeconds: z.number(),
  elapsedDurationInSeconds: z.number(),
  movingDurationInSeconds: z.number(),
  distance: z.number().optional(),
  averageSpeed: z.number().optional(),
  maxSpeed: z.number().optional(),
  averageHeartRate: z.number().optional(),
  maxHeartRate: z.number().optional(),
  calories: z.number().optional(),
  elevationGain: z.number().optional(),
  elevationLoss: z.number().optional(),
  activityType: z.object({
    typeId: z.number(),
    typeKey: z.string(),
  }),
  userProfileId: z.number(),
  manufacturerName: z.string(),
  productName: z.string(),
  isMultiSportActivity: z.boolean().default(false),
});

export type Activity = z.infer<typeof ActivitySchema>;

// Health Metrics
export const HealthMetricsSchema = z.object({
  date: z.string(),
  steps: z.number().optional(),
  heartRateData: z.object({
    lastNight: z.number().optional(),
    lastNightFiveMinuteValues: z.array(z.number()).optional(),
    heartRateValueDescriptors: z.array(z.any()).optional(),
  }).optional(),
  floorsAscended: z.number().optional(),
  floorsDescended: z.number().optional(),
  vo2Max: z.object({
    create: z.number().optional(),
    createSourceType: z.object({
      display: z.string(),
    }).optional(),
  }).optional(),
  rmsb: z.number().optional(),
});

export type HealthMetrics = z.infer<typeof HealthMetricsSchema>;

// Sleep Data
export const SleepDataSchema = z.object({
  calendarDate: z.string(),
  sleepStartTimestampGMT: z.number().optional(),
  sleepEndTimestampGMT: z.number().optional(),
  duration: z.number().optional(),
  sleepQualityScore: z.number().optional(),
  deepSleepDuration: z.number().optional(),
  remSleepDuration: z.number().optional(),
  lightSleepDuration: z.number().optional(),
  awakeDuration: z.number().optional(),
  sleepStages: z.array(z.any()).optional(),
});

export type SleepData = z.infer<typeof SleepDataSchema>;

// Body Composition
export const BodyCompositionSchema = z.object({
  date: z.number(),
  weight: z.number(),
  bmi: z.number().optional(),
  bodyFatPercentage: z.number().optional(),
  muscleMass: z.number().optional(),
  boneMass: z.number().optional(),
  physicalAge: z.number().optional(),
  metabolicAge: z.number().optional(),
  visceralFat: z.number().optional(),
});

export type BodyComposition = z.infer<typeof BodyCompositionSchema>;

// Device
export const DeviceSchema = z.object({
  uuid: z.string(),
  displayName: z.string(),
  manufacturerName: z.string(),
  productName: z.string(),
  deviceTypeName: z.string(),
  softwareVersion: z.string().optional(),
  hardwareVersion: z.string().optional(),
  isBatteryPercentageVisible: z.boolean().default(false),
  batteryLevel: z.number().optional(),
  batteryStatus: z.string().optional(),
  createTimeInMs: z.number().optional(),
});

export type Device = z.infer<typeof DeviceSchema>;

// User Profile
export const UserProfileSchema = z.object({
  id: z.number(),
  username: z.string(),
  displayName: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  gender: z.string().optional(),
  birthdate: z.string().optional(),
  profileImageUrl: z.string().optional(),
  timeZone: z.object({
    id: z.number(),
    displayName: z.string(),
  }).optional(),
  preferences: z.record(z.any()).optional(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// Training Status
export const TrainingStatusSchema = z.object({
  calendarDate: z.string(),
  trainingBalance: z.number().optional(),
  modifiedDateTimeInMs: z.number().optional(),
  vo2MaxValue: z.number().optional(),
  vo2MaxValueRaw: z.number().optional(),
  performanceCondition: z.number().optional(),
  trainingLoadBalance: z.number().optional(),
});

export type TrainingStatus = z.infer<typeof TrainingStatusSchema>;

// Cache Entry
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// OAuth Token
export interface OAuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType: string;
  scope?: string;
}

// API Response
export interface APIResponse<T> {
  data: T;
  statusCode: number;
  headers: Record<string, string>;
}
