const { S3Client, CreateBucketCommand, HeadBucketCommand, PutBucketPolicyCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

/**
 * MinIO S3 Client Configuration
 */
const s3Client = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT,
  region: 'us-east-1', // Default region for MinIO
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY,
    secretAccessKey: process.env.MINIO_SECRET_KEY,
  },
  forcePathStyle: true, // This is required for MinIO to work correctly
});

/**
 * Ensures the bucket exists and is set to public read mode.
 */
const initBucket = async () => {
  const bucketName = process.env.MINIO_BUCKET_NAME;

  try {
    // Check if the bucket exists
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
    console.log(`[MinIO] Bucket "${bucketName}" is ready.`);
  } catch (err) {
    // If not found, create it
    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
      console.log(`[MinIO] Bucket "${bucketName}" not found. Creating...`);
      await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
      
      // Set a public read policy so images can be accessed via URL
      const publicPolicy = {
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "PublicRead",
            Effect: "Allow",
            Principal: "*",
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${bucketName}/*`]
          }
        ]
      };

      await s3Client.send(new PutBucketPolicyCommand({
        Bucket: bucketName,
        Policy: JSON.stringify(publicPolicy)
      }));

      console.log(`[MinIO] Bucket "${bucketName}" created and set to Public Read.`);
    } else {
      console.error("[MinIO] Failed to connect/initialize. Is Docker running?", err.message);
    }
  }
};

module.exports = { s3Client, initBucket };
