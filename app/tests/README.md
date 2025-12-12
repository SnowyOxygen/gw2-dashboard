# Unit Testing Guide

This project uses Vitest for unit testing with TypeScript support.

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Structure

Tests are located in the `tests/` directory and follow this structure:

```
tests/
  ├── setup.ts              # Test setup and global configuration
  ├── example.test.ts       # Example unit tests
  ├── store.test.ts         # Store/state management tests
  ├── utils/
  │   └── test-utils.tsx    # Custom testing utilities
  └── components/
      └── Header.test.tsx   # Component tests
```

## Writing Tests

### Basic Unit Test

```typescript
import { describe, it, expect } from 'vitest'

describe('MyFunction', () => {
  it('should do something', () => {
    expect(myFunction()).toBe(expectedValue)
  })
})
```

### Component Test

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '../utils/test-utils'
import { MyComponent } from '../../src/renderer/src/components/MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Mocking

```typescript
import { vi } from 'vitest'

// Mock a module
vi.mock('electron', () => ({
  ipcRenderer: {
    invoke: vi.fn()
  }
}))

// Mock a function
const mockFn = vi.fn()
mockFn.mockReturnValue('mocked value')
```

## Configuration

Test configuration is in [vitest.config.ts](../vitest.config.ts):
- Uses jsdom for DOM simulation
- Includes coverage reporting
- Auto-imports testing globals
- Path aliases configured

## Best Practices

1. **Organize tests by feature/component** - Keep tests close to what they're testing conceptually
2. **Use descriptive test names** - Test names should clearly state what is being tested
3. **Test one thing per test** - Keep tests focused and simple
4. **Use test utilities** - Import from `tests/utils/test-utils` for consistency
5. **Mock external dependencies** - Keep tests isolated and fast
6. **Aim for high coverage** - But focus on meaningful tests, not just coverage numbers

## Coverage Reports

After running `npm run test:coverage`, view the HTML report:
```bash
# Open coverage/index.html in your browser
```

## CI/CD Integration

Add to your CI pipeline:
```yaml
- run: npm run test:run
- run: npm run test:coverage
```
