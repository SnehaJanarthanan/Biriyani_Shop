const express = require('express');
const Restaurant = require('../models/Restaurant');
const { haversineKm, estimateTravelMinutes } = require('../utils/haversine');
const { isWithinHyderabad } = require('../utils/hyderabadBounds');
const { auth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

function attachDistance(restaurantDoc, userLat, userLng) {
  const obj = restaurantDoc.toObject ? restaurantDoc.toObject() : { ...restaurantDoc };
  const d = haversineKm(userLat, userLng, obj.location.lat, obj.location.lng);
  obj.distanceKm = Math.round(d * 100) / 100;
  obj.estimatedTravelMinutes = estimateTravelMinutes(d);
  return obj;
}

/** GET /api/restaurants — list with optional filters & optional user lat/lng for distance sort */
router.get('/', async (req, res, next) => {
  try {
    const {
      lat,
      lng,
      maxKm,
      vegType,
      priceMin,
      priceMax,
      minRating,
      hasDiscount,
    } = req.query;

    const filter = {};

    if (vegType && ['veg', 'nonveg', 'both'].includes(vegType)) {
      if (vegType === 'veg') {
        filter.$or = [{ vegType: 'veg' }, { vegType: 'both' }];
      } else if (vegType === 'nonveg') {
        filter.$or = [{ vegType: 'nonveg' }, { vegType: 'both' }];
      } else {
        filter.vegType = vegType;
      }
    }

    if (priceMin != null || priceMax != null) {
      const min = priceMin != null ? Number(priceMin) : 0;
      const max = priceMax != null ? Number(priceMax) : Number.MAX_SAFE_INTEGER;
      filter['costRange.min'] = { $lte: max };
      filter['costRange.max'] = { $gte: min };
    }

    if (minRating != null && minRating !== '') {
      filter.ratingAvg = { $gte: Number(minRating) };
    }

    if (hasDiscount === 'true' || hasDiscount === '1') {
      filter['discount.active'] = true;
      filter['discount.value'] = { $gt: 0 };
    }

    let restaurants = await Restaurant.find(filter).sort({ name: 1 });

    const userLat = lat != null ? Number(lat) : null;
    const userLng = lng != null ? Number(lng) : null;

    if (userLat != null && userLng != null) {
      if (!isWithinHyderabad(userLat, userLng)) {
        const err = new Error('Location must be within Hyderabad service area');
        err.status = 400;
        throw err;
      }
      let enriched = restaurants.map((r) => attachDistance(r, userLat, userLng));
      const maxKmNum = maxKm != null ? Number(maxKm) : null;
      if (maxKmNum != null && !Number.isNaN(maxKmNum)) {
        enriched = enriched.filter((r) => r.distanceKm <= maxKmNum);
      }
      enriched.sort((a, b) => a.distanceKm - b.distanceKm);
      return res.json({ restaurants: enriched });
    }

    if (maxKm != null && (userLat == null || userLng == null)) {
      const err = new Error('lat and lng required when filtering by maxKm');
      err.status = 400;
      throw err;
    }

    res.json({
      restaurants: restaurants.map((r) => {
        const o = r.toObject();
        return o;
      }),
    });
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const r = await Restaurant.findById(req.params.id);
    if (!r) return res.status(404).json({ message: 'Restaurant not found' });
    const { lat, lng } = req.query;
    if (lat != null && lng != null) {
      const ul = Number(lat);
      const ug = Number(lng);
      if (!isWithinHyderabad(ul, ug)) {
        const err = new Error('Location must be within Hyderabad service area');
        err.status = 400;
        throw err;
      }
      return res.json({ restaurant: attachDistance(r, ul, ug) });
    }
    res.json({ restaurant: r });
  } catch (e) {
    next(e);
  }
});

router.post('/', auth(true), requireAdmin, async (req, res, next) => {
  try {
    const body = req.body;
    if (!isWithinHyderabad(body.location?.lat, body.location?.lng)) {
      const err = new Error('Restaurant location must be within Hyderabad');
      err.status = 400;
      throw err;
    }
    const r = await Restaurant.create(body);
    res.status(201).json({ restaurant: r });
  } catch (e) {
    next(e);
  }
});

router.put('/:id', auth(true), requireAdmin, async (req, res, next) => {
  try {
    if (req.body.location) {
      const { lat, lng } = req.body.location;
      if (!isWithinHyderabad(lat, lng)) {
        const err = new Error('Restaurant location must be within Hyderabad');
        err.status = 400;
        throw err;
      }
    }
    const r = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!r) return res.status(404).json({ message: 'Restaurant not found' });
    res.json({ restaurant: r });
  } catch (e) {
    next(e);
  }
});

router.patch('/:id/pricing', auth(true), requireAdmin, async (req, res, next) => {
  try {
    const { costRange, discount } = req.body;
    const update = {};
    if (costRange) update.costRange = costRange;
    if (discount) update.discount = discount;
    const r = await Restaurant.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!r) return res.status(404).json({ message: 'Restaurant not found' });
    res.json({ restaurant: r });
  } catch (e) {
    next(e);
  }
});

/** Authenticated users can post a review (updates rolling average). */
router.post('/:id/reviews', auth(true), async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const rNum = Number(rating);
    if (!rNum || rNum < 1 || rNum > 5) {
      const err = new Error('rating must be between 1 and 5');
      err.status = 400;
      throw err;
    }
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    restaurant.reviews.push({
      user: req.user._id,
      rating: rNum,
      comment: comment || '',
    });
    const total =
      restaurant.ratingAvg * restaurant.ratingCount + rNum;
    restaurant.ratingCount += 1;
    restaurant.ratingAvg = Math.round((total / restaurant.ratingCount) * 10) / 10;
    await restaurant.save();
    res.status(201).json({ restaurant });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
