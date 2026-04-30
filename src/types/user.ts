import type { ReactNode } from 'react'

export type ReportStatus = 'Pending' | 'Ongoing' | 'Resolved'

export interface Profile {
  id?: string
  full_name?: string | null
  phone_number?: string | null
  department_or_office?: string | null
  email?: string | null
  role?: 'user' | 'admin' | null
  avatar_url?: string | null
  created_at?: string
  updated_at?: string | null
}

export interface ReportLocation {
  lat: number
  lng: number
}

export type IssueCategory = 'Equipment' | 'Network' | 'Software' | 'Electrical' | 'Facility' | 'Other'

export type IssuePriority = 'Low' | 'Medium' | 'High' | 'Critical'

export type DepartmentArea =
  | 'IT Department'
  | 'Computer Laboratory'
  | 'Admin Office'
  | 'Library'
  | 'Hallway'
  | 'Other'

export interface IssueReport {
  id: string
  user_id: string
  name: string
  room_lab_number: string
  issue_type: string
  description: string
  status: ReportStatus
  latitude: number
  longitude: number
  created_at: string
  updated_at?: string | null
  // New fields (Phase 1)
  category?: IssueCategory | string | null
  priority?: IssuePriority | string | null
  department_area?: DepartmentArea | string | null
  image_url?: string | null
  image_path?: string | null
  // Existing optional fields
  is_archived?: boolean
  archived_at?: string | null
  deleted_at?: string | null
  profiles?: { full_name: string | null } | null
}

export interface MapMarkerData {
  id: string | number
  lat: number
  lng: number
  popupContent: ReactNode
}
