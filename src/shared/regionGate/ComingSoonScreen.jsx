import ReactCountryFlag from 'react-country-flag'

export default function ComingSoonScreen() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center text-center px-6 bg-white">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
        <span className="text-3xl">💗</span>
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Pass or Match</h1>
      <p className="text-lg font-semibold text-gray-900 mb-2">Coming soon to your region</p>
      <p className="text-sm text-gray-500 max-w-xs">
        We're not available in your region yet, but we're working on it.
        Check back soon.
      </p>

      <div className="mt-8 text-sm text-gray-500">
        <p className="font-medium">Our app is available across Southeast Asia</p>

        <div className="mt-2 flex justify-center items-center gap-3">
          <ReactCountryFlag svg countryCode="TH" title="Thailand" style={{ width: '1.6em', height: '1.6em' }} />
          <ReactCountryFlag svg countryCode="PH" title="Philippines" style={{ width: '1.6em', height: '1.6em' }} />
          <ReactCountryFlag svg countryCode="ID" title="Indonesia" style={{ width: '1.6em', height: '1.6em' }} />
          <ReactCountryFlag svg countryCode="KH" title="Cambodia" style={{ width: '1.6em', height: '1.6em' }} />
          <ReactCountryFlag svg countryCode="VN" title="Vietnam" style={{ width: '1.6em', height: '1.6em' }} />
          <ReactCountryFlag svg countryCode="MY" title="Malaysia" style={{ width: '1.6em', height: '1.6em' }} />
        </div>

        <p className="mt-2 text-xs text-gray-400 max-w-xs">
          Now available in Thailand, Philippines, Indonesia, Cambodia, Vietnam, Malaysia — and more SEA countries
        </p>
      </div>
    </div>
  )
}
