import React, { useState } from 'react'
import { VnMap } from './components/VnMap'

// ============================================================
// Ví dụ 1: Bản đồ cơ bản
// ============================================================
function BasicMap() {
  return (
    <section>
      <h2>Bản đồ cơ bản</h2>
      <VnMap
        apiKey="YOUR_API_KEY"
        height={400}
        lat={21.0245}
        lng={105.8412}
        zoom={13}
        onLoad={(map) => console.log('[VnMap] Bản đồ tải xong', map)}
      />
    </section>
  )
}

// ============================================================
// Ví dụ 2: Marker & Popup
// ============================================================
const TOUR_LOCATIONS = [
  { id: 1, name: 'Vịnh Hạ Long',    lat: 20.9101, lng: 107.1839, desc: 'Di sản thiên nhiên thế giới UNESCO' },
  { id: 2, name: 'Phố cổ Hội An',   lat: 15.8801, lng: 108.3380, desc: 'Khu phố cổ di sản UNESCO' },
  { id: 3, name: 'Phú Quốc',        lat: 10.2899, lng: 103.9840, desc: 'Đảo ngọc thiên đường' },
]

function MarkerMap() {
  function handleLoad(map: VnMapInstance) {
    const vnMap = (window as any).vnMap as VnMapLib

    TOUR_LOCATIONS.forEach((loc) => {
      const popup = new vnMap.Popup({
        closeButton: true,
        anchor: 'bottom',
        offset: [0, -40],
        maxWidth: '240px',
      }).setHTML(`
        <div style="font-family:sans-serif;font-size:13px;">
          <strong style="font-size:15px;color:#1565c0;">${loc.name}</strong>
          <p style="margin:6px 0 0;color:#555;">${loc.desc}</p>
        </div>
      `)

      const marker = new vnMap.Marker({ color: '#e53935' })
        .setLngLat([loc.lng, loc.lat])
        .setPopup(popup)
        .addTo(map)

      marker.getElement().addEventListener('click', () => marker.togglePopup())
    })

    map.addControl(new vnMap.NavigationControl(), 'top-right')
    map.addControl(new vnMap.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-left')
  }

  return (
    <section>
      <h2>Marker & Popup – Điểm du lịch Việt Nam</h2>
      <VnMap
        apiKey="YOUR_API_KEY"
        height={500}
        lat={16.0}
        lng={107.0}
        zoom={6}
        onLoad={handleLoad}
      />
    </section>
  )
}

// ============================================================
// Ví dụ 3: Điều khiển bản đồ từ bên ngoài
// ============================================================
const CITIES = [
  { name: 'Hà Nội',         lat: 21.0245, lng: 105.8412, zoom: 13 },
  { name: 'TP. Hồ Chí Minh', lat: 10.8231, lng: 106.6297, zoom: 13 },
  { name: 'Đà Nẵng',         lat: 16.0544, lng: 108.2022, zoom: 13 },
  { name: 'Cần Thơ',         lat: 10.0341, lng: 105.7878, zoom: 13 },
]

function ControlledMap() {
  const [mapInstance, setMapInstance] = useState<VnMapInstance | null>(null)
  const [activeCity, setActiveCity] = useState<string>('Hà Nội')

  function flyToCity(city: typeof CITIES[0]) {
    if (!mapInstance) return
    mapInstance.flyTo({ center: [city.lng, city.lat], zoom: city.zoom, duration: 1000 })
    setActiveCity(city.name)
  }

  return (
    <section>
      <h2>Điều hướng bản đồ</h2>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {CITIES.map((city) => (
          <button
            key={city.name}
            onClick={() => flyToCity(city)}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: '1px solid #1565c0',
              background: activeCity === city.name ? '#1565c0' : '#fff',
              color: activeCity === city.name ? '#fff' : '#1565c0',
              cursor: 'pointer',
              fontFamily: 'sans-serif',
              fontSize: 14,
              fontWeight: 500,
              transition: 'background .15s',
            }}
          >
            {city.name}
          </button>
        ))}
      </div>

      <VnMap
        apiKey="YOUR_API_KEY"
        height={450}
        lat={21.0245}
        lng={105.8412}
        zoom={13}
        onLoad={(map) => {
          setMapInstance(map)
          map.addControl(new (window as any).vnMap.NavigationControl(), 'top-right')
        }}
      />
    </section>
  )
}

// ============================================================
// App chính
// ============================================================
export default function App() {
  const [tab, setTab] = useState<'basic' | 'marker' | 'controlled'>('basic')

  const tabs: { key: typeof tab; label: string }[] = [
    { key: 'basic',      label: 'Cơ bản' },
    { key: 'marker',     label: 'Marker & Popup' },
    { key: 'controlled', label: 'Điều hướng' },
  ]

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      <h1 style={{ color: '#1565c0', marginBottom: 4 }}>VnMap — React Examples</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        Demo các tính năng của VnMap trong ứng dụng React.
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '2px solid #e0e0e0' }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderBottom: tab === t.key ? '2px solid #1565c0' : '2px solid transparent',
              background: 'transparent',
              color: tab === t.key ? '#1565c0' : '#555',
              cursor: 'pointer',
              fontFamily: 'sans-serif',
              fontSize: 15,
              fontWeight: tab === t.key ? 600 : 400,
              marginBottom: -2,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'basic'      && <BasicMap />}
      {tab === 'marker'     && <MarkerMap />}
      {tab === 'controlled' && <ControlledMap />}
    </div>
  )
}