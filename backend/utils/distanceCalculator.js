// utils/distanceCalculator.js

const Location = require('../models/Location');
const Distance = require('../models/Distance');

function haversineDistance(coord1, coord2) {
  const toRad = angle => (angle * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(coord1.lat)) *
      Math.cos(toRad(coord2.lat)) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function computeAndStoreDailyDistance(userId, date) {
  const locations = await Location.find({
    userId,
    timestamp: {
      $gte: new Date(`${date}T00:00:00.000Z`),
      $lte: new Date(`${date}T23:59:59.999Z`)
    }
  }).sort({ timestamp: 1 });

  let total = 0;
  for (let i = 1; i < locations.length; i++) {
    total += haversineDistance(locations[i - 1], locations[i]);
  }

  await Distance.findOneAndUpdate(
    { userId, date },
    { totalDistance: total },
    { upsert: true, new: true }
  );
}

module.exports = { computeAndStoreDailyDistance };
