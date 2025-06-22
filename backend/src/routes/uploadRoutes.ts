import express from 'express';
import { uploadMiddleware, uploadFile, deleteFile, getFileInfo } from '../controllers/uploadController';
import { isAuthenticated } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     FileUpload:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         file:
 *           type: object
 *           properties:
 *             originalName:
 *               type: string
 *               description: Original filename
 *             filename:
 *               type: string
 *               description: Generated unique filename
 *             size:
 *               type: number
 *               description: File size in bytes
 *             mimetype:
 *               type: string
 *               description: MIME type of the file
 *             url:
 *               type: string
 *               description: URL to access the uploaded file
 *             uploadType:
 *               type: string
 *               description: Type of upload (dish-image, user-avatar, etc.)
 */

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload a file
 *     tags: [Upload]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload
 *               uploadType:
 *                 type: string
 *                 enum: [dish-image, user-avatar, general]
 *                 description: Type of file upload
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileUpload'
 *       400:
 *         description: Bad request - no file or invalid file type
 *       401:
 *         description: Unauthorized
 *       413:
 *         description: File too large
 *       500:
 *         description: Server error
 */
router.post('/', isAuthenticated, uploadMiddleware, uploadFile);

/**
 * @swagger
 * /api/upload/delete:
 *   delete:
 *     summary: Delete a file
 *     tags: [Upload]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileUrl:
 *                 type: string
 *                 description: URL of the file to delete
 *             required:
 *               - fileUrl
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       400:
 *         description: Bad request - missing file URL
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: File not found
 *       500:
 *         description: Server error
 */
router.delete('/delete', isAuthenticated, deleteFile);

/**
 * @swagger
 * /api/upload/info/{uploadType}/{filename}:
 *   get:
 *     summary: Get file information
 *     tags: [Upload]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: uploadType
 *         required: true
 *         schema:
 *           type: string
 *         description: Type of upload
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Filename
 *     responses:
 *       200:
 *         description: File information retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: File not found
 *       500:
 *         description: Server error
 */
router.get('/info/:uploadType/:filename', isAuthenticated, getFileInfo);

// Public route to serve file info (without authentication)
router.get('/public/info/:uploadType/:filename', getFileInfo);

export default router;
