export default function AddToHomeBanner({ onAdd, onClose, isIOS }) {
  return (
    <div className="fixed bottom-20 left-4 right-4 z-50">
      <div className="bg-white rounded-2xl shadow-lg p-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-gray-900">
            Add MatchorPass to Home Screen
          </p>

          {isIOS ? (
            <p className="text-sm text-gray-500">
              Tap the Share button and select "Add to Home Screen"
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              Faster access and full-screen experience
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-gray-500"
          >
            Later
          </button>

          {!isIOS && (
            <button
              onClick={onAdd}
              className="px-4 py-1.5 text-sm bg-primary text-white rounded-full"
            >
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
