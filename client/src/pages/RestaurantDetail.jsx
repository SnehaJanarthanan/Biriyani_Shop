import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/client'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { HYDERABAD_DEFAULT } from '../constants'

const CATEGORY_ORDER = [
  'Chicken Biriyani',
  'Mutton Biriyani',
  'Veg Biriyani',
  'Starters',
  'Beverages',
]

function readFinderCoords() {
  const lat = Number(sessionStorage.getItem('finder_lat'))
  const lng = Number(sessionStorage.getItem('finder_lng'))
  if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng }
  return HYDERABAD_DEFAULT
}

export default function RestaurantDetail() {
  const { id } = useParams()
  const { addItem } = useCart()
  const { user } = useAuth()
  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [error, setError] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewMsg, setReviewMsg] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setError('')
      try {
        const c = readFinderCoords()
        const [{ data: rd }, { data: md }] = await Promise.all([
          api.get(`/restaurants/${id}`, { params: { lat: c.lat, lng: c.lng } }),
          api.get(`/menu/restaurant/${id}`),
        ])
        if (cancelled) return
        setRestaurant(rd.restaurant)
        setMenuItems(md.menuItems || [])
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || e.message || 'Failed to load')
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id])

  const grouped = useMemo(() => {
    const map = new Map()
    for (const cat of CATEGORY_ORDER) map.set(cat, [])
    for (const item of menuItems) {
      const list = map.get(item.category) || []
      list.push(item)
      map.set(item.category, list)
    }
    return map
  }, [menuItems])

  async function submitReview(e) {
    e.preventDefault()
    setReviewMsg('')
    try {
      await api.post(`/restaurants/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
      })
      setReviewMsg('Thanks — your review was saved.')
      setReviewComment('')
      const c = readFinderCoords()
      const { data } = await api.get(`/restaurants/${id}`, { params: { lat: c.lat, lng: c.lng } })
      setRestaurant(data.restaurant)
    } catch (ex) {
      setReviewMsg(ex.response?.data?.message || ex.message || 'Could not save review')
    }
  }

  if (error) {
    return (
      <div className="page narrow">
        <p className="error-banner">{error}</p>
        <Link to="/">Back</Link>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="page narrow">
        <p className="muted">Loading…</p>
      </div>
    )
  }

  const disc = restaurant.discount

  return (
    <div className="page restaurant-detail">
      <Link className="back-link" to="/">
        ← All restaurants
      </Link>
      <header className="detail-header panel">
        <div>
          <h1>{restaurant.name}</h1>
          <p className="muted">{restaurant.address}</p>
          <div className="detail-meta">
            <span>
              ₹{restaurant.costRange.min}–{restaurant.costRange.max}
            </span>
            <span>★ {restaurant.ratingAvg?.toFixed(1)}</span>
            {restaurant.distanceKm != null ? (
              <span>
                {restaurant.distanceKm} km · ~{restaurant.estimatedTravelMinutes} min
              </span>
            ) : null}
          </div>
        </div>
        {disc?.active && disc.value > 0 ? (
          <div className="discount-callout">
            Active discount:{' '}
            <strong>{disc.type === 'percent' ? `${disc.value}%` : `₹${disc.value}`}</strong>
          </div>
        ) : null}
      </header>

      <section className="menu-section">
        <h2>Menu</h2>
        {CATEGORY_ORDER.map((cat) => {
          const items = grouped.get(cat) || []
          if (items.length === 0) return null
          return (
            <div key={cat} className="menu-block">
              <h3>{cat}</h3>
              <ul className="menu-list">
                {items.map((item) => (
                  <li key={item._id} className="menu-row card pad-sm">
                    {item.imageUrl ? (
                      <img className="menu-thumb" src={item.imageUrl} alt="" />
                    ) : (
                      <div className="menu-thumb placeholder" />
                    )}
                    <div className="menu-row-body">
                      <strong>{item.name}</strong>
                      <span className="muted">₹{item.price}</span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-small btn-primary"
                      onClick={() =>
                        addItem(restaurant._id, restaurant.name, {
                          menuItemId: item._id,
                          name: item.name,
                          price: item.price,
                        })
                      }
                    >
                      Add
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </section>

      <section className="reviews-section card pad">
        <h2>Reviews</h2>
        {user ? (
          <form className="review-form stack-form" onSubmit={submitReview}>
            <label className="field">
              <span>Rating</span>
              <select value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))}>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} stars
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Comment</span>
              <textarea
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
            </label>
            <button type="submit" className="btn btn-secondary">
              Post review
            </button>
            {reviewMsg ? <p className="muted">{reviewMsg}</p> : null}
          </form>
        ) : (
          <p className="muted">
            <Link to="/login">Log in</Link> to leave a review.
          </p>
        )}
        <ul className="review-list">
          {(restaurant.reviews || []).slice(-10).reverse().map((rev) => (
            <li key={rev._id} className="review-item">
              <strong>{rev.rating}★</strong>
              <span className="muted small">{rev.comment}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
