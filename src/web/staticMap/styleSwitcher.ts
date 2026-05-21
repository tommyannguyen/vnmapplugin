/**
 * styleSwitcher.ts — Mapbox-GL IControl that renders a small Map/Satellite/
 * Hybrid segmented control and swaps `map.setStyle(...)` on click.
 *
 * Wiring lives in `api.ts`: pass `showStyleSwitcher: true` to vnMap.Map()
 * to auto-mount, or instantiate `new vnMap.StyleSwitcherControl({...})`
 * manually and place it with `map.addControl(...)`.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StyleLike = any
type StyleEntry = StyleLike | (() => StyleLike)

export type StyleMode = 'vector' | 'satellite' | 'hybrid'

export interface StyleSwitcherOptions {
  vector: StyleEntry
  satellite: StyleEntry
  hybrid?: StyleEntry
  initial?: StyleMode
  onChange?: (mode: StyleMode) => void
}

// Minimal inline SVG icons (16x16, currentColor) so the control stays
// self-contained without depending on an icon font / external sprite.
const ICONS: Record<StyleMode, string> = {
  vector:
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>',
  satellite:
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18"></path><path d="M12 3a14 14 0 0 1 0 18"></path><path d="M12 3a14 14 0 0 0 0 18"></path></svg>',
  hybrid:
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 8.5 12 15 2 8.5 12 2"></polygon><polyline points="2 15.5 12 22 22 15.5"></polyline></svg>',
}

const LABELS: Record<StyleMode, string> = {
  vector: 'Bản đồ',
  satellite: 'Vệ tinh',
  hybrid: 'Hybrid',
}

export class StyleSwitcherControl {
  private opts: StyleSwitcherOptions
  private container: HTMLElement | null = null
  private buttons: Partial<Record<StyleMode, HTMLButtonElement>> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private map: any = null
  private current: StyleMode

  constructor(opts: StyleSwitcherOptions) {
    this.opts = opts
    this.current = opts.initial ?? 'vector'
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAdd(map: any): HTMLElement {
    this.map = map
    // Use 'mapboxgl-ctrl' only - NOT 'mapboxgl-ctrl-group'. The -group
    // stylesheet forces `color: transparent; text-indent: -999em` on child
    // buttons (designed for icon-only zoom/compass controls), which hides
    // text labels. We render text + SVG so we manage all styling ourselves.
    const wrap = document.createElement('div')
    wrap.className = 'mapboxgl-ctrl vnmap-style-switcher'
    Object.assign(wrap.style, {
      display: 'inline-flex',
      gap: '2px',
      padding: '4px',
      backgroundColor: 'rgba(255, 255, 255, 0.96)',
      backdropFilter: 'blur(6px)',
      borderRadius: '10px',
      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18), 0 1px 3px rgba(0, 0, 0, 0.08)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      fontSize: '13px',
      lineHeight: '1',
    } as CSSStyleDeclaration)

    const modes: StyleMode[] = ['vector', 'satellite']
    if (this.opts.hybrid !== undefined) modes.push('hybrid')

    for (const mode of modes) {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.title = LABELS[mode]
      btn.setAttribute('aria-label', LABELS[mode])
      btn.innerHTML = `${ICONS[mode]}<span style="margin-left:6px">${LABELS[mode]}</span>`
      // Inline-style everything important so we beat any host stylesheet.
      // `cssText` lets us mark properties !important.
      btn.style.cssText = [
        'all: unset',
        'display: inline-flex',
        'align-items: center',
        'padding: 7px 12px',
        'border-radius: 7px',
        'cursor: pointer',
        'color: #1f2937',
        'font-weight: 600',
        'font-size: 13px',
        'line-height: 1',
        'white-space: nowrap',
        'transition: background-color 120ms ease, color 120ms ease',
        'user-select: none',
      ].join(';')
      btn.addEventListener('mouseenter', () => {
        if (mode !== this.current) btn.style.backgroundColor = 'rgba(0,0,0,0.06)'
      })
      btn.addEventListener('mouseleave', () => {
        if (mode !== this.current) btn.style.backgroundColor = 'transparent'
      })
      btn.addEventListener('click', () => this.select(mode))
      wrap.appendChild(btn)
      this.buttons[mode] = btn
    }

    this.container = wrap
    this.paint()
    return wrap
  }

  onRemove(): void {
    this.container?.parentNode?.removeChild(this.container)
    this.container = null
    this.map = null
  }

  private select(mode: StyleMode): void {
    if (mode === this.current || !this.map) return
    const entry =
      mode === 'vector' ? this.opts.vector :
      mode === 'satellite' ? this.opts.satellite : this.opts.hybrid
    if (entry === undefined) return
    const style = typeof entry === 'function' ? (entry as () => StyleLike)() : entry
    this.map.setStyle(style)
    this.current = mode
    this.paint()
    this.opts.onChange?.(mode)
  }

  private paint(): void {
    for (const [mode, btn] of Object.entries(this.buttons)) {
      if (!btn) continue
      const active = mode === this.current
      btn.style.backgroundColor = active ? '#ef4444' : 'transparent'
      btn.style.color = active ? '#ffffff' : '#1f2937'
      btn.style.boxShadow = active ? '0 1px 3px rgba(239, 68, 68, 0.4)' : 'none'
    }
  }
}
