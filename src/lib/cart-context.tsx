'use client'

import { createContext, useContext, useReducer, useState, useEffect, type ReactNode } from 'react'

export interface CartItem {
  id: number
  name: string
  price: number
  image_url: string | null
  quantity: number
  weight_grams: number | null
}

type Action =
  | { type: 'ADD'; item: Omit<CartItem, 'quantity'>; qty?: number }
  | { type: 'REMOVE'; id: number }
  | { type: 'SET_QTY'; id: number; qty: number }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; items: CartItem[] }

function reducer(state: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case 'ADD': {
      const qty = action.qty ?? 1
      const exists = state.find(i => i.id === action.item.id)
      if (exists) return state.map(i => i.id === action.item.id ? { ...i, quantity: i.quantity + qty } : i)
      return [...state, { ...action.item, quantity: qty }]
    }
    case 'REMOVE':  return state.filter(i => i.id !== action.id)
    case 'SET_QTY': return action.qty <= 0 ? state.filter(i => i.id !== action.id) : state.map(i => i.id === action.id ? { ...i, quantity: action.qty } : i)
    case 'CLEAR':   return []
    case 'HYDRATE': return action.items
    default:        return state
  }
}

interface CartCtx {
  items: CartItem[]
  count: number
  subtotal: number
  isOpen: boolean
  isLoading: boolean
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void
  removeItem: (id: number) => void
  setQty: (id: number, qty: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

const CartContext = createContext<CartCtx | null>(null)

const CART_KEY = 'oishi_niku_cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(reducer, [])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_KEY)
      if (stored) dispatch({ type: 'HYDRATE', items: JSON.parse(stored) })
    } catch {}
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items, hydrated])

  return (
    <CartContext.Provider value={{
      items,
      count: items.reduce((s, i) => s + i.quantity, 0),
      subtotal: items.reduce((s, i) => s + i.price * i.quantity, 0),
      isOpen,
      isLoading,
      addItem: (item, qty) => {
        dispatch({ type: 'ADD', item, qty })
        setIsOpen(true)
      },
      removeItem: id => dispatch({ type: 'REMOVE', id }),
      setQty: (id, qty) => dispatch({ type: 'SET_QTY', id, qty }),
      clearCart: () => dispatch({ type: 'CLEAR' }),
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      toggleCart: () => setIsOpen(o => !o),
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
