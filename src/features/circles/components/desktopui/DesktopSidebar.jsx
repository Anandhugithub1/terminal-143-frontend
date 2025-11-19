export default function DesktopSidebar({ selectedCircle }) {
  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-border-clr">
        <h4 className="text-lg font-bold mb-4 text-gray-900">Circle Details</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border-clr">
            <span className="text-sm text-gray-500">Members</span>
            <span className="font-semibold">{selectedCircle?.memberCount || 0}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border-clr">
            <span className="text-sm text-gray-500">Online</span>
            <span className="font-semibold text-green-500">{selectedCircle?.onlineCount || 0}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border-clr">
            <span className="text-sm text-gray-500">Visibility</span>
            <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
              selectedCircle?.visibility === 'public' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-amber-100 text-amber-700'
            }`}>
              {selectedCircle?.visibility}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-border-clr">
        <h5 className="text-lg font-bold mb-4 text-gray-900">Quick Actions</h5>
        <div className="space-y-3">
          {["Invite Members", "Circle Settings", "Create Event", "Share Circle"].map((action, index) => (
            <button 
              key={action}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-border-clr text-sm font-medium transition-all duration-200 hover:shadow-md hover:border-primary group bg-white"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-gradient-primary to-gradient-secondary flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              {action}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
