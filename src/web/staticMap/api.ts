/**
 * api.ts — Builds and exposes the public window.vnMap object.
 *
 * All map types (Marker, Popup, NavigationControl, etc.) are exposed
 * directly as vnMap.* by spreading the underlying map lib onto window.
 * Only vnMap.Map is wrapped to inject the tile style automatically.
 */

import { buildVectorTileStyle } from '../vmapPluginModule'

const ATTRIBUTION = '© VnMap tinhocanhminh.com.vn | © OpenStreetMap contributors'

export function exposeVnMapApi(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mapboxgl: any,
  tileUrl: string,
  glyphsUrl: string,
): void {
  const style = buildVectorTileStyle(tileUrl, 0, 14, ATTRIBUTION, glyphsUrl)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).vnMap = Object.assign({}, mapboxgl, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Map: function(container: HTMLElement | string, options: Record<string, any> = {}) {
      return new mapboxgl.Map({ container, style, ...options })
    },
  })
}

export function fireCallback(callbackName: string): void {
  if (!callbackName) return
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cb = (window as any)[callbackName]
  if (typeof cb === 'function') {
    cb()
  } else {
    console.warn(`[vnMap] Callback "${callbackName}" is not defined on window.`)
  }
}
