import { uploadSingle, handleUploadError, getFileUrl, deleteUploadedFile } from '../middleware/fileUpload.js';
import path from 'path';

/**
 * POST /api/startup/upload
 * Upload profile picture or company logo
 */
export async function uploadFile(req, res) {
  try {
    // Use multer middleware
    uploadSingle(req, res, (err) => {
      if (err) {
        return handleUploadError(err, req, res);
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_FILE_PROVIDED',
            message: 'No file provided for upload'
          }
        });
      }

      const userId = req.user.id;
      const filename = req.file.filename;
      const fileUrl = getFileUrl(req, filename, userId);

      return res.json({
        success: true,
        data: {
          filename: filename,
          url: fileUrl,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype
        },
        message: 'File uploaded successfully'
      });
    });
  } catch (error) {
    console.error('Upload file error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    });
  }
}

/**
 * DELETE /api/startup/upload/:filename
 * Delete uploaded file
 */
export async function deleteFile(req, res) {
  try {
    const { filename } = req.params;
    const userId = req.user.id;

    if (!filename) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FILENAME_REQUIRED',
          message: 'Filename is required'
        }
      });
    }

    // Construct file path
    const filePath = path.join(process.cwd(), 'uploads', userId.toString(), filename);
    
    // Delete the file
    const deleted = deleteUploadedFile(filePath);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'File not found'
        }
      });
    }

    return res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    });
  }
}

