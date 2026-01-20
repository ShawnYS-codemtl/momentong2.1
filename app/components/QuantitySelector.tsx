'use client'

type Props = {
  onChange: (quantity: number) => void
  quantity: number
}

export default function QuantitySelector({ onChange, quantity }: Props) {
  const increase = () => onChange(quantity + 1)
  const decrease = () => onChange(Math.max(1, quantity - 1))

  return (
    <div className=" inline-flex 
        justify-center 
        items-center 
        px-6 py-1.5 
        text-2xl 
        font-[var(--quicksand)] 
        border 
        border-black/50
        ">
      <button className="cursor-pointer" onClick={decrease}>-</button>
      <span className="px-6">{quantity}</span>
      <button className="cursor-pointer" onClick={increase}>+</button>
    </div>
  )
}
