'use client'

import { useState } from "react"
import QuantitySelector from "./QuantitySelector"
import AddToBagButton from "./AddToBagButton"
import type { Sticker } from "@/types/sticker"
import { useBag } from "../context/BagContext"

type Props = {
  sticker: Sticker
}

export default function StickerPurchase({ sticker }: Props) {
  const [quantity, setQuantity] = useState(1)

  const { items } = useBag()
  
  // How many are already in the cart
  const existingItem = items.find(i => i.productId === sticker.sid)
  const existingQuantity = existingItem?.quantity || 0

  // Maximum quantity user can select
  const maxAllowed = Math.max(sticker.stock - existingQuantity, 0)
  const isDisabled = !sticker.is_available || maxAllowed <= 0

  return (
    <div className="sticker-purchase mt-6">
      <p className="mb-2 font-bold">Quantity</p>

      <QuantitySelector
        quantity={quantity}
        onChange={setQuantity} // now safe, client → client
        max={maxAllowed}
      />

      <AddToBagButton
        productId={sticker.sid}
        title={sticker.title}
        price={sticker.price}
        image={sticker.image_path}
        amount={quantity} // pass the selected quantity
        className="add-to-cart-btn my-6 active:scale-105"
        isDisabled={isDisabled}
        stock={sticker.stock}
      >
        ADD TO BAG - ${(sticker.price * quantity / 100).toFixed(2)}
      </AddToBagButton>
    </div>
  )
}
