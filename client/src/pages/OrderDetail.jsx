import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/client'

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const { data } = await api.get(`/orders/${id}`)
        if (!cancelled) setOrder(data.order)
      } catch (e) {
        if (!cancelled) setErr(e.response?.data?.message || e.message)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id])

  if (err) {
    return (
      <div className="page narrow">
        <p className="error-banner">{err}</p>
        <Link to="/orders">Back</Link>
      </div>
    )
  }

  if (!order) return <div className="page narrow muted">Loading…</div>

  return (
    <div className="page narrow">
      <Link className="back-link" to="/orders">
        ← Orders
      </Link>
      <div className="card pad-lg">
        <h1>Order detail</h1>
        <p>
          <strong>{order.restaurant?.name}</strong>
        </p>
        <p className="muted">Status: {order.status}</p>
        <p className="muted">Payment: {order.paymentMode}</p>
        <p className="muted">Address: {order.deliveryAddress || '—'}</p>
        <ul>
          {order.items.map((line, idx) => (
            <li key={idx}>
              {line.quantity}× {line.name} — ₹{line.unitPrice}
            </li>
          ))}
        </ul>
        <p>
          Total <strong>₹{order.totalAmount}</strong>
          {order.discountApplied > 0 ? (
            <span className="muted"> (discount ₹{order.discountApplied})</span>
          ) : null}
        </p>
      </div>
    </div>
  )
}
