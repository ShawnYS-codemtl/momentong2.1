// lib/data/collections.ts
import { createClient } from '@/lib/supabase/server'
import type { CollectionSummary } from '@/types/collection'

export async function getAllCollections(): Promise<CollectionSummary[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('collections')
    .select(`
      cid,
      location,
      theme,
      description,
      favorite_label,
      slug,
      stickers ( count )
    `)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Failed to fetch collections:', error)
    throw new Error('Could not load collections')
  }

  return data.map((collection) => ({
    id: collection.cid,
    slug: collection.slug,
    location: collection.location,
    theme: collection.theme,
    description: collection.description ?? undefined,
    favoriteLabel: collection.favorite_label ?? undefined,
    stickerCount: collection.stickers?.[0]?.count ?? 0,
  }))
}
