import express from "express";
import * as ratingController from "../controllers/ratingController";
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
 *   name: Ratings
 *   description: Rating management endpoints
 */

/**
 * @swagger
 * /api/ratings:
 *   post:
 *     summary: Create or update a rating for a dish
 *     tags: [Ratings]
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
 *               - rating
 *               - menuDate
 *             properties:
 *               dish:
 *                 type: string
 *                 description: Dish ID to rate
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating value (1-5)
 *               menuDate:
 *                 type: string
 *                 format: date
 *                 description: Menu date when the dish was served
 *     responses:
 *       200:
 *         description: Rating successfully created or updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rating'
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
  ratingController.createOrUpdateRating
);

/**
 * @swagger
 * /api/ratings/my-rating/dish/{dishId}/menu-date/{menuDateString}:
 *   get:
 *     summary: Get my rating for a specific dish on a menu date
 *     tags: [Ratings]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: dishId
 *         required: true
 *         schema:
 *           type: string
 *         description: Dish ID
 *       - in: path
 *         name: menuDateString
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Menu date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: User's rating for the dish
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rating'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Student approval required
 *       404:
 *         description: Rating not found
 */
router.get(
  "/my-rating/dish/:dishId/menu-date/:menuDateString",
  isAuthenticated,
  isStudent,
  isStudentApproved,
  ratingController.getMyRatingForDishOnMenu
);

/**
 * @swagger
 * /api/ratings/{ratingId}:
 *   delete:
 *     summary: Delete my rating
 *     tags: [Ratings]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: ratingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Rating ID to delete
 *     responses:
 *       200:
 *         description: Rating successfully deleted
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Can only delete your own ratings
 *       404:
 *         description: Rating not found
 */
router.delete(
  "/:ratingId",
  isAuthenticated,
  isStudent,
  isStudentApproved,
  ratingController.deleteMyRating
);

/**
 * @swagger
 * /api/ratings/dish/{dishId}:
 *   get:
 *     summary: Get all ratings for a specific dish (Admin only)
 *     tags: [Ratings]
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
 *           maximum: 100
 *           default: 20
 *         description: Number of ratings per page
 *     responses:
 *       200:
 *         description: List of ratings for the dish
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ratings:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Rating'
 *                 totalCount:
 *                   type: number
 *                   description: Total number of ratings
 *                 averageRating:
 *                   type: number
 *                   description: Average rating for the dish
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Dish not found
 */
router.get(
  "/dish/:dishId",
  isAuthenticated,
  isAdmin,
  ratingController.getRatingsForDish
);

export default router;
