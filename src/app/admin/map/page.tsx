'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/utils/supabase/client'

const MapComponent = dynamic(() => import('@/components/maps/DynamicMap'), {
  ssr: false,
  loading: () => <div style={{ height: '600px', background: '#e2e8f0' }}>Loading map...</div>
})

export default function AdminMapPage() {
  const [markers, setMarkers] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadReports() {
      const { data } = await supabase
        .from('issue_reports')
        .select('*, profiles(full_name)')

      if (data) {
        setMarkers(data.map(report => ({
          id: report.id,
          lat: report.latitude,
          lng: report.longitude,
          popupContent: (
            <div>
              <strong>{report.name}</strong><br/>
              Reporter: {report.profiles?.full_name || 'Unknown'}<br/>
              Status: {report.status}<br/>
              Room: {report.room_lab_number}
            </div>
          )
        })))
      }
      setLoading(false)
    }

    loadReports()
  }, [])

  return (
    <div>
      <h1>System Global Map</h1>
      <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>Visualizing the locations of all reported issues across the system.</p>
      
      {loading ? (
        <div style={{ height: '600px', background: '#f1f5f9' }}>Loading points...</div>
      ) : (
        <MapComponent 
          mode="multi" 
          markers={markers} 
          height="700px" 
        />
      )}
    </div>
  )
}
