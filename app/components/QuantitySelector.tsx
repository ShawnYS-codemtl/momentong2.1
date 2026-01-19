'use client'

import { useEffect, useState } from "react"

type Props = {
  onChange?: (quantity: number) => void
  initialQuantity?: number
}

export default function QuantitySelector({ onChange, initialQuantity = 1 }: Props) {
  const [quantity, setQuantity] = useState(initialQuantity)

  useEffect(() => {
    onChange?.(quantity) // notify parent of changes
  }, [quantity])

  const increase = () => setQuantity(q => q + 1)
  const decrease = () => setQuantity(q => Math.max(1, q - 1))

  return (
    <div className=" inline-flex 
        justify-center 
        items-center 
        px-6 py-1.5 
        text-2xl 
        font-[var(--quicksand)] 
        cursor-pointer 
        border 
        border-black/50
        ">
      <button onClick={decrease}>-</button>
      <span className="px-6">{quantity}</span>
      <button onClick={increase}>+</button>
    </div>
  )
}
