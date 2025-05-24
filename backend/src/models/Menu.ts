import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMenuItem {
  dish: Types.ObjectId; // Ref to Dish
  categoryForDay: string; // e.g., "Danie Główne Poniedziałek", "Zupa Dnia" - specific for this menu
  notes?: string; // Optional notes for the dish in this menu
}

const MenuItemSchema: Schema<IMenuItem> = new Schema({
  dish: { type: Schema.Types.ObjectId, ref: 'Dish', required: true },
  categoryForDay: { type: String, required: true, trim: true },
  notes: { type: String, trim: true },
}, {_id: false}); // _id: false for subdocuments if not strictly needed, or true if they need unique IDs

export interface IMenu extends Document {
  date: Date; // Date for which the menu is planned
  items: IMenuItem[];
  isPublished: boolean;
  createdBy: Types.ObjectId; // Ref to User (Admin)
  updatedBy?: Types.ObjectId; // Ref to User (Admin)
  // Timestamps
}

const MenuSchema: Schema<IMenu> = new Schema(
  {
    date: { 
      type: Date, 
      required: true, 
      unique: true, // Only one menu per day
      // Custom validator to ensure only date part is considered for uniqueness if time is stored
      // Mongoose unique index on Date will consider the full timestamp.
      // It's often better to store dates as YYYY-MM-DD strings if time is irrelevant,
      // or ensure all dates are set to midnight UTC for consistency.
      // For simplicity, we'll use Date and rely on consistent input (e.g., setting time to 00:00:00).
    },
    items: [MenuItemSchema],
    isPublished: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Index for querying by date
MenuSchema.index({ date: 1 });
MenuSchema.index({ isPublished: 1 });

// Pre-save hook to ensure date is set to midnight UTC for consistent querying
MenuSchema.pre('save', function(next) {
  if (this.date) {
    this.date.setUTCHours(0, 0, 0, 0);
  }
  next();
});

const Menu = mongoose.model<IMenu>('Menu', MenuSchema);
export default Menu;