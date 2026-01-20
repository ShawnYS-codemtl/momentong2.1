'use client'

import { useState } from "react"
import QuantitySelector from "./QuantitySelector"
import AddToBagButton from "./AddToBagButton"
import type { Sticker } from "@/types/sticker"

type Props = {
  sticker: Sticker
}

export default function StickerPurchase({ sticker }: Props) {
  const [quantity, setQuantity] = useState(1)

  return (
    <div className="sticker-purchase mt-6">
      <p className="mb-2 font-bold">Quantity</p>

      <QuantitySelector
        quantity={quantity}
        onChange={setQuantity} // now safe, client → client
      />

      <AddToBagButton
        productId={sticker.sid}
        title={sticker.title}
        price={sticker.price}
        image={sticker.image_path}
        amount={quantity} // pass the selected quantity
        className="add-to-cart-btn my-6 hover:scale-105"
      >
        ADD TO BAG - ${(sticker.price * quantity / 100).toFixed(2)}
      </AddToBagButton>
    </div>
  )
}
