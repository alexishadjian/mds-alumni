'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const TransparentCtx = createContext(false);
export const useTransparentHeader = () => useContext(TransparentCtx);

export function HeaderShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(!isHome);

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }
    const handler = () => setScrolled(window.scrollY > 20);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [isHome]);

  const isTransparent = isHome && !scrolled;

  return (
    <TransparentCtx.Provider value={isTransparent}>
      <header
        className={`top-0 z-50 h-16 border-b transition-all duration-300 ${
          isHome ? 'fixed inset-x-0' : 'sticky'
        } ${
          isTransparent
            ? 'bg-transparent border-white/8'
            : 'bg-white/80 backdrop-blur-xl border-black/5 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]'
        }`}
      >
        {children}
      </header>
    </TransparentCtx.Provider>
  );
}
