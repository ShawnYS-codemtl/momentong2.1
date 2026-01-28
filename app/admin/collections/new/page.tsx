// app/admin/collections/new/page.tsx
import CollectionForm from "@/app/components/admin/CollectionForm"

export default function NewCollectionPage() {
  return (
    <>
      <h1 className="mb-6">New Collection</h1>
      <CollectionForm mode="create"/>
    </>
  )
}
