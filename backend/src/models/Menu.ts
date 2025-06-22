import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMenu extends Document {
  date: Date;
  dishes: Types.ObjectId[];
}

const MenuSchema = new Schema<IMenu>(
  {
    date: { type: Date, required: true, unique: true },
    dishes: [{ type: Schema.Types.ObjectId, ref: 'Dish', required: true }],
  },
  { timestamps: true }
);

export default mongoose.model<IMenu>('Menu', MenuSchema);