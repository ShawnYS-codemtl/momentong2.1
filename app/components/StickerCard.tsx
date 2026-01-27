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
                         className="add-btn"
                         isDisabled={!props.is_available || props.stock <= 0}
                         stock={props.stock}
                    />
                </div>
                <div className="sticker-info">
                    <h4>{props.title.toUpperCase()}</h4>
                    <div className="flex justify-between">
                        <p>$ {(props.price/100).toFixed(2)} CAD</p>
                        {!props.is_available ? (
                        <p className="text-gray-500 font-semibold ml-2">
                            UNAVAILABLE
                        </p>
                        ) : props.stock <= 0 ? (
                        <p className="text-red-600 font-semibold">
                            SOLD OUT
                        </p>
                        ) : null}
                    </div>
                    {/* <p>$ {(props.price/100).toFixed(2)} CAD</p> */}
                </div>
            </div>
        </Link>
    )
}