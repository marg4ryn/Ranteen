import express from "express";
import * as dishController from "../controllers/dishController";
import {
  isAuthenticated,
  isAdmin,
  isStudentApproved,
} from "../middleware/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dishes
 *   description: Dish management endpoints
 */

/**
 * @swagger
 * /api/dishes:
 *   post:
 *     summary: Create a new dish (Admin only)
 *     tags: [Dishes]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 description: Dish name
 *               description:
 *                 type: string
 *                 description: Dish description
 *               category:
 *                 type: string
 *                 enum: [starter, main, dessert, drink]
 *                 description: Dish category
 *               allergens:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of allergens
 *               dietaryInfo:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [vegetarian, vegan, gluten-free, dairy-free, nut-free]
 *                 description: Dietary information
 *     responses:
 *       201:
 *         description: Dish successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dish'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Admin access required
 *   get:
 *     summary: Get all dishes
 *     tags: [Dishes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [starter, main, dessert, drink]
 *         description: Filter dishes by category
 *       - in: query
 *         name: dietary
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [vegetarian, vegan, gluten-free, dairy-free, nut-free]
 *         description: Filter dishes by dietary information
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search dishes by name or description
 *     responses:
 *       200:
 *         description: List of dishes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Dish'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Student approval required
 */
router.post("/", isAuthenticated, isAdmin, dishController.createDish);
router.get(
  "/",
  isAuthenticated,
  isStudentApproved,
  dishController.getAllDishes
);

/**
 * @swagger
 * /api/dishes/{dishId}:
 *   get:
 *     summary: Get a specific dish by ID
 *     tags: [Dishes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: dishId
 *         required: true
 *         schema:
 *           type: string
 *         description: Dish ID
 *     responses:
 *       200:
 *         description: Dish details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dish'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Student approval required
 *       404:
 *         description: Dish not found
 *   put:
 *     summary: Update a dish (Admin only)
 *     tags: [Dishes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: dishId
 *         required: true
 *         schema:
 *           type: string
 *         description: Dish ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Dish name
 *               description:
 *                 type: string
 *                 description: Dish description
 *               category:
 *                 type: string
 *                 enum: [starter, main, dessert, drink]
 *                 description: Dish category
 *               allergens:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of allergens
 *               dietaryInfo:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [vegetarian, vegan, gluten-free, dairy-free, nut-free]
 *                 description: Dietary information
 *     responses:
 *       200:
 *         description: Dish successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dish'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Dish not found
 *   delete:
 *     summary: Delete a dish (Admin only)
 *     tags: [Dishes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: dishId
 *         required: true
 *         schema:
 *           type: string
 *         description: Dish ID
 *     responses:
 *       200:
 *         description: Dish successfully deleted
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Dish not found
 */
router.get(
  "/:dishId",
  isAuthenticated,
  isStudentApproved,
  dishController.getDishById
);
router.put("/:dishId", isAuthenticated, isAdmin, dishController.updateDish);
router.delete("/:dishId", isAuthenticated, isAdmin, dishController.deleteDish);

export default router;
