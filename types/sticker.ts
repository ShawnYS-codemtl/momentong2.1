// types/sticker.ts
export type Sticker = {
    sid: string
    collection_id: string
    title: string
    image_path: string          // path in Supabase Storage
    width: number
    height: number
    price: number
    memory_year: number
    description: string
    collection_name?: string    // optional if you store it, otherwise can omit
    slug: string
  }
  