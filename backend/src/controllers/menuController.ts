import { Request, RequestHandler, Response } from "express";
import { body, validationResult, param, query } from "express-validator";
import { Types } from 'mongoose';
import Menu, { IMenu } from "../models/Menu";
import Dish from "../models/Dish";

// --- Walidacja ---

export const createMenuValidationRules = [
  body("date")
    .isISO8601()
    .toDate()
    .withMessage("Date must be a valid date in YYYY-MM-DD format."),
  body("dishes")
    .isArray({ min: 1 })
    .withMessage("Dishes must be an array with at least one dish ID."),
  body("dishes.*")
    .isMongoId()
    .withMessage("Each item in dishes must be a valid Dish ID."),
];

export const updateMenuValidationRules = [
  // W aktualizacji pola są opcjonalne
  body("date")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Date must be a valid date in YYYY-MM-DD format."),
  body("dishes")
    .optional()
    .isArray()
    .withMessage("Dishes must be an array of dish IDs."),
  body("dishes.*")
    .isMongoId()
    .withMessage("Each item in dishes must be a valid Dish ID."),
];

export const getAllMenusValidationRules = [
  query("startDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Invalid start date format."),
  query("endDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Invalid end date format."),
  query("upcoming").optional().isBoolean().toBoolean(),
];

// --- Kontrolery ---

/**
 * Tworzy nowe menu (tylko dla admina)
 */
export const createMenu: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { date, dishes } = req.body;

  try {
    // Sprawdź, czy menu na ten dzień już istnieje, aby uniknąć duplikatów
    const menuDate = new Date(date);
    menuDate.setUTCHours(0, 0, 0, 0); // Normalizacja daty do północy UTC

    const existingMenu = await Menu.findOne({ date: menuDate });
    if (existingMenu) {
      res
        .status(400)
        .json({ message: "Menu for this date already exists." });
        return;
    }

    // Opcjonalnie: Sprawdź, czy wszystkie podane ID dań istnieją w bazie
    const dishesExist = await Dish.find({ _id: { $in: dishes } });
    if (dishesExist.length !== dishes.length) {
      res.status(400).json({ message: "One or more dish IDs are invalid." });
      return;
    }

    const newMenu: IMenu = new Menu({
      date: menuDate,
      dishes,
    });

    await newMenu.save();
    // Zwróć menu z zapełnionymi danymi dań
    await newMenu.populate("dishes");
    
    res.status(201).json(newMenu);
    return;
  } catch (error: any) {
    console.error("Error creating menu:", error);
    res
      .status(500)
      .json({ message: "Server error creating menu.", error: error.message });
      return;
  }
};

/**
 * Pobiera wszystkie menu z możliwością filtrowania
 */
export const getAllMenus: RequestHandler = async (
  req: Request,
  res: Response
) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    const { startDate, endDate, upcoming } = req.query;

    try {
        const queryFilter: any = {};

        if (upcoming) {
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0); // Początek dzisiejszego dnia w UTC
            queryFilter.date = { $gte: today };
        } else if (startDate || endDate) {
            queryFilter.date = {};
            if (startDate) {
                queryFilter.date.$gte = new Date(startDate as string);
            }
            if (endDate) {
                const end = new Date(endDate as string);
                end.setUTCHours(23, 59, 59, 999); // Koniec dnia
                queryFilter.date.$lte = end;
            }
        }

        const menus = await Menu.find(queryFilter)
            .populate("dishes") // Zastępuje ID dań pełnymi obiektami dań
            .sort({ date: "asc" }); // Sortuj od najwcześniejszej daty

        res.json(menus);
    } catch (error: any) {
        console.error("Error fetching menus:", error);
        res.status(500).json({
            message: "Server error fetching menus.",
            error: error.message,
        });
        return;
    }
};

/**
 * Pobiera konkretne menu po jego ID
 */
