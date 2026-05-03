import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem('cart')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const persist = useCallback((next) => {
    setCart(next)
    if (next) localStorage.setItem('cart', JSON.stringify(next))
    else localStorage.removeItem('cart')
  }, [])

  const clearCart = useCallback(() => persist(null), [persist])

  const addItem = useCallback(
    (restaurantId, restaurantName, { menuItemId, name, price }, qty = 1) => {
      setCart((prev) => {
        if (prev && prev.restaurantId !== restaurantId) {
          const ok = window.confirm(
            `Your cart has items from ${prev.restaurantName}. Replace with ${restaurantName}?`
          )
          if (!ok) return prev
        }
        const base =
          prev && prev.restaurantId === restaurantId
            ? prev
            : { restaurantId, restaurantName, items: [] }
        const items = [...base.items]
        const idx = items.findIndex((i) => i.menuItemId === menuItemId)
        const q = Math.max(1, qty)
        if (idx >= 0) items[idx] = { ...items[idx], quantity: items[idx].quantity + q }
        else items.push({ menuItemId, name, price, quantity: q })
        const next = { restaurantId, restaurantName, items }
        localStorage.setItem('cart', JSON.stringify(next))
        return next
      })
    },
    []
  )

  const setQuantity = useCallback((menuItemId, quantity) => {
    setCart((prev) => {
      if (!prev) return prev
      const q = Math.max(1, Number(quantity) || 1)
      const items = prev.items
        .map((i) => (i.menuItemId === menuItemId ? { ...i, quantity: q } : i))
        .filter((i) => i.quantity > 0)
      if (items.length === 0) {
        localStorage.removeItem('cart')
        return null
      }
      const next = { ...prev, items }
      localStorage.setItem('cart', JSON.stringify(next))
      return next
    })
  }, [])

  const removeLine = useCallback((menuItemId) => {
    setCart((prev) => {
      if (!prev) return prev
      const items = prev.items.filter((i) => i.menuItemId !== menuItemId)
      if (items.length === 0) {
        localStorage.removeItem('cart')
        return null
      }
      const next = { ...prev, items }
      localStorage.setItem('cart', JSON.stringify(next))
      return next
    })
  }, [])

  const subtotal = useMemo(() => {
    if (!cart) return 0
    return cart.items.reduce((s, i) => s + i.price * i.quantity, 0)
  }, [cart])

  const value = useMemo(
    () => ({ cart, addItem, clearCart, setQuantity, removeLine, subtotal }),
    [cart, addItem, clearCart, setQuantity, removeLine, subtotal]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
