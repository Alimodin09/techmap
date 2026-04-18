import { createClient } from '@/utils/supabase/server'
import type { IssueReport, ReportStatus } from '@/types/user'

function getStatusBadgeClass(status: ReportStatus) {
  if (status === 'Resolved') return 'bg-emerald-100 text-emerald-700'
  if (status === 'Ongoing') return 'bg-amber-100 text-amber-700'
  return 'bg-rose-100 text-rose-700'
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
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-3xl bg-slate-900 px-6 py-8 text-white shadow-soft sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">My Reports</p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">My Submitted Reports</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">Review the reports you have submitted and check their current status.</p>
      </section>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">Error loading reports: {error.message}</div>}

      {!reports || reports.length === 0 ? (
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-600">You haven&apos;t submitted any reports yet.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {reports.map((report) => (
            <div key={report.id} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-900">{report.name}</h3>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(report.status)}`}>{report.status}</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                <span className="font-semibold text-slate-700">Room:</span> {report.room_lab_number}<br />
                <span className="font-semibold text-slate-700">Type:</span> {report.issue_type}<br />
                <span className="font-semibold text-slate-700">Submitted:</span> {new Date(report.created_at).toLocaleDateString()}
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-700">{report.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
