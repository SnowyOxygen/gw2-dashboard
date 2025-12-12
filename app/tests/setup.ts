import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, expect } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend expect with jest-dom matchers for TypeScript
expect.extend(matchers)

// Cleanup after each test
afterEach(() => {
  cleanup()
})
