
import { getStickerBySlug, getStickerUrl } from "@/lib/data/stickers"
import Image from "next/image"
import { formatSlug } from "@/lib/utils/formatSlug"
import Accordion from "@/app/components/Accordion"
import Breadcrumb from "@/app/components/Breadcrumb"
import StickerPurchase from "@/app/components/StickerPurchase"

interface Params {
    params: { slug: string }
}

export default async function StickerDetailPage({params} : Params){
    const {slug} = await params
    const sticker = await getStickerBySlug(slug)
    const stickerImageUrl = getStickerUrl(sticker.image_path) 

    return (
        <main>
            <Breadcrumb
                items={[
                    {label: 'Home', href: '/'},
                    {label: 'Stickers', href: '/stickers'},
                    {label: formatSlug(slug)}
                ]}
            />
            <div className="flex flex-col lg:flex-row my-8 gap-8 lg:gap-0 px-4 md:px-8 lg:px-[100px]">
                <div className="sticker-detail-left flex justify-center lg:justify-start mx-auto relative">
                    <Image
                        className="sticker-detail-img max-w-full h-auto sm:max-w-[280px] md:max-w-[340px] lg:max-w-none"
                        src={getStickerUrl(sticker.image_path)}
                        alt={sticker.title}
                        fill
                        sizes="(max-width: 1024px) 90vw, 604px"
                        >
                    </Image>
                </div>
                <div className="sticker-detail-info px-0 lg:px-8 min-w-0">
                    <h2 className="mb-3">{sticker.title.toUpperCase()}</h2>
                    <h3 className="mb-4">$ {(sticker.price/100).toFixed(2)} CAD</h3>
                    <hr />
                    <ul className="my-5 flex flex-col gap-[10px] ">
                        <li><p>💧 Dishwasher safe</p></li>
                        <li><p>☂️ Weatherproof</p></li>
                        <li><p>⭐️ Fade resistant</p></li>
                    </ul>
                    <StickerPurchase sticker={{ ...sticker, image_path: stickerImageUrl }}/>
                    <hr />
                    <Accordion title="Description">
                        <p className="max-w-prose break-words whitespace-pre-wrap">{sticker.description}</p>
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