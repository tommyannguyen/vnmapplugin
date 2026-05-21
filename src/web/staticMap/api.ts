/**
 * api.ts — Builds and exposes the public window.vnMap object.
 *
 * All map types (Marker, Popup, NavigationControl, etc.) are exposed
 * directly as vnMap.* by spreading the underlying map lib onto window.
 * Only vnMap.Map is wrapped to inject the tile style automatically
 * and to support `plugins` + `showStyleSwitcher` options.
 *
 * Usage:
 *   const map = new vnMap.Map({
 *     container: 'map',
 *     center: [106.6, 10.8],
 *     zoom: 13,
 *     plugins: ['weather-vietnam'],   // enable plugins
 *     showPluginOptions: true,        // show toggle panel (default: true)
 *     showStyleSwitcher: true,        // show Map/Satellite/Hybrid switcher (default: false)
 *     styleSwitcherPosition: 'top-left',  // any IControl position
 *     styleMode: 'vector',            // initial mode: 'vector'|'satellite'|'hybrid'
 *   })
 *
 *   // At runtime: map.setStyleMode('satellite')
 */

import { buildVectorTileStyle, buildSatelliteStyle, buildHybridStyle } from '../vmapPluginModule'
import { PluginControl } from './pluginControl'
import { StyleSwitcherControl, type StyleMode } from './styleSwitcher'

// Register built-in plugins (side-effect imports)
import './plugins/weatherPlugin'

const ATTRIBUTION = '© VnMap tinhocanhminh.com.vn | © OpenStreetMap contributors'
const SAT_ATTRIBUTION = 'Sentinel-2 cloudless 2024 by EOX IT Services GmbH (CC BY 4.0)'

export function exposeVnMapApi(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mapboxgl: any,
  tileUrl: string,
  satTileUrl: string,
  glyphsUrl: string,
  origin: string,
  apiKey: string,
): void {
  const vectorStyle = () => buildVectorTileStyle(tileUrl, 0, 14, ATTRIBUTION, glyphsUrl)
  const satelliteStyle = () => buildSatelliteStyle(satTileUrl, SAT_ATTRIBUTION)
  const hybridStyle = () =>
    buildHybridStyle(satTileUrl, tileUrl, 0, 14, `${ATTRIBUTION} | ${SAT_ATTRIBUTION}`, glyphsUrl)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const styleBuilders: Record<StyleMode, () => any> = {
    vector: vectorStyle,
    satellite: satelliteStyle,
    hybrid: hybridStyle,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).vnMap = Object.assign({}, mapboxgl, {
    StyleSwitcherControl,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Map: function (options: Record<string, any> = {}) {
      const {
        plugins,
        showPluginOptions = true,
        showStyleSwitcher = false,
        styleSwitcherPosition = 'top-left',
        styleMode,
        ...mapOptions
      } = options

      const initialMode: StyleMode =
        styleMode === 'satellite' || styleMode === 'hybrid' ? styleMode : 'vector'

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const map: any = new mapboxgl.Map({ style: styleBuilders[initialMode](), ...mapOptions })

      // Programmatic style swap without re-creating the map.
      map.setStyleMode = (mode: StyleMode) => {
        if (!(mode in styleBuilders)) {
          console.warn(`[vnMap] unknown styleMode "${mode}" - expected vector|satellite|hybrid`)
          return
        }
        map.setStyle(styleBuilders[mode]())
      }

      if (showStyleSwitcher) {
        map.addControl(
          new StyleSwitcherControl({
            vector: vectorStyle,
            satellite: satelliteStyle,
            hybrid: hybridStyle,
            initial: initialMode,
          }),
          styleSwitcherPosition,
        )
      }

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
