import { Request, RequestHandler, Response } from "express";
import { body, param, query, validationResult } from "express-validator";
import Comment, { IComment, CommentStatus } from "../models/Comment";
import Dish from "../models/Dish";
import Menu from "../models/Menu";
import { IUser } from "../models/User";
import mongoose from "mongoose";

// Helper to parse date and set to midnight UTC
const parseDateToUTC = (dateString: string): Date | null => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

export const commentValidationRules = [
  body("dishId").isMongoId().withMessage("Valid Dish ID is required."),
  body("menuDate")
    .isISO8601()
    .withMessage("Menu date (YYYY-MM-DD) is required.")
    .customSanitizer((value) => parseDateToUTC(value)?.toISOString()),
  body("text")
    .trim()
    .notEmpty()
    .withMessage("Comment text cannot be empty.")
    .isLength({ min: 3, max: 500 })
    .withMessage("Comment must be between 3 and 500 characters."),
];

export const createComment: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const student = req.user as IUser;
  let { dishId, menuDate: menuDateString, text } = req.body;

  const parsedMenuDate = parseDateToUTC(menuDateString as string);
  if (!parsedMenuDate) {
    res.status(400).json({ message: "Invalid menu date format." });
    return;
  }

  try {
    // Profanity check
    // if (profanityFilter.isProfane(text)) {
    //   // Reject outright
    //   res.status(400).json({
    //     message:
    //       "Comment contains inappropriate language and cannot be submitted.",
    //   });
    //   return;
    // }

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

    // Optional: Limit one comment per student per dish per menu date
    const existingComment = await Comment.findOne({
      student: student.id,
      dish: dishId,
      menu: menu._id,
    });
    if (existingComment) {
      res.status(409).json({
        message:
          "You have already commented on this dish for this menu date. You can edit your existing comment.",
      });
      return;
    }

    const newComment = new Comment({
      student: student.id,
      dish: dishId,
      menu: menu._id,
      menuDate: parsedMenuDate,
      text,
      status: "pending", // Default status, admin needs to approve
    });

    await newComment.save();
    res.status(201).json({
      message:
        "Comment submitted successfully. It will be visible after moderation.",
      comment: newComment,
    });
  } catch (error: any) {
    console.error("Error creating comment:", error);
    res.status(500).json({
      message: "Server error creating comment.",
      error: error.message,
    });
  }
};

export const getMyCommentsValidationRules = [
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("dishId").optional().isMongoId(),
  query("status").optional().isIn(["pending", "approved", "rejected"]),
  query("page").optional().isInt({ min: 1 }).toInt(),
];

export const getMyComments: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const student = req.user as IUser;
  const page = (req.query.page as unknown as number) || 1;
  const limit = (req.query.limit as unknown as number) || 10;
  const { dishId, status } = req.query;

  try {
    const queryFilter: any = { student: student.id };
    if (dishId) queryFilter.dish = dishId;
    if (status) queryFilter.status = status;

    const totalComments = await Comment.countDocuments(queryFilter);
    const comments = await Comment.find(queryFilter)
      .populate("dish", "name imageUrl")
      .populate("menu", "date")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      comments,
      currentPage: page,
      totalPages: Math.ceil(totalComments / limit),
      totalComments,
    });
  } catch (error: any) {
    console.error("Error fetching student comments:", error);
    res.status(500).json({
      message: "Server error fetching comments.",
      error: error.message,
    });
  }
};

export const updateMyCommentValidationRules = [
  param("commentId").isMongoId().withMessage("Valid Comment ID is required."),
  body("text")
    .trim()
    .notEmpty()
    .withMessage("Comment text cannot be empty.")
    .isLength({ min: 3, max: 500 })
    .withMessage("Comment must be between 3 and 500 characters."),
];

export const updateMyComment: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const student = req.user as IUser;
  const { commentId } = req.params;
  const { text } = req.body;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({ message: "Comment not found." });
      return;
    }
    if (comment.student.toString() !== student.id) {
      res
        .status(403)
        .json({ message: "Forbidden. You can only edit your own comments." });
      return;
    }
    // Students can only edit if 'pending' or if an admin hasn't 'rejected' it permanently.
    // Or, allow edits even if approved, but it goes back to 'pending'.
    if (comment.status === "rejected") {
      res.status(403).json({ message: "Cannot edit a rejected comment." });
      return;
    }

    // Profanity check on update
    // if (profanityFilter.isProfane(text)) {
    //   res.status(400).json({
    //     message: "Updated comment contains inappropriate language.",
    //   });
    //   return;
    // }

    comment.text = text;
    comment.status = "pending"; // Re-moderation required after edit
    comment.moderatedBy = undefined; // Clear previous moderation
    comment.moderationTimestamp = undefined;
    await comment.save();

    res.json({
      message: "Comment updated successfully. It will require re-moderation.",
      comment,
    });
  } catch (error: any) {
    console.error("Error updating comment:", error);
    res.status(500).json({
      message: "Server error updating comment.",
      error: error.message,
    });
  }
};

