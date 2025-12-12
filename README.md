# Garmin Connect MCP Server

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-purple.svg)](https://modelcontextprotocol.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) server that connects Claude Desktop to Garmin Connect, enabling natural language queries about your fitness activities, health metrics, sleep data, and more.

## Features

This MCP server provides **18 powerful tools** to interact with your Garmin Connect data:

### Activity Tools
| Tool | Description |
|------|-------------|
| `list_recent_activities` | Get a list of recent activities with optional filters |
| `get_activity_details` | Get detailed information about a specific activity |
| `get_activity_splits` | Get split/lap data for a specific activity |
| `get_workouts` | Get list of scheduled/planned workouts |

### Health & Wellness Tools
| Tool | Description |
|------|-------------|
| `get_health_metrics` | Get daily health metrics (steps, heart rate, VO2 max) |
| `get_sleep_data` | Get detailed sleep information (duration, quality, stages) |
| `get_body_composition` | Get body composition data (weight, BMI, body fat) |
| `get_steps` | Get step count for a specific date |
| `get_heart_rate` | Get detailed heart rate data for a specific date |
| `get_hydration` | Get daily hydration/water intake data |

### Wellness Metrics (NEW in v1.2)
| Tool | Description |
|------|-------------|
| `get_stress_data` | **Get stress levels throughout the day (0-100 scale)** |
| `get_body_battery` | **Get Body Battery energy levels (0-100)** |
| `get_hrv_data` | Get Heart Rate Variability (HRV) data |
| `get_respiration_data` | Get respiration/breathing rate data |
| `get_spo2_data` | Get SpO2 (blood oxygen saturation) data |

### User & Device Tools
| Tool | Description |
|------|-------------|
| `get_devices` | Get list of connected Garmin devices |
| `get_user_profile` | Get user profile information |
| `get_training_status` | Get training status and activity statistics |

## Prerequisites

- **Node.js** 18.0 or higher
- **npm** 8.0 or higher
- **Claude Desktop** application installed
- **Garmin Connect** account with valid credentials

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/sedoglia/garmin-mcp-ts.git
cd garmin-mcp-ts
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the Project

```bash
npm run build
```

### 4. Configure Garmin Credentials

Create a `.env` file in the project root:

```env
GARMIN_EMAIL=your.email@example.com
GARMIN_PASSWORD=your_garmin_password
```

> **Security Note:** Never commit your `.env` file to version control. It's already included in `.gitignore`.

## Claude Desktop Configuration

### Locating the Configuration File

The Claude Desktop configuration file is located at:

- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux:** `~/.config/Claude/claude_desktop_config.json`

### Configuration Example

Add the Garmin MCP server to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "garmin": {
      "command": "node",
      "args": ["C:\\path\\to\\garmin-mcp-ts\\dist\\index.js"],
      "env": {
        "GARMIN_EMAIL": "your.email@example.com",
        "GARMIN_PASSWORD": "your_garmin_password"
      }
    }
  }
}
```

**For macOS/Linux:**

```json
{
  "mcpServers": {
    "garmin": {
      "command": "node",
      "args": ["/path/to/garmin-mcp-ts/dist/index.js"],
      "env": {
        "GARMIN_EMAIL": "your.email@example.com",
        "GARMIN_PASSWORD": "your_garmin_password"
      }
    }
  }
}
```

### Verifying the Setup

1. Restart Claude Desktop after saving the configuration
2. Look for the Garmin tools in Claude's available tools (hammer icon)
3. Try asking: "What were my recent activities on Garmin?"

<!-- Screenshot placeholder: Show Claude Desktop with Garmin tools available -->

## Usage Examples

### Querying Recent Activities

> "Show me my last 5 Garmin activities"

> "What activities did I do this week?"

### Getting Health Metrics

> "What are my health metrics for today?"

> "How many steps did I take yesterday?"

### Sleep Analysis

> "How did I sleep last night?"

> "Show me my sleep data for December 10th"

### Activity Details

> "Tell me more about my last running activity"

> "What was my average heart rate in my most recent workout?"

### Device Information

> "What Garmin devices do I have connected?"

### Training Status

> "What's my current training status?"

> "How many activities have I recorded in total?"

## Tool Reference

### list_recent_activities

Retrieves a list of recent activities from Garmin Connect.

**Parameters:**
- `limit` (optional, number): Maximum number of activities to return. Default: 10, Max: 100
- `start` (optional, number): Starting index for pagination. Default: 0

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "activityId": 12345678,
      "activityName": "Morning Run",
      "startTimeLocal": "2024-12-11 07:30:00",
      "distance": 5000,
      "duration": 1800,
      "averageHeartRate": 145
    }
  ]
}
```

