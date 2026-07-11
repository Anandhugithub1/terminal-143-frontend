export default function ComingSoonScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-white">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
        <span className="text-3xl">💗</span>
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Pass or Match</h1>
      <p className="text-lg font-semibold text-gray-900 mb-2">Coming soon to your region</p>
      <p className="text-sm text-gray-500 max-w-xs">
        We're not available in your region yet, but we're working on it.
        Check back soon.
      </p>
    </div>
  )
}
