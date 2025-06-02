import express from "express";
import * as authController from "../controllers/authController";
import {
  isAuthenticated,
  isAdmin,
  canManageAdmins,
} from "../middleware/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization endpoints
 */

/**
 * @swagger
 * /api/auth/admin/register:
 *   post:
 *     summary: Register a new admin user
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Admin email address
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Admin password
 *               firstName:
 *                 type: string
 *                 description: Admin first name
 *               lastName:
 *                 type: string
 *                 description: Admin last name
 *     responses:
 *       201:
 *         description: Admin successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input data
 *       403:
 *         description: Unauthorized - only admins can create other admins
 *       409:
 *         description: Email already exists
 */
router.post(
  "/admin/register",
  canManageAdmins,
  authController.validateAdminRegistration,
  authController.registerAdmin
);

/**
 * @swagger
 * /api/auth/admin/login:
 *   post:
 *     summary: Login as admin user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Admin email address
 *               password:
 *                 type: string
 *                 description: Admin password
 *     responses:
 *       200:
 *         description: Successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post("/admin/login", authController.loginAdmin);

/**
 * @swagger
 * /api/auth/admin/request-password-reset:
 *   post:
 *     summary: Request password reset for admin
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Admin email address
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post(
  "/admin/request-password-reset",
  authController.requestPasswordResetAdmin
);

/**
 * @swagger
 * /api/auth/admin/reset-password:
 *   post:
 *     summary: Reset admin password using token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: Password reset token
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: New password
 *     responses:
 *       200:
 *         description: Password successfully reset
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Server error
 */
router.post("/admin/reset-password", authController.resetPasswordAdmin);

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Initiate Google OAuth login
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth
 */
router.get("/google", authController.googleLogin);

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirect after successful authentication
 *       401:
 *         description: Authentication failed
 */
router.get("/google/callback", authController.googleCallback);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout current user
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       401:
 *         description: Not authenticated
 */
router.post("/logout", isAuthenticated, authController.logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user information
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 */
router.get("/me", isAuthenticated, authController.getCurrentUser);

/**
 * @swagger
 * /api/auth/admin/pending-students:
 *   get:
 *     summary: Get list of pending student approvals
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of pending students
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Admin access required
 */
router.get(
  "/admin/pending-students",
  isAuthenticated,
  isAdmin,
  authController.getPendingStudents
);

/**
 * @swagger
 * /api/auth/admin/students/{studentId}/approve:
 *   patch:
 *     summary: Approve a pending student
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID to approve
 *     responses:
 *       200:
 *         description: Student successfully approved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Student not found
 */
router.patch(
  "/admin/students/:studentId/approve",
  isAuthenticated,
  isAdmin,
  authController.approveStudent
);

export default router;
