/**
 * pluginControl.ts — Map control that renders plugin toggle checkboxes.
 *
 * Added to the map when `plugins` option is specified in vnMap.Map().
 * Each plugin gets a labeled checkbox. Toggling calls onEnable/onDisable.
 */

import { getPlugin } from './plugins'
import type { PluginContext } from './plugins'

interface PluginState {
  slug: string
  enabled: boolean
  cleanup?: (() => void) | void
}

export class PluginControl {
  private container: HTMLDivElement | null = null
  private pluginStates: PluginState[] = []
  private ctx: PluginContext
  private defaultEnabled: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private map: any = null

  constructor(
    pluginSlugs: string[],
    ctx: PluginContext,
    options: { defaultEnabled?: boolean } = {},
  ) {
    this.ctx = ctx
    this.defaultEnabled = options.defaultEnabled !== false
    this.pluginStates = pluginSlugs.map(slug => ({
      slug,
      enabled: false,
    }))
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAdd(map: any): HTMLDivElement {
    this.map = map
    this.container = document.createElement('div')
    this.container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group'
    Object.assign(this.container.style, {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      padding: '8px 12px',
      minWidth: '160px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '13px',
    })

    // Title
    const title = document.createElement('div')
    Object.assign(title.style, {
      fontWeight: '600',
      fontSize: '12px',
      color: '#333',
      marginBottom: '6px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    })
    title.textContent = 'Plugins'
    this.container.appendChild(title)

    // Render a checkbox row for each plugin
    for (const state of this.pluginStates) {
      const plugin = getPlugin(state.slug)
      if (!plugin) continue

      const row = document.createElement('label')
      Object.assign(row.style, {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        padding: '4px 0',
        color: '#444',
        userSelect: 'none',
      })

      const checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      checkbox.checked = this.defaultEnabled
      Object.assign(checkbox.style, {
        width: '16px',
        height: '16px',
        cursor: 'pointer',
        accentColor: '#ef4444',
      })

      const label = document.createElement('span')
      label.textContent = `${plugin.icon ? plugin.icon + ' ' : ''}${plugin.name}`

      checkbox.addEventListener('change', () => {
        this.togglePlugin(state, checkbox.checked)
      })

      row.appendChild(checkbox)
      row.appendChild(label)
      this.container.appendChild(row)

      // Auto-enable if defaultEnabled is true
      if (this.defaultEnabled) {
        // Defer to next tick so the map is ready
        const initPlugin = () => {
          this.togglePlugin(state, true)
        }

        if (map.loaded()) {
          initPlugin()
        } else {
          map.on('load', initPlugin)
        }
      }
    }

    return this.container
  }

  onRemove(): void {
    // Disable all plugins before removing
    for (const state of this.pluginStates) {
      if (state.enabled) {
        this.togglePlugin(state, false)
      }
    }
    this.container?.parentNode?.removeChild(this.container)
    this.container = null
    this.map = null
  }

  private togglePlugin(state: PluginState, enabled: boolean): void {
    const plugin = getPlugin(state.slug)
    if (!plugin || !this.map) return

    if (enabled && !state.enabled) {
      state.cleanup = plugin.onEnable(this.map, this.ctx)
      state.enabled = true
    } else if (!enabled && state.enabled) {
      if (typeof state.cleanup === 'function') {
        state.cleanup()
      }
      plugin.onDisable?.(this.map)
      state.cleanup = undefined
      state.enabled = false
    }
  }
}
