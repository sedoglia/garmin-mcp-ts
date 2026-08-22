# Changelog

**English** | **[Italiano](CHANGELOG.md)**

Every notable change to **Garmin Connect MCP Server**, newest version first. The project
follows [semantic versioning](https://semver.org/).

> Entries from 4.2.0 onwards are the ones that used to sit at the top of the READMEs.
> Earlier entries are reconstructed from commit messages, release tags and historical
> versions of the READMEs.

## [4.5.6] - 2026-08-23 — Stress hour by hour

### 🔧 `get_all_day_stress` — from raw payload to hourly profile
- The tool returned the `dailyStress` response verbatim: the ~480 stress samples **plus**
  the ~480 Body Battery ones that ride along in the same payload. Around 28,000 tokens, past
  the cap for a single result: like the four tools fixed in 4.5.0, it could not answer at
  all. It was also a duplicate of `get_stress_data`, which reads the same address.
- The samples are now aggregated per **local hour**: average, maximum and band for each
  hour, plus the totals for the day. The response drops from ~28,000 to ~450 tokens. The two
  tools now answer different questions: `get_stress_data` how much stress there was over the
  day, `get_all_day_stress` when it rose.
- **Local hours, not GMT**: sample timestamps are GMT, so bucketing them as they come would
  report a day shifted by the account's offset. The offset is derived from the two
  timestamps the payload already carries, one local and one GMT.
- **Gaps stay gaps**: the `-1` and `-2` values mark stretches the watch could not measure.
  They are kept out of the average, and an hour containing them also reports `sampleSlots`,
  so an hour spent off the wrist reads as missing data rather than as calm.
- **The daily average and maximum are Garmin's own**, the figures the app shows. They are
  computed on finer data than the three-minute samples, so the daily maximum can exceed
  every hourly one.

### 🔧 `get_stress_data` — average and maximum aligned with the app
- Both were re-derived from the three-minute samples, while Garmin computes them on finer
  data: the maximum came out a few points below what Connect shows (85 against 89 on the
  day used for testing). Where the service sends them, its figures now win; the samples stay
  as the fallback for days when it does not.
- The minimum is still sample-derived, because the service sends no daily minimum, and so
  are the seconds per band.
- Without this alignment the two stress tools would have reported two different maxima for
  the same day.

### 📚 Documentation
- **The version history moved out of the READMEs** into `CHANGELOG.md` and
  `CHANGELOG_EN.md`. The top of both files held 272 lines of release notes: finding out what
  the server does meant scrolling past fourteen versions to reach the tool list. The
  changelogs carry all 25 published versions from 1.0.0 on, including the ones that had been
  deleted from the READMEs, reconstructed from tags and commits.
- **Tools are grouped by subject rather than by release**: activities, health, training,
  gear, badges, profile. Gear used to be split across four sections and health across five,
  and a heading like "Nuovi Strumenti v2.0" says nothing about what a tool does. The 26 that
  write to the account are now marked.
- **Corrections found by checking the text against the code**: `request_reload` was
  documented nowhere (109 tools, 108 described); `get_health_metrics` promised VO2 max,
  which it does not return; the bundle install asked users to install `keytar` by hand,
  unnecessary since 4.3.2 and without effect on the installed extension anyway; `npm test`
  was described as exhaustive while it exercises 90 of 109 tools; the architecture tree
  listed a file that does not exist and omitted six that do.

## [4.5.5] - 2026-08-22 — Body composition on a weigh-in

- **`add_weigh_in`** accepts body fat, water, muscle and bone percentages, but Garmin keeps
  **only body fat** on a manually entered weigh-in — the other three are discarded silently.
  Verified by writing them and reading the record back, including under alternative field
  names: only `bodyFat` ever survives.
- The parameters stay, since a smart scale upload does carry those values. But a parameter
  that is accepted and dropped reads as a working feature, so the description now says which
  fields are actually stored.

## [4.5.4] - 2026-08-22 — READMEs brought up to date

- The READMEs had stopped at v4.4.0, and their tool tables described tools that had since
  gained parameters. The compiled server is the v4.5.3 one apart from the constant holding
  the version reported in the handshake.
- Two entries were wrong rather than merely stale: `update_gear` was listed as working
  (it was not, until v4.5.3), and gear creation was blamed on a 403 from the API when the
  endpoint is in fact reachable and an undocumented payload is what blocks it.

## [4.5.3] - 2026-08-22 — Editing gear

- **`update_gear`** could not change anything. It built the PUT payload from
  `getGearStats`, which answers with distance covered and an activity count and none of
  the fields the service wants back, so every call died on a `NullPointerException`. It
  now reads the gear from the same address it writes to.
- **Parameters mapped onto the stored fields**: the distance cap is `maximumMeters` (the
  tool sent `maximumMeter`), and there is no free model field at all. `gearMakeName` and
  `gearModelName` are a paired vocabulary Garmin validates, so `brandName` and
  `modelName` are written to `customMakeModel`, the single free-text label the app shows:
  `brandName: "Nike"` with `modelName: "Pegasus 41"` reads back as **Nike Pegasus 41**.
- `link_gear_to_activity`, `remove_gear_from_activity` and `delete_gear` were exercised
  against real gear in the same pass and needed no changes.

## [4.5.2] - 2026-08-22 — The profile identifier

- **`get_user_profile`** returned only `id`, an internal identifier no other Garmin
  endpoint accepts, and omitted `profileId` — the value the rest of your data is keyed by.
  It is the `ownerId` on every activity and the `userProfilePK` on the wellness records.
  Asking this tool for the account id gave back the one number that matches nothing. Both
  are returned now.

## [4.5.1] - 2026-08-22 — Three writing tools repaired

Found by exercising the tools that write to the account, not only the ones that read.

- **`delete_weigh_in`** deleted nothing. It used `/weight-service/user-weight/{id}`,
  which answers 404 for every id; the service deletes by date and version instead. The date
  is derived from the weigh-in id, and `date` can be passed explicitly for a weigh-in
  logged for a day other than the one it was entered on.
- **`delete_blood_pressure`** was unusable. It needs a reading's `version`, and the only
  tool that could supply it — `get_blood_pressure` — called the endpoint without
  `includeAll`, so the measurements list always came back empty. You could see a reading
  (`numOfMeasurements: 1`) and not delete it.
- **`create_workout`** had six of its eight sport types wrong. The service identifies a
  sport by id and ignores the key sent beside it, so workouts were quietly filed under a
  different sport — **swimming and strength were each other's**, `walking` produced HIIT,
  `cardio` produced "other", and `hiking` and `yoga` used ids that are not workout sports.
  An unrecognised sport used to fall back to **running without saying so**; it is now refused
  by name. The types the service genuinely offers are reachable too: `pilates`, `hiit`,
  `mobility`, `rucking`, `other`. The workout taxonomy has no `hiking` — use `walking`
  or `rucking`.
- **`get_stress_data`** read its banded durations from fields the `dailyStress` endpoint
  does not send, so they were always absent. They are now derived from the samples.

## [4.5.0] - 2026-08-22 — Four tools that could not answer

- **Responses over the limit**: `get_available_badges` (~85,000 tokens), `get_sleep_data`
  (~44,000), `get_earned_badges` (~41,000) and `get_stress_data` (~28,000) handed back the
  raw Garmin payload, exceeding the token limit on a single tool result — so the answer never
  reached the model at all. They were not slow, they were **unusable**.
- **Summary by default, detail on request**: following the pattern `get_floors` already
  used, they now return a summary and keep the full payload behind an explicit flag —
  `includeTimeSeries`, `includeValues`, `includeDetails`. `get_sleep_data` drops from
  ~44,000 to ~1,400 tokens and reports how many points it left out of each series, since
  every one of them has its own tool.
- **Compact serialization**: results were pretty-printed with two-space indentation.
  Indentation is for people reading files, not for a model: removing it cut about **58% from
  every response across all 109 tools**.

## [4.4.0] - 2026-08-22 — Leaner responses and Node 22

- **`get_floors`**: returns the daily totals only; the 15-minute breakdown is available
  with `includeBreakdown: true`. The normal response drops from ~5600 to ~210 characters.
- **Node 22 required**: the manifest asked for Node 18, which stopped receiving security
  patches on 30 April 2025 (Node 20 on 30 April 2026). If you are on Node 18 or 20 you
  need to update, or Claude Desktop will treat the extension as incompatible. No server
  code changed for this - it only uses long-standing APIs.
- **Security**: every open advisory in the dependency tree is closed (`hono`,
  `fast-uri`, `ip-address`, `tmp`). `npm audit` reports nothing.

## [4.3.3] - 2026-08-18 — Icon

- The bundle icon was the official Garmin Connect app artwork. It has been replaced with
  an original drawing: no third-party logo or trademark, so the extension does not
  present itself as a Garmin product.
- The area around the rounded square is transparent rather than white — an opaque PNG
  would show a white box around the icon on a dark theme.

## [4.3.2] - 2026-08-18 — The OS vault on every platform

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

## [4.3.1] - 2026-08-18 — MCP Directory requirements

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

## [4.3.0] - 2026-07-28 — Correctness of the data tools return

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

## [4.2.0] - 2026-07-28 — First install and credentials

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

## [4.1.1] - 2026-07-24 — Maintenance and security

Maintenance-only release: no `src/` changes, so the 106 tools and their behaviour are
identical to 4.1.0.

- **Dependency security**: closed, over several rounds, the Dependabot advisories open in
  the tree (`hono`, `express-rate-limit`, `qs`, `lodash`, `@modelcontextprotocol/sdk` and
  others), partly through direct upgrades and partly through `overrides` pinning minimum
  versions.
- **Toolchain**: TypeScript 5.9 → 7.0, `dotenv` 16 → 17, `tsx` to ^4.23.1 (to pull esbuild
  0.28.1); module resolution switched to `nodenext`; dropped the unused `pino` dependency;
  `@types/node` and CI aligned with Node 24.
- **CI**: actions bumped (`checkout@v7`, `setup-node@v7`, `fetch-metadata@v3`),
  auto-merge of Dependabot security patches behind a build gate, and installs no longer
  omit optional dependencies.
- **Bundle**: Claude Code local settings are no longer tracked or packed.
- **Documentation**: fixed the bundle download instructions, which pointed at
  `diabetes-m-mcp.mcpb` — a filename copied from an unrelated project that has never
  existed in these releases, so the documented install path 404'd.

## [4.1.0] - 2026-03-01 — Gear Management & Collections

### 🔧 **GEAR MANAGEMENT** ✅ IMPROVED
- **`get_all_gear`**: ✅ **NOW WORKING** - Automatic listing of all equipment (no more manual UUID needed!)
- ~~**`create_gear`**~~: ❌ **REMOVED** (Garmin OAuth API returns 403 Forbidden for gear creation)
  <br>*Note added in 4.5.4: the 403 diagnosis was wrong. The creation endpoint is
  reachable; what blocks it is an undocumented payload.*
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

## [4.0.0] - 2026-01-06 — Social & Advanced Analytics

> The READMEs labelled this section "What's New in v4.1.0" by mistake: the tools listed
> here shipped in 4.0.0.

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

### 📋 **MCP DIRECTORY COMPLIANCE**
Work done after 3.2.0 and shipped in this version.
- Added `LICENSE` (MIT) and `PRIVACY.md`, with a dedicated section in both READMEs;
  `manifest.json` moved to version 0.3 with `privacy_policies`, icon and repository.
- Privacy policy brought in line with GDPR: data controller, legal basis for processing,
  data retention, data subject rights, children's privacy (COPPA), international
  transfers, breach notification.
- MCP annotations on every tool: a human-readable `title`, `readOnlyHint` for read-only
  tools and `destructiveHint` for the ones that write. The server would nonetheless keep
  omitting them from `tools/list` until 4.3.1.

### 📈 **94 TOOLS** (92 working + 2 limited by the API)

## [3.2.0] - 2025-12-20 — Bug fixes and cleanup

### 🔧 **FIXES**
- **`unschedule_workout`**: new tool to remove a workout from the calendar. Without it,
  deleting alone left ghost entries behind.
- **`delete_blood_pressure`**: implemented the working endpoint and documented the tool.
- **`add_weigh_in`**: fixed both the endpoint URL and the payload format.
- **`create_manual_activity`**: `startTime` normalised and sent in local time.
- **Deletions**: the delete methods now use the correct `garmin-connect` library calls.
- **`get_fitness_age`**: endpoint corrected to `fitnessage-service`.
- **Gear**: removed the gear tools that could not work through the OAuth API (71 tools
  down to 68), back up to 69 with `unschedule_workout`.
- `update_activity_exercise_sets` was added for strength training and then removed within
  the same release window.

### 🧹 **CLEANUP**
- Removed unused files and scripts (`test-all-tools.ts`, `test-gear.ts`), stopped tracking
  the `releases` folder in Git, and the test script now unschedules before deleting.

### 📈 **69 TOOLS**

## [3.1.0] - 2025-12-17 — At-rest encryption and the first bundle

### 🔐 **ENCRYPTION**
- Encryption key held in the native OS vault (Windows Credential Manager, macOS Keychain,
  Linux Secret Service) through keytar.
- Credentials and OAuth tokens always encrypted with **AES-256-GCM**: encrypted data lives
  in `%LOCALAPPDATA%\garmin-mcp\`, tokens in `garmin-tokens.enc`.
- Fallback to a protected file when the vault is unavailable, with automatic migration of
  the key from file to vault. The method performing that migration would however never be
  called until 4.3.2.
- Helper scripts: `npm run setup-encryption`, `npm run check-encryption`,
  `npm run test-keytar`.
- Cross-platform: Windows, macOS and Linux.

### 📦 **PREBUILT BUNDLE**
- First publication of the `.mcpb` bundle for quick installation in Claude Desktop
  (tag `v3.1.0-bundle`).

## [3.0.1] - 2025-12-13 — OAuth tokens on disk

- OAuth tokens are now saved automatically in the project root (`oauth1_token.json`,
  `oauth2_token.json`), excluded from Git.
- Removed the `tokenDir` parameter from `initialize()`.

## [3.0.0] - 2025-12-13 — Full expansion from the Garmin Connect API

**Total: 71 tools.**

- **User and activities**: `get_user_summary`, `get_steps_data`, `get_daily_steps`,
  `get_activities_by_date`, `get_activity_typed_splits`
- **Health**: `get_rhr_day`, `get_hill_score`, `get_all_day_events`,
  `get_body_battery_events`
- **Badges and challenges**: `get_available_badges`, `get_in_progress_badges`,
  `get_available_badge_challenges`, `get_non_completed_badge_challenges`,
  `get_in_progress_virtual_challenges`
- **Gear**: `get_gear_activities`, `remove_gear_from_activity`
- **Training**: `get_training_plans`, `get_training_plan_by_id`
- **Women's health**: `get_menstrual_data`, `get_pregnancy_summary`
- **Utility**: `get_activity_types`, `get_primary_training_device`, `count_activities`,
  `get_fitness_stats`, `add_hydration_data`
- **OAuth token persistence**: save and reload tokens to reuse the session.
- Fixes: the badge challenge `start` parameter must be ≥ 1; the daily steps range cannot
  exceed 28 days.

## [2.0.3] - 2025-12-13 — create_workout: InvalidTypeIdException

- Workout creation failed because the payload carried extra fields (`poolLength: 0`,
  `estimated`, …) the service rejects. It now sends only the required ones:
  `workoutName`, `description`, `sportType`, `workoutSegments`.

## [2.0.2] - 2025-12-13 — Correct workout format

- **`create_workout`**: switched to the format the Garmin API expects —
  `ExecutableStepDTO` per step, `stepType`, `endCondition` and `targetType` objects, and
  all the required null fields.
- **`delete_workout`**: uses the library's `deleteWorkout` method.
- Full lifecycle verified: create → update → schedule → delete.

## [2.0.1] - 2025-12-13 — Endpoint fixes and a test suite

- Fixed **`get_device_last_used`** (uses `getUserSettings`), **`get_activity_gear`**
  (extracted from the activity details), **`get_progress_summary`** (computed from the
  activities) and **`get_daily_summary`** (library methods).
- Explicit fallback instead of an error for `get_personal_records`, `get_gear`,
  `get_gear_defaults` and for `create_workout` failures.
- Added the `npm test` suite, which exercises all 55 tools.
- Italian and English READMEs updated with full 2.0 documentation.

## [2.0.0] - 2025-12-13 — 37 new tools: workouts and activity management

**Total: 55 tools.**

- **Workout management**: `create_workout` (warmup, intervals, cooldown),
  `get_workout_by_id`, `download_workout` (FIT), `update_workout`, `delete_workout`,
  `schedule_workout`
- **Activity management**: `upload_activity` (FIT/GPX/TCX), `create_manual_activity`,
  `set_activity_name`, `set_activity_type`, `delete_activity`, `download_activity`
  (FIT/TCX/GPX/KML/CSV)
- **Devices**: `get_device_last_used`, `get_device_settings`
- **Advanced health**: `get_all_day_stress`, `get_floors`, `get_intensity_minutes`,
  `get_max_metrics` (VO2 max), `get_training_readiness`, `get_endurance_score`,
  `get_fitness_age`
- **Weight and body**: `get_weigh_ins`, `add_weigh_in`, `delete_weigh_in`,
  `get_blood_pressure`, `set_blood_pressure`
- **Activity details**: `get_activity_weather`, `get_activity_hr_zones`,
  `get_activity_gear`, `get_activity_exercise_sets`
- **Goals and records**: `get_goals`, `get_adhoc_challenges`, `get_badge_challenges`,
  `get_earned_badges`, `get_personal_records`, `get_race_predictions`
- **Gear**: `get_gear`, `get_gear_defaults`, `get_gear_stats`, `link_gear_to_activity`
- **Reports and progress**: `get_progress_summary`, `get_daily_summary`

## [1.2.0] - 2025-12-12 — Stress, Body Battery and wellness

**5 new tools, 18 in total.**

- `get_stress_data` (0-100 scale), `get_body_battery` (0-100), `get_hrv_data`,
  `get_respiration_data`, `get_spo2_data`
- Direct requests to Garmin's `wellness-service` endpoints on `connectapi.garmin.com`,
  with computed statistics (average, max, min) for stress and Body Battery.
- Test suite extended to 49 tests.

## [1.0.0] - 2025-12-12 — First release

**13 tools.**

- `list_recent_activities`, `get_activity_details`, `get_activity_splits`, `get_workouts`,
  `get_health_metrics`, `get_sleep_data`, `get_body_composition`, `get_steps`,
  `get_heart_rate`, `get_hydration`, `get_devices`, `get_user_profile`,
  `get_training_status`
- Fully TypeScript implementation, argument validation through JSON Schema (Zod-free), a
  37-test suite, and bilingual documentation (Italian and English).

> There was never a 1.1.0: the project went straight from 1.0.0 to 1.2.0.
