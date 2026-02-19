'use client';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

export const SearchBar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) params.set('q', e.target.value);
    else params.delete('q');
    startTransition(() => router.push(`?${params.toString()}`));
  };

  return (
    <div className="relative">
      <Search className={`absolute left-4 top-1/2 -translate-y-1/2 size-4 transition-colors ${isPending ? 'text-[#2CB8C5] animate-pulse' : 'text-[#3C3C3B]/35'}`} />
      <input
        type="text"
        placeholder="Rechercher un alumni, un poste, une entreprise..."
        defaultValue={searchParams.get('q') ?? ''}
        onChange={handleChange}
        className="w-full rounded-2xl border border-black/10 bg-white/90 py-3.5 pl-11 pr-4 text-sm text-[#3C3C3B] placeholder:text-[#3C3C3B]/35 shadow-sm outline-none transition-all focus:border-[#2CB8C5] focus:ring-2 focus:ring-[#2CB8C5]/15 focus:shadow-lg focus:shadow-[#2CB8C5]/8"
      />
    </div>
  );
};
