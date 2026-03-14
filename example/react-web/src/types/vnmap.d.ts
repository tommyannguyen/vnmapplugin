// types/vnmap.d.ts — Khai báo kiểu cho window.vnMap
export {}

declare global {
  interface Window {
    vnMap: VnMapLib
  }

  interface VnMapLib {
    Map: new (container: HTMLElement | string, options?: VnMapOptions) => VnMapInstance
    LatLng: new (lat: number, lng: number) => [number, number]
    Marker: new (options?: MarkerOptions) => VnMapMarker
    Popup: new (options?: PopupOptions) => VnMapPopup
    NavigationControl: new (options?: NavigationControlOptions) => any
    ScaleControl: new (options?: ScaleControlOptions) => any
  }

  interface VnMapOptions {
    center?: [number, number] | { lat: number; lng: number }
    zoom?: number
    minZoom?: number
    maxZoom?: number
    bearing?: number
    pitch?: number
    interactive?: boolean
    scrollZoom?: boolean
    attributionControl?: boolean
  }

  interface VnMapInstance {
    on(event: string, callback: (e?: any) => void): this
    off(event: string, callback: (e?: any) => void): this
    addControl(control: any, position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'): this
    removeControl(control: any): this
    getCenter(): { lat: number; lng: number }
    setCenter(center: [number, number]): this
    getZoom(): number
    setZoom(zoom: number): this
    flyTo(options: FlyToOptions): this
    easeTo(options: EaseToOptions): this
    fitBounds(bounds: [[number, number], [number, number]], options?: object): this
    remove(): void
  }

  interface FlyToOptions {
    center: [number, number]
    zoom?: number
    bearing?: number
    pitch?: number
    duration?: number
    curve?: number
    speed?: number
  }

  interface EaseToOptions {
    center?: [number, number]
    zoom?: number
    bearing?: number
    pitch?: number
    duration?: number
  }

  interface MarkerOptions {
    color?: string
    draggable?: boolean
    element?: HTMLElement
    offset?: [number, number]
    rotation?: number
  }

  interface VnMapMarker {
    setLngLat(lngLat: [number, number]): this
    getLngLat(): { lat: number; lng: number }
    addTo(map: VnMapInstance): this
    remove(): this
    setPopup(popup: VnMapPopup): this
    getPopup(): VnMapPopup
    togglePopup(): this
    getElement(): HTMLElement
    setDraggable(draggable: boolean): this
    isDraggable(): boolean
    on(event: 'dragstart' | 'drag' | 'dragend', callback: (e?: any) => void): this
  }

  interface PopupOptions {
    closeButton?: boolean
    closeOnClick?: boolean
    focusAfterOpen?: boolean
    anchor?: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
    offset?: number | [number, number]
    maxWidth?: string
    className?: string
  }

  interface VnMapPopup {
    setHTML(html: string): this
    setText(text: string): this
    setLngLat(lngLat: [number, number]): this
    getLngLat(): { lat: number; lng: number }
    addTo(map: VnMapInstance): this
    remove(): this
    isOpen(): boolean
    on(event: string, callback: () => void): this
  }

  interface NavigationControlOptions {
    showCompass?: boolean
    showZoom?: boolean
    visualizePitch?: boolean
  }

  interface ScaleControlOptions {
    maxWidth?: number
    unit?: 'metric' | 'imperial' | 'nautical'
  }
}
