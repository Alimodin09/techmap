import UserSidebar from '@/components/shared/UserSidebar'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

type UserLayoutProps = {
  children: ReactNode
}

export default async function UserLayout({ children }: UserLayoutProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Also verify user is not admin (optional, but good practice so admins use admin dashboard)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'admin') {
    redirect('/admin/dashboard')
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_20%,#e0f2fe_0%,#f8fafc_35%,#eef2ff_100%)] md:flex">
      <UserSidebar userEmail={user.email} userName={profile?.full_name} />

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        {children}
      </main>
    </div>
  )
}
