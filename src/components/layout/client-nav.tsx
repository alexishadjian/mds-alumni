'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/annuaire', label: 'Annuaire' },
  { href: '/jobs', label: 'Carrière' },
  { href: '/events', label: 'Événements' },
  { href: '/stats', label: 'Stats' },
] as const;

export const ClientNav = () => {
  const pathname = usePathname();
  return (
    <nav className="hidden gap-1 md:flex">
      {NAV_ITEMS.map(({ href, label }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`relative px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'text-[#2CB8C5] bg-[#2CB8C5]/8'
                : 'text-[#3C3C3B]/60 hover:text-[#3C3C3B] hover:bg-black/5'
            }`}
          >
            {label}
            {isActive && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#2CB8C5]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
};
