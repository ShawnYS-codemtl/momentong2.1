import StickerCard from "./StickerCard";
import type { Sticker } from "@/types/sticker";
import { getStickerUrl } from "@/lib/data/stickers";

type Props = {
    stickers: Sticker[];
};

export default function StickerGrid({stickers}: Props) {
    return (
        <div className="
        grid
        gap-x-8
        gap-y-0
        justify-center
        [grid-template-columns:repeat(auto-fit,286px)]
      ">
        
        {stickers.map((s) => (
            <StickerCard key={s.sid} {...s} />
        ))}
      </div>
    )
}