import express from 'express';
import * as menuController from '../controllers/menuController';
import { isAuthenticated, isAdmin, isStudentApproved } from '../middleware/authMiddleware';

const router = express.Router();

// Admin routes for managing menus
router.post('/', isAuthenticated, isAdmin, menuController.createMenu);
router.put('/:menuId', isAuthenticated, isAdmin, menuController.updateMenu);
router.delete('/:menuId', isAuthenticated, isAdmin, menuController.deleteMenu);
router.patch('/:menuId/publish', isAuthenticated, isAdmin, menuController.togglePublishMenu); // For publishing/unpublishing

// Routes for viewing menus
// All authenticated users (approved students and admins) can view menus
router.get('/', isAuthenticated, isStudentApproved, menuController.getMenus); // Get multiple menus (e.g., range, upcoming)
router.get('/date/:dateString', isAuthenticated, isStudentApproved, menuController.getMenuByDate); // Get menu for a specific date (YYYY-MM-DD)
router.get('/:menuId', isAuthenticated, isStudentApproved, menuController.getMenuById); // Get a specific menu by its ID

export default router;