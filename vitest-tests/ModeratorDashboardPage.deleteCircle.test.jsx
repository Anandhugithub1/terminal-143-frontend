import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ModeratorDashboardPage from '../src/features/Circles/pages/ModeratorDashboardPage'

// Real behavior under test: clicking "Delete Circle" opens a confirm
// dialog with the circle name interpolated into the warning message, and
// confirming calls the delete mutation then navigates away on success.
// Every data-fetching hook is mocked to a loaded, owner-role state — this
// is not an end-to-end test (no real backend/auth), but it does mount the
// actual component tree and drive it with real click events, so it catches
// wiring bugs (wrong prop name, missing translation key, dialog never
// opening) that reading the source code would not.

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useParams: () => ({ circleId: 'vip-circle' }),
  useNavigate: () => mockNavigate,
}))

vi.mock('react-i18next', () => ({
  // getErrorMessage.js side-effect-imports src/i18n/i18n.js, which calls
  // i18n.use(initReactI18next) at module load time — the mock needs to
  // supply this even though nothing in this test exercises real i18next
  // initialization.
  initReactI18next: { type: '3rdParty', init: () => {} },
  useTranslation: () => ({
    t: (key, opts) => {
      // Only the interpolations this test actually asserts on need real
      // substitution; everything else can fall back to the bare key.
      if (key === 'moderatorDashboard.deleteCircleMessage' && opts?.name) {
        return `This will permanently delete ${opts.name}, along with all of its posts, comments, and membership data.`
      }
      return key
    },
  }),
}))

const deleteCircleMutate = vi.fn()

vi.mock('../src/features/Circles/hooks/useCircles', () => ({
  useCircle: () => ({
    data: { circleId: 'vip-circle', name: 'VIP Circle', visibility: 'public', ownerId: 'owner1' },
    isLoading: false,
  }),
  useCircleStats: () => ({ data: { requests: { pending: 0, accepted: 0 } }, isLoading: false }),
  useUpdateCircle: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteCircle: () => ({ mutate: deleteCircleMutate, isPending: false }),
}))

vi.mock('../src/features/Circles/hooks/useMembership', () => ({
  useCircleRequests: () => ({
    requests: [],
    isLoading: false,
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
  }),
  useAcceptCircleRequest: () => ({ mutate: vi.fn(), isPending: false }),
  useRejectCircleRequest: () => ({ mutate: vi.fn(), isPending: false }),
  useRemoveCircleMember: () => ({ mutate: vi.fn(), isPending: false }),
  useSetCircleMemberRole: () => ({ mutate: vi.fn(), isPending: false }),
}))

vi.mock('../src/features/Circles/hooks/usePosts', () => ({
  useCirclePostsForStats: () => ({ data: { items: [] }, isLoading: false }),
}))

vi.mock('../src/features/Circles/api/circleChatApi', () => ({
  useCircleMembers: () => ({
    byUserId: new Map([['owner1', { userId: 'owner1', role: 'owner' }]]),
    data: [{ userId: 'owner1', role: 'owner' }],
    isLoading: false,
  }),
}))

vi.mock('../src/features/UserProfile/Hooks/useMyProfile', () => ({
  useMyProfile: () => ({ data: { username: 'owner1' } }),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ModeratorDashboardPage — delete circle', () => {
  it('renders the Danger Zone card with the delete button', () => {
    render(<ModeratorDashboardPage />)

    expect(screen.getByText('moderatorDashboard.dangerZone')).toBeInTheDocument()
    expect(screen.getAllByText('moderatorDashboard.deleteCircle').length).toBeGreaterThan(0)
  })

  it('does not show the confirm dialog until Delete Circle is clicked', () => {
    render(<ModeratorDashboardPage />)

    expect(
      screen.queryByText(/This will permanently delete/)
    ).not.toBeInTheDocument()
  })

  it('opens the confirm dialog with the circle name interpolated on click', () => {
    render(<ModeratorDashboardPage />)

    // "moderatorDashboard.deleteCircle" also renders as a plain, non-
    // interactive <p> label on the Danger Zone card — only the real
    // <button> triggers the dialog.
    fireEvent.click(screen.getByRole('button', { name: 'moderatorDashboard.deleteCircle' }))

    expect(
      screen.getByText(/This will permanently delete VIP Circle/)
    ).toBeInTheDocument()
  })

  it('calls the delete mutation and navigates to /circles on success', async () => {
    deleteCircleMutate.mockImplementation((_arg, { onSuccess }) => onSuccess())

    render(<ModeratorDashboardPage />)

    fireEvent.click(screen.getByRole('button', { name: 'moderatorDashboard.deleteCircle' }))

    // Once the dialog is open, both the original trigger button (now
    // behind the overlay) and the dialog's own confirm button carry the
    // same label — the confirm button is the one rendered last.
    const confirmButtons = screen.getAllByRole('button', { name: 'moderatorDashboard.deleteCircle' })
    fireEvent.click(confirmButtons[confirmButtons.length - 1])

    await waitFor(() => {
      expect(deleteCircleMutate).toHaveBeenCalledTimes(1)
      expect(mockNavigate).toHaveBeenCalledWith('/circles', { replace: true })
    })
  })

  it('closes the dialog without deleting when Cancel is clicked', async () => {
    render(<ModeratorDashboardPage />)

    fireEvent.click(screen.getByRole('button', { name: 'moderatorDashboard.deleteCircle' }))

    expect(screen.getByText(/This will permanently delete/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(deleteCircleMutate).not.toHaveBeenCalled()

    // Headless UI's Dialog unmounts through a 150ms "leave" transition
    // (see ConfirmDialog.jsx) — the element is still present the instant
    // after the click, so this has to wait rather than assert synchronously.
    await waitFor(() => {
      expect(
        screen.queryByText(/This will permanently delete/)
      ).not.toBeInTheDocument()
    })
  })
})
