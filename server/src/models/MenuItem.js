const mongoose = require('mongoose');

const MENU_CATEGORIES = [
  'Chicken Biriyani',
  'Mutton Biriyani',
  'Veg Biriyani',
  'Starters',
  'Beverages',
];

const menuItemSchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: MENU_CATEGORIES,
    },
    imageUrl: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);
module.exports.MENU_CATEGORIES = MENU_CATEGORIES;
