'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from './LogoutButton'
import AccountSettingsModal from '@/components/user/AccountSettingsModal'

type UserSidebarProps = {
  userEmail?: string
  userName?: string | null
  isOpen?: boolean
  onClose?: () => void
  isMobile?: boolean
}

export default function UserSidebar({
  userEmail,
  userName,
  isOpen = true,
  onClose,
  isMobile = false,
}: UserSidebarProps) {
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const pathname = usePathname()

  const accountDisplayName = userName || userEmail?.split('@')[0] || 'User'

  // Close drawer when route changes (on mobile)
  useEffect(() => {
    if (isMobile && onClose) {
      onClose()
    }
  }, [pathname, isMobile, onClose])

  const isActive = (path: string) => pathname === path

  // Mobile drawer backdrop + drawer
  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        {isOpen && (
          <div
            className="fixed inset-x-0 bottom-0 top-16 z-30 bg-black/50 md:hidden pointer-events-auto"
            onClick={onClose}
            aria-label="Close navigation"
          />
        )}

        {/* Drawer */}
        <aside
          className={`fixed bottom-0 left-0 top-16 z-40 flex h-[calc(100dvh-4rem)] w-72 transform flex-col overflow-y-auto border-r border-slate-200 bg-gradient-to-br from-[#0b132b] via-[#111f46] to-[#0c2446] px-4 py-4 text-slate-100 transition-transform duration-300 ease-out md:hidden ${
            isOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'
          }`}
          aria-hidden={!isOpen}
        >
          <div>
            <nav className="mb-4">
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/dashboard"
                    className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                      isActive('/dashboard')
                        ? 'border border-cyan-400/60 bg-cyan-400/15 text-white'
                        : 'border border-transparent text-slate-200 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white'
                    }`}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/report-issue"
                    className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                      isActive('/report-issue')
                        ? 'border border-cyan-400/60 bg-cyan-400/15 text-white'
                        : 'border border-transparent text-slate-200 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white'
                    }`}
                  >
                    Report Issue
                  </Link>
                </li>
                <li>
                  <Link
                    href="/my-reports"
                    className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                      isActive('/my-reports')
                        ? 'border border-cyan-400/60 bg-cyan-400/15 text-white'
                        : 'border border-transparent text-slate-200 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white'
                    }`}
                  >
                    My Reports
                  </Link>
                </li>
                <li>
                  <Link
                    href="/map-view"
                    className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                      isActive('/map-view')
                        ? 'border border-cyan-400/60 bg-cyan-400/15 text-white'
                        : 'border border-transparent text-slate-200 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white'
                    }`}
                  >
                    Map View
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          <div className="mt-auto rounded-2xl border border-slate-700/80 bg-slate-900/70 p-3">
            <div className="mb-3 space-y-1">
              <p className="text-xs font-semibold text-white">{accountDisplayName}</p>
              <p className="break-words text-xs text-slate-300">{userEmail}</p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-2.5 text-xs font-semibold text-white transition hover:from-cyan-400 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-cyan-300"
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
      </>
    )
  }

  // Desktop sidebar (default)
  return (
    <aside className="hidden h-screen flex-col border-b border-slate-200 bg-gradient-to-br from-[#0b132b] via-[#111f46] to-[#0c2446] px-6 py-6 text-slate-100 md:sticky md:top-0 md:flex md:w-80 md:shrink-0 md:border-b-0 md:border-r md:border-slate-800">
      <div>
        <div className="mb-8 rounded-2xl border border-slate-700/70 bg-slate-900/45 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
            TechMap
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">User Portal</h2>
          <p className="mt-1 text-sm text-slate-300">
            Track reports, map issues, and manage your account.
          </p>
        </div>

        <nav>
          <ul className="space-y-2">
            <li>
              <Link
                href="/dashboard"
                className={`block rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  isActive('/dashboard')
                    ? 'border-cyan-400/60 bg-cyan-400/15 text-white'
                    : 'border-transparent text-slate-200 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white'
                }`}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/report-issue"
                className={`block rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  isActive('/report-issue')
                    ? 'border-cyan-400/60 bg-cyan-400/15 text-white'
                    : 'border-transparent text-slate-200 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white'
                }`}
              >
                Report Issue
              </Link>
            </li>
            <li>
              <Link
                href="/my-reports"
                className={`block rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  isActive('/my-reports')
                    ? 'border-cyan-400/60 bg-cyan-400/15 text-white'
                    : 'border-transparent text-slate-200 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white'
                }`}
              >
                My Reports
              </Link>
            </li>
            <li>
              <Link
                href="/map-view"
                className={`block rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  isActive('/map-view')
                    ? 'border-cyan-400/60 bg-cyan-400/15 text-white'
                    : 'border-transparent text-slate-200 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white'
                }`}
              >
                Map View
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="mt-auto rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4 shadow-soft backdrop-blur">
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
