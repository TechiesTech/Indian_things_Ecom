const multer = require('multer');
const multerS3 = require('multer-s3');
const { s3Client } = require('../config/s3Config');
const path = require('path');
require('dotenv').config();

/**
 * Multer S3 Middleware for MinIO
 * This replaces local storage with professional cloud-compatible storage.
 */
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.MINIO_BUCKET_NAME,
    // Note: Public read is handled by the bucket policy we set in s3Config
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `vendors/${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed!'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = upload;
