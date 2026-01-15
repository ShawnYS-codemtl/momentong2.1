// app/stickers/page.tsx
import { getAllStickers, getStickerUrl } from '@/lib/data/stickers'
import StickerGrid from '../components/StickerGrid'
import Breadcrumb from '../components/Breadcrumb'

export default async function StickersPage() {
  const stickers = await getAllStickers()

  return (
    <main>
        <Breadcrumb
            items={[
                {label: 'Home', href: '/'},
                {label: 'Stickers'}
            ]}
        />
        <StickerGrid stickers={stickers} />
    </main>
  )
}
