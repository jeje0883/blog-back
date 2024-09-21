const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'First name is required']
    },
    email: {
        type: String,
        unique: true,
        lowercase: true, // Change to true for proper use
        required: [true, 'Email is required'] // Add required validation
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
}, { timestamps: true }); // Enable timestamps

module.exports = mongoose.model('User', userSchema);
