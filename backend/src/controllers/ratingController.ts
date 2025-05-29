import { Request, RequestHandler, Response } from "express";
import { body, param, validationResult, query } from "express-validator";
import Rating, { IRating } from "../models/Rating";
import Dish from "../models/Dish";
import Menu from "../models/Menu";
import { IUser } from "../models/User";
import { updateDishAverageRating } from "../utils/ratingUtils";
import mongoose from "mongoose";

// Helper to parse date and set to midnight UTC (can be moved to a shared util if used elsewhere too)
const parseDateToUTC = (dateString: string): Date | null => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

export const ratingValidationRules = [
  body("dishId").isMongoId().withMessage("Valid Dish ID is required."),
  // menuId will be derived from menuDate in the controller logic
  body("menuDate")
    .isISO8601()
    .withMessage("Menu date (YYYY-MM-DD) is required.")
    .customSanitizer((value) => parseDateToUTC(value)?.toISOString()),
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be an integer between 1 and 5."),
];

export const createOrUpdateRating: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const student = req.user as IUser;
  const { dishId, menuDate: menuDateString, rating } = req.body;

  const parsedMenuDate = parseDateToUTC(menuDateString as string);
  if (!parsedMenuDate) {
    res.status(400).json({ message: "Invalid menu date format." });
    return;
  }

  try {
    const dish = await Dish.findById(dishId);
    if (!dish || !dish.isActive) {
      res.status(404).json({ message: "Dish not found or is inactive." });
      return;
    }

    const menu = await Menu.findOne({
      date: parsedMenuDate,
      "items.dish": dishId,
      isPublished: true,
    });
    if (!menu) {
      res.status(404).json({
        message: `Dish not found on the published menu for ${
          parsedMenuDate.toISOString().split("T")[0]
        }.`,
      });
      return;
    }

    // Check if student has already rated this dish on this menu
    let existingRating = await Rating.findOne({
      student: student.id,
      dish: dishId,
      menu: menu._id,
    });

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      await existingRating.save();
      await updateDishAverageRating(dishId);
      res.status(200).json({
        message: "Rating updated successfully.",
        rating: existingRating,
      });
      return;
    } else {
      // Create new rating
      const newRating = new Rating({
        student: student.id,
        dish: dishId,
        menu: menu._id,
        menuDate: parsedMenuDate, // Use the parsed and standardized date
        rating,
      });
      await newRating.save();
      await updateDishAverageRating(dishId);
      res.status(201).json({
        message: "Rating submitted successfully.",
        rating: newRating,
      });
      return;
    }
  } catch (error: any) {
    console.error("Error creating/updating rating:", error);
    if (error.code === 11000) {
      // Duplicate key error (should be caught by findOne above, but as a fallback)
      res.status(409).json({
        message: "You have already rated this dish for this menu date.",
      });
      return;
    }
    res.status(500).json({
      message: "Server error processing rating.",
      error: error.message,
    });
  }
};

const getMyRatingForDishValidationRulels = [
  param("dishId").isMongoId().withMessage("Valid Dish ID is required."),
  param("menuDateString")
    .isISO8601()
    .withMessage("Valid Menu Date (YYYY-MM-DD) is required."),
];

export const getMyRatingForDishOnMenu: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const student = req.user as IUser;
  const { dishId, menuDateString } = req.params;

  const parsedMenuDate = parseDateToUTC(menuDateString);
  if (!parsedMenuDate) {
    res.status(400).json({ message: "Invalid menu date format." });
    return;
  }

  try {
    const menu = await Menu.findOne({
      date: parsedMenuDate,
      "items.dish": dishId,
    });
    if (!menu) {
      res
        .status(404)
        .json({ message: "Dish not found on any menu for this date." });
      return;
    }

    const rating = await Rating.findOne({
      student: student.id,
      dish: dishId,
      menu: menu._id,
    });

    if (!rating) {
      // It's not an error if they haven't rated it, just means no rating exists
      res.status(200).json(null);
      return;
    }
    res.json(rating);
  } catch (error: any) {
    console.error("Error fetching user rating:", error);
    res.status(500).json({
      message: "Server error fetching rating.",
      error: error.message,
    });
  }
};

const deleteMyRatingValidationRules = [
  param("ratingId").isMongoId().withMessage("Valid Rating ID is required."),
];
export const deleteMyRating: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const student = req.user as IUser;
  const { ratingId } = req.params;

  try {
    const rating = await Rating.findById(ratingId);

    if (!rating) {
      res.status(404).json({ message: "Rating not found." });
      return;
    }

    if (rating.student.toString() !== student.id) {
      res.status(403).json({
        message: "Forbidden. You can only delete your own ratings.",
      });
      return;
    }

    const dishId = rating.dish;
    await rating.deleteOne();
    await updateDishAverageRating(dishId.toString());

    res.json({ message: "Rating deleted successfully." });
  } catch (error: any) {
    console.error("Error deleting rating:", error);
    res.status(500).json({
      message: "Server error deleting rating.",
      error: error.message,
    });
  }
};

const getRatingsForDishValidationRules = [
  param("dishId").isMongoId().withMessage("Valid Dish ID is required."),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be YYYY-MM-DD."),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be YYYY-MM-DD."),
];

// For Admins or general display (e.g., showing all ratings for a dish)
export const getRatingsForDish: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { dishId } = req.params;
  const page = (req.query.page as unknown as number) || 1;
  const limit = (req.query.limit as unknown as number) || 10;
  const { startDate: startDateString, endDate: endDateString } = req.query;

  try {
    const dish = await Dish.findById(dishId);
    if (!dish) {
      // No need to check isActive for admin view of ratings
      res.status(404).json({ message: "Dish not found." });
      return;
    }

    const queryFilter: any = { dish: dishId };
    if (startDateString) {
      const startDate = parseDateToUTC(startDateString as string);
      if (startDate)
        queryFilter.menuDate = { ...queryFilter.menuDate, $gte: startDate };
      else {
        res.status(400).json({ message: "Invalid start date." });
        return;
      }
    }
    if (endDateString) {
      const endDate = parseDateToUTC(endDateString as string);
      if (endDate)
        queryFilter.menuDate = { ...queryFilter.menuDate, $lte: endDate };
      else {
        res.status(400).json({ message: "Invalid end date." });
        return;
      }
    }

    const totalRatings = await Rating.countDocuments(queryFilter);
    const ratings = await Rating.find(queryFilter)
      .populate("student", "name profilePictureUrl") // Show who rated
      .populate("menu", "date") // Show which menu it was on
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      ratings,
      currentPage: page,
      totalPages: Math.ceil(totalRatings / limit),
      totalRatings,
      dishName: dish.name, // Context
    });
  } catch (error: any) {
    console.error("Error fetching ratings for dish:", error);
    res.status(500).json({
      message: "Server error fetching ratings.",
      error: error.message,
    });
  }
};
