import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function UserDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  // Fetch quick stats
  const { count: pendingCount } = await supabase
    .from('issue_reports')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'Pending')

  const { count: ongoingCount } = await supabase
    .from('issue_reports')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'Ongoing')

  const { count: resolvedCount } = await supabase
    .from('issue_reports')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'Resolved')

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header Section */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white px-4 py-6 shadow-soft sm:rounded-3xl sm:px-6 sm:py-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-cyan-200/50 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-blue-200/50 blur-2xl" />
        <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700 sm:text-sm">
          Dashboard
        </p>
        <h1 className="relative mt-2 text-2xl font-semibold text-slate-900 sm:mt-3 sm:text-3xl md:text-4xl">
          Welcome, {profile?.full_name || 'User'}!
        </h1>
        <p className="relative mt-2 max-w-2xl text-xs text-slate-600 sm:mt-3 sm:text-sm md:text-base">
          Here is an overview of your submitted technical issues.
        </p>
      </section>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 md:grid-cols-3">
        <div className="rounded-xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
          <p className="text-xs font-medium text-rose-700 sm:text-sm">Pending</p>
          <p className="mt-2 text-3xl font-bold text-rose-600 sm:mt-3 sm:text-4xl">
            {pendingCount || 0}
          </p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
          <p className="text-xs font-medium text-amber-700 sm:text-sm">Ongoing</p>
          <p className="mt-2 text-3xl font-bold text-amber-500 sm:mt-3 sm:text-4xl">
            {ongoingCount || 0}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
          <p className="text-xs font-medium text-emerald-700 sm:text-sm">Resolved</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600 sm:mt-3 sm:text-4xl">
            {resolvedCount || 0}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Quick Actions</h2>
        <div className="mt-4 flex flex-col gap-2 sm:gap-3 sm:flex-row">
          <Link
            href="/report-issue"
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:from-cyan-400 hover:to-blue-400 sm:rounded-xl sm:px-5 sm:py-3 sm:text-sm"
          >
            Report a New Issue
          </Link>
          <Link
            href="/my-reports"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 sm:rounded-xl sm:px-5 sm:py-3 sm:text-sm"
          >
            View My Reports
          </Link>
        </div>
      </div>
    </div>
  )
}
