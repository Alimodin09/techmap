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
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/55 p-2 backdrop-blur-[2px] sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative z-[10000] w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)] sm:max-h-[90dvh] sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 border-b border-slate-200/90 bg-white/95 px-4 py-4 backdrop-blur sm:px-6 sm:py-5">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700 sm:text-xs">
              Account
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900 sm:text-xl md:text-2xl">
              Account Settings
            </h2>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm md:text-base">
              Update your account details and password.
            </p>
          </div>
          <button
            type="button"
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-200 sm:right-6 sm:top-5 sm:h-10 sm:w-10 sm:text-base"
            onClick={onClose}
            aria-label="Close account settings"
          >
            ×
          </button>
        </div>

        <div className="max-h-[calc(92dvh-92px)] overflow-y-auto px-4 py-4 sm:max-h-[calc(90dvh-108px)] sm:px-6 sm:py-6">
          {profileError && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {profileError}
            </div>
          )}

          {loadingProfile ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm font-medium text-slate-600">
              Loading account details...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
              <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/70 p-4 shadow-sm sm:p-5">
                <ProfileForm profile={profile} onSuccess={loadProfile} />
              </section>

              <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/70 p-4 shadow-sm sm:p-5">
                <PasswordChangeForm />
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
