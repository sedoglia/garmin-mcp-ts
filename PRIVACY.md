# Privacy Policy

**Last Updated:** December 2024

## Overview

Garmin Connect MCP Server ("this project", "the software") is a local MCP server that connects Claude Desktop to your Garmin Connect account. This privacy policy explains how your data is handled.

## Data Collection

### What We Collect

This software collects and stores the following data **locally on your device**:

1. **Garmin Credentials**: Your Garmin Connect email and password
2. **OAuth Tokens**: Authentication tokens for Garmin Connect API access
3. **Cached Data**: Temporary cache of Garmin Connect API responses

### What We Do NOT Collect

- We do not collect analytics or telemetry data
- We do not track your usage of the software
- We do not collect any personal information beyond what is needed for Garmin Connect authentication

## Data Storage

### Local Encryption

All sensitive data is encrypted using **AES-256-GCM** encryption:

| Operating System | Encryption Key Storage | Encrypted Data Location |
|------------------|------------------------|-------------------------|
| **Windows** | Windows Credential Manager | `%LOCALAPPDATA%\garmin-mcp\` |
| **macOS** | Keychain | `~/Library/Application Support/garmin-mcp/` |
| **Linux** | Secret Service (D-Bus/GNOME) | `~/.config/garmin-mcp/` |

### Security Measures

- Encryption keys are stored in your operating system's secure credential vault
- All credentials and tokens are encrypted at rest
- No data is stored in plaintext
- File permissions are restricted to the current user only

## Data Transmission

### Communication with Garmin

Your data is transmitted **only** to Garmin Connect servers (`connect.garmin.com`) for:

- Authentication (login)
- Retrieving your fitness data, activities, health metrics, etc.
- Modifying data when you explicitly request it (e.g., creating workouts)

### No Third-Party Servers

- **We do not operate any servers**
- **We do not transmit your data anywhere except Garmin Connect**
- **We do not share your data with any third parties**

## Data Control

### Your Rights

You have full control over your data:

1. **View**: You can inspect what data is stored using `npm run check-encryption`
2. **Delete**: Remove all stored data by deleting the data directory:
   - Windows: `%LOCALAPPDATA%\garmin-mcp\`
   - macOS: `~/Library/Application Support/garmin-mcp/`
   - Linux: `~/.config/garmin-mcp/`
3. **Revoke Access**: Log out of Garmin Connect and delete stored tokens

### Data Portability

All your data remains on your device. You can back up or transfer your encrypted credentials by copying the data directory to another device (note: encryption keys in the OS vault must also be transferred).

## Open Source

This project is **open source** under the MIT License. You can:

- Review the source code at https://github.com/sedoglia/garmin-mcp-ts
- Verify how your data is handled
- Audit the encryption implementation

## Changes to This Policy

We may update this privacy policy from time to time. Changes will be documented in the repository and reflected in the "Last Updated" date above.

## Contact

For privacy-related questions or concerns, please:

- Open an issue at https://github.com/sedoglia/garmin-mcp-ts/issues
- Contact: sedoglia@gmail.com

---

**Summary**: This software operates entirely on your local device. Your credentials are encrypted and stored locally. Data is only transmitted to Garmin Connect servers. We do not collect, store, or transmit any data to third-party servers.
