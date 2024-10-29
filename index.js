// Load environment variables at the very beginning
require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cron = require('node-cron');       // For cron jobs
const axios = require('axios');          // For making HTTP requests
const rateLimit = require('express-rate-limit'); // For rate limiting

const port = process.env.PORT || 3000;
const mongodb = process.env.MONGODB_STRING;
const secret = process.env.SECRET_KEY;
const frontend = process.env.FRONT_URL;

console.log('Allowed frontend URL:', frontend);

// Middleware Setup
const allowedOrigins = [
  'http://localhost:3000',
  frontend,
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log('Origin header received:', origin);
    if (!origin) return callback(null, true); // Allow requests with no origin
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      callback(new Error(msg), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

console.log('CORS Options:', corsOptions);

mongoose.connect(mongodb)
  .then(() => console.log('Now connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

const app = express();

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests

// Log incoming request origins
app.use((req, res, next) => {
  console.log('Incoming request from Origin:', req.headers.origin);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: secret, // Ensure this is a strong, unique secret
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: mongodb }),
  cookie: { secure: true }, // Set to true if using HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

// Rate Limiter for /ping endpoint
const pingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1,              // Limit each IP to 1 request per windowMs
  message: 'Too many requests from this IP, please try again after a minute.'
});

// Public /ping endpoint
app.get('/ping', pingLimiter, (req, res) => {
  res.json({ message: 'Server is alive.' });
});

// Routes
const userRoutes = require("./routes/userRoute");
const postRoutes = require("./routes/postRoute");

app.use("/users", userRoutes);
app.use("/posts", postRoutes);

// Error handling middleware
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(err.status || 500).send(err.message);
});

// Start Server
if (require.main === module) {
  app.listen(port, () => {
    console.log(`API is now online on port ${port}`);
  });
}

// Cron Job to ping every 14 minutes
cron.schedule('*/14 * * * *', () => {
  console.log('Running cron job to ping the server.');

  // Replace with your actual server URL if not localhost
  axios.get(`http://localhost:${port}/ping`)
    .then(response => {
      console.log('Ping successful:', response.data);
    })
    .catch(error => {
      console.error('Error pinging the server:', error.message);
    });
});

module.exports = { app, mongoose };
