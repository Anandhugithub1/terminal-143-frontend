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
  vi.clearAllMocks()
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

    expect(resendMutate).toHaveBeenCalledWith({ email: 'alice@example.com' })
    expect(screen.getByText('otp.resendCooldown::{"seconds":30}')).toBeInTheDocument()
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
