// src/utils/constants.ts

export const GARMIN_API_BASE_URL = 'https://connect.garmin.com/api';

export const GARMIN_ENDPOINTS = {
  LOGIN: '/signin',
  ACTIVITIES: '/activitylist-service/activities',
  ACTIVITY_DETAILS: '/activityservice/activity',
  HEALTH_METRICS: '/healthcheck-service/healthcheck',
  SLEEP: '/sleep-service/sleep',
  BODY_COMPOSITION: '/weight-service/weight/latest',
  DEVICES: '/device-service/deviceregistration/devices/current',
  USER_PROFILE: '/userprofile-service/userprofile/v2/information',
  TRAINING_STATUS: '/trainingStatus-service/trainingStatus',
  HEART_RATE: '/hrv-service/hrv',
} as const;

export const ACTIVITY_TYPES = {
  RUN: 'running',
  CYCLING: 'cycling',
  SWIMMING: 'swimming',
  WALKING: 'walking',
  HIKING: 'hiking',
  STRENGTH: 'strength_training',
  YOGA: 'yoga',
  CARDIO: 'cardio',
} as const;

export const DEFAULT_CACHE_TTL = 3600; // 1 hour
export const API_TIMEOUT = 30000; // 30 seconds
export const MAX_RETRIES = 3;
export const RETRY_DELAY = 1000; // 1 second

export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
} as const;

export const MCP_TOOL_NAMES = {
  // Tool esistenti
  LIST_RECENT_ACTIVITIES: 'list_recent_activities',
  GET_ACTIVITY_DETAILS: 'get_activity_details',
  GET_HEALTH_METRICS: 'get_health_metrics',
  GET_SLEEP_DATA: 'get_sleep_data',
  GET_BODY_COMPOSITION: 'get_body_composition',
  GET_DEVICES: 'get_devices',
  GET_USER_PROFILE: 'get_user_profile',
  GET_TRAINING_STATUS: 'get_training_status',
  // Nuovi tool v1.1
  GET_STEPS: 'get_steps',
  GET_HEART_RATE: 'get_heart_rate',
  GET_HYDRATION: 'get_hydration',
  GET_WORKOUTS: 'get_workouts',
  GET_ACTIVITY_SPLITS: 'get_activity_splits',
  // Nuovi tool v1.2 - Wellness
  GET_STRESS_DATA: 'get_stress_data',
  GET_BODY_BATTERY: 'get_body_battery',
  GET_HRV_DATA: 'get_hrv_data',
  GET_RESPIRATION_DATA: 'get_respiration_data',
  GET_SPO2_DATA: 'get_spo2_data',
} as const;
