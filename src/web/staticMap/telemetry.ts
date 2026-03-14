/**
 * telemetry.ts — Suppresses Mapbox telemetry / map-session network calls.
 *
 * Mapbox GL JS phones home to events.mapbox.com and api.mapbox.com on every
 * map initialisation. We intercept those at the fetch layer and return an
 * empty 200 so they don't produce visible console errors.
 */

const BLOCKED_HOSTS = ['events.mapbox.com', 'api.mapbox.com']

export function suppressMapboxTelemetry(): void {
  const _fetch = window.fetch
  window.fetch = (...args: Parameters<typeof fetch>) => {
    const input = args[0]
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : (input as Request).url
    if (BLOCKED_HOSTS.some((host) => url.includes(host))) {
      return Promise.resolve(new Response('{}', { status: 200 }))
    }
    return _fetch(...args)
  }
}
