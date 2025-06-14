// jobs/distanceCron.js

const cron = require('node-cron');
const User = require('../models/User');
const { computeAndStoreDailyDistance } = require('../utils/distanceCalculator');

cron.schedule('*/3600 * * * * *', async () => {
  const users = await User.find();
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10); // Today's date

  for (const user of users) {
    await computeAndStoreDailyDistance(user._id, dateStr);
  }

//   console.log(`[${new Date().toLocaleTimeString()}] Distance updated for ${dateStr}`);
});
