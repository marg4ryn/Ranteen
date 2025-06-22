import { Request, RequestHandler, Response } from "express";
import { body, validationResult, query } from "express-validator";
import Dish, { IDish, DishCategory } from "../models/Dish";
import { IUser } from "../models/User"; // Assuming IUser is exported from User model
import Menu from "../models/Menu";

export const dishValidationRules = [
  body("name").trim().notEmpty().withMessage("Dish name is required."),
  body("category")
    .isIn(["danie główne", "zupa", "deser", "wegetariańskie", "dodatek", "napój"])
    .withMessage(
      "Invalid dish category. Valid categories are: danie główne, zupa, deser, wegetariańskie, dodatek, napój"
    ),
  body("description").optional().trim(),
  body("imageUrl").optional().isString().withMessage("Image URL must be a string."),
  body("allergens")
    .optional()
    .isArray()
    .withMessage("Allergens must be an array of strings.")
    .custom((allergens: any[]) =>
      allergens.every((item) => typeof item === "string")
    )
    .withMessage("Each allergen must be a string."),
];

export const createDish: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { name, description, category, imageUrl, allergens } = req.body;
  const adminUser = req.user as IUser;

  try {
    const existingDish = await Dish.findOne({ name });
    if (existingDish) {
      res.status(400).json({ message: "Dish with this name already exists." });
      return;
    }

    const newDish: IDish = new Dish({
      name,
      description,
      category,
      imageUrl,
    });

    await newDish.save();
    res.status(201).json(newDish);
  } catch (error: any) {
    console.error("Error creating dish:", error);
    res
      .status(500)
      .json({ message: "Server error creating dish.", error: error.message });
  }
};

const getAllDishesValidationRules = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("category").optional().isString().trim(),
  query("name").optional().isString().trim(),
  query("sortBy")
    .optional()
    .isString()
    .trim()
    .isIn(["name", "category", "createdAt", "averageRating"]),
  query("sortOrder").optional().isString().trim().isIn(["asc", "desc"]),
];

export const getAllDishes: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const page = (req.query.page as unknown as number) || 1;
  const limit = (req.query.limit as unknown as number) || 10;
  const category = req.query.category as DishCategory | undefined;
  const nameQuery = req.query.name as string | undefined;
  const adminUser = req.user as IUser;

  const sortBy = (req.query.sortBy as string) || "name";
  const sortOrder = (req.query.sortOrder as "asc" | "desc") || "asc";

  try {
    const queryFilter: any = {};
    if (category) queryFilter.category = category;
    if (nameQuery) queryFilter.name = { $regex: nameQuery, $options: "i" }; // Case-insensitive search

    const totalDishes = await Dish.countDocuments(queryFilter);
    const dishes = await Dish.find(queryFilter)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    // .populate("createdBy", "name email") // Populate creator info
    // .populate("updatedBy", "name email"); // Populate updater info

    res.json({
      dishes,
      currentPage: page,
      totalPages: Math.ceil(totalDishes / limit),
      totalDishes,
    });
  } catch (error: any) {
    console.error("Error fetching dishes:", error);
    res.status(500).json({
      message: "Server error fetching dishes.",
      error: error.message,
    });
  }
};

export const getDishById: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { dishId } = req.params;

    // Validate that dishId is provided and not undefined
    if (!dishId || dishId === "undefined") {
      res.status(400).json({ message: "Dish ID is required." });
      return;
    }

    // Validate ObjectId format
    if (!dishId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ message: "Invalid dish ID format." });
      return;
    }

    const dish = await Dish.findById(dishId);

    if (!dish) {
      res.status(404).json({ message: "Dish not found." });
      return;
    }

    res.json(dish);
  } catch (error: any) {
    console.error("Error fetching dish by ID:", error);
    if (error.kind === "ObjectId") {
      res.status(400).json({ message: "Invalid dish ID format." });
      return;
    }
    res
      .status(500)
      .json({ message: "Server error fetching dish.", error: error.message });
  }
};

export const updateDish: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { name, description, category, imageUrl, allergens } = req.body;
  const adminUser = req.user as IUser;

  try {
    const { dishId } = req.params;

    // Validate that dishId is provided and not undefined
    if (!dishId || dishId === "undefined") {
      res.status(400).json({ message: "Dish ID is required." });
      return;
    }

    // Validate ObjectId format
    if (!dishId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ message: "Invalid dish ID format." });
      return;
    }

    let dish = await Dish.findById(dishId);
    if (!dish) {
      res.status(404).json({ message: "Dish not found." });
      return;
    }

    // Check if name is being changed and if the new name already exists for another dish
    if (name && name !== dish.name) {
      const existingDishWithNewName = await Dish.findOne({ name });
      if (existingDishWithNewName) {
        res
          .status(400)
          .json({ message: "Another dish with this name already exists." });
        return;
      }
    }

    dish.name = name || dish.name;
    dish.description =
      description !== undefined ? description : dish.description;
    dish.category = category || dish.category;
    dish.imageUrl = imageUrl !== undefined ? imageUrl : dish.imageUrl;

    const updatedDish = await dish.save();
    res.json(updatedDish);
  } catch (error: any) {
    console.error("Error updating dish:", error);
    if (error.kind === "ObjectId") {
      res.status(400).json({ message: "Invalid dish ID format." });
      return;
    }
    res
      .status(500)
      .json({ message: "Server error updating dish.", error: error.message });
  }
};

export const deleteDish: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { dishId } = req.params;

    // Validate that dishId is provided and not undefined
    if (!dishId || dishId === "undefined") {
      res.status(400).json({ message: "Dish ID is required." });
      return;
    }

    // Validate ObjectId format
    if (!dishId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ message: "Invalid dish ID format." });
      return;
    }

    const deletedDish = await Dish.findByIdAndDelete(dishId);

    if (!deletedDish) {
      res.status(404).json({ message: "Dish not found." });
      return;
    }

    res.json({ message: "Dish deleted successfully." });
    return;
  } catch (error: any) {
    console.error("Error deleting dish:", error);
    if (error.kind === "ObjectId") {
      res.status(400).json({ message: "Invalid dish ID format." });
      return;
    }

    res.status(500).json({
      message: "Server error deleting dish.",
      error: error.message,
    });
  }
};
