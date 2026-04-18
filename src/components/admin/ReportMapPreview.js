'use client'

import dynamic from 'next/dynamic'

const DynamicMap = dynamic(() => import('@/components/maps/DynamicMap'), {
  ssr: false,
  loading: () => (
    <div className="admin-map-loading">
      Loading map preview...
    </div>
  ),
})

export default function ReportMapPreview({ report }) {
  const hasCoordinates =
    typeof report?.latitude === 'number' &&
    typeof report?.longitude === 'number'

  if (!hasCoordinates) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 text-center">
        <p className="text-sm text-slate-500">Location coordinates are not available for this report.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <DynamicMap
        mode="multi"
        markers={[
          {
            id: report.id,
            lat: report.latitude,
            lng: report.longitude,
            popupContent: (
              <div>
                <strong>{report.name}</strong>
                <br />
                Location: {report.room_lab_number}
              </div>
            ),
          },
        ]}
        center={{ lat: report.latitude, lng: report.longitude }}
        zoom={17}
        height="280px"
      />
      <p className="text-xs font-medium text-slate-500 sm:text-sm">
        Coordinates: {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
      </p>
    </div>
  )
}
