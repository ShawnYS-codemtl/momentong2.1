// app/admin/stickers/[sid]/edit/page.tsx
import { createClient } from "@/lib/supabase/server"
import StickerForm from "@/app/components/admin/StickerForm"
import { getStickerUrl } from "@/lib/data/stickers"

export default async function EditStickerPage({
  params,
}: {
  params: Promise<{ sid: string }>
}) {
  const { sid } = await params
  const supabase = await createClient()

  const { data: sticker } = await supabase
    .from("stickers")
    .select("*")
    .eq("sid", sid)
    .single()

  if (!sticker) return <p>Not found</p>

  const stickerForForm = {
    ...sticker,
    image_preview: getStickerUrl(sticker.image_path),
  }

  return <StickerForm mode="edit" initialData={stickerForForm} />
}

