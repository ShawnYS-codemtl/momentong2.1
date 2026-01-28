export function slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") // remove special chars
      .replace(/\s+/g, "-")         // spaces → dashes
      .replace(/-+/g, "-")          // collapse dashes
}