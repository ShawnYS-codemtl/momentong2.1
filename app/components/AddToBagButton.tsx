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
}

export default function AddToBagButton({ amount = 1, ...props }: Props) {
  const { addItem } = useBag()

  return (
    <button className={clsx(
        `
        shadow-md
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-green-400`, 
        props.className )}

      onClick={(e) => {
        e.stopPropagation() // stops the click from bubbling up to the Link
        e.preventDefault() // just in case it's inside a Link
        addItem({ productId: props.productId, title: props.title, price: props.price, image: props.image}, amount)
      }}
    >
      {props.children || '+'}
    </button>
  )
}
