/**
 * Breadcrumb component for page navigation trails
 * Used on: Club Profile, Grant-Clubs, Club Edit
 */

import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4 md:mb-6 flex-wrap">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-3.5 h-3.5 text-gray-400 shrink-0"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          )}
          {item.href ? (
            <Link
              href={item.href}
              className="text-gp-blue font-medium hover:underline no-underline"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}