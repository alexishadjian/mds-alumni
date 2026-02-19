import { Suspense } from 'react';
import { getPosts } from '@/lib/actions/posts';
import { EventsTable } from '@/components/admin/events-table';
import { Calendar, Plus, MessageSquare } from 'lucide-react';

export default async function AdminEventsPage() {
  const posts = await getPosts();

  return (
    <div className="flex flex-col gap-8 p-8">
      {/* ─── Header ─── */}
      <section className="relative overflow-hidden rounded-[40px] bg-white border border-black/5 p-10 md:p-14 shadow-sm">
        {/* Decorative elements */}
        <div className="absolute top-[-20%] right-[-10%] size-[400px] rounded-full bg-[#2CB8C5]/5 blur-[80px]" />
        <div className="absolute bottom-[-10%] left-[-5%] size-[300px] rounded-full bg-[#662483]/5 blur-[60px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#662483]/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#662483] mb-2">
              <Calendar className="size-3.5" />
              Événements & Actualités
            </div>
            <h1 className="font-bricolage text-4xl md:text-5xl font-black text-[#3C3C3B] leading-none tracking-tight">
              Gestion de la <br />
              <span className="bg-linear-to-r from-[#2CB8C5] to-[#662483] bg-clip-text text-transparent italic">communication</span>
            </h1>
            <p className="text-lg text-[#3C3C3B]/50 font-medium max-w-lg leading-relaxed">
              Publiez et modifiez les prochains événements du réseau ainsi que les actualités de l&apos;école.
            </p>
          </div>

          <div className="flex items-center gap-6 md:pr-10">
            <div className="text-center group">
              <p className="text-4xl font-black text-[#3C3C3B] font-bricolage mb-1 group-hover:text-[#2CB8C5] transition-colors">{posts.length}</p>
              <p className="text-[10px] font-black text-[#3C3C3B]/30 uppercase tracking-widest">Articles</p>
            </div>
            <div className="w-px h-12 bg-black/5" />
            <div className="text-center group">
              <p className="text-4xl font-black text-[#3C3C3B] font-bricolage mb-1 group-hover:text-[#662483] transition-colors">
                {posts.filter(p => p.type === 'event').length}
              </p>
              <p className="text-[10px] font-black text-[#3C3C3B]/30 uppercase tracking-widest">Événements</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Main Table Section ─── */}
      <section className="bg-white rounded-[40px] border border-black/5 p-8 shadow-sm">
        <Suspense fallback={<div className="h-96 w-full animate-pulse bg-gray-50 rounded-3xl" />}>
          <EventsTable initialPosts={posts} />
        </Suspense>
      </section>
    </div>
  );
}
