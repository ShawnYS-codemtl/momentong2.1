import { getStickerBySlug, getStickerUrl } from "@/lib/data/stickers"



interface Params {
    params: { slug: string }
}

export default async function StickerDetailPage({params} : Params){
    const {slug} = await params
    const sticker = await getStickerBySlug(slug)

    return (
        <main className="px-8 py-12">
          <h2 className="text-2xl font-bold mb-6">{sticker.title}</h2>
          <img
            src={getStickerUrl(sticker.image_path)}
            alt={sticker.title}
            width={sticker.width}
            height={sticker.height}
          />
          <p className="mt-4">{sticker.description}</p>
          <p className="mt-2 font-bold">${sticker.price.toFixed(2)} CAD</p>
        </main>
      )
}