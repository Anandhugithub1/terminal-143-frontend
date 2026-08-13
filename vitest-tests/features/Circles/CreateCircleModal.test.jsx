import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const mutateAsync = vi.fn()
const toastError = vi.fn()

vi.mock('sonner', () => ({ toast: { error: (...args) => toastError(...args), success: vi.fn() } }))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}))

vi.mock('../../../src/features/Circles/hooks/useCircles', () => ({
  useCreateCircle: () => ({ mutateAsync, isPending: false }),
}))

vi.mock('../../../src/features/UserProfile/Hooks/useMyProfile', () => ({
  useMyProfile: () => ({ data: null }),
}))

vi.mock('../../../src/shared/hooks/useLocationState', () => ({
  useLocationState: () => ({
    location: {},
    setLocation: vi.fn(),
    isEnrichingLocation: false,
    handleLocationSelect: vi.fn(),
    resetLocation: vi.fn(),
  }),
}))

vi.mock('../../../src/features/AddProfile/components/LocationInput', () => ({
  default: () => null,
}))

vi.mock('../../../src/features/Circles/components/common/BottomSheetModal', () => ({
  default: ({ children, isOpen }) => (isOpen ? <div>{children}</div> : null),
}))

vi.mock('../../../src/features/Circles/api/imageupload', () => ({
  getPresignedUrl: vi.fn(),
}))

vi.mock('../../../src/shared/utils/uploadToS3', () => ({
  uploadToS3: vi.fn(),
}))

vi.mock('../../../src/utils/imageConversion', () => ({
  ensureNormalizedImage: vi.fn(),
}))

const { getErrorMessage } = vi.hoisted(() => ({ getErrorMessage: vi.fn(() => 'mapped: too many requests, retry in 30s') }))
vi.mock('../../../src/shared/api/getErrorMessage', () => ({ getErrorMessage }))

const CreateCircleModal = (await import('../../../src/features/Circles/components/circle/CreateCircleModal')).default

function fillRequiredFields() {
  fireEvent.change(screen.getByPlaceholderText('createCircleModal.namePlaceholder'), {
    target: { value: 'Hikers' },
  })
  fireEvent.change(screen.getByPlaceholderText('createCircleModal.descriptionPlaceholder'), {
    target: { value: 'A circle for hikers' },
  })
  fireEvent.change(screen.getByRole('combobox'), {
    target: { value: 'travel_outdoor' },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CreateCircleModal 429 handling', () => {
  it('routes a rate-limit rejection through getErrorMessage instead of raw backend text', async () => {
    const rateLimitErr = {
      response: { status: 429, data: { error: 'Too many requests', retryAfterSeconds: 30 } },
    }
    mutateAsync.mockRejectedValueOnce(rateLimitErr)

    render(<CreateCircleModal isOpen={true} onClose={vi.fn()} />)
    fillRequiredFields()

    fireEvent.click(screen.getByText('createCircleModal.createCircle'))

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(toastError).toHaveBeenCalledTimes(1))

    expect(getErrorMessage).toHaveBeenCalledWith(rateLimitErr, 'circleRequestFailed')
    expect(toastError).toHaveBeenCalledWith('mapped: too many requests, retry in 30s')
    // Regression guard for the bug being fixed: must NOT fall back to the
    // raw err.response.data.error string or the bare translation key.
    expect(toastError).not.toHaveBeenCalledWith('Too many requests')
  })

  it('does not call getErrorMessage or toast on a successful create', async () => {
    mutateAsync.mockResolvedValueOnce({ circleId: 'c1' })
    const onClose = vi.fn()

    render(<CreateCircleModal isOpen={true} onClose={onClose} />)
    fillRequiredFields()

    fireEvent.click(screen.getByText('createCircleModal.createCircle'))

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))

    expect(getErrorMessage).not.toHaveBeenCalled()
    expect(toastError).not.toHaveBeenCalled()
  })
})
