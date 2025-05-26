const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const postController = require('../controllers/postController');
const { imageUpload, handleMulterErrors } = require('../config/multer');

// Correct route order
router.post('/posts', authMiddleware, imageUpload.single('pet_image'), handleMulterErrors, postController.createPost);
router.get('/posts', postController.getPosts);
router.get('/posts/:postId', postController.getSinglePost); // Must come first
router.get('/posts/user/:userId', postController.getUserPosts);
router.delete('/posts/:postId', authMiddleware, postController.deletePost);
router.put('/posts/:postId/like', authMiddleware, postController.likePost);
router.post('/posts/:postId/comments', authMiddleware, postController.addComment);
router.post('/posts/:postId/comments/:commentId/replies', authMiddleware, postController.addReply);
router.post('/posts/:postId/share', authMiddleware, postController.sharePost);
router.put('/comments/:commentId/like', authMiddleware, postController.likeComment);

module.exports = router;