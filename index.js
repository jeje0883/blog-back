// Load environment variables at the very beginning
require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const http = require('http'); // not used in the provided code

const port = process.env.PORT || 3000;
const mongodb = process.env.MONGODB_STRING;
const secret = process.env.SECRET_KEY;
const frontend = process.env.FRONT_URL;


// Middleware Setup
const corsOptions = {
    origin: [
        'http://localhost:3000',
        frontend,  
    ],
    credentials: true,
    optionsSuccessStatus: 200
};

mongoose.connect(mongodb)
    .then(() => console.log('Now connected to MongoDB Atlas'))
    .catch(err => console.error('MongoDB connection error:', err));

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(session({
    secret: secret, // Ensure this is a strong, unique secret
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: mongodb }),
    cookie: { secure: false } // Set to true if using HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
const userRoutes = require("./routes/userRoute");
const postRoutes = require("./routes/postRoute");

app.use("/users", userRoutes);
app.use("/posts", postRoutes);

// Start Server
if (require.main === module) {
    app.listen(port, () => {
        console.log(`API is now online on port ${port}`);
    });
}

module.exports = { app, mongoose };
