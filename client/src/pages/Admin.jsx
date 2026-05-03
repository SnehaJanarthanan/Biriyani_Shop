import { useEffect, useMemo, useState } from 'react'
import api from '../api/client'

export default function Admin() {
  const [restaurants, setRestaurants] = useState([])
  const [orders, setOrders] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [costMin, setCostMin] = useState('')
  const [costMax, setCostMax] = useState('')
  const [discType, setDiscType] = useState('percent')
  const [discValue, setDiscValue] = useState('')
  const [discActive, setDiscActive] = useState(true)
  const [menuName, setMenuName] = useState('')
  const [menuPrice, setMenuPrice] = useState('')
  const [menuCategory, setMenuCategory] = useState('Chicken Biriyani')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  async function reload() {
    setErr('')
    try {
      const [{ data: rd }, { data: od }] = await Promise.all([
        api.get('/restaurants'),
        api.get('/orders/admin/all'),
      ])
      setRestaurants(rd.restaurants || [])
      setOrders(od.orders || [])
    } catch (e) {
      setErr(e.response?.data?.message || e.message)
    }
  }

  useEffect(() => {
    reload()
  }, [])

  const selected = useMemo(
    () => restaurants.find((r) => r._id === selectedId),
    [restaurants, selectedId]
  )

  useEffect(() => {
    if (!selected) return
    setCostMin(String(selected.costRange.min))
    setCostMax(String(selected.costRange.max))
    setDiscType(selected.discount?.type || 'percent')
    setDiscValue(String(selected.discount?.value ?? 0))
    setDiscActive(!!selected.discount?.active)
  }, [selected])

  async function savePricing(e) {
    e.preventDefault()
    setMsg('')
    setErr('')
    try {
      await api.patch(`/restaurants/${selectedId}/pricing`, {
        costRange: { min: Number(costMin), max: Number(costMax) },
        discount: {
          type: discType,
          value: Number(discValue),
          active: discActive,
        },
      })
      setMsg('Pricing updated.')
      await reload()
    } catch (e) {
      setErr(e.response?.data?.message || e.message)
    }
  }

  async function addMenuItem(e) {
    e.preventDefault()
    setMsg('')
    setErr('')
    try {
      await api.post('/menu', {
        restaurant: selectedId,
        name: menuName,
        price: Number(menuPrice),
        category: menuCategory,
      })
      setMenuName('')
      setMenuPrice('')
      setMsg('Menu item added.')
    } catch (e) {
      setErr(e.response?.data?.message || e.message)
    }
  }

  async function updateOrderStatus(orderId, status) {
    setErr('')
    try {
      await api.patch(`/orders/${orderId}/status`, { status })
      await reload()
    } catch (e) {
      setErr(e.response?.data?.message || e.message)
    }
  }

  return (
    <div className="page admin-page">
      <h1>Admin</h1>
      {err ? <p className="error-banner">{err}</p> : null}
      {msg ? <p className="banner-note">{msg}</p> : null}

      <section className="card pad-lg admin-grid">
        <div>
          <h2>Orders</h2>
          <ul className="admin-order-list">
            {orders.map((o) => (
              <li key={o._id} className="admin-order card pad-sm">
                <div>
                  <strong>{o.restaurant?.name}</strong>
                  <div className="muted small">
                    {o.user?.name} · ₹{o.totalAmount} · {o.status}
                  </div>
                </div>
                <div className="admin-actions">
                  <button type="button" className="btn btn-small btn-secondary" onClick={() => updateOrderStatus(o._id, 'placed')}>
                    Placed
                  </button>
                  <button type="button" className="btn btn-small btn-secondary" onClick={() => updateOrderStatus(o._id, 'preparing')}>
                    Preparing
                  </button>
                  <button type="button" className="btn btn-small btn-primary" onClick={() => updateOrderStatus(o._id, 'delivered')}>
                    Delivered
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2>Restaurant pricing</h2>
          <label className="field">
            <span>Restaurant</span>
            <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
              <option value="">Select…</option>
              {restaurants.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
          {selectedId ? (
            <form className="stack-form" onSubmit={savePricing}>
              <div className="field-row">
                <label className="field">
                  <span>Cost min ₹</span>
                  <input value={costMin} onChange={(e) => setCostMin(e.target.value)} required />
                </label>
                <label className="field">
                  <span>Cost max ₹</span>
                  <input value={costMax} onChange={(e) => setCostMax(e.target.value)} required />
                </label>
              </div>
              <label className="field">
                <span>Discount type</span>
                <select value={discType} onChange={(e) => setDiscType(e.target.value)}>
                  <option value="percent">Percent</option>
                  <option value="flat">Flat ₹</option>
                </select>
              </label>
              <label className="field">
                <span>Discount value</span>
                <input value={discValue} onChange={(e) => setDiscValue(e.target.value)} required />
              </label>
              <label className="checkbox-field">
                <input type="checkbox" checked={discActive} onChange={(e) => setDiscActive(e.target.checked)} />
                <span>Discount active</span>
              </label>
              <button type="submit" className="btn btn-primary">
                Save pricing
              </button>
            </form>
          ) : null}

          <h3>Add menu item</h3>
          {selectedId ? (
            <form className="stack-form" onSubmit={addMenuItem}>
              <label className="field">
                <span>Name</span>
                <input value={menuName} onChange={(e) => setMenuName(e.target.value)} required />
              </label>
              <label className="field">
                <span>Price ₹</span>
                <input type="number" min="0" value={menuPrice} onChange={(e) => setMenuPrice(e.target.value)} required />
              </label>
              <label className="field">
                <span>Category</span>
                <select value={menuCategory} onChange={(e) => setMenuCategory(e.target.value)}>
                  <option>Chicken Biriyani</option>
                  <option>Mutton Biriyani</option>
                  <option>Veg Biriyani</option>
                  <option>Starters</option>
                  <option>Beverages</option>
                </select>
              </label>
              <button type="submit" className="btn btn-secondary">
                Add item
              </button>
            </form>
          ) : (
            <p className="muted small">Pick a restaurant first.</p>
          )}
        </div>
      </section>
    </div>
  )
}
