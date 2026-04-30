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
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [departmentFilter, setDepartmentFilter] = useState('All')
  const [selectedReport, setSelectedReport] = useState(null)
  const [actionError, setActionError] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const supabase = createClient()

  // Resolve image URL — try image_url first, reconstruct from image_path as fallback
  function getReportImageUrl(report) {
    if (report.image_url) return report.image_url
    if (report.image_path) {
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/report-images/${report.image_path}`
    }
    return null
  }

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
    if (categoryFilter !== 'All') {
      query = query.eq('category', categoryFilter)
    }
    if (priorityFilter !== 'All') {
      query = query.eq('priority', priorityFilter)
    }
    if (departmentFilter !== 'All') {
      query = query.eq('department_area', departmentFilter)
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
  }, [statusFilter, typeFilter, stateFilter, categoryFilter, priorityFilter, departmentFilter])

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

  function getPriorityBadgeClass(priority) {
    if (priority === 'Low') return 'bg-emerald-100 text-emerald-700 ring-emerald-200'
    if (priority === 'High') return 'bg-orange-100 text-orange-700 ring-orange-200'
    if (priority === 'Critical') return 'bg-rose-100 text-rose-700 ring-rose-200'
    return 'bg-sky-100 text-sky-700 ring-sky-200' // Medium or default
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

  const filterSelectClass = 'form-select min-w-[140px] rounded-2xl border-slate-300 bg-white px-4 py-3 text-sm shadow-sm transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100'

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

        {/* ── Filters ─────────────────────────────────────────── */}
        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
            <Filter className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <span>Filter reports by state, category, priority, department, type, and status</span>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className={filterSelectClass}>
              <option value="Active">Active</option>
              <option value="Archived">Archived</option>
              <option value="Deleted">Deleted</option>
              <option value="All">All States</option>
            </select>

            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={filterSelectClass}>
              <option value="All">All Categories</option>
              <option value="Equipment">Equipment</option>
              <option value="Network">Network</option>
              <option value="Software">Software</option>
              <option value="Electrical">Electrical</option>
              <option value="Facility">Facility</option>
              <option value="Other">Other</option>
            </select>

            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className={filterSelectClass}>
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>

            <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className={filterSelectClass}>
              <option value="All">All Departments</option>
              <option value="IT Department">IT Department</option>
              <option value="Computer Laboratory">Computer Laboratory</option>
              <option value="Admin Office">Admin Office</option>
              <option value="Library">Library</option>
              <option value="Hallway">Hallway</option>
              <option value="Other">Other</option>
            </select>

            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={filterSelectClass}>
              <option value="All">All Types</option>
              <option value="Computer Setup">Computer Setup</option>
              <option value="Projector">Projector</option>
              <option value="WiFi / Network">WiFi / Network</option>
              <option value="Printer">Printer</option>
              <option value="Other">Other</option>
            </select>

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={filterSelectClass}>
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
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
                    {report.priority && (
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getPriorityBadgeClass(report.priority)}`}>
                        {report.priority}
                      </span>
                    )}
                    {getReportImageUrl(report) && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700 ring-1 ring-violet-200">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        Image
                      </span>
                    )}
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

              {/* Image thumbnail */}
              {getReportImageUrl(report) && (
                <div className="group/img relative mt-4 cursor-pointer overflow-hidden rounded-xl border border-slate-200" onClick={() => setSelectedReport(report)}>
                  <img
                    src={getReportImageUrl(report)}
                    alt="Report attachment"
                    className="h-36 w-full object-cover transition duration-200 group-hover/img:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/0 transition duration-200 group-hover/img:bg-slate-900/30">
                    <span className="flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 opacity-0 shadow transition duration-200 group-hover/img:opacity-100">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                      View Image
                    </span>
                  </div>
                  {/* Camera badge */}
                  <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 shadow-sm backdrop-blur">
                    <svg className="h-3.5 w-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                </div>
              )}

              <div className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Location</p>
                  <p className="mt-1 font-medium text-slate-900">{report.room_lab_number}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Type</p>
                  <p className="mt-1 font-medium text-slate-900">{report.issue_type}</p>
                </div>
                {report.category && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Category</p>
                    <p className="mt-1 font-medium text-slate-900">{report.category}</p>
                  </div>
                )}
                {report.department_area && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Department / Area</p>
                    <p className="mt-1 font-medium text-slate-900">{report.department_area}</p>
                  </div>
                )}
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
