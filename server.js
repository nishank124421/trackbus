require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cloudinary Configuration using secure environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Link Multer's storage engine directly to our Cloudinary profile
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bus_safety_evidence',
    allowed_formats: ['jpg', 'jpeg', 'png']
  }
});

const upload = multer({ storage: storage });
const prisma = new PrismaClient();
const express = require('express');

const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const fs = require('fs');

const jwt = require('jsonwebtoken');
const { createServer } = require('http');
const { Server } = require('socket.io');
const JWT_SECRET = process.env.JWT_SECRET || 'trackbus_jwt_secret_2025';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
app.set('io', io);
io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('🔌 Socket disconnected:', socket.id);
  });
});
const PORT = 3000;

// ─── MIDDLEWARES ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // Body-parser (built into Express)
app.use(cookieParser());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'html', 'PROJECT'));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use(session({
  secret: 'bus_tracking_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 }
}));

// Request logger middleware
app.use((req, res, next) => {
  const time = new Date().toLocaleTimeString();
  console.log(`[${time}] ${req.method} → ${req.url}`);
  next();
});

app.use(express.static(path.join(__dirname)));
app.use('/js', express.static(path.join(__dirname, 'js/PROJECT')));
app.use('/css', express.static(path.join(__dirname, 'css/PROJECT')));
// ─── AUTH MIDDLEWARE ─────────────────────────────────────────────────────────
const checkAuth = (req, res, next) => {
  if (req.session && req.session.user && req.session.isLoggedIn) {
    next();
  } else {
    res.redirect('/login');
  }
};
// ─── ROUTE IMPORTS ───────────────────────────────────────────────────────────
const reportRoutes = require('./routes/reportRoutes');
const bookingRoutes = require('./routes/bookingRoutes');  // NEW
const reviewRoutes = require('./routes/reviewRoutes');    // NEW

app.use('/reports', reportRoutes);
app.use('/book-ticket', bookingRoutes);   // NEW: /book-ticket/tickets, /book-ticket/cities etc.
app.use('/reviews', reviewRoutes);        // NEW: /reviews GET/POST/DELETE

// ─── HELPER ──────────────────────────────────────────────────────────────────
const getProjectData = async (req) => {
  try {
    // ✅ SAFE CHECK
    if (!req.session || !req.session.user) {
      return { user: null, reviews: [], cities: [], routes: [] };
    }
    const user = await prisma.user.findUnique({
      where: { userId: req.session.user.userId }
    });

    return { user, reviews: [], cities: [], routes: [] };
  } catch (err) {
   console.error("Error fetching PostgreSQL data:", err);
    return { user: null, reviews: [], cities: [], routes: [] };
  }
};
// ─── PAGE ROUTES ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.redirect('/login'));

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'PROJECT', 'userlogin.html'));
});

app.get('/busschedule', (req, res) => {
  res.render('busschedule');
});

