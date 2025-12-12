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
];
