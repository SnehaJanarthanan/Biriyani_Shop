import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function CartPage() {
  const { cart, subtotal, setQuantity, removeLine, clearCart } = useCart()

  if (!cart) {
    return (
      <div className="page narrow">
        <h1>Cart</h1>
        <p className="muted">Your cart is empty.</p>
        <Link className="btn btn-secondary" to="/">
          Browse restaurants
        </Link>
      </div>
    )
  }

  return (
    <div className="page narrow">
      <h1>Cart</h1>
      <p className="muted">{cart.restaurantName}</p>
      <ul className="cart-lines card pad">
        {cart.items.map((line) => (
          <li key={line.menuItemId} className="cart-line">
            <div>
              <strong>{line.name}</strong>
              <div className="muted small">₹{line.price} each</div>
            </div>
            <div className="cart-line-actions">
              <input
                type="number"
                min={1}
                value={line.quantity}
                onChange={(e) => setQuantity(line.menuItemId, e.target.value)}
                aria-label={`Quantity for ${line.name}`}
              />
              <button type="button" className="btn btn-small btn-ghost" onClick={() => removeLine(line.menuItemId)}>
                Remove
              </button>
            </div>
            <div className="cart-line-total">₹{line.price * line.quantity}</div>
          </li>
        ))}
      </ul>
      <div className="cart-summary card pad">
        <div className="cart-summary-row">
          <span>Subtotal</span>
          <strong>₹{subtotal}</strong>
        </div>
        <p className="muted small">
          Restaurant discounts are calculated at checkout from live shop rules (COD only).
        </p>
        <div className="cart-actions">
          <button type="button" className="btn btn-ghost" onClick={clearCart}>
            Clear cart
          </button>
          <Link className="btn btn-primary" to="/checkout">
            Checkout (COD)
          </Link>
        </div>
      </div>
    </div>
  )
}
