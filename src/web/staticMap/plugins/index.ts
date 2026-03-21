/**
 * plugins/index.ts — Plugin registry for the vnMap embed.
 *
 * Each plugin implements VnMapPlugin and is registered by slug.
 * The PluginControl reads this registry to build the toggle UI.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface VnMapPlugin {
  slug: string
  name: string
  icon?: string
  /** Called when the user enables the plugin. Return a cleanup function if needed. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEnable: (map: any, ctx: PluginContext) => void | (() => void)
  /** Called when the user disables the plugin. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDisable?: (map: any) => void
}

export interface PluginContext {
  origin: string
  apiKey: string
}

const registry = new Map<string, VnMapPlugin>()

export function registerPlugin(plugin: VnMapPlugin): void {
  registry.set(plugin.slug, plugin)
}

export function getPlugin(slug: string): VnMapPlugin | undefined {
  return registry.get(slug)
}

export function getRegisteredSlugs(): string[] {
  return Array.from(registry.keys())
}
