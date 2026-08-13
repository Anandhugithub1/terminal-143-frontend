import { describe, it, expect, vi, beforeEach } from 'vitest'

// getErrorMessage imports the real i18n singleton (HTTP-backed, async load) —
// mock it to a plain t(key, opts) => string so tests are synchronous and
// don't depend on translation files loading over the network.
vi.mock('../../../src/i18n/i18n', () => ({
  default: {
    t: (key, opts) => (opts ? `${key}::${JSON.stringify(opts)}` : key),
  },
}))

const { getErrorMessage } = await import('../../../src/shared/api/getErrorMessage')

function axiosError({ status, data } = {}) {
  return { response: { status, data } }
}

describe('getErrorMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('maps a plain 429 (no retryAfterSeconds) to the generic tooManyRequests key', () => {
    const err = axiosError({ status: 429, data: { error: 'Too many requests' } })
    expect(getErrorMessage(err)).toBe('errors:tooManyRequests')
  })

  it('maps a 429 with retryAfterSeconds to the countdown key, interpolating seconds', () => {
    const err = axiosError({ status: 429, data: { error: 'Too many requests', retryAfterSeconds: 42 } })
    expect(getErrorMessage(err)).toBe('errors:tooManyRequestsWithRetry::{"seconds":42}')
  })

  it('ignores a non-numeric retryAfterSeconds and falls back to the generic key', () => {
    const err = axiosError({ status: 429, data: { error: 'Too many requests', retryAfterSeconds: 'soon' } })
    expect(getErrorMessage(err)).toBe('errors:tooManyRequests')
  })

  it('applies the retry countdown even when matched via the message-substring path (existing auth limiter)', () => {
    const err = axiosError({ status: 400, data: { error: 'Attempt limit exceeded, try later', retryAfterSeconds: 15 } })
    expect(getErrorMessage(err)).toBe('errors:tooManyRequestsWithRetry::{"seconds":15}')
  })

  it('still maps other statuses normally (unaffected by the new branch)', () => {
    const err = axiosError({ status: 404, data: { error: 'not found' } })
    expect(getErrorMessage(err)).toBe('errors:notFound')
  })

  it('maps a lockout 429 (reason: "lockout") to the distinct tooManyIncorrectCodes key, not the generic one', () => {
    const err = axiosError({
      status: 429,
      data: { error: 'Too many incorrect attempts', retryAfterSeconds: 1800, reason: 'lockout' },
    })
    expect(getErrorMessage(err)).toBe('errors:tooManyIncorrectCodes::{"seconds":1800}')
  })

  it('a lockout reason without retryAfterSeconds falls back to the generic tooManyRequests key', () => {
    const err = axiosError({
      status: 429,
      data: { error: 'Too many incorrect attempts', reason: 'lockout' },
    })
    expect(getErrorMessage(err)).toBe('errors:tooManyRequests')
  })

  it('a plain 429 without reason: "lockout" still uses the ordinary tooManyRequestsWithRetry key', () => {
    const err = axiosError({ status: 429, data: { error: 'Too many requests', retryAfterSeconds: 20 } })
    expect(getErrorMessage(err)).toBe('errors:tooManyRequestsWithRetry::{"seconds":20}')
  })
})
