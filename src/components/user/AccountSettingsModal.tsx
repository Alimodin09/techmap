'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import ProfileForm from '@/components/user/ProfileForm'
import PasswordChangeForm from '@/components/user/PasswordChangeForm'
import type { Profile } from '@/types/user'

type AccountSettingsModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function AccountSettingsModal({ isOpen, onClose }: AccountSettingsModalProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [profileError, setProfileError] = useState('')

  const loadProfile = useCallback(async function loadProfile() {
    const supabase = createClient()

    setLoadingProfile(true)
    setProfileError('')

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      const user = userData?.user
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (err) {
      if (err instanceof Error) {
        setProfileError(err.message || 'Failed to load account details.')
      } else {
        setProfileError('Failed to load account details.')
      }
    } finally {
      setLoadingProfile(false)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return

    loadProfile()

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose, loadProfile])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 p-4" onClick={onClose}>
      <div className="relative z-[10000] max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Account Settings</h2>
            <p className="mt-1 text-sm text-slate-500 sm:text-base">Update your account details and password.</p>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            onClick={onClose}
            aria-label="Close account settings"
          >
            ×
          </button>
        </div>

        <div className="grid gap-4 overflow-y-auto px-5 py-5 sm:px-6 lg:grid-cols-2">
          {profileError && <div className="alert alert-error">{profileError}</div>}

          {loadingProfile ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-medium text-slate-600">Loading account details...</div>
          ) : (
            <>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <ProfileForm profile={profile} onSuccess={loadProfile} />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <PasswordChangeForm />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
