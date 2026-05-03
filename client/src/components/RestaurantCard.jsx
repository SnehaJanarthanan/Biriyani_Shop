import { Link } from 'react-router-dom'

function vegLabel(type) {
  if (type === 'veg') return 'Veg'
  if (type === 'nonveg') return 'Non-veg'
  return 'Veg & non-veg'
}

export default function RestaurantCard({ restaurant }) {
  const d = restaurant.distanceKm
  const eta = restaurant.estimatedTravelMinutes
  const disc = restaurant.discount

  return (
    <article className="card restaurant-card">
      <div className="card-media">
        {restaurant.imageUrl ? (
          <img src={restaurant.imageUrl} alt="" loading="lazy" />
        ) : (
          <div className="card-media-placeholder">No image</div>
        )}
        {disc?.active && disc.value > 0 ? (
          <span className="discount-badge">
            {disc.type === 'percent' ? `${disc.value}% off` : `₹${disc.value} off`}
          </span>
        ) : null}
      </div>
      <div className="card-body">
        <div className="card-head">
          <h3>{restaurant.name}</h3>
          <span className="pill veg-pill">{vegLabel(restaurant.vegType)}</span>
        </div>
        <p className="muted small">{restaurant.address}</p>
        <div className="meta-row">
          <span>
            ₹{restaurant.costRange.min}–{restaurant.costRange.max}
          </span>
          <span className="stars">★ {restaurant.ratingAvg?.toFixed(1) ?? '—'}</span>
        </div>
        {d != null ? (
          <p className="distance-line">
            <strong>{d} km</strong>
            <span className="muted"> · ~{eta} min drive</span>
          </p>
        ) : null}
        <Link className="btn btn-small btn-secondary stretch" to={`/restaurant/${restaurant._id}`}>
          View menu
        </Link>
      </div>
    </article>
  )
}
