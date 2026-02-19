import { Suspense } from 'react';
import { getProfilesForDirectory } from '@/lib/actions/profile';
import { AlumniCard } from '@/components/directory/alumni-card';
import { SearchBar } from '@/components/directory/search-bar';
import { Users } from 'lucide-react';

type Props = { searchParams: Promise<{ q?: string }> };

export default async function AnnuairePage({ searchParams }: Props) {
  const { q } = await searchParams;
  const profiles = await getProfilesForDirectory(q);

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50/60">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-black/5 bg-white px-4 py-14 md:py-20">
        {/* Blobs décoratifs */}
        <div className="pointer-events-none absolute -top-40 -right-20 size-[500px] rounded-full bg-[#2CB8C5]/6 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 size-72 rounded-full bg-[#662483]/5 blur-3xl" />

        <div className="container relative mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#2CB8C5]/10 px-3.5 py-1.5 text-xs font-bold text-[#2CB8C5] uppercase tracking-widest">
            <Users className="size-3.5" />
            Réseau Alumni MDS
          </div>

          <h1 className="font-bricolage mt-4 text-4xl font-bold text-[#3C3C3B] md:text-5xl lg:text-6xl">
            Retrouvez les<br />
            <span className="bg-linear-to-r from-[#2CB8C5] to-[#662483] bg-clip-text text-transparent">
              Alumni
            </span>{' '}
            MDS
          </h1>

          <p className="mt-3 max-w-lg text-base text-[#3C3C3B]/55 leading-relaxed">
            Explore les parcours, connecte-toi avec les anciens étudiants et agrandis ton réseau professionnel.
          </p>

          <div className="mt-5 flex items-baseline gap-2">
            <span className="font-bricolage text-3xl font-bold text-[#3C3C3B]">{profiles.length}</span>
            <span className="text-sm text-[#3C3C3B]/45">alumni{profiles.length > 1 ? 's' : ''} inscrits</span>
          </div>

          <div className="mt-6 max-w-xl">
            <Suspense>
              <SearchBar />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Grille */}
      <section className="container mx-auto max-w-7xl px-4 py-10">
        {profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="size-16 rounded-3xl bg-[#2CB8C5]/10 flex items-center justify-center mb-4">
              <Users className="size-7 text-[#2CB8C5]/60" />
            </div>
            <p className="text-[#3C3C3B]/40 text-lg font-medium">Aucun résultat{q ? ` pour "${q}"` : ''}</p>
            <p className="text-[#3C3C3B]/30 text-sm mt-1">Essaie avec d&apos;autres mots-clés</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {profiles.map((profile) => (
              <AlumniCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
