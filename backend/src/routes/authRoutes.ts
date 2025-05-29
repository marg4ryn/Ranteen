import express from "express";
import * as authController from "../controllers/authController";
import {
  isAuthenticated,
  isAdmin,
  canManageAdmins,
} from "../middleware/authMiddleware";

const router = express.Router();

// --- Admin Auth ---
// To create the VERY FIRST admin, you might run a script, or temporarily open this route.
// For subsequent admins, ensure only an existing admin can create another.
router.post(
  "/admin/register",
  canManageAdmins,
  authController.validateAdminRegistration,
  authController.registerAdmin
); // Secure this appropriately

router.post("/admin/login", authController.loginAdmin);
router.post(
  "/admin/request-password-reset",
  authController.requestPasswordResetAdmin
);
router.post("/admin/reset-password", authController.resetPasswordAdmin); // Token would be part of this

// --- Student Auth (Google SSO) ---
router.get("/google", authController.googleLogin);
router.get("/google/callback", authController.googleCallback);

// --- General Auth ---
router.post("/logout", isAuthenticated, authController.logout);
router.get("/me", isAuthenticated, authController.getCurrentUser); // Get current logged-in user details

// --- Admin User Management ---
router.get(
  "/admin/pending-students",
  isAuthenticated,
  isAdmin,
  authController.getPendingStudents
);
router.patch(
  "/admin/students/:studentId/approve",
  isAuthenticated,
  isAdmin,
  authController.approveStudent
);

export default router;
