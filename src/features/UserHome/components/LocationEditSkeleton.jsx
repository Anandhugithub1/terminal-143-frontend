import React from "react"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"

const LocationEditSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <Skeleton circle width={32} height={32} />
          <div className="flex-1">
            <Skeleton height={20} width={160} />
            <Skeleton height={14} width={220} className="mt-2" />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 max-w-2xl mx-auto w-full">
        {/* Search card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-4">
          <Skeleton height={18} width={200} />
          <Skeleton height={14} width={260} className="mt-2 mb-6" />
          <Skeleton height={48} borderRadius={12} />
        </div>

        {/* Selected location card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <Skeleton height={16} width={160} className="mb-4" />
          <div className="p-4 rounded-xl bg-gray-100">
            <div className="flex items-center gap-3">
              <Skeleton circle width={32} height={32} />
              <Skeleton height={20} width={240} />
            </div>
          </div>
        </div>

        {/* Pro tip */}
        <div className="mt-4 rounded-xl p-4 border border-gray-200 bg-gray-100">
          <Skeleton height={16} width="80%" />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Skeleton height={48} borderRadius={12} className="flex-1" />
          <Skeleton height={48} borderRadius={12} className="flex-1" />
        </div>
      </div>
    </div>
  )
}

export default LocationEditSkeleton
