import React from 'react';
import {
  MapView,
  Camera,
  ShapeSource,
  FillLayer,
  LineLayer,
  StyleURL,
} from '@rnmapbox/maps';

import sheet from '../../styles/sheet';
import vietnamGeoJSON from '../../assets/vietnam_boundaries.json';

// Vietnam center coordinates (approximate)
const VIETNAM_CENTER: [number, number] = [108.2772, 14.0583];

// Style for Vietnam country boundary (fill)
const countryFillStyle = {
  fillColor: 'rgba(0, 128, 0, 0.1)',
  fillOutlineColor: '#006400',
  fillAntialias: true,
};

// Style for Vietnam country outline
const countryLineStyle = {
  lineColor: '#006400',
  lineWidth: 2,
};

// Style for maritime boundary (Hoàng Sa, Trường Sa - dashed line)
const maritimeBoundaryStyle = {
  lineColor: '#DC143C',
  lineWidth: 2,
  lineDasharray: [2, 2],
};

interface VietnamBoundaryProps {
  navigation?: unknown;
}

function VietnamBoundary(_props: VietnamBoundaryProps) {
  // Extract country polygon (first feature) and maritime lines (second feature)
  const countryFeature = vietnamGeoJSON.features[0];
  const maritimeFeature = vietnamGeoJSON.features[1];

  return (
    <MapView style={sheet.matchParent} styleURL={StyleURL.Light}>
      <Camera
        zoomLevel={5}
        centerCoordinate={VIETNAM_CENTER}
        animationMode="flyTo"
        animationDuration={2000}
      />

      {/* Vietnam country boundary - Fill */}
      <ShapeSource id="vietnamCountrySource" shape={countryFeature as GeoJSON.Feature}>
        <FillLayer id="vietnamFill" style={countryFillStyle} />
        <LineLayer id="vietnamOutline" style={countryLineStyle} />
      </ShapeSource>

      {/* Maritime boundary including Hoàng Sa (Paracel) and Trường Sa (Spratly) */}
      <ShapeSource id="maritimeBoundarySource" shape={maritimeFeature as GeoJSON.Feature}>
        <LineLayer id="maritimeBoundary" style={maritimeBoundaryStyle} />
      </ShapeSource>
    </MapView>
  );
}

export default VietnamBoundary;

/* end-example-doc */

/**
 * @typedef {import('../common/ExampleMetadata').ExampleWithMetadata} ExampleWithMetadata
 * @type {ExampleWithMetadata['metadata']}
 */
const metadata = {
  title: 'Vietnam Boundary',
  tags: ['vietnam', 'hoang-sa', 'truong-sa', 'paracel', 'spratly', 'boundary'],
  docs: 'Displays Vietnam country boundary with maritime boundaries including Hoàng Sa (Paracel Islands) and Trường Sa (Spratly Islands).',
};
(VietnamBoundary as any).metadata = metadata;