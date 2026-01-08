type CollectionCardProps = {
    location: string
    theme: string
    stickerCount: number
    favourite: string
    // onClick?: () => void
  }
  
  export default function CollectionCard({
    location,
    theme,
    stickerCount,
    favourite,
    // onClick,
  }: CollectionCardProps) {
    return (
      <div className='collection-card-container'>
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
                <h3 className="favourite">{favourite}</h3>
            </div>
        </div>
      </div>
    )
  }
  