# Garmin Connect MCP Server

<div align="center">

**English** | **[Italiano](README.md)**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-purple.svg)](https://modelcontextprotocol.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-2.0.0-green.svg)](https://github.com/sedoglia/garmin-mcp-ts)

[![PayPal](https://img.shields.io/badge/Support%20This%20Project-PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/sedoglia)

</div>

---

A Model Context Protocol (MCP) server that connects Claude Desktop to Garmin Connect, enabling natural language queries about your fitness activities, health metrics, sleep data, and more.

## What's New in v2.0.0

**Massive expansion with 37 new tools!** Total: **55 MCP tools**

- **Workout Management**: Create, edit, schedule, and delete structured workouts
- **Activity Management**: Upload, download, edit, and delete activities
- **Advanced Metrics**: Training Readiness, Endurance Score, Fitness Age
- **Weight & Body**: Weight tracking, blood pressure management
- **Goals & Badges**: Goals, challenges, earned badges
- **Gear Management**: Shoes, bikes, and equipment tracking
- **Reports & Progress**: Daily summaries and progress reports

## Features

This MCP server provides **55 powerful tools** to interact with your Garmin Connect data:

### Activity Tools (Base)
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

### Wellness Metrics (v1.2)
| Tool | Description |
|------|-------------|
| `get_stress_data` | Get stress levels throughout the day (0-100 scale) |
| `get_body_battery` | Get Body Battery energy levels (0-100) |
| `get_hrv_data` | Get Heart Rate Variability (HRV) data |
| `get_respiration_data` | Get respiration/breathing rate data |
| `get_spo2_data` | Get SpO2 (blood oxygen saturation) data |

### User & Device Tools
| Tool | Description |
|------|-------------|
| `get_devices` | Get list of connected Garmin devices |
| `get_user_profile` | Get user profile information |
| `get_training_status` | Get training status and activity statistics |

---

## 🆕 New Tools in v2.0

### Workout Management (PRIORITY 1)
| Tool | Description |
|------|-------------|
| `get_workout_by_id` | Get details of a specific workout |
| `download_workout` | Download workout in FIT format for device sync |
| `create_workout` | **Create structured workouts** with warmup, intervals, cooldown |
| `update_workout` | Modify an existing workout |
| `delete_workout` | Delete a workout |
| `schedule_workout` | Schedule a workout on a specific date |

### Activity Management (PRIORITY 2)
| Tool | Description |
|------|-------------|
| `upload_activity` | Upload activity file (FIT, GPX, TCX) |
| `create_manual_activity` | Create manual activity entry |
| `set_activity_name` | Change activity name |
| `set_activity_type` | Change activity type |
| `delete_activity` | Delete an activity (⚠️ irreversible) |
| `download_activity` | Download activity in various formats (FIT, TCX, GPX, KML, CSV) |

### Device & Settings
| Tool | Description |
|------|-------------|
| `get_device_last_used` | Get info about last used device |
| `get_device_settings` | Get settings for a specific device |

### Advanced Health & Wellness
| Tool | Description |
|------|-------------|
| `get_all_day_stress` | Get detailed all-day stress data |
| `get_floors` | Get floors climbed |
| `get_intensity_minutes` | Get intensity minutes (moderate and vigorous) |
| `get_max_metrics` | Get max metrics (VO2 max, etc.) |
| `get_training_readiness` | **Get Training Readiness score** |
| `get_endurance_score` | **Get Endurance Score** |
| `get_fitness_age` | **Get estimated Fitness Age** |
| `get_daily_summary` | Get comprehensive daily summary |

### Weight & Body
| Tool | Description |
|------|-------------|
| `get_weigh_ins` | Get weigh-ins for a date range |
| `add_weigh_in` | Add weigh-in with body composition data |
| `delete_weigh_in` | Delete a weigh-in |
| `get_blood_pressure` | Get blood pressure readings |
| `set_blood_pressure` | Record blood pressure measurement |

### Advanced Activity Details
| Tool | Description |
|------|-------------|
| `get_activity_weather` | Get weather during an activity |
| `get_activity_hr_zones` | Get time in HR zones |
| `get_activity_gear` | Get gear used in an activity |
| `get_activity_exercise_sets` | Get exercise sets (strength training) |

### Goals, Challenges & Records
| Tool | Description |
|------|-------------|
| `get_goals` | Get goals (active, future, past) |
| `get_adhoc_challenges` | Get ad-hoc challenges |
| `get_badge_challenges` | Get available badge challenges |
| `get_earned_badges` | Get earned badges |
| `get_personal_records` | Get personal records |
| `get_race_predictions` | Get race time predictions (5K, 10K, HM, M) |

### Gear Management
| Tool | Description |
|------|-------------|
| `get_gear` | Get all equipment |
| `get_gear_defaults` | Get default gear by activity type |
| `get_gear_stats` | Get gear usage statistics |
| `link_gear_to_activity` | Link gear to an activity |

### Reports & Progress
| Tool | Description |
|------|-------------|
| `get_progress_summary` | Get progress summary between two dates |

---

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

### Workout Management (NEW v2.0)

> "Show me my planned workouts"

> "Download my latest workout"

### Training Readiness (NEW v2.0)

> "What's my Training Readiness today?"

> "Show me my Endurance Score"

### Progress & Statistics (NEW v2.0)

> "How many kilometers did I run this month?"

> "Show me my progress summary for the last month"

## Testing

Run tests with real data:

```bash
npm test
```

The test script validates all 55 tools with your Garmin account.

## Architecture

```
garmin-mcp-ts/
├── src/
│   ├── index.ts           # Entry point, stdout/stderr handling
│   ├── garmin/
│   │   ├── client.ts      # Garmin Connect API client (1600+ lines)
│   │   ├── types.ts       # TypeScript type definitions
│   │   └── simple-login.ts # Standalone login test utility
│   ├── mcp/
│   │   ├── server.ts      # MCP server setup and request handlers
│   │   ├── tools.ts       # Tool definitions and schemas (55 tools)
│   │   └── handlers.ts    # Tool implementation logic
│   └── utils/
│       ├── constants.ts   # Application constants
│       ├── errors.ts      # Custom error classes
│       └── logger.ts      # Logging utility (stderr only)
├── dist/                  # Compiled JavaScript output
├── package.json
└── tsconfig.json
```

## Troubleshooting

### Common Issues

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

## Credits & Acknowledgments

This project was inspired by and built upon the work of several open-source projects:

- [Taxuspt/garmin_mcp](https://github.com/Taxuspt/garmin_mcp) - Original Garmin MCP implementation
- [matin/garth](https://github.com/matin/garth) - Garmin authentication library
- [matin/garth-mcp-server](https://github.com/matin/garth-mcp-server) - Garth-based MCP server
- [Async-IO/pierre_mcp_server](https://github.com/Async-IO/pierre_mcp_server) - MCP server patterns
- [WillRaphaelson/garmin-mcp](https://github.com/WillRaphaelson/garmin-mcp) - Reference for API endpoints

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

<div align="center">

### Support Development

If you find this project useful, please consider supporting it with a donation!

[![PayPal](https://img.shields.io/badge/Donate%20with-PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/sedoglia)

**English** | **[Italiano](README.md)** | [Report Issues](https://github.com/sedoglia/garmin-mcp-ts/issues)

</div>
