import type { CollectionSummary } from "@/types/collection"
  
export type CollectionCardProps = {
  collection: CollectionSummary
}
  export default function CollectionCard({
    collection
  }: CollectionCardProps) {
    const { id, slug, location, theme, description, favoriteLabel, stickerCount } = collection
    return (
      <div className='collection-card-container "
    w-[350px]
    sm:w-[370px]
    md:w-[390px]
  "'>
        <div className="location-container">
            <h3>Location</h3>
            <h2>{location}</h2>
        </div>
        <div className="theme-container">
            <h3>Moments of</h3>
            <h2>{theme}</h2>
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
    )
  }
  