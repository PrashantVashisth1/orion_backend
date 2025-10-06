import { uploadSingle, handleUploadError } from '../middleware/fileUpload.js';
import aws from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

aws.config.update({
  region: process.env.AWS_REGION,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID
});

const s3 = new aws.S3();

export async function uploadFile(req, res) {
  uploadSingle(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res);
    }
    if (!req.file) {
      return res.status(400).json({ success: false, error: { code: 'NO_FILE_PROVIDED', message: 'No file was provided for upload' } });
    }

    const fileUrl = req.file.location;

    return res.json({
      success: true,
      data: {
        url: fileUrl,
        key: req.file.key,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      },
      message: 'File uploaded successfully to S3'
    });
  });
}

export async function deleteFile(req, res) {
  try {
    const { key } = req.body;
    if (!key) {
      return res.status(400).json({ success: false, error: { code: 'KEY_REQUIRED', message: 'File key is required for deletion.' } });
    }
    const deleteParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key
    };
    await s3.deleteObject(deleteParams).promise();
    return res.json({ success: true, message: 'File deleted successfully from S3' });
  } catch (error) {
    console.error('S3 Delete file error:', error);
    return res.status(500).json({ success: false, error: { code: 'S3_DELETE_ERROR', message: 'Failed to delete file from S3.' } });
  }
}