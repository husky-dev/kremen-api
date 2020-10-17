import React, { CSSProperties, RefObject, FC, MutableRefObject } from 'react';
import { GoogleMap, GoogleMapProps, withGoogleMap, withScriptjs } from 'react-google-maps';
import { Log } from '@kremen/core';

const log = Log('components.Map');

const apiKey = typeof MAPS_API_KEY !== 'undefined' && MAPS_API_KEY ? MAPS_API_KEY : null;
if (apiKey) {
  log.debug(`GoogleMap key: ${apiKey}`);
} else {
  log.err('Emty GoogleMap key');
}

interface MapProps extends GoogleMapProps {
  mapRef?: RefObject<GoogleMap> | ((instance: GoogleMap | null) => void) | MutableRefObject<GoogleMap | null>;
}

const Map: FC<MapProps> = ({ mapRef, ...props }) => <GoogleMap ref={mapRef} {...props} />;

const WrappedMap = withScriptjs(withGoogleMap(Map));

interface WrappedMapProps extends MapProps {
  style?: CSSProperties;
}

const WrappedMapWithDefault: FC<WrappedMapProps> = ({ style, ...props }) => {
  return (
    <WrappedMap
      googleMapURL={`https://maps.googleapis.com/maps/api/js?libraries=visualization&key=${apiKey}`}
      loadingElement={<div style={style} />}
      containerElement={<div style={style} />}
      mapElement={<div style={style} />}
      {...props}
    />
  );
};

export default WrappedMapWithDefault;