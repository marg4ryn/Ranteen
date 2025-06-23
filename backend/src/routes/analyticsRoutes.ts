import express from "express";
import * as analyticsController from "../controllers/analyticsController";
import { isAuthenticated, isAdmin } from "../middleware/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Rating analytics endpoints
 */

/**
 * @swagger
 * /api/analytics/dish/{dishId}:
 *   get:
 *     summary: Get analytics for a specific dish
 *     tags: [Analytics]
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
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for analytics (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for analytics (YYYY-MM-DD)
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [day, overall]
 *         description: Group results by day or get overall analytics
 *     responses:
 *       200:
 *         description: Dish analytics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dish:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     category:
 *                       type: string
 *                 analytics:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       averageRating:
 *                         type: number
 *                       totalRatings:
 *                         type: number
 *                       ratingDistribution:
 *                         type: object
 *                         properties:
 *                           1:
 *                             type: number
 *                           2:
 *                             type: number
 *                           3:
 *                             type: number
 *                           4:
 *                             type: number
 *                           5:
 *                             type: number
 *       400:
 *         description: Invalid parameters
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
  analyticsController.dishAnalyticsValidationRules,
  analyticsController.getDishRatingsAnalytics
);

/**
 * @swagger
 * /api/analytics/daily/{date}:
 *   get:
 *     summary: Get analytics for a specific day
 *     tags: [Analytics]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date for analytics (YYYY-MM-DD)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by dish category
 *     responses:
 *       200:
 *         description: Daily analytics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 date:
 *                   type: string
 *                   format: date
 *                 menu:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     totalDishes:
 *                       type: number
 *                     filteredDishes:
 *                       type: number
 *                 overallStats:
 *                   type: object
 *                   properties:
 *                     totalRatings:
 *                       type: number
 *                     averageRating:
 *                       type: number
 *                     uniqueStudentsCount:
 *                       type: number
 *                     ratingDistribution:
 *                       type: object
 *                 dishAnalytics:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       dishName:
 *                         type: string
 *                       dishCategory:
 *                         type: string
 *                       averageRating:
 *                         type: number
 *                       totalRatings:
 *                         type: number
 *                       ratingDistribution:
 *                         type: object
 *       400:
 *         description: Invalid date format
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Admin access required
 *       404:
 *         description: No menu found for the specified date
 */
router.get(
  "/daily/:date",
  isAuthenticated,
  isAdmin,
  analyticsController.dailyAnalyticsValidationRules,
  analyticsController.getDailyRatingsAnalytics
);

/**
 * @swagger
 * /api/analytics/trending:
 *   get:
 *     summary: Get trending dishes (highest rated dishes)
 *     tags: [Analytics]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for trending analysis (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for trending analysis (YYYY-MM-DD)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of trending dishes to return
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by dish category
 *     responses:
 *       200:
 *         description: Trending dishes data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 period:
 *                   type: object
 *                   properties:
 *                     startDate:
 *                       type: string
 *                     endDate:
 *                       type: string
 *                 category:
 *                   type: string
 *                 trendingDishes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       dishName:
 *                         type: string
 *                       dishCategory:
 *                         type: string
 *                       averageRating:
 *                         type: number
 *                       totalRatings:
 *                         type: number
 *                       ratingDistribution:
 *                         type: object
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Admin access required
 */
router.get(
  "/trending",
  isAuthenticated,
  isAdmin,
  analyticsController.getTrendingDishes
);

/**
 * @swagger
 * /api/analytics/statistics:
 *   get:
 *     summary: Get overall rating statistics
 *     tags: [Analytics]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for statistics (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for statistics (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Rating statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 period:
 *                   type: object
 *                   properties:
 *                     startDate:
 *                       type: string
 *                     endDate:
 *                       type: string
 *                 statistics:
 *                   type: object
 *                   properties:
 *                     totalRatings:
 *                       type: number
 *                     averageRating:
 *                       type: number
 *                     uniqueStudentsCount:
 *                       type: number
 *                     uniqueDishesCount:
 *                       type: number
 *                     ratingDistribution:
 *                       type: object
 *                     firstRating:
 *                       type: string
 *                       format: date-time
 *                     lastRating:
 *                       type: string
 *                       format: date-time
 *                 dailyTrends:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       averageRating:
 *                         type: number
 *                       totalRatings:
 *                         type: number
 *                       date:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Admin access required
 */
router.get(
  "/statistics",
  isAuthenticated,
  isAdmin,
  analyticsController.getRatingStatistics
);

export default router;
