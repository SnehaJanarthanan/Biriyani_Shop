const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const { auth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

function computeDiscount(subtotal, restaurant) {
  const d = restaurant.discount;
  if (!d || !d.active || !d.value) return 0;
  if (d.type === 'percent') {
    return Math.round(subtotal * (d.value / 100) * 100) / 100;
  }
  return Math.min(d.value, subtotal);
}

router.post('/', auth(true), async (req, res, next) => {
  try {
    const { restaurantId, items, deliveryAddress, paymentMode } = req.body;
    if (paymentMode && paymentMode !== 'COD') {
      const err = new Error('Only Cash on Delivery (COD) is supported');
      err.status = 400;
      throw err;
    }
    if (!restaurantId || !Array.isArray(items) || items.length === 0) {
      const err = new Error('restaurantId and items are required');
      err.status = 400;
      throw err;
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    let subtotal = 0;
    const lineItems = [];

    for (const row of items) {
      const menuItem = await MenuItem.findOne({
        _id: row.menuItemId,
        restaurant: restaurantId,
      });
      if (!menuItem) {
        const err = new Error(`Invalid menu item: ${row.menuItemId}`);
        err.status = 400;
        throw err;
      }
      const qty = Math.max(1, Number(row.quantity) || 1);
      const unit = menuItem.price;
      subtotal += unit * qty;
      lineItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        quantity: qty,
        unitPrice: unit,
      });
    }

    const discountApplied = computeDiscount(subtotal, restaurant);
    const totalAmount = Math.round((subtotal - discountApplied) * 100) / 100;

    const order = await Order.create({
      user: req.user._id,
      restaurant: restaurant._id,
      items: lineItems,
      subtotal,
      discountApplied,
      totalAmount,
      paymentMode: 'COD',
      deliveryAddress: deliveryAddress || '',
      status: 'placed',
    });

    const populated = await Order.findById(order._id)
      .populate('restaurant', 'name location')
      .populate('items.menuItem');

    res.status(201).json({ order: populated });
  } catch (e) {
    next(e);
  }
});

router.get('/mine', auth(true), async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('restaurant', 'name');
    res.json({ orders });
  } catch (e) {
    next(e);
  }
});

router.get('/admin/all', auth(true), requireAdmin, async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate('restaurant', 'name')
      .populate('user', 'name email');
    res.json({ orders });
  } catch (e) {
    next(e);
  }
});

router.get('/:id', auth(true), async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const order = await Order.findById(req.params.id)
      .populate('restaurant')
      .populate('items.menuItem');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json({ order });
  } catch (e) {
    next(e);
  }
});

router.patch('/:id/status', auth(true), requireAdmin, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['placed', 'preparing', 'delivered'].includes(status)) {
      const err = new Error('Invalid status');
      err.status = 400;
      throw err;
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('restaurant')
      .populate('items.menuItem');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ order });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
