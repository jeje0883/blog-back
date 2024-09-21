// api/users.js

const express = require("express");
const userController = require("../controllers/userController");
const { verify, verifyAdmin, isLoggedIn } = require("../auth");

const app = express();

// Use middleware
app.use(express.json());

// Define your routes
app.post("/register", userController.registerUser);
app.post("/login", userController.loginUser);
app.get("/details", verify, userController.getProfile); 
app.patch("/:id/set-as-admin", verify, verifyAdmin, userController.setAsAdmin);
app.patch('/update-password', verify, userController.updatePassword);
app.post("/check-email", userController.checkEmailExists);
app.put('/profile', verify, userController.updateProfile);
app.get('/all', verify, verifyAdmin, userController.getAllProfiles);


// Export the app for Vercel serverless functions
module.exports = app;
