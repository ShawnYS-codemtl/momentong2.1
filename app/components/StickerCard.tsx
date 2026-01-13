import { getStickerUrl } from "@/lib/data/stickers";
import type { Sticker } from "@/types/sticker";
import Image from "next/image"
import Link from "next/link";

export default function StickerCard(props : Sticker){
    return (
        <Link href={`/stickers/${props.slug}`} className="block">
            <div className="sticker-container">
                <div className="sticker-card">
                    <Image 
                        src={getStickerUrl(props.image_path)} 
                        alt={props.title}
                        width={props.width}
                        height={props.height}
                    >
                    </Image>
                    <button className="add-btn">
                    +
                    </button>
                </div>
                <div className="sticker-info">
                    <h4>{props.title.toUpperCase()}</h4>
                    <p>$3.00 CAD</p>
                </div>
            </div>
        </Link>
    )
}