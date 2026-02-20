'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { GraduationCap, BookOpen, MapPin, Globe, X } from 'lucide-react';

interface Props {
  promotions: { id: number; year: number; label: string | null }[];
  programs: { id: number; name: string }[];
  cities: string[];
  countries: string[];
}

export function DirectoryFilters({ promotions, programs, cities, countries }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const activePromotion = searchParams.get('promotion') ?? '';
  const activeProgram = searchParams.get('program') ?? '';
  const activeCity = searchParams.get('city') ?? '';
  const activeCountry = searchParams.get('country') ?? '';
  const hasFilters = !!(activePromotion || activeProgram || activeCity || activeCountry);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => router.push(`?${params.toString()}`));
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('promotion');
    params.delete('program');
    params.delete('city');
    params.delete('country');
    startTransition(() => router.push(`?${params.toString()}`));
  };

  const selectClasses = `h-9 rounded-xl border border-black/8 bg-white px-3 pr-8 text-xs text-[#3C3C3B] outline-none transition-all focus:border-[#2CB8C5]/50 focus:ring-2 focus:ring-[#2CB8C5]/15 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%233C3C3B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_8px_center] bg-no-repeat`;
  const activeSelectClasses = `border-[#2CB8C5]/40 bg-[#2CB8C5]/5 text-[#2CB8C5] font-semibold`;

  return (
    <div className={`flex flex-wrap items-center gap-2 transition-opacity ${isPending ? 'opacity-60' : ''}`}>
      {/* Promotion */}
      <div className="flex items-center gap-1.5">
        <GraduationCap className="size-3.5 text-[#3C3C3B]/30" />
        <select
          value={activePromotion}
          onChange={(e) => updateParam('promotion', e.target.value)}
          className={`${selectClasses} ${activePromotion ? activeSelectClasses : ''}`}
        >
          <option value="">Toutes les promotions</option>
          {promotions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label || p.year}
            </option>
          ))}
        </select>
      </div>

      {/* Program */}
      {programs.length > 0 && (
        <div className="flex items-center gap-1.5">
          <BookOpen className="size-3.5 text-[#3C3C3B]/30" />
          <select
            value={activeProgram}
            onChange={(e) => updateParam('program', e.target.value)}
            className={`${selectClasses} ${activeProgram ? activeSelectClasses : ''}`}
          >
            <option value="">Toutes les filières</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* City */}
      {cities.length > 0 && (
        <div className="flex items-center gap-1.5">
          <MapPin className="size-3.5 text-[#3C3C3B]/30" />
          <select
            value={activeCity}
            onChange={(e) => updateParam('city', e.target.value)}
            className={`${selectClasses} ${activeCity ? activeSelectClasses : ''}`}
          >
            <option value="">Toutes les villes</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      {/* Country */}
      {countries.length > 0 && (
        <div className="flex items-center gap-1.5">
          <Globe className="size-3.5 text-[#3C3C3B]/30" />
          <select
            value={activeCountry}
            onChange={(e) => updateParam('country', e.target.value)}
            className={`${selectClasses} ${activeCountry ? activeSelectClasses : ''}`}
          >
            <option value="">Tous les pays</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 rounded-xl border border-red-200/60 bg-red-50/60 px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-100/60"
        >
          <X className="size-3" />
          Effacer les filtres
        </button>
      )}
    </div>
  );
}
