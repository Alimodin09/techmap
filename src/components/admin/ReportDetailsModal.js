'use client'

import { useState, useCallback, useEffect } from 'react'
import ReportMapPreview from '@/components/admin/ReportMapPreview'

/* ─── Fullscreen Image Lightbox ─────────────────────────────── */
function ImageLightbox({ src, alt, onClose }) {
  const [zoom, setZoom] = useState(1)

  const zoomIn = () => setZoom((z) => Math.min(z + 0.25, 4))
  const zoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5))
  const resetZoom = () => setZoom(1)

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === '+' || e.key === '=') zoomIn()
      if (e.key === '-') zoomOut()
      if (e.key === '0') resetZoom()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Toolbar */}
      <div
        className="absolute left-1/2 top-4 z-[100000] flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 shadow-2xl backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={zoomOut}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-lg font-bold text-white transition hover:bg-white/20"
          aria-label="Zoom out"
        >
          −
        </button>
        <span className="min-w-[56px] text-center text-sm font-semibold text-white/80">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={zoomIn}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-lg font-bold text-white transition hover:bg-white/20"
          aria-label="Zoom in"
        >
          +
        </button>
        <div className="mx-1 h-5 w-px bg-white/20" />
        <button
          type="button"
          onClick={resetZoom}
          className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/20"
        >
          Reset
        </button>
        <div className="mx-1 h-5 w-px bg-white/20" />
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-500"
          onClick={(e) => e.stopPropagation()}
        >
          Open Original
        </a>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-lg font-bold text-white transition hover:bg-rose-500"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Image */}
      <div
        className="flex max-h-[85vh] max-w-[90vw] items-center justify-center overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="rounded-xl shadow-2xl transition-transform duration-200"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          draggable={false}
        />
      </div>

      {/* Hint text */}
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/40">
        Press <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-white/60">Esc</kbd> to close · 
        <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-white/60">+</kbd> / 
        <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-white/60">−</kbd> to zoom
      </p>
    </div>
  )
}

export default function ReportDetailsModal({ report, reportState, onArchive, onDelete, onRestore, onClose }) {
  const [lightboxOpen, setLightboxOpen] = useState(false)

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

  function getPriorityBadgeClass(priority) {
    if (priority === 'Low') return 'bg-emerald-100 text-emerald-700 ring-emerald-200'
    if (priority === 'High') return 'bg-orange-100 text-orange-700 ring-orange-200'
    if (priority === 'Critical') return 'bg-rose-100 text-rose-700 ring-rose-200'
    return 'bg-sky-100 text-sky-700 ring-sky-200'
  }

  const detailCardClass = 'rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm'
  const detailLabelClass = 'text-xs font-semibold uppercase tracking-[0.18em] text-slate-400'
  const detailValueClass = 'mt-2 text-sm font-semibold text-slate-900 sm:text-base'

  // Resolve the image URL — try image_url first, then reconstruct from image_path
  const resolvedImageUrl = (() => {
    if (report.image_url) return report.image_url
    if (report.image_path) {
      // Reconstruct the public URL from the storage path
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      return `${supabaseUrl}/storage/v1/object/public/report-images/${report.image_path}`
    }
    return null
  })()

  return (
    <>
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
              {report.priority && (
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getPriorityBadgeClass(report.priority)}`}>
                  {report.priority}
                </span>
              )}
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
            <div className={detailCardClass}>
              <span className={detailLabelClass}>Issue Name</span>
              <p className={detailValueClass}>{report.name}</p>
            </div>
            <div className={detailCardClass}>
              <span className={detailLabelClass}>Reported By</span>
              <p className={detailValueClass}>{report.profiles?.full_name || 'Unknown'}</p>
            </div>
            <div className={detailCardClass}>
              <span className={detailLabelClass}>Category</span>
              <p className={detailValueClass}>{report.category || 'N/A'}</p>
            </div>
            <div className={detailCardClass}>
              <span className={detailLabelClass}>Issue Type</span>
              <p className={detailValueClass}>{report.issue_type}</p>
            </div>
            <div className={detailCardClass}>
              <span className={detailLabelClass}>Priority</span>
              <p className="mt-2">
                {report.priority ? (
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getPriorityBadgeClass(report.priority)}`}>
                    {report.priority}
                  </span>
                ) : (
                  <span className="text-sm text-slate-500">N/A</span>
                )}
              </p>
            </div>
            <div className={detailCardClass}>
              <span className={detailLabelClass}>Department / Area</span>
              <p className={detailValueClass}>{report.department_area || 'N/A'}</p>
            </div>
            <div className={detailCardClass}>
              <span className={detailLabelClass}>Specific Location</span>
              <p className={detailValueClass}>{report.room_lab_number}</p>
            </div>
            <div className={detailCardClass}>
              <span className={detailLabelClass}>Status</span>
              <p className="mt-2">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusBadgeClass}`}>
                  {report.status}
                </span>
              </p>
            </div>
            <div className={detailCardClass}>
              <span className={detailLabelClass}>Report State</span>
              <p className="mt-2">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${stateBadgeClass}`}>
                  {reportState}
                </span>
              </p>
            </div>
            <div className={detailCardClass}>
              <span className={detailLabelClass}>Date Submitted</span>
              <p className={detailValueClass}>{submittedDate}</p>
            </div>
            <div className={detailCardClass}>
              <span className={detailLabelClass}>Updated Date</span>
              <p className={detailValueClass}>{updatedDate}</p>
            </div>
            <div className={detailCardClass}>
              <span className={detailLabelClass}>Latitude</span>
              <p className={detailValueClass}>{typeof report.latitude === 'number' ? report.latitude : 'N/A'}</p>
            </div>
            <div className={detailCardClass}>
              <span className={detailLabelClass}>Longitude</span>
              <p className={detailValueClass}>{typeof report.longitude === 'number' ? report.longitude : 'N/A'}</p>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Description</h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700 sm:text-base">
              {report.description}
            </p>
          </div>

          {/* Attached Image */}
          <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Attached Image
            </h3>
            <div className="mt-4">
              {resolvedImageUrl ? (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    className="group relative block cursor-zoom-in overflow-hidden rounded-2xl border border-slate-200 shadow-sm transition hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-sky-200"
                  >
                    <img
                      src={resolvedImageUrl}
                      alt="Report attachment"
                      className="max-h-80 w-auto object-contain transition duration-200 group-hover:scale-[1.02]"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/0 transition duration-200 group-hover:bg-slate-900/30">
                      <span className="flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800 opacity-0 shadow-lg backdrop-blur transition duration-200 group-hover:opacity-100">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                        Click to view full size
                      </span>
                    </div>
                  </button>
                  <div className="flex items-center gap-3">
                    <p className="text-xs font-medium text-slate-500 sm:text-sm">
                      Click the image to zoom in, or{' '}
                      <a
                        href={resolvedImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-600 underline hover:text-sky-500"
                      >
                        open in new tab ↗
                      </a>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                  <svg className="h-8 w-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <p className="text-sm text-slate-400">No image attached to this report</p>
                </div>
              )}
            </div>
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

      {/* Fullscreen Image Lightbox */}
      {lightboxOpen && resolvedImageUrl && (
        <ImageLightbox
          src={resolvedImageUrl}
          alt={`Attachment for report: ${report.name}`}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  )
}
