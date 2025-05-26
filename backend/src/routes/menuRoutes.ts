import express from "express";
import * as menuController from "../controllers/menuController";
import {
  isAuthenticated,
  isAdmin,
  isStudentApproved,
} from "../middleware/authMiddleware";

const router = express.Router();

// Admin routes for managing menus
router.post("/", isAuthenticated, isAdmin, menuController.createDish);
router.put("/:menuId", isAuthenticated, isAdmin, menuController.updateDish);
router.delete("/:menuId", isAuthenticated, isAdmin, menuController.deleteDish);
// router.patch(
//   "/:menuId/publish",
//   isAuthenticated,
//   isAdmin,
//   menuController.togglePublishMenu
// ); // For publishing/unpublishing

// Routes for viewing menus
// All authenticated users (approved students and admins) can view menus
router.get(
  "/",
  isAuthenticated,
  isStudentApproved,
  menuController.getAllDishes
); // Get multiple menus (e.g., range, upcoming)
// router.get('/date/:dateString', isAuthenticated, isStudentApproved, menuController.); // Get menu for a specific date (YYYY-MM-DD)
router.get(
  "/:menuId",
  isAuthenticated,
  isStudentApproved,
  menuController.getDishById
); // Get a specific menu by its ID

export default router;
