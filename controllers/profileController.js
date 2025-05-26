const User = require('../models/User');

exports.updateProfile = async (req, res) => {
    try {
        console.log('[Profile Controller] Received data:', {
          body: req.body,
          file: req.file,
          user: req.user
        });

    const user = await User.findById(req.user._id);
    if (!user) {
        console.error('[Profile Controller] User not found');
        return res.status(404).json({ error: 'User not found' });
      }
    // Update fields
    user.name = req.body.name || user.name;
    user.bio = req.body.bio || user.bio;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    user.location = req.body.location || user.location;

    if(req.file) {
      user.avatar = `/uploads/avatars/${req.file.filename}`;
      console.log('New avatar path:', user.avatar);
    }
    const validationError = user.validateSync();
    if (validationError) {
      throw validationError;
    }
    await user.save();
    console.log('[Profile Controller] Saving user:', user);

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        phone: user.phone,
        location: user.location
      }
    });

  } catch (err) {
    console.error('Update error:', {
      message: err.message,
      stack: err.stack,
      errors: err.errors
    });
    res.status(400).json({ 
      error: err.message,
      details: err.errors 
    });
  }
};