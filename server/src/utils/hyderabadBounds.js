/** Approximate bounding box for Hyderabad city (for validating shop/user relevance). */
const BOUNDS = {
  minLat: 17.2,
  maxLat: 17.6,
  minLng: 78.2,
  maxLng: 78.7,
};

function isWithinHyderabad(lat, lng) {
  return (
    lat >= BOUNDS.minLat &&
    lat <= BOUNDS.maxLat &&
    lng >= BOUNDS.minLng &&
    lng <= BOUNDS.maxLng
  );
}

module.exports = { BOUNDS, isWithinHyderabad };