### get_activity_details

Gets detailed information about a specific activity.

**Parameters:**
- `activityId` (required, number): The unique activity identifier

### get_health_metrics

Retrieves daily health metrics for a specific date.

**Parameters:**
- `date` (optional, string): Date in YYYY-MM-DD format. Default: today

**Returns:** Heart rate data, step count, and other daily metrics.

### get_sleep_data

Gets detailed sleep information for a specific date.

**Parameters:**
- `date` (optional, string): Date in YYYY-MM-DD format. Default: today

**Returns:** Sleep duration, sleep stages, sleep quality score.

### get_body_composition

Retrieves body composition data.

**Parameters:**
- `days` (optional, number): Number of days of data. Default: 30

**Returns:** Weight, BMI, body fat percentage (if available).

### get_devices

Lists all connected Garmin devices.

**Parameters:** None

**Returns:** Device information including name, model, and settings.

### get_user_profile

Gets user profile information.

**Parameters:** None

**Returns:** User ID, display name, and profile settings.

### get_training_status

Retrieves training status and statistics.

**Parameters:**
- `days` (optional, number): Number of days for statistics. Default: 7

**Returns:** Activity count, training statistics, user settings.

### get_steps

Gets step count for a specific date.

**Parameters:**
- `date` (optional, string): Date in YYYY-MM-DD format. Default: today

**Returns:** Total steps recorded for the specified date.

### get_heart_rate

Gets detailed heart rate data for a specific date.

**Parameters:**
- `date` (optional, string): Date in YYYY-MM-DD format. Default: today

**Returns:** Resting heart rate, max heart rate, and heart rate zones.

### get_hydration

Gets daily hydration/water intake data.

**Parameters:**
- `date` (optional, string): Date in YYYY-MM-DD format. Default: today

**Returns:** Hydration data in oz and ml (or message if no data recorded).

### get_workouts

Gets list of scheduled/planned workouts.

**Parameters:**
- `limit` (optional, number): Maximum number of workouts to return. Default: 10, Max: 100
- `start` (optional, number): Starting index for pagination. Default: 0

**Returns:** List of planned workouts from Garmin Connect.

### get_activity_splits

Gets split/lap data for a specific activity.

**Parameters:**
- `activityId` (required, number): The unique activity identifier

**Returns:** Split summaries including pace, distance, and time for each split.

### get_stress_data (NEW in v1.2)

Gets stress level data for a specific date. Stress is measured on a 0-100 scale:
- **0-25**: Resting state
- **26-50**: Low stress
- **51-75**: Medium stress
- **76-100**: High stress

**Parameters:**
- `date` (optional, string): Date in YYYY-MM-DD format. Default: today

**Returns:** Overall stress level, duration by category (rest, low, medium, high), average/max/min stress, and timestamped stress values.

### get_body_battery (NEW in v1.2)

Gets Body Battery energy level data. Body Battery tracks energy levels (0-100) throughout the day based on sleep quality, stress, and physical activity.

**Parameters:**
- `startDate` (optional, string): Start date in YYYY-MM-DD format. Default: today
- `endDate` (optional, string): End date in YYYY-MM-DD format. Default: same as startDate

**Returns:** Energy levels throughout the day, max/min levels, charged and drained amounts.

### get_hrv_data (NEW in v1.2)

Gets Heart Rate Variability (HRV) data for a specific date. HRV measures the variation in time between heartbeats, which indicates recovery status and stress levels.

