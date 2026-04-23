'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import type { ReportLocation } from '@/types/user'

const MapComponent = dynamic(() => import('@/components/maps/DynamicMap'), {
  ssr: false,
  loading: () => <div style={{ height: '400px', background: '#e2e8f0' }}>Loading map...</div>,
})

export default function ReportIssuePage() {
  const [name, setName] = useState('')
  const [roomLabNumber, setRoomLabNumber] = useState('')
  const [issueType, setIssueType] = useState('Computer Setup')
  const [description, setDescription] = useState('')
  const [position, setPosition] = useState<ReportLocation | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    if (!position) {
      setError('Please select the issue location on the map.')
      setLoading(false)
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('You must be logged in to report an issue.')

      // Some users may exist in auth without a corresponding profiles row.
      // Ensure profile exists so issue_reports.user_id FK is always valid.
      const { error: profileUpsertError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            full_name: user.user_metadata?.full_name || null,
            email: user.email || null,
          },
          {
            onConflict: 'id',
            ignoreDuplicates: true,
          }
        )

      if (profileUpsertError) throw profileUpsertError

      const { error: dbError } = await supabase
        .from('issue_reports')
        .insert({
          user_id: user.id,
          name,
          room_lab_number: roomLabNumber,
          issue_type: issueType,
          description,
          latitude: position.lat,
          longitude: position.lng,
        })

      if (dbError) throw dbError

      setSuccess(true)
      setName('')
      setRoomLabNumber('')
      setDescription('')
      setPosition(null)

      // Redirect to reports page after a short delay
      setTimeout(() => {
        router.push('/my-reports')
        router.refresh()
      }, 2000)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 sm:space-y-6">
      <section className="rounded-xl bg-slate-900 px-4 py-6 text-white shadow-soft sm:rounded-3xl sm:px-6 sm:py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300 sm:text-sm">Report Issue</p>
        <h1 className="mt-2 text-2xl font-semibold text-white sm:mt-3 sm:text-3xl md:text-4xl">Report Technical Issue</h1>
        <p className="mt-2 max-w-2xl text-xs text-slate-300 sm:mt-3 sm:text-sm md:text-base">Fill in the details and tap on the map to indicate the broken equipment&apos;s location.</p>
      </section>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm">
          Issue reported successfully! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:space-y-6 sm:rounded-3xl sm:p-6 md:p-8">
        <div className="grid gap-3 sm:gap-5 md:grid-cols-2">
          <div className="space-y-1.5 sm:space-y-2">
            <label htmlFor="issue-name" className="block text-xs font-medium text-slate-700 sm:text-sm">
              Issue Name (Brief Summary)
            </label>
            <input
              id="issue-name"
              name="issueName"
              type="text"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              placeholder="e.g. Projector not connecting"
            />
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <label htmlFor="room-lab-number" className="block text-xs font-medium text-slate-700 sm:text-sm">
              Room / Lab Number
            </label>
            <input
              id="room-lab-number"
              name="roomLabNumber"
              type="text"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm"
              value={roomLabNumber}
              onChange={(e) => setRoomLabNumber(e.target.value)}
              required
              disabled={loading}
              placeholder="e.g. Lab 4B"
            />
          </div>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <label htmlFor="issue-type" className="block text-xs font-medium text-slate-700 sm:text-sm">
            Type of Issue
          </label>
          <select
            id="issue-type"
            name="issueType"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm"
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
            required
            disabled={loading}
          >
            <option value="Computer Setup">Computer Setup</option>
            <option value="Projector">Projector</option>
            <option value="WiFi / Network">WiFi / Network</option>
            <option value="Printer">Printer</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <label htmlFor="issue-description" className="block text-xs font-medium text-slate-700 sm:text-sm">
            Detailed Description
          </label>
          <textarea
            id="issue-description"
            name="description"
            className="min-h-24 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 sm:min-h-32 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            disabled={loading}
            placeholder="Please describe exactly what is happening..."
          />
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <label className="block text-xs font-medium text-slate-700 sm:text-sm">
            Location (Click map to pin)
          </label>
          <MapComponent mode="pick" position={position} setPosition={setPosition} height="250px" />
        </div>

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-lg bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60 sm:rounded-xl sm:px-5 sm:py-3 sm:text-sm"
          disabled={loading || success}
        >
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  )
}
