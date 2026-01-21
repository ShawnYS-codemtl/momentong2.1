'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type BagItem = {
  productId: string
  title: string
  price: number // cents
  image: string
  quantity: number
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

  // Load bag from localStorage on first mount
  useEffect(() => {
    const stored = localStorage.getItem('bag')
    if (stored) {
      setItems(JSON.parse(stored))
    }
  }, [])

  // Persist bag to localStorage
  useEffect(() => {
    localStorage.setItem('bag', JSON.stringify(items))
  }, [items])

  const addItem = (item: Omit<BagItem, 'quantity'>, amount: number = 1) => {
    setItems((prev) => {
        const existingIndex = prev.findIndex(i => i.productId === item.productId)
    
        if (existingIndex !== -1) {
          // If item exists, increase quantity
          const updated = [...prev]
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + amount
          }
          return updated
        } else {
          // If new item, set quantity
          return [...prev, { ...item, quantity: amount }]
        }
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
      prev.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      )
    )
  }

  const clearBag = () => {
    setItems([])
    localStorage.removeItem("cart")
    localStorage.removeItem("subtotal")
  }
  
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

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


