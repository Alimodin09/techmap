'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { uploadAvatar, deleteAvatar } from '@/utils/avatarHelper'

export default function AvatarUpload({ profile, onSuccess }) {
  const supabase = createClient()
  const fileInputRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(profile?.avatar_url || null)

  async function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setMessage('')
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Delete old avatar if exists
      if (profile?.avatar_url) {
        try {
          const fileName = profile.avatar_url.split('/').pop()
          await deleteAvatar(supabase, `${user.id}/${fileName}`)
        } catch (err) {
          console.warn('Could not delete old avatar:', err)
        }
      }

      // Upload new avatar
      const { publicUrl } = await uploadAvatar(supabase, user.id, file)

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setPreview(publicUrl)
      setMessage('Avatar uploaded successfully!')
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleRemoveAvatar() {
    if (!preview) return

    setLoading(true)
    setMessage('')
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Delete from storage
      const fileName = preview.split('/').pop()
      if (fileName) {
        await deleteAvatar(supabase, `${user.id}/${fileName}`)
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id)

      if (updateError) throw updateError

      setPreview(null)
      setMessage('Avatar removed successfully!')
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="avatar-upload-section">
      <h3>Profile Picture</h3>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="avatar-preview">
        {preview ? (
          <img src={preview} alt="Profile" className="avatar-image" />
        ) : (
          <div className="avatar-placeholder">
            <span>No photo</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <button
          type="button"
          className="btn btn-primary btn-small"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Change Photo'}
        </button>

        {preview && (
          <button
            type="button"
            className="btn btn-secondary btn-small"
            onClick={handleRemoveAvatar}
            disabled={loading}
          >
            Remove
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={loading}
      />
    </div>
  )
}
