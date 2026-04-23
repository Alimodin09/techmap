'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/utils/supabase/client'
import type { IssueReport, MapMarkerData } from '@/types/user'

const MapComponent = dynamic(() => import('@/components/maps/DynamicMap'), {
  ssr: false,
  loading: () => <div style={{ height: '600px', background: '#e2e8f0' }}>Loading map...</div>,
})

export default function UserMapViewPage() {
  const [markers, setMarkers] = useState<MapMarkerData[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadReports() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('issue_reports')
        .select('*')
        .eq('user_id', user.id)

      const reports = (data || []) as IssueReport[]

      setMarkers(
        reports.map((report) => ({
          id: report.id,
          lat: report.latitude,
          lng: report.longitude,
          popupContent: (
            <div>
              <strong>{report.name}</strong><br />
              Status: {report.status}<br />
              Room: {report.room_lab_number}
            </div>
          ),
        }))
      )

      setLoading(false)
    }

    loadReports()
  }, [supabase])

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 sm:space-y-6">
      <section className="rounded-xl bg-slate-900 px-4 py-6 text-white shadow-soft sm:rounded-3xl sm:px-6 sm:py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300 sm:text-sm">Map View</p>
        <h1 className="mt-2 text-2xl font-semibold text-white sm:mt-3 sm:text-3xl md:text-4xl">My Reports on Map</h1>
        <p className="mt-2 max-w-2xl text-xs text-slate-300 sm:mt-3 sm:text-sm md:text-base">Visualizing the locations of all your reported issues.</p>
      </section>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-500 shadow-sm sm:h-96 sm:rounded-2xl md:h-[600px]">
          Loading points...
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white p-2 shadow-sm ring-1 ring-slate-200 sm:rounded-2xl sm:p-3 md:rounded-3xl">
          <MapComponent
            mode="multi"
            markers={markers}
            height="300px"
          />
        </div>
      )}
    </div>
  )
}
