export default function DateDivider({ label }) {
  return (
    <div className="flex items-center justify-center py-2">
      <span className="px-3 py-1 rounded-full bg-gray-200/70 text-gray-500 text-[11px] font-medium">
        {label}
      </span>
    </div>
  )
}
