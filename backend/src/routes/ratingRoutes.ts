import express from 'express';
import * as ratingController from '../controllers/ratingController';
import { isAuthenticated, isStudent, isAdmin, isStudentApproved } from '../middleware/authMiddleware';

const router = express.Router();

// Student routes for ratings
// A student must be approved to rate
router.post('/', isAuthenticated, isStudent, isStudentApproved, ratingController.createOrUpdateRating);
router.get('/my-rating/dish/:dishId/menu-date/:menuDateString', isAuthenticated, isStudent, isStudentApproved, ratingController.getMyRatingForDishOnMenu);
router.delete('/:ratingId', isAuthenticated, isStudent, isStudentApproved, ratingController.deleteMyRating);


// Admin/General routes for viewing ratings
// Admins can see all ratings. Approved students might see aggregated views (handled in dish model/controller for average).
// For specific ratings list for a dish, let's restrict to admin for now, or make it more granular if needed.
router.get('/dish/:dishId', isAuthenticated, isAdmin, ratingController.getRatingsForDish); // Admin can view all ratings for a dish

export default router;