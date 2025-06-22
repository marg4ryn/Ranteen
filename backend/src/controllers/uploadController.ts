import { Request, RequestHandler, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

// Create uploads directory if it doesn't exist
const createUploadsDir = async (dirPath: string) => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    // Use a temporary upload directory since req.body.uploadType might not be available yet
    const tempUploadDir = path.join(process.cwd(), 'uploads', 'temp');
    
    try {
      await createUploadsDir(tempUploadDir);
      cb(null, tempUploadDir);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const fileExtension = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}${fileExtension}`;
    cb(null, uniqueName);
  }
});

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const uploadType = req.body.uploadType || 'general';
  
  // Define allowed file types based on upload type
  const allowedTypes: { [key: string]: string[] } = {
    'dish-image': ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    'user-avatar': ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    'general': ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
  };

  const allowed = allowedTypes[uploadType] || allowedTypes['general'];
  
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed for ${uploadType}`));
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Single file upload
  }
});

// Upload middleware
export const uploadMiddleware = upload.single('file');

// Upload controller
export const uploadFile: RequestHandler = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const uploadType = req.body.uploadType || 'general';
    
    console.log('Upload type received:', uploadType);
    console.log('Current file path:', req.file.path);
    
    // Move file from temp directory to the correct directory
    const finalDir = path.join(process.cwd(), 'uploads', uploadType);
    const finalPath = path.join(finalDir, req.file.filename);
    
    try {
      await createUploadsDir(finalDir);
      await fs.rename(req.file.path, finalPath);
      console.log('File moved to:', finalPath);
    } catch (moveError) {
      console.error('Failed to move file to final directory:', moveError);
      // Try to clean up the temp file
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Failed to clean up temp file:', cleanupError);
      }
      res.status(500).json({ message: 'Failed to organize uploaded file' });
      return;
    }
    
    // Check if upload type requires admin privileges
    const adminOnlyUploadTypes = ['dish-image', 'menu-image'];
    if (adminOnlyUploadTypes.includes(uploadType)) {
      const user = req.user as any;
      if (!user || user.role !== 'admin') {
        // Delete the uploaded file since user doesn't have permission
        try {
          await fs.unlink(req.file.path);
        } catch (deleteError) {
          console.error('Failed to delete unauthorized upload:', deleteError);
        }
        res.status(403).json({ 
          message: `Upload type '${uploadType}' requires administrator privileges.` 
        });
        return;
      }
    }

    // Construct the correct file URL for backend serving
    // This should point to the backend server, not the client
    const backendBaseUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    const fileUrl = `${backendBaseUrl}/api/uploads/${uploadType}/${req.file.filename}`;

    console.log('Generated file URL:', fileUrl);
    console.log('Upload type:', uploadType);
    console.log('Filename:', req.file.filename);

    const result = {
      success: true,
      file: {
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: fileUrl,
        uploadType
      }
    };

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      message: 'File upload failed', 
      error: error.message 
    });
  }
};

// Delete file controller
export const deleteFile: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { fileUrl } = req.body;
    
    if (!fileUrl) {
      res.status(400).json({ message: 'File URL is required' });
      return;
    }

    // Extract filename from URL
    const urlParts = fileUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    const uploadType = urlParts[urlParts.length - 2];
    
    if (!filename || !uploadType) {
      res.status(400).json({ message: 'Invalid file URL format' });
      return;
    }

    // Check if upload type requires admin privileges
    const adminOnlyUploadTypes = ['dish-image', 'menu-image'];
    if (adminOnlyUploadTypes.includes(uploadType)) {
      const user = req.user as any;
      if (!user || user.role !== 'admin') {
        res.status(403).json({ 
          message: `Deleting files of type '${uploadType}' requires administrator privileges.` 
        });
        return;
      }
    }

    const filePath = path.join(process.cwd(), 'uploads', uploadType, filename);

    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
      
      res.status(200).json({ 
        success: true, 
        message: 'File deleted successfully' 
      });
    } catch (error) {
      // File doesn't exist or couldn't be deleted
      res.status(404).json({ 
        message: 'File not found or already deleted' 
      });
    }
  } catch (error: any) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      message: 'File deletion failed', 
      error: error.message 
    });
  }
};

// Get file info controller
export const getFileInfo: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { filename, uploadType } = req.params;
    
    if (!filename || !uploadType) {
      res.status(400).json({ message: 'Filename and upload type are required' });
      return;
    }

    const filePath = path.join(process.cwd(), 'uploads', uploadType, filename);

    try {
      const stats = await fs.stat(filePath);
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const fileUrl = `${baseUrl}/api/uploads/${uploadType}/${filename}`;

      res.status(200).json({
        success: true,
        file: {
          filename,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          url: fileUrl,
          uploadType
        }
      });
    } catch (error) {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error: any) {
    console.error('Get file info error:', error);
    res.status(500).json({ 
      message: 'Failed to get file info', 
      error: error.message 
    });
  }
};
