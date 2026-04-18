'use client'

import { useState } from 'react'
import Link from 'next/link'
import LogoutButton from './LogoutButton'
import AccountSettingsModal from '@/components/user/AccountSettingsModal'

type UserSidebarProps = {
  userEmail?: string
  userName?: string | null
}

export default function UserSidebar({ userEmail, userName }: UserSidebarProps) {
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)

  const accountDisplayName = userName || userEmail?.split('@')[0] || 'User'

  return (
    <aside className="flex w-full flex-col border-b border-slate-200 bg-gradient-to-br from-[#0b132b] via-[#111f46] to-[#0c2446] px-5 py-6 text-slate-100 md:sticky md:top-0 md:h-screen md:w-80 md:shrink-0 md:border-b-0 md:border-r md:border-slate-800 md:px-6">
      <div className="mb-8 rounded-2xl border border-slate-700/70 bg-slate-900/45 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">TechMap</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">User Portal</h2>
        <p className="mt-1 text-sm text-slate-300">Track reports, map issues, and manage your account.</p>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2">
          <li><Link href="/dashboard" className="block rounded-xl border border-transparent px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white">Dashboard</Link></li>
          <li><Link href="/report-issue" className="block rounded-xl border border-transparent px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white">Report Issue</Link></li>
          <li><Link href="/my-reports" className="block rounded-xl border border-transparent px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white">My Reports</Link></li>
          <li><Link href="/map-view" className="block rounded-xl border border-transparent px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white">Map View</Link></li>
        </ul>
      </nav>

      <div className="mt-6 rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4 shadow-soft backdrop-blur">
        <div className="mb-4 space-y-1">
          <p className="text-sm font-semibold text-white">{accountDisplayName}</p>
          <p className="break-words text-sm text-slate-300">{userEmail}</p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:from-cyan-400 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-900"
            onClick={() => setIsAccountModalOpen(true)}
          >
            Account Settings
          </button>
          <LogoutButton />
        </div>
      </div>

      <AccountSettingsModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />
    </aside>
  )
}
