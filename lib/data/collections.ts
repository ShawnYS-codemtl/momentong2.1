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
    cid: collection.cid,
    slug: collection.slug,
    location: collection.location,
    theme: collection.theme,
    description: collection.description ?? undefined,
    favorite_label: collection.favorite_label ?? undefined,
    stickerCount: collection.stickers?.[0]?.count ?? 0,
  }))
}

export async function getCollectionBySlug(slug: string): Promise<CollectionSummary> {
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
      .eq('slug', slug)
      .single() // ensures we get exactly one row

  if (error) {
      console.error(`Failed to fetch collection with slug: ${slug}`, error)
      throw new Error('Sticker not found')
  }

  // Map to CollectionSummary type
  const collection: CollectionSummary = {
    cid: data.cid,
    slug: data.slug,
    location: data.location,
    theme: data.theme,
    description: data.description,
    favorite_label: data.favorite_label,
    stickerCount: data.stickers?.[0]?.count ?? 0
  }

  return collection
}