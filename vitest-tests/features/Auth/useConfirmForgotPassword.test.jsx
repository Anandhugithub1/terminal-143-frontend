import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const apiConfirmForgotPassword = vi.fn()

vi.mock('../../../src/features/Auth/authApi', () => ({
  apiVerifyOtp: vi.fn(),
  apiResendOtp: vi.fn(),
  apiForgotPassword: vi.fn(),
  apiConfirmForgotPassword: (...args) => apiConfirmForgotPassword(...args),
  apiLogin: vi.fn(),
  apiRegister: vi.fn(),
  signOut: vi.fn(),
}))

const { useConfirmForgotPassword } = await import('../../../src/features/Auth/useAuth')

function wrapper({ children }) {
  const queryClient = new QueryClient()
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useConfirmForgotPassword', () => {
  it('passes { email, code, newPassword } to apiConfirmForgotPassword — regression guard for the ConfirmationCode/Password param-name mismatch bug', async () => {
    apiConfirmForgotPassword.mockResolvedValue({ ok: true })
    const { result } = renderHook(() => useConfirmForgotPassword(), { wrapper })

    result.current.mutate({ email: 'alice@example.com', code: '123456', newPassword: 'NewPassw0rd!' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiConfirmForgotPassword).toHaveBeenCalledWith({
      email: 'alice@example.com',
      code: '123456',
      newPassword: 'NewPassw0rd!',
    })
    // Explicitly guard against the old bug: no PascalCase Cognito field names
    // should ever reach apiConfirmForgotPassword directly — that mapping
    // belongs entirely inside authApi.js.
    const callArg = apiConfirmForgotPassword.mock.calls[0][0]
    expect(callArg.ConfirmationCode).toBeUndefined()
    expect(callArg.Password).toBeUndefined()
  })
})
