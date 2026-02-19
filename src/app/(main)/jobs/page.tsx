import { Suspense } from 'react';
import { getJobs } from '@/lib/actions/jobs';
import { JobCard } from '@/components/jobs/job-card';
import { JobFilters } from '@/components/jobs/job-filters';
import { Briefcase, Sparkles, Plus } from 'lucide-react';

type Props = { searchParams: Promise<{ q?: string; type?: string; sector?: string }> };

export default async function JobsPage({ searchParams }: Props) {
  const { q, type, sector } = await searchParams;
  const jobs = await getJobs({ 
    search: q, 
    contract_type: type, 
    sector: sector,
    adminView: false 
  });

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50/50 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-black/5 bg-white px-4 py-16 md:py-24">
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute -top-40 -right-20 size-[500px] rounded-full bg-[#2CB8C5]/8 blur-3xl animate-pulse" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 size-72 rounded-full bg-[#662483]/6 blur-3xl animate-pulse delay-700" />
        
        {/* Dot grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(#3C3C3B 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />

        <div className="container relative mx-auto max-w-5xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#2CB8C5]/10 px-4 py-1.5 text-xs font-black text-[#2CB8C5] uppercase tracking-widest shadow-sm shadow-[#2CB8C5]/10">
            <Briefcase className="size-3.5" />
            Espace Carrière
          </div>

          <h1 className="font-bricolage mt-6 text-5xl font-black text-[#3C3C3B] md:text-6xl lg:text-7xl leading-tight">
            Propulse ta<br />
            <span className="relative inline-block">
              <span className="bg-linear-to-r from-[#2CB8C5] to-[#662483] bg-clip-text text-transparent">carrière</span>
              <div className="absolute -right-8 -top-2 size-8 bg-[#2CB8C5]/10 rounded-xl flex items-center justify-center -rotate-12 animate-bounce">
                <Sparkles className="size-4 text-[#2CB8C5]" />
              </div>
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg text-[#3C3C3B]/55 leading-relaxed font-medium">
            Découvre les meilleures opportunités sélectionnées pour le réseau alumni My Digital School. Du stage au premier CDI, ton futur commence ici.
          </p>

          {/* Stats indicator */}
          <div className="mt-10 flex items-center gap-6">
            <div className="flex flex-col">
              <span className="font-bricolage text-4xl font-black text-[#3C3C3B]">{jobs.length}</span>
              <span className="text-xs font-bold uppercase tracking-widest text-[#3C3C3B]/35">Offres disponibles</span>
            </div>
            <div className="w-px h-10 bg-black/10" />
            <div className="flex flex-col">
              <span className="font-bricolage text-4xl font-black text-[#3C3C3B]">100%</span>
              <span className="text-xs font-bold uppercase tracking-widest text-[#3C3C3B]/35">Qualité MDS</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-black/5 shadow-sm">
        <div className="container mx-auto max-w-5xl px-4 py-4">
          <Suspense fallback={<div className="h-12 w-full animate-pulse bg-gray-100 rounded-2xl" />}>
            <JobFilters />
          </Suspense>
        </div>
      </div>

      {/* Grid Section */}
      <section className="container mx-auto max-w-5xl px-4 pt-12">
        {jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center rounded-3xl bg-white border border-dashed border-black/10">
            <div className="size-20 rounded-3xl bg-gray-50 flex items-center justify-center mb-6 text-4xl shadow-inner">
              🔍
            </div>
            <h3 className="text-2xl font-black text-[#3C3C3B]">Oups ! Aucun résultat.</h3>
            <p className="text-[#3C3C3B]/40 max-w-md mt-2 font-medium">
              Nous n&apos;avons trouvé aucune offre correspondant à tes critères actuels. Essaie de modifier tes filtres ou reviens plus tard !
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>
      
      {/* Promotion banner at bottom */}
      <section className="container mx-auto max-w-5xl px-4 mt-24">
        <div className="relative overflow-hidden rounded-[40px] bg-[#3C3C3B] p-10 md:p-16 text-white group">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-md text-center md:text-left">
              <h2 className="font-bricolage text-3xl md:text-4xl font-bold mb-4 leading-tight">
                Une offre à proposer à la communauté ?
              </h2>
              <p className="text-white/60 text-lg">
                Fais profiter le réseau de tes opportunités et recrute les meilleurs talents de My Digital School.
              </p>
            </div>
            <div className="shrink-0">
               <a 
                href="mailto:contact@mydigitalschool.com" 
                className="inline-flex items-center gap-3 bg-white text-[#3C3C3B] px-8 py-5 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-[#2CB8C5] hover:text-white transition-all shadow-xl hover:-translate-y-1"
              >
                Nous contacter
                <Plus className="size-4" />
              </a>
            </div>
          </div>
          
          {/* Background visuals for the banner */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-[#2CB8C5]/20 to-transparent pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 size-80 rounded-full bg-[#662483]/30 blur-[100px] pointer-events-none" />
        </div>
      </section>
    </div>
  );
}
