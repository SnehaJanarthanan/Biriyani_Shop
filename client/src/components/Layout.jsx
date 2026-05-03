import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Layout() {
  const { user, logout, isAdmin } = useAuth()
  const { cart } = useCart()
  const cartCount = cart?.items.reduce((n, i) => n + i.quantity, 0) ?? 0

  return (
    <div className="app-shell">
      <header className="top-bar">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden>
            ☕
          </span>
          <span className="brand-text">
            <strong>Hyderabad</strong> Biriyani Finder
          </span>
        </Link>
        <nav className="nav-links">
          <NavLink to="/" end>
            Discover
          </NavLink>
          {user && (
            <>
              <NavLink to="/orders">My orders</NavLink>
              <NavLink to="/profile">Profile</NavLink>
            </>
          )}
          {isAdmin && <NavLink to="/admin">Admin</NavLink>}
          <NavLink to="/cart" className="cart-link">
            Cart{cartCount > 0 ? <span className="badge">{cartCount}</span> : null}
          </NavLink>
          {!user ? (
            <>
              <NavLink to="/login">Log in</NavLink>
              <NavLink to="/register" className="btn btn-small btn-primary">
                Sign up
              </NavLink>
            </>
          ) : (
            <button type="button" className="btn btn-small btn-ghost" onClick={logout}>
              Log out
            </button>
          )}
        </nav>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>
          Hyderabad city listings · Estimated travel times assume ~25 km/h urban pace ·{' '}
          <strong>COD only</strong> — online payments disabled by design.
        </p>
      </footer>
    </div>
  )
}