const deleteMyCommentValidationRules = [
  param("commentId").isMongoId().withMessage("Valid Comment ID is required."),
];

export const deleteMyComment: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const student = req.user as IUser;
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({ message: "Comment not found." });
      return;
    }
    if (comment.student.toString() !== student.id) {
      res.status(403).json({
        message: "Forbidden. You can only delete your own comments.",
      });
      return;
    }
    // Allow deletion regardless of status by the owner.
    await comment.deleteOne();
    res.json({ message: "Comment deleted successfully." });
  } catch (error: any) {
    console.error("Error deleting comment:", error);
    res.status(500).json({
      message: "Server error deleting comment.",
      error: error.message,
    });
  }
};

const getApprovedCommentsForDishValidationRules = [
  param("dishId").isMongoId().withMessage("Valid Dish ID is required."),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("menuDate")
    .optional()
    .isISO8601()
    .withMessage("Menu date must be YYYY-MM-DD."),
];

// For Public View (e.g., showing approved comments for a dish)
export const getApprovedCommentsForDish: RequestHandler = async (
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
  const menuDateString = req.query.menuDate as string | undefined;

  try {
    const dish = await Dish.findById(dishId);
    if (!dish) {
      // For public view, only care if dish itself is findable.
      res.status(404).json({ message: "Dish not found." });
      return;
    }

    const queryFilter: any = { dish: dishId, status: "approved" };
    if (menuDateString) {
      const parsedMenuDate = parseDateToUTC(menuDateString);
      if (parsedMenuDate) queryFilter.menuDate = parsedMenuDate;
      else {
        res.status(400).json({ message: "Invalid menu date format." });
        return;
      }
    }

    const totalComments = await Comment.countDocuments(queryFilter);
    const comments = await Comment.find(queryFilter)
      .populate("student", "name profilePictureUrl") // Show who commented (name, pic)
      // .populate('menu', 'date') // Could be useful for context
      .sort({ createdAt: -1 }) // Show newest approved comments first
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      comments,
      currentPage: page,
      totalPages: Math.ceil(totalComments / limit),
      totalComments,
      dishName: dish.name,
    });
  } catch (error: any) {
    console.error("Error fetching approved comments:", error);
    res.status(500).json({
      message: "Server error fetching comments.",
      error: error.message,
    });
  }
};
// --- Admin Comment Moderation ---

const getCommentsForDishValidationRules = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("status")
    .optional()
    .isIn(["pending", "approved", "rejected"])
    .default("pending"),
  query("dishId").optional().isMongoId(),
  query("studentId").optional().isMongoId(),
];

export const getCommentsForModeration: RequestHandler = async (
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
  const { status, dishId, studentId } = req.query;

  try {
    const queryFilter: any = {};
    if (status) queryFilter.status = status;
    if (dishId) queryFilter.dish = dishId;
    if (studentId) queryFilter.student = studentId;

    const totalComments = await Comment.countDocuments(queryFilter);
    const comments = await Comment.find(queryFilter)
      .populate("student", "name email profilePictureUrl")
      .populate("dish", "name")
      .populate("menu", "date") // For context of when it was served
      .sort({ createdAt: 1 }) // Show oldest pending first for moderation
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      comments,
      currentPage: page,
      totalPages: Math.ceil(totalComments / limit),
      totalComments,
    });
  } catch (error: any) {
    console.error("Error fetching comments for moderation:", error);
    res.status(500).json({
      message: "Server error fetching comments.",
      error: error.message,
    });
  }
};

const moderateCommentValidationRules = [
  param("commentId").isMongoId().withMessage("Valid Comment ID is required."),
  body("status")
    .isIn(["approved", "rejected"])
    .withMessage("New status must be 'approved' or 'rejected'."),
];

export const moderateComment: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const adminUser = req.user as IUser;
  const { commentId } = req.params;
  const { status } = req.body as { status: "approved" | "rejected" };

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({ message: "Comment not found." });
      return;
    }

    comment.status = status;
    comment.moderatedBy = adminUser.id as any;
    comment.moderationTimestamp = new Date();
    await comment.save();

    res.json({ message: `Comment ${status} successfully.`, comment });
  } catch (error: any) {
    console.error("Error moderating comment:", error);
    res.status(500).json({
      message: "Server error moderating comment.",
      error: error.message,
    });
  }
};
