"use client"

import Breadcrumb from "../components/Breadcrumb"
import CheckoutButton from "../components/CheckoutButton"
import QuantitySelector from "../components/QuantitySelector"
import { useBag } from "../context/BagContext"
import Image from "next/image"
import Link from "next/link"

export default function CartPage(){
    const { items, updateQuantity, removeItem, subtotal } = useBag()

    return (
        <main>
            <div className="mb-8">
                <Breadcrumb
                    items={[
                        {label: 'Home', href: '/'},
                        {label: 'Shopping Bag'}
                    ]}
                />
            </div>

            <div className="flex flex-col lg:flex-row gap-12 px-4 md:px-8 lg:px-16 mb-8">
                {/* Products Section */}
                <div className="lg:w-3/5">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center py-24 border rounded-xl">
                            <h2 className="text-xl font-semibold mb-4">
                            Your bag is empty
                            </h2>
                            <p className="text-gray-600 mb-6 max-w-md">
                            Once you add stickers, they’ll appear here.
                            </p>

                            <Link
                            href="/stickers"
                            className="inline-block bg-[var(--primary)] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90"
                            >
                            Continue Shopping
                            </Link>
                        </div>
                        ) : (
                        <div className="space-y-6">
                            {items.map(item => (
                                <div key={item.productId} className="flex border-t-1 py-6 gap-6 ">
                                    <div className="flex bg-[var(--bisque)] w-32 h-32 lg:w-48 lg:h-48 justify-center items-center overflow-hidden rounded-lg">
                                        <Image 
                                            src={(item.image)} 
                                            alt={item.title}
                                            width={200}
                                            height={200}
                                            className="object-contain"
                                        ></Image>
                                    </div>
                                    <div className="flex flex-col justify-between flex-1">
                                        <div>
                                            <h2>{item.title.toUpperCase()}</h2>
                                            <h3>$ {(item.price/100).toFixed(2)}</h3>
                                        </div>
                                        
                                        <div className="flex items-center justify-between mt-4">
                                            <QuantitySelector
                                                quantity={item.quantity}
                                                onChange={(qty) => updateQuantity(item.productId, qty)}
                                                max={item.stock}
                                            />
                                            <button
                                                onClick={() => removeItem(item.productId)}
                                                className="text-red-500 hover:underline ml-4"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Order Summary Section */}
                <div className="lg:w-2/5">
                    <div className="bg-white p-6 rounded-2xl shadow-md h-fit lg:sticky lg:top-32">
                        <h2 className="text-xl font-semibold mb-4">
                        Your Bag ({items.reduce((sum, item) => sum + item.quantity, 0)} items)
                        </h2>

                        <div className="space-y-2 mb-4">
                        {items.map((item) => (
                            <div key={item.productId} className="flex justify-between">
                            <span>{item.title} x {item.quantity}</span>
                            <span>${((item.price * item.quantity) / 100).toFixed(2)}</span>
                            </div>
                        ))}
                        </div>

                        <hr className="my-4" />

                        <div className="flex justify-between font-semibold text-lg mb-4">
                        <span>Subtotal:</span>
                        <span>${(subtotal / 100).toFixed(2)} CAD</span>
                        </div>

                        <p className="text-sm text-gray-600 mb-2">
                        Stickers ship via untracked letter mail to keep costs low.
                        </p>
                        <p className="text-sm text-gray-600 mb-6">Estimated delivery: 5–10 business days.</p>
                        <CheckoutButton/>
                        {/* <button className="w-full bg-[var(--primary)] text-white py-3 rounded-lg font-semibold mb-3 hover:opacity-90">
                        Checkout
                        </button> */}
                        <Link href="/stickers" className="w-full block text-center border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-100">
                        Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </main>
      )
}