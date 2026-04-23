'use client'

import { useState, useEffect } from 'react'
import UserSidebar from '@/components/shared/UserSidebar'
import MobileHeader from '@/components/shared/MobileHeader'
import type { ReactNode } from 'react'

type UserLayoutClientProps = {
  children: ReactNode
  userEmail?: string
  userName?: string | null
}

export default function UserLayoutClient({
  children,
  userEmail,
  userName,
}: UserLayoutClientProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Close drawer on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false)
      }
    }

    if (isDrawerOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isDrawerOpen])

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_20%,#e0f2fe_0%,#f8fafc_35%,#eef2ff_100%)]">
      {/* Mobile Header - z-50 */}
      <MobileHeader
        isDrawerOpen={isDrawerOpen}
        onDrawerToggle={() => setIsDrawerOpen(!isDrawerOpen)}
        userName={userName}
        userEmail={userEmail}
      />

      {/* Desktop & Mobile Layout */}
      <div className="flex">
        {/* Mobile Drawer Sidebar - z-40 with overlay */}
        <UserSidebar
          userEmail={userEmail}
          userName={userName}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          isMobile={true}
        />

        {/* Desktop Sidebar */}
        <UserSidebar
          userEmail={userEmail}
          userName={userName}
          isMobile={false}
        />

        {/* Main Content */}
        <main className="w-full px-4 py-6 sm:px-6 md:px-10 md:py-10">
          {children}
        </main>
      </div>
    </div>
  )
}
