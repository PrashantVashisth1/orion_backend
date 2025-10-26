// src/middleware/pitchDeckUploadMiddleware.js
import multer from 'multer';
import multerS3 from 'multer-s3';
import aws from 'aws-sdk';
import dotenv from 'dotenv';
import { MulterError } from 'multer'; // Import MulterError for type checking

dotenv.config();

// Reuse AWS config
aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.AWS_REGION,
});
const s3 = new aws.S3();
const bucketName = process.env.S3_BUCKET_NAME;

// Filter specifically for pitch deck files
const pitchDeckFileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.ms-powerpoint', // .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation' // .pptx
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // Use MulterError for consistency if possible, or a standard error
    const error = new Error('Invalid file type. Only PDF, PPT, and PPTX files are allowed.');
    // error.code = 'INVALID_FILE_TYPE'; // Custom code for handler
    cb(error, false);
  }
};

// Configure multer-s3 for pitch decks
const pitchDeckUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketName,
    acl: 'private', // Keep pitch decks private by default
    key: function (req, file, cb) {
      // Store in a specific folder, ensuring req.user exists (auth runs first)
      const userIdFolder = req.user ? `${req.user.id}/funding-submissions/` : 'funding-submissions/';
      const filePath = `${userIdFolder}${Date.now().toString()}-${file.originalname}`;
      cb(null, filePath);
    }
  }),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  },
  fileFilter: pitchDeckFileFilter
});

// Specific error handler for this middleware (optional but good practice)
// You can also use the shared one if needed, but apply it in the route
const handlePitchDeckUploadError = (error, req, res, next) => {
    if (error instanceof MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, error: { code: 'FILE_TOO_LARGE', message: 'Pitch deck size exceeds 20MB limit' } });
        }
        // Handle other potential multer errors
         return res.status(400).json({ success: false, error: { code: 'MULTER_ERROR', message: error.message } });
    }
    // Handle file filter errors
    if (error.message.includes('Invalid file type')) {
        return res.status(400).json({ success: false, error: { code: 'INVALID_FILE_TYPE', message: error.message } });
    }
    // Handle generic errors during upload
    console.error("Pitch Deck Upload Error:", error);
    return res.status(500).json({ success: false, error: { code: 'UPLOAD_ERROR', message: error.message || 'Pitch deck upload failed' } });
};


export { pitchDeckUpload, handlePitchDeckUploadError }; // Export the configured multer instance