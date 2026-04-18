// Helper functions for avatar operations
export async function uploadAvatar(supabase, userId, file) {
  // Validate file
  if (!file) throw new Error('No file selected')
  
  const MAX_SIZE = 5 * 1024 * 1024 // 5MB
  if (file.size > MAX_SIZE) {
    throw new Error('File size must be less than 5MB')
  }
  
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    throw new Error('Only JPEG, PNG, and WebP are allowed')
  }
  
  // Create unique filename
  const ext = file.name.split('.').pop()
  const fileName = `${userId}-${Date.now()}.${ext}`
  const filePath = `${userId}/${fileName}`
  
  // Upload to Supabase Storage
  const { data, error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: false })
  
  if (uploadError) throw uploadError
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)
  
  const publicUrl = urlData.publicUrl
  
  return { filePath, publicUrl }
}

export async function deleteAvatar(supabase, filePath) {
  if (!filePath) return
  
  const { error } = await supabase.storage
    .from('avatars')
    .remove([filePath])
  
  if (error) throw error
}
