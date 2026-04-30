import { createClient } from '@/utils/supabase/server'
import type { IssueReport, ReportStatus } from '@/types/user'

function getStatusBadgeClass(status: ReportStatus) {
  if (status === 'Resolved') return 'bg-emerald-100 text-emerald-700'
  if (status === 'Ongoing') return 'bg-amber-100 text-amber-700'
  return 'bg-rose-100 text-rose-700'
}

function getPriorityBadgeClass(priority: string | null | undefined) {
  if (priority === 'Low') return 'bg-emerald-100 text-emerald-700'
  if (priority === 'High') return 'bg-orange-100 text-orange-700'
  if (priority === 'Critical') return 'bg-rose-100 text-rose-700'
  return 'bg-sky-100 text-sky-700' // Medium or default
}

export default async function MyReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('issue_reports')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const reports = (data || null) as IssueReport[] | null

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 sm:space-y-6">
      <section className="rounded-xl bg-slate-900 px-4 py-6 text-white shadow-soft sm:rounded-3xl sm:px-6 sm:py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300 sm:text-sm">My Reports</p>
        <h1 className="mt-2 text-2xl font-semibold text-white sm:mt-3 sm:text-3xl md:text-4xl">My Submitted Reports</h1>
        <p className="mt-2 max-w-2xl text-xs text-slate-300 sm:mt-3 sm:text-sm md:text-base">Review the reports you have submitted and check their current status.</p>
      </section>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm">
          Error loading reports: {error.message}
        </div>
      )}

      {!reports || reports.length === 0 ? (
        <div className="rounded-xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200 sm:rounded-3xl sm:p-8">
          <p className="text-xs text-slate-600 sm:text-sm">You haven&apos;t submitted any reports yet.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <div key={report.id} className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:rounded-2xl sm:p-5 md:rounded-3xl md:p-6">
              {/* Header: name + status & priority badges */}
              <div className="flex items-start justify-between gap-2 sm:gap-3">
                <h3 className="text-sm font-semibold text-slate-900 sm:text-base lg:text-lg">
                  {report.name}
                </h3>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold sm:px-3 sm:py-1 ${getStatusBadgeClass(
                      report.status
                    )}`}
                  >
                    {report.status}
                  </span>
                  {report.priority && (
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold sm:px-2.5 sm:py-0.5 sm:text-xs ${getPriorityBadgeClass(
                        report.priority
                      )}`}
                    >
                      {report.priority}
                    </span>
                  )}
                </div>
              </div>

              {/* Image thumbnail */}
              {report.image_url && (
                <div className="mt-3 sm:mt-4">
                  <img
                    src={report.image_url}
                    alt="Report attachment"
                    className="h-28 w-full rounded-lg border border-slate-200 object-cover sm:h-36 sm:rounded-xl"
                  />
                </div>
              )}

              {/* Details */}
              <div className="mt-3 space-y-1 text-xs leading-5 text-slate-600 sm:mt-4 sm:text-sm sm:leading-6">
                {report.category && (
                  <div>
                    <span className="font-semibold text-slate-700">Category:</span> {report.category}
                  </div>
                )}
                <div>
                  <span className="font-semibold text-slate-700">Type:</span> {report.issue_type}
                </div>
                {report.department_area && (
                  <div>
                    <span className="font-semibold text-slate-700">Dept / Area:</span> {report.department_area}
                  </div>
                )}
                <div>
                  <span className="font-semibold text-slate-700">Location:</span> {report.room_lab_number}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Submitted:</span>{' '}
                  {new Date(report.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Description */}
              <p className="mt-3 text-xs leading-5 text-slate-700 sm:mt-4 sm:text-sm sm:leading-6">
                {report.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
