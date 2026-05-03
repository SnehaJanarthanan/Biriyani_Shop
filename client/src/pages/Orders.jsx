import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

const STATUS_LABEL = {
  placed: 'Placed',
  preparing: 'Preparing',
  delivered: 'Delivered',
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const { data } = await api.get('/orders/mine')
        if (!cancelled) setOrders(data.orders || [])
      } catch (e) {
        if (!cancelled) setErr(e.response?.data?.message || e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <div className="page narrow muted">Loading orders…</div>
  if (err) return <div className="page narrow error-banner">{err}</div>

  return (
    <div className="page narrow">
      <h1>My orders</h1>
      {orders.length === 0 ? (
        <p className="muted">
          No orders yet. <Link to="/">Find biriyani</Link>
        </p>
      ) : (
        <ul className="order-cards">
          {orders.map((o) => (
            <li key={o._id} className="card pad order-card">
              <div className="order-card-head">
                <strong>{o.restaurant?.name || 'Restaurant'}</strong>
                <span className={`status status-${o.status}`}>{STATUS_LABEL[o.status]}</span>
              </div>
              <p className="muted small">
                Placed {new Date(o.createdAt).toLocaleString()} · COD ₹{o.totalAmount}
              </p>
              <ul className="muted small">
                {o.items.map((line, idx) => (
                  <li key={idx}>
                    {line.quantity}× {line.name}
                  </li>
                ))}
              </ul>
              <Link className="small-link" to={`/orders/${o._id}`}>
                Details
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
