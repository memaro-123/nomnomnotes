const multer = require('multer');

const uploadBuffer = multer({ 
    storage: multer.memoryStorage(),
    limits: { 
      fileSize: 5 * 1024 * 1024  // 5MB per file
    },
    fileFilter: (req, file, cb) => {
      console.log('Processing file upload:', file.originalname);
      console.log('File mimetype:', file.mimetype);
      
      try {
        if (file.mimetype && file.mimetype.startsWith('image/')) {
          console.log('File accepted:', file.originalname);
          cb(null, true);
        } else {
          console.log('File rejected - not an image:', file.originalname);
          cb(new Error('Only image files are allowed!'), false);
        }
      } catch (error) {
        console.error('Error in fileFilter:', error);
        cb(error, false);
      }
    }
  });

module.exports = uploadBuffer;