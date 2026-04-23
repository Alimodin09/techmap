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
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative z-[10000] max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-2 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-6 sm:py-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-slate-900 sm:text-xl md:text-2xl">
              Account Settings
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 sm:mt-1 sm:text-sm md:text-base">
              Update your account details and password.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center flex-shrink-0 rounded-full border border-slate-200 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 sm:h-10 sm:w-10 sm:text-base"
            onClick={onClose}
            aria-label="Close account settings"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="grid gap-3 overflow-y-auto px-4 py-4 sm:gap-4 sm:px-6 sm:py-5 md:grid-cols-2">
          {profileError && (
            <div className="col-span-full rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm">
              {profileError}
            </div>
          )}

          {loadingProfile ? (
            <div className="col-span-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-medium text-slate-600 sm:rounded-xl sm:px-4 sm:py-4 sm:text-sm">
              Loading account details...
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-sm sm:rounded-xl sm:p-4 md:p-5">
                <ProfileForm profile={profile} onSuccess={loadProfile} />
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-sm sm:rounded-xl sm:p-4 md:p-5">
                <PasswordChangeForm />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
