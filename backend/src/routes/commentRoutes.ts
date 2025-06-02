import express from "express";
import * as commentController from "../controllers/commentController";
import {
  isAuthenticated,
  isStudent,
  isAdmin,
  isStudentApproved,
} from "../middleware/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Comment management endpoints
 */

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Create a new comment on a dish
 *     tags: [Comments]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dish
 *               - content
 *             properties:
 *               dish:
 *                 type: string
 *                 description: Dish ID to comment on
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *                 description: Comment content
 *     responses:
 *       201:
 *         description: Comment successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Student approval required
 *       404:
 *         description: Dish not found
 */
router.post(
  "/",
  isAuthenticated,
  isStudent,
  isStudentApproved,
  commentController.commentValidationRules,
  commentController.createComment
);

/**
 * @swagger
 * /api/comments/my-comments:
 *   get:
 *     summary: Get my comments
 *     tags: [Comments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of comments per page
 *     responses:
 *       200:
 *         description: List of user's comments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 comments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *                 totalCount:
 *                   type: number
 *                   description: Total number of comments
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Student approval required
 */
router.get(
  "/my-comments",
  isAuthenticated,
  isStudent,
  isStudentApproved,
  commentController.getMyComments
);

/**
 * @swagger
 * /api/comments/{commentId}:
 *   put:
 *     summary: Update my comment
 *     tags: [Comments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *                 description: Updated comment content
 *     responses:
 *       200:
 *         description: Comment successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Can only update your own comments
 *       404:
 *         description: Comment not found
 *   delete:
 *     summary: Delete my comment
 *     tags: [Comments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID to delete
 *     responses:
 *       200:
 *         description: Comment successfully deleted
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Can only delete your own comments
 *       404:
 *         description: Comment not found
 */
router.put(
  "/:commentId",
  isAuthenticated,
  isStudent,
  isStudentApproved,
  commentController.updateMyComment
);
router.delete(
  "/:commentId",
  isAuthenticated,
  isStudent,
  isStudentApproved,
  commentController.deleteMyComment
);

/**
 * @swagger
 * /api/comments/dish/{dishId}/approved:
 *   get:
 *     summary: Get approved comments for a specific dish
 *     tags: [Comments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: dishId
 *         required: true
 *         schema:
 *           type: string
 *         description: Dish ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of comments per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [newest, oldest]
 *           default: newest
 *         description: Sort order for comments
 *     responses:
 *       200:
 *         description: List of approved comments for the dish
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 comments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *                 totalCount:
 *                   type: number
 *                   description: Total number of approved comments
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Student approval required
 *       404:
 *         description: Dish not found
 */
router.get(
  "/dish/:dishId/approved",
  isAuthenticated,
  isStudentApproved,
  commentController.getApprovedCommentsForDish
);

/**
 * @swagger
 * /api/comments/admin/moderate:
 *   get:
 *     summary: Get comments pending moderation (Admin only)
 *     tags: [Comments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *         description: Number of comments per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter by moderation status
 *     responses:
 *       200:
 *         description: List of comments for moderation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 comments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *                 totalCount:
 *                   type: number
 *                   description: Total number of comments
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Admin access required
 */
router.get(
  "/admin/moderate",
  isAuthenticated,
  isAdmin,
  commentController.getCommentsForModeration
);

/**
 * @swagger
 * /api/comments/admin/moderate/{commentId}:
 *   patch:
 *     summary: Moderate a comment (Admin only)
 *     tags: [Comments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID to moderate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject]
 *                 description: Moderation action
 *               reason:
 *                 type: string
 *                 description: Reason for rejection (required if action is reject)
 *     responses:
 *       200:
 *         description: Comment successfully moderated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Comment not found
 */
router.patch(
  "/admin/moderate/:commentId",
  isAuthenticated,
  isAdmin,
  commentController.moderateComment
);

export default router;
