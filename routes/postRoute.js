// routes/postRoute.js

const express = require('express');
const postController = require("../controllers/postController");
const { verify, verifyAdmin } = require("../auth"); // Ensure these middleware functions are correctly defined and exported

const router = express.Router();

// Optional: Middleware to log requests
function logger(req, res, next) {
    console.log('Printing from postRouter');
    next();
}

// Apply the logger middleware to all routes in this router
router.use(logger);

// Post Routes
router.post('/', verify, postController.createPost); // Needs verify

router.get('/all', postController.getAllPosts); // Needs verify and verifyAdmin

router.get('/active', postController.getActivePosts); // No verification required

router.get('/:id', postController.getPostById); // No verification required

router.post('/search-by-title', postController.searchByTitle); // No verification required

router.post('/search-by-content', postController.searchByContent); // No verification required

router.patch('/:id/update', verify, postController.updatePost); // Needs verify and verifyAdmin

router.patch('/:id/activate', verify, verifyAdmin, postController.activatePost); // Needs verify and verifyAdmin

router.patch('/:id/archive', verify, verifyAdmin, postController.archivePost); // Needs verify and verifyAdmin

// Comment Routes
router.post('/:id/comments', verify, postController.addComment); // Needs verify to add a comment
router.patch('/:id/comments/:commentId', verify, postController.editComment); // Needs verify to edit a comment
router.delete('/:id/comments/:commentId', verify, postController.deleteComment); // Needs verify and verifyAdmin to delete a comment

router.delete('/:id/delete', verify, postController.deletePost);

module.exports = router;
