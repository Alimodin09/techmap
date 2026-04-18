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
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white px-6 py-8 shadow-soft sm:px-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-cyan-200/50 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-blue-200/50 blur-2xl" />
        <p className="relative text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Dashboard</p>
        <h1 className="relative mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">Welcome, {profile?.full_name || 'User'}!</h1>
        <p className="relative mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">Here is an overview of your submitted technical issues.</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-6 shadow-sm">
          <p className="text-sm font-medium text-rose-700">Pending</p>
          <p className="mt-3 text-4xl font-bold text-rose-600">{pendingCount || 0}</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm">
          <p className="text-sm font-medium text-amber-700">Ongoing</p>
          <p className="mt-3 text-4xl font-bold text-amber-500">{ongoingCount || 0}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">
          <p className="text-sm font-medium text-emerald-700">Resolved</p>
          <p className="mt-3 text-4xl font-bold text-emerald-600">{resolvedCount || 0}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Quick Actions</h2>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link href="/report-issue" className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:from-cyan-400 hover:to-blue-400">Report a New Issue</Link>
          <Link href="/my-reports" className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50">View My Reports</Link>
        </div>
      </div>
    </div>
  )
}
