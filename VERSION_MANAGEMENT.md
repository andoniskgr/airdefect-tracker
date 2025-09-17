# Version Management System

This project includes an automated version management system that updates the version number every time changes are made.

## How It Works

The version is stored in `src/version.json` and is automatically displayed throughout the application in:

- Navigation bar
- Login page
- Signup page

## Version Update Commands

### Patch Version (Default)

```bash
npm run version:update
# or
npm run version:patch
```

Increments the patch version (e.g., 1.0.1 → 1.0.2)

### Minor Version

```bash
npm run version:minor
```

Increments the minor version (e.g., 1.0.1 → 1.1.0)

### Major Version

```bash
npm run version:major
```

Increments the major version (e.g., 1.0.1 → 2.0.0)

## Version File Structure

The `src/version.json` file contains:

```json
{
  "version": "1.0.2",
  "buildDate": "2024-12-19",
  "lastUpdated": "2025-09-17T06:20:35.660Z"
}
```

## Usage in Code

Import the version utilities:

```typescript
import { getVersionString, getVersion, getBuildInfo } from "@/utils/version";

// Get version string (e.g., "v1.0.2")
const version = getVersionString();

// Get full version info
const versionInfo = getVersion();

// Get build info with date
const buildInfo = getBuildInfo();
```

## Automatic Updates

To automatically update the version when making changes, simply run:

```bash
npm run version:update
```

This will:

1. Increment the patch version
2. Update the timestamp
3. Update all version displays in the application

## Version Display

The version is displayed in:

- **Navbar**: Top-right corner
- **Login Page**: Top-right corner
- **Signup Page**: Top-right corner

All version displays are automatically updated when the version is incremented.
