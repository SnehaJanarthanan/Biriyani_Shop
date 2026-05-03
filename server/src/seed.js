require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { connectDb } = require('./config/db');
const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');

const shops = [
  {
    key: 'paradise',
    name: 'Paradise Food Court — Secunderabad',
    description: 'Legendary Hyderabad dum biriyani since 1953.',
    address: 'Paradise Circle, Secunderabad',
    location: { lat: 17.4419, lng: 78.4983 },
    vegType: 'both',
    costRange: { min: 280, max: 420 },
    discount: { type: 'percent', value: 10, active: true },
    ratingAvg: 4.6,
    ratingCount: 120,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03246963d96d?w=800',
    menu: [
      ['Chicken Biriyani', 320, 'Chicken Biriyani'],
      ['Mutton Biriyani', 380, 'Mutton Biriyani'],
      ['Paneer Dum Biriyani', 290, 'Veg Biriyani'],
      ['Veg Dum Biriyani', 260, 'Veg Biriyani'],
      ['Chicken 65', 220, 'Starters'],
      ['Rose Milk', 80, 'Beverages'],
    ],
  },
  {
    key: 'shah',
    name: 'Shah Ghouse Café — Tolichowki',
    description: 'Late-night favourite for spicy Hyderabadi biriyani.',
    address: 'Tolichowki Main Road',
    location: { lat: 17.3963, lng: 78.422 },
    vegType: 'nonveg',
    costRange: { min: 240, max: 400 },
    discount: { type: 'flat', value: 30, active: true },
    ratingAvg: 4.5,
    ratingCount: 95,
    imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800',
    menu: [
      ['Chicken Biriyani', 260, 'Chicken Biriyani'],
      ['Mutton Biriyani', 340, 'Mutton Biriyani'],
      ['Egg Masala', 140, 'Starters'],
      ['Irani Chai', 40, 'Beverages'],
    ],
  },
  {
    key: 'cafebahar',
    name: 'Hotel Café Bahar — Basheer Bagh',
    description: 'Classic dine-in spot known for generous portions.',
    address: 'Basheer Bagh',
    location: { lat: 17.3956, lng: 78.4778 },
    vegType: 'both',
    costRange: { min: 220, max: 360 },
    discount: { type: 'percent', value: 0, active: false },
    ratingAvg: 4.3,
    ratingCount: 70,
    imageUrl: 'https://images.unsplash.com/photo-1633945274409-a658ddd2d845?w=800',
    menu: [
      ['Chicken Biriyani', 280, 'Chicken Biriyani'],
      ['Fish Biriyani', 310, 'Chicken Biriyani'],
      ['Veg Fried Rice', 180, 'Veg Biriyani'],
      ['Crispy Corn', 160, 'Starters'],
      ['Fresh Lime Soda', 70, 'Beverages'],
    ],
  },
  {
    key: 'mithaas',
    name: 'Ohri’s Eatmor — Banjara Hills',
    description: 'Comfort dining with veg-forward Hyderabadi options.',
    address: 'Road No. 12, Banjara Hills',
    location: { lat: 17.4156, lng: 78.4347 },
    vegType: 'veg',
    costRange: { min: 200, max: 320 },
    discount: { type: 'percent', value: 15, active: true },
    ratingAvg: 4.2,
    ratingCount: 45,
    imageUrl: 'https://images.unsplash.com/photo-1645177628312-be744854252b?w=800',
    menu: [
      ['Jackfruit Biriyani', 270, 'Veg Biriyani'],
      ['Paneer Tikka Biriyani', 290, 'Veg Biriyani'],
      ['Paneer 65', 210, 'Starters'],
      ['Badam Milk', 90, 'Beverages'],
    ],
  },
  {
    key: 'nimrah',
    name: 'Nimrah Café — Charminar',
    description: 'Irani chai + quick bites beside Charminar.',
    address: 'Charminar Road',
    location: { lat: 17.3616, lng: 78.4747 },
    vegType: 'both',
    costRange: { min: 180, max: 300 },
    discount: { type: 'percent', value: 5, active: true },
    ratingAvg: 4.4,
    ratingCount: 200,
    imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800',
    menu: [
      ['Chicken Biriyani', 240, 'Chicken Biriyani'],
      ['Bagara Rice', 160, 'Veg Biriyani'],
      ['Osmania Biscuits', 60, 'Starters'],
      ['Irani Chai', 35, 'Beverages'],
    ],
  },
];

async function seed() {
  await connectDb(process.env.MONGODB_URI);

  await MenuItem.deleteMany({});
  await Restaurant.deleteMany({});
  await User.deleteMany({});

  const adminHash = await bcrypt.hash('admin123', 10);
  const userHash = await bcrypt.hash('user123', 10);

  await User.create([
    {
      name: 'Admin Demo',
      email: 'admin@hyderabadbiriyani.test',
      passwordHash: adminHash,
      role: 'admin',
    },
    {
      name: 'Customer Demo',
      email: 'user@hyderabadbiriyani.test',
      passwordHash: userHash,
      role: 'user',
    },
  ]);

  for (const s of shops) {
    const { menu, key, ...rest } = s;
    const restaurant = await Restaurant.create(rest);
    for (const [name, price, category] of menu) {
      await MenuItem.create({
        restaurant: restaurant._id,
        name,
        price,
        category,
        imageUrl: `https://picsum.photos/seed/${encodeURIComponent(key + name)}/400/300`,
      });
    }
  }

  console.log('Seed complete.');
  console.log('Admin: admin@hyderabadbiriyani.test / admin123');
  console.log('User:  user@hyderabadbiriyani.test / user123');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
