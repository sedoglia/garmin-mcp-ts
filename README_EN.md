# Garmin Connect MCP Server

<div align="center">

**English** | **[Italiano](README.md)**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-green.svg)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-purple.svg)](https://modelcontextprotocol.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-4.4.0-green.svg)](https://github.com/sedoglia/garmin-mcp-ts)

[![PayPal](https://img.shields.io/badge/Support%20This%20Project-PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/sedoglia)

</div>

---

A Model Context Protocol (MCP) server that connects Claude Desktop to Garmin Connect, enabling natural language queries about your fitness activities, health metrics, sleep data, and more.

## 🆕 What's New in v4.4.0 - Leaner responses and Node 22

- **`get_floors`**: returns the daily totals only; the 15-minute breakdown is available
  with `includeBreakdown: true`. The normal response drops from ~5600 to ~210 characters.
- **Node 22 required**: the manifest asked for Node 18, which stopped receiving security
  patches on 30 April 2025 (Node 20 on 30 April 2026). If you are on Node 18 or 20 you
  need to update, or Claude Desktop will treat the extension as incompatible. No server
  code changed for this - it only uses long-standing APIs.
- **Security**: every open advisory in the dependency tree is closed (`hono`,
  `fast-uri`, `ip-address`, `tmp`). `npm audit` reports nothing.

## 🆕 What's New in v4.3.3 - Icon

- The bundle icon was the official Garmin Connect app artwork. It has been replaced with
  an original drawing: no third-party logo or trademark, so the extension does not
  present itself as a Garmin product.
- The area around the rounded square is transparent rather than white — an opaque PNG
  would show a white box around the icon on a dark theme.

## 🆕 What's New in v4.3.2 - The OS vault on every platform

### 🔐 **KEYTAR**
- The bundle carried **a single native keytar binary**, the one belonging to whichever
  machine packed it. Loading it failed on every other platform, and the encryption key
  went to the fallback file rather than the operating system vault — that is, on Windows
  and macOS, where Claude Desktop runs, while the manifest and the privacy policy
  promised the vault.
- The bundle now carries one binary per platform (`darwin-x64`, `darwin-arm64`,
  `win32-x64`, `win32-ia32`, `linux-x64`, `linux-arm64`) under `vendor/keytar`, and the
  server loads the one matching `process.platform` / `process.arch`. They are fetched at
  pack time by the same `prebuild-install` npm would use on each platform.
- The file fallback remains for architectures with no prebuild, and for Linux sessions
  with no keyring daemon running: `check_credentials` reports which of the two is in use.
- **Automatic migration**: anyone upgrading has their key in the file; on the first start
  it is moved into the vault and the file removed. If the vault refuses, the key stays
  where it is and the move is retried on the next start. The method that performs the
  migration had been in the project for some time but was never called.

### 📄 **PRIVACY POLICY**
- The file fallback is documented; it was not mentioned before.

## 🆕 What's New in v4.3.1 - MCP Directory requirements

No change to what the tools do: what changed is what the server and the bundle
declare about themselves.

### 📋 **MANIFEST**
- **`display_name`**: a required field that was missing. It now reads "Garmin Connect".
- **`icon`**: the value was `.\GARMIN.png`, a Windows-style relative path that does not
  resolve when the bundle is unpacked on other platforms. It is now `GARMIN.png`, and the
  image was squared to 512×512, the size Claude Desktop recommends.
- **`privacy_policies`**: absent. A missing or incomplete privacy policy is an immediate
  rejection at review. It now lists the project's policy and Garmin's.
- **`tools`**: all 109 tools are declared in the manifest, generated from the code with
  `npm run sync:manifest` and verified in CI, so the list cannot drift.
- **`long_description`**, **`keywords`**, **`compatibility`**: added for the directory
  listing and to declare the platforms and Node version required.

### 🏷️ **TOOL ANNOTATIONS**
- `tools/list` returned only name, description and schema: **titles and annotations never
  left the server**. The directory reads exactly that response to classify tools, so all
  109 appeared with no title and no safety hint. Every tool now carries `title`,
  `readOnlyHint`/`destructiveHint` and `openWorldHint`.
- **`setup_credentials`**: the only tool with neither `readOnlyHint` nor `destructiveHint`.
  It overwrites stored credentials and tokens, so it now declares `destructiveHint`.
- **`delete_weigh_in`**: description expanded to say what is deleted and where the ID
  comes from.

### 🔒 **SECURITY**
- Tool arguments were logged in full when `DEBUG_GARMIN` was set, which put the password
  passed to `setup_credentials` on stderr in clear text. Sensitive values are now replaced
  with `[redacted]` and the email is masked.

### 🔧 **RELEASE**
- The `.mcpb` bundle and its `.sha256` are built from the tag by a GitHub Actions
  workflow, with production dependencies only, instead of by hand.
- The README download links point at `releases/latest`, so they no longer drift with each
  version.

## 🆕 What's New in v4.3.0 - Correctness of the data tools return

Nineteen tools answered with empty, stub or plainly wrong data. Every fix was
verified against a live Garmin account.

### 🐛 **WRONG DATA** ✅ FIXED
- **`count_activities`**: always returned `0`. The service answers with an array of
  buckets holding `countOfActivities`, while the code read a non-existent `totalCount`.
  Now accepts optional `startDate` / `endDate`.
- **`get_training_status`**: returned the lifetime activity count plus the entire user
  settings blob. It now uses the training status endpoint and takes `date` instead of the
  meaningless `days`.
- **`get_goals`**: 400 error because no `status` parameter was sent. Without `status` it
  now queries all three statuses and merges the results.
- **`get_device_alarms`**: returned `[]`. There is no `deviceservice/alarms` endpoint:
  alarms are part of the device settings. `deviceId` is now optional.
- **`get_devices` / `get_device_last_used`**: both returned user settings instead of a
  device list and the most recently used device.
- **`get_personal_records`**: read `profile.personalRecords`, a field that does not exist.
- **`get_intensity_minutes` / `get_floors`**: the endpoints used answered 404, so they
  reported "no data" even for days that clearly had some.
- **`get_daily_summary`**: returned only steps plus the whole heart rate series. It now
  includes calories, distance, floors, intensity minutes, stress and Body Battery.
- **`get_body_composition`**: ignored `days` and queried only the current day.
- **`compare_activities` / `find_similar_activities`**: activity detail keeps its metrics
  in `summaryDTO`, so the comparisons produced `undefined` and `NaN`.
- **`get_activity_splits`**: always empty, looking for the data in a payload that does not
  carry it.
- **`get_race_predictions`**, **`get_training_load`**, **`get_load_ratio`**: wrong or
  non-existent endpoints, masked as "no data".
- **`get_training_readiness`**, **`get_max_metrics`**, **`get_activity_hr_zones`**,
  **`get_activity_exercise_sets`**: wrong response shape (arrays spread into objects such
  as `{"0": ...}`).
- **`get_progress_summary`**: filtered only the last 100 activities, silently truncating
  busier periods.

### ✨ **NEW PARAMETERS**
- `count_activities`: `startDate`, `endDate`
- `get_training_status`: `date` (replaces `days`)
- `get_device_alarms`: `deviceId` is now optional, defaulting to every device
- `get_intensity_minutes`, `get_body_composition`: `endDate`
- `find_similar_activities`: `searchDepth`
- `set_activity_privacy`: `subscribers` level ("connections only")

## 🆕 What's New in v4.2.0 - First install and credentials

### 🔐 **CREDENTIAL CONFIGURATION** ✅ NEW
- **Credentials requested during installation**: Claude Desktop asks for your Garmin email
  and password when the bundle is installed. The password is kept in the operating system
  vault, never in a plain text file.
- **`setup_credentials`**: new tool to configure credentials from the chat, without
  restarting the extension.
- **`check_credentials`**: reports whether credentials are configured, which source they
  come from and where they are stored (never returns the password).
- **`clear_credentials`**: deletes encrypted credentials and OAuth tokens.

### 🐛 **SERVER STARTUP** ✅ FIXED
- The server no longer exits at startup when credentials are missing or invalid: the MCP
  transport is connected first and login happens on the first request. The
  `Server transport closed unexpectedly` error on a clean install is fixed, replaced by a
  message explaining what needs to be configured.
- Credentials set in the extension settings take precedence over the encrypted copy on
  disk, which is realigned automatically whenever they change.

### 📈 Now with **109 TOOLS** available!

---

## 🎉 What's New in v4.1.0 - Gear Management & Collections

### 🔧 **GEAR MANAGEMENT** ✅ IMPROVED
- **`get_all_gear`**: ✅ **NOW WORKING** - Automatic listing of all equipment (no more manual UUID needed!)
- ~~**`create_gear`**~~: ❌ **REMOVED** (Garmin OAuth API returns 403 Forbidden for gear creation)
- **`update_gear`**: Update equipment (UUID now obtainable via `get_all_gear`)
- **`delete_gear`**: Delete equipment (UUID now obtainable via `get_all_gear`)

### 🆕 **GEAR METADATA & COLLECTIONS** ✅ NEW
- **`get_gear_types`**: Get available equipment types (shoes, bike, helmet, etc.)
- **`get_gear_makes`**: Get available brands/manufacturers
- **`get_gear_collections`**: List all equipment collections
- **`get_gear_collection`**: Collection details (associated gear, activity types)
- **`create_gear_collection`**: Create a new equipment collection
- **`update_gear_collection`**: Update a collection (name, gear, activity types)
- **`delete_gear_collection`**: Delete a collection

### 📈 Now with **106 TOOLS** available! (all tested and working)

---

## What's New in v4.1.0 - Social & Advanced Analytics

### 🤝 **SOCIAL FEATURES** ⚠️ PARTIAL
- **`get_activity_comments`**: Get comments on an activity ✅ WORKING
- ~~**`add_activity_comment`**: Add comments to activities~~ ❌ **REMOVED** (Not supported by Garmin OAuth API)
- **`set_activity_privacy`**: Set privacy (**public**, **private** or **subscribers**)

### 📊 **ADVANCED TRAINING METRICS** ✅ TESTED
- **`get_training_load`**: Weekly training load and balance
- **`get_load_ratio`**: Acute/chronic workload ratio (injury risk indicator)
- **`get_performance_condition`**: Current performance condition score

### 💤 **ADVANCED SLEEP ANALYSIS** ✅ TESTED
- **`get_sleep_movement`**: Sleep movement data and restless moments

### ⏰ **DEVICE MANAGEMENT** ✅ TESTED
- **`get_device_alarms`**: Get alarms configured on devices

### 🗺️ **COURSE MANAGEMENT** ✅ TESTED
- **`get_courses`**: Get saved routes/courses

### 🔬 **ACTIVITY ANALYSIS TOOLS** ✅ TESTED
- **`compare_activities`**: Compare 2-5 activities side by side
- **`find_similar_activities`**: Find similar activities by type/distance/duration (20% tolerance)
- **`analyze_training_period`**: Comprehensive training trends, volume and pattern analysis

---

## Features

This MCP server provides **109 powerful tools** to interact with your Garmin Connect data:

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
| `get_body_composition` | Get body composition measurements (weight, BMI, body fat, muscle mass) over a `days` window, plus the average |
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
| `get_devices` | Get the list of registered Garmin devices (id, model, serial, firmware) |
| `get_user_profile` | Get user profile information |
| `get_training_status` | Get the training status for a date: status, VO2 max, acute/chronic load, ACWR |

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
| `get_floors` | Get floors climbed and descended; `includeBreakdown` adds the 15-minute intervals |
| `get_intensity_minutes` | Get intensity minutes (moderate and vigorous) for a date or range, with weekly totals and goal |
| `get_max_metrics` | Get max metrics (VO2 max, etc.) |
| `get_training_readiness` | **Get Training Readiness score** |
| `get_endurance_score` | **Get Endurance Score** |
| `get_fitness_age` | **Get estimated Fitness Age** |
| `get_daily_summary` | Get a full daily summary (steps, calories, distance, floors, intensity minutes, HR, stress, Body Battery) |

### Weight & Body
| Tool | Description |
|------|-------------|
| `get_weigh_ins` | Get weigh-ins for a date range |
| `add_weigh_in` | Add weigh-in with body composition data |
| `delete_weigh_in` | Delete a weigh-in |
| `get_blood_pressure` | Get blood pressure readings |
| `set_blood_pressure` | Record blood pressure measurement |
| `delete_blood_pressure` | Delete blood pressure measurement |

### Advanced Activity Details
| Tool | Description |
|------|-------------|
| `get_activity_weather` | Get weather during an activity |
| `get_activity_hr_zones` | Get the time spent in each heart rate zone |
| `get_activity_exercise_sets` | Get exercise sets (strength training) |

### Goals, Challenges & Records
| Tool | Description |
|------|-------------|
| `get_goals` | Get goals; without `status` every status is queried and the results merged |
| `get_adhoc_challenges` | Get ad-hoc challenges |
| `get_badge_challenges` | Get available badge challenges |
| `get_earned_badges` | Get earned badges |
| `get_personal_records` | Get personal records (typeId, value, date and the activity they were set in) |
| `get_race_predictions` | Get race time predictions (5K, 10K, HM, M) |

### Gear Management
| Tool | Description |
|------|-------------|
| `get_all_gear` | Complete list of all equipment with UUIDs |
| `update_gear` | Update existing equipment |
| `delete_gear` | Delete equipment |
| `get_gear_stats` | Get gear usage statistics |
| `link_gear_to_activity` | Link gear to an activity |

> **Note:** Since v4.1, `get_all_gear` works automatically and provides the UUIDs needed for other gear tools. New gear creation is not supported by Garmin's OAuth API.

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
| `get_gear_activities` | Get activities associated with gear |
| `remove_gear_from_activity` | Remove gear from an activity |

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
| `count_activities` | Count activities, over the whole history or over a date range |
| `get_fitness_stats` | Get fitness statistics over a date range |
| `add_hydration_data` | Add hydration data |

---

## 🆕 New Tools in v4.0

### Social Features
| Tool | Description |
|------|-------------|
| `get_activity_comments` | Get comments on an activity |
| `set_activity_privacy` | Set activity privacy (public/private/subscribers) |

### Advanced Training Metrics
| Tool | Description |
|------|-------------|
| `get_training_load` | Monthly training load balance (low/high aerobic, anaerobic) against its targets |
| `get_load_ratio` | Acute/chronic workload ratio (injury risk indicator) |
| `get_performance_condition` | Current performance condition score |

### Advanced Sleep & Device
| Tool | Description |
|------|-------------|
| `get_sleep_movement` | Sleep movement data and restless moments |
| `get_device_alarms` | Alarms configured on devices (time, repeat days, on/off) |
| `get_courses` | Saved routes/courses |

### Activity Analysis
| Tool | Description |
|------|-------------|
| `compare_activities` | Compare 2-5 activities side by side |
| `find_similar_activities` | Find similar activities by type/distance/duration |
| `analyze_training_period` | Comprehensive training trends, volume and patterns |

---

## 🆕 New Tools in v4.1

### Gear Metadata
| Tool | Description |
|------|-------------|
| `get_gear_types` | Available equipment types (shoes, bike, etc.) |
| `get_gear_makes` | Available brands/manufacturers |

### Gear Collections (Full CRUD)
| Tool | Description |
|------|-------------|
| `get_gear_collections` | List all equipment collections |
| `get_gear_collection` | Collection details (associated gear, activity types) |
| `create_gear_collection` | Create new collection with activity association |
| `update_gear_collection` | Update collection (name, gear, activity types) |
| `delete_gear_collection` | Delete a collection |

---

## 🆕 New Tools in v4.2

### Credentials
These work even when authentication to Garmin is not yet possible: they are how you set
it up.

| Tool | Description |
|------|-------------|
| `setup_credentials` | Save email and password encrypted in the OS vault and verify access immediately |
| `check_credentials` | Configuration status: active source, storage, session (never the password) |
| `clear_credentials` | Delete encrypted credentials and OAuth tokens and end the session |

---

## Prerequisites

- **Node.js** 22.0 or higher
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
wget https://github.com/sedoglia/garmin-mcp-ts/releases/latest/download/garmin-mcp-ts.mcpb
```

### 3. Verify integrity

Verify the integrity (optional but recommended):

```bash
wget https://github.com/sedoglia/garmin-mcp-ts/releases/latest/download/garmin-mcp-ts.mcpb.sha256
sha256sum -c garmin-mcp-ts.mcpb.sha256
```

### 4. Install the extension in Claude Desktop (Recommended Method)

**Installation via Custom Desktop Extensions:**

1. Open **Claude Desktop**
2. Go to **Settings**
3. Select the **Extensions** tab
4. Click on **Advanced settings** and find the **Extension Developer** section
5. Click on **"Install Extension…"**
6. Select the `.mcpb` file (`garmin-mcp-ts.mcpb` downloaded in step 2)
7. Follow the on-screen instructions to complete the installation

> **Note:** This is the simplest and most recommended method. The extension will be automatically integrated into Claude Desktop without requiring manual configuration.

---

### 5. Configure Garmin Credentials

During installation Claude Desktop shows two fields, **Garmin Email** and
**Garmin Password**: fill them in with your Garmin Connect account credentials.
The password is kept in the native operating system vault (Windows Credential Manager,
macOS Keychain, Linux Secret Service) and is never written in plain text.

You can review or change both fields at any time from
**Settings → Extensions → garmin-mcp-ts**.

**Alternatively, from the chat:** open a **new chat in Claude Desktop** and write:

```
Configure login credentials for Garmin
```

Respond to the message by providing:
- **User:** your Garmin email
- **Password:** your Garmin password

Claude uses the `setup_credentials` tool, which encrypts and saves the credentials in the
OS native vault and immediately verifies access to Garmin Connect. No restart needed.

> **Note:** Credentials will NOT be saved in text files. They will always be encrypted and
> managed by the OS native vault. If you filled in the extension fields, those values take
> precedence over anything saved by `setup_credentials`: to change them, edit them in
> Settings → Extensions.

To check the configuration at any time:

```
Check the Garmin credentials status
```

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

### Gear Management (NEW v4.0/v4.1)

> "Show me all my Garmin gear"

> "What types of equipment can I manage?"

> "Create a 'Running Shoes' collection and associate it with running activities"

> "Show me my gear collections"

### Comments and Privacy (NEW v4.0)

> "Show me comments on my latest activity"

> "Set my last run as private"

### Advanced Training Metrics (NEW v4.0)

> "How is my training load this month?"

> "What's my acute/chronic ratio? Am I at injury risk?"

### Activity Analysis (NEW v4.0)

> "Compare my last 3 runs"

> "Find activities similar to my Sunday run"

> "Analyze my training for the last month"

## Testing

Run tests with real data:

```bash
npm test
```

The test script validates all the tools with your Garmin account.

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
│   │   ├── tools.ts       # Tool definitions and schemas (109 tools)
│   │   └── handlers.ts    # Tool implementation logic
│   └── utils/
│       ├── constants.ts   # Application constants
│       ├── errors.ts      # Custom error classes
│       ├── logger.ts      # Logging utility (stderr only)
│       └── secure-storage.ts # Secure storage module with encryption
├── scripts/
│   ├── setup-encryption.ts  # Interactive credentials setup script
│   ├── check-encryption.ts  # Diagnostic script for encryption verification
│   ├── sync-manifest.ts     # Regenerates and checks manifest.json from the code
│   └── test-keytar.ts       # Keytar integration test script
├── dist/                  # Compiled JavaScript output
├── manifest.json          # MCPB bundle manifest (partly generated by sync-manifest)
├── PRIVACY.md             # Privacy policy referenced by the manifest
├── package.json
└── tsconfig.json
```

## 📦 Building the .mcpb bundle

The published bundle is built by the `Release` workflow, which attaches `.mcpb` and
`.sha256` to a draft release. It starts either way:

- **from a tag**: `git tag v4.3.1 && git push origin v4.3.1`;
- **by hand**: Actions → Release → *Run workflow*, naming the tag to publish. If that tag
  does not exist yet, the workflow creates it from the selected branch; if it does, the
  workflow builds what the tag points at.

The release starts as a draft. The *publish* checkbox publishes it: running the workflow
again on the same tag with that box ticked publishes the existing draft, leaving its
assets untouched.

Release notes live in `.github/release-notes/<tag>.md`. When that file exists the workflow
uses it as the release body, otherwise it falls back to the generated list of pull
requests. Fixing the text of a release that is already out is a matter of editing the file
and running the workflow again; the assets are left alone.

Either way the workflow refuses to go on when the tag disagrees with the version the
manifest declares. To build the bundle locally:

```bash
npm ci
npm run pack        # build + manifest check + validation + mcpb pack
```

After changing, adding or removing a tool, regenerate the list the manifest declares:

```bash
npm run sync:manifest
```

`npm run check:manifest` fails CI when the manifest and the code disagree: the MCP
directory reads both the manifest and the `tools/list` response, and a mismatch between
them otherwise surfaces only at review time.

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

## ⚠️ Known Limitations

### Garmin OAuth API Limitations

Some endpoints and features are not available through Garmin's public OAuth API:

#### Activity Comments
- ✅ **Reading comments** (`get_activity_comments`): Working
- ❌ **Writing comments** (`add_activity_comment`): **NOT SUPPORTED** by OAuth API
  - Comments can only be added through:
    - [Garmin Connect](https://connect.garmin.com) web interface
    - Garmin Connect mobile app
    - NOT available via OAuth API

#### Activity Privacy
- ✅ **Setting privacy** (`set_activity_privacy`): Working
  - ✅ `public`: Works correctly
  - ✅ `private`: Works correctly
  - ✅ `subscribers`: Works correctly (shown as "connections only" in Garmin Connect)
  - ❌ `followers`: **NOT SUPPORTED** - not a valid key, returns 400. The correct key is `subscribers`

  The current level is in `accessControlRuleDTO` from `get_activity_details`: read it before changing it, so `subscribers` is not overwritten with `public`.

#### Gear Management
- ✅ **List gear** (`get_all_gear`): Working (via `filterGear` endpoint)
- ✅ **Update/delete gear** (`update_gear`, `delete_gear`): Working
- ❌ **Create gear** (`create_gear`): **REMOVED** - OAuth API returns 403 Forbidden
  - Gear can only be created through:
    - [Garmin Connect](https://connect.garmin.com/modern/gear) web interface
    - Garmin Connect mobile app
- ✅ **Gear collections** (full CRUD): Working

#### Advanced Metrics (Device-Dependent)

Some metrics may not be available depending on your smartwatch model:

| Metric | Supported Devices | Notes |
|--------|-------------------|-------|
| `get_endurance_score` | Premium devices only (Fenix 7+, Forerunner 955+) | Not available on Instinct 2 Solar |
| `get_training_readiness` | Requires overnight HRV recording | Absent when the device does not record HRV |
| `get_floors` | Requires barometer | Absent on devices without a barometric altimeter |
| `get_intensity_minutes` | All devices | — |
| `get_training_load` | Requires 7+ days of data | Snapshot at the requested date, not an aggregate over the range |
| `get_load_ratio` | Requires 4+ consecutive weeks | Calculated on extended history |
| `get_performance_condition` | During activity | Garmin does not expose it as a daily metric: use `get_activity_details` |

**Note**: Some metrics are visible in the Garmin Connect app but may not be exposed via OAuth API.

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

## Privacy Policy

This project respects your privacy. For complete information on how your data is handled, please see our [Privacy Policy](https://github.com/sedoglia/garmin-mcp-ts/blob/main/PRIVACY.md).

### Summary

- **Data collected**: Garmin credentials (email and password) and OAuth tokens
- **Storage**: All data is encrypted locally with AES-256-GCM and stored in the native OS vault
- **Transmission**: Data is only transmitted to Garmin Connect servers for authentication and data retrieval
- **No third-party servers**: We do not collect, store, or transmit your data to any third-party servers
- **Local control**: All data remains on your device under your control

## Disclaimer

This project is not affiliated with, endorsed by, or connected to Garmin Ltd. or any of its subsidiaries. Garmin and Garmin Connect are trademarks of Garmin Ltd.

---

<div align="center">

### Support Development

If you find this project useful, please consider supporting it with a donation!

[![PayPal](https://img.shields.io/badge/Donate%20with-PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/sedoglia)

**English** | **[Italiano](README.md)** | [Report Issues](https://github.com/sedoglia/garmin-mcp-ts/issues)

</div>
