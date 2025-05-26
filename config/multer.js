const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Add this before defining storage
if (!fs.existsSync('uploads/images')) {
  fs.mkdirSync('uploads/images', { recursive: true });
}
// ==============================================
// Configuration for Volunteer CVs (PDF/DOC/DOCX)
// ==============================================
const cvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/cvs/');
  },
  filename: (req, file, cb) => {
    const sanitizedName = file.originalname
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-.]/g, '');
    cb(null, `cv-${Date.now()}-${sanitizedName}`);
  }
});

const cvUpload = multer({
  storage: cvStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF/DOC/DOCX files are allowed'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// ==============================================
// Configuration for Community Post Images
// ==============================================
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/images/';
    // Debug directory creation
    if (!fs.existsSync(uploadPath)) {
      console.log('[MULTER] Creating directory:', uploadPath);
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const sanitizedName = file.originalname
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-.]/g, '');
    const finalName = `img-${Date.now()}-${sanitizedName}`;
    console.log('[MULTER] Saving file as:', finalName); // Debug filename
    cb(null, finalName);
  }
});

const imageUpload = multer({
  storage: imageStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    allowedTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only images allowed'), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// ==============================================
// Error Handling Middleware (For all upload types)
// ==============================================
const handleMulterErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      error: err.code === 'LIMIT_FILE_SIZE' 
        ? 'File too large (max 5MB)' 
        : 'File upload error'
    });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

// for avatar handling of Userprofiles
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const sanitizedName = file.originalname
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-.]/g, '');
    cb(null, `avatar-${Date.now()}-${sanitizedName}`);
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    allowedTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only images allowed'), false);
  },
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

// multer.js (keep these exports here)
module.exports = {
  cvUpload,
  imageUpload,
  avatarUpload,
  handleMulterErrors
};
