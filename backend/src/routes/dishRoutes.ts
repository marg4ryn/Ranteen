import express from 'express';
import * as dishController from '../controllers/dishController';
import { isAuthenticated, isAdmin, isStudentApproved } from '../middleware/authMiddleware'; // Add isStudentApproved

const router = express.Router();

// Admin routes for dishes
router.post('/', isAuthenticated, isAdmin, dishController.createDish);
router.put('/:dishId', isAuthenticated, isAdmin, dishController.updateDish);
router.delete('/:dishId', isAuthenticated, isAdmin, dishController.deleteDish); // Soft delete

// Routes accessible to authenticated users (students need approval for some views)
// For getAllDishes and getDishById, we want students to see them too.
// isStudentApproved might be relevant if unapproved students should not see any data.
// Let's assume approved students and admins can view dishes.
router.get('/', isAuthenticated, isStudentApproved, dishController.getAllDishes); // Added isStudentApproved
router.get('/:dishId', isAuthenticated, isStudentApproved, dishController.getDishById); // Added isStudentApproved

export default router;