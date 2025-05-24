import express from 'express';
import * as commentController from '../controllers/commentController';
import { isAuthenticated, isStudent, isAdmin, isStudentApproved } from '../middleware/authMiddleware';

const router = express.Router();

// --- Student Comment Routes ---
// Student must be approved to comment
router.post('/', isAuthenticated, isStudent, isStudentApproved, commentController.createComment);
router.get('/my-comments', isAuthenticated, isStudent, isStudentApproved, commentController.getMyComments);
router.put('/:commentId', isAuthenticated, isStudent, isStudentApproved, commentController.updateMyComment);
router.delete('/:commentId', isAuthenticated, isStudent, isStudentApproved, commentController.deleteMyComment);

// --- Public/General View Routes for Comments ---
// Approved students and admins can see approved comments for a dish
router.get('/dish/:dishId/approved', isAuthenticated, isStudentApproved, commentController.getApprovedCommentsForDish);

// --- Admin Comment Moderation Routes ---
router.get('/admin/moderate', isAuthenticated, isAdmin, commentController.getCommentsForModeration);
router.patch('/admin/moderate/:commentId', isAuthenticated, isAdmin, commentController.moderateComment);


export default router;