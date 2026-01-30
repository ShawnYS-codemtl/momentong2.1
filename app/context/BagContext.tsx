'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

export type BagItem = {
  productId: string
  title: string
  price: number // cents
  image: string
  quantity: number
  stock: number
  is_available: boolean
}

type BagContextType = {
  items: BagItem[]
  addItem: (item: Omit<BagItem, 'quantity'>, amount?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearBag: () => void
  subtotal: number
}

const BagContext = createContext<BagContextType | null>(null)

export function BagProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<BagItem[]>([])
  const [skipRehydrate, setSkipRehydrate] = useState(false)

  // Load bag from localStorage on first mount
  useEffect(() => {
    if (skipRehydrate) return
    const stored = localStorage.getItem('bag')
    if (stored) {
      setItems(JSON.parse(stored))
    }
  }, [skipRehydrate])

  // Persist bag to localStorage
  useEffect(() => {
    localStorage.setItem('bag', JSON.stringify(items))
  }, [items])

  const addItem = (item: Omit<BagItem, 'quantity'>, amount: number = 1) => {
    // HARD BLOCK: unavailable
    if (!item.is_available) return

    setItems(prev => {
      const existing = prev.find(i => i.productId === item.productId)
  
      // HARD BLOCK: sold out
      if (!existing && item.stock <= 0) return prev
  
      if (existing) {
        // HARD BLOCK: exceed stock
        if (existing.quantity + amount > existing.stock) {
          return prev
        }
  
        return prev.map(i =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + amount }
            : i
        )
      }
  
      return [...prev, { ...item, quantity: amount }]
    })
  }

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(item => item.productId !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }

    setItems(prev =>
      prev.flatMap(item => {
        if (item.productId !== productId) return [item]
        if (quantity <= 0) return []
        if (quantity > item.stock) return [item]
        return [{ ...item, quantity }]
      })
    )
  }

  const clearBag = useCallback(() => {
    setItems([]);
    setSkipRehydrate(true) // prevent rehydrating old items
    localStorage.removeItem("bag");
    localStorage.removeItem("subtotal");
  }, []);
  
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <BagContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearBag,
        subtotal,
      }}
    >
      {children}
    </BagContext.Provider>
  )
}

export function useBag() {
  const context = useContext(BagContext)
  if (!context) {
    throw new Error('useBag must be used within a BagProvider')
  }
  return context
}


