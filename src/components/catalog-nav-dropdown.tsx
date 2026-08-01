"use client";

import { useRef } from "react";
import Link from "next/link";

export function CatalogNavDropdown({ links }: { links: { href: string; label: string }[] }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  return (
    <details ref={detailsRef} className="relative">
      <summary className="cursor-pointer list-none text-latte-600 hover:text-emerald-800 dark:text-latte-300 dark:hover:text-emerald-400">
        Catálogos
      </summary>
      <div className="absolute left-0 top-full z-10 mt-1 flex w-56 flex-col gap-1 rounded-md border border-latte-200 bg-latte-50 p-2 shadow-lg dark:border-latte-700 dark:bg-latte-900">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => {
              if (detailsRef.current) detailsRef.current.open = false;
            }}
            className="rounded px-2 py-1.5 text-latte-700 hover:bg-latte-100 dark:text-latte-200 dark:hover:bg-latte-800"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </details>
  );
}
