import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

const verifyMutate = vi.fn()
const resendMutate = vi.fn()

let verifyState = { isPending: false, isError: false, error: null, isSuccess: false }
let resendState = { isPending: false, isError: false, error: null }

vi.mock('../../../src/features/Auth/useAuth', () => ({
  useVerifyOtp: () => ({ mutate: verifyMutate, ...verifyState }),
  useResendOtp: () => ({ mutate: resendMutate, ...resendState }),
}))

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams({ email: 'alice@example.com' })],
  Link: ({ children }) => <a>{children}</a>,
}))

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, opts) => (opts ? `${key}::${JSON.stringify(opts)}` : key),
  }),
}))

const { getErrorMessage } = vi.hoisted(() => ({ getErrorMessage: vi.fn(() => 'mapped: too many requests, retry in 30s') }))
vi.mock('../../../src/shared/api/getErrorMessage', () => ({ getErrorMessage }))

const OtpVerification = (await import('../../../src/features/Auth/pages/OtpVerification')).default

beforeEach(() => {
  vi.resetAllMocks()
  verifyState = { isPending: false, isError: false, error: null, isSuccess: false }
  resendState = { isPending: false, isError: false, error: null }
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('OtpVerification resend UX', () => {
  it('shows the mapped error message when resend fails — regression guard for the missing error display', () => {
    resendState = { isPending: false, isError: true, error: { response: { status: 429 } } }

    render(<OtpVerification />)

    expect(getErrorMessage).toHaveBeenCalledWith(resendState.error)
    expect(screen.getByText('mapped: too many requests, retry in 30s')).toBeInTheDocument()
  })

  it('shows no error text when resend has not failed', () => {
    render(<OtpVerification />)
    expect(getErrorMessage).not.toHaveBeenCalled()
  })

  it('disables the resend button and starts a cooldown after tapping resend', () => {
    render(<OtpVerification />)

    const resendButton = screen.getByText('otp.resend')
    fireEvent.click(resendButton)

    expect(resendMutate).toHaveBeenCalledWith({ email: 'alice@example.com' }, expect.objectContaining({ onError: expect.any(Function) }))
    expect(screen.getByText('otp.resendCooldown::{"seconds":30}')).toBeInTheDocument()
  })

  // Regression guard: a real 429 gives an authoritative wait time — showing
  // the fixed 30s "Resend in Xs" countdown on top of an error that already
  // says e.g. "try again in 42m" is contradictory (button would re-enable in
  // seconds while the error claims minutes). The countdown label must be
  // suppressed whenever an error is active; the error message is the only
  // wait-time hint shown.
  it('does not show the "Resend in Xs" countdown while a rate-limit error is active — only the error message', () => {
    resendState = { isPending: false, isError: true, error: { response: { status: 429, data: { retryAfterSeconds: 2520 } } } }

    render(<OtpVerification />)

    expect(screen.queryByText(/otp.resendCooldown/)).not.toBeInTheDocument()
    expect(screen.getByText('mapped: too many requests, retry in 30s')).toBeInTheDocument()
  })

  it('extends the disabled cooldown to match a real retryAfterSeconds longer than the fixed 30s guess', () => {
    resendMutate.mockImplementation((_vars, { onError }) => {
      onError({ response: { data: { retryAfterSeconds: 120 } } })
    })

    render(<OtpVerification />)
    fireEvent.click(screen.getByText('otp.resend'))

    act(() => {
      vi.advanceTimersByTime(30000)
    })
    // Would have re-enabled at the fixed 30s mark if the real 120s wait
    // hadn't overridden it.
    expect(screen.queryByText('otp.resend')).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(90000)
    })
    expect(screen.getByText('otp.resend')).toBeInTheDocument()
  })

  it('re-enables resend once the cooldown elapses', () => {
    render(<OtpVerification />)

    fireEvent.click(screen.getByText('otp.resend'))
    expect(screen.getByText('otp.resendCooldown::{"seconds":30}')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(30000)
    })

    expect(screen.getByText('otp.resend')).toBeInTheDocument()
  });

  it('clicking resend again during the cooldown does not call resendMutate a second time', () => {
    render(<OtpVerification />)

    fireEvent.click(screen.getByText('otp.resend'))
    expect(resendMutate).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByText('otp.resendCooldown::{"seconds":30}'))
    expect(resendMutate).toHaveBeenCalledTimes(1)
  })
})
