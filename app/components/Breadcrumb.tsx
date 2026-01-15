import Link from 'next/link'

export interface BreadcrumbItem {
  label: string
  href?: string // no href = current page
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center text-sm mt-8 gap-1">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            {item.href ? (
              <Link href={item.href} className="hover:underline underline-offset-4 hover:decoration-[var(--button)]">
                <h4>{item.label}</h4>
              </Link>
            ) : (
              <h4>{item.label}</h4>
            )}

            {index < items.length - 1 && (
              <span className="mx-2">&gt;</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
