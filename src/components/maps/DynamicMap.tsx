'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import type { MapMarkerData, ReportLocation } from '@/types/user'

type DynamicMapMode = 'pick' | 'view' | 'multi'

type DynamicMapProps = {
  mode?: DynamicMapMode
  position?: ReportLocation | null
  setPosition?: ((position: ReportLocation) => void) | null
  markers?: MapMarkerData[]
  center?: ReportLocation
  zoom?: number
  height?: string
}

type LocationPickerProps = {
  position: ReportLocation | null
  setPosition: ((position: ReportLocation) => void) | null | undefined
}

// Internal component for handling map clicks when picking a location
function LocationPicker({ position, setPosition }: LocationPickerProps) {
  useMapEvents({
    click(e) {
      if (setPosition) {
        setPosition(e.latlng)
      }
    },
  })

  return position ? (
    <Marker position={position}>
      <Popup>Selected Location: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}</Popup>
    </Marker>
  ) : null
}

export default function DynamicMap({
  mode = 'view',
  position = null,
  setPosition = null,
  markers = [],
  center = { lat: 14.5995, lng: 120.9842 },
  zoom = 15,
  height = '400px',
}: DynamicMapProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="flex h-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-sm font-medium text-slate-500" style={{ height }}>Loading map...</div>

  // If we have an exact position to view or pick from, center on it
  const mapCenter = position || center

  return (
    <div className="relative z-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" style={{ height, width: '100%' }}>
      <MapContainer className="relative z-0" center={mapCenter} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {mode === 'pick' && (
          <LocationPicker position={position} setPosition={setPosition} />
        )}

        {mode === 'view' && position && (
          <Marker position={position}>
            <Popup>Reported Location</Popup>
          </Marker>
        )}

        {mode === 'multi' && markers.map((marker) => (
          <Marker key={marker.id} position={{ lat: marker.lat, lng: marker.lng }}>
            <Popup>{marker.popupContent}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
