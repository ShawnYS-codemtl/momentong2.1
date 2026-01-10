"use client";

type StickerCardProps = {
    image: string
    title: string
    width: number
    height: number
}

import Image from "next/image"
import MilkTea from "@/public/milk_tea 1.svg"


export default function StickerCard({image, title, width, height} : StickerCardProps){
    return (
        <div className="sticker-container">
            <div className="sticker-card">
                <Image 
                    src={image} 
                    alt={title}
                    width={width}
                    height={height}
                >
                </Image>
                <button className="add-btn">
                +
                </button>
            </div>
            <div className="sticker-info">
                <h4>{title.toUpperCase()}</h4>
                <p>$3.00 CAD</p>
            </div>
        </div>
    )
}