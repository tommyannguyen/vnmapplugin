/**
 * api.ts — Builds and exposes the public window.vnMap object.
 *
 * All map types (Marker, Popup, NavigationControl, etc.) are exposed
 * directly as vnMap.* by spreading the underlying map lib onto window.
 * Only vnMap.Map is wrapped to inject the tile style automatically
 * and to support the `plugins` option.
 *
 * Plugin support:
 *   const map = new vnMap.Map({
 *     container: 'map',
 *     center: [106.6, 10.8],
 *     zoom: 13,
 *     plugins: ['weather-vietnam'],   // enable plugins
 *     showPluginOptions: true,        // show toggle panel (default: true)
 *   })
 */

import { buildVectorTileStyle } from '../vmapPluginModule'
import { PluginControl } from './pluginControl'

// Register built-in plugins (side-effect imports)
import './plugins/weatherPlugin'

const ATTRIBUTION = '© VnMap tinhocanhminh.com.vn | © OpenStreetMap contributors'

export function exposeVnMapApi(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mapboxgl: any,
  tileUrl: string,
  glyphsUrl: string,
  origin: string,
  apiKey: string,
): void {
  const style = buildVectorTileStyle(tileUrl, 0, 14, ATTRIBUTION, glyphsUrl)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).vnMap = Object.assign({}, mapboxgl, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Map: function (options: Record<string, any> = {}) {
      const {
        plugins,
        showPluginOptions = true,
        ...mapOptions
      } = options

      const map = new mapboxgl.Map({ style, ...mapOptions })

      // Add plugin control if plugins are specified
      const pluginSlugs: string[] = Array.isArray(plugins) ? plugins : []
      if (pluginSlugs.length > 0 && showPluginOptions) {
        const ctx = { origin, apiKey }
        const control = new PluginControl(pluginSlugs, ctx, {
          defaultEnabled: true,
        })
        map.on('load', () => {
          map.addControl(control, 'top-left')
        })
      }

      return map
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
