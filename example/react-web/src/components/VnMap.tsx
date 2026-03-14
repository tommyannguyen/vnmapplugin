import React, { useEffect, useRef, useState, CSSProperties } from 'react'

const SCRIPT_ID = 'vnmap-script'

export interface VnMapProps {
  /** API key từ dashboard VnMap (bắt buộc) */
  apiKey: string
  /** URL server VnMap (mặc định: http://localhost:5000/static) */
  scriptUrl?: string
  /** Chiều rộng container */
  width?: string | number
  /** Chiều cao container (bắt buộc) */
  height?: string | number
  /** Kinh độ trung tâm ban đầu (mặc định: TP.HCM) */
  lng?: number
  /** Vĩ độ trung tâm ban đầu (mặc định: TP.HCM) */
  lat?: number
  /** Mức zoom ban đầu (0–22, mặc định: 13) */
  zoom?: number
  /** Class CSS bổ sung */
  className?: string
  /** Style bổ sung */
  style?: CSSProperties
  /** Gọi sau khi bản đồ tải xong, nhận instance map */
  onLoad?: (map: VnMapInstance) => void
  /** Gọi khi có lỗi */
  onError?: (message: string) => void
}

/**
 * Component VnMap cho React (web).
 *
 * Tự động tải script vnmap.js một lần duy nhất (kể cả khi render nhiều VnMap).
 * Cleanup map instance khi component unmount.
 *
 * @example
 * <VnMap
 *   apiKey="YOUR_API_KEY"
 *   height={500}
 *   lat={10.8231}
 *   lng={106.6297}
 *   zoom={14}
 *   onLoad={(map) => console.log('Map sẵn sàng', map)}
 * />
 */
export function VnMap({
  apiKey,
  scriptUrl = 'http://localhost:5000/static',
  width = '100%',
  height = 400,
  lng = 106.6297,
  lat = 10.8231,
  zoom = 13,
  className,
  style,
  onLoad,
  onError,
}: VnMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<VnMapInstance | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let destroyed = false

    function createMap() {
      if (destroyed || !containerRef.current || mapRef.current) return

      const vnMap = (window as any).vnMap as VnMapLib
      const map = new vnMap.Map(containerRef.current, {
        center: [lng, lat],
        zoom,
      })
      mapRef.current = map

      map.on('load', () => {
        if (!destroyed) onLoad?.(map)
      })
    }

    function loadScript() {
      // Script đã tải rồi → tạo map ngay
      if ((window as any).vnMap) {
        createMap()
        return
      }

      // Script đang tải → chờ callback toàn cục
      if (document.getElementById(SCRIPT_ID)) {
        // Một instance khác đang tải — lắng nghe sự kiện tùy chỉnh
        const handler = () => createMap()
        window.addEventListener('vnmap:ready', handler, { once: true })
        return () => window.removeEventListener('vnmap:ready', handler)
      }

      // Tạo script mới
      const callbackName = `__vnmap_init_${Date.now()}`
      ;(window as any)[callbackName] = () => {
        delete (window as any)[callbackName]
        window.dispatchEvent(new Event('vnmap:ready'))
        createMap()
      }

      const script = document.createElement('script')
      script.id = SCRIPT_ID
      script.src = `${scriptUrl}?key=${encodeURIComponent(apiKey)}&callback=${callbackName}`
      script.async = true
      script.onerror = () => {
        const msg = 'Không thể tải VnMap. Kiểm tra API key và kết nối mạng.'
        if (!destroyed) {
          setError(msg)
          onError?.(msg)
        }
      }
      document.head.appendChild(script)
    }

    loadScript()

    return () => {
      destroyed = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div
        className={className}
        style={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff3f3',
          color: '#c62828',
          fontFamily: 'sans-serif',
          fontSize: 14,
          border: '1px solid #ffcdd2',
          borderRadius: 6,
          padding: 16,
          textAlign: 'center',
          ...style,
        }}
      >
        ⚠️ {error}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width, height, ...style }}
    />
  )
}