app.get('/userdashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'PROJECT', 'userdashboard.html'));
});
// ─── AUTH API ────────────────────────────────────────────────────────────────
// ─── NEW SIGNUP ROUTE (POSTGRESQL VIA PRISMA) ───────────────────────────────
app.post('/api/user/signup', async (req, res) => {
  try {
    const { userId, name, email, password } = req.body;

    // 1. Check karna ki user pehle se exist toh nahi karta
    const existingUser = await prisma.user.findUnique({ where: { userId } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User ID already exists" });
    }

    // 2. Password ko bcrypt se hash (encrypt) karna jaisa login route ko chahiye
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Prisma se data directly PostgreSQL ke 'User' table mein insert karna
    const newUser = await prisma.user.create({
      data: {
        userId,
        name,
        email,
        password: hashedPassword,
        cookieConsent: 'undecided'
      }
    });

    res.status(201).json({ success: true, message: "User registered successfully!", user: newUser });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ success: false, message: "Server Error during signup" });
  }
});
app.post('/api/user/login', async (req, res) => {
  try {
    const { userId, password, cookiesAccepted } = req.body;

    // 1. MongoDB findOne hata kar Prisma Unique Lookup kiya
    const user = await prisma.user.findUnique({ where: { userId: userId } });

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      let consentChoice = user.cookieConsent || 'undecided';
      if (cookiesAccepted === true || cookiesAccepted === 'true') {
        consentChoice = 'accepted';
      } else if (cookiesAccepted === false || cookiesAccepted === 'false') {
        consentChoice = 'rejected';
      }

      // 2. Mongoose .save() hata kar direct PostgreSQL Update query run ki
      const updatedUser = await prisma.user.update({
        where: { userId: userId },
        data: { cookieConsent: consentChoice }
      });

      req.session.isLoggedIn = true;
      req.session.user = {
        userId: updatedUser.userId,
        name: updatedUser.name,
        email: updatedUser.email,
        cookieConsent: updatedUser.cookieConsent
      };

      const token = jwt.sign(
        { userId: updatedUser.userId, name: updatedUser.name },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      if (updatedUser.cookieConsent === 'accepted') {
        res.cookie('jwtToken', token, { httpOnly: true, maxAge: 3600000 });
      } else {
        res.clearCookie('jwtToken');
      }

      res.json({ success: true, user: req.session.user });
    } else {
      res.status(401).json({ success: false, message: "Invalid Password" });
    }
  } catch (error) {
    console.error("PostgreSQL Auth Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.get('/api/user/get-cookie-preference', async (req, res) => {
  try {
    if (!req.session || !req.session.isLoggedIn) {
      return res.json({ preference: 'undecided' });
    }

    // Upgraded to Prisma Unique find
    const user = await prisma.user.findUnique({ where: { userId: req.session?.user?.userId } });

    if (!user) {
      return res.json({ preference: 'undecided' });
    }

    res.json({ preference: user.cookieConsent || 'undecided' });
  } catch (error) {
    console.error("Error fetching cookie preference:", error);
    res.status(500).json({ preference: 'undecided' });
  }
});
app.post('/api/user/update-cookie-preference', async (req, res) => {
  try {
    if (!req.session.isLoggedIn) return res.status(401).json({ success: false });

    const { choice } = req.body;

    // Directly updating cookieConsent using Prisma Update operation
    const updatedUser = await prisma.user.update({
      where: { userId: req.session.user.userId },
      data: { cookieConsent: choice }
    });

    req.session.user.cookieConsent = updatedUser.cookieConsent;
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating cookie preference:", error);
    res.status(500).json({ success: false });
  }
});
app.get('/newdashboard', checkAuth, async (req, res) => {
  const projectData = await getProjectData(req);
  res.cookie('last_visit', new Date().toLocaleTimeString(), { maxAge: 900000, httpOnly: true });
  res.render('newdashboard', { user: projectData.user });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('connect.sid');
  res.clearCookie('last_visit');
  res.clearCookie('jwtToken');

  req.session.destroy((err) => {
    if (err) {
      console.error("Session destruction error:", err);
      return res.status(500).json({ success: false, message: "Could not log out" });
    }
    res.json({ success: true });
  });
});
app.get('/api/cities', (req, res) => res.json([]));
app.get('/api/routes', (req, res) => res.json([]));
app.get('/api/reviews', (req, res) => res.json([]));

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateBusSchedule(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, message: 'Bus schedule must be a JSON object.' };
  }
  const requiredFields = ['route', 'origin', 'destination', 'departure', 'arrival', 'duration', 'location', 'operator', 'status'];
  for (const field of requiredFields) {
    if (!isNonEmptyString(input[field])) {
      return { ok: false, message: `Missing or invalid field: ${field}` };
    }
  }
  const allowedStatuses = new Set(['on-time', 'delayed', 'boarding']);
  if (!allowedStatuses.has(String(input.status).toLowerCase())) {
    return { ok: false, message: 'Invalid status. Allowed: on-time, delayed, boarding.' };
  }
  return { ok: true };
}

const busRouter = express.Router();

busRouter.use((req, res, next) => {
  console.log('  -> Bus API request:', req.method, req.path);
  next();
});

busRouter.get('/', async (req, res) => {
  try {

    const { origin = '', destination = '', operator = '' } = req.query;

    const buses = await prisma.bus.findMany();
    res.json(buses);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching buses');
  }
});


app.get('/businfo', async (req, res) => {
  try {
    const busId = req.query.busId;

    // ✅ SAFE CHECK
    if (!busId || typeof busId !== 'string') {
      return res.status(400).json({ error: 'Invalid busId' });
    }
    const bus = await prisma.bus.findFirst({
      where: {
        number: busId
      }
    });
    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    res.json(bus);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching bus');
  }
});
busRouter.post('/', async (req, res) => {
  try {
    const newBus = await prisma.bus.create({
      data: req.body
    });

    res.status(201).json(newBus);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding bus');
  }
});

busRouter.patch('/:id', async (req, res) => {
  try {
    const updated = await prisma.bus.update({
      where: {
        id: Number(req.params.id)
      },
      data: {
        status: req.body.status
      }
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating bus');
  }
});

app.use('/api/busschedules', busRouter);

// ─── ERROR HANDLERS ──────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.status(404).send('404 - Page Not Found');
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('500 - Internal Server Error');
});

// ─── START SERVER ─────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});