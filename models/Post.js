const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    commentor:{
        type: String,
        default: '' // Default to an empty string
    },
    comment: {
        type: String,
        required: true,
        default: '' // Default to an empty string
    },
    time: {
        type: Date,
        default: Date.now // Automatically set the time to now
    }
}, { timestamps: true });

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required']
    },
    content: {
        type: String,
        required: [true, 'Content is required']
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    author: {
        type: String
    },
    comments: {
        type: [commentSchema], // Array of comments
        default: [] // Default to an empty array
    }
}, { timestamps: true }); // Enable timestamps for createdAt and updatedAt

module.exports = mongoose.model('Post', postSchema);
