const multer = require('multer');

const uploadBuffer = multer({ 
    storage: multer.memoryStorage(),
    limits: { 
      fileSize: 5 * 1024 * 1024  // 5MB per file
    },
    fileFilter: (req, file, cb) => {
      console.log('Processing file upload:', file.originalname);
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    }
  });

module.exports = uploadBuffer;