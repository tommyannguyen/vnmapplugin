import 'mapbox-gl/dist/mapbox-gl.css';

// Block Mapbox telemetry/events requests (web only)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _g = globalThis as any;
if (typeof _g.fetch === 'function') {
  const _originalFetch = _g.fetch as (...args: unknown[]) => Promise<unknown>;
  _g.fetch = function (...args: unknown[]) {
    const url = args[0];
    if (typeof url === 'string' && url.includes('events.mapbox.com')) {
      return Promise.resolve(new _g.Response('{}', { status: 200 }));
    }
    return _originalFetch.apply(_g, args);
  };
}

import vmapPluginModule from './vmapPluginModule';
import Camera from './components/Camera';
import MapView from './components/MapView';
import MarkerView from './components/MarkerView';
import Logger from './utils/Logger';

const ExportedComponents = {
  Camera,
  MapView,
  Logger,
  MarkerView,
};

const vmapPlugin = {
  ...vmapPluginModule,
  ...ExportedComponents,
};

export { Camera, Logger, MapView, MarkerView };

export * from './vmapPluginModule';

export default vmapPlugin;
