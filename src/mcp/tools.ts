// src/mcp/tools.ts

import { MCP_TOOL_NAMES } from '../utils/constants.js';

// Definizioni JSON Schema per i tool MCP
// Usiamo oggetti JSON puri invece di Zod per evitare problemi di serializzazione

// MCP Tool Annotations as per Anthropic MCP Directory Policy
export interface ToolAnnotations {
  // Tool only reads data, does not modify anything
  readOnlyHint?: boolean;
  // Tool modifies data or causes side effects
  destructiveHint?: boolean;
  // Tool may take a long time to complete
  longRunningHint?: boolean;
  // Tool requires user confirmation before execution
  confirmationRequiredHint?: boolean;
}

export interface ToolDefinition {
  name: string;
  // Human-readable title for the tool
  title: string;
  description: string;
  // MCP annotations for safety and security
  annotations: ToolAnnotations;
  inputSchema: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      minimum?: number;
      maximum?: number;
      pattern?: string;
      items?: { type: string };
      enum?: string[];
    }>;
    required?: string[];
  };
}

export const toolDefinitions: ToolDefinition[] = [
  // ═══════════════════════════════════════════════════════════════
  // CREDENZIALI
  // Questi tool non richiedono una sessione Garmin attiva: sono il modo
  // per crearne una quando le credenziali non sono ancora configurate.
  // ═══════════════════════════════════════════════════════════════
  {
    name: MCP_TOOL_NAMES.SETUP_CREDENTIALS,
    title: 'Setup Garmin Credentials',
    description:
      'Store Garmin Connect credentials encrypted in the OS native vault and log in immediately. ' +
      'Use this when the server reports that credentials are missing or invalid. ' +
      'The password is encrypted at rest and never written to a plain text file.',
    // Sovrascrive le credenziali salvate e i token OAuth della sessione
    // precedente: non è readOnly, e la directory MCP richiede che ogni tool
    // dichiari readOnlyHint oppure destructiveHint.
    annotations: { destructiveHint: true, confirmationRequiredHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Garmin Connect account email (required)',
        },
        password: {
          type: 'string',
          description: 'Garmin Connect account password (required)',
        },
      },
      required: ['email', 'password'],
    },
  },
  {
    name: MCP_TOOL_NAMES.CHECK_CREDENTIALS,
    title: 'Check Garmin Credentials',
    description:
      'Report whether Garmin credentials are configured, which source they come from, where the ' +
      'encrypted data is stored and whether the session is authenticated. Never returns the password.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: MCP_TOOL_NAMES.CLEAR_CREDENTIALS,
    title: 'Clear Garmin Credentials',
    description:
      'Delete the encrypted credentials and OAuth tokens from secure storage and end the current session. ' +
      'Credentials supplied through the extension settings are not affected and must be cleared there.',
    annotations: { destructiveHint: true, confirmationRequiredHint: true },
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: MCP_TOOL_NAMES.LIST_RECENT_ACTIVITIES,
    title: 'List Recent Activities',
    description: 'Get a list of recent activities from Garmin Connect. Returns activity summaries including name, type, distance, duration, and date.',
    annotations: { readOnlyHint: true },
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
    title: 'Get Activity Details',
    description: 'Get detailed information about a specific activity including splits, heart rate zones, and GPS data.',
    annotations: { readOnlyHint: true },
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
    title: 'Get Health Metrics',
    description: 'Get daily health metrics including heart rate data and step count for a specific date.',
    annotations: { readOnlyHint: true },
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
    title: 'Get Sleep Data',
    description:
      'Get a night of sleep: duration, sleep stages, quality score and the nightly summary. ' +
      'The per-minute series behind it (movement, heart rate, stress, body battery, HRV, respiration) ' +
      'are reported as counts only; set includeTimeSeries to inline them, or use the dedicated tool ' +
      'for the one series you need.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format. Defaults to today if not specified.',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        includeTimeSeries: {
          type: 'boolean',
          description:
            'Inline every per-minute series for the night (default false). This is a very large ' +
            'response; prefer get_sleep_movement, get_hrv_data or get_respiration_data for a single series.',
        },
      },
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_BODY_COMPOSITION,
    title: 'Get Body Composition',
    description:
      'Get body composition measurements (weight, BMI, body fat, muscle and bone mass) over a period, ' +
      'plus the average across the period.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        days: {
          type: 'number',
          description: 'Number of days of historical data ending at endDate (1-365, default 30)',
          minimum: 1,
          maximum: 365,
        },
        endDate: {
          type: 'string',
          description: 'Last day of the period in YYYY-MM-DD format. Defaults to today.',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_DEVICES,
    title: 'Get Devices',
    description:
      'List the Garmin devices registered on the account with their id, model, serial and firmware version. ' +
      'Use get_device_settings for the configuration of a single device.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_USER_PROFILE,
    title: 'Get User Profile',
    description:
      'Get user profile information: display name, user name, full name and both account ids. '
      + 'profileId is the one other Garmin data is keyed by (the ownerId on an activity, the userProfilePK '
      + 'on wellness records); id is a separate internal identifier.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_TRAINING_STATUS,
    title: 'Get Training Status',
    description:
      'Get the training status for a date: status and feedback phrase, VO2 max, fitness trend, ' +
      'acute and chronic training load and the acute/chronic workload ratio.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format. Defaults to today.',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
    },
  },
  // Nuovi tool
  {
    name: MCP_TOOL_NAMES.GET_STEPS,
    title: 'Get Steps',
    description: 'Get step count for a specific date. Returns the total number of steps recorded.',
    annotations: { readOnlyHint: true },
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
    title: 'Get Heart Rate',
    description: 'Get detailed heart rate data for a specific date including resting HR, max HR, and HR zones.',
    annotations: { readOnlyHint: true },
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
    title: 'Get Hydration',
    description: 'Get daily hydration/water intake data for a specific date.',
    annotations: { readOnlyHint: true },
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
    title: 'Get Workouts',
    description: 'Get list of scheduled/planned workouts from Garmin Connect.',
    annotations: { readOnlyHint: true },
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
    title: 'Get Activity Splits',
    description: 'Get split/lap data for a specific activity including pace, distance, and time for each split.',
    annotations: { readOnlyHint: true },
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
    title: 'Get Stress Data',
    description:
      'Get stress for a date on the 0-100 scale (0-25 resting, 26-50 low, 51-75 medium, 76-100 high). ' +
      'Returns average/max/min and the seconds spent in each band; set includeValues to also get the ' +
      '~460 three-minute samples. The average and maximum are the day figures Garmin itself reports, ' +
      'so they match the Connect app; the minimum and the band seconds are derived from the samples. ' +
      'Use get_all_day_stress for the same day broken down hour by hour.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format. Defaults to today if not specified.',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        includeValues: {
          type: 'boolean',
          description:
            'Include the individual timestamped stress samples (default false). Only worth requesting ' +
            'to see when during the day stress rose or fell.',
        },
      },
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_BODY_BATTERY,
    title: 'Get Body Battery',
    description: 'Get Body Battery energy level data for a date range. Body Battery tracks energy levels (0-100) throughout the day based on sleep, stress, and activity. Shows charged/drained periods and sleep quality impact.',
    annotations: { readOnlyHint: true },
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
    title: 'Get HRV Data',
    description: 'Get Heart Rate Variability (HRV) data for a specific date. HRV measures the variation in time between heartbeats, indicating recovery and stress levels.',
    annotations: { readOnlyHint: true },
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
    title: 'Get Respiration Data',
    description: 'Get respiration/breathing rate data for a specific date. Shows breaths per minute throughout the day and during sleep.',
    annotations: { readOnlyHint: true },
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
    title: 'Get SpO2 Data',
    description: 'Get SpO2 (blood oxygen saturation) data for a specific date. Shows pulse oximetry readings as percentage (typically 95-100% is normal).',
    annotations: { readOnlyHint: true },
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
    title: 'Get Workout by ID',
    description: 'Get detailed information about a specific workout by its ID.',
    annotations: { readOnlyHint: true },
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
    title: 'Download Workout',
    description: 'Download a workout in FIT format for syncing to a Garmin device.',
    annotations: { readOnlyHint: true },
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
    title: 'Create Workout',
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
    annotations: { destructiveHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        workoutName: {
          type: 'string',
          description: 'Name of the workout (required)',
        },
        sportType: {
          type: 'string',
          description: 'Sport type. One of: running, cycling, walking, swimming, strength, cardio, yoga, pilates, hiit, mobility, rucking, other. The workout service has no hiking type; use walking or rucking.',
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
    title: 'Update Workout',
    description: 'Update an existing workout (name, description, or structure).',
    annotations: { destructiveHint: true },
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
    title: 'Delete Workout',
    description: 'Delete a workout from Garmin Connect.',
    annotations: { destructiveHint: true },
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
    title: 'Schedule Workout',
    description: 'Schedule an existing workout on a specific date. Returns a workoutScheduleId that can be used to unschedule.',
    annotations: { destructiveHint: true },
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
  {
    name: MCP_TOOL_NAMES.UNSCHEDULE_WORKOUT,
    title: 'Unschedule Workout',
    description: 'Remove a scheduled workout from the calendar. IMPORTANT: Always unschedule before deleting a workout to avoid ghost entries.',
    annotations: { destructiveHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        scheduleId: {
          type: 'string',
          description: 'The workout schedule ID (workoutScheduleId returned from schedule_workout)',
        },
      },
      required: ['scheduleId'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // v2.0 - PRIORITÀ 2: ACTIVITY MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: MCP_TOOL_NAMES.UPLOAD_ACTIVITY,
    title: 'Upload Activity',
    description: 'Upload an activity file (FIT, GPX, TCX format) to Garmin Connect.',
    annotations: { destructiveHint: true },
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
    title: 'Create Manual Activity',
    description: 'Create a manual activity entry in Garmin Connect.',
    annotations: { destructiveHint: true },
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
    title: 'Set Activity Name',
    description: 'Change the name of an existing activity.',
    annotations: { destructiveHint: true },
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
    title: 'Set Activity Type',
    description: 'Change the type/category of an existing activity.',
    annotations: { destructiveHint: true },
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
    title: 'Delete Activity',
    description: 'Delete an activity from Garmin Connect. WARNING: This action cannot be undone.',
    annotations: { destructiveHint: true },
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
    title: 'Download Activity',
    description: 'Download an activity in various formats (FIT, TCX, GPX, KML, CSV).',
    annotations: { readOnlyHint: true },
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
    title: 'Get Device Last Used',
    description: 'Get the Garmin device that uploaded data most recently, with its id, name and upload time.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_DEVICE_SETTINGS,
    title: 'Get Device Settings',
    description: 'Get settings for a specific Garmin device.',
    annotations: { readOnlyHint: true },
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
    title: 'Get Stress by Hour',
    description:
      'Get the stress of a day hour by hour: average, maximum and stress band for each hour, ' +
      'plus the totals for the day. Use this to see when stress rose or fell; use get_stress_data ' +
      'for the day as a whole, and its includeValues for the individual three-minute samples.',
    annotations: { readOnlyHint: true },
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
    title: 'Get Floors',
    description:
      'Get the floors climbed and descended on a date. Returns the daily totals; ' +
      'set includeBreakdown to also get the 96 quarter-hour intervals behind them.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format.',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        includeBreakdown: {
          type: 'boolean',
          description:
            'Include the 15-minute interval data behind the totals (default false). ' +
            'Only worth requesting to see when during the day the floors were climbed.',
        },
      },
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_INTENSITY_MINUTES,
    title: 'Get Intensity Minutes',
    description:
      'Get intensity minutes (moderate and vigorous) for a date, or for a date range when endDate is given, ' +
      'together with the weekly totals and goal.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format (start of the range when endDate is given).',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        endDate: {
          type: 'string',
          description: 'Optional last day of the range in YYYY-MM-DD format.',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_MAX_METRICS,
    title: 'Get Max Metrics',
    description: 'Get max metrics including VO2 max and related fitness data.',
    annotations: { readOnlyHint: true },
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
    title: 'Get Training Readiness',
    description: 'Get training readiness score indicating how prepared your body is for training.',
    annotations: { readOnlyHint: true },
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
    title: 'Get Endurance Score',
    description: 'Get endurance score based on recent training load.',
    annotations: { readOnlyHint: true },
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
    title: 'Get Fitness Age',
    description: 'Get fitness age estimation based on VO2 max and other metrics.',
    annotations: { readOnlyHint: true },
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
    title: 'Get Weigh-Ins',
    description: 'Get weigh-in records for a date range.',
    annotations: { readOnlyHint: true },
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
    title: 'Add Weigh-In',
    description:
      'Add a new weigh-in record. Weight and body fat are stored; the water, muscle and bone '
      + 'percentages are accepted but Garmin discards them on a manual entry, keeping them only '
      + 'for measurements a smart scale uploads.',
    annotations: { destructiveHint: true },
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
          description: 'Body water percentage (optional). Not retained by Garmin on a manual weigh-in.',
        },
        muscleMassPercent: {
          type: 'number',
          description: 'Muscle mass percentage (optional). Not retained by Garmin on a manual weigh-in.',
        },
        boneMassPercent: {
          type: 'number',
          description: 'Bone mass percentage (optional). Not retained by Garmin on a manual weigh-in.',
        },
      },
      required: ['weight', 'date'],
    },
  },
  {
    name: MCP_TOOL_NAMES.DELETE_WEIGH_IN,
    title: 'Delete Weigh-In',
    description:
      'Permanently delete a single weigh-in record, identified by its weigh-in ID (the samplePk '
      + 'from get_weigh_ins or get_body_composition). The measurement cannot be recovered afterwards. '
      + 'Pass date when the weigh-in was back-dated to a day other than the one it was entered on.',
    annotations: { destructiveHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        weighInId: {
          type: 'string',
          description: 'The unique weigh-in identifier (required)',
        },
        date: {
          type: 'string',
          description:
            'Date of the weigh-in in YYYY-MM-DD format. Defaults to the day the weigh-in id encodes, '
            + 'which is the day it was recorded.',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
      required: ['weighInId'],
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_BLOOD_PRESSURE,
    title: 'Get Blood Pressure',
    description: 'Get blood pressure readings for a date range.',
    annotations: { readOnlyHint: true },
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
    title: 'Set Blood Pressure',
    description: 'Record a blood pressure reading.',
    annotations: { destructiveHint: true },
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
  {
    name: MCP_TOOL_NAMES.DELETE_BLOOD_PRESSURE,
    title: 'Delete Blood Pressure',
    description: 'Delete a blood pressure reading. Use get_blood_pressure with the /all endpoint to find the version ID.',
    annotations: { destructiveHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'The date of the reading in YYYY-MM-DD format (required)',
        },
        version: {
          type: 'string',
          description: 'The version/ID of the reading from the blood pressure data (required)',
        },
      },
      required: ['date', 'version'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // v2.0 - ACTIVITY DETAILS AVANZATI
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: MCP_TOOL_NAMES.GET_ACTIVITY_WEATHER,
    title: 'Get Activity Weather',
    description: 'Get weather conditions during an activity.',
    annotations: { readOnlyHint: true },
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
    title: 'Get Activity HR Zones',
    description: 'Get time spent in each heart rate zone during an activity.',
    annotations: { readOnlyHint: true },
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
    title: 'Get Activity Exercise Sets',
    description: 'Get exercise sets from a strength training activity.',
    annotations: { readOnlyHint: true },
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
    title: 'Get Goals',
    description:
      'Get user goals. Without a status every status is queried in turn and the results are merged, ' +
      'each goal carrying the status it was found under.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Filter by status. Defaults to all three.',
          enum: ['active', 'future', 'past'],
        },
      },
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_ADHOC_CHALLENGES,
    title: 'Get Ad-hoc Challenges',
    description: 'Get ad-hoc challenges history.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_BADGE_CHALLENGES,
    title: 'Get Badge Challenges',
    description: 'Get available badge challenges.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_EARNED_BADGES,
    title: 'Get Earned Badges',
    description:
      'Get all badges earned by the user, as id, key, name, category, difficulty, points and the date earned. ' +
      'Set includeDetails for the full badge records.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        includeDetails: {
          type: 'boolean',
          description:
            'Return every field the badge service sends rather than the identifying ones (default false). ' +
            'This is a much larger response.',
        },
      },
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_PERSONAL_RECORDS,
    title: 'Get Personal Records',
    description:
      'Get all personal records (PRs). Each record carries a typeId identifying its category, its value, ' +
      'the date it was set and, for records set during an activity, that activity.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_RACE_PREDICTIONS,
    title: 'Get Race Predictions',
    description: 'Get predicted race times for 5K, 10K, half marathon, and marathon based on current fitness.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // v2.0 - GEAR MANAGEMENT (limited - requires gear UUID from web interface)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: MCP_TOOL_NAMES.GET_GEAR_STATS,
    title: 'Get Gear Stats',
    description: 'Get usage statistics for a specific piece of gear. Note: Requires the gear UUID which can be found in Garmin Connect web interface URL.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        gearUUID: {
          type: 'string',
          description: 'The unique gear identifier (required). Find it in Garmin Connect web: Settings > Gear > click on gear > UUID is in the URL',
        },
      },
      required: ['gearUUID'],
    },
  },
  {
    name: MCP_TOOL_NAMES.LINK_GEAR_TO_ACTIVITY,
    title: 'Link Gear to Activity',
    description: 'Link a piece of gear to an activity. Note: Requires the gear UUID which can be found in Garmin Connect web interface URL.',
    annotations: { destructiveHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        gearUUID: {
          type: 'string',
          description: 'The unique gear identifier (required). Find it in Garmin Connect web: Settings > Gear > click on gear > UUID is in the URL',
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
    title: 'Get Progress Summary',
    description: 'Get aggregated progress summary between two dates.',
    annotations: { readOnlyHint: true },
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
    title: 'Get Daily Summary',
    description:
      'Get a compact daily summary: steps and goal, calories, distance, floors, intensity minutes, ' +
      'resting/min/max heart rate, stress, body battery and time breakdown. ' +
      'Use get_heart_rate for the full heart rate series.',
    annotations: { readOnlyHint: true },
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
    title: 'Get User Summary',
    description: 'Get comprehensive user activity summary for a specific date including steps, calories, distance, active minutes, and more.',
    annotations: { readOnlyHint: true },
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
    title: 'Get Steps Data',
    description: 'Get detailed step data chart for a specific date with timestamps.',
    annotations: { readOnlyHint: true },
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
    title: 'Get Daily Steps',
    description: 'Get daily step counts for a date range (max 28 days per request, auto-chunked for longer ranges).',
    annotations: { readOnlyHint: true },
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
    title: 'Get Activities by Date',
    description: 'Get all activities within a date range with optional filtering by type.',
    annotations: { readOnlyHint: true },
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
    title: 'Get Activity Typed Splits',
    description: 'Get typed splits for an activity (more detailed than regular splits, useful for bouldering, strength training, etc.).',
    annotations: { readOnlyHint: true },
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
    title: 'Get Resting Heart Rate',
    description: 'Get resting heart rate for a specific day.',
    annotations: { readOnlyHint: true },
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
    title: 'Get Hill Score',
    description: 'Get hill score data indicating climbing/vertical performance.',
    annotations: { readOnlyHint: true },
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
    title: 'Get All Day Events',
    description: 'Get all daily events including auto-detected activities that may not have been recorded.',
    annotations: { readOnlyHint: true },
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
    title: 'Get Body Battery Events',
    description: 'Get Body Battery events for a date (sleep, activities, naps that affected energy levels).',
    annotations: { readOnlyHint: true },
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
    title: 'Add Hydration Data',
    description: 'Add hydration/water intake data in milliliters.',
    annotations: { destructiveHint: true },
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
    title: 'Get Available Badges',
    description:
      'Get all badges available to earn, as id, key, name, category, difficulty, points and, where set, ' +
      'the active window and progress. Set includeDetails for the full badge records.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        includeDetails: {
          type: 'boolean',
          description:
            'Return every field the badge service sends rather than the identifying ones (default false). ' +
            'This is a much larger response.',
        },
      },
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_IN_PROGRESS_BADGES,
    title: 'Get In-Progress Badges',
    description: 'Get badges that are currently in progress (started but not completed).',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_AVAILABLE_BADGE_CHALLENGES,
    title: 'Get Available Badge Challenges',
    description: 'Get available badge challenges to join.',
    annotations: { readOnlyHint: true },
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
    title: 'Get Non-Completed Badge Challenges',
    description: 'Get badge challenges that have not been completed yet.',
    annotations: { readOnlyHint: true },
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
    title: 'Get In-Progress Virtual Challenges',
    description: 'Get virtual challenges that are currently in progress.',
    annotations: { readOnlyHint: true },
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
    title: 'Remove Gear from Activity',
    description: 'Remove/unlink a piece of gear from an activity. Note: Requires the gear UUID from Garmin Connect web interface.',
    annotations: { destructiveHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        gearUUID: {
          type: 'string',
          description: 'The unique gear identifier (required). Find it in Garmin Connect web: Settings > Gear > click on gear > UUID is in the URL',
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
    title: 'Get Gear Activities',
    description: 'Get activities where a specific piece of gear was used. Note: Requires the gear UUID from Garmin Connect web interface.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        gearUUID: {
          type: 'string',
          description: 'The unique gear identifier (required). Find it in Garmin Connect web: Settings > Gear > click on gear > UUID is in the URL',
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
    title: 'Get Training Plans',
    description: 'Get all available training plans.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_TRAINING_PLAN_BY_ID,
    title: 'Get Training Plan by ID',
    description: 'Get detailed information about a specific training plan.',
    annotations: { readOnlyHint: true },
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
    title: 'Get Menstrual Data',
    description: 'Get menstrual cycle data for a specific date.',
    annotations: { readOnlyHint: true },
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
    title: 'Get Pregnancy Summary',
    description: 'Get pregnancy tracking summary/snapshot data.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: MCP_TOOL_NAMES.REQUEST_RELOAD,
    title: 'Request Data Reload',
    description: 'Request reload of data for a specific date (useful for older data that was offloaded by Garmin).',
    annotations: { destructiveHint: true },
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
    title: 'Get Activity Types',
    description: 'Get all activity types available in Garmin Connect.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_PRIMARY_TRAINING_DEVICE,
    title: 'Get Primary Training Device',
    description: 'Get information about the primary training device and device priorities.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: MCP_TOOL_NAMES.COUNT_ACTIVITIES,
    title: 'Count Activities',
    description:
      'Count the activities in Garmin Connect, over the whole history or over a date range.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        startDate: {
          type: 'string',
          description: 'Optional start date in YYYY-MM-DD format. Omit to count from the beginning.',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        endDate: {
          type: 'string',
          description: 'Optional end date in YYYY-MM-DD format. Defaults to today.',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_FITNESS_STATS,
    title: 'Get Fitness Stats',
    description: 'Get aggregated fitness statistics between two dates.',
    annotations: { readOnlyHint: true },
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

  // ═══════════════════════════════════════════════════════════════════════════
  // v4.0 - NEW TOOLS: GEAR MANAGEMENT (NO MORE UUID REQUIRED!)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: MCP_TOOL_NAMES.GET_ALL_GEAR,
    title: 'Get All Gear',
    description: 'Get complete list of all gear/equipment with their UUIDs. This solves the UUID problem - you can now discover all gear without needing to manually find UUIDs in the web interface.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  // REMOVED: CREATE_GEAR - Garmin OAuth API returns 403 Forbidden for gear creation
  // Gear must be created manually via https://connect.garmin.com/modern/gear
  {
    name: MCP_TOOL_NAMES.UPDATE_GEAR,
    title: 'Update Gear',
    description: 'Update existing gear/equipment details.',
    annotations: { destructiveHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        gearUUID: {
          type: 'string',
          description: 'The gear UUID (use get_all_gear to find it) (required)',
        },
        displayName: {
          type: 'string',
          description: 'New display name',
        },
        modelName: {
          type: 'string',
          description: 'Model name. Garmin keeps brand and model as one free-text label, so this is combined with brandName.'
        },
        brandName: {
          type: 'string',
          description: 'Brand name. Garmin keeps brand and model as one free-text label, so this is combined with modelName.'
        },
        maximumMeter: {
          type: 'number',
          description: 'Maximum distance in meters before replacement',
        },
      },
      required: ['gearUUID'],
    },
  },
  {
    name: MCP_TOOL_NAMES.DELETE_GEAR,
    title: 'Delete Gear',
    description: 'Delete a piece of gear/equipment. WARNING: This cannot be undone.',
    annotations: { destructiveHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        gearUUID: {
          type: 'string',
          description: 'The gear UUID to delete (required)',
        },
      },
      required: ['gearUUID'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // v4.1 - GEAR COLLECTIONS & METADATA
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: MCP_TOOL_NAMES.GET_GEAR_TYPES,
    title: 'Get Gear Types',
    description: 'Get all available gear/equipment types (e.g., Shoes, Bike, Golf Clubs, Other). Returns type names and primary keys used when creating gear.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_GEAR_MAKES,
    title: 'Get Gear Makes',
    description: 'Get all available gear brands/makes (e.g., Nike, Adidas, ASICS, Brooks). Returns make names and primary keys.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_GEAR_COLLECTIONS,
    title: 'Get Gear Collections',
    description: 'Get all gear collections. Collections group gear items that are used together (e.g., running kit, bike components).',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_GEAR_COLLECTION,
    title: 'Get Gear Collection Details',
    description: 'Get detailed information about a specific gear collection, including the gear items in the collection and associated activity types.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        collectionUUID: {
          type: 'string',
          description: 'The collection UUID (use get_gear_collections to find it) (required)',
        },
      },
      required: ['collectionUUID'],
    },
  },
  {
    name: MCP_TOOL_NAMES.CREATE_GEAR_COLLECTION,
    title: 'Create Gear Collection',
    description: 'Create a new gear collection to group equipment used together (e.g., running kit, bike components). Requires a name and first use date.',
    annotations: { destructiveHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name for the collection (e.g., "Running Kit", "Road Bike Setup") (required)',
        },
        firstUseDate: {
          type: 'string',
          description: 'First use date in YYYY-MM-DD format (required)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        activityTypes: {
          type: 'array',
          description: 'Activity types to associate with this collection (e.g., ["running", "trail_running"])',
          items: { type: 'string' },
        },
      },
      required: ['name', 'firstUseDate'],
    },
  },
  {
    name: MCP_TOOL_NAMES.UPDATE_GEAR_COLLECTION,
    title: 'Update Gear Collection',
    description: 'Update an existing gear collection. Can change name, add/remove gear items, or change associated activity types.',
    annotations: { destructiveHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        collectionUUID: {
          type: 'string',
          description: 'The collection UUID (use get_gear_collections to find it) (required)',
        },
        name: {
          type: 'string',
          description: 'New name for the collection',
        },
        firstUseDate: {
          type: 'string',
          description: 'New first use date in YYYY-MM-DD format',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        gearUUIDs: {
          type: 'array',
          description: 'Array of gear UUIDs to include in the collection (replaces existing gear list)',
          items: { type: 'string' },
        },
        activityTypes: {
          type: 'array',
          description: 'Activity types to associate (e.g., ["running", "trail_running"]). Replaces existing list.',
          items: { type: 'string' },
        },
      },
      required: ['collectionUUID'],
    },
  },
  {
    name: MCP_TOOL_NAMES.DELETE_GEAR_COLLECTION,
    title: 'Delete Gear Collection',
    description: 'Delete a gear collection. WARNING: This cannot be undone. The gear items in the collection will NOT be deleted.',
    annotations: { destructiveHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        collectionUUID: {
          type: 'string',
          description: 'The collection UUID to delete (required)',
        },
      },
      required: ['collectionUUID'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // v4.0 - SOCIAL FEATURES
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: MCP_TOOL_NAMES.GET_ACTIVITY_COMMENTS,
    title: 'Get Activity Comments',
    description: 'Get all comments on an activity.',
    annotations: { readOnlyHint: true },
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
  // REMOVED: ADD_ACTIVITY_COMMENT - Not supported by Garmin OAuth API
  // The endpoint POST /activity-service/activity/{id}/comment returns 404
  // Comments can only be read, not written via OAuth API
  // {
  //   name: MCP_TOOL_NAMES.ADD_ACTIVITY_COMMENT,
  //   title: 'Add Activity Comment',
  //   description: 'Add a comment to an activity.',
  //   annotations: { destructiveHint: true },
  //   inputSchema: {
  //     type: 'object',
  //     properties: {
  //       activityId: {
  //         type: 'number',
  //         description: 'The unique activity identifier (required)',
  //       },
  //       comment: {
  //         type: 'string',
  //         description: 'Comment text (required)',
  //       },
  //     },
  //     required: ['activityId', 'comment'],
  //   },
  // },
  {
    name: MCP_TOOL_NAMES.SET_ACTIVITY_PRIVACY,
    title: 'Set Activity Privacy',
    description:
      'Change the privacy of an activity. "subscribers" is what Garmin Connect shows as "connections only". ' +
      'Read the current level from accessControlRuleDTO in get_activity_details before changing it.',
    annotations: { destructiveHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        activityId: {
          type: 'number',
          description: 'The unique activity identifier (required)',
        },
        privacy: {
          type: 'string',
          description: 'Privacy level (required). "followers" is not a valid key and returns 400.',
          enum: ['public', 'private', 'subscribers'],
        },
      },
      required: ['activityId', 'privacy'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // v4.0 - ADVANCED TRAINING METRICS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: MCP_TOOL_NAMES.GET_TRAINING_LOAD,
    title: 'Get Training Load',
    description:
      'Get the monthly training load balance (low aerobic, high aerobic, anaerobic) against its target ranges. ' +
      'This is a snapshot taken on endDate, not an aggregate over the range.',
    annotations: { readOnlyHint: true },
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
          description: 'End date in YYYY-MM-DD format (optional, defaults to startDate)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
      required: ['startDate'],
    },
  },
  {
    name: MCP_TOOL_NAMES.GET_LOAD_RATIO,
    title: 'Get Load Ratio',
    description: 'Get acute/chronic workload ratio indicating training balance and injury risk.',
    annotations: { readOnlyHint: true },
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
    name: MCP_TOOL_NAMES.GET_PERFORMANCE_CONDITION,
    title: 'Get Performance Condition',
    description:
      'Get the performance condition score for a date. Garmin records this per activity rather than daily, ' +
      'so it is usually only available through get_activity_details.',
    annotations: { readOnlyHint: true },
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

  // ═══════════════════════════════════════════════════════════════════════════
  // v4.0 - SLEEP & DEVICE FEATURES
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: MCP_TOOL_NAMES.GET_SLEEP_MOVEMENT,
    title: 'Get Sleep Movement',
    description: 'Get movement data during sleep including restless moments.',
    annotations: { readOnlyHint: true },
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
    name: MCP_TOOL_NAMES.GET_DEVICE_ALARMS,
    title: 'Get Device Alarms',
    description:
      'Get the alarms configured on a Garmin device, with time, repeat days and whether each one is on. ' +
      'Without a deviceId every registered device is reported.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        deviceId: {
          type: 'string',
          description: 'Optional device identifier (from get_devices). Defaults to every device.',
        },
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // v4.0 - COURSE & ANALYSIS FEATURES
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: MCP_TOOL_NAMES.GET_COURSES,
    title: 'Get Courses',
    description: 'Get saved routes/courses from Garmin Connect.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        start: {
          type: 'number',
          description: 'Starting index for pagination (default: 0)',
          minimum: 0,
        },
        limit: {
          type: 'number',
          description: 'Maximum number of courses to return (default: 20)',
          minimum: 1,
          maximum: 100,
        },
      },
    },
  },
  {
    name: MCP_TOOL_NAMES.COMPARE_ACTIVITIES,
    title: 'Compare Activities',
    description:
      'Compare 2-5 activities side by side: distance, duration, speed, heart rate, calories, ' +
      'elevation, steps and training effect.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        activityIds: {
          type: 'array',
          description: 'Array of 2-5 activity IDs to compare (required)',
        },
      },
      required: ['activityIds'],
    },
  },
  {
    name: MCP_TOOL_NAMES.FIND_SIMILAR_ACTIVITIES,
    title: 'Find Similar Activities',
    description:
      'Find activities similar to a reference activity by type, distance and duration (within 20% tolerance). ' +
      'Returns the closest matches first, each with its full metrics and a similarity score.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        activityId: {
          type: 'number',
          description: 'Reference activity ID (required)',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of similar activities to return (default: 10)',
          minimum: 1,
          maximum: 50,
        },
        searchDepth: {
          type: 'number',
          description: 'How many recent activities to search through (default: 200)',
          minimum: 20,
          maximum: 1000,
        },
      },
      required: ['activityId'],
    },
  },
  {
    name: MCP_TOOL_NAMES.ANALYZE_TRAINING_PERIOD,
    title: 'Analyze Training Period',
    description: 'Comprehensive analysis of training trends, volume, and patterns over a date range.',
    annotations: { readOnlyHint: true },
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
];
