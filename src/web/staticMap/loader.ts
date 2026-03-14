/**
 * loader.ts — Dynamically loads vn-map-gl JS + CSS from the same origin.
 *
 * The files are served from {origin}/dist/ (copied into public/dist/ at build time).
 * The CSS link is injected immediately; the JS script fires onload/onerror.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function loadMapboxGL(origin: string): Promise<any> {
  const base = `${origin}/dist`

  // Inject CSS immediately (non-blocking)
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `${base}/vn-map-gl.css`
  document.head.appendChild(link)

  // Load JS and resolve with the global mapboxgl object
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `${base}/vn-map-gl.js`
    script.onload = () => resolve((window as any).mapboxgl)  // eslint-disable-line @typescript-eslint/no-explicit-any
    script.onerror = () => reject(new Error(`[vnMap] Failed to load vn-map-gl from ${base}.`))
    document.head.appendChild(script)
  })
}
