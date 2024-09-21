// api/posts.js

const express = require('express');
const postController = require("../controllers/postController");
const { verify, verifyAdmin } = require("../auth"); // Ensure these middleware functions are correctly defined and exported

const app = express();

// Optional: Middleware to log requests
function logger(req, res, next) {
    console.log('Printing from postRouter');
    next();
}

// Apply the logger middleware to all routes in this router
app.use(logger);

// Post Routes
app.post('/', verify, postController.createPost); // Needs verify
app.get('/all', postController.getAllPosts); // Public access (Admin verification can be added if needed)
app.get('/active', postController.getActivePosts); // Public access
app.get('/:id', postController.getPostById); // Public access
app.post('/search-by-title', postController.searchByTitle); // Public access
app.post('/search-by-content', postController.searchByContent); // Public access
app.patch('/:id/update', verify, verifyAdmin, postController.updatePost); // Needs verify and verifyAdmin
app.patch('/:id/activate', verify, verifyAdmin, postController.activatePost); // Needs verify and verifyAdmin
app.patch('/:id/archive', verify, verifyAdmin, postController.archivePost); // Needs verify and verifyAdmin

// Comment Routes
app.post('/:id/comments', verify, postController.addComment); // Needs verify to add a comment
app.patch('/:id/comments/:commentId', verify, postController.editComment); // Needs verify to edit a comment
app.delete('/:id/comments/:commentId', verify, verifyAdmin, postController.deleteComment); // Needs verify and verifyAdmin to delete a comment

app.delete('/:id/delete', verify, verifyAdmin, postController.deletePost);

// Export the app for Vercel
module.exports = app;
