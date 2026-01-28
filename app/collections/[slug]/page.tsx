// app/collections/[slug]/page.tsx
import { getStickersByCollectionSlug } from '@/lib/data/stickers'
import { getCollectionBySlug } from '@/lib/data/collections'
import StickerGrid from '@/app/components/StickerGrid'
import { formatSlug } from '@/lib/utils/formatSlug'
import Breadcrumb from '@/app/components/Breadcrumb'

interface Params {
  params: { slug: string }
}

export default async function CollectionPage({ params }: Params) {
  const { slug } = await params
  const collection = await getCollectionBySlug(slug)
  if (!collection) return <p>Collection not found.</p>
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

        {/* Collection Description */}
        <div className="my-6 px-4 sm:px-6 md:px-8">
          <p className="text-gray-700 text-center mx-auto max-w-xl">
            {collection.description}
          </p>
        </div>

      <StickerGrid stickers={stickers} />
    </main>
  )
}
