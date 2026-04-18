'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function AccountSummary({ userId }) {
  const supabase = createClient()
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    ongoing: 0,
    resolved: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        // Total reports
        const { count: total } = await supabase
          .from('issue_reports')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)

        // Pending
        const { count: pending } = await supabase
          .from('issue_reports')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'Pending')

        // Ongoing
        const { count: ongoing } = await supabase
          .from('issue_reports')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'Ongoing')

        // Resolved
        const { count: resolved } = await supabase
          .from('issue_reports')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'Resolved')

        setStats({
          total: total || 0,
          pending: pending || 0,
          ongoing: ongoing || 0,
          resolved: resolved || 0,
        })
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [userId, supabase])

  if (loading) {
    return <div className="card"><p>Loading statistics...</p></div>
  }

  return (
    <div className="account-summary">
      <h3>Activity Summary</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Reports</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: 'var(--error-color)' }}>{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: 'var(--warning-color)' }}>{stats.ongoing}</div>
          <div className="stat-label">Ongoing</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: 'var(--success-color)' }}>{stats.resolved}</div>
          <div className="stat-label">Resolved</div>
        </div>
      </div>
    </div>
  )
}
