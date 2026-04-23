import UserLayoutClient from './layout-client'
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
    <UserLayoutClient
      userEmail={user.email}
      userName={profile?.full_name}
    >
      {children}
    </UserLayoutClient>
  )
}

