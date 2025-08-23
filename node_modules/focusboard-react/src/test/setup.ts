import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock SuperTokens
vi.mock('supertokens-auth-react', () => ({
  EmailPassword: {
    init: vi.fn(() => ({})),
  },
  Session: {
    init: vi.fn(() => ({})),
  },
  EmailPasswordPreBuiltUI: vi.fn(),
}))

// Mock browser APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock Notification API
Object.defineProperty(window, 'Notification', {
  writable: true,
  value: {
    permission: 'granted',
    requestPermission: vi.fn(() => Promise.resolve('granted')),
  },
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock IndexedDB
const indexedDBMock = {
  open: vi.fn(),
}
Object.defineProperty(window, 'indexedDB', {
  value: indexedDBMock,
})

// Mock global fetch
if (typeof global !== 'undefined') {
  (global as any).fetch = vi.fn()
}
