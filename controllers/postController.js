const Post = require('../models/Post');
const { errorHandler } = require("../auth"); // Ensure errorHandler is correctly exported in auth.js

// Create a new post
module.exports.createPost = async (req, res) => {
    const { title, content } = req.body;
    const { id , username } = req.user; // Assuming 'id' is the user's ID from the auth middleware
    console.log(`Creating post - User: ${JSON.stringify(req.user)}, Title: ${title}, Content: ${content}`);

    const newPost = new Post({
        title,
        content,
        userID: id,
        author: username
    });

    try {
        const savedPost = await newPost.save();
        console.log('Post created successfully:', savedPost);
        return res.status(201).send({
            message: 'Post created successfully',
            savedPost
        });
    } catch (err) {
        console.error('Error creating post:', err);
        return errorHandler(err, req, res);
    }
};

// Get all posts (admin only)
module.exports.getAllPosts = async (req, res) => {
    try {
        //console.log('Fetching all posts');
        const posts = await Post.find();
        //console.log('Posts retrieved:', posts);
        return res.status(200).send(posts);
    } catch (err) {
        //console.error('Error fetching all posts:', err);
        return errorHandler(err, req, res);
    }
};

// Get active posts
module.exports.getActivePosts = async (req, res) => {
    try {
        //console.log('Fetching active posts');
        const posts = await Post.find({ isActive: true });
        //console.log('Active posts retrieved:', posts);
        return res.status(200).send(posts);
    } catch (err) {
        //console.error('Error fetching active posts:', err);
        return errorHandler(err, req, res);
    }
};

// Get a post by ID
module.exports.getPostById = async (req, res) => {
    try {
        //console.log(`Fetching post with ID: ${req.params.id}`);
        const post = await Post.findById(req.params.id);
        if (!post) {
            //console.log('Post not found');
            return res.status(404).send({ error: 'Post not found' });
        }
        //console.log('Post retrieved:', post);
        return res.status(200).send(post);
    } catch (err) {
        //console.error('Error fetching post by ID:', err);
        return errorHandler(err, req, res);
    }
};

// Search posts by title
module.exports.searchByTitle = async (req, res) => {
    try {
        //console.log(`Searching posts by title: ${req.body.title}`);
        const posts = await Post.find({
            title: { $regex: req.body.title, $options: 'i' } // Case-insensitive search
        });
        //console.log('Posts matching title:', posts);
        return res.status(200).send(posts);
    } catch (err) {
        //console.error('Error searching posts by title:', err);
        return errorHandler(err, req, res);
    }
};

// Search posts by content
module.exports.searchByContent = async (req, res) => {
    try {
        //console.log(`Searching posts by content: ${req.body.content}`);
        const posts = await Post.find({
            content: { $regex: req.body.content, $options: 'i' } // Case-insensitive search
        });

        if (!posts.length) {
            //console.log('No posts found');
            return res.status(404).send({ error: 'No posts found' });
        }

        //console.log('Posts matching content:', posts);
        return res.status(200).send(posts);
    } catch (err) {
        //console.error('Error searching posts by content:', err);
        return errorHandler(err, req, res);
    }
};

// Update a post (admin only)
module.exports.updatePost = async (req, res) => {
    try {
        const { title, content } = req.body;
        //console.log(`Updating post ID: ${req.params.id}, New Title: ${title}, New Content: ${content}`);

        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            { title, content },
            { new: true }
        );

        if (!updatedPost) {
            //console.log('Post not found for update');
            return res.status(404).send({ error: 'Post not found' });
        }

        //console.log('Post updated successfully:', updatedPost);
        return res.status(200).send({
            success: true,
            message: 'Post updated successfully',
            post: updatedPost
        });
    } catch (err) {
        //console.error('Error updating post:', err);
        return errorHandler(err, req, res);
    }
};

// Activate a post (admin only)
module.exports.activatePost = async (req, res) => {
    try {
        //console.log(`Activating post ID: ${req.params.id}`);
        const post = await Post.findById(req.params.id);
        if (!post) {
            //console.log('Post not found');
            return res.status(404).send({ error: 'Post not found' });
        }

        if (post.isActive) {
            //console.log('Post is already active');
            return res.status(200).send({
                message: 'Post already active',
                post
            });
        }

        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            { isActive: true },
            { new: true }
        );

        //console.log('Post activated successfully:', updatedPost);
        return res.status(200).send({
            success: true,
            message: 'Post activated successfully',
            activatedPost: updatedPost
        });
    } catch (err) {
        //console.error('Error activating post:', err);
        return errorHandler(err, req, res);
    }
};

// Archive a post (admin only)
module.exports.archivePost = async (req, res) => {
    try {
        //console.log(`Archiving post ID: ${req.params.id}`);
        const post = await Post.findById(req.params.id);
        if (!post) {
            //console.log('Post not found');
            return res.status(404).send({ error: 'Post not found' });
        }

        if (!post.isActive) {
            //console.log('Post is already archived');
            return res.status(200).send({
                message: 'Post already archived',
                archivedPost: post
            });
        }

        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        //console.log('Post archived successfully:', updatedPost);
        return res.status(200).send({
            success: true,
            message: 'Post archived successfully',
            archivedPost: updatedPost
        });
    } catch (err) {
        //console.error('Error archiving post:', err);
        return errorHandler(err, req, res);
    }
};

