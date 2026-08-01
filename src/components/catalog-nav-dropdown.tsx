"use client";

import { useRef } from "react";
import Link from "next/link";

export function CatalogNavDropdown({ links }: { links: { href: string; label: string }[] }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  return (
    <details ref={detailsRef} className="relative">
      <summary className="cursor-pointer list-none text-zinc-600 hover:text-emerald-800 dark:text-zinc-300 dark:hover:text-emerald-400">
        Catálogos
      </summary>
      <div className="absolute left-0 top-full z-10 mt-1 flex w-56 flex-col gap-1 rounded-md border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => {
              if (detailsRef.current) detailsRef.current.open = false;
            }}
            className="rounded px-2 py-1.5 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </details>
  );
}
