import express from "express";
import * as menuController from "../controllers/menuController";
import {
  isAuthenticated,
  isAdmin,
  isStudentApproved,
} from "../middleware/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Menus
 *   description: Menu management endpoints
 */

/**
 * @swagger
 * /api/menus:
 *   post:
 *     summary: Create a new menu (Admin only)
 *     tags: [Menus]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - dishes
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Menu date (YYYY-MM-DD)
 *               dishes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of dish IDs
 *     responses:
 *       201:
 *         description: Menu successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Menu'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Admin access required
 *   get:
 *     summary: Get all menus
 *     tags: [Menus]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for menu range (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for menu range (YYYY-MM-DD)
 *       - in: query
 *         name: upcoming
 *         schema:
 *           type: boolean
 *         description: Get only upcoming menus
 *     responses:
 *       200:
 *         description: List of menus
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Menu'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Student approval required
 */

/**
 * @swagger
 * /api/menus/{menuId}:
 *   get:
 *     summary: Get a specific menu by ID
 *     tags: [Menus]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: menuId
 *         required: true
 *         schema:
 *           type: string
 *         description: Menu ID
 *     responses:
 *       200:
 *         description: Menu details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Menu'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Student approval required
 *       404:
 *         description: Menu not found
 *   put:
 *     summary: Update a menu (Admin only)
 *     tags: [Menus]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: menuId
 *         required: true
 *         schema:
 *           type: string
 *         description: Menu ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Menu date (YYYY-MM-DD)
 *               dishes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of dish IDs
 *     responses:
 *       200:
 *         description: Menu successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Menu'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Menu not found
 *   delete:
 *     summary: Delete a menu (Admin only)
 *     tags: [Menus]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: menuId
 *         required: true
 *         schema:
 *           type: string
 *         description: Menu ID
 *     responses:
 *       200:
 *         description: Menu successfully deleted
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Menu not found
 */

/**
 * @swagger
 * /api/menus/date/{dateString}:
 *   get:
 *     summary: Get menu for a specific date
 *     tags: [Menus]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: dateString
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date in YYYY-MM-DD format
 *     responses:
 *       200:
 *         description: Menu for the specified date
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Menu'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Student approval required
 *       404:
 *         description: No menu found for this date
 */


// POST /api/menus - Tworzenie nowego menu
router.post(
  "/",
  isAuthenticated,
  isAdmin,
  menuController.createMenuValidationRules,
  menuController.createMenu
);

// GET /api/menus - Pobieranie wszystkich menu
router.get(
  "/",
  menuController.getAllMenusValidationRules, 
  menuController.getAllMenus
);

// GET /api/menus/:menuId - Pobieranie menu po ID
router.get(
  "/:menuId",
  menuController.getMenuById
);

// PUT /api/menus/:menuId - Aktualizacja menu
router.put(
  "/:menuId",
  isAuthenticated,
  isAdmin,
  menuController.updateMenuValidationRules,
  menuController.updateMenu
);

// DELETE /api/menus/:menuId - Usuwanie menu
router.delete(
  "/:menuId",
  isAuthenticated,
  isAdmin,
  menuController.deleteMenu
);

// GET /api/menus/date/:dateString - Pobieranie menu po dacie
router.get(
  '/date/:dateString', 
  menuController.getMenuByDate
);

export default router;
