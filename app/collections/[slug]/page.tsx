// app/collections/[slug]/page.tsx
import { getStickersByCollectionSlug } from '@/lib/data/stickers'
import StickerGrid from '@/app/components/StickerGrid'
import { formatSlug } from '@/lib/utils/formatSlug'
import Breadcrumb from '@/app/components/Breadcrumb'

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
      <Breadcrumb
        items={[
          {label: 'Home', href: '/'},
          {label: 'Collections', href: '/collections'},
          {label: formatSlug(slug)}
        ]}
        />
      <StickerGrid stickers={stickers} />
    </main>
  )
}
