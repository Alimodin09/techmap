'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { LayoutDashboard, FileText, MapPinned, LogOut, ShieldCheck } from 'lucide-react'

type AdminSidebarProps = {
  userEmail?: string | null
}

type NavItem = {
  href: string
  label: string
  icon: typeof LayoutDashboard
}

export default function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const navItems = useMemo<NavItem[]>(() => [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/reports', label: 'All Reports', icon: FileText },
    { href: '/admin/map', label: 'System Map', icon: MapPinned },
  ], [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="flex w-full flex-col border-b border-slate-800/70 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-5 py-6 text-slate-100 shadow-[0_20px_60px_rgba(15,23,42,0.18)] md:sticky md:top-0 md:h-screen md:w-[280px] md:shrink-0 md:border-b-0 md:border-r md:px-6">
      <div className="mb-8 rounded-3xl border border-slate-800 bg-white/5 p-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300 ring-1 ring-cyan-400/20">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-cyan-300">TechMap</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Admin Panel</h2>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-300">
          Manage reports, review map activity, and keep the platform organized.
        </p>
      </div>

      <nav className="flex-1">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Navigation</p>
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive ? 'bg-cyan-400/15 text-cyan-200 ring-1 ring-cyan-400/25' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/20">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">Administrator</p>
            <p className="mt-1 break-words text-xs leading-5 text-slate-400">{userEmail || 'Signed in admin'}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:border-slate-500 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
