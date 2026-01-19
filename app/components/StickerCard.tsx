import { getStickerUrl } from "@/lib/data/stickers";
import type { Sticker } from "@/types/sticker";
import Image from "next/image"
import Link from "next/link";
import AddToBagButton from "./AddToBagButton";

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
                    <AddToBagButton
                         productId={props.sid}
                         title= {props.title}
                         price={props.price}
                         image={getStickerUrl(props.image_path)}
                         className="add-btn hover:scale-110"
                    />
                </div>
                <div className="sticker-info">
                    <h4>{props.title.toUpperCase()}</h4>
                    <p>$ {(props.price/100).toFixed(2)} CAD</p>
                </div>
            </div>
        </Link>
    )
}