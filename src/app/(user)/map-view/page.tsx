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
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-3xl bg-slate-900 px-6 py-8 text-white shadow-soft sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">Map View</p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">My Reports on Map</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">Visualizing the locations of all your reported issues.</p>
      </section>

      {loading ? (
        <div className="flex h-[600px] items-center justify-center rounded-3xl border border-slate-200 bg-white text-sm font-medium text-slate-500 shadow-sm">Loading points...</div>
      ) : (
        <div className="rounded-3xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
          <MapComponent
            mode="multi"
            markers={markers}
            height="600px"
          />
        </div>
      )}
    </div>
  )
}