export const getMenuById: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const menu = await Menu.findById(req.params.menuId).populate("dishes");

    if (!menu) {
      res.status(404).json({ message: "Menu not found." });
      return;
    }

    res.json(menu);
    return;
  } catch (error: any) {
    console.error("Error fetching menu by ID:", error);
    if (error.kind === "ObjectId") {
      res.status(400).json({ message: "Invalid menu ID format." });
      return;
    }
    res
      .status(500)
      .json({ message: "Server error fetching menu.", error: error.message });
      return;
  }
};

/**
 * Aktualizuje istniejące menu (tylko dla admina)
 */
export const updateMenu = async (
  req: Request,
  res: Response
): Promise<void> => { // Sygnatura jest teraz poprawna: zwracamy Promise<void>
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return; // FIX 1: Zakończ wykonanie po wysłaniu odpowiedzi
  }

  const { date, dishes } = req.body;
  const { menuId } = req.params;

  try {
    const menu = await Menu.findById(menuId);

    if (!menu) {
      res.status(404).json({ message: "Menu not found." });
      return; // FIX 1: Zakończ wykonanie
    }

    // Od tego momentu TypeScript wie, że `menu` nie jest `null`.

    const updateData: {
      date?: Date;
      dishes?: Types.ObjectId[] | string[];
    } = {};

    // Walidacja i przygotowanie danych do aktualizacji
    if (date) {
      const newMenuDate = new Date(date);
      newMenuDate.setUTCHours(0, 0, 0, 0);

      const existingMenu = await Menu.findOne({
        date: newMenuDate,
        _id: { $ne: menu._id },
      });

      if (existingMenu) {
        res
          .status(400)
          .json({ message: "Another menu for this date already exists." });
        return; // FIX 1
      }
      updateData.date = newMenuDate;
    }

    if (dishes) {
      const dishesCount = await Dish.countDocuments({ _id: { $in: dishes } });
      if (dishesCount !== dishes.length) {
        res
          .status(400)
          .json({ message: "One or more dish IDs are invalid." });
        return; // FIX 1
      }
      updateData.dishes = dishes;
    }

    // FIX 2: Użyj metody .set() do aktualizacji - jest to idiomatyczne i type-safe
    menu.set(updateData);

    const updatedMenu = await menu.save();
    await updatedMenu.populate("dishes");

    res.json(updatedMenu);

  } catch (error: any) {
    console.error("Error updating menu:", error);
    if (error.kind === "ObjectId") {
      res.status(400).json({ message: "Invalid menu ID format." });
      return; // FIX 1
    }

    res.status(500).json({
      message: "Server error updating menu.",
      error: error.message,
    });
  }
};

/**
 * Usuwa menu (tylko dla admina)
 */
export const deleteMenu: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const menu = await Menu.findByIdAndDelete(req.params.menuId);

    if (!menu) {
      res.status(404).json({ message: "Menu not found." });
      return;
    }

    res.json({ message: "Menu successfully deleted." });
    return;
  } catch (error: any) {
    console.error("Error deleting menu:", error);
    if (error.kind === "ObjectId") {
      res.status(400).json({ message: "Invalid menu ID format." });
      return;
    }
    res
      .status(500)
      .json({ message: "Server error deleting menu.", error: error.message });
  }
};

/**
 * Pobiera menu dla konkretnej daty
 */
export const getMenuByDate: RequestHandler = async (req: Request, res: Response) => {
  try {
    const dateString = req.params.dateString;
    console.log("Received dateString:", dateString);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
      return;
    }

    // Zamieniamy dateString na Date i ustawiamy zakres od początku do końca dnia
    const targetDate = new Date(dateString);
    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const menu = await Menu.findOne({
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      }
    }).populate('dishes');

    if (!menu) {
      res.status(404).json({ message: 'No menu found for this date.' });
      return;
    }

    res.json(menu);
  } catch (error: any) {
    console.error("Error fetching menu by date:", error);
    res.status(500).json({ message: "Server error fetching menu.", error: error.message });
  }
};

