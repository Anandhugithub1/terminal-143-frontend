import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CirclesHomePage from '../src/features/Circles/pages/CirclesHomePage'

// Real behavior under test: PostCard's "Report Post" menu item calls
// onReport?.() — CirclesHomePage never passed an onReport prop, so tapping
// Report on a post in the circles home feed silently did nothing. This
// mirrors CircleDetailsPage.jsx's already-working report-post wiring
// (same ReportUserModal + useReportUser hook) onto the home feed.

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Navigate: () => null,
}))

vi.mock('react-i18next', () => ({
  initReactI18next: { type: '3rdParty', init: () => {} },
  useTranslation: () => ({ t: (key) => key }),
}))

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }) => <>{children}</>,
  motion: new Proxy({}, { get: () => ({ children, ...rest }) => <div {...rest}>{children}</div> }),
}))

vi.mock('../src/components/Layout/BottomNavigation', () => ({ default: () => null }))
vi.mock('../src/components/Layout/TopNavigation', () => ({ default: () => null }))
vi.mock('../src/features/Circles/components/circle/CreateCircleModal', () => ({ default: () => null }))
vi.mock('../src/features/Circles/components/post/CreatePostModal', () => ({ default: () => null }))
vi.mock('../src/features/Circles/components/comment/CommentSection', () => ({ default: () => null }))
vi.mock('../src/features/Circles/components/post/EditPostModal', () => ({ default: () => null }))
vi.mock('../src/features/Circles/components/common/ConfirmDialog', () => ({ default: () => null }))
vi.mock('../src/features/Circles/components/circle/CircleSearchBar', () => ({ default: () => null }))

const post = {
  postId: 'p1',
  circleId: 'c1',
  circleName: 'Hikers',
  authorId: 'other-user',
  authorImage: '',
  content: 'Hello world',
  media: [],
  tags: [],
  createdAtEpoch: 1,
}

vi.mock('../src/features/Circles/hooks/useCircles', () => ({
  useCircles: () => ({
    data: { circles: [{ circleId: 'c1', name: 'Hikers' }] },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}))

vi.mock('../src/features/Circles/constants/onboardingCircles', () => ({
  useTranslatedCircleName: () => (id, name) => name || id,
}))

vi.mock('../src/features/Circles/hooks/usePosts', () => ({
  useFeed: () => ({ data: { posts: [post] }, isLoading: false }),
  useUpdateFeedPost: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteFeedPost: () => ({ mutate: vi.fn(), isPending: false }),
}))

vi.mock('../src/features/Circles/api/postsApi', () => ({
  listPosts: vi.fn().mockResolvedValue({ data: { items: [] } }),
}))

vi.mock('../src/features/Circles/hooks/useSeenTracker', () => ({
  useSeenTracker: () => vi.fn(),
}))

vi.mock('../src/features/UserProfile/Hooks/useMyProfile', () => ({
  useMyProfile: () => ({ data: { username: 'USER#me', location: null } }),
}))

const reportUser = vi.fn()
vi.mock('../src/features/UserHome/api', () => ({
  useMatches: () => ({ data: [] }),
  useReportUser: () => ({ mutate: reportUser }),
}))

vi.mock('../src/Hooks/sendMatchRequest', () => ({
  useSendMatchRequest: () => ({ send: vi.fn() }),
}))

beforeEach(() => {
  vi.clearAllMocks()
  // PostSeenObserver (wraps each feed PostCard) uses IntersectionObserver,
  // which jsdom doesn't implement.
  global.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <CirclesHomePage />
    </QueryClientProvider>
  )
}

describe('CirclesHomePage report post', () => {
  it('opens the report modal and submits via useReportUser when Report is tapped on another user\'s post', async () => {
    renderPage()

    // Open the post's "more" menu, then tap Report.
    fireEvent.click(screen.getAllByLabelText('postCard.moreOptions')[0])
    fireEvent.click(await screen.findByText('postCard.reportPost'))

    // ReportUserModal is now open — pick a reason and submit.
    fireEvent.click(await screen.findByText('Spam'))
    fireEvent.click(screen.getByText('Submit Report'))

    await waitFor(() => expect(reportUser).toHaveBeenCalledTimes(1))
    expect(reportUser).toHaveBeenCalledWith(
      expect.objectContaining({
        reportedUsername: 'other-user',
        reason: 'spam',
        sourceType: 'POST',
        sourceService: 'circle-service',
        sourceId: 'p1',
        circleId: 'c1',
      })
    )
  })
})
