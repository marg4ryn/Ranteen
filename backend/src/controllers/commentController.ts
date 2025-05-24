import { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import Comment, { IComment, CommentStatus } from '../models/Comment';
import Dish from '../models/Dish';
import Menu from '../models/Menu';
import { IUser } from '../models/User';
import Filter from 'bad-words'; // Profanity filter
import mongoose from 'mongoose';

const profanityFilter = new Filter();

// Helper to parse date and set to midnight UTC
const parseDateToUTC = (dateString: string): Date | null => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    date.setUTCHours(0, 0, 0, 0);
    return date;
};

export const commentValidationRules = () => [
  body('dishId').isMongoId().withMessage('Valid Dish ID is required.'),
  body('menuDate')
    .isISO8601().withMessage('Menu date (YYYY-MM-DD) is required.')
    .customSanitizer(value => parseDateToUTC(value)?.toISOString()),
  body('text')
    .trim()
    .notEmpty().withMessage('Comment text cannot be empty.')
    .isLength({ min: 3, max: 500 }).withMessage('Comment must be between 3 and 500 characters.'),
];

export const createComment = [
  ...commentValidationRules(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const student = req.user as IUser;
    let { dishId, menuDate: menuDateString, text } = req.body;

    const parsedMenuDate = parseDateToUTC(menuDateString as string);
    if (!parsedMenuDate) {
      return res.status(400).json({ message: 'Invalid menu date format.' });
    }

    try {
      // Profanity check
      if (profanityFilter.isProfane(text)) {
        // Option 1: Reject outright
        // return res.status(400).json({ message: 'Comment contains inappropriate language and cannot be submitted.' });
        // Option 2: Auto-moderate or flag for stricter review (current model has 'pending' default)
        // For now, we'll let it go to 'pending' and admin can see it.
        // Or, you could clean it:
        // text = profanityFilter.clean(text); 
      }

      const dish = await Dish.findById(dishId);
      if (!dish || !dish.isActive) {
        return res.status(404).json({ message: 'Dish not found or is inactive.' });
      }

      const menu = await Menu.findOne({ date: parsedMenuDate, 'items.dish': dishId, isPublished: true });
      if (!menu) {
        return res.status(404).json({ message: `Dish not found on the published menu for ${parsedMenuDate.toISOString().split('T')[0]}.` });
      }

      // Optional: Limit one comment per student per dish per menu date
      const existingComment = await Comment.findOne({ student: student.id, dish: dishId, menu: menu._id });
      if (existingComment) {
          return res.status(409).json({ message: 'You have already commented on this dish for this menu date. You can edit your existing comment.' });
      }

      const newComment = new Comment({
        student: student.id,
        dish: dishId,
        menu: menu._id,
        menuDate: parsedMenuDate,
        text,
        status: 'pending', // Default status, admin needs to approve
      });

      await newComment.save();
      res.status(201).json({ message: 'Comment submitted successfully. It will be visible after moderation.', comment: newComment });
    } catch (error: any) {
      console.error('Error creating comment:', error);
      res.status(500).json({ message: 'Server error creating comment.', error: error.message });
    }
  },
];

export const getMyComments = [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('dishId').optional().isMongoId(),
    query('status').optional().isIn(['pending', 'approved', 'rejected']),
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
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
                .populate('dish', 'name imageUrl')
                .populate('menu', 'date')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit);
            
            res.json({
                comments,
                currentPage: page,
                totalPages: Math.ceil(totalComments / limit),
                totalComments
            });
        } catch (error: any) {
            console.error('Error fetching student comments:', error);
            res.status(500).json({ message: 'Server error fetching comments.', error: error.message });
        }
    }
];

