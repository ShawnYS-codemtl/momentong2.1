// app/stickers/page.tsx
import { getAllStickers, getStickerUrl } from '@/lib/data/stickers'
import StickerGrid from '../components/StickerGrid'

export default async function StickersPage() {
  const stickers = await getAllStickers()

  return (
    <main>
        <h4 className='mt-8'>Home&nbsp;&nbsp;&gt;&nbsp;&nbsp;Stickers</h4>
        <StickerGrid stickers={stickers} />
    </main>
  )
}
