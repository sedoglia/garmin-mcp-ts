# Garmin Connect MCP Server

<div align="center">

**English** | **[Italiano](README.md)**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-purple.svg)](https://modelcontextprotocol.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-3.1.0-green.svg)](https://github.com/sedoglia/garmin-mcp-ts)

[![PayPal](https://img.shields.io/badge/Support%20This%20Project-PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/sedoglia)

</div>

---

A Model Context Protocol (MCP) server that connects Claude Desktop to Garmin Connect, enabling natural language queries about your fitness activities, health metrics, sleep data, and more.

## What's New in v3.1.0 - Secure Encryption

### 🔐 At-Rest Encryption System
- **Encryption key in native OS vault**: Windows Credential Manager, macOS Keychain, Linux Secret Service
- **Credentials and tokens always encrypted**: AES-256-GCM encryption
- **Smart fallback**: Protected file if vault is not available
- **Cross-platform**: Works on Windows, macOS and Linux

### What's New in v3.0.0
- **OAuth Token Persistence**: Save/load OAuth tokens for session reuse
- **User Summary**: Complete daily user summary
- **Advanced Steps**: Daily steps with date ranges, detailed steps data
- **Activities by Date**: Search activities in a date range
- **Activity Typed Splits**: Detailed splits by activity type
- **Resting Heart Rate**: Daily resting heart rate
- **Hill Score**: Hill performance score
- **All Day Events**: Full day events (stress, body battery)
- **Advanced Badges**: Available badges, in progress, challenges
- **Virtual Challenges**: In-progress virtual challenges
- **Gear Activities**: Activities associated with equipment
- **Training Plans**: Available training plans
- **Women's Health**: Menstrual and pregnancy data
- **Activity Types**: All available activity types
- **Primary Device**: Primary training device
- **Activity Count**: Total activity count
- **Fitness Stats**: Fitness statistics over date ranges

## Features

This MCP server provides **68 powerful tools** to interact with your Garmin Connect data:

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

# New Tools in v2.0

### Workout Management
| Tool | Description |
|------|-------------|
| `get_workout_by_id` | Get details of a specific workout |
| `download_workout` | Download workout in FIT format for device sync |
| `create_workout` | **Create structured workouts** with warmup, intervals, cooldown |
| `update_workout` | Modify an existing workout |
| `delete_workout` | Delete a workout |
| `schedule_workout` | Schedule a workout on a specific date |
| `unschedule_workout` | Remove workout from calendar (⚠️ use before delete_workout) |

### Activity Management
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
| `get_gear_stats` | Get gear usage statistics (requires UUID from web interface) |
| `link_gear_to_activity` | Link gear to an activity (requires UUID from web interface) |

> **Note:** Garmin's OAuth API doesn't support listing gear. To use gear tools, you need to get the gear UUID from Garmin Connect web interface (Settings → Gear → click on gear → UUID is in the URL).

### Reports & Progress
| Tool | Description |
|------|-------------|
| `get_progress_summary` | Get progress summary between two dates |

---

## 🆕 New Tools in v3.0

### User & Activity Summary
| Tool | Description |
|------|-------------|
| `get_user_summary` | Get user summary for a date (steps, calories, etc.) |
| `get_steps_data` | Get detailed steps data for a date |
| `get_daily_steps` | Get daily steps over a date range (max 28 days) |
| `get_activities_by_date` | Get activities within a date range |
| `get_activity_typed_splits` | Get splits by activity type |

### Advanced Health Metrics
| Tool | Description |
|------|-------------|
| `get_rhr_day` | Get daily resting heart rate |
| `get_hill_score` | Get Hill Score over a date range |
| `get_all_day_events` | Get all day events (stress, body battery) |
| `get_body_battery_events` | Get detailed Body Battery events |

### Advanced Badges & Challenges
| Tool | Description |
|------|-------------|
| `get_available_badges` | Get all available badges |
| `get_in_progress_badges` | Get badges in progress |
| `get_available_badge_challenges` | Get available badge challenges |
| `get_non_completed_badge_challenges` | Get non-completed badge challenges |
| `get_in_progress_virtual_challenges` | Get in-progress virtual challenges |

### Advanced Gear
| Tool | Description |
|------|-------------|
| `get_gear_activities` | Get activities associated with gear (requires UUID) |
| `remove_gear_from_activity` | Remove gear from an activity (requires UUID) |

### Training Plans
| Tool | Description |
|------|-------------|
| `get_training_plans` | Get available training plans |
| `get_training_plan_by_id` | Get training plan details |

### Women's Health
| Tool | Description |
|------|-------------|
| `get_menstrual_data` | Get menstrual cycle data for a date |
| `get_pregnancy_summary` | Get pregnancy summary |

### Utility & Stats
| Tool | Description |
|------|-------------|
| `get_activity_types` | Get all available activity types |
| `get_primary_training_device` | Get primary training device |
| `count_activities` | Count total number of activities |
| `get_fitness_stats` | Get fitness statistics over a date range |
| `add_hydration_data` | Add hydration data |

---

## Prerequisites

- **Node.js** 18.0 or higher
- **npm** 8.0 or higher
- **Claude Desktop** installed
- **Garmin Connect** account with valid credentials

## 🚀 Quick Installation (Precompiled Bundle)

### Steps:

### 1. Install Keytar (Recommended for maximum security)

To use the native operating system vault (Windows Credential Manager, macOS Keychain, Linux Secret Service), install `keytar`:

```bash
npm install keytar
```

> **Note:** If `keytar` cannot be installed, the system will automatically use an encrypted file as a fallback.

### 2. Download the bundle

Use your browser or:

```bash
wget https://github.com/sedoglia/garmin-mcp-ts/releases/download/v3.1.0-bundle/garmin-mcp-ts.mcpb
```

### 3. Verify integrity

Verify the integrity (optional but recommended):

```bash
wget https://github.com/sedoglia/garmin-mcp-ts/releases/download/v3.1.0-bundle/garmin-mcp-ts.mcpb.sha256
sha256sum -c garmin-mcp-ts.mcpb.sha256
```

### 4. Install the extension in Claude Desktop (Recommended Method)

**Installation via Custom Desktop Extensions:**

1. Open **Claude Desktop**
2. Go to **Settings**
3. Select the **Extensions** tab
4. Click on **Advanced settings** and find the **Extension Developer** section
5. Click on **"Install Extension…"**
6. Select the `.mcpb` file (`garmin-mcp-ts.mcpb` downloaded in step 1)
7. Follow the on-screen instructions to complete the installation

> **Note:** This is the simplest and most recommended method. The extension will be automatically integrated into Claude Desktop without requiring manual configuration.

---

### 5. Configure Garmin Credentials (Secure Method - Recommended)

Open a **new chat in Claude Desktop** and write the following prompt:

```
Configure login credentials for Garmin
```

Respond to the message by providing:
- **User:** your Garmin email
- **Password:** your Garmin password

The extension will automatically encrypt and securely save the credentials in the native operating system vault (Windows Credential Manager, macOS Keychain, Linux Secret Service).

> **Note:** Credentials will NOT be saved in text files. They will always be encrypted and managed by the OS native vault.

### 6. Restart Claude Desktop

- Close the application completely
- Reopen Claude Desktop
- Verify in Settings → Developer the connection status ✅

## 🚀 Installation (by cloning the repository with GIT)

### 1. Clone the Repository

```bash
git clone https://github.com/sedoglia/garmin-mcp-ts.git
cd garmin-mcp-ts
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Keytar (Recommended for Maximum Security)

To use the native OS vault (Windows Credential Manager, macOS Keychain, Linux Secret Service), install `keytar`:

```bash
npm install keytar
```

> **Note:** If `keytar` cannot be installed, the system will automatically use an encrypted file as fallback.

### 4. Build the Project

```bash
npm run build
```

### 5. Configure Garmin Credentials (Secure Method - Recommended)

Run the setup script to configure credentials securely:

```bash
npm run setup-encryption
```

This script will:
1. Create a secure directory in your home folder
2. Generate an encryption key and save it in the native OS vault
3. Ask for Garmin email and password
4. Encrypt and save credentials securely

To verify the configuration:
```bash
npm run check-encryption
```

### 5b. Alternative Method (Legacy)

Alternatively, you can create a `.env` file in the project root:

```env
GARMIN_EMAIL=your.email@example.com
GARMIN_PASSWORD=your_garmin_password
```

> **Security Note:** Never commit your `.env` file to version control. It's already included in `.gitignore`. It's recommended to use the secure method described above.

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
      "args": ["C:\\percorso\\a\\garmin-mcp-ts\\dist\\index.js"]
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
      "args": ["/percorso/a/garmin-mcp-ts/dist/index.js"]
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

### Advanced Health Metrics (NEW v3.0)

> "What was my resting heart rate today?"

> "Show me my all-day events for stress and body battery"

### Women's Health Tools (NEW v3.0)

> "How does my menstrual cycle affect my training performance?"

> "Based on my cycle, what type of workout should I do?"

## Testing

Run tests with real data:

```bash
npm test
```

The test script validates all 69 tools with your Garmin account.

## Architecture

```
garmin-mcp-ts/
├── src/
│   ├── index.ts           # Entry point, stdout/stderr handling
│   ├── garmin/
│   │   ├── client.ts      # Garmin Connect API client (2200+ lines)
│   │   ├── types.ts       # TypeScript type definitions
│   │   └── simple-login.ts # Standalone login test utility
│   ├── mcp/
│   │   ├── server.ts      # MCP server setup and request handlers
│   │   ├── tools.ts       # Tool definitions and schemas (69 tools)
│   │   └── handlers.ts    # Tool implementation logic
│   └── utils/
│       ├── constants.ts   # Application constants
│       ├── errors.ts      # Custom error classes
│       ├── logger.ts      # Logging utility (stderr only)
│       └── secure-storage.ts # Secure storage module with encryption
├── scripts/
│   ├── setup-encryption.ts  # Interactive credentials setup script
│   ├── check-encryption.ts  # Diagnostic script for encryption verification
│   └── test-keytar.ts       # Keytar integration test script
├── dist/                  # Compiled JavaScript output
├── package.json
└── tsconfig.json
```

## 🔐 Security Architecture

The security system uses a two-tier architecture to protect credentials:

### Where Data is Stored

| Operating System | Encryption Key | Encrypted Data |
|------------------|----------------|----------------|
| **Windows** | Windows Credential Manager | `%LOCALAPPDATA%\garmin-mcp\` |
| **macOS** | Keychain (Face ID/Touch ID) | `~/Library/Application Support/garmin-mcp/` |
| **Linux** | Secret Service (D-Bus/GNOME) | `~/.config/garmin-mcp/` |

### How It Works

1. **Encryption Key**: An AES-256 key is generated on first run and saved in the native OS vault
2. **Credentials**: Email and password are encrypted with AES-256-GCM and saved in `garmin-credentials.enc`
3. **OAuth Tokens**: Tokens are encrypted and saved in `garmin-tokens.enc` for session reuse

### Why It's Secure

- **Key is never stored in plaintext on disk**: It's in the hardware/software OS vault
- **If the repository is exposed**: Data remains useless without the key
- **If the PC is cloned**: Data is inaccessible (key remains in original user's vault)
- **Strong encryption**: AES-256-GCM with random IV for each operation

### Fallback

If `keytar` is not available (native vault), the system uses an `.encryption.key` file with restricted permissions (0o600) in the data directory.

### Verify Encryption Status

To check the complete encryption and keytar status:

```bash
npm run check-encryption
```

To test keytar integration:

```bash
npm run test-keytar
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
