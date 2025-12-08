# API Key Storage

## Overview
The GW2 Dashboard stores API keys securely using Electron's built-in security features.

## Storage Implementation

### Location
- **Windows**: `%APPDATA%\gw2dash\config.json`
- **macOS**: `~/Library/Application Support/gw2dash/config.json`
- **Linux**: `~/.config/gw2dash/config.json`

### Security Layers

1. **Electron SafeStorage** (Primary)
   - Uses OS-level encryption:
     - Windows: DPAPI (Data Protection API)
     - macOS: Keychain
     - Linux: Secret Service API or libsecret
   - API keys are encrypted before storage

2. **electron-store Encryption** (Fallback)
   - If SafeStorage is unavailable, electron-store's built-in encryption is used
   - Provides additional encryption layer for the entire config file

## API Exposed to Renderer

The following methods are available via `window.api.settings`:

- `hasApiKey()` - Check if API key exists
- `getApiKey()` - Retrieve decrypted API key
- `setApiKey(key)` - Store encrypted API key
- `clearApiKey()` - Remove API key
- `hasCompletedSetup()` - Check setup status
- `setAccountName(name)` - Store account name
- `getAccountName()` - Retrieve account name

## First-Time Setup Flow

1. App checks for API key on startup
2. If no key exists, shows `SetupPage`
3. User creates API key on ArenaNet site
4. User enters key in setup form
5. App validates key against GW2 API
6. On success, key is encrypted and stored
7. App navigates to `HomeMenu`

## Security Best Practices

✅ API keys are encrypted at rest
✅ Keys never exposed in logs
✅ Communication uses HTTPS only
✅ Stored locally - never sent to external servers
✅ Uses OS-native credential stores when available

## Usage Example

```typescript
// Check if user has API key
const hasKey = await window.api.settings.hasApiKey()

// Store new API key
await window.api.settings.setApiKey('XXXXXXXX-...')

// Retrieve API key for GW2 API calls
const apiKey = await window.api.settings.getApiKey()
const response = await fetch(`https://api.guildwars2.com/v2/account?access_token=${apiKey}`)
```
