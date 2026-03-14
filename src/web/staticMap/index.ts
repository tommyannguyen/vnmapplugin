/**
 * staticMap/index.ts — Orchestrator for the vnMap embed feature.
 *
 * Wires together params → loader → telemetry → api in the correct order.
 * vnmap-entry.ts calls boot() as its sole responsibility.
 */

import { resolveParams } from './params'
import { loadMapboxGL } from './loader'
import { suppressMapboxTelemetry } from './telemetry'
import { exposeVnMapApi, fireCallback } from './api'

export async function boot(): Promise<void> {
  const { apiKey, callbackName, origin } = resolveParams()

  const tileUrl = `${origin}/api/map/tiles/{z}/{x}/{y}.pbf?apiKey=${encodeURIComponent(apiKey)}`
  const glyphsUrl = `${origin}/api/map/font/{fontstack}/{range}?apiKey=${encodeURIComponent(apiKey)}`

  const mapboxgl = await loadMapboxGL(origin).catch((err: Error) => {
    console.error(err.message)
    return null
  })

  if (!mapboxgl) return

  suppressMapboxTelemetry()

  // A placeholder token is required by the SDK; real auth is the apiKey in tile URLs
  mapboxgl.accessToken = 'pk.placeholder'

  exposeVnMapApi(mapboxgl, tileUrl, glyphsUrl)
  fireCallback(callbackName)
}
