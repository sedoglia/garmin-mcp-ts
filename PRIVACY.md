# Privacy Policy

**Last Updated:** December 2025

## Overview

Garmin Connect MCP Server ("this project", "the software") is a local MCP server that connects Claude Desktop to your Garmin Connect account. This privacy policy explains how your data is handled.

## Data Controller

This software is developed and maintained by:

- **Name**: sedoglia
- **Email**: sedoglia@gmail.com
- **Repository**: https://github.com/sedoglia/garmin-mcp-ts

As this is a local-only software with no central servers, you act as the data controller for your own data.

## Legal Basis for Processing

The legal basis for processing your data is:

- **Consent**: You explicitly provide your Garmin credentials to use this software
- **Legitimate Interest**: Processing is necessary to provide the functionality you requested (connecting to Garmin Connect)

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
- We do not collect IP addresses, device identifiers, or location data
- We do not use cookies or tracking technologies

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
- Industry-standard AES-256-GCM encryption with random IV for each operation

### Data Retention

- **Credentials**: Stored until you manually delete them
- **OAuth Tokens**: Stored until expiration or manual deletion
- **Cached Data**: Temporary, cleared on application restart

## Data Transmission

### Communication with Garmin

Your data is transmitted **only** to Garmin Connect servers (`connect.garmin.com`) for:

- Authentication (login)
- Retrieving your fitness data, activities, health metrics, etc.
- Modifying data when you explicitly request it (e.g., creating workouts)

All communication with Garmin Connect uses HTTPS (TLS encryption in transit).

### No Third-Party Servers

- **We do not operate any servers**
- **We do not transmit your data anywhere except Garmin Connect**
- **We do not share your data with any third parties**
- **We do not sell your data**

## Your Rights (GDPR Compliance)

Under GDPR and similar privacy regulations, you have the following rights:

### Right to Access
You can inspect what data is stored using `npm run check-encryption`

### Right to Rectification
You can update your credentials at any time by running `npm run setup-encryption`

### Right to Erasure ("Right to be Forgotten")
Remove all stored data by deleting the data directory:
- Windows: `%LOCALAPPDATA%\garmin-mcp\`
- macOS: `~/Library/Application Support/garmin-mcp/`
- Linux: `~/.config/garmin-mcp/`

### Right to Restrict Processing
You can stop using the software at any time. No background processing occurs.

### Right to Data Portability
All your data remains on your device. You can back up or transfer your encrypted credentials by copying the data directory.

### Right to Object
As all processing is based on your explicit consent, you can withdraw consent by deleting your data and uninstalling the software.

### Right to Withdraw Consent
You can withdraw consent at any time by:
1. Deleting your stored credentials
2. Uninstalling the software
3. Revoking OAuth tokens via Garmin Connect settings

## Children's Privacy

This software is not intended for use by children under 13 years of age. We do not knowingly collect personal information from children under 13.

## International Data Transfers

Your data is transmitted to Garmin Connect servers, which may be located in various countries. Garmin's privacy practices are governed by their own privacy policy: https://www.garmin.com/privacy

## Data Breach Notification

As this software operates entirely locally with no central servers:
- There is no centralized database that could be breached
- Your data security depends on your local device security
- If your device is compromised, your encrypted credentials may be at risk

## Open Source

This project is **open source** under the MIT License. You can:

- Review the source code at https://github.com/sedoglia/garmin-mcp-ts
- Verify how your data is handled
- Audit the encryption implementation
- Fork and modify the code for your own use

## Changes to This Policy

We may update this privacy policy from time to time. Changes will be:
- Documented in the repository commit history
- Reflected in the "Last Updated" date above
- Announced in release notes for significant changes

We encourage you to review this policy periodically.

## Contact

For privacy-related questions, concerns, or to exercise your rights, please:

- Open an issue at https://github.com/sedoglia/garmin-mcp-ts/issues
- Email: sedoglia@gmail.com

We will respond to privacy inquiries within 30 days.

---

**Summary**: This software operates entirely on your local device. Your credentials are encrypted and stored locally using AES-256-GCM encryption. Data is only transmitted to Garmin Connect servers over HTTPS. We do not collect, store, or transmit any data to third-party servers. You have full control over your data and can delete it at any time.
