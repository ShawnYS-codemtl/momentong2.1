"use client"

import { useState } from "react"

interface AccordionProps {
    title: string
    children: React.ReactNode
}

export default function Accordion({title, children}: AccordionProps) {
    const [open, setOpen] = useState(false)

    return (
        <div className="w-full">
          <button
            className="flex items-center justify-between w-full py-5 cursor-pointer"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
          >
            <span className="font-medium">{title}</span>
            <span>{open ? '−' : '+'}</span>
          </button>
    
          {open && (
            <div className="pb-5 overflow-hidden">
              {children}
            </div>
          )}
        </div>
      )      
}

