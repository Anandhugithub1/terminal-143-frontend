import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CreateCircleModal from '../src/features/Circles/components/circle/CreateCircleModal'

// Real behavior under test: after a successful create, the modal calls
// onCreated with the new circle's id (so the caller — CirclesHomePage — can
// navigate to it) BEFORE it resets its own form/closes. Previously nothing
// called back at all, so a caller landed wherever the modal happened to be
// opened from rather than the new circle's own page.

vi.mock('react-i18next', () => ({
  initReactI18next: { type: '3rdParty', init: () => {} },
  useTranslation: () => ({ t: (key) => key }),
}))

const mutateAsync = vi.fn()
vi.mock('../src/features/Circles/hooks/useCircles', () => ({
  useCreateCircle: () => ({ mutateAsync, isPending: false }),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

function fillRequiredFields() {
  fireEvent.change(screen.getByPlaceholderText('createCircleModal.namePlaceholder'), {
    target: { value: 'Weekend Hikers' },
  })
  fireEvent.change(screen.getByPlaceholderText('createCircleModal.descriptionPlaceholder'), {
    target: { value: 'A group for weekend hiking trips.' },
  })
  fireEvent.change(screen.getByRole('combobox'), {
    target: { value: 'travel_outdoor' },
  })
}

describe('CreateCircleModal — onCreated callback', () => {
  it('calls onCreated with the new circleId after a successful create', async () => {
    mutateAsync.mockResolvedValue({ message: 'Circle created', circleId: 'new-circle-123' })
    const onCreated = vi.fn()
    const onClose = vi.fn()

    render(<CreateCircleModal isOpen onClose={onClose} onCreated={onCreated} />)

    fillRequiredFields()
    fireEvent.click(screen.getByText('createCircleModal.createCircle'))

    await waitFor(() => {
      expect(onCreated).toHaveBeenCalledWith('new-circle-123')
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('does not call onCreated when the create fails', async () => {
    mutateAsync.mockRejectedValue(new Error('name required'))
    const onCreated = vi.fn()

    render(<CreateCircleModal isOpen onClose={vi.fn()} onCreated={onCreated} />)

    fillRequiredFields()
    fireEvent.click(screen.getByText('createCircleModal.createCircle'))

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledTimes(1)
    })
    expect(onCreated).not.toHaveBeenCalled()
  })

  it('does not throw when onCreated is omitted (optional prop)', async () => {
    mutateAsync.mockResolvedValue({ message: 'Circle created', circleId: 'new-circle-123' })

    render(<CreateCircleModal isOpen onClose={vi.fn()} />)

    fillRequiredFields()
    fireEvent.click(screen.getByText('createCircleModal.createCircle'))

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledTimes(1)
    })
  })
})
