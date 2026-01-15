// app/collections/page.tsx
import { getAllCollections } from '@/lib/data/collections'
import CollectionGrid from '../components/CollectionGrid'
import Breadcrumb from '../components/Breadcrumb'

export default async function CollectionsPage() {
  const collections = await getAllCollections()

  return (
    <main>
      <Breadcrumb 
        items={[
          {label: 'Home', href: '/'},
          {label: 'Collections'}
        ]}
        />
      <CollectionGrid collections={collections} />
    </main>
  )
}
