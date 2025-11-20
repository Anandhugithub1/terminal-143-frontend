export  const  HeaderSearch = ({ value, onChange, className = "" }) => (
  <div className={`relative ${className}`}>
    <svg
      className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M21 21l-4.35-4.35"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" />
    </svg>
    <input
      aria-label="Search circles, posts or tags"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search circles, posts, or tags..."
      className="w-full pl-12 pr-4 py-3 rounded-xl border border-border-clr transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus text-sm bg-white"
    />
  </div>
);