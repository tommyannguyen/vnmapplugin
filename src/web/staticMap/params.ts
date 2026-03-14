/**
 * params.ts — Reads configuration from the script's own src URL.
 *
 * All parameters that control map behaviour at embed-time live here.
 * Add new mapProp-style query params in ScriptParams and resolveParams().
 *
 * Supported query params:
 *   key       — API key for tile/glyph authentication (required)
 *   callback  — name of the window function to call once vnMap is ready
 */

declare const __VITE_API_URL__: string

export interface ScriptParams {
  apiKey: string
  callbackName: string
  /** Gateway origin for tile and glyph requests */
  origin: string
}

export function resolveParams(): ScriptParams {
  const el = (document.currentScript ??
    (() => {
      const scripts = document.getElementsByTagName('script')
      return scripts[scripts.length - 1]
    })()) as HTMLScriptElement

  const src = el.src
  const qs = src.includes('?') ? src.slice(src.indexOf('?') + 1) : ''
  const p = new URLSearchParams(qs)

  // Baked-in gateway URL wins over script origin (supports self-hosting)
  const origin = __VITE_API_URL__ || new URL(src).origin

  return {
    apiKey: p.get('key') ?? '',
    callbackName: p.get('callback') ?? '',
    origin,
  }
}
