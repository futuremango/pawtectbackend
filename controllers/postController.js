const Post = require('../models/Post');
const Notification = require('../models/Notification');

// Get all posts
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user_id', 'name avatar')
      .populate({
        path: 'comments.user_id',
        select: 'name avatar'
      })
      .populate({
        path: 'comments.replies.user_id',
        select: 'name avatar'
      })
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSinglePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('user_id', 'name avatar')
      .lean();

    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Generate share URL with validation
    const baseUrl = process.env.CLIENT_URL?.replace(/\/$/, '') || 'https://pawtect-fyp.vercel.app';
    post.shareUrl = `${baseUrl}/posts/${post._id}`;

    res.json(post);
  } catch (err) {
    res.status(500).json({ 
      error: 'Failed to fetch post',
      details: err.message 
    });
  }
};

// Create new post
exports.createPost = async (req, res) => {
  try {
    const post = new Post({
      user_id: req.user._id,
      pet_name: req.body.pet_name,
      description: req.body.description,
      last_seen_location: req.body.last_seen_location,
      contact_info: req.body.contact_info,
      pet_image: req.file.path
    });

    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get posts by user ID
exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user_id: req.params.userId })
      .populate('user_id', 'name avatar')
      .populate({
        path: 'comments.user_id',
        select: 'name avatar'
      })
      .populate({
        path: 'comments.replies.user_id',
        select: 'name avatar'
      })
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (post.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Post.deleteOne({ _id: req.params.postId });
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Like/unlike a post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const userId = req.user._id;
    const index = post.likes.indexOf(userId);
    
    if (index === -1) {
      post.likes.push(userId);
      await Notification.create({
        recipient: post.user_id,
        sender: userId,
        post: post._id,
        type: 'like'
      });
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = {
      user_id: req.user._id,  // Ensure user ID is attached
      text: req.body.text,
    };

    post.comments.push(comment);
    await post.save();

    // Populate user data before returning
    const populatedPost = await Post.findById(post._id)
      .populate('comments.user_id', 'name avatar');

    // Get the newly added comment (last in array)
    const newComment = populatedPost.comments[populatedPost.comments.length - 1];

    await Notification.create({
      recipient: post.user_id,
      sender: req.user._id,
      post: post._id,
      type: 'comment'
    });

    res.json({
      comment: {
        ...newComment.toObject(),
        user_id: {  // Include user details
          _id: req.user._id,
          name: req.user.name,
          avatar: req.user.avatar
        }
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Add reply to comment
exports.addReply = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    const reply = {
      user_id: req.user._id,
      text: req.body.text
    };

    comment.replies.push(reply);
    
    await Notification.create({
      recipient: comment.user_id,
      sender: req.user._id,
      post: post._id,
      comment: comment._id,
      type: 'reply'
    });

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Share post
/*exports.sharePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.postId,
      { $inc: { shares: 1 } },
      { new: true }
    );
    
    await Notification.create({
      recipient: post.user_id,
      sender: req.user._id,
      post: post._id,
      type: 'share'
    });

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};*/

exports.sharePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.postId,
      { $inc: { shares: 1 } },
      { new: true }
    ).populate('user_id', 'name avatar');

    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Generate complete image URL
    const baseURL = process.env.CLIENT_URL?.replace(/\/$/, '') || 'https://pawtect-fyp.vercel.app';
    const serverURL = process.env.REACT_APP_API_URL?.replace(/\/$/, '') || 'https://pawtect-fyp-production.up.railway.app';
    
    const shareData = {
      ...post.toObject(),
      shareUrl: `${baseURL}/posts/${post._id}`,
      pet_image: post.pet_image.startsWith('http') 
        ? post.pet_image 
        : `${serverURL}/${post.pet_image}`
    };

    // Create notification
    await Notification.create({
      recipient: post.user_id,
      sender: req.user._id,
      post: post._id,
      type: 'share'
    });

    res.json(shareData);

  } catch (err) {
    console.error('Share Error:', err);
    res.status(500).json({ 
      error: 'Failed to generate share link',
      systemMessage: err.message
    });
  }
};
// Like/unlike comment
exports.likeComment = async (req, res) => {
  try {
    const post = await Post.findOne({ "comments._id": req.params.commentId });
    const comment = post.comments.id(req.params.commentId);
    
    const userId = req.user._id;
    const index = comment.likes.indexOf(userId);
    
    if (index === -1) {
      comment.likes.push(userId);
      await Notification.create({
        recipient: comment.user_id,
        sender: userId,
        comment: comment._id,
        type: 'like'
      });
    } else {
      comment.likes.splice(index, 1);
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Export list (Ensure all are included)
module.exports = {
  createPost: exports.createPost,
  getPosts: exports.getPosts,
  getUserPosts: exports.getUserPosts,
  deletePost: exports.deletePost,
  likePost: exports.likePost,
  addComment: exports.addComment,
  addReply: exports.addReply,
  getSinglePost: exports.getSinglePost,
  sharePost: exports.sharePost,
  likeComment: exports.likeComment
};