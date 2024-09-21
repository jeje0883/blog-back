const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require('passport');
const session = require('express-session');
//require('./passport')
require('dotenv').config();
const http = require('http'); // get http

//define env config
port = process.env.PORT || 3000;
mongodb = process.env.MONGODB_STRING;
secret = process.env.clientSecret;



//setup middleware
const corsOptions = {
    origin: ['http://localhost:3000', 'http://zuitt-bootcamp-prod-460-7841-descalsota.s3-website.us-east-1.amazonaws.com'], 
    credentials: true, 
    optionsSuccessStatus: 200 
};


//connect to MONGODB
// mongoose.connect(mongodb);
// mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas'));


//setup the server

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors(corsOptions));
app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// define routes

const userRoutes = require("./routes/userRoute");
const postRoutes = require("./routes/postRoute");




// setup routes

app.use("/users", userRoutes);
app.use("/posts", postRoutes);



// initialize the server
// if(require.main === module){
// 	app.listen(port, () => {
// 		console.log(`API is now online on port ${ port }`)
// 	});
// }

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log('=> using existing database connection');
        return;
    }

    try {
        await mongoose.connect(mongodb, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        isConnected = true;
        console.log('=> connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
    await connectDB();
    next();
});








module.exports = {app, mongoose};