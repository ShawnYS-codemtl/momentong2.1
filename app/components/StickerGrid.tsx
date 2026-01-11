import StickerCard from "./StickerCard";
import {StickerCardProps} from "./StickerCard";

type Props = {
    stickers: StickerCardProps[];
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
        {stickers.map((s, i) => (
            <StickerCard key={i} {...s} />
        ))}
      </div>

    )
}