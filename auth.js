const jwt = require("jsonwebtoken");
require('dotenv').config();

// Token Creation
module.exports.createAccessToken = (user) => {
    console.log("Creating access token for user:", JSON.stringify(user, null, 2)); // Added console log to debug token creation

    const data = {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
    };

    const token = jwt.sign(data, process.env.JWT_SECRET_KEY, {});
    console.log("Access token created:", token); // Added console log for the created token

    return token;
};

// Token Verification
module.exports.verify = (req, res, next) => {
    console.log("Verifying token from request headers..."); // Added log for verification process
    console.log("Authorization header:", req.headers.authorization);

    let token = req.headers.authorization;

    if (typeof token === "undefined") {
        console.log("Token not provided in the request headers."); // Log when no token is provided
        return res.send({ auth: "Failed. No Token" });
    } else {
        console.log("Raw token:", token);
        token = token.slice(7, token.length); // Removing 'Bearer ' prefix from token
        console.log("Token after slicing:", token);

        jwt.verify(token, process.env.JWT_SECRET_KEY, function (err, decodedToken) {
            if (err) {
                console.error("Token verification failed:", err.message); // Log verification error
                return res.status(403).send({
                    auth: "Failed",
                    message: err.message
                });
            } else {
                console.log("Token successfully verified:", decodedToken); // Log the decoded token
                req.user = decodedToken;
                next();
            }
        });
    }
};

// Verify Admin
module.exports.verifyAdmin = (req, res, next) => {
    console.log("Verifying if user is an admin..."); // Added log for admin verification
    if (req.user.isAdmin) {
        console.log("User is an admin. Proceeding..."); // Log if user is an admin
        next();
    } else {
        console.log("User is not an admin. Access forbidden."); // Log when user is not an admin
        return res.status(403).send({
            auth: "Failed",
            message: "Action Forbidden"
        });
    }
};

// Error Handler
module.exports.errorHandler = (err, req, res, next) => {
    // Log the error
    console.error("Error occurred:", err); // Added log to track errors

    const statusCode = err.status || 500;
    const errorMessage = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        error: {
            message: errorMessage,
            errorCode: err.code || 'SERVER_ERROR',
            details: err.details || null
        }
    });
};

// Check if user is logged in
module.exports.isLoggedIn = (req, res, next) => {
    console.log("Checking if user is logged in..."); // Log to check user login status
    if (req.user) {
        console.log("User is logged in:", req.user); // Log when user is logged in
        next();
    } else {
        console.log("User is not logged in."); // Log when user is not logged in
        res.sendStatus(401);
    }
};
