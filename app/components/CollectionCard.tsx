import type { CollectionSummary } from "@/types/collection"
import Link from "next/link"
  
export type CollectionCardProps = {
  collection: CollectionSummary
}
  export default function CollectionCard({
    collection
  }: CollectionCardProps) {
    const { id, slug, location, theme, description, favoriteLabel, stickerCount } = collection
    return (
      <Link href={`/collections/${slug}`} className="block">
        <div className='collection-card-container "
            w-[350px]
            sm:w-[370px]
            md:w-[390px]
          "'>
          <div className="location-container">
              <span className="text-[34px] md:text-[40px] font-medium ">{location}</span>
          </div>
          <div className="theme-container">
              <h3 className="text-sm sm:text-base">Moments of</h3>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold">{theme}</h2>
          </div>
          <div className="flex-container">
              <div className="sticker-container">
                  <h4>Stickers</h4>
                  <h3>{stickerCount}</h3>
              </div>
              <div className="favourite-container">
                  <h4>Favourite</h4>
                  <h3 className="favouriteLabel">{favoriteLabel}</h3>
              </div>
          </div>
        </div>
      </Link>
    )
  }
  