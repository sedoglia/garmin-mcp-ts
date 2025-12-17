// src/mcp/tools.ts

import { MCP_TOOL_NAMES } from '../utils/constants.js';

// Definizioni JSON Schema per i tool MCP
// Usiamo oggetti JSON puri invece di Zod per evitare problemi di serializzazione

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      minimum?: number;
      maximum?: number;
      pattern?: string;
    }>;
    required?: string[];
  };
}

export const toolDefinitions: ToolDefinition[] = [
  {
    name: MCP_TOOL_NAMES.LIST_RECENT_ACTIVITIES,
    description: 'Get a list of recent activities from Garmin Connect. Returns activity summaries including name, type, distance, duration, and date.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of activities to return (1-100)',
          minimum: 1,
          maximum: 100,
        },
        start: {
          type: 'number',
          description: 'Starting index for pagination (0-based)',
          minimum: 0,
        },
      },
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_ACTIVITY_DETAILS,
    description: 'Get detailed information about a specific activity including splits, heart rate zones, and GPS data.',
    inputSchema: {
      type: 'object',
      properties: {
        activityId: {
          type: 'number',
          description: 'The unique activity identifier (required)',
        },
      },
      required: ['activityId'],
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_HEALTH_METRICS,
    description: 'Get daily health metrics including heart rate data and step count for a specific date.',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format. Defaults to today if not specified.',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_SLEEP_DATA,
    description: 'Get detailed sleep information including duration, sleep stages, and quality score.',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format. Defaults to today if not specified.',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_BODY_COMPOSITION,
    description: 'Get body composition data including weight measurements.',
    inputSchema: {
      type: 'object',
      properties: {
        days: {
          type: 'number',
          description: 'Number of days of historical data (1-365)',
          minimum: 1,
          maximum: 365,
        },
      },
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_DEVICES,
    description: 'Get information about connected Garmin devices and user settings.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_USER_PROFILE,
    description: 'Get user profile information including display name and account details.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_TRAINING_STATUS,
    description: 'Get training status including activity count and user fitness settings.',
    inputSchema: {
      type: 'object',
      properties: {
        days: {
          type: 'number',
          description: 'Number of days for statistics (1-365)',
          minimum: 1,
          maximum: 365,
        },
      },
    },
  },
  // Nuovi tool
  {
    name: MCP_TOOL_NAMES.GET_STEPS,
    description: 'Get step count for a specific date. Returns the total number of steps recorded.',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format. Defaults to today if not specified.',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_HEART_RATE,
    description: 'Get detailed heart rate data for a specific date including resting HR, max HR, and HR zones.',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format. Defaults to today if not specified.',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_HYDRATION,
    description: 'Get daily hydration/water intake data for a specific date.',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format. Defaults to today if not specified.',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_WORKOUTS,
    description: 'Get list of scheduled/planned workouts from Garmin Connect.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of workouts to return (1-100)',
          minimum: 1,
          maximum: 100,
        },
        start: {
          type: 'number',
          description: 'Starting index for pagination (0-based)',
          minimum: 0,
        },
      },
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_ACTIVITY_SPLITS,
    description: 'Get split/lap data for a specific activity including pace, distance, and time for each split.',
    inputSchema: {
      type: 'object',
      properties: {
        activityId: {
          type: 'number',
          description: 'The unique activity identifier (required)',
        },
      },
      required: ['activityId'],
    },
  },
  // ═══════════════════════════════════════════════════════════════
  // NUOVI TOOL v1.2 - Wellness (Stress, Body Battery, HRV, etc.)
  // ═══════════════════════════════════════════════════════════════
  {
    name: MCP_TOOL_NAMES.GET_STRESS_DATA,
    description: 'Get stress level data for a specific date. Returns stress levels throughout the day (0-100 scale), with 0-25 resting, 26-50 low, 51-75 medium, 76-100 high stress. Includes overall stress level, durations by category, and detailed timestamp values.',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format. Defaults to today if not specified.',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_BODY_BATTERY,
    description: 'Get Body Battery energy level data for a date range. Body Battery tracks energy levels (0-100) throughout the day based on sleep, stress, and activity. Shows charged/drained periods and sleep quality impact.',
    inputSchema: {
      type: 'object',
      properties: {
        startDate: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format. Defaults to today if not specified.',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        endDate: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format. Defaults to startDate if not specified.',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_HRV_DATA,
    description: 'Get Heart Rate Variability (HRV) data for a specific date. HRV measures the variation in time between heartbeats, indicating recovery and stress levels.',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format. Defaults to today if not specified.',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_RESPIRATION_DATA,
    description: 'Get respiration/breathing rate data for a specific date. Shows breaths per minute throughout the day and during sleep.',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format. Defaults to today if not specified.',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_SPO2_DATA,
    description: 'Get SpO2 (blood oxygen saturation) data for a specific date. Shows pulse oximetry readings as percentage (typically 95-100% is normal).',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format. Defaults to today if not specified.',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // v2.0 - PRIORITÀ 1: WORKOUT MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: MCP_TOOL_NAMES.GET_WORKOUT_BY_ID,
    description: 'Get detailed information about a specific workout by its ID.',
    inputSchema: {
      type: 'object',
      properties: {
        workoutId: {
          type: 'string',
          description: 'The unique workout identifier (required)',
        },
      },
      required: ['workoutId'],
    },
  },
  {
    name: MCP_TOOL_NAMES.DOWNLOAD_WORKOUT,
    description: 'Download a workout in FIT format for syncing to a Garmin device.',
    inputSchema: {
      type: 'object',
      properties: {
        workoutId: {
          type: 'string',
          description: 'The unique workout identifier (required)',
        },
      },
      required: ['workoutId'],
    },
  },
  {
    name: MCP_TOOL_NAMES.CREATE_WORKOUT,
    description: `Create a new structured workout in Garmin Connect. Supports complex interval workouts with warmup, cooldown, and repeat blocks.

Example for interval running workout:
{
  "workoutName": "5x3min Intervals",
  "sportType": "running",
  "description": "Interval training",
  "workoutSegments": [{
    "segmentOrder": 1,
    "sportType": "running",
    "workoutSteps": [
      { "stepOrder": 1, "stepType": "warmup", "endCondition": "time", "endConditionValue": 600 },
      { "stepOrder": 2, "stepType": "interval", "endCondition": "time", "endConditionValue": 180, "targetType": "pace" },
      { "stepOrder": 3, "stepType": "recovery", "endCondition": "time", "endConditionValue": 120 },
      { "stepOrder": 4, "stepType": "cooldown", "endCondition": "time", "endConditionValue": 600 }
    ]
  }]
}`,
    inputSchema: {
      type: 'object',
      properties: {
        workoutName: {
          type: 'string',
          description: 'Name of the workout (required)',
        },
        sportType: {
          type: 'string',
          description: 'Sport type: running, cycling, swimming, strength, cardio, walking, hiking, yoga',
        },
        description: {
          type: 'string',
          description: 'Optional workout description',
        },
        workoutSegments: {
          type: 'array',
          description: 'Array of workout segments containing steps',
        },
      },
      required: ['workoutName', 'sportType', 'workoutSegments'],
    },
  },
  {
    name: MCP_TOOL_NAMES.UPDATE_WORKOUT,
    description: 'Update an existing workout (name, description, or structure).',
    inputSchema: {
      type: 'object',
      properties: {
        workoutId: {
          type: 'string',
          description: 'The unique workout identifier (required)',
        },
        workoutName: {
          type: 'string',
          description: 'New name for the workout',
        },
        description: {
          type: 'string',
          description: 'New description for the workout',
        },
        workoutSegments: {
          type: 'array',
          description: 'Updated workout segments',
        },
      },
      required: ['workoutId'],
    },
  },
  {
    name: MCP_TOOL_NAMES.DELETE_WORKOUT,
    description: 'Delete a workout from Garmin Connect.',
    inputSchema: {
      type: 'object',
      properties: {
        workoutId: {
          type: 'string',
          description: 'The unique workout identifier (required)',
        },
      },
      required: ['workoutId'],
    },
  },
  {
    name: MCP_TOOL_NAMES.SCHEDULE_WORKOUT,
    description: 'Schedule an existing workout on a specific date.',
    inputSchema: {
      type: 'object',
      properties: {
        workoutId: {
          type: 'string',
          description: 'The unique workout identifier (required)',
        },
        date: {
          type: 'string',
          description: 'Date to schedule workout in YYYY-MM-DD format (required)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
      required: ['workoutId', 'date'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // v2.0 - PRIORITÀ 2: ACTIVITY MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: MCP_TOOL_NAMES.UPLOAD_ACTIVITY,
    description: 'Upload an activity file (FIT, GPX, TCX format) to Garmin Connect.',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'Full path to the activity file (required)',
        },
      },
      required: ['filePath'],
    },
  },
  {
    name: MCP_TOOL_NAMES.CREATE_MANUAL_ACTIVITY,
    description: 'Create a manual activity entry in Garmin Connect.',
    inputSchema: {
      type: 'object',
      properties: {
        activityName: {
          type: 'string',
          description: 'Name of the activity (required)',
        },
        activityType: {
          type: 'string',
          description: 'Type of activity: running, cycling, swimming, walking, hiking, strength_training, yoga, etc. (required)',
        },
        startTime: {
          type: 'string',
          description: 'Start time in ISO format YYYY-MM-DDTHH:MM:SS (required)',
        },
        duration: {
          type: 'number',
          description: 'Duration in seconds (required)',
        },
        distance: {
          type: 'number',
          description: 'Distance in meters (optional)',
        },
        calories: {
          type: 'number',
          description: 'Calories burned (optional)',
        },
        description: {
          type: 'string',
          description: 'Activity description (optional)',
        },
      },
      required: ['activityName', 'activityType', 'startTime', 'duration'],
    },
  },
  {
    name: MCP_TOOL_NAMES.SET_ACTIVITY_NAME,
    description: 'Change the name of an existing activity.',
    inputSchema: {
      type: 'object',
      properties: {
        activityId: {
          type: 'number',
          description: 'The unique activity identifier (required)',
        },
        name: {
          type: 'string',
          description: 'New name for the activity (required)',
        },
      },
      required: ['activityId', 'name'],
    },
  },
  {
    name: MCP_TOOL_NAMES.SET_ACTIVITY_TYPE,
    description: 'Change the type/category of an existing activity.',
    inputSchema: {
      type: 'object',
      properties: {
        activityId: {
          type: 'number',
          description: 'The unique activity identifier (required)',
        },
        typeKey: {
          type: 'string',
          description: 'Activity type key: running, cycling, swimming, walking, etc. (required)',
        },
        typeId: {
          type: 'number',
          description: 'Optional activity type ID',
        },
      },
      required: ['activityId', 'typeKey'],
    },
  },
  {
    name: MCP_TOOL_NAMES.DELETE_ACTIVITY,
    description: 'Delete an activity from Garmin Connect. WARNING: This action cannot be undone.',
    inputSchema: {
      type: 'object',
      properties: {
        activityId: {
          type: 'number',
          description: 'The unique activity identifier (required)',
        },
      },
      required: ['activityId'],
    },
  },
  {
    name: MCP_TOOL_NAMES.DOWNLOAD_ACTIVITY,
    description: 'Download an activity in various formats (FIT, TCX, GPX, KML, CSV).',
    inputSchema: {
      type: 'object',
      properties: {
        activityId: {
          type: 'number',
          description: 'The unique activity identifier (required)',
        },
        format: {
          type: 'string',
          description: 'Download format: fit, tcx, gpx, kml, csv. Defaults to fit.',
        },
      },
      required: ['activityId'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // v2.0 - DEVICE & SETTINGS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: MCP_TOOL_NAMES.GET_DEVICE_LAST_USED,
    description: 'Get information about the last used Garmin device.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_DEVICE_SETTINGS,
    description: 'Get settings for a specific Garmin device.',
    inputSchema: {
      type: 'object',
      properties: {
        deviceId: {
          type: 'string',
          description: 'The device identifier (required)',
        },
      },
      required: ['deviceId'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // v2.0 - HEALTH & WELLNESS AVANZATI
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: MCP_TOOL_NAMES.GET_ALL_DAY_STRESS,
    description: 'Get detailed all-day stress data with full breakdown.',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format.',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_FLOORS,
    description: 'Get floors climbed data for a specific date.',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format.',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_INTENSITY_MINUTES,
    description: 'Get intensity minutes (moderate and vigorous) for a specific date.',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format.',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_MAX_METRICS,
    description: 'Get max metrics including VO2 max and related fitness data.',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format.',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_TRAINING_READINESS,
    description: 'Get training readiness score indicating how prepared your body is for training.',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format.',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_ENDURANCE_SCORE,
    description: 'Get endurance score based on recent training load.',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format.',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_FITNESS_AGE,
    description: 'Get fitness age estimation based on VO2 max and other metrics.',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format.',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // v2.0 - WEIGHT & BODY
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: MCP_TOOL_NAMES.GET_WEIGH_INS,
    description: 'Get weigh-in records for a date range.',
    inputSchema: {
      type: 'object',
      properties: {
        startDate: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format (required)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        endDate: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format (required)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
      required: ['startDate', 'endDate'],
    },
  },
  {
    name: MCP_TOOL_NAMES.ADD_WEIGH_IN,
    description: 'Add a new weigh-in record with optional body composition data.',
    inputSchema: {
      type: 'object',
      properties: {
        weight: {
          type: 'number',
          description: 'Weight in kilograms (required)',
        },
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format (required)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        bodyFatPercent: {
          type: 'number',
          description: 'Body fat percentage (optional)',
        },
        bodyWaterPercent: {
          type: 'number',
          description: 'Body water percentage (optional)',
        },
        muscleMassPercent: {
          type: 'number',
          description: 'Muscle mass percentage (optional)',
        },
        boneMassPercent: {
          type: 'number',
          description: 'Bone mass percentage (optional)',
        },
      },
      required: ['weight', 'date'],
    },
  },
  {
    name: MCP_TOOL_NAMES.DELETE_WEIGH_IN,
    description: 'Delete a weigh-in record.',
    inputSchema: {
      type: 'object',
      properties: {
        weighInId: {
          type: 'string',
          description: 'The unique weigh-in identifier (required)',
        },
      },
      required: ['weighInId'],
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_BLOOD_PRESSURE,
    description: 'Get blood pressure readings for a date range.',
    inputSchema: {
      type: 'object',
      properties: {
        startDate: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format (required)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        endDate: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format (required)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
      required: ['startDate', 'endDate'],
    },
  },
  {
    name: MCP_TOOL_NAMES.SET_BLOOD_PRESSURE,
    description: 'Record a blood pressure reading.',
    inputSchema: {
      type: 'object',
      properties: {
        systolic: {
          type: 'number',
          description: 'Systolic pressure in mmHg (required)',
        },
        diastolic: {
          type: 'number',
          description: 'Diastolic pressure in mmHg (required)',
        },
        pulse: {
          type: 'number',
          description: 'Pulse rate in BPM (required)',
        },
        dateTime: {
          type: 'string',
          description: 'Date and time in ISO format YYYY-MM-DDTHH:MM:SS (required)',
        },
        notes: {
          type: 'string',
          description: 'Optional notes',
        },
      },
      required: ['systolic', 'diastolic', 'pulse', 'dateTime'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // v2.0 - ACTIVITY DETAILS AVANZATI
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: MCP_TOOL_NAMES.GET_ACTIVITY_WEATHER,
    description: 'Get weather conditions during an activity.',
    inputSchema: {
      type: 'object',
      properties: {
        activityId: {
          type: 'number',
          description: 'The unique activity identifier (required)',
        },
      },
      required: ['activityId'],
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_ACTIVITY_HR_ZONES,
    description: 'Get time spent in each heart rate zone during an activity.',
    inputSchema: {
      type: 'object',
      properties: {
        activityId: {
          type: 'number',
          description: 'The unique activity identifier (required)',
        },
      },
      required: ['activityId'],
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_ACTIVITY_GEAR,
    description: 'Get gear/equipment used in an activity.',
    inputSchema: {
      type: 'object',
      properties: {
        activityId: {
          type: 'number',
          description: 'The unique activity identifier (required)',
        },
      },
      required: ['activityId'],
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_ACTIVITY_EXERCISE_SETS,
    description: 'Get exercise sets from a strength training activity.',
    inputSchema: {
      type: 'object',
      properties: {
        activityId: {
          type: 'number',
          description: 'The unique activity identifier (required)',
        },
      },
      required: ['activityId'],
    },
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // v2.0 - GOALS, CHALLENGES & RECORDS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: MCP_TOOL_NAMES.GET_GOALS,
    description: 'Get user goals (active, future, or past).',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Filter by status: active, future, past. Defaults to all.',
        },
      },
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_ADHOC_CHALLENGES,
    description: 'Get ad-hoc challenges history.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_BADGE_CHALLENGES,
    description: 'Get available badge challenges.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_EARNED_BADGES,
    description: 'Get all badges earned by the user.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_PERSONAL_RECORDS,
    description: 'Get all personal records (PRs) across activities.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_RACE_PREDICTIONS,
    description: 'Get predicted race times for 5K, 10K, half marathon, and marathon based on current fitness.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // v2.0 - GEAR MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: MCP_TOOL_NAMES.GET_GEAR,
    description: 'Get all user gear (shoes, bikes, etc.).',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_GEAR_DEFAULTS,
    description: 'Get default gear settings for different activity types.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_GEAR_STATS,
    description: 'Get usage statistics for a specific piece of gear.',
    inputSchema: {
      type: 'object',
      properties: {
        gearUUID: {
          type: 'string',
          description: 'The unique gear identifier (required)',
        },
      },
      required: ['gearUUID'],
    },
  },
  {
    name: MCP_TOOL_NAMES.LINK_GEAR_TO_ACTIVITY,
    description: 'Link a piece of gear to an activity.',
    inputSchema: {
      type: 'object',
      properties: {
        gearUUID: {
          type: 'string',
          description: 'The unique gear identifier (required)',
        },
        activityId: {
          type: 'number',
          description: 'The unique activity identifier (required)',
        },
      },
      required: ['gearUUID', 'activityId'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // v2.0 - REPORTS & PROGRESS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: MCP_TOOL_NAMES.GET_PROGRESS_SUMMARY,
    description: 'Get aggregated progress summary between two dates.',
    inputSchema: {
      type: 'object',
      properties: {
        startDate: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format (required)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        endDate: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format (required)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        metric: {
          type: 'string',
          description: 'Metric to aggregate: distance, duration, calories. Defaults to distance.',
        },
      },
      required: ['startDate', 'endDate'],
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_DAILY_SUMMARY,
    description: 'Get comprehensive daily summary including steps, calories, distance, floors, and more.',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format.',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // v3.0 - NEW TOOLS FROM PYTHON API
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: MCP_TOOL_NAMES.GET_USER_SUMMARY,
    description: 'Get comprehensive user activity summary for a specific date including steps, calories, distance, active minutes, and more.',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format (required)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
      required: ['date'],
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_STEPS_DATA,
    description: 'Get detailed step data chart for a specific date with timestamps.',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format (required)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
      required: ['date'],
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_DAILY_STEPS,
    description: 'Get daily step counts for a date range (max 28 days per request, auto-chunked for longer ranges).',
    inputSchema: {
      type: 'object',
      properties: {
        startDate: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format (required)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        endDate: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format (required)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
      required: ['startDate', 'endDate'],
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_ACTIVITIES_BY_DATE,
    description: 'Get all activities within a date range with optional filtering by type.',
    inputSchema: {
      type: 'object',
      properties: {
        startDate: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format (required)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        endDate: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        activityType: {
          type: 'string',
          description: 'Filter by activity type: running, cycling, swimming, hiking, walking, etc.',
        },
        sortOrder: {
          type: 'string',
          description: 'Sort order: asc (oldest first) or desc (newest first, default)',
        },
      },
      required: ['startDate'],
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_ACTIVITY_TYPED_SPLITS,
    description: 'Get typed splits for an activity (more detailed than regular splits, useful for bouldering, strength training, etc.).',
    inputSchema: {
      type: 'object',
      properties: {
        activityId: {
          type: 'number',
          description: 'The unique activity identifier (required)',
        },
      },
      required: ['activityId'],
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_RHR_DAY,
    description: 'Get resting heart rate for a specific day.',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format (required)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
      required: ['date'],
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_HILL_SCORE,
    description: 'Get hill score data indicating climbing/vertical performance.',
    inputSchema: {
      type: 'object',
      properties: {
        startDate: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format (required)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        endDate: {
          type: 'string',
          description: 'End date for range query (optional)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
      required: ['startDate'],
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_ALL_DAY_EVENTS,
    description: 'Get all daily events including auto-detected activities that may not have been recorded.',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format (required)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
      required: ['date'],
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_BODY_BATTERY_EVENTS,
    description: 'Get Body Battery events for a date (sleep, activities, naps that affected energy levels).',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format (required)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
      required: ['date'],
    },
  },
  {
    name: MCP_TOOL_NAMES.ADD_HYDRATION_DATA,
    description: 'Add hydration/water intake data in milliliters.',
    inputSchema: {
      type: 'object',
      properties: {
        valueInMl: {
          type: 'number',
          description: 'Amount of water in milliliters (positive to add, negative to subtract)',
        },
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format (defaults to today)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        timestamp: {
          type: 'string',
          description: 'Timestamp in ISO format YYYY-MM-DDTHH:MM:SS (optional)',
        },
      },
      required: ['valueInMl'],
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_AVAILABLE_BADGES,
    description: 'Get all badges available to earn.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_IN_PROGRESS_BADGES,
    description: 'Get badges that are currently in progress (started but not completed).',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_AVAILABLE_BADGE_CHALLENGES,
    description: 'Get available badge challenges to join.',
    inputSchema: {
      type: 'object',
      properties: {
        start: {
          type: 'number',
          description: 'Starting index for pagination',
          minimum: 0,
        },
        limit: {
          type: 'number',
          description: 'Maximum results to return',
          minimum: 1,
          maximum: 100,
        },
      },
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_NON_COMPLETED_BADGE_CHALLENGES,
    description: 'Get badge challenges that have not been completed yet.',
    inputSchema: {
      type: 'object',
      properties: {
        start: {
          type: 'number',
          description: 'Starting index for pagination',
          minimum: 0,
        },
        limit: {
          type: 'number',
          description: 'Maximum results to return',
          minimum: 1,
          maximum: 100,
        },
      },
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_IN_PROGRESS_VIRTUAL_CHALLENGES,
    description: 'Get virtual challenges that are currently in progress.',
    inputSchema: {
      type: 'object',
      properties: {
        start: {
          type: 'number',
          description: 'Starting index for pagination',
          minimum: 0,
        },
        limit: {
          type: 'number',
          description: 'Maximum results to return',
          minimum: 1,
          maximum: 100,
        },
      },
    },
  },
  {
    name: MCP_TOOL_NAMES.REMOVE_GEAR_FROM_ACTIVITY,
    description: 'Remove/unlink a piece of gear from an activity.',
    inputSchema: {
      type: 'object',
      properties: {
        gearUUID: {
          type: 'string',
          description: 'The unique gear identifier (required)',
        },
        activityId: {
          type: 'number',
          description: 'The unique activity identifier (required)',
        },
      },
      required: ['gearUUID', 'activityId'],
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_GEAR_ACTIVITIES,
    description: 'Get activities where a specific piece of gear was used.',
    inputSchema: {
      type: 'object',
      properties: {
        gearUUID: {
          type: 'string',
          description: 'The unique gear identifier (required)',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of activities to return (default: 100)',
          minimum: 1,
          maximum: 1000,
        },
      },
      required: ['gearUUID'],
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_TRAINING_PLANS,
    description: 'Get all available training plans.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_TRAINING_PLAN_BY_ID,
    description: 'Get detailed information about a specific training plan.',
    inputSchema: {
      type: 'object',
      properties: {
        planId: {
          type: 'string',
          description: 'The unique training plan identifier (required)',
        },
      },
      required: ['planId'],
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_MENSTRUAL_DATA,
    description: 'Get menstrual cycle data for a specific date.',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format (required)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
      required: ['date'],
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_PREGNANCY_SUMMARY,
    description: 'Get pregnancy tracking summary/snapshot data.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: MCP_TOOL_NAMES.REQUEST_RELOAD,
    description: 'Request reload of data for a specific date (useful for older data that was offloaded by Garmin).',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format (required)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
      required: ['date'],
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_ACTIVITY_TYPES,
    description: 'Get all activity types available in Garmin Connect.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_PRIMARY_TRAINING_DEVICE,
    description: 'Get information about the primary training device and device priorities.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: MCP_TOOL_NAMES.COUNT_ACTIVITIES,
    description: 'Get the total count of activities in Garmin Connect.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_FITNESS_STATS,
    description: 'Get aggregated fitness statistics between two dates.',
    inputSchema: {
      type: 'object',
      properties: {
        startDate: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format (required)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        endDate: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format (required)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        metric: {
          type: 'string',
          description: 'Metric to aggregate: distance, duration, elevationGain, movingDuration (default: distance)',
        },
        groupByActivities: {
          type: 'boolean',
          description: 'Group results by activity type (default: true)',
        },
      },
      required: ['startDate', 'endDate'],
    },
  },
];
