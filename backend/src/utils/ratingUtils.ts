import Dish from '../models/Dish';
import Rating from '../models/Rating';
import mongoose from 'mongoose';

export const updateDishAverageRating = async (dishId: string | mongoose.Types.ObjectId): Promise<void> => {
  try {
    const dishObjectId = typeof dishId === 'string' ? new mongoose.Types.ObjectId(dishId) : dishId;

    const result = await Rating.aggregate([
      { $match: { dish: dishObjectId } },
      {
        $group: {
          _id: '$dish',
          averageRating: { $avg: '$rating' },
          ratingCount: { $sum: 1 },
        },
      },
    ]);

    if (result.length > 0) {
      const { averageRating, ratingCount } = result[0];
      await Dish.findByIdAndUpdate(dishObjectId, {
        averageRating: parseFloat(averageRating.toFixed(2)), // Round to 2 decimal places
        ratingCount,
      });
    } else {
      // No ratings found, reset to 0
      await Dish.findByIdAndUpdate(dishObjectId, {
        averageRating: 0,
        ratingCount: 0,
      });
    }
    // console.log(`Updated average rating for dish ${dishId}`);
  } catch (error) {
    console.error(`Error updating average rating for dish ${dishId}:`, error);
    // Decide if this error should propagate or just be logged
  }
};