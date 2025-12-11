// src/utils/logger.ts

// Logger che scrive SOLO su stderr, non stdout
// Questo non inquina la comunicazione MCP
const logger = {
  info: (..._args: any[]) => {
    // Scrivi su stderr solo se in debug mode
    if (process.env.DEBUG_GARMIN) {
      console.error('[INFO]', ..._args);
    }
  },
  debug: (..._args: any[]) => {
    if (process.env.DEBUG_GARMIN) {
      console.error('[DEBUG]', ..._args);
    }
  },
  error: (..._args: any[]) => {
    // Gli errori veri vanno sempre su stderr
    console.error('[ERROR]', ..._args);
  },
  warn: (..._args: any[]) => {
    if (process.env.DEBUG_GARMIN) {
      console.error('[WARN]', ..._args);
    }
  },
};

export default logger;
