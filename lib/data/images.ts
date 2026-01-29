export function getPublicStorageUrl(bucket: string, path: string) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  
    if (!supabaseUrl) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set")
    }
  
    const cleanPath = path.replace(/^\/+/, "")
  
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${cleanPath}`
  }
  