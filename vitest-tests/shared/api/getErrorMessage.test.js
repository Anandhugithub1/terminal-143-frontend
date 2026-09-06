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

  it('maps a 429 with retryAfterSeconds to the countdown key, interpolating a formatted duration', () => {
    const err = axiosError({ status: 429, data: { error: 'Too many requests', retryAfterSeconds: 42 } })
    expect(getErrorMessage(err)).toBe('errors:tooManyRequestsWithRetry::{"duration":"42s"}')
  })

  it('formats a retryAfterSeconds in the minutes range (e.g. a 1hr window with ~44min left) as minutes, not raw seconds', () => {
    const err = axiosError({ status: 429, data: { error: 'Too many requests', retryAfterSeconds: 2647 } })
    expect(getErrorMessage(err)).toBe('errors:tooManyRequestsWithRetry::{"duration":"45m"}')
  })

  it('formats a retryAfterSeconds over an hour as hours', () => {
    const err = axiosError({ status: 429, data: { error: 'Too many requests', retryAfterSeconds: 7200 } })
    expect(getErrorMessage(err)).toBe('errors:tooManyRequestsWithRetry::{"duration":"2h"}')
  })

  it('rounds up rather than down so the shown wait is never shorter than the real one', () => {
    const err = axiosError({ status: 429, data: { error: 'Too many requests', retryAfterSeconds: 61 } })
    expect(getErrorMessage(err)).toBe('errors:tooManyRequestsWithRetry::{"duration":"2m"}')
  })

  it('ignores a non-numeric retryAfterSeconds and falls back to the generic key', () => {
    const err = axiosError({ status: 429, data: { error: 'Too many requests', retryAfterSeconds: 'soon' } })
    expect(getErrorMessage(err)).toBe('errors:tooManyRequests')
  })

  it('applies the retry countdown even when matched via the message-substring path (existing auth limiter)', () => {
    const err = axiosError({ status: 400, data: { error: 'Attempt limit exceeded, try later', retryAfterSeconds: 15 } })
    expect(getErrorMessage(err)).toBe('errors:tooManyRequestsWithRetry::{"duration":"15s"}')
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
    expect(getErrorMessage(err)).toBe('errors:tooManyIncorrectCodes::{"duration":"30m"}')
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
    expect(getErrorMessage(err)).toBe('errors:tooManyRequestsWithRetry::{"duration":"20s"}')
  })

  it('maps predesginedurl.js\'s 413 message to mediaTooLarge', () => {
    const err = axiosError({ status: 413, data: { error: 'File too large. Max 20MB.', maxBytes: 20971520 } })
    expect(getErrorMessage(err)).toBe('errors:mediaTooLarge')
  })

  it('falls back to mediaTooLarge for a 413 with no recognized message', () => {
    const err = axiosError({ status: 413, data: {} })
    expect(getErrorMessage(err)).toBe('errors:mediaTooLarge')
  })

  describe('network-error classification (isAxiosError/request gate)', () => {
    it('a real axios error with no response (offline/dropped connection) maps to network', () => {
      // Shape axios actually produces for a request that was sent but never
      // got a response: isAxiosError:true, .request set, .response absent.
      const err = { isAxiosError: true, request: {}, message: 'Network Error' }
      expect(getErrorMessage(err)).toBe('errors:network')
    })

    it('an iOS CapacitorHttp failure (arbitrary NSError message, still isAxiosError) also maps to network', () => {
      const err = { isAxiosError: true, request: {}, message: 'Load failed' }
      expect(getErrorMessage(err)).toBe('errors:network')
    })

    it('a plain JS Error from a non-HTTP step (e.g. image conversion failing before any request) is NOT mislabeled as network', () => {
      // This is exactly ensureNormalizedImage's failure shape: a bare Error
      // thrown before getPresignedUrl/uploadToS3 are ever called, so it has
      // no isAxiosError, no .request, no .response — only .message. Regression
      // guard for the bug where this showed "Network error" and hid the real
      // cause (bad/undecodable image) from the user.
      const err = new Error('Could not decode image')
      expect(getErrorMessage(err)).not.toBe('errors:network')
    })

    it('a plain Error with a fallbackKey surfaces that key, not network', () => {
      const err = new Error('Image file is empty — please try selecting the photo again')
      expect(getErrorMessage(err, 'circleRequestFailed')).toBe('errors:circleRequestFailed')
    })

    it('an uploadToS3-thrown error (status:0, no isAxiosError/request) is not mislabeled as network either', () => {
      // uploadToS3.js throws plain Error objects with a `status` field, not
      // axios errors — same non-HTTP-request shape as the image-conversion
      // case above.
      const err = Object.assign(new Error('Upload failed with status 0'), { status: 0 })
      expect(getErrorMessage(err, 'circleRequestFailed')).toBe('errors:circleRequestFailed')
    })
  })
})
