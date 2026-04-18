'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'

// Internal component for handling map clicks when picking a location
function LocationPicker({ position, setPosition }) {
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
  mode = 'view', // 'pick', 'view', or 'multi'
  position = null, // {lat, lng} for 'pick' and 'view'
  setPosition = null, // function for 'pick'
  markers = [], // Array of {id, lat, lng, popupContent} for 'multi'
  center = { lat: 14.5995, lng: 120.9842 }, // Default center (e.g. Manila)
  zoom = 15,
  height = '400px' 
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div style={{ height, backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Map...</div>

  // If we have an exact position to view or pick from, center on it
  const mapCenter = position || center

  return (
    <div style={{ height, width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
      <MapContainer center={mapCenter} zoom={zoom} style={{ height: '100%', width: '100%' }}>
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
