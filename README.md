# GW2 Dashboard

A desktop dashboard application for Guild Wars 2 players to track daily activities, crafting tasks, and world boss completions. Built with Electron, React, and TypeScript.

## Table of Contents

- [Architecture](#architecture)
- [Features](#features)
- [Security Features](#security-features)
- [Testing](#testing)
- [Installation & Development](#installation--development)
- [Project Structure](#project-structure)

---

## Architecture

### Overview

GW2 Dashboard is an Electron-based desktop application with a modern React frontend and a secure Node.js backend. The application follows a layered architecture with clear separation of concerns between the main process, preload script, and renderer process.

### Application Structure

```
┌─────────────────────────────────────────────┐
│         Renderer Process (React)            │
│  ├─ Components (UI Layer)                   │
│  ├─ Hooks (Business Logic)                  │
│  ├─ Services (API Communication)            │
│  └─ Models (Data Structures)                │
└──────────────┬──────────────────────────────┘
               │ IPC Bridge
┌──────────────┴──────────────────────────────┐
│      Preload Script (Context Bridge)        │
│  ├─ window.api.settings                     │
│  ├─ window.api.notifications                │
│  └─ window.api.worldBoss                    │
└──────────────┬──────────────────────────────┘
               │ Safe IPC Handlers
┌──────────────┴──────────────────────────────┐
│    Main Process (Node.js, Electron)         │
│  ├─ IPC Handlers (Data Access Layer)        │
│  ├─ GW2 API Integration                     │
│  ├─ Settings Store (Encryption)             │
│  ├─ Window Management                       │
│  └─ Floating Card Windows                   │
└─────────────────────────────────────────────┘
```

### Key Architectural Patterns

#### 1. **IPC Handler Factory Pattern**
Located in [src/main/ipc/handlerFactory.ts](app/src/main/ipc/handlerFactory.ts), provides utilities for creating standardized IPC handlers:

- `createSimpleHandler()` - Wraps synchronous functions
- `createAsyncHandler()` - Wraps async functions with error handling
- `createAuthenticatedGW2Handler()` - Handles authenticated API calls with API key injection
- `createPublicGW2Handler()` - Handles public API calls (no authentication needed)

Benefits:
- Consistent error handling across all IPC calls
- Standardized response format (`{ success, error?, data? }`)
- Reduced code duplication

#### 2. **Custom Hooks for Data Fetching**
Located in [src/renderer/src/hooks/](app/src/renderer/src/hooks/), provides reusable logic for data operations:

- `useAccountData` - Fetches account information
- `useDailyCrafting` - Tracks daily crafting items
- `useWorldBossCompletions` - Monitors world boss kills
- `useWorldBossKillCounter` - Tracks accumulated kills
- `useAsyncData` - Generic async data fetching hook

#### 3. **Component-Based UI Architecture**
Located in [src/renderer/src/components/](app/src/renderer/src/components/):

- **Layout Components**: `Header`, `Footer`, `HomeMenu`
- **Card System**: Draggable, floating card windows for modular display
- **Setup Flow**: `SetupPage` for initial API key configuration
- **Settings**: `SettingsPanel` for user preferences

#### 4. **Floating Card Windows**
Separate Electron BrowserWindow instances for displaying individual cards outside the main window. Each card is a dedicated window with its own React app instance, allowing users to position them independently.

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User Interaction (React Component)                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Hook Calls window.api.* (IPC Invoke)                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Preload Script Forwards to Main Process                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. IPC Handler Executes (Error Handling)                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. API/Data Operation                                       │
│    ├─ GW2 API Call (HTTP)                                   │
│    ├─ Local Storage Access                                  │
│    └─ Encryption/Decryption                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Return Standardized Result                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Hook Updates State & Re-renders UI                       │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19, TypeScript | UI components and state management |
| **Build Tools** | Vite, electron-vite | Fast development and optimized builds |
| **Desktop Framework** | Electron 39 | Cross-platform desktop application |
| **Drag & Drop** | @dnd-kit | Card reorganization and floating windows |
| **Testing** | Vitest, React Testing Library, Cypress | Unit, component, and E2E testing |
| **Storage** | electron-store | Persistent settings and configuration |
| **Encryption** | Electron safeStorage | OS-level API key encryption |
| **Styling** | CSS3 | Custom styling with CSS variables |

---

## Features

### Core Features

#### 1. **Account Setup & API Key Management**
- First-time setup wizard with API key validation
- Secure API key storage using OS-level encryption
- Account name and information caching
- Quick reset/logout functionality

#### 2. **Daily Tracking Dashboard**
- **Daily World Bosses**: Track which world bosses you've defeated
- **Daily Crafting**: Monitor daily crafting recipes
- **Events Calendar**: Display upcoming world boss events
- Real-time sync with GW2 API

#### 3. **Floating Card Windows**
- Detach any card to a floating window
- Position windows independently on screen
- Persistent window state across sessions
- Automatic cleanup when main window closes

#### 4. **Customizable Interface**
- Toggle visibility of individual cards/counters
- Drag-and-drop card reordering
- Settings persistence in localStorage
- Responsive dark theme

#### 5. **World Boss Tracking**
- Track completion status for each world boss
- Kill counter for accumulated kills
- Visual indicators for upcoming bosses
- Integration with GW2 API for accurate scheduling

#### 6. **Daily Crafting Tracker**
- Display daily available crafting items
- Per-character tracking
- Integration with account data

### Future Enhancement Possibilities

- Multi-account support
- Guild integration
- Marketplace tracker
- Achievement monitoring
- Customizable themes

---

## Security Features

### API Key Protection

#### Multi-Layer Encryption Strategy

1. **OS-Level SafeStorage (Primary)**
   - Windows: DPAPI (Data Protection API)
   - macOS: Keychain integration
   - Linux: Secret Service API or libsecret
   
   Implementation in [src/main/store.ts](app/src/main/store.ts):
   ```typescript
   if (safeStorage.isEncryptionAvailable()) {
     const encrypted = safeStorage.encryptString(apiKey)
     this.store.set('apiKey', encrypted.toString('base64'))
   }
   ```

2. **electron-store Encryption (Fallback)**
   - Provides additional encryption layer
   - Automatic fallback if SafeStorage unavailable
   - Secures entire config file

### IPC Security

#### Context Isolation
- **Enabled**: `contextIsolation: true`
- Renderer process cannot directly access Electron/Node APIs
- All communication goes through secure preload bridge

#### Sandbox Mode
- **Enabled**: `sandbox: true`
- Renderer runs in restricted environment
- Cannot execute arbitrary system commands

#### Preload Security
Located in [src/preload/index.ts](app/src/preload/index.ts):
- Whitelist of exposed APIs only
- No direct access to require() or node modules
- Controlled data flow through contextBridge

#### Node Integration
- **Disabled**: `nodeIntegration: false`
- Renderer cannot directly use Node.js APIs
- Prevents direct file system access vulnerabilities

### Data Handling

#### API Key Management
- Never logged or displayed in console
- Only stored encrypted on disk
- Not transmitted except to official GW2 API (HTTPS only)
- Cleared entirely on logout

#### Account Information
- Stored locally, never sent to external services
- Account name stored unencrypted (non-sensitive)
- Account data fetched fresh on each session

#### Local Settings
- Stored in browser localStorage
- No sensitive information
- Can be cleared by user

### HTTPS Communication
- All GW2 API calls use HTTPS
- Certificate validation enabled
- Prevents man-in-the-middle attacks

### Storage Locations

**Platform-Specific Secure Storage:**
- **Windows**: `%APPDATA%\gw2dash\config.json`
- **macOS**: `~/Library/Application Support/gw2dash/config.json`
- **Linux**: `~/.config/gw2dash/config.json`

All storage locations are platform-specific user directories with appropriate access restrictions.

---

## Testing

The project implements a comprehensive testing strategy across multiple levels:

### Test Framework

- **Unit Testing**: Vitest with happy-dom/jsdom
- **Component Testing**: React Testing Library
- **E2E Testing**: Cypress
- **Coverage Tools**: v8 coverage provider

### Test Structure

```
tests/
├── setup.ts                    # Global test configuration
├── example.test.ts             # Example unit tests
├── store.test.ts               # Settings store tests
├── services/
│   ├── gw2api.test.ts         # API service tests
│   └── gw2boss.test.ts        # World boss service tests
├── components/
│   └── Header.test.tsx        # Component tests
└── utils/
    ├── factories.ts           # Test data factories
    └── test-utils.tsx         # Custom test utilities
```

### Unit Tests

#### Store Tests ([tests/store.test.ts](app/tests/store.test.ts))
Tests the `SettingsStore` class with mocked Electron modules:
- **API Key Management**: Set, get, and clear operations
- **Setup Status**: Track completion state
- **Account Info**: Store and retrieve account names
- **Encryption**: Verify encryption/decryption flow

```typescript
describe('SettingsStore', () => {
  describe('API Key Management', () => {
    it('should set and get API key', () => { /* ... */ })
    it('should return true when API key exists', () => { /* ... */ })
    it('should clear API key', () => { /* ... */ })
  })
  describe('Setup Status', () => { /* ... */ })
  describe('Account Info', () => { /* ... */ })
})
```

#### API Service Tests ([tests/services/gw2api.test.ts](app/tests/services/gw2api.test.ts))
Tests the GW2 API service with mocked IPC:
- **Account Data**: Success and error cases
- **Account Name**: Retrieval and error handling
- **IPC Communication**: Mocked window.api.settings

```typescript
describe('gw2ApiService', () => {
  describe('getAccountData', () => {
    it('returns success with account data from IPC', async () => { /* ... */ })
    it('returns failure with forwarded error message', async () => { /* ... */ })
  })
  describe('getAccountName', () => { /* ... */ })
})
```

#### Basic Unit Tests ([tests/example.test.ts](app/tests/example.test.ts))
Foundational tests demonstrating Vitest patterns:
- String operations
- Array operations
- Object operations

### Component Tests

#### Header Component Test ([tests/components/Header.test.tsx](app/tests/components/Header.test.tsx))
Tests React component rendering:
- Component renders correctly
- Props are passed and used
- DOM elements are present

Uses custom test utilities with factory functions for test data:
```typescript
import { render, screen } from '../utils/test-utils'
import { makePlayerData } from '../utils/factories'

describe('Header Component', () => {
  it('should render the header', () => {
    const mockPlayer = makePlayerData()
    render(<Header playerStats={mockPlayer} />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })
})
```

### E2E Tests

#### Cypress Tests ([cypress/e2e/spec.cy.ts](app/cypress/e2e/spec.cy.ts))
End-to-end tests using Cypress:
- User interactions and workflows
- Full application behavior
- Integration between frontend and backend

**Running E2E Tests:**
```bash
# Open Cypress UI
npm run cypress:open

# Run headless
npm run test:e2e
```

### Running Tests

```bash
# Run tests in watch mode (includes coverage)
npm test

# Run tests once
npm run test:run

# View test coverage report
npm run test:coverage

# Open Vitest UI
npm run test:ui

# E2E Tests
npm run test:e2e
npm run cypress:open

# Run all quality checks
npm run lint && npm run typecheck && npm run test:run
```

### Configuration

**Vitest Config** ([vitest.config.ts](app/vitest.config.ts)):
- Global test utilities
- jsdom environment for DOM testing
- Coverage reporting with v8
- Path aliases (@renderer, @)
- React plugin support

### Test Data

**Test Factories** ([tests/utils/factories.ts](app/tests/utils/factories.ts)):
Utility functions for creating mock data:
- `makePlayerData()` - Generate test player data
- `makeBossData()` - Create world boss data
- Consistent test data structure

### Testing Best Practices

1. **Isolation**: Each test is independent with mocked dependencies
2. **Clarity**: Test names clearly describe what is being tested
3. **Coverage**: Critical business logic is thoroughly tested
4. **Mocking**: External dependencies (IPC, Electron) are mocked
5. **Factories**: DRY principle for test data generation

---

## Installation & Development

### Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- Platform-specific build tools for Electron

### Setup

```bash
# Navigate to the app directory
cd gw2-dashboard/app

# Install dependencies
npm install
```

### Development

```bash
# Start development server with Electron
npm run dev

# Run in development with watch mode
npm test

# Lint code
npm run lint

# Format code
npm run format

# Type checking
npm run typecheck
```

### Building

```bash
# Build for current platform
npm run build

# Build for Windows
npm run build:win

# Build for macOS
npm run build:mac

# Build for Linux
npm run build:linux

# Preview build
npm start
```

### IDE Setup

Recommended tools:
- **VSCode** + **ESLint** + **Prettier** plugins
- Automatic formatting on save
- TypeScript IntelliSense enabled

---

## Project Structure

```
gw2-dashboard/
├── README.md
└── app/
    ├── src/
    │   ├── main/                      # Main Process (Node.js/Electron)
    │   │   └── ipc/                   # IPC Handler definitions
    │   ├── preload/                   # Preload Script (Context Bridge)
    │   └── renderer/                  # Renderer Process (React)
    │       └── src/
    │           ├── components/        # React components
    │           │   └── cards/         # Card components
    │           ├── hooks/             # Custom React hooks
    │           │   └── common/        # Shared hooks utilities
    │           ├── services/          # API communication layer
    │           ├── models/            # TypeScript interfaces
    │           ├── constants/         # Application constants
    │           └── assets/            # CSS and images
    ├── tests/                         # Unit tests
    │   ├── services/
    │   ├── components/
    │   └── utils/
    ├── cypress/                       # E2E tests
    │   ├── e2e/
    │   ├── fixtures/
    │   └── support/
    ├── docs/                          # Documentation
    └── resources/                     # App assets
```

---

## Contributing

When contributing to this project:

1. Follow the existing code structure and patterns
2. Write tests for new features
3. Ensure TypeScript types are complete
4. Run `npm run lint`, `npm run typecheck`, and `npm test` before committing
5. Use `npm run format` for consistent code style

## License

See LICENSE file for details.

## Resources

- [GW2 API Documentation](https://wiki.guildwars2.com/wiki/API:Main)
- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
