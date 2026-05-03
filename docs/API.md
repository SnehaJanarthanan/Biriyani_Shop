# Hyderabad Biriyani Finder — REST API

Base URL (development): `http://localhost:5000/api`

Authentication: send header `Authorization: Bearer <jwt>` for protected routes.

---

## Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Service heartbeat |

---

## Auth (`/api/auth`)

| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/register` | `{ name, email, password }` | Create user; returns JWT + user |
| POST | `/login` | `{ email, password }` | Login; returns JWT + user |
| GET | `/me` | — | Current user (Bearer token) |

---

## Restaurants (`/api/restaurants`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | No | List restaurants (see query params below) |
| GET | `/:id` | No | Single restaurant; optional distance when `lat` & `lng` provided |
| POST | `/` | Admin | Create restaurant (location must be inside Hyderabad bounds) |
| PUT | `/:id` | Admin | Full update |
| PATCH | `/:id/pricing` | Admin | Update `costRange` and/or `discount` |
| POST | `/:id/reviews` | User | Body `{ rating (1–5), comment? }` |

### List query parameters

- `lat`, `lng` — Required for distance sorting and `maxKm`. Must fall inside Hyderabad bounding box (validated server-side).
- `maxKm` — Filter to shops within radius (needs `lat`, `lng`).
- `vegType` — `veg` | `nonveg` | `both` (veg/nonveg filters include `both` shops).
- `priceMin`, `priceMax` — Overlap filter against `costRange`.
- `minRating` — Minimum `ratingAvg`.
- `hasDiscount` — `true` when `discount.active` and value &gt; 0.

### Distance fields

When `lat` and `lng` are provided, each restaurant includes:

- `distanceKm` — Haversine distance in kilometres.
- `estimatedTravelMinutes` — Rough ETA using ~25 km/h urban speed.

---

## Menu (`/api/menu`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/restaurant/:restaurantId` | No | All menu items for a shop |
| GET | `/:id` | No | Single item (+ populated restaurant) |
| POST | `/` | Admin | Create item `{ restaurant, name, price, category, imageUrl? }` |
| PUT | `/:id` | Admin | Update item |
| DELETE | `/:id` | Admin | Delete item |

Categories (enum): `Chicken Biriyani`, `Mutton Biriyani`, `Veg Biriyani`, `Starters`, `Beverages`.

---

## Orders (`/api/orders`)

Payments are restricted to **COD** only. Requests with any other `paymentMode` are rejected.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | User | Place order (see body below) |
| GET | `/mine` | User | Current user’s orders |
| GET | `/admin/all` | Admin | All orders (+ user & restaurant summary) |
| GET | `/:id` | User or Admin | Order detail |
| PATCH | `/:id/status` | Admin | Body `{ status: 'placed' \| 'preparing' \| 'delivered' }` |

### Create order body

```json
{
  "restaurantId": "<ObjectId>",
  "deliveryAddress": "string",
  "paymentMode": "COD",
  "items": [
    { "menuItemId": "<ObjectId>", "quantity": 2 }
  ]
}
```

Server recomputes line prices from menu, applies active restaurant discount to subtotal, stores `subtotal`, `discountApplied`, `totalAmount`.

---

## Errors

JSON shape: `{ "message": "..." }`. Typical status codes: `400` validation, `401` auth, `403` forbidden, `404` not found, `409` conflict (e.g. duplicate email), `500` server error.
