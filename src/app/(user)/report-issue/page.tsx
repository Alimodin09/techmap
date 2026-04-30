'use client'

import { useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import type { ReportLocation } from '@/types/user'
import type { IssueCategory, IssuePriority, DepartmentArea } from '@/types/user'

const MapComponent = dynamic(() => import('@/components/maps/DynamicMap'), {
  ssr: false,
  loading: () => <div style={{ height: '400px', background: '#e2e8f0' }}>Loading map...</div>,
})

// ── Constants ───────────────────────────────────────────────
const CATEGORIES: IssueCategory[] = ['Equipment', 'Network', 'Software', 'Electrical', 'Facility', 'Other']
const PRIORITIES: IssuePriority[] = ['Low', 'Medium', 'High', 'Critical']
const DEPARTMENTS: DepartmentArea[] = ['IT Department', 'Computer Laboratory', 'Admin Office', 'Library', 'Hallway', 'Other']
const ISSUE_TYPES = ['Computer Setup', 'Projector', 'WiFi / Network', 'Printer', 'Other']
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5 MB

export default function ReportIssuePage() {
  // ── Existing fields ────────────────────────────────────────
  const [name, setName] = useState('')
  const [roomLabNumber, setRoomLabNumber] = useState('')
  const [issueType, setIssueType] = useState('Computer Setup')
  const [description, setDescription] = useState('')
  const [position, setPosition] = useState<ReportLocation | null>(null)

  // ── New fields ─────────────────────────────────────────────
  const [category, setCategory] = useState<IssueCategory | ''>('')
  const [priority, setPriority] = useState<IssuePriority>('Medium')
  const [departmentArea, setDepartmentArea] = useState<DepartmentArea | ''>('')

  // ── Image upload ───────────────────────────────────────────
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Form state ─────────────────────────────────────────────
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  // ── Image helpers ──────────────────────────────────────────
  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError('Only JPG, PNG, and WEBP images are allowed.')
      return
    }

    // Validate size
    if (file.size > MAX_IMAGE_SIZE) {
      setError('Image size must be less than 5 MB.')
      return
    }

    setError(null)
    setImageFile(file)

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
  }

  function removeImage() {
    setImageFile(null)
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
      setImagePreview(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // ── Upload image to Supabase Storage ───────────────────────
  async function uploadImage(userId: string): Promise<{ url: string; path: string } | null> {
    if (!imageFile) return null

    // Build a unique file path: userId/timestamp-filename
    const timestamp = Date.now()
    const safeFileName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filePath = `${userId}/${timestamp}-${safeFileName}`

    console.log('[Image Upload] Starting upload…', {
      bucket: 'report-images',
      filePath,
      fileSize: imageFile.size,
      fileType: imageFile.type,
    })

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('report-images')
      .upload(filePath, imageFile, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('[Image Upload] ❌ Upload FAILED:', {
        message: uploadError.message,
        name: uploadError.name,
        cause: uploadError.cause,
      })
      // Surface the error to the user — don't silently swallow it
      setError(`Image upload failed: ${uploadError.message}. Your report was NOT submitted. Please try again.`)
      return null
    }

    console.log('[Image Upload] ✅ Upload succeeded:', uploadData)

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('report-images')
      .getPublicUrl(filePath)

    const publicUrl = urlData?.publicUrl || null

    console.log('[Image Upload] Public URL:', publicUrl)

    if (!publicUrl) {
      console.error('[Image Upload] ❌ Could not generate public URL for path:', filePath)
      // Still return the path so we can reconstruct the URL later
      const manualUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/report-images/${filePath}`
      console.log('[Image Upload] Using manually constructed URL:', manualUrl)
      return { url: manualUrl, path: filePath }
    }

    return {
      url: publicUrl,
      path: filePath,
    }
  }

  // ── Form submit ────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    // Validate category (required)
    if (!category) {
      setError('Please select a category.')
      setLoading(false)
      return
    }

    // Validate map position
    if (!position) {
      setError('Please select the issue location on the map.')
      setLoading(false)
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('You must be logged in to report an issue.')

      // Ensure profile exists (keep existing logic)
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

      // ── Step 1: Upload image FIRST (if provided) ──────────
      let imageData: { url: string; path: string } | null = null
      if (imageFile) {
        imageData = await uploadImage(user.id)

        // If user selected an image but upload failed, stop submission
        // (uploadImage already set the error message)
        if (!imageData) {
          setLoading(false)
          return
        }

        console.log('[Submit] Image data ready:', {
          url: imageData.url,
          path: imageData.path,
        })
      }

      // ── Step 2: Build insert payload ──────────────────────
      const reportPayload = {
        user_id: user.id,
        name,
        room_lab_number: roomLabNumber,
        issue_type: issueType,
        description,
        latitude: position.lat,
        longitude: position.lng,
        category,
        priority,
        department_area: departmentArea || null,
        image_url: imageData?.url || null,
        image_path: imageData?.path || null,
      }

      console.log('[Submit] Inserting report with payload:', {
        ...reportPayload,
        image_url: reportPayload.image_url ? '(URL present)' : null,
        image_path: reportPayload.image_path ? '(path present)' : null,
      })

      // ── Step 3: Insert into database ──────────────────────
      const { data: insertedData, error: dbError } = await supabase
        .from('issue_reports')
        .insert(reportPayload)
        .select('id, image_url, image_path')
        .single()

      if (dbError) {
        console.error('[Submit] ❌ Insert error:', {
          message: dbError.message,
          details: dbError.details,
          hint: dbError.hint,
          code: dbError.code,
        })

        // If the error is about missing columns, fall back to original fields only
        const isColumnError =
          dbError.message?.includes('column') ||
          dbError.message?.includes('schema cache') ||
          dbError.code === '42703'

        if (isColumnError) {
          console.warn('[Submit] New columns not found — falling back to basic fields.')
          console.warn('[Submit] Please run the SQL migration to add the new columns.')
          console.warn('[Submit] ⚠️  Image data will be LOST in fallback mode!')

          const { error: fallbackError } = await supabase
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

          if (fallbackError) {
            console.error('[Submit] ❌ Fallback insert error:', {
              message: fallbackError.message,
              details: fallbackError.details,
              hint: fallbackError.hint,
              code: fallbackError.code,
            })
            throw new Error(fallbackError.message || 'Failed to save report.')
          }

          // Fallback succeeded — warn user
          console.warn('[Submit] Report saved WITHOUT image. Run SQL migration to enable images.')
        } else {
          throw new Error(dbError.message || 'Failed to save report.')
        }
      } else {
        // ── Step 4: Verify the saved data ───────────────────
        console.log('[Submit] ✅ Report saved successfully:', {
          id: insertedData?.id,
          image_url: insertedData?.image_url ? '(saved)' : '(null)',
          image_path: insertedData?.image_path ? '(saved)' : '(null)',
        })
      }

      setSuccess(true)

      // Reset form
      setName('')
      setRoomLabNumber('')
      setIssueType('Computer Setup')
      setDescription('')
      setPosition(null)
      setCategory('')
      setPriority('Medium')
      setDepartmentArea('')
      removeImage()

      // Redirect to reports page after a short delay
      setTimeout(() => {
        router.push('/my-reports')
        router.refresh()
      }, 2000)
    } catch (err: unknown) {
      console.error('[Submit] ❌ Unhandled error:', err)
      // Handle both Error instances and Supabase error objects
      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Something went wrong'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // ── Shared Tailwind classes ────────────────────────────────
  const inputClass =
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm'

  const labelClass = 'block text-xs font-medium text-slate-700 sm:text-sm'

  const sectionHeadingClass =
    'flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-slate-500 sm:text-base'

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 sm:space-y-6">
      {/* ── Page Header ─────────────────────────────────────── */}
      <section className="rounded-xl bg-slate-900 px-4 py-6 text-white shadow-soft sm:rounded-3xl sm:px-6 sm:py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300 sm:text-sm">Report Issue</p>
        <h1 className="mt-2 text-2xl font-semibold text-white sm:mt-3 sm:text-3xl md:text-4xl">Report Technical Issue</h1>
        <p className="mt-2 max-w-2xl text-xs text-slate-300 sm:mt-3 sm:text-sm md:text-base">Fill in the details and tap on the map to indicate the broken equipment&apos;s location.</p>
      </section>

      {/* ── Alerts ───────────────────────────────────────────── */}
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

      {/* ── Form ─────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:space-y-8 sm:rounded-3xl sm:p-6 md:p-8">

        {/* ════════════════════════════════════════════════════
            SECTION 1: Issue Information
           ════════════════════════════════════════════════════ */}
        <fieldset className="space-y-4 sm:space-y-5">
          <legend className={sectionHeadingClass}>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-600">1</span>
            Issue Information
          </legend>

          {/* Row: Issue Name + Category */}
          <div className="grid gap-3 sm:gap-5 md:grid-cols-2">
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="issue-name" className={labelClass}>
                Issue Name (Brief Summary)
              </label>
              <input
                id="issue-name"
                name="issueName"
                type="text"
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                placeholder="e.g. Projector not connecting"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="category" className={labelClass}>
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                className={inputClass}
                value={category}
                onChange={(e) => setCategory(e.target.value as IssueCategory)}
                required
                disabled={loading}
              >
                <option value="" disabled>Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row: Issue Type + Priority */}
          <div className="grid gap-3 sm:gap-5 md:grid-cols-2">
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="issue-type" className={labelClass}>
                Issue Type / Specific Issue
              </label>
              <select
                id="issue-type"
                name="issueType"
                className={inputClass}
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                required
                disabled={loading}
              >
                {ISSUE_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="priority" className={labelClass}>
                Priority Level
              </label>
              <select
                id="priority"
                name="priority"
                className={inputClass}
                value={priority}
                onChange={(e) => setPriority(e.target.value as IssuePriority)}
                required
                disabled={loading}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 sm:text-xs">Choose how urgent the issue is.</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5 sm:space-y-2">
            <label htmlFor="issue-description" className={labelClass}>
              Detailed Description
            </label>
            <textarea
              id="issue-description"
              name="description"
              className={`min-h-24 sm:min-h-32 ${inputClass}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={loading}
              placeholder="Please describe exactly what is happening..."
            />
          </div>
        </fieldset>

        {/* Divider */}
        <hr className="border-slate-200" />

        {/* ════════════════════════════════════════════════════
            SECTION 2: Location Details
           ════════════════════════════════════════════════════ */}
        <fieldset className="space-y-4 sm:space-y-5">
          <legend className={sectionHeadingClass}>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-600">2</span>
            Location Details
          </legend>

          <div className="grid gap-3 sm:gap-5 md:grid-cols-2">
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="department-area" className={labelClass}>
                Department / Area
              </label>
              <select
                id="department-area"
                name="departmentArea"
                className={inputClass}
                value={departmentArea}
                onChange={(e) => setDepartmentArea(e.target.value as DepartmentArea)}
                disabled={loading}
              >
                <option value="">Select department or area</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="room-lab-number" className={labelClass}>
                Specific Location
              </label>
              <input
                id="room-lab-number"
                name="roomLabNumber"
                type="text"
                className={inputClass}
                value={roomLabNumber}
                onChange={(e) => setRoomLabNumber(e.target.value)}
                required
                disabled={loading}
                placeholder="e.g. Lab 4B, IT Office, 2nd Floor Hallway"
              />
            </div>
          </div>
        </fieldset>

        {/* Divider */}
        <hr className="border-slate-200" />

        {/* ════════════════════════════════════════════════════
            SECTION 3: Map Pin
           ════════════════════════════════════════════════════ */}
        <fieldset className="space-y-3 sm:space-y-4">
          <legend className={sectionHeadingClass}>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-600">3</span>
            Map Pin
          </legend>
          <p className="text-[11px] text-slate-400 sm:text-xs">Click the map below to pin the exact location of the issue.</p>
          <MapComponent mode="pick" position={position} setPosition={setPosition} height="250px" />
        </fieldset>

        {/* Divider */}
        <hr className="border-slate-200" />

        {/* ════════════════════════════════════════════════════
            SECTION 4: Attachment
           ════════════════════════════════════════════════════ */}
        <fieldset className="space-y-3 sm:space-y-4">
          <legend className={sectionHeadingClass}>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-600">4</span>
            Attachment
            <span className="text-xs font-normal normal-case text-slate-400">(Optional)</span>
          </legend>

          {/* Image preview */}
          {imagePreview && (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Selected preview"
                className="h-40 w-auto rounded-xl border border-slate-200 object-cover shadow-sm sm:h-52"
              />
              <button
                type="button"
                onClick={removeImage}
                disabled={loading}
                className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white shadow-md transition hover:bg-rose-500 disabled:opacity-50"
                aria-label="Remove image"
              >
                ✕
              </button>
            </div>
          )}

          {/* File input */}
          {!imagePreview && (
            <label
              htmlFor="image-upload"
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition hover:border-sky-400 hover:bg-sky-50 sm:rounded-2xl sm:py-10"
            >
              <svg className="mb-2 h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-medium text-slate-600 sm:text-sm">Click to upload an image</span>
              <span className="mt-1 text-[11px] text-slate-400 sm:text-xs">JPG, PNG, or WEBP — max 5 MB</span>
              <input
                ref={fileInputRef}
                id="image-upload"
                name="imageUpload"
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={handleImageSelect}
                disabled={loading}
              />
            </label>
          )}
        </fieldset>

        {/* ── Submit Button ───────────────────────────────────── */}
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
