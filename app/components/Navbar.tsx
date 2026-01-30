'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import BagIcon from '@/public/bag-icon.svg'
import { useBag } from '../context/BagContext'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const {items} = useBag()
  const count = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <>
      <nav className="
        sticky top-0 z-50
        w-full
        flex items-center justify-between
        bg-[var(--primary-dark)]
        text-white
        px-[6%] md:px-[5%] lg:px-[6%]
        shadow-md
      ">
        {/* Desktop links */}
        <ul className="
          hidden md:flex
          flex-1
          justify-around
          items-center
          gap-[6%]
          py-6
        ">
          {['Home', 'Collections', 'Stickers', 'About', 'Contact'].map((label) => (
            <li
              key={label}
              className="
                border-b-2 border-transparent
                hover:border-[#E6B12A]
                transition-colors
              "
            >
              <Link href={`/${label === 'Home' ? '' : label.toLowerCase()}`}>
                <h3 className="whitespace-nowrap">
                  {label}
                </h3>
              </Link>
            </li>
          ))}
          <li>
            <Link href='/cart' className='relative inline-block'>
              <Image src={BagIcon} alt="Bag" width={32} height={32} className="navbar-icon mb-2" />
              <span className="
              absolute -top-2 -right-2
              bg-red-500 text-white text-xs font-bold
              rounded-full px-1.5 py-0.5
            ">{count}
            </span>
            </Link>
          </li>
        </ul>

        {/* Desktop icons
        <div className="hidden md:flex items-center gap-5 ml-4">
          <Image src={UserIcon} alt="User" width={32} height={32} className="navbar-icon" />
          <Image src={HeartIcon} alt="Wishlist" width={32} height={32} className="navbar-icon" />
          <Image src={BagIcon} alt="Bag" width={32} height={32} className="navbar-icon" />
        </div> */}

        {/* Mobile burger */}
        <button
          onClick={() => setOpen(true)}
          className="md:hidden flex flex-col gap-1 my-3"
          aria-label="Open menu"
        >
          <span className="w-6 h-0.5 bg-white" />
          <span className="w-6 h-0.5 bg-white" />
          <span className="w-6 h-0.5 bg-white" />
        </button>
      </nav>

      {open && <MobileMenu onClose={() => setOpen(false)} />}
    </>
  )
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div className="
        absolute right-0 top-0
        h-full w-4/5
        bg-[var(--primary-dark)]
        text-white
        p-6
        flex flex-col
      ">
        <button
          onClick={onClose}
          className="self-end text-2xl mb-8"
        >
          ×
        </button>

        <nav className="flex flex-col gap-6 text-lg">
          <Link href="/" 
                className="border-b-2 border-transparent
                hover:border-[#E6B12A]
                transition-colors"
                onClick={onClose}>Home</Link>
          <Link href="/collections" 
                className="border-b-2 border-transparent
                hover:border-[#E6B12A]
                transition-colors"
                onClick={onClose}>Collections</Link>
          <Link href="/stickers" 
                className="border-b-2 border-transparent
                hover:border-[#E6B12A]
                transition-colors"
                onClick={onClose}>Stickers</Link>
          <Link href="/about" 
                className="border-b-2 border-transparent
                hover:border-[#E6B12A]
                transition-colors"
                onClick={onClose}>About</Link>
          <Link href="/contact" 
                className="border-b-2 border-transparent
                hover:border-[#E6B12A]
                transition-colors"
                onClick={onClose}>Contact</Link>
          <Link href='/cart' className='navbar-icon' onClick={onClose}>
              <Image src={BagIcon} alt="Bag" width={24} height={24} className="navbar-icon" />
          </Link>
        </nav>
      </div>
    </div>
  )
}
