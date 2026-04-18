'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

export default function RecentReports({ userId }) {
  const supabase = createClient()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadReports() {
      try {
        const { data } = await supabase
          .from('issue_reports')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5)

        setReports(data || [])
      } finally {
        setLoading(false)
      }
    }

    loadReports()
  }, [userId, supabase])

  if (loading) {
    return <div className="card"><p>Loading reports...</p></div>
  }

  if (reports.length === 0) {
    return (
      <div className="card">
        <h3>Recent Reports</h3>
        <p style={{ color: '#64748b' }}>You haven't submitted any reports yet.</p>
      </div>
    )
  }

  return (
    <div className="recent-reports">
      <h3>Recent Reports</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {reports.map((report) => (
          <div key={report.id} className="report-item-mini">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
              <h4 style={{ margin: 0, flex: 1 }}>{report.name}</h4>
              <span className={`badge badge-${report.status.toLowerCase()}`}>{report.status}</span>
            </div>
            <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: '#64748b' }}>
              {report.room_lab_number} • {new Date(report.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
      <Link href="/my-reports" className="btn btn-secondary" style={{ marginTop: '1rem', display: 'inline-block' }}>
        View All Reports
      </Link>
    </div>
  )
}
