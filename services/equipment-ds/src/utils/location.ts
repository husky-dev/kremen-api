export interface LatLng {
  lat: number;
  lng: number;
}

export const strToLatLng = (val: string): LatLng | undefined => {
  if (!val) {
    return undefined;
  }
  const parts = val.split(',');
  if (parts.length !== 2) return undefined;
  const lat = parseFloat(parts[0]);
  if (isNaN(lat)) {
    return undefined;
  }
  const lng = parseFloat(parts[1]);
  if (isNaN(lng)) {
    return undefined;
  }
  return { lat, lng };
};
