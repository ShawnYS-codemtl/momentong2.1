// app/collections/page.tsx
import { getAllCollections } from '@/lib/data/collections'
import CollectionGrid from '../components/CollectionGrid'

export default async function CollectionsPage() {
  const collections = await getAllCollections()

  return (
    <main>
      <h4 className='mt-8'>Home&nbsp;&nbsp;&gt;&nbsp;&nbsp;Collections</h4>
      <CollectionGrid collections={collections} />
    </main>
  )
}
