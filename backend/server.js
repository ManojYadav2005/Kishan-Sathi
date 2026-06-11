require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'kishan_sathi_secret_2025_change_in_prod';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kishan-sathi';

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB connected to kishan-sathi'))
  .catch((err) => { console.error('MongoDB connection error:', err.message); process.exit(1); });

['uploads/stores', 'uploads/forum', 'uploads/avatars'].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No token provided.' });
  }
  try {
    req.user = jwt.verify(header.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try { req.user = jwt.verify(header.split(' ')[1], JWT_SECRET); } catch {}
  }
  next();
}

const makeUpload = (dest) =>
  multer({
    storage: multer.diskStorage({
      destination: dest,
      filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) =>
      file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Images only')),
  });

const storeUpload = makeUpload('uploads/stores/');
const avatarUpload = makeUpload('uploads/avatars/');

app.use('/api/auth', authRoutes);

const ForumPost = mongoose.model(
  'ForumPost',
  new mongoose.Schema(
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      user: { type: String, default: 'Anonymous Farmer' },
      title: { type: String, required: true },
      message: { type: String, required: true },
      topic: { type: String, default: 'General' },
      likes: { type: Number, default: 0 },
      likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      comments: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
          user: { type: String, required: true },
          message: { type: String, required: true },
          createdAt: { type: Date, default: Date.now }
        }
      ]
    },
    { timestamps: true }
  )
);

const LocalStore = mongoose.model(
  'LocalStore',
  new mongoose.Schema(
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      name: { type: String, required: true },
      address: { type: String, required: true },
      phone: { type: String, required: true },
      category: { type: String, default: 'General' },
      mapLink: { type: String, default: null },
      imagePath: { type: String, default: null },
      district: { type: String, default: null },
      state: { type: String, default: 'Uttar Pradesh' },
    },
    { timestamps: true }
  )
);

const Order = mongoose.model(
  'Order',
  new mongoose.Schema(
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      customerName: { type: String, required: true },
      address: { type: String, required: true },
      phone: { type: String, required: true },
      payment: { type: String },
      items: { type: mongoose.Schema.Types.Mixed, required: true },
      total: { type: Number, required: true },
      status: { type: String, default: 'pending', enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] },
    },
    { timestamps: true }
  )
);

// Clean up dummy posts (posts without a valid registered user ID)
ForumPost.deleteMany({ userId: null })
  .then(() => console.log('Cleaned up dummy posts from the database.'))
  .catch((err) => console.error('Error cleaning up dummy posts:', err.message));

