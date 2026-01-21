// lib/data/stickers.ts
import { createClient } from '@/lib/supabase/server'
import { Sticker } from '@/types/sticker'

export async function getAllStickers() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('stickers')
    .select('*')
    .order('title', { ascending: true })

  if (error) {
    console.error('Failed to fetch stickers:', error)
    throw new Error('Could not load stickers')
  }

  return data
}

export async function getStickersWithCollection() {
    const supabase = await createClient()
  
    const { data, error } = await supabase
      .from('stickers')
      .select(`
        id,
        title,
        image_path,
        price,
        memory_year,
        width,
        height,
        collections (
          cid,
          location,
          slug
        )
      `)
  
    if (error) {
      console.error(error)
      throw new Error('Could not load stickers')
    }
  
    return data
  }

  export async function getStickersByCollectionSlug(slug: string) {
    const supabase = await createClient()
  
    const { data, error } = await supabase
      .from('stickers')
      .select(`
        *,
        collections!inner (slug)
      `)
      .eq('collections.slug', slug)
  
    if (error) {
      console.error(error)
      throw new Error('Could not load stickers')
    }
  
    return data
  }
  
  // lib/data/stickers.ts

export function getStickerUrl(imagePath: string) {
    // Public Supabase URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  
    if (!supabaseUrl) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
    }
  
    return `${supabaseUrl}/storage/v1/object/public/stickers/${imagePath}`
  }
  

export async function getStickerBySlug(slug: string): Promise<Sticker> {
const supabase = await createClient()

const { data, error } = await supabase
    .from('stickers')
    .select('*')
    .eq('slug', slug)
    .single() // ensures we get exactly one row

if (error) {
    console.error(`Failed to fetch sticker with slug: ${slug}`, error)
    throw new Error('Sticker not found')
}

return data
}

export async function getStickerById(id: string): Promise<Sticker> {
  console.log('getting sticker by id')
  const supabase = await createClient()

  const { data, error } = await supabase
      .from('stickers')
      .select('*')
      .eq('sid', id)
      .single()
  
  if (error) {
    console.error(`Failed to fetch sticker with id: ${id}`, error)
    throw new Error(`Sticker not found: ${id}`)
  }

  // Validate fields needed for Stripe
  if (typeof data.price !== 'number' || !data.title) {
    throw new Error(`Sticker data invalid for Stripe: ${id}`)
  }
  
  return data
}