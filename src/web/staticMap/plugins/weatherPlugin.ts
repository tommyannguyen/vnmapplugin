/**
 * plugins/weatherPlugin.ts — Weather Vietnam plugin for the vnMap embed.
 *
 * When enabled, fetches nearby weather stations and shows markers on the map.
 * Re-fetches when the map moves (debounced). Cleans up markers on disable.
 */

import { registerPlugin } from './index'
import type { PluginContext } from './index'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mapboxgl: any

interface WeatherStation {
  stationCode: string
  stationName: string
  latitude: number
  longitude: number
  temperature?: number
  humidity?: number
  windSpeed?: number
  windDirection?: string
  precipitation?: number
  pressure?: number
  distance: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createWeatherPopup(station: WeatherStation): any {
  const html = `
    <div style="font-family:system-ui,sans-serif;min-width:180px;font-size:13px;">
      <div style="font-weight:600;margin-bottom:6px;">${station.stationName}</div>
      <div style="color:#555;line-height:1.6;">
        ${station.temperature != null ? `<div>Nhiet do: <b>${station.temperature}°C</b></div>` : ''}
        ${station.humidity != null ? `<div>Do am: <b>${station.humidity}%</b></div>` : ''}
        ${station.windSpeed != null ? `<div>Gio: <b>${station.windSpeed} m/s ${station.windDirection ?? ''}</b></div>` : ''}
        ${station.precipitation != null ? `<div>Mua: <b>${station.precipitation} mm</b></div>` : ''}
        ${station.pressure != null ? `<div>Ap suat: <b>${station.pressure} hPa</b></div>` : ''}
        <div style="color:#999;margin-top:4px;">Cach ${(station.distance / 1000).toFixed(1)} km</div>
      </div>
    </div>
  `
  return new mapboxgl.Popup({ offset: 25, maxWidth: '240px' }).setHTML(html)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createWeatherMarker(station: WeatherStation): any {
  const el = document.createElement('div')
  const temp = station.temperature != null ? `${Math.round(station.temperature)}°` : '—'
  Object.assign(el.style, {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#ef4444',
    border: '2px solid white',
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '10px',
    fontWeight: '700',
    fontFamily: 'system-ui,sans-serif',
    cursor: 'pointer',
  })
  el.textContent = temp
  el.title = station.stationName

  return new mapboxgl.Marker({ element: el, anchor: 'center' })
    .setLngLat([station.longitude, station.latitude])
    .setPopup(createWeatherPopup(station))
}

registerPlugin({
  slug: 'weather-vietnam',
  name: 'Thoi tiet',
  icon: '🌤',

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEnable(map: any, ctx: PluginContext) {
    // Capture mapboxgl from the window (loaded by the embed loader)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapboxgl = (window as any).mapboxgl || (window as any).vnMap

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const markers: any[] = []
    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    async function fetchAndRender() {
      // Clear existing markers
      markers.forEach(m => m.remove())
      markers.length = 0

      const center = map.getCenter()
      const url = `${ctx.origin}/api/map/marketplace/query/weather-vietnam?lat=${center.lat}&lon=${center.lng}&radius=50000`

      try {
        const res = await fetch(url, {
          headers: { 'X-Api-Key': ctx.apiKey },
        })
        if (!res.ok) return
        const stations: WeatherStation[] = await res.json()

        for (const station of stations) {
          const marker = createWeatherMarker(station).addTo(map)
          markers.push(marker)
        }
      } catch (err) {
        console.warn('[vnMap:weather] Failed to fetch weather stations', err)
      }
    }

    function onMoveEnd() {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(fetchAndRender, 600)
    }

    // Initial fetch
    if (map.loaded()) {
      fetchAndRender()
    } else {
      map.on('load', fetchAndRender)
    }

    map.on('moveend', onMoveEnd)

    // Return cleanup
    return () => {
      map.off('moveend', onMoveEnd)
      if (debounceTimer) clearTimeout(debounceTimer)
      markers.forEach(m => m.remove())
      markers.length = 0
    }
  },
})
