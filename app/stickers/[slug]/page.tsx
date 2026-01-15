
import { getStickerBySlug, getStickerUrl } from "@/lib/data/stickers"
import Image from "next/image"
import { formatSlug } from "@/lib/utils/formatSlug"
import Accordion from "@/app/components/Accordion"
import Breadcrumb from "@/app/components/Breadcrumb"

interface Params {
    params: { slug: string }
}

export default async function StickerDetailPage({params} : Params){
    const {slug} = await params
    const sticker = await getStickerBySlug(slug)

    return (
        <main className="px-[100px]">
            <Breadcrumb 
                items={[
                    {label: 'Home', href: '/'},
                    {label: 'Stickers', href: '/stickers'},
                    {label: formatSlug(slug)}
                ]}
            />
            <div className="flex my-8">
                <div className="sticker-detail-left">
                    <Image
                        className="sticker-detail-img"
                        src={getStickerUrl(sticker.image_path)}
                        alt={sticker.title}
                        width={sticker.width}
                        height={sticker.height}
                        >
                    </Image>
                </div>
                <div className="sticker-detail-info px-8">
                    <h2 className="mb-3">{sticker.title.toUpperCase()}</h2>
                    <h3 className="mb-4">$ {sticker.price.toFixed(2)} CAD</h3>
                    <hr />
                    <ul className="my-5 flex flex-col gap-[10px] ">
                        <li><p>💧 Dishwasher safe</p></li>
                        <li><p>☂️ Weatherproof</p></li>
                        <li><p>⭐️ Fade resistant</p></li>
                    </ul>
                    <p>Quantity</p>
                    <div className="quantity-button mt-3">
                        <button>-</button>
                        <span> 0 </span>
                        <button>+</button>
                    </div>
                    <button className="add-to-cart-btn my-9">ADD TO CART  - ${sticker.price.toFixed(2)}</button>
                    <hr />
                    <Accordion title="Description">
                        <p>{sticker.description}</p>
                    </Accordion>
                    <hr />
                    <Accordion title="Additional Information">
                       <p>Size:...</p>
                       <p>Shipping:...</p>
                       <p>Care Instructions:</p>
                       <p> Returns:</p>   
                    </Accordion>
                </div>

            </div>
        </main>
      )
}