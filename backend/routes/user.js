
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Attendance = require('../models/Attendance');
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const mongoose = require('mongoose'); 
const Location = require('../models/Location');
const Distance = require('../models/Distance');
const upload = require('../middleware/upload');
// User login using email
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).send('Invalid email or password');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send('Invalid email or password');

    const token = jwt.sign(
      { id: user._id, role: 'user', email: user.email },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token });
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'Login failed. Try again later.' });
  }
});

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(403).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(403).json({ error: 'Malformed token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    return res.status(403).json({ error: 'Invalid token or server error' });
  }
};

router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -__v');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// router.put('/profile', authenticate, async (req, res) => {
//   try {
//     const updateData = { ...req.body };

//     if (updateData.password) {
//       const salt = await bcrypt.genSalt(10);
//       updateData.password = await bcrypt.hash(updateData.password, salt);
//     } else {
//       delete updateData.password;
//     }

//     // Check if email already exists for another user
//     if (updateData.email) {
//       const existingUser = await User.findOne({
//         email: updateData.email,
//         _id: { $ne: req.userId },
//       });
//       if (existingUser) {
//         return res.status(400).json({ error: 'Email already in use' });
//       }
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//       req.userId,
//       updateData,
//       { new: true, runValidators: true }
//     ).select('-password -__v');

//     if (!updatedUser) return res.status(404).json({ message: 'User not found' });

//     res.json(updatedUser);
//   } catch (err) {
//     console.error('DB error:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

router.put('/profile', authenticate, upload.single('image'), async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Handle password hashing if provided
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    } else {
      delete updateData.password;
    }

    // Handle image upload
    if (req.file) {
      updateData.imagePath = `/uploads/${req.file.filename}`;
    }

    // Check if email already exists for another user
    if (updateData.email) {
      const existingUser = await User.findOne({
        email: updateData.email,
        _id: { $ne: req.userId },
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -__v');

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.json(updatedUser);
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get("/dashboard-summary", authenticate, async (req, res) => {
  try {
    const userId = req.userId;

if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
  return res.status(400).json({ message: "Invalid or missing userId" });
}
const result = await User.aggregate([
  {
    $match: {
      _id: new mongoose.Types.ObjectId(userId)  // Convert userId to ObjectId
    }
  },
  {
    $addFields: {
      daysSinceJoined: {
        $dateDiff: {
          startDate: { $add: ["$createdAt", 19800000] }, // IST adjustment (+5:30 hours)
          endDate: { $add: ["$$NOW", 19800000] },         // IST adjustment (+5:30 hours)
          unit: "day"
        }
      }
    }
  },
  {
    $project: {
      _id: 0,
      name: 1,
      email: 1,
      daysSinceJoined: 1
    }
  }
]);

    const todayStr = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'

    const todayDistanceEntry = await Distance.findOne({
      userId: userId,
      date: todayStr,
    });

    const totalDistanceToday = todayDistanceEntry?.totalDistance || 0;


  const totalDays = result[0].daysSinceJoined + 1;
  // console.log(result);
  // console.log("Total days since joined (IST):", totalDays);

    // const totalDays = Math.floor((today - createdAt) / (1000 * 60 * 60 * 24)) + 1;

    const presentDaysAgg = await Attendance.aggregate([
  {
    $match: {
      userId: new mongoose.Types.ObjectId(userId)
    }
  },
  {
    $addFields: {
      istDate: {
        $dateToString: {
          date: { $add: ["$date", 19800000] }, // 5.5 hours in milliseconds
          format: "%Y-%m-%d"
        }
      }
    }
  },
  {
    $group: {
      _id: "$istDate"
    }
  },
  {
    $count: "uniqueDays"
  }
]);

const presentDays = presentDaysAgg[0]?.uniqueDays || 0;


    const latestLocation = await Location.findOne({ userId })
      .sort({ createdAt: -1 })
      .select("lat lng")
      .lean();

    res.json({
      totalDays,
      presentDays,
      latestLocation: {
        lat: latestLocation?.lat || null,
        lng: latestLocation?.lng || null,
      },
       totalDistanceToday: totalDistanceToday.toFixed(2) + " km",
    });
  } catch (err) {
    console.error("Dashboard summary error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


async function fetchWithRetry(url, options = {}, retries = 1, timeoutMs = 8000) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return response;
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        console.warn(`🕒 Timeout on attempt ${attempt + 1}`);
        if (attempt === retries) throw err;
      } else {
        throw err;
      }
    }
  }
}

router.get('/reverse-geocode', authenticate, async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude required' });
  }

  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;

  try {
    const response = await fetchWithRetry(url, {
      headers: {
        'User-Agent': 'EmpTracker/1.0 (praveen@example.com)', // Replace with real contact
      },
    }, 1, 8000); // 1 retry, 8s timeout

    if (!response.ok) {
      const text = await response.text();
      console.error('❌ Nominatim responded with error:', text);
      return res.status(response.status).json({ error: 'Failed to reverse geocode' });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('❌ Error in reverse geocode route:', err);
    res.status(500).json({ error: 'Geocoding failed' });
  }
});




module.exports = router;
