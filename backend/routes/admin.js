
const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Attendance = require('../models/Attendance');
const { loggedInUsers } = require('../utils/authStore');
const Location = require('../models/Location')
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const Distance=require('../models/Distance')
const upload = require('../middleware/upload');
// Middleware to verify JWT & admin role
function verifyAdminToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Malformed token' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Admin login using email (not username)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
 
    if (!admin) return res.status(401).send('Invalid credentials');

    const valid = await bcrypt.compare(password, admin.password);
    
    if (!valid) return res.status(401).send('Invalid credentials');

    const token = jwt.sign({ id: admin._id, role: 'admin' }, JWT_SECRET);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin adds a user (secured)
// router.post('/users', verifyAdminToken, async (req, res) => {
//   const { name, email, password, address, salary } = req.body;
//   try {
//     const existingUser = await User.findOne({ email });
//     if (existingUser) return res.status(400).json({ error: 'Email already exists' });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = new User({ name, email, password: hashedPassword, address, salary });
//     await newUser.save();
//     res.json({ message: 'User created', user: newUser });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// router.post('/users', verifyAdminToken, async (req, res) => {
//   const { name, email, password, address, salary, phoneNumber } = req.body;

//   try {
//     const existingUser = await User.findOne({ email });
//     if (existingUser) return res.status(400).json({ error: 'Email already exists' });

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = new User({
//       name,
//       email,
//       password: hashedPassword,
//       address,
//       salary,
//       phoneNumber, // ✅ include this
//     });

//     await newUser.save();
//     res.json({ message: 'User created', user: newUser });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

router.post(
  '/users',
  verifyAdminToken,
  upload.single('image'), // 👈 Handle single image upload
  async (req, res) => {
    try {
      const { name, email, password, address, salary, phoneNumber } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ error: 'Email already exists' });

      const hashedPassword = await bcrypt.hash(password, 10);
      const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        address,
        salary,
        phoneNumber,
        imagePath, // ✅ Save image path in DB
      });

      await newUser.save();
      res.status(201).json({ message: 'User created', user: newUser });
    } catch (err) {
      console.error('User creation error:', err);
      res.status(400).json({ error: err.message });
    }
  }
);

// Fetch all users (secured, admin only)
router.get('/users', verifyAdminToken, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a user by ID
// router.delete('/users/:id', verifyAdminToken, async (req, res) => {
//   try {
//     await User.findByIdAndDelete(req.params.id);
//     res.status(200).json({ message: 'Employee deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to delete employee' });
//   }
// });

// DELETE a user by ID and all related records
router.delete('/users/:id', verifyAdminToken, async (req, res) => {
  const userId = req.params.id;

  try {
    // Delete the user
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Delete all locations of the user
    await require('../models/Location').deleteMany({ userId });

    // Delete all attendance records of the user
    await require('../models/Attendance').deleteMany({ userId });

    await require('../models/Distance').deleteMany({userId});

    res.status(200).json({ message: 'User and all related records deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user and related data' });
  }
});


// PUT (edit) a user by ID
// router.put('/users/:id', verifyAdminToken, async (req, res) => {
//   const { name, email, address, salary,phoneNumber } = req.body;
//   try {
//     const updatedUser = await User.findByIdAndUpdate(
//       req.params.id,
//       { name, email, address, salary,phoneNumber },
//       { new: true }
//     ).select('-password');
//     res.status(200).json(updatedUser);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to update employee' });
//   }
// });

router.put(
  '/users/:id',
  verifyAdminToken,
  upload.single('image'), // Handle optional single image upload
  async (req, res) => {
    try {
      const { name, email, address, salary, phoneNumber } = req.body;

      // Build update object with fields from req.body
      let updateData = { name, email, address, salary, phoneNumber };

      // If a new image file is uploaded, add imagePath to update data
      if (req.file) {
        updateData.imagePath = `/uploads/${req.file.filename}`;
      }

      // Update the user
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      ).select('-password');

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json(updatedUser);
    } catch (err) {
      console.error('User update error:', err);
      res.status(500).json({ error: 'Failed to update employee' });
    }
  }
);


// GET admin profile (secured)
router.get('/profile', verifyAdminToken, async (req, res) => {
  try {
    
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin profile' });
  }
});

// PUT admin profile (secured)
router.put('/profile', verifyAdminToken, async (req, res) => {
  const { name, email, organization, password, address } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (organization) updateData.organization = organization;
  if (address) updateData.address = address;
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    updateData.password = hashedPassword;
  }

  try {
    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.admin.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!updatedAdmin) return res.status(404).json({ error: 'Admin not found' });
    res.json(updatedAdmin);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update admin profile' });
  }
});

router.get('/dashboard-summary', verifyAdminToken, async (req, res) => {
  try {
    const totalEmployees = await User.countDocuments();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // First await the distinct result, then get length
    const presentUserIds = await Attendance.distinct("userId", {
      date: { $gte: today, $lt: tomorrow }
    });

    const presentToday = presentUserIds.length;

    const locations = loggedInUsers?.size || 0; // safety check

    // console.log(totalEmployees, presentToday, locations);

    res.json({
      totalEmployees,
      presentToday,
      locations
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


router.get('/location-history', verifyAdminToken, async (req, res) => {
  const { userId } = req.query;

  // console.log(userId)
  const { date, page = 1, limit = 24 } = req.query;

  const query = { userId };
  let targetDate = date ? new Date(date) : new Date(); // Use today if no date

  // Normalize the date range to the full day
  const startDate = new Date(targetDate);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(targetDate);
  endDate.setHours(23, 59, 59, 999);

  query.timestamp = { $gte: startDate, $lte: endDate };

  try {
    const skip = (page - 1) * limit;
    const locations = await Location.find(query)
      .sort({ timestamp: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .lean();

    res.json(locations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});




// GET today's distance records
router.get('/distance/today', verifyAdminToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const distances = await Distance.find({ date: today }).populate('userId', 'name email');
    res.json(distances);
  } catch (error) {
    console.error('Error in /distance/today:', error);
    res.status(500).json({ error: error.message });
  }
});


// GET distances by search (email/date)
router.get('/distance/search',verifyAdminToken, async (req, res) => {
  try {
    const { date, email } = req.query;

    let query = {};
    let user;

    if (email) {
  user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) {
    return res.status(400).json({ message: 'Entered mail id is wrong' });
  }
  query.userId = user._id;
}


    if (date) {
      query.date = date;
    }

    let distances = await Distance.find(query).populate('userId', 'name email');

    if (date && !email) {
      // Only date provided: sort by totalDistance descending
      distances = distances.sort((a, b) => b.totalDistance - a.totalDistance);
    } else if (email && !date) {
      // Only email provided: get latest record for that user (sorted by date descending, return first)
      distances = distances.sort((a, b) => new Date(b.date) - new Date(a.date));
      if (distances.length > 0) distances = [distances[0]];
    } else if (email && date) {
      // Both date and email: sort by date descending (redundant since date fixed, but kept for clarity)
      distances = distances.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    return res.json(distances);
  } catch (error) {
    console.error('Error fetching distance data:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});


// GET full travel distance history by user ID
router.get('/distance/user/:userId', verifyAdminToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await Distance.find({ userId }).sort({ date: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/user-profile', verifyAdminToken, async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId query parameter is required' });
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Construct full URL for image if imagePath exists
    const imageUrl = user.imagePath
      ? `${req.protocol}://${req.get('host')}${user.imagePath}`
      : null;

    // Respond with user details including image URL
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      address: user.address,
      salary: user.salary,
      phoneNumber: user.phoneNumber,
      image: imageUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



module.exports = router;

