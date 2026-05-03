const express = require('express');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const { auth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/restaurant/:restaurantId', async (req, res, next) => {
  try {
    const items = await MenuItem.find({ restaurant: req.params.restaurantId }).sort({
      category: 1,
      name: 1,
    });
    res.json({ menuItems: items });
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id).populate('restaurant');
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    res.json({ menuItem: item });
  } catch (e) {
    next(e);
  }
});

router.post('/', auth(true), requireAdmin, async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.body.restaurant);
    if (!restaurant) return res.status(400).json({ message: 'Invalid restaurant id' });
    const item = await MenuItem.create(req.body);
    res.status(201).json({ menuItem: item });
  } catch (e) {
    next(e);
  }
});

router.put('/:id', auth(true), requireAdmin, async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    res.json({ menuItem: item });
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', auth(true), requireAdmin, async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