export const updateMyComment = [
  param('commentId').isMongoId().withMessage('Valid Comment ID is required.'),
  body('text')
    .trim()
    .notEmpty().withMessage('Comment text cannot be empty.')
    .isLength({ min: 3, max: 500 }).withMessage('Comment must be between 3 and 500 characters.'),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const student = req.user as IUser;
    const { commentId } = req.params;
    const { text } = req.body;

    try {
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found.' });
      }
      if (comment.student.toString() !== student.id) {
        return res.status(403).json({ message: 'Forbidden. You can only edit your own comments.' });
      }
      // Students can only edit if 'pending' or if an admin hasn't 'rejected' it permanently.
      // Or, allow edits even if approved, but it goes back to 'pending'.
      if (comment.status === 'rejected') {
          return res.status(403).json({ message: 'Cannot edit a rejected comment.' });
      }

      // Profanity check on update
      if (profanityFilter.isProfane(text)) {
        // return res.status(400).json({ message: 'Updated comment contains inappropriate language.' });
      }

      comment.text = text;
      comment.status = 'pending'; // Re-moderation required after edit
      comment.moderatedBy = undefined; // Clear previous moderation
      comment.moderationTimestamp = undefined;
      await comment.save();

      res.json({ message: 'Comment updated successfully. It will require re-moderation.', comment });
    } catch (error: any) {
      console.error('Error updating comment:', error);
      res.status(500).json({ message: 'Server error updating comment.', error: error.message });
    }
  },
];

export const deleteMyComment = [
  param('commentId').isMongoId().withMessage('Valid Comment ID is required.'),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const student = req.user as IUser;
    const { commentId } = req.params;

    try {
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found.' });
      }
      if (comment.student.toString() !== student.id) {
        return res.status(403).json({ message: 'Forbidden. You can only delete your own comments.' });
      }
      // Allow deletion regardless of status by the owner.
      await comment.deleteOne();
      res.json({ message: 'Comment deleted successfully.' });
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      res.status(500).json({ message: 'Server error deleting comment.', error: error.message });
    }
  },
];

// For Public View (e.g., showing approved comments for a dish)
export const getApprovedCommentsForDish = [
  param('dishId').isMongoId().withMessage('Valid Dish ID is required.'),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('menuDate').optional().isISO8601().withMessage('Menu date must be YYYY-MM-DD.'),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { dishId } = req.params;
    const page = (req.query.page as unknown as number) || 1;
    const limit = (req.query.limit as unknown as number) || 10;
    const menuDateString = req.query.menuDate as string | undefined;

    try {
      const dish = await Dish.findById(dishId);
      if (!dish) { // For public view, only care if dish itself is findable.
        return res.status(404).json({ message: 'Dish not found.' });
      }
      
      const queryFilter: any = { dish: dishId, status: 'approved' };
      if (menuDateString) {
          const parsedMenuDate = parseDateToUTC(menuDateString);
          if (parsedMenuDate) queryFilter.menuDate = parsedMenuDate;
          else return res.status(400).json({message: "Invalid menu date format."});
      }

      const totalComments = await Comment.countDocuments(queryFilter);
      const comments = await Comment.find(queryFilter)
        .populate('student', 'name profilePictureUrl') // Show who commented (name, pic)
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
      console.error('Error fetching approved comments:', error);
      res.status(500).json({ message: 'Server error fetching comments.', error: error.message });
    }
  },
];


// --- Admin Comment Moderation ---
export const getCommentsForModeration = [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status').optional().isIn(['pending', 'approved', 'rejected']).default('pending'),
    query('dishId').optional().isMongoId(),
    query('studentId').optional().isMongoId(),
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
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
                .populate('student', 'name email profilePictureUrl')
                .populate('dish', 'name')
                .populate('menu', 'date') // For context of when it was served
                .sort({ createdAt: 1 }) // Show oldest pending first for moderation
                .skip((page - 1) * limit)
                .limit(limit);
            
            res.json({
                comments,
                currentPage: page,
                totalPages: Math.ceil(totalComments / limit),
                totalComments
            });

        } catch (error: any) {
            console.error('Error fetching comments for moderation:', error);
            res.status(500).json({ message: 'Server error fetching comments.', error: error.message });
        }
    }
];

export const moderateComment = [
    param('commentId').isMongoId().withMessage('Valid Comment ID is required.'),
    body('status').isIn(['approved', 'rejected']).withMessage("New status must be 'approved' or 'rejected'."),
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const adminUser = req.user as IUser;
        const { commentId } = req.params;
        const { status } = req.body as { status: 'approved' | 'rejected' };

        try {
            const comment = await Comment.findById(commentId);
            if (!comment) {
                return res.status(404).json({ message: 'Comment not found.' });
            }

            comment.status = status;
            comment.moderatedBy = adminUser.id as any;
            comment.moderationTimestamp = new Date();
            await comment.save();

            res.json({ message: `Comment ${status} successfully.`, comment });
        } catch (error: any) {
            console.error('Error moderating comment:', error);
            res.status(500).json({ message: 'Server error moderating comment.', error: error.message });
        }
    }
];