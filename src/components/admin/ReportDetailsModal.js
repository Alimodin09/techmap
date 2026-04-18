'use client'

import ReportMapPreview from '@/components/admin/ReportMapPreview'

export default function ReportDetailsModal({ report, reportState, onArchive, onDelete, onRestore, onClose }) {
  if (!report) return null

  const submittedDate = report.created_at
    ? new Date(report.created_at).toLocaleString()
    : 'Unknown'

  const updatedDate = report.updated_at
    ? new Date(report.updated_at).toLocaleString()
    : 'Not updated yet'

  const statusBadgeClass =
    report.status === 'Pending'
      ? 'bg-rose-100 text-rose-700 ring-rose-200'
      : report.status === 'Ongoing'
        ? 'bg-amber-100 text-amber-700 ring-amber-200'
        : 'bg-emerald-100 text-emerald-700 ring-emerald-200'

  const stateBadgeClass =
    reportState === 'active'
      ? 'bg-sky-100 text-sky-700 ring-sky-200'
      : reportState === 'archived'
        ? 'bg-amber-100 text-amber-700 ring-amber-200'
        : 'bg-slate-200 text-slate-700 ring-slate-300'

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Report details"
      onClick={onClose}
    >
      <div
        className="relative z-[10000] flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_28px_70px_rgba(15,23,42,0.24)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-5 py-4 sm:px-6 lg:px-8">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusBadgeClass}`}>
                {report.status}
              </span>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${stateBadgeClass}`}>
                {reportState}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Report Details</h2>
              <p className="mt-1 text-sm text-slate-500 sm:text-base">Review full report information and the map location in one view.</p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-4 focus:ring-sky-100"
            onClick={onClose}
            aria-label="Close details modal"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Issue Name</span>
              <p className="mt-2 text-sm font-semibold text-slate-900 sm:text-base">{report.name}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Reported By</span>
              <p className="mt-2 text-sm font-semibold text-slate-900 sm:text-base">{report.profiles?.full_name || 'Unknown'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Specific Location</span>
              <p className="mt-2 text-sm font-semibold text-slate-900 sm:text-base">{report.room_lab_number}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Issue Type</span>
              <p className="mt-2 text-sm font-semibold text-slate-900 sm:text-base">{report.issue_type}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Status</span>
              <p className="mt-2">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusBadgeClass}`}>
                  {report.status}
                </span>
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Report State</span>
              <p className="mt-2">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${stateBadgeClass}`}>
                  {reportState}
                </span>
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Date Submitted</span>
              <p className="mt-2 text-sm font-semibold text-slate-900 sm:text-base">{submittedDate}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Updated Date</span>
              <p className="mt-2 text-sm font-semibold text-slate-900 sm:text-base">{updatedDate}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Latitude</span>
              <p className="mt-2 text-sm font-semibold text-slate-900 sm:text-base">{typeof report.latitude === 'number' ? report.latitude : 'N/A'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Longitude</span>
              <p className="mt-2 text-sm font-semibold text-slate-900 sm:text-base">{typeof report.longitude === 'number' ? report.longitude : 'N/A'}</p>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Description</h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700 sm:text-base">
              {report.description}
            </p>
          </div>

          <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Location Map</h3>
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <ReportMapPreview report={report} />
            </div>
          </div>

          <div className="sticky bottom-0 mt-5 border-t border-slate-200 bg-white/95 px-0 py-4 backdrop-blur sm:mt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
              {reportState === 'active' && (
                <>
                  <button type="button" className="inline-flex items-center justify-center rounded-2xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-100" onClick={onArchive}>Archive</button>
                  <button type="button" className="inline-flex items-center justify-center rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-100" onClick={onDelete}>Delete</button>
                </>
              )}

              {reportState === 'archived' && (
                <>
                  <button type="button" className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" onClick={onRestore}>Restore</button>
                  <button type="button" className="inline-flex items-center justify-center rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-100" onClick={onDelete}>Delete</button>
                </>
              )}

              {reportState === 'deleted' && (
                <button type="button" className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" onClick={onRestore}>Restore</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
