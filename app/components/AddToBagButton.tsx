'use client'

import clsx from 'clsx';
import { useBag } from "../context/BagContext"

type Props = {
    productId: string
    title: string
    price: number
    image: string
    className? : string
    children? : React.ReactNode
    amount? : number
    isDisabled: boolean
    stock: number
}

export default function AddToBagButton({ amount = 1, ...props }: Props) {
  const { addItem } = useBag()

  return (
    <button className={clsx(
        `
        shadow-md
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-green-400
        `,
        // enabled state
        !props.isDisabled && `
        hover:scale-110
        `,
        // disabled state
        props.isDisabled && `
        bg-gray-300 text-gray-500
        cursor-not-allowed
        shadow-none
        ` ,
        props.className )}

      onClick={(e) => {
        e.stopPropagation() // stops the click from bubbling up to the Link
        e.preventDefault() // just in case it's inside a Link
        addItem({ productId: props.productId, title: props.title, price: props.price, image: props.image, stock: props.stock, is_available:!props.isDisabled}, amount)
      }}
      disabled={props.isDisabled}
    >
      {props.children || '+'}
    </button>
  )
}
