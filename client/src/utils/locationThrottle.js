import { getDistanceInMeters } from "./distance";

export const shouldSendLocation = (prev, current) => {
  if (!prev) return true;

  const distance = getDistanceInMeters(prev, current);

  return distance > 10;
};
