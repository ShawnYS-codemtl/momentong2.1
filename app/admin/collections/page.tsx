import { createClient } from "@/lib/supabase/server"
import CollectionsAdminPage from "@/app/components/admin/CollectionsAdminPage"

export default async function CollectionsPage() {

    const supabase = await createClient()
    const { data: collections, error } = await supabase
        .from("collections")
        .select("cid, location, theme, favorite_label, description")
        .order("created_at", { ascending: false })

    if (error) {
        throw new Error("Failed to load collections")
    }

    return (
        <CollectionsAdminPage
        collections={collections ?? []}
        />
    )
}

