import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useCart } from '../context/CartContext'

export default function Checkout() {
  const navigate = useNavigate()
  const { cart, subtotal, clearCart } = useCart()
  const [address, setAddress] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  if (!cart) {
    return (
      <div className="page narrow">
        <h1>Checkout</h1>
        <p className="muted">Nothing to checkout.</p>
        <Link to="/">Browse</Link>
      </div>
    )
  }

  async function placeOrder(e) {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      await api.post('/orders', {
        restaurantId: cart.restaurantId,
        paymentMode: 'COD',
        deliveryAddress: address,
        items: cart.items.map((i) => ({
          menuItemId: i.menuItemId,
          quantity: i.quantity,
        })),
      })
      clearCart()
      navigate('/orders')
    } catch (ex) {
      setErr(ex.response?.data?.message || ex.message || 'Order failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page narrow">
      <h1>Checkout</h1>
      <div className="cod-callout card pad">
        <h2>Cash on delivery only</h2>
        <p>
          Online payments (cards, UPI, wallets) are <strong>disabled</strong>. Pay the rider with cash when your order
          arrives.
        </p>
      </div>
      <form className="stack-form card pad-lg" onSubmit={placeOrder}>
        <label className="field">
          <span>Delivery address / landmarks</span>
          <textarea rows={4} value={address} onChange={(e) => setAddress(e.target.value)} required />
        </label>
        <div className="order-sum">
          <span>Cart subtotal</span>
          <strong>₹{subtotal}</strong>
        </div>
        <p className="muted small">Discount from the restaurant (if any) is applied on the server.</p>
        {err ? <p className="error-text">{err}</p> : null}
        <button type="submit" className="btn btn-primary stretch" disabled={busy}>
          {busy ? 'Placing…' : 'Place COD order'}
        </button>
      </form>
    </div>
  )
}
