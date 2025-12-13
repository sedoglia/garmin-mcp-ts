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

  // ═══════════════════════════════════════════════════════════════
  // NUOVI TOOL v2.0 - PRIORITÀ 1: Workout Management
  // ═══════════════════════════════════════════════════════════════
  GET_WORKOUT_BY_ID: 'get_workout_by_id',
  DOWNLOAD_WORKOUT: 'download_workout',
  CREATE_WORKOUT: 'create_workout',
  UPDATE_WORKOUT: 'update_workout',
  DELETE_WORKOUT: 'delete_workout',
  SCHEDULE_WORKOUT: 'schedule_workout',

  // ═══════════════════════════════════════════════════════════════
  // NUOVI TOOL v2.0 - PRIORITÀ 2: Activity Management
  // ═══════════════════════════════════════════════════════════════
  UPLOAD_ACTIVITY: 'upload_activity',
  CREATE_MANUAL_ACTIVITY: 'create_manual_activity',
  SET_ACTIVITY_NAME: 'set_activity_name',
  SET_ACTIVITY_TYPE: 'set_activity_type',
  DELETE_ACTIVITY: 'delete_activity',
  DOWNLOAD_ACTIVITY: 'download_activity',

  // ═══════════════════════════════════════════════════════════════
  // NUOVI TOOL v2.0 - Device & Settings
  // ═══════════════════════════════════════════════════════════════
  GET_DEVICE_LAST_USED: 'get_device_last_used',
  GET_DEVICE_SETTINGS: 'get_device_settings',

  // ═══════════════════════════════════════════════════════════════
  // NUOVI TOOL v2.0 - Health & Wellness Avanzati
  // ═══════════════════════════════════════════════════════════════
  GET_ALL_DAY_STRESS: 'get_all_day_stress',
  GET_FLOORS: 'get_floors',
  GET_INTENSITY_MINUTES: 'get_intensity_minutes',
  GET_MAX_METRICS: 'get_max_metrics',
  GET_TRAINING_READINESS: 'get_training_readiness',
  GET_ENDURANCE_SCORE: 'get_endurance_score',
  GET_FITNESS_AGE: 'get_fitness_age',

  // ═══════════════════════════════════════════════════════════════
  // NUOVI TOOL v2.0 - Weight & Body
  // ═══════════════════════════════════════════════════════════════
  GET_WEIGH_INS: 'get_weigh_ins',
  ADD_WEIGH_IN: 'add_weigh_in',
  DELETE_WEIGH_IN: 'delete_weigh_in',
  GET_BLOOD_PRESSURE: 'get_blood_pressure',
  SET_BLOOD_PRESSURE: 'set_blood_pressure',

  // ═══════════════════════════════════════════════════════════════
  // NUOVI TOOL v2.0 - Activity Details Avanzati
  // ═══════════════════════════════════════════════════════════════
  GET_ACTIVITY_WEATHER: 'get_activity_weather',
  GET_ACTIVITY_HR_ZONES: 'get_activity_hr_zones',
  GET_ACTIVITY_GEAR: 'get_activity_gear',
  GET_ACTIVITY_EXERCISE_SETS: 'get_activity_exercise_sets',

  // ═══════════════════════════════════════════════════════════════
  // NUOVI TOOL v2.0 - Goals, Challenges & Records
  // ═══════════════════════════════════════════════════════════════
  GET_GOALS: 'get_goals',
  GET_ADHOC_CHALLENGES: 'get_adhoc_challenges',
  GET_BADGE_CHALLENGES: 'get_badge_challenges',
  GET_EARNED_BADGES: 'get_earned_badges',
  GET_PERSONAL_RECORDS: 'get_personal_records',
  GET_RACE_PREDICTIONS: 'get_race_predictions',

  // ═══════════════════════════════════════════════════════════════
  // NUOVI TOOL v2.0 - Gear Management
  // ═══════════════════════════════════════════════════════════════
  GET_GEAR: 'get_gear',
  GET_GEAR_DEFAULTS: 'get_gear_defaults',
  GET_GEAR_STATS: 'get_gear_stats',
  LINK_GEAR_TO_ACTIVITY: 'link_gear_to_activity',

  // ═══════════════════════════════════════════════════════════════
  // NUOVI TOOL v2.0 - Reports & Progress
  // ═══════════════════════════════════════════════════════════════
  GET_PROGRESS_SUMMARY: 'get_progress_summary',
  GET_DAILY_SUMMARY: 'get_daily_summary',
} as const;
