const EARTH_RADIUS_METERS = 6371000;

/** Haversine distance between two lat/lng points in meters */
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Snap a point to a boundary centroid (stub — full geo module resolves boundaries) */
export function snapToCentroid(point, boundary) {
  if (boundary?.centroid?.coordinates) {
    const [lng, lat] = boundary.centroid.coordinates;
    return { lat, lng, precision: boundary.level || 'panchayat' };
  }
  return { lat: point.lat, lng: point.lng, precision: 'exact' };
}

/** Check if a point is within a district scope */
export function isInDistrictScope(point, districtCodes = []) {
  if (!districtCodes.length) return true;
  if (!point?.districtCode) return false;
  return districtCodes.includes(point.districtCode);
}

export default { haversineDistance, snapToCentroid, isInDistrictScope };
