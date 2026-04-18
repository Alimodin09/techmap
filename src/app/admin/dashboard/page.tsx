import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ArrowRight, AlertTriangle, Clock3, CircleCheckBig, LayoutDashboard, MapPinned, FileText } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch global stats
  const { count: totalPending } = await supabase
    .from('issue_reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Pending')

  const { count: totalOngoing } = await supabase
    .from('issue_reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Ongoing')

  const { count: totalResolved } = await supabase
    .from('issue_reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Resolved')

  // Fetch recent reports
  const { data: recentReports } = await supabase
    .from('issue_reports')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(5)

  const summaryCards = [
    {
      label: 'Total Pending',
      value: totalPending || 0,
      helper: 'Needs attention',
      icon: AlertTriangle,
      accent: 'from-rose-50 to-white border-rose-100 text-rose-600',
    },
    {
      label: 'Total Ongoing',
      value: totalOngoing || 0,
      helper: 'Currently in progress',
      icon: Clock3,
      accent: 'from-amber-50 to-white border-amber-100 text-amber-600',
    },
    {
      label: 'Total Resolved',
      value: totalResolved || 0,
      helper: 'Closed and completed',
      icon: CircleCheckBig,
      accent: 'from-emerald-50 to-white border-emerald-100 text-emerald-600',
    },
  ]

  const statHeader = (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Admin Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">System Overview</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
          Monitor reports, review updates, and keep campus issue handling organized.
        </p>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
        <LayoutDashboard className="h-4 w-4 text-sky-600" aria-hidden="true" />
        Active admin session
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-8">
        {statHeader}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => {
          const Icon = card.icon

          return (
            <div key={card.label} className={`rounded-[1.5rem] border bg-gradient-to-br p-6 shadow-sm ${card.accent}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.label}</p>
                  <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">{card.value}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 shadow-sm ring-1 ring-slate-200">
                  <Icon className={`h-5 w-5 ${card.accent.includes('rose') ? 'text-rose-600' : card.accent.includes('amber') ? 'text-amber-600' : 'text-emerald-600'}`} aria-hidden="true" />
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-600">{card.helper}</p>
            </div>
          )
        })}
      </section>

      <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Recent Activity</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Recent Reports</h2>
            <p className="mt-2 text-sm text-slate-500">Latest reports submitted by users across the system.</p>
          </div>
          <Link href="/admin/reports" className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200">
            View All Reports
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {recentReports && recentReports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/80">
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <th className="px-6 py-4 sm:px-8">Issue</th>
                  <th className="px-6 py-4 sm:px-8">Location</th>
                  <th className="px-6 py-4 sm:px-8">Reporter</th>
                  <th className="px-6 py-4 sm:px-8">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentReports.map((report) => (
                  <tr key={report.id} className="transition hover:bg-slate-50/80">
                    <td className="px-6 py-4 sm:px-8">
                      <p className="font-medium text-slate-900">{report.name}</p>
                      <p className="mt-1 text-sm text-slate-500">Submitted by campus user</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 sm:px-8">{report.room_lab_number}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 sm:px-8">{report.profiles?.full_name || 'Unknown'}</td>
                    <td className="px-6 py-4 sm:px-8">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${report.status === 'Pending' ? 'bg-rose-100 text-rose-700' : report.status === 'Ongoing' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {report.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-10 text-center sm:px-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FileText className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No recent reports found</h3>
            <p className="mt-2 text-sm text-slate-500">When new reports arrive, they will appear here automatically.</p>
          </div>
        )}
      </section>
    </div>
  )
}
