'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import ReportDetailsModal from '@/components/admin/ReportDetailsModal'
import { Filter, LayoutGrid, RefreshCw, AlertTriangle, Clock3, CircleCheckBig, Search } from 'lucide-react'

export default function AdminReportsPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [stateFilter, setStateFilter] = useState('Active')
  const [selectedReport, setSelectedReport] = useState(null)
  const [actionError, setActionError] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const supabase = createClient()

  function formatSupabaseError(error, fallbackMessage) {
    if (!error) return fallbackMessage

    const code = error.code || error?.__isAuthError ? 'AUTH' : ''
    const message = error.message || fallbackMessage
    const details = error.details ? ` Details: ${error.details}` : ''
    const hint = error.hint ? ` Hint: ${error.hint}` : ''

    return `${code ? `[${code}] ` : ''}${message}${details}${hint}`
  }

  function getReportState(report) {
    if (report?.deleted_at) return 'deleted'
    if (report?.is_archived) return 'archived'
    return 'active'
  }

  async function loadReports() {
    setLoading(true)
    setActionError('')
    let query = supabase.from('issue_reports').select('*, profiles(full_name)').order('created_at', { ascending: false })

    if (statusFilter !== 'All') {
      query = query.eq('status', statusFilter)
    }
    if (typeFilter !== 'All') {
      query = query.eq('issue_type', typeFilter)
    }
    if (stateFilter === 'Active') {
      query = query.eq('is_archived', false).is('deleted_at', null)
    }
    if (stateFilter === 'Archived') {
      query = query.eq('is_archived', true).is('deleted_at', null)
    }
    if (stateFilter === 'Deleted') {
      query = query.not('deleted_at', 'is', null)
    }

    const { data } = await query
    if (data) setReports(data)
    setLoading(false)
  }

  useEffect(() => {
    loadReports()
  }, [statusFilter, typeFilter, stateFilter])

  async function updateStatus(id, newStatus) {
    setActionError('')
    try {
      const { error } = await supabase
        .from('issue_reports')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) {
        const debugMessage = formatSupabaseError(error, 'Failed to update report status.')
        console.warn('Failed to update status:', debugMessage)
        setActionError(debugMessage)
        return
      }

      loadReports()
    } catch (err) {
      const debugMessage = formatSupabaseError(err, 'Unexpected error while updating status.')
      console.warn('Unexpected status update error:', debugMessage)
      setActionError(debugMessage)
    }
  }

  async function updateReportState(report, action) {
    setActionError('')
    setActionLoadingId(report.id)

    const now = new Date().toISOString()
    let payload = { updated_at: now }

    if (action === 'archive') {
      payload = {
        ...payload,
        is_archived: true,
        archived_at: now,
        deleted_at: null,
      }
    }

    if (action === 'delete') {
      payload = {
        ...payload,
        deleted_at: now,
      }
    }

    if (action === 'restore') {
      payload = {
        ...payload,
        is_archived: false,
        archived_at: null,
        deleted_at: null,
      }
    }

    try {
      const { error } = await supabase
        .from('issue_reports')
        .update(payload)
        .eq('id', report.id)
        .select('id')
        .maybeSingle()

      if (error) {
        const debugMessage = formatSupabaseError(error, `Failed to ${action} report.`)
        console.warn(`Failed to ${action} report:`, {
          reportId: report.id,
          action,
          payload,
          debugMessage,
        })
        setActionError(debugMessage)
        setActionLoadingId(null)
        return
      }

      const { data: verifyData, error: verifyError } = await supabase
        .from('issue_reports')
        .select('id, is_archived, archived_at, deleted_at')
        .eq('id', report.id)
        .maybeSingle()

      if (verifyError) {
        const debugMessage = formatSupabaseError(verifyError, 'Action succeeded but verification failed.')
        console.warn('Failed to verify report state update:', debugMessage)
        setActionError(debugMessage)
        setActionLoadingId(null)
        return
      }

      if (!verifyData) {
        setActionError('No row was updated. This is usually an RLS/policy issue. Check admin update policy.')
        setActionLoadingId(null)
        return
      }

      if (selectedReport?.id === report.id) {
        setSelectedReport({ ...selectedReport, ...payload })
      }

      setActionLoadingId(null)
      loadReports()
    } catch (err) {
      const debugMessage = formatSupabaseError(err, `Unexpected error while trying to ${action} report.`)
      console.warn(`Unexpected ${action} error:`, debugMessage)
      setActionError(debugMessage)
      setActionLoadingId(null)
    }
  }

  function renderActionButtons(report) {
    const state = getReportState(report)

    if (state === 'active') {
      return (
        <>
          <button
            type="button"
            className="btn admin-btn-archive"
            disabled={actionLoadingId === report.id}
            onClick={() => updateReportState(report, 'archive')}
          >
            {actionLoadingId === report.id ? 'Working...' : 'Archive'}
          </button>
          <button
            type="button"
            className="btn admin-btn-delete"
            disabled={actionLoadingId === report.id}
            onClick={() => updateReportState(report, 'delete')}
          >
            {actionLoadingId === report.id ? 'Working...' : 'Delete'}
          </button>
        </>
      )
    }

    if (state === 'archived') {
      return (
        <>
          <button
            type="button"
            className="btn admin-btn-restore"
            disabled={actionLoadingId === report.id}
            onClick={() => updateReportState(report, 'restore')}
          >
            {actionLoadingId === report.id ? 'Working...' : 'Restore'}
          </button>
          <button
            type="button"
            className="btn admin-btn-delete"
            disabled={actionLoadingId === report.id}
            onClick={() => updateReportState(report, 'delete')}
          >
            {actionLoadingId === report.id ? 'Working...' : 'Delete'}
          </button>
        </>
      )
    }

    return (
      <button
        type="button"
        className="btn admin-btn-restore"
        disabled={actionLoadingId === report.id}
        onClick={() => updateReportState(report, 'restore')}
      >
        {actionLoadingId === report.id ? 'Working...' : 'Restore'}
      </button>
    )
  }

  function getStatusBadgeClass(status) {
    if (status === 'Pending') return 'bg-rose-100 text-rose-700 ring-rose-200'
    if (status === 'Ongoing') return 'bg-amber-100 text-amber-700 ring-amber-200'
    return 'bg-emerald-100 text-emerald-700 ring-emerald-200'
  }

  function getStateBadgeClass(state) {
    if (state === 'active') return 'bg-sky-100 text-sky-700 ring-sky-200'
    if (state === 'archived') return 'bg-amber-100 text-amber-700 ring-amber-200'
    return 'bg-slate-200 text-slate-700 ring-slate-300'
  }

  const stateCounts = reports.reduce(
    (counts, report) => {
      const state = getReportState(report)
      counts[state] += 1
      return counts
    },
    { active: 0, archived: 0, deleted: 0 }
  )

  const statusCards = [
    { label: 'Pending', count: reports.filter((report) => report.status === 'Pending').length, icon: AlertTriangle },
    { label: 'Ongoing', count: reports.filter((report) => report.status === 'Ongoing').length, icon: Clock3 },
    { label: 'Resolved', count: reports.filter((report) => report.status === 'Resolved').length, icon: CircleCheckBig },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Admin Reports</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">All Reports</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
              Review all submitted issues, update statuses, and manage report lifecycle actions.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {statusCards.map((card) => {
              const Icon = card.icon

              return (
                <div key={card.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{card.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">{card.count}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                      <Icon className="h-4 w-4 text-sky-600" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-6 grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[1fr_auto_auto_auto]">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
            <Filter className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <span>Filter reports by state, type, and status</span>
          </div>

          <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="form-select min-w-[140px] rounded-2xl border-slate-300 bg-white px-4 py-3 text-sm shadow-sm transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100">
            <option value="Active">Active</option>
            <option value="Archived">Archived</option>
            <option value="Deleted">Deleted</option>
            <option value="All">All</option>
          </select>

          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="form-select min-w-[160px] rounded-2xl border-slate-300 bg-white px-4 py-3 text-sm shadow-sm transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100">
            <option value="All">All Types</option>
            <option value="Computer Setup">Computer Setup</option>
            <option value="Projector">Projector</option>
            <option value="WiFi / Network">WiFi / Network</option>
            <option value="Printer">Printer</option>
            <option value="Other">Other</option>
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-select min-w-[150px] rounded-2xl border-slate-300 bg-white px-4 py-3 text-sm shadow-sm transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100">
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </section>

      {actionError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
          {actionError}
        </div>
      )}

      {loading ? (
        <div className="rounded-[1.75rem] border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
            <RefreshCw className="h-5 w-5 animate-spin" aria-hidden="true" />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-600">Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-[1.75rem] border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Search className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">No reports found</h2>
          <p className="mt-2 text-sm text-slate-500">Try adjusting the filters to view archived or deleted reports.</p>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
          {reports.map((report) => (
            <div key={report.id} className="flex h-full flex-col rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStateBadgeClass(getReportState(report))}`}>
                      {getReportState(report)}
                    </span>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusBadgeClass(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">{report.name}</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Reported by {report.profiles?.full_name || 'Unknown'} • {new Date(report.created_at).toLocaleDateString()}
                  </p>
                </div>
                <select
                  className="form-select min-w-[120px] rounded-xl border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                  value={report.status}
                  onChange={(e) => updateStatus(report.id, e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Location</p>
                  <p className="mt-1 font-medium text-slate-900">{report.room_lab_number}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Type</p>
                  <p className="mt-1 font-medium text-slate-900">{report.issue_type}</p>
                </div>
              </div>

              <p className="mt-4 flex-1 text-sm leading-6 text-slate-600">
                {report.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-200"
                  onClick={() => setSelectedReport(report)}
                >
                  View Details
                </button>
                {renderActionButtons(report)}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedReport && (
        <ReportDetailsModal
          report={selectedReport}
          reportState={getReportState(selectedReport)}
          onArchive={() => updateReportState(selectedReport, 'archive')}
          onDelete={() => updateReportState(selectedReport, 'delete')}
          onRestore={() => updateReportState(selectedReport, 'restore')}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  )
}
