// import { uploadSingle, handleUploadError, getFileUrl, deleteUploadedFile } from '../middleware/fileUpload.js';
// import path from 'path';

// /**
//  * POST /api/startup/upload
//  * Upload profile picture or company logo
//  */
// export async function uploadFile(req, res) {
//   try { 
//     // Use multer middleware
//     uploadSingle(req, res, (err) => {
//       if (err) {
//         return handleUploadError(err, req, res);
//       }

//       if (!req.file) {
//         return res.status(400).json({
//           success: false,
//           error: {
//             code: 'NO_FILE_PROVIDED',
//             message: 'No file provided for upload'
//           }
//         });
//       }

//       const userId = req.user.id;
//       const filename = req.file.filename;
//       const fileUrl = getFileUrl(req, filename, userId);

//       return res.json({
//         success: true,
//         data: {
//           filename: filename,
//           url: fileUrl,
//           originalName: req.file.originalname,
//           size: req.file.size,
//           mimetype: req.file.mimetype
//         },
//         message: 'File uploaded successfully'
//       });
//     });
//   } catch (error) {
//     console.error('Upload file error:', error);
//     return res.status(500).json({
//       success: false,
//       error: {
//         code: 'INTERNAL_ERROR',
//         message: 'Internal server error'
//       }
//     });
//   }
// }

// /**
//  * DELETE /api/startup/upload/:filename
//  * Delete uploaded file
//  */
// export async function deleteFile(req, res) {
//   try {
//     const { filename } = req.params;
//     const userId = req.user.id;

//     if (!filename) {
//       return res.status(400).json({
//         success: false,
//         error: {
//           code: 'FILENAME_REQUIRED',
//           message: 'Filename is required'
//         }
//       });
//     }

//     // Construct file path
//     const filePath = path.join(process.cwd(), 'uploads', userId.toString(), filename);
    
//     // Delete the file
//     const deleted = deleteUploadedFile(filePath);

//     if (!deleted) {
//       return res.status(404).json({
//         success: false,
//         error: {
//           code: 'FILE_NOT_FOUND',
//           message: 'File not found'
//         }
//       });
//     }

//     return res.json({
//       success: true,
//       message: 'File deleted successfully'
//     });
//   } catch (error) {
//     console.error('Delete file error:', error);
//     return res.status(500).json({
//       success: false,
//       error: {
//         code: 'INTERNAL_ERROR',
//         message: 'Internal server error'
//       }
//     });
//   }
// }


  // import { uploadSingle, handleUploadError } from '../middleware/fileUpload.js';
  // import aws from 'aws-sdk';
  // import dotenv from 'dotenv';

  // // Load environment variables
  // dotenv.config();

  // // Configure the AWS SDK for S3 operations (like delete)
  // aws.config.update({
  //   region: process.env.AWS_REGION,
  //   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  //   accessKeyId: process.env.AWS_ACCESS_KEY_ID
  // });

  // const s3 = new aws.S3();

  // /**
  //  * POST /api/startup/upload
  //  * Manages the file upload process by first invoking the S3 middleware.
  //  */
  // export async function uploadFile(req, res) {
  //   // First, we call the uploadSingle middleware which handles the actual upload to S3.
  //   uploadSingle(req, res, (err) => {
  //     // Step 1: Handle any errors from the upload process.
  //     if (err) {
  //       return handleUploadError(err, req, res);
  //     }

  //     // Step 2: Check if a file was actually uploaded.
  //     if (!req.file) {
  //       return res.status(400).json({
  //         success: false,
  //         error: {
  //           code: 'NO_FILE_PROVIDED',
  //           message: 'No file was provided for upload'
  //         }
  //       });
  //     }

  //     // Step 3: If successful, get the public URL from req.file.location.
  //     const fileUrl = req.file.location;

  //     // Step 4: Send the success response back to the frontend.
  //     return res.json({
  //       success: true,
  //       data: {
  //         url: fileUrl,
  //         key: req.file.key, // The key is the file's path in the S3 bucket
  //         originalName: req.file.originalname,
  //         size: req.file.size,
  //         mimetype: req.file.mimetype
  //       },
  //       message: 'File uploaded successfully to S3'
  //     });
  //   });
  // }


  // /**
  //  * DELETE /api/startup/upload
  //  * Deletes an uploaded file from S3.
  //  * Expects the file key in the request body: { "key": "userId/filename.jpg" }
  //  */
  // export async function deleteFile(req, res) {
  //   try {
  //     const { key } = req.body;

  //     if (!key) {
  //       return res.status(400).json({
  //         success: false, error: { code: 'KEY_REQUIRED', message: 'File key is required for deletion.' }
  //       });
  //     }

  //     const deleteParams = {
  //       Bucket: process.env.S3_BUCKET_NAME,
  //       Key: key
  //     };

  //     await s3.deleteObject(deleteParams).promise();

  //     return res.json({
  //       success: true,
  //       message: 'File deleted successfully from S3'
  //     });
  //   } catch (error) {
  //     console.error('S3 Delete file error:', error);
  //     return res.status(500).json({
  //       success: false, error: { code: 'S3_DELETE_ERROR', message: 'Failed to delete file from S3.' }
  //     });
  //   }
  // }




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