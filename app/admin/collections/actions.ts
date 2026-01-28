"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { slugify } from "@/lib/utils/slugify"
import { redirect } from "next/navigation"

export async function deleteCollection(cid: string) {
    const supabase = await createClient()

    const { count } = await supabase
        .from("stickers")
        .select("*", { count: "exact", head: true })
        .eq("collection_id", cid)

    if (count && count > 0) {
        throw new Error("Collection has stickers")
    }

    const { error } = await supabase
        .from("collections")
        .delete()
        .eq("cid", cid)

    if (error) {
        throw new Error("Failed to delete collection")
    }

    revalidatePath("/admin/collections")
}

export async function createCollection(formData: FormData) {
    const supabase = await createClient()
    const location = formData.get("name") as string

    const data = {
        location,
        theme: formData.get("theme"),
        favorite_label: formData.get("favorite_label"),
        description: formData.get("description"),
        slug: slugify(location),
    }
    await supabase.from("collections").insert(data)
    revalidatePath("/admin/collections")
    redirect("/admin/collections")
}

export async function updateCollection(cid: string, formData: FormData) {
    const supabase = await createClient()
    const data = {
        location: formData.get("name"),
        theme: formData.get("theme"),
        favorite_label: formData.get("favorite_label"),
        description: formData.get("description")
    }

    await supabase.from("collections").update(data).eq("cid", cid)
    revalidatePath("/admin/collections")
    redirect("/admin/collections")
}
