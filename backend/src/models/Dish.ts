import mongoose, { Document, Schema, Types } from 'mongoose';

export type DishCategory = 'danie główne' | 'zupa' | 'deser' | 'wegetariańskie' | 'dodatek' | 'napój';

export interface IDish extends Document {
  _id: Types.ObjectId;
  name: string;
  category: DishCategory;
  description?: string;
  imageUrl?: string;
  averageRating: number;
  ratingCount: number;
}

const DishSchema: Schema<IDish> = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    category: {
      type: String,
      required: true,
      enum: ['danie główne', 'zupa', 'deser', 'wegetariańskie', 'dodatek', 'napój'],
    },
    description: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IDish>('Dish', DishSchema);