import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from '@/components/user/ProfileForm'
import AvatarUpload from '@/components/user/AvatarUpload'
import PasswordChangeForm from '@/components/user/PasswordChangeForm'
import AccountSummary from '@/components/user/AccountSummary'
import RecentReports from '@/components/user/RecentReports'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>My Account</h1>
        <p className="page-subtitle">Manage your profile information and preferences</p>
      </div>

      <div className="profile-grid">
        {/* Left Column */}
        <div className="profile-left">
          {/* Profile Picture Section */}
          <div className="card">
            <AvatarUpload profile={profile} />
          </div>

          {/* Account Info Card */}
          <div className="card">
            <h3>Account Information</h3>
            <div className="info-group">
              <label>Email</label>
              <p className="info-value">{user.email}</p>
            </div>
            <div className="info-group">
              <label>Account Role</label>
              <p className="info-value">
                <span className="badge" style={{ backgroundColor: '#64748b', color: 'white' }}>
                  User
                </span>
              </p>
            </div>
            <div className="info-group">
              <label>Member Since</label>
              <p className="info-value">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="profile-right">
          {/* Edit Profile Form */}
          <div className="card">
            <ProfileForm profile={profile} />
          </div>

          {/* Change Password */}
          <div className="card">
            <PasswordChangeForm />
          </div>
        </div>
      </div>

      {/* Full Width Section */}
      <div className="profile-full">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div className="card">
            <AccountSummary userId={user.id} />
          </div>

          <div className="card">
            <RecentReports userId={user.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