**Parameters:**
- `date` (optional, string): Date in YYYY-MM-DD format. Default: today

**Returns:** HRV metrics and readings.

### get_respiration_data (NEW in v1.2)

Gets respiration/breathing rate data for a specific date.

**Parameters:**
- `date` (optional, string): Date in YYYY-MM-DD format. Default: today

**Returns:** Breaths per minute throughout the day and during sleep.

### get_spo2_data (NEW in v1.2)

Gets SpO2 (blood oxygen saturation) data for a specific date. Normal SpO2 levels are typically 95-100%.

**Parameters:**
- `date` (optional, string): Date in YYYY-MM-DD format. Default: today

**Returns:** Pulse oximetry readings as percentage.

## Troubleshooting

### Common Issues

#### "Cannot read properties of undefined"

This error typically occurs when the server receives malformed arguments. Ensure you're using the latest version with proper argument handling.

#### Authentication Failed

1. Verify your Garmin credentials are correct
2. Check if you can log in to [connect.garmin.com](https://connect.garmin.com) manually
3. Ensure there are no special characters in your password that might need escaping

#### Rate Limiting (Error 429)

Garmin may temporarily block requests if too many are made in a short period. Wait a few minutes and try again.

#### Server Not Appearing in Claude Desktop

1. Check that the path to `dist/index.js` is correct and absolute
2. Verify the configuration JSON syntax is valid
3. Restart Claude Desktop completely
4. Check Claude Desktop logs for errors

### Viewing Logs

The server outputs diagnostic information to stderr. In Claude Desktop, check the application logs:

- **Windows:** `%APPDATA%\Claude\logs\`
- **macOS:** `~/Library/Logs/Claude/`

### Debug Mode

Enable debug logging by setting the environment variable:

```json
{
  "env": {
    "GARMIN_EMAIL": "...",
    "GARMIN_PASSWORD": "...",
    "DEBUG_GARMIN": "true"
  }
}
```

## Architecture

```
garmin-mcp-ts/
├── src/
│   ├── index.ts           # Entry point, stdout/stderr handling
│   ├── garmin/
│   │   ├── client.ts      # Garmin Connect API client
│   │   ├── types.ts       # TypeScript type definitions
│   │   └── simple-login.ts # Standalone login test utility
│   ├── mcp/
│   │   ├── server.ts      # MCP server setup and request handlers
│   │   ├── tools.ts       # Tool definitions and schemas
│   │   └── handlers.ts    # Tool implementation logic
│   └── utils/
│       ├── constants.ts   # Application constants
│       ├── errors.ts      # Custom error classes
│       └── logger.ts      # Logging utility (stderr only)
├── dist/                  # Compiled JavaScript output
├── package.json
└── tsconfig.json
```

### Key Design Decisions

- **Stdout Protection:** All console.log calls are redirected to stderr to ensure only valid JSON-RPC messages appear on stdout
- **Garmin Connect Library:** Uses the `garmin-connect` npm package for reliable authentication
- **JSON Schema Validation:** Input parameters are validated using JSON Schema with optional fields and sensible defaults

## Credits & Acknowledgments

This project was inspired by and built upon the work of several open-source projects:

- [Taxuspt/garmin_mcp](https://github.com/Taxuspt/garmin_mcp) - Original Garmin MCP implementation
- [matin/garth](https://github.com/matin/garth) - Garmin authentication library
- [matin/garth-mcp-server](https://github.com/matin/garth-mcp-server) - Garth-based MCP server
- [Async-IO/pierre_mcp_server](https://github.com/Async-IO/pierre_mcp_server) - MCP server patterns

Special thanks to the [garmin-connect](https://www.npmjs.com/package/garmin-connect) npm package maintainers.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This project is not affiliated with, endorsed by, or connected to Garmin Ltd. or any of its subsidiaries. Garmin and Garmin Connect are trademarks of Garmin Ltd.

---

**[Italian version available](README_IT.md)** | [Report Issues](https://github.com/sedoglia/garmin-mcp-ts/issues)