// Add a comment to a post
module.exports.addComment = async (req, res) => {
    const {  comment } = req.body;
    const postId = req.params.id; // User ID from auth middleware
    //console.log(`Adding comment to ${postId} by user ID: ${userID}, Comment: ${comment}`);

    try {
        const post = await Post.findById(postId);
        if (!post) {
            //console.log('Post not found for adding comment');
            return res.status(404).send({ error: 'Post not found' }); 
        }

        post.comments.push({ userID: req.user.id, commentor: req.user.username, comment });
        await post.save();
        //console.log('Comment added successfully:', post.comments);

        return res.status(201).send({
            success: true,
            message: 'Comment added successfully',
            comments: post.comments
        });
    } catch (err) {
        //console.error('Error adding comment:', err);
        return errorHandler(err, req, res);
    }
};


// module.exports.editComment = async (req, res) => {
//     const { comment } = req.body;
//     const { id: userId } = req.user; // Renamed for clarity
//     //console.log(`Editing comment ID: ${req.params.commentId}, User ID: ${userId}, New Comment: ${comment}`);

//     try {
//         const post = await Post.findById({id: req.params.id});
//         if (!post) {
//             //console.log('Post not found for editing comment');
//             return res.status(404).send({ error: 'Post not found' });
//         }

//         const commentToEdit = post.comments.id(req.params.commentId);
//         if (!commentToEdit) {
//             //console.log('Comment not found');
//             return res.status(404).send({ error: 'Comment not found' });
//         }

//         if (commentToEdit.userID.toString() !== userId) {
//             //console.log('Unauthorized edit attempt');
//             return res.status(403).send({ error: 'You are not allowed to edit this comment' });
//         }

//         commentToEdit.comment = comment;
//         await post.save();
//         //console.log('Comment updated successfully:', post.comments);

//         return res.status(200).send({
//             success: true,
//             message: 'Comment updated successfully',
//             comments: post.comments
//         });
//     } catch (err) {
//         //console.error('Error editing comment:', err);
//         return errorHandler(err, req, res);
//     }
// };
module.exports.editComment = async (req, res) => {
    const { comment } = req.body; // The updated comment content
    const { id: userId } = req.user; // The ID of the logged-in user
    const { id, commentId } = req.params; // postId and commentId from the request parameters

    //console.log(`Editing comment ID: ${commentId} in post ID: ${id}, User ID: ${userId}, New Comment: ${comment}`);

    try {
        // Find the post by postId
        const post = await Post.findById(id);
        if (!post) {
            //console.log('Post not found');
            return res.status(404).send({ error: 'Post not found' });
        }

        // Find the specific comment in the comments array by its _id
        const commentToEdit = post.comments.id(commentId);
        if (!commentToEdit) {
            //console.log('Comment not found');
            return res.status(404).send({ error: 'Comment not found' });
        }

        // Check if the logged-in user is the owner of the comment or an admin
        // if (commentToEdit.userID.toString() !== userId) {
        //     //console.log('Unauthorized edit attempt');
        //     return res.status(403).send({ error: 'You are not allowed to edit this comment' });
        // }

        // Update the comment content
        commentToEdit.comment = comment;
        
        // Save the updated post document
        await post.save();
        //console.log('Comment updated successfully:', commentToEdit);

        return res.status(200).send({
            success: true,
            message: 'Comment updated successfully',
            comment: commentToEdit.comment
        });
    } catch (err) {
        //console.error('Error editing comment:', err);
        return res.status(500).send({ error: 'Error editing comment' });
    }
};




// Delete a comment (admin only)
module.exports.deleteComment = async (req, res) => {
    const { id: postId, commentId } = req.params; // postId and commentId from the request parameters
    const { id: adminId } = req.user; // The ID of the logged-in admin

    //console.log(`Deleting comment ID: ${commentId} from post ID: ${postId}, Admin ID: ${adminId}`);

    try {
        // Find the post by postId
        const post = await Post.findById(postId);
        if (!post) {
            //console.log('Post not found');
            return res.status(404).send({ error: 'Post not found' });
        }

        // Find the specific comment in the comments array by its _id
        const commentToDelete = post.comments.id(commentId);
        if (!commentToDelete) {
            //console.log('Comment not found');
            return res.status(404).send({ error: 'Comment not found' });
        }

        // Remove the comment by filtering it out of the comments array
        post.comments.pull({ _id: commentId });
        
        // Save the updated post document
        await post.save();
        //console.log('Comment deleted successfully');

        return res.status(200).send({
            success: true,
            message: 'Comment deleted successfully',
            comments: post.comments // Return the updated comments array
        });
    } catch (err) {
        //console.error('Error deleting comment:', err);
        return res.status(500).send({ error: 'Error deleting comment' });
    }
};


module.exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params; // Post ID from the request parameters

        // Find the post by ID and delete it
        const deletedPost = await Post.findByIdAndDelete(id);

        // If no post was found and deleted
        if (!deletedPost) {
            //console.log('No posts found');
            return res.status(404).send({ error: 'No posts found' });
        }

        //console.log('Post deleted successfully:', deletedPost);
        return res.status(200).send({
            success: true,
            message: 'Post deleted successfully',
            deletedPost: deletedPost // Return the deleted post in the response
        });
    } catch (err) {
        //console.error('Error deleting post:', err);
        return res.status(500).send({ error: 'Error deleting post' });
    }
};
