// app/collections/[slug]/page.tsx
import { getStickersByCollectionSlug } from '@/lib/data/stickers'
import StickerGrid from '@/app/components/StickerGrid'
import { formatSlug } from '@/lib/utils/formatSlug'

interface Params {
  params: { slug: string }
}

export default async function CollectionPage({ params }: Params) {
  const { slug } = await params
  const stickers = await getStickersByCollectionSlug(slug)

  if (!stickers || stickers.length === 0) {
    return <p>No stickers found for this collection.</p>
  }

  return (
    <main>
      <h4 className='mt-8'>Home&nbsp;&nbsp;&gt;&nbsp;&nbsp;Collections&nbsp;&nbsp;&gt;&nbsp;&nbsp;{formatSlug(slug)}</h4>
      <StickerGrid stickers={stickers} />
    </main>
  )
}