app.get('/api/forum/posts', async (req, res) => {
  const { topic, search, sort = 'newest' } = req.query;
  const filter = {};
  if (topic) filter.topic = topic;
  if (search) filter.$or = [{ title: new RegExp(search, 'i') }, { message: new RegExp(search, 'i') }, { user: new RegExp(search, 'i') }];
  const sortObj = sort === 'popular' ? { likes: -1, createdAt: -1 } : { createdAt: -1 };
  try {
    const posts = await ForumPost.find(filter).sort(sortObj);
    res.json({ success: true, posts });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/forum/posts', authMiddleware, async (req, res) => {
  const { title, message, topic = 'General' } = req.body;
  if (!title || !message) return res.status(400).json({ success: false, error: 'Title and message required.' });
  const userId = req.user.id;
  try {
    const User = require('./models/User');
    const userObj = await User.findById(userId);
    if (!userObj) return res.status(404).json({ success: false, error: 'User not found.' });
    const post = await ForumPost.create({ userId, user: userObj.name, title: title.trim(), message: message.trim(), topic });
    res.status(201).json({ success: true, post });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/forum/posts/:id/like', optionalAuth, async (req, res) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Login to like posts.' });
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, error: 'Post not found.' });
    const uid = req.user.id;
    const alreadyLiked = post.likedBy.map(String).includes(String(uid));
    if (alreadyLiked) {
      post.likedBy = post.likedBy.filter((id) => String(id) !== String(uid));
      post.likes = Math.max(0, post.likes - 1);
      await post.save();
      res.json({ success: true, action: 'unliked' });
    } else {
      post.likedBy.push(uid);
      post.likes += 1;
      await post.save();
      res.json({ success: true, action: 'liked' });
    }
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/forum/posts/:id/comment', authMiddleware, async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ success: false, error: 'Comment message is required.' });
  const userId = req.user.id;
  try {
    const User = require('./models/User');
    const userObj = await User.findById(userId);
    if (!userObj) return res.status(404).json({ success: false, error: 'User not found.' });
    const userName = userObj.name;

    const post = await ForumPost.findById(req.params.id).populate('userId');
    if (!post) return res.status(404).json({ success: false, error: 'Post not found.' });

    const comment = {
      userId,
      user: userName,
      message: message.trim(),
      createdAt: new Date()
    };
    post.comments = post.comments || [];
    post.comments.push(comment);
    await post.save();

    if (post.userId && post.userId.email) {
      try {
        const sendEmail = require('./utils/sendEmail');
        await sendEmail({
          to: post.userId.email,
          subject: `New comment on your discussion: ${post.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 8px;">
              <h2 style="color: #2e7d32;">Hello ${post.userId.name || 'Farmer'},</h2>
              <p style="font-size: 16px;">Someone commented on your discussion: <strong style="color: #1b5e20;">"${post.title}"</strong>.</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 14px; color: #555;"><strong>${userName}</strong> wrote:</p>
              <blockquote style="background: #f1f8e9; border-left: 4px solid #81c784; padding: 12px 18px; margin: 15px 0; border-radius: 4px; font-style: italic; font-size: 15px;">
                "${message.trim()}"
              </blockquote>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 13px; color: #777;">Thank you for being part of the Kishan Sathi community!</p>
              <p style="font-size: 13px; color: #777;">Best regards,<br/><strong>Kishan Sathi Team 🚜</strong></p>
            </div>
          `
        });
      } catch (emailErr) {
        console.error('Failed to send comment notification email:', emailErr.message);
      }
    }
    res.status(201).json({ success: true, comments: post.comments });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.get('/api/forum/stats', async (req, res) => {
  try {
    const total = await ForumPost.countDocuments();
    const users = await ForumPost.distinct('user');
    const agg = await ForumPost.aggregate([{ $group: { _id: null, totalLikes: { $sum: '$likes' } } }]);
    res.json({ success: true, total, users: users.length, totalLikes: agg[0]?.totalLikes || 0 });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.delete('/api/forum/posts/:id', authMiddleware, async (req, res) => {
  try { await ForumPost.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.get('/api/stores', async (req, res) => {
  const { district, state = 'Uttar Pradesh' } = req.query;
  const filter = { state };
  if (district) filter.district = district;
  try {
    const stores = await LocalStore.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, stores });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/stores', optionalAuth, storeUpload.single('storeImage'), async (req, res) => {
  const { name, address, phone, category = 'General', mapLink, district, state = 'Uttar Pradesh' } = req.body;
  if (!name || !address || !phone) return res.status(400).json({ success: false, error: 'Name, address and phone required.' });
  const imagePath = req.file ? `/uploads/stores/${req.file.filename}` : null;
  try {
    const store = await LocalStore.create({ userId: req.user?.id || null, name, address, phone, category, mapLink: mapLink || null, imagePath, district: district || null, state });
    res.status(201).json({ success: true, store });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.delete('/api/stores/:id', authMiddleware, async (req, res) => {
  try {
    const store = await LocalStore.findById(req.params.id);
    if (store?.imagePath) {
      const full = path.join(__dirname, store.imagePath);
      if (fs.existsSync(full)) fs.unlinkSync(full);
    }
    await LocalStore.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/orders', optionalAuth, async (req, res) => {
  const { customerName, address, phone, payment, items, total } = req.body;
  if (!customerName || !address || !phone || !items || !total) return res.status(400).json({ success: false, error: 'All fields required.' });
  try {
    const order = await Order.create({ userId: req.user?.id || null, customerName, address, phone, payment, items, total });
    res.status(201).json({ success: true, orderId: order._id });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.get('/api/orders', authMiddleware, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user.id };
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.patch('/api/orders/:id/status', authMiddleware, async (req, res) => {
  const valid = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (!valid.includes(req.body.status)) return res.status(400).json({ success: false, error: 'Invalid status.' });
  try {
    await Order.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const User = require('./models/User');
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      district: user.district,
      role: user.role,
      avatar_path: user.avatar_path,
      lang: user.lang,
      created_at: user.createdAt,
      last_login: user.updatedAt,
    };
    res.json({ success: true, user: payload });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/auth/profile', authMiddleware, avatarUpload.single('avatar'), async (req, res) => {
  try {
    const User = require('./models/User');
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

    const { name, phone, district, lang, currentPassword, newPassword } = req.body;

    if (currentPassword && newPassword) {
      const bcrypt = require('bcryptjs');
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) return res.status(400).json({ success: false, error: 'Incorrect current password.' });
      if (newPassword.length < 6) return res.status(400).json({ success: false, error: 'New password must be 6+ characters.' });
      user.password = await bcrypt.hash(newPassword, 12);
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone ? phone.trim() : null;
    if (district !== undefined) user.district = district || null;
    if (lang) user.lang = lang;
    if (req.file) {
      if (user.avatar_path) {
        const oldPath = path.join(__dirname, user.avatar_path);
        if (fs.existsSync(oldPath)) {
          try { fs.unlinkSync(oldPath); } catch (e) {}
        }
      }
      user.avatar_path = `/uploads/avatars/${req.file.filename}`;
    }

    await user.save();

    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      district: user.district,
      role: user.role,
      avatar_path: user.avatar_path,
      lang: user.lang,
      created_at: user.createdAt,
      last_login: user.updatedAt,
    };
    res.json({ success: true, user: payload });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/ploughing', async (req, res) => {
  try {
    const PloughingService = require('./models/PloughingService');
    const { district } = req.query;
    const filter = {};
    if (district) filter.district = district;
    const services = await PloughingService.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, services });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/ploughing', authMiddleware, async (req, res) => {
  let { providerName, phone, district, village, rates, equipment, rate, tractorDetails } = req.body;
  if (!rates && equipment && rate) {
    rates = {};
    const equipArr = Array.isArray(equipment) ? equipment : [equipment];
    equipArr.forEach(eq => {
      rates[eq] = Number(rate);
    });
  }
  if (!providerName || !phone || !district || !village || !rates || Object.keys(rates).length === 0) {
    return res.status(400).json({ success: false, error: 'All required fields must be filled, including at least one equipment rate.' });
  }
  try {
    const PloughingService = require('./models/PloughingService');
    const service = await PloughingService.create({
      userId: req.user.id,
      providerName: providerName.trim(),
      phone: phone.trim(),
      district: district.trim(),
      village: village.trim(),
      rates,
      tractorDetails: tractorDetails ? tractorDetails.trim() : null,
    });
    res.status(201).json({ success: true, service });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/ploughing/:id', authMiddleware, async (req, res) => {
  try {
    const PloughingService = require('./models/PloughingService');
    const service = await PloughingService.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, error: 'Service listing not found.' });

    if (service.userId && String(service.userId) !== String(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized to delete this listing.' });
    }

    await PloughingService.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const https = require('https');
const Notification = require('./models/Notification');
const User = require('./models/User');

function httpsGetJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(null); // Return null on JSON parse error instead of throwing
        }
      });
    }).on('error', (err) => {
      resolve(null); // Resolve to null on network errors to activate simulated fallback
    });
  });
}

// Helper to analyze weather & create notifications
async function refreshWeatherAlerts(userId, district) {
  if (!district) return [];
  const dateString = new Date().toISOString().split('T')[0];
  
  const districtMap = {
    "Ambedkar Nagar": "Akbarpur", "Amethi": "Gauriganj",
    "Siddharthnagar": "Naugarh", "Sant Kabir Nagar": "Khalilabad",
    "Kasganj": "Kanshiram Nagar", "Shrawasti": "Bhinga", "Kaushambi": "Manjhanpur"
  };
  const city = districtMap[district] || district;
  const apiKey = "8f5a4fa2cfd9c3c00663423cf5c3b3c6";
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)},IN&appid=${apiKey}&units=metric`;

  let alerts = [];
  let fetchedData = null;

  try {
    fetchedData = await httpsGetJSON(url);
  } catch (err) {
    fetchedData = null;
  }

  if (fetchedData && fetchedData.list) {
    let hasRain = false;
    let hasHeat = false;
    let hasWind = false;

    fetchedData.list.forEach((item) => {
      const temp = item.main ? item.main.temp : 25;
      const windSpeed = item.wind ? item.wind.speed : 0;
      const weatherDesc = item.weather && item.weather[0] ? item.weather[0].description.toLowerCase() : "";

      if (weatherDesc.includes("rain") || weatherDesc.includes("storm") || weatherDesc.includes("thunderstorm") || weatherDesc.includes("drizzle")) {
        hasRain = true;
      }
      if (temp > 38) {
        hasHeat = true;
      }
      if (windSpeed > 10) {
        hasWind = true;
      }
    });

    if (hasRain) {
      alerts.push({ titleKey: "alert_rain_title", messageKey: "alert_rain_msg" });
    }
    if (hasHeat) {
      alerts.push({ titleKey: "alert_heat_title", messageKey: "alert_heat_msg" });
    }
    if (hasWind) {
      alerts.push({ titleKey: "alert_wind_title", messageKey: "alert_wind_msg" });
    }
  } else {
    // Simulated fallback based on district name so testing works offline/without API
    const firstLetter = district.charAt(0).toUpperCase();
    if (["A", "L", "V", "F", "G"].includes(firstLetter)) {
      alerts.push({ titleKey: "alert_rain_title", messageKey: "alert_rain_msg" });
    } else if (["K", "M", "S", "B", "C"].includes(firstLetter)) {
      alerts.push({ titleKey: "alert_heat_title", messageKey: "alert_heat_msg" });
    } else {
      alerts.push({ titleKey: "alert_wind_title", messageKey: "alert_wind_msg" });
    }
  }

  // Insert alerts safely to DB using upsert
  for (const alert of alerts) {
    try {
      await Notification.updateOne(
        { userId, titleKey: alert.titleKey, dateString },
        { $setOnInsert: { messageKey: alert.messageKey, type: 'weather_alert', district, read: false } },
        { upsert: true }
      );
    } catch (dbErr) {
      console.error("DB error in upsert notification:", dbErr.message);
    }
  }
}

// Get all notifications for user
app.get('/api/notifications', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Refresh weather notifications
app.post('/api/notifications/refresh', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.district) {
      const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
      return res.json({ success: true, notifications });
    }
    
    await refreshWeatherAlerts(req.user.id, user.district);
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mark all as read
app.patch('/api/notifications/read', authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mark specific notification as read
app.patch('/api/notifications/:id/read', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found.' });
    }
    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/health', (req, res) =>
  res.json({ success: true, status: 'Kishan Sathi API running (MongoDB)', timestamp: new Date().toISOString() })
);

app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'))
);

app.listen(PORT, () => {
  console.log(`Kishan Sathi running at http://localhost:${PORT}`);
});

module.exports = app;
