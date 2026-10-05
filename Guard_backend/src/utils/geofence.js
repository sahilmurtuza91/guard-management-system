const EARTH_RADIUS_METERS = 6371000;

// convert degree to radians
const toRad = (value) => (value * Math.PI) / 180;

// distance between two coordinates in meter
const getDistanceInMeters = (lat1, lng1, lat2, lng2) => {
  if ([lat1, lng1, lat2, lng2].some((val) => val === undefined || val === null)) {
    return null;
  }

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

const isWithinGeofence = (guardLat, guardLng, siteLat, siteLng, radiusMeters) => {
  const distance = getDistanceInMeters(guardLat, guardLng, siteLat, siteLng);

  if (distance === null) {
    return { 
      withinFence:false, 
      distance: null,
      locationAvailable: false
    }
  }

  return { withinFence: distance <= radiusMeters, distance };
};

module.exports = {
  getDistanceInMeters,
  isWithinGeofence
};