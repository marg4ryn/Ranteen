import mongoose, { Document, Schema, Types } from 'mongoose';

export type DishCategory = 'danie główne' | 'zupa' | 'deser' | 'wegetariańskie' | 'dodatek' | 'napój'; // 'side_dish', 'drink' translated

export interface IDish extends Document {
  name: string;
  description?: string;
  category: DishCategory;
  imageUrl?: string;
  allergens: string[];
  averageRating: number; // Will be updated by rating system
  ratingCount: number;   // Will be updated by rating system
  isActive: boolean;     // For soft deletes
  createdBy: Types.ObjectId; // Ref to User (Admin)
  updatedBy?: Types.ObjectId; // Ref to User (Admin)
  // Timestamps (createdAt, updatedAt) are added by Schema option
}

const DishSchema: Schema<IDish> = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['danie główne', 'zupa', 'deser', 'wegetariańskie', 'dodatek', 'napój'],
    },
    imageUrl: { type: String, trim: true },
    allergens: [{ type: String, trim: true }],
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Index for searching and filtering
DishSchema.index({ name: 'text', description: 'text' });
DishSchema.index({ category: 1 });
DishSchema.index({ isActive: 1 });

const Dish = mongoose.model<IDish>('Dish', DishSchema);
export default Dish;