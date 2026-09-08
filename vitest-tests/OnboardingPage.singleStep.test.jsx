import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import OnboardingPage from '../src/features/Circles/pages/OnboardingPage'

// Real behavior under test: the registration circles-onboarding step used to
// have a second "confirm your choices" screen between selecting circles and
// completing the profile. That step is removed — selecting 3+ circles and
// clicking Continue should call onComplete directly, with no intermediate
// confirmation screen ever rendering.

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('react-i18next', () => ({
  initReactI18next: { type: '3rdParty', init: () => {} },
  useTranslation: () => ({
    t: (key, opts) => {
      if (key === 'onboarding.continueWithCount' && opts) return `Continue with ${opts.count} Circle${opts.plural || ''}`
      return key
    },
  }),
}))

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

vi.mock('../src/components/Layout/TopNavigation', () => ({ default: () => <div /> }))
vi.mock('../src/components/Layout/Navbar', () => ({ default: () => <div /> }))

const joinCircle = vi.fn().mockResolvedValue({})
vi.mock('../src/features/Circles/hooks/useMembership', () => ({
  useJoinCircle: () => ({ mutateAsync: joinCircle, isPending: false }),
}))

const fixtureCircles = [
  { id: 1, circleId: 'c1', name: 'Adventure', description: 'Chasing thrills', image: '', tags: ['travel'], category: 'Travel & Outdoor', icon: () => null, iconBg: 'bg-lime-50', iconColor: 'text-lime-600' },
  { id: 2, circleId: 'c2', name: 'World Food', description: 'Foodie stuff', image: '', tags: ['food'], category: 'Food & Beverages', icon: () => null, iconBg: 'bg-lime-50', iconColor: 'text-lime-600' },
  { id: 3, circleId: 'c3', name: 'Beauty Beast', description: 'Skincare talk', image: '', tags: ['beauty'], category: 'Beauty & Skin', icon: () => null, iconBg: 'bg-lime-50', iconColor: 'text-lime-600' },
  { id: 4, circleId: 'c4', name: 'Film Cafe', description: 'Movies & chill', image: '', tags: ['film'], category: 'Entertainment', icon: () => null, iconBg: 'bg-lime-50', iconColor: 'text-lime-600' },
]

vi.mock('../src/features/Circles/constants/onboardingCircles', () => ({
  useOnboardingCircles: () => fixtureCircles,
  onboardingCategories: ['All', 'Travel & Outdoor', 'Food & Beverages'],
}))

beforeEach(() => {
  vi.clearAllMocks()
  joinCircle.mockResolvedValue({})
})

describe('OnboardingPage single-step flow', () => {
  it('disables Continue below 3 selections and enables it at 3', () => {
    render(<OnboardingPage />)

    const continueBtn = screen.getByRole('button', { name: /Continue with 0 Circle/ })
    expect(continueBtn).toBeDisabled()

    fireEvent.click(screen.getByText('Adventure'))
    fireEvent.click(screen.getByText('World Food'))
    expect(screen.getByRole('button', { name: /Continue with 2 Circle/ })).toBeDisabled()

    fireEvent.click(screen.getByText('Beauty Beast'))
    expect(screen.getByRole('button', { name: /Continue with 3 Circle/ })).not.toBeDisabled()
  })

  it('never renders a confirm-your-choices screen, and Continue calls onComplete directly', async () => {
    const onComplete = vi.fn().mockResolvedValue()
    render(<OnboardingPage onComplete={onComplete} />)

    fireEvent.click(screen.getByText('Adventure'))
    fireEvent.click(screen.getByText('World Food'))
    fireEvent.click(screen.getByText('Beauty Beast'))

    fireEvent.click(screen.getByRole('button', { name: /Continue with 3 Circle/ }))

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(joinCircle).toHaveBeenCalledTimes(3))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/home', { state: { profileJustCompleted: true } }))

    // Regression guard: no "confirm your choices" / "your activity circles"
    // step-2 UI should ever appear.
    expect(screen.queryByText('onboarding.confirmHeading')).not.toBeInTheDocument()
    expect(screen.queryByText('onboarding.yourCircles')).not.toBeInTheDocument()
    expect(screen.queryByText('onboarding.whatToExpect')).not.toBeInTheDocument()
    expect(screen.queryByText('onboarding.addMoreCircles')).not.toBeInTheDocument()
  })

  it('joins circles and navigates to /circles when used standalone (no onComplete)', async () => {
    render(<OnboardingPage />)

    fireEvent.click(screen.getByText('Adventure'))
    fireEvent.click(screen.getByText('World Food'))
    fireEvent.click(screen.getByText('Beauty Beast'))
    fireEvent.click(screen.getByRole('button', { name: /Continue with 3 Circle/ }))

    await waitFor(() => expect(joinCircle).toHaveBeenCalledTimes(3))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/circles'))
  })
})
