import 'mapbox-gl/dist/mapbox-gl.css';

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
