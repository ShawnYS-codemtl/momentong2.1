// app/admin/collections/[id]/edit/page.tsx
import CollectionForm from "@/app/components/admin/CollectionForm"
import { createClient } from "@/lib/supabase/server"


export default async function EditCollectionPage({ params } :{params: Promise<{ cid: string }>}) {
    const { cid } = await params
    const supabase = await createClient()
    const { data } = await supabase
        .from("collections")
        .select("*")
        .eq("cid", cid)
        .single()

    return (
        <>
        <h1 className="mb-6">Edit Collection</h1>
        <CollectionForm
            mode="edit"
            initialData={data}
        />
        </>
    )
}
