// lib/utils/formatSlug.ts
export function formatSlug(slug: string) {
    return slug
      .split('-') // split at dashes
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // capitalize first letter
      .join(' ') // join with spaces
  }
  