'use client';

import Image from 'next/image';
import Link from 'next/link';
import { mydigitalschoollogo } from '@/public/assets';
import { useTransparentHeader } from './header-shell';

export function HeaderLogo() {
  const transparent = useTransparentHeader();
  return (
    <Link href="/" className="flex items-center">
      <Image
        src={mydigitalschoollogo}
        alt="My Digital School"
        width={130}
        height={40}
        className={`h-8 w-auto object-contain transition-[filter] duration-300 ${
          transparent ? 'brightness-0 invert' : ''
        }`}
      />
    </Link>
  );
}
