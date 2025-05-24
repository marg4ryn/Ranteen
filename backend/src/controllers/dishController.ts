import { Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import Dish, { IDish, DishCategory } from '../models/Dish';
import { IUser } from '../models/User'; // Assuming IUser is exported from User model
import Menu from '../models/Menu';


export const dishValidationRules = () => [
  body('name').trim().notEmpty().withMessage('Dish name is required.'),
  body('category')
    .isIn(['danie główne', 'zupa', 'deser', 'wegetariańskie', 'dodatek', 'napój'])
    .withMessage('Invalid dish category.'),
  body('description').optional().trim(),
  body('imageUrl').optional().isURL().withMessage('Invalid image URL.'),
  body('allergens').optional().isArray().withMessage('Allergens must be an array of strings.')
    .custom((allergens: any[]) => allergens.every(item => typeof item === 'string'))
    .withMessage('Each allergen must be a string.'),
];

export const createDish = [
  ...dishValidationRules(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, category, imageUrl, allergens } = req.body;
    const adminUser = req.user as IUser;

    try {
      const existingDish = await Dish.findOne({ name });
      if (existingDish) {
        return res.status(400).json({ message: 'Dish with this name already exists.' });
      }

      const newDish: IDish = new Dish({
        name,
        description,
        category,
        imageUrl,
        allergens: allergens || [],
        createdBy: adminUser.id,
        isActive: true, // default but explicit
      });

      await newDish.save();
      res.status(201).json(newDish);
    } catch (error: any) {
      console.error('Error creating dish:', error);
      res.status(500).json({ message: 'Server error creating dish.', error: error.message });
    }
  },
];

export const getAllDishes = [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('category').optional().isString().trim(),
    query('name').optional().isString().trim(),
    query('isActive').optional().isBoolean().toBoolean(), // To filter by active status for admins
    query('sortBy').optional().isString().trim().isIn(['name', 'category', 'createdAt', 'averageRating']),
    query('sortOrder').optional().isString().trim().isIn(['asc', 'desc']),

    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const page = (req.query.page as unknown as number) || 1;
        const limit = (req.query.limit as unknown as number) || 10;
        const category = req.query.category as DishCategory | undefined;
        const nameQuery = req.query.name as string | undefined;
        const adminUser = req.user as IUser;
        // Students should only see active dishes. Admins can see all if they want.
        const isActiveQuery = (adminUser?.role === 'admin' && req.query.isActive !== undefined) 
                            ? (req.query.isActive as unknown as boolean) 
                            : true;


        const sortBy = (req.query.sortBy as string) || 'name';
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

        try {
            const queryFilter: any = {};
            if (category) queryFilter.category = category;
            if (nameQuery) queryFilter.name = { $regex: nameQuery, $options: 'i' }; // Case-insensitive search
            
            // isActiveQuery can be true, false, or undefined. If undefined (default for students), filter for true.
            if (typeof isActiveQuery === 'boolean') {
                 queryFilter.isActive = isActiveQuery;
            } else {
                 queryFilter.isActive = true; // Default for non-admin or if admin doesn't specify
            }


            const totalDishes = await Dish.countDocuments(queryFilter);
            const dishes = await Dish.find(queryFilter)
                .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('createdBy', 'name email') // Populate creator info
                .populate('updatedBy', 'name email'); // Populate updater info

            res.json({
                dishes,
                currentPage: page,
                totalPages: Math.ceil(totalDishes / limit),
                totalDishes,
            });
        } catch (error: any) {
            console.error('Error fetching dishes:', error);
            res.status(500).json({ message: 'Server error fetching dishes.', error: error.message });
        }
    }
];

export const getDishById = async (req: Request, res: Response) => {
  try {
    const dish = await Dish.findById(req.params.dishId)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!dish) {
      return res.status(404).json({ message: 'Dish not found.' });
    }
    // Students should only see active dishes unless it's part of a historical menu context
    // For a direct GET /dishes/:id, this check is reasonable.
    const user = req.user as IUser;
    if (!dish.isActive && user.role !== 'admin') {
        return res.status(404).json({ message: 'Dish not found or is inactive.' });
    }

    res.json(dish);
  } catch (error: any) {
    console.error('Error fetching dish by ID:', error);
    if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid dish ID format.' });
    }
    res.status(500).json({ message: 'Server error fetching dish.', error: error.message });
  }
};

export const updateDish = [
  ...dishValidationRules(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, category, imageUrl, allergens, isActive } = req.body;
    const adminUser = req.user as IUser;

    try {
      let dish = await Dish.findById(req.params.dishId);
      if (!dish) {
        return res.status(404).json({ message: 'Dish not found.' });
      }

      // Check if name is being changed and if the new name already exists for another dish
      if (name && name !== dish.name) {
        const existingDishWithNewName = await Dish.findOne({ name });
        if (existingDishWithNewName) {
          return res.status(400).json({ message: 'Another dish with this name already exists.' });
        }
      }

      dish.name = name || dish.name;
      dish.description = description !== undefined ? description : dish.description;
      dish.category = category || dish.category;
      dish.imageUrl = imageUrl !== undefined ? imageUrl : dish.imageUrl;
      dish.allergens = allergens !== undefined ? allergens : dish.allergens;
      if (typeof isActive === 'boolean') { // Allow admin to change isActive status
        dish.isActive = isActive;
      }
      dish.updatedBy = adminUser.id as any; // Mongoose handles Types.ObjectId conversion

      const updatedDish = await dish.save();
      res.json(updatedDish);
    } catch (error: any) {
      console.error('Error updating dish:', error);
      if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid dish ID format.' });
      }
      res.status(500).json({ message: 'Server error updating dish.', error: error.message });
    }
  },
];

// Soft delete a dish (set isActive to false)
export const deleteDish = async (req: Request, res: Response) => {
  const adminUser = req.user as IUser;
  try {
    const dish = await Dish.findById(req.params.dishId);
    if (!dish) {
      return res.status(404).json({ message: 'Dish not found.' });
    }

    // Check if the dish is part of any *future* published menus.
    // For simplicity, we will allow "deactivating" a dish.
    // A more complex check could prevent deactivation if it's in upcoming *published* menus.
    // const futureMenus = await Menu.find({ 
    //     "items.dish": dish._id,
    //     date: { $gte: new Date().setHours(0,0,0,0) }, // from today onwards
    //     isPublished: true
    // });

    // if (futureMenus.length > 0 && dish.isActive) { // if trying to deactivate
    //     return res.status(400).json({ message: 'Dish cannot be deactivated as it is part of future published menus. Unpublish or modify those menus first.' });
    // }
    
    dish.isActive = false; // Soft delete
    dish.updatedBy = adminUser.id as any;
    await dish.save();

    res.json({ message: 'Dish deactivated successfully (soft delete).' });
  } catch (error: any) {
    console.error('Error deactivating dish:', error);
    if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid dish ID format.' });
    }
    res.status(500).json({ message: 'Server error deactivating dish.', error: error.message });
  }
};