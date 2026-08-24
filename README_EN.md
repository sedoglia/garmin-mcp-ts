# Garmin Connect MCP Server

<div align="center">

**English** | **[Italiano](README.md)**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-green.svg)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-purple.svg)](https://modelcontextprotocol.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-4.5.8-green.svg)](https://github.com/sedoglia/garmin-mcp-ts/releases/latest)

[![PayPal](https://img.shields.io/badge/Support%20This%20Project-PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/sedoglia)

</div>

---

A Model Context Protocol (MCP) server that connects Claude Desktop to Garmin Connect, enabling natural language queries about your fitness activities, health metrics, sleep data, and more.

> 📦 **Latest release: [v4.5.8](https://github.com/sedoglia/garmin-mcp-ts/releases/latest)**
> — the `.mcpb` bundle ready to install, with the release notes and the `.sha256` file to
> verify it.
>
> 📜 **Version history**: every detailed change of every release — new tools, fixes,
> upgrade notes — lives in the **[CHANGELOG](CHANGELOG_EN.md)**.

---

## Tools

The server exposes **110 tools**, grouped by subject. The **26** marked ✏️ write to the Garmin account; every other one only reads.

### 🏃 Activities

**Listing and search**

| Tool | Description |
|------|-------------|
| `list_recent_activities` | The most recent activities, summarised: name, type, date, distance, duration, speed, HR, calories, elevation, steps and training effect. `includeDetails` returns the full payload |
| `get_activities_by_date` | Activities in a date range, filterable by type and sortable, summarised the same way. Lists at most `limit` of them (100 by default, 200 the ceiling) and says when the range holds more |
| `count_activities` | Counts activities, over the whole history or over a date range |
| `get_activity_types` | The list of activity types Garmin Connect recognises |

**Detail of a single activity**

| Tool | Description |
|------|-------------|
| `get_activity_details` | The full detail of one activity: summary metrics, zones, GPS data |
| `get_activity_splits` | Splits and laps with pace, distance and time for each |
| `get_activity_typed_splits` | Typed splits, more detailed than the regular ones (bouldering, strength, multisport) |
| `get_activity_hr_zones` | Time spent in each heart rate zone |
| `get_activity_exercise_sets` | The exercise sets recorded in a strength training activity |
| `get_activity_weather` | Weather conditions during the activity |
| `get_activity_comments` | Comments left on an activity (read only: writing them is not possible through the API, see Known limitations) |

**Creating and editing**

| Tool | Description |
|------|-------------|
| `create_manual_activity` ✏️ | Enters an activity by hand: name, type, start, duration; distance and calories optional |
| `upload_activity` ✏️ | Uploads an activity file in FIT, GPX or TCX format |
| `download_activity` | Downloads an activity as FIT, TCX, GPX, KML or CSV |
| `set_activity_name` ✏️ | Renames an activity |
| `set_activity_type` ✏️ | Changes the type of an activity |
| `set_activity_privacy` ✏️ | Sets privacy to `public`, `private` or `subscribers` ("connections only"). The current level is in `accessControlRuleDTO` from `get_activity_details` |
| `delete_activity` ✏️ | Deletes an activity. This cannot be undone |

**Comparisons and period analysis**

| Tool | Description |
|------|-------------|
| `compare_activities` | Compares 2 to 5 activities: distance, duration, speed, HR, calories, elevation, steps, training effect |
| `find_similar_activities` | Finds activities similar in type, distance and duration (20% tolerance), closest first; `searchDepth` widens the history searched |
| `analyze_training_period` | Analysis of training trends, volume and patterns over a date range |
| `get_progress_summary` | Aggregates progress between two dates over `distance`, `duration` or `calories` |
| `get_fitness_stats` | Aggregated statistics between two dates over `distance`, `duration`, `elevationGain` or `movingDuration`, grouped by activity type |

### ❤️ Health and wellness

**Daily summaries**

| Tool | Description |
|------|-------------|
| `get_daily_summary` | Compact summary of the day: steps and goal, calories, distance, floors, intensity minutes, resting/min/max HR, stress, Body Battery |
| `get_user_summary` | User summary for a date: steps, calories, distance, active minutes |
| `get_health_metrics` | Heart rate and step count for a day in a single response |

**Steps, floors and intensity minutes**

| Tool | Description |
|------|-------------|
| `get_steps` | The total step count for a date |
| `get_steps_data` | The detailed step series for the day, with timestamps |
| `get_daily_steps` | Daily step counts over a range: beyond 28 days the request is chunked automatically |
| `get_floors` | Floors climbed and descended; with `includeBreakdown` also the 96 quarter-hour intervals |
| `get_intensity_minutes` | Moderate and vigorous intensity minutes, for a date or a range, with the weekly total and goal |

**Heart and breathing**

| Tool | Description |
|------|-------------|
| `get_heart_rate` | Heart rate for the day: resting, maximum and the value series |
| `get_rhr_day` | Resting heart rate for a single day |
| `get_hrv_data` | Heart rate variability (HRV), a recovery indicator |
| `get_respiration_data` | Respiration rate through the day and during sleep |
| `get_spo2_data` | Blood oxygen saturation (SpO2) |

**Stress and energy**

| Tool | Description |
|------|-------------|
| `get_stress_data` | Stress for the day on the 0-100 scale: average, max, min and seconds per band; with `includeValues` also the individual three-minute samples |
| `get_all_day_stress` | Stress hour by hour: average, maximum and band for each hour, plus the totals for the day. It answers *when* stress rose, where `get_stress_data` answers *how much* there was |
| `get_body_battery` | Body Battery (0-100) over a date range, with charged and drained periods |
| `get_body_battery_events` | The events that affected Body Battery on a date: sleep, activities, naps |
| `get_all_day_events` | All events of the day, including auto-detected activities |

**Sleep**

| Tool | Description |
|------|-------------|
| `get_sleep_data` | The night: duration, stages, score and summary. The per-minute series are counted rather than included; `includeTimeSeries` inlines them |
| `get_sleep_movement` | Movement during sleep and restless moments |

**Hydration**

| Tool | Description |
|------|-------------|
| `get_hydration` | Hydration recorded on a date |
| `add_hydration_data` ✏️ | Adds millilitres to the day's hydration; a negative value subtracts them |

**Weight and body composition**

| Tool | Description |
|------|-------------|
| `get_body_composition` | Weight, BMI, body fat, muscle and bone mass over `days` days, plus the average for the period |
| `get_weigh_ins` | Weigh-ins recorded in a date range |
| `add_weigh_in` ✏️ | Records a weigh-in. Weight and body fat are stored; water, muscle and bone are accepted but Garmin discards them on a manual entry |
| `delete_weigh_in` ✏️ | Deletes one weigh-in by its id (`samplePk`). `date` is only needed when the weigh-in was back-dated to a day other than the one it was entered on |

**Blood pressure**

| Tool | Description |
|------|-------------|
| `get_blood_pressure` | Blood pressure readings in a date range, including the `version` needed to delete one |
| `set_blood_pressure` ✏️ | Records a reading: systolic, diastolic, pulse, date and time |
| `delete_blood_pressure` ✏️ | Deletes a reading: needs the date and the `version` returned by `get_blood_pressure` |

**Women's health**

| Tool | Description |
|------|-------------|
| `get_menstrual_data` | Menstrual cycle data for a date |
| `get_pregnancy_summary` | The pregnancy tracking summary |

### 📈 Training and performance

**Fitness state**

| Tool | Description |
|------|-------------|
| `get_training_status` | Training status for a date: status and feedback phrase, VO2 max, fitness trend, acute and chronic load, ACWR ratio |
| `get_training_readiness` | The training readiness score |
| `get_endurance_score` | The endurance score based on recent training load |
| `get_fitness_age` | Fitness age estimated from VO2 max and other metrics |
| `get_max_metrics` | Peak metrics, VO2 max included |
| `get_hill_score` | The hill score — climbing performance — over a date range |
| `get_performance_condition` | Performance condition for a date. Garmin records it per activity, so it usually has to be read from `get_activity_details` |
| `get_race_predictions` | Predicted race times for 5K, 10K, half marathon and marathon |

**Training load**

| Tool | Description |
|------|-------------|
| `get_training_load` | The monthly training load balance (low aerobic, high aerobic, anaerobic) against its targets. It is a snapshot at the end date, not an aggregate over the range |
| `get_load_ratio` | The acute to chronic workload ratio, an injury risk indicator |

**Workouts**

| Tool | Description |
|------|-------------|
| `get_workouts` | The list of saved workouts |
| `get_workout_by_id` | The detail of a single workout |
| `create_workout` ✏️ | Creates a structured workout with warmup, intervals and cooldown. Valid sports: `running`, `cycling`, `walking`, `swimming`, `strength`, `cardio`, `yoga`, `pilates`, `hiit`, `mobility`, `rucking`, `other` (there is no `hiking`: use `walking` or `rucking`) |
| `update_workout` ✏️ | Changes the name, description or structure of a workout |
| `schedule_workout` ✏️ | Puts a workout on the calendar for a date; returns the id needed to remove it |
| `unschedule_workout` ✏️ | Takes a workout off the calendar, freeing the date without deleting the workout |
| `get_scheduled_workouts` | The workouts on the calendar in a date range, with the id needed to remove them |
| `delete_workout` ✏️ | Deletes a workout, after taking it off the calendar if it was scheduled |
| `download_workout` | Downloads a workout in FIT format for syncing to the device |

**Plans and courses**

| Tool | Description |
|------|-------------|
| `get_training_plans` | The available training plans |
| `get_training_plan_by_id` | The detail of one training plan |
| `get_courses` | The routes saved on the account |

### 👟 Gear

**Equipment**

| Tool | Description |
|------|-------------|
| `get_all_gear` | All gear with its UUIDs, which every other gear tool needs |
| `get_gear_stats` | Usage statistics for one piece of gear |
| `get_gear_activities` | The activities a piece of gear was used in |
| `update_gear` ✏️ | Updates name, brand, model and distance limit. `brandName` and `modelName` land in the same free-text label, because catalogue brand and model are a vocabulary Garmin validates |
| `delete_gear` ✏️ | Deletes a piece of gear. This cannot be undone |
| `link_gear_to_activity` ✏️ | Links a piece of gear to an activity |
| `remove_gear_from_activity` ✏️ | Unlinks a piece of gear from an activity |

**Garmin catalogues**

| Tool | Description |
|------|-------------|
| `get_gear_types` | The gear types Garmin defines (shoes, bike, golf clubs, other) |
| `get_gear_makes` | The brands Garmin recognises, with the key used in the catalogue |

**Collections**

| Tool | Description |
|------|-------------|
| `get_gear_collections` | Collections, the groups of gear used together |
| `get_gear_collection` | The detail of one collection: the gear in it and the activity types attached |
| `create_gear_collection` ✏️ | Creates a collection: name and first use date are required |
| `update_gear_collection` ✏️ | Updates a collection's name, gear and activity types (the lists are replaced, not merged) |
| `delete_gear_collection` ✏️ | Deletes a collection. The gear inside it is not deleted |

### 🏅 Goals, badges and challenges

**Goals and records**

| Tool | Description |
|------|-------------|
| `get_goals` | The goals set; without `status` all three states are queried and merged |
| `get_personal_records` | Personal records: category, value, date and, where there is one, the activity that set it |

**Badges**

| Tool | Description |
|------|-------------|
| `get_earned_badges` | Badges earned, with the date; `includeDetails` returns the full record |
| `get_available_badges` | Badges available to earn with category, difficulty, points and progress; `includeDetails` for the full record |
| `get_in_progress_badges` | Badges started but not yet completed |

**Challenges**

| Tool | Description |
|------|-------------|
| `get_badge_challenges` | Badge challenges available to join, unpaginated |
| `get_available_badge_challenges` | The same challenges as `get_badge_challenges` — it is the same endpoint — but paginated (`start`, `limit`) |
| `get_non_completed_badge_challenges` | Badge challenges not completed yet |
| `get_adhoc_challenges` | The history of ad-hoc challenges |
| `get_in_progress_virtual_challenges` | Virtual challenges currently in progress |

### ⚙️ Profile, devices and credentials

**Profile**

| Tool | Description |
|------|-------------|
| `get_user_profile` | The profile: display name and both account ids. `profileId` is the one the rest of the data is keyed by (the `ownerId` on an activity, the `userProfilePK` on wellness records); `id` is a separate internal identifier |
| `request_reload` ✏️ | Asks Garmin to reload the data for a date: useful for older days the service has offloaded |

**Devices**

| Tool | Description |
|------|-------------|
| `get_devices` | The Garmin devices registered on the account, with id, model, serial and firmware |
| `get_device_settings` | The settings of a single device |
| `get_device_last_used` | The device that uploaded data most recently |
| `get_device_alarms` | The alarms configured: time, repeat days and whether each is on. Without `deviceId` every device is reported |
| `get_primary_training_device` | The primary training device and the priority between devices |

**Credentials**

| Tool | Description |
|------|-------------|
| `setup_credentials` ✏️ | Stores email and password encrypted in the OS vault and verifies the login straight away |
| `check_credentials` | The state of the configuration: active source, storage in use, session. Never returns the password |
| `clear_credentials` ✏️ | Deletes the encrypted credentials and OAuth tokens and ends the session |

---

## Prerequisites

- **Node.js** 22.0 or higher
- **npm** 8.0 or higher
- **Claude Desktop** installed
- **Garmin Connect** account with valid credentials

## 🚀 Quick Installation (Precompiled Bundle)

### Steps:

> **The OS vault is already included.** Since v4.3.2 the bundle carries `keytar` binaries
> for every platform (`darwin-x64`, `darwin-arm64`, `win32-x64`, `win32-ia32`, `linux-x64`,
> `linux-arm64`), so there is nothing to install besides the extension itself. On
> architectures without a prebuilt binary, and on Linux sessions with no active keyring,
> the key goes to a protected file instead; `check_credentials` reports which of the two is
> in use.

### 1. Download the bundle

Use your browser or:

```bash
wget https://github.com/sedoglia/garmin-mcp-ts/releases/latest/download/garmin-mcp-ts.mcpb
```

### 2. Verify integrity

Verify the integrity (optional but recommended):

```bash
wget https://github.com/sedoglia/garmin-mcp-ts/releases/latest/download/garmin-mcp-ts.mcpb.sha256
sha256sum -c garmin-mcp-ts.mcpb.sha256
```

### 3. Install the extension in Claude Desktop (Recommended Method)

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

### 4. Configure Garmin Credentials

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

### 5. Restart Claude Desktop

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

`keytar` is an optional dependency: `npm install` builds it or fetches its prebuilt
binary, and the native OS vault is then used with no further steps. If that fails — common
on a machine without a build toolchain — the server falls back to a protected file and
keeps working; `npm run check-encryption` reports which of the two is in use.

### 3. Build the Project

```bash
npm run build
```

### 4. Configure Garmin Credentials (Secure Method - Recommended)

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

### 4b. Alternative Method (Legacy)

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

### Workout Management

> "Show me my planned workouts"

> "Download my latest workout"

### Training Readiness

> "What's my Training Readiness today?"

> "Show me my Endurance Score"

### Progress & Statistics

> "How many kilometers did I run this month?"

> "Show me my progress summary for the last month"

### Advanced Health Metrics

> "What was my resting heart rate today?"

> "Show me my all-day events for stress and body battery"

### Women's Health Tools

> "How does my menstrual cycle affect my training performance?"

> "Based on my cycle, what type of workout should I do?"

### Gear Management

> "Show me all my Garmin gear"

> "What types of equipment can I manage?"

> "Create a 'Running Shoes' collection and associate it with running activities"

> "Show me my gear collections"

### Comments and Privacy

> "Show me comments on my latest activity"

> "Set my last run as private"

### Advanced Training Metrics

> "How is my training load this month?"

> "What's my acute/chronic ratio? Am I at injury risk?"

### Activity Analysis

> "Compare my last 3 runs"

> "Find activities similar to my Sunday run"

> "Analyze my training for the last month"

## Testing

Run tests with real data:

```bash
npm test
```

The script exercises **91 of the 110 tools** against your Garmin account: every read-only
one, plus the full lifecycle of a workout (create → update → schedule → unschedule →
delete) and of a gear collection. Left out are the three credential tools and the tools
that write other data to the account — weigh-ins, blood pressure, hydration, manual
activities, uploads, gear edits — which have to be tried by hand on data you are willing
to lose.

## Architecture

```
garmin-mcp-ts/
├── src/
│   ├── index.ts           # Entry point, stdout/stderr handling
│   ├── garmin/
│   │   ├── client.ts      # Garmin Connect API client (~3700 lines)
│   │   ├── auth.ts        # Login, session and OAuth token refresh
│   │   └── simple-login.ts # Standalone login test utility
│   ├── mcp/
│   │   ├── server.ts      # MCP server setup and request handlers
│   │   ├── tools.ts       # Tool definitions and schemas (110 tools)
│   │   └── handlers.ts    # Tool implementation logic
│   ├── utils/
│   │   ├── constants.ts   # Application constants, tool names included
│   │   ├── credentials.ts # Credential resolution across extension, vault and .env
│   │   ├── errors.ts      # Custom error classes
│   │   ├── logger.ts      # Logging utility (stderr only)
│   │   ├── stdio-guard.ts # Stops other code writing to stdout and breaking the protocol
│   │   └── secure-storage.ts # Encrypted storage and OS vault access
│   ├── test-tools.ts      # Suite exercising the tools against a real account (npm test)
│   └── test-oauth.ts      # OAuth flow diagnostics
├── scripts/
│   ├── setup-encryption.ts  # Interactive credentials setup script
│   ├── check-encryption.ts  # Diagnostic script for encryption verification
│   ├── sync-manifest.ts     # Regenerates and checks manifest.json from the code
│   ├── fetch-keytar-prebuilds.mjs # Downloads the keytar binaries for every platform
│   └── test-keytar.ts       # Keytar integration test script
├── vendor/keytar/         # Per-platform keytar binaries, shipped in the bundle
├── dist/                  # Compiled JavaScript output
├── manifest.json          # MCPB bundle manifest (partly generated by sync-manifest)
├── PRIVACY.md             # Privacy policy referenced by the manifest
├── CHANGELOG.md           # Version history (CHANGELOG_EN.md in English)
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
manifest declares. The version is declared in five places, all of which have to be raised
together before tagging: `package.json`, `manifest.json`, `SERVER_VERSION` in
`src/utils/constants.ts` (the one the server announces in the MCP handshake) and, in both
READMEs, the badge and the release line near the top. The download links point at
`releases/latest` instead and never need touching.

To build the bundle locally:

```bash
npm ci
npm run pack        # build + manifest check + validation + pack
```

The bundle lands in the repository root as `garmin-mcp-ts.mcpb`, with its `.sha256`
beside it, and is the same one the release publishes. `mcpb pack` archives `node_modules`
as it finds it, so packing a development tree directly would carry TypeScript, tsx and
esbuild along with it: some fifteen megabytes no user ever loads. To keep them out,
`scripts/pack.mjs` copies the production dependencies alone — the same set the workflow
installs with `npm ci --omit=dev` — into a temporary directory and packs that.

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
- ✅ **Update/delete gear** (`update_gear`, `delete_gear`): Working (`update_gear` was broken until v4.5.3)
- ❌ **Create gear** (`create_gear`): **NOT AVAILABLE** - the endpoint exists but its payload is undocumented: it answers 500 without naming the field it rejects
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

The full history of the project, version by version, is in the [CHANGELOG](CHANGELOG_EN.md).

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
