export default function EmptyState({ icon: Icon, title, subtitle, action, className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}>
      {Icon && (
        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-gray-400" />
        </div>
      )}
      <p className="text-gray-800 font-semibold text-sm mb-1">{title}</p>
      {subtitle && (
        <p className="text-gray-400 text-xs leading-relaxed mb-5">{subtitle}</p>
      )}
      {action}
    </div>
  );
}
