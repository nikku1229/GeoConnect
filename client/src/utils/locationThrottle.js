export const shouldSendLocation = (prev, current) => {
  if (!prev) return true;

  const distance = getDistance(prev, current);

  return distance > 10; // only if moved 10 meters
};

const getDistance = (a, b) => {
  const R = 6371e3;

  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const deltaLat = ((b.lat - a.lat) * Math.PI) / 180;
  const deltaLon = ((b.lng - a.lng) * Math.PI) / 180;

  const x =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);

  const y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));

  return R * y;
};
