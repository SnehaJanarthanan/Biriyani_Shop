/** Distance between two lat/lng points in kilometres (Earth sphere approximation). */
function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Rough urban ETA assuming ~25 km/h average door-to-door speed in Hyderabad traffic. */
function estimateTravelMinutes(distanceKm) {
  const avgSpeedKmh = 25;
  return Math.max(5, Math.round((distanceKm / avgSpeedKmh) * 60));
}

module.exports = { haversineKm, estimateTravelMinutes };
