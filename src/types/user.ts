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
}

export interface MapMarkerData {
  id: string | number
  lat: number
  lng: number
  popupContent: ReactNode
}
