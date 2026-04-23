'use client'

type MobileHeaderProps = {
  isDrawerOpen: boolean
  onDrawerToggle: () => void
  userName?: string | null
  userEmail?: string
}

export default function MobileHeader({
  isDrawerOpen,
  onDrawerToggle,
  userName,
  userEmail,
}: MobileHeaderProps) {
  const accountDisplayName = userName || userEmail?.split('@')[0] || 'User'

  return (
    <header className="sticky top-0 z-[60] grid grid-cols-[1fr_auto_auto] items-center gap-2 border-b border-slate-200 bg-white px-4 py-4 md:hidden">
      {/* Logo */}
      <div className="pointer-events-none min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600">
          TechMap
        </p>
      </div>

      {/* User info on mobile header */}
      <div className="pointer-events-none min-w-0 px-2 text-center">
        <p className="text-xs font-medium text-slate-700 truncate">{accountDisplayName}</p>
      </div>

      {/* Hamburger button */}
      <button
        onClick={onDrawerToggle}
        className="relative z-[61] flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg p-0 text-slate-700 transition hover:bg-slate-100 active:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 pointer-events-auto"
        aria-label="Toggle navigation drawer"
        type="button"
      >
        {isDrawerOpen ? (
          // X icon
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          // Hamburger icon
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>
    </header>
  )
}
