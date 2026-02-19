import { getPosts } from '@/lib/actions/posts';
import { Calendar, MapPin, ArrowUpRight, Sparkles, MessageSquare, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function EventsPage() {
  const posts = await getPosts();

  const formatDate = (date: string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
    });
  };

  const getPostTypeLabel = (type: string) => {
    if (type === 'event') return 'Événement';
    if (type === 'news') return 'Actualité';
    return type;
  };

  const getPostTypeColor = (type: string) => {
    if (type === 'event') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (type === 'news') return 'bg-[#662483]/10 text-[#662483] border-[#662483]/20';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-24 selection:bg-[#2CB8C5]/10">
      
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden bg-white border-b border-black/5 pt-20 pb-24 md:pt-28 md:pb-32">
        {/* Background visual elements */}
        <div className="absolute top-[-20%] right-[-10%] size-[600px] rounded-full bg-[#2CB8C5]/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] size-[500px] rounded-full bg-[#662483]/5 blur-[100px] animate-pulse delay-1000" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#3C3C3B 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="container relative mx-auto max-w-6xl px-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#662483]/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#662483] mb-8 shadow-sm">
            <Sparkles className="size-3.5" />
            Vivre la communauté
          </div>

          <h1 className="font-bricolage text-5xl md:text-7xl font-black text-[#3C3C3B] leading-[1.1] tracking-tight max-w-3xl">
            Événements <br />
            <span className="bg-linear-to-r from-[#2CB8C5] to-[#662483] bg-clip-text text-transparent">et actualités</span>
          </h1>

          <p className="mt-8 max-w-xl text-lg text-[#3C3C3B]/50 font-medium leading-relaxed">
            Ne manque aucune occasion de rencontrer le réseau et reste informé des dernières nouvelles de My Digital School.
          </p>

          <div className="mt-12 flex items-center gap-12">
             <div className="space-y-1">
                <p className="text-3xl font-black text-[#3C3C3B] font-bricolage">
                    {posts.filter(p => p.type === 'event').length}
                </p>
                <p className="text-[10px] font-black text-[#3C3C3B]/30 uppercase tracking-widest">Événements</p>
             </div>
             <div className="w-px h-10 bg-black/5" />
             <div className="space-y-1">
                <p className="text-3xl font-black text-[#3C3C3B] font-bricolage">
                    {posts.filter(p => p.type === 'news').length}
                </p>
                <p className="text-[10px] font-black text-[#3C3C3B]/30 uppercase tracking-widest">Actualités</p>
             </div>
          </div>
        </div>
      </section>

      {/* ─── Posts Grid ─── */}
      <section className="container mx-auto max-w-6xl px-4 mt-16">
        {posts.length === 0 ? (
          <div className="bg-white border border-dashed border-black/10 rounded-[40px] py-32 text-center flex flex-col items-center">
            <div className="size-20 rounded-3xl bg-[#F8F9FB] flex items-center justify-center mb-6 shadow-inner text-4xl">
              🎈
            </div>
            <h3 className="font-bricolage text-2xl font-black text-[#3C3C3B]">Aucun contenu pour le moment</h3>
            <p className="text-[#3C3C3B]/40 max-w-sm mt-2 font-medium">Reviens bientôt pour découvrir les prochains événements et actus de l&apos;école !</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link 
                key={post.id} 
                href={`/events/${post.id}`}
                className="group bg-white rounded-[40px] border border-black/5 overflow-hidden flex flex-col shadow-sm transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-2"
              >
                {/* Image Placeholder or Actual Image */}
                <div className="relative h-56 bg-gray-100 overflow-hidden">
                  {post.image_url ? (
                    <img src={post.image_url} alt={post.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-gray-50 to-gray-200 flex items-center justify-center opacity-50">
                        {post.type === 'event' ? <Calendar className="size-12 text-black/10" /> : <MessageSquare className="size-12 text-black/10" />}
                    </div>
                  )}
                  <div className={`absolute top-6 left-6 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${getPostTypeColor(post.type)}`}>
                    {getPostTypeLabel(post.type)}
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-1">
                  <h3 className="font-bricolage text-2xl font-black text-[#3C3C3B] leading-tight group-hover:text-[#2CB8C5] transition-colors mb-4">
                    {post.title}
                  </h3>
                  
                  <p className="text-sm text-[#3C3C3B]/50 line-clamp-2 leading-relaxed mb-8 flex-1">
                    {post.content}
                  </p>

                  <div className="space-y-3 pt-6 border-t border-black/5">
                    <div className="flex items-center gap-3 text-xs font-bold text-[#3C3C3B]/40 uppercase tracking-widest">
                       <Clock className="size-3.5 text-[#2CB8C5]" />
                       {formatDate(post.date || post.created_at)}
                    </div>
                    {post.location && (
                      <div className="flex items-center gap-3 text-xs font-bold text-[#3C3C3B]/40 uppercase tracking-widest truncate">
                         <MapPin className="size-3.5 text-[#662483]" />
                         {post.location}
                      </div>
                    )}
                  </div>

                  <div className="mt-8 pt-6">
                    <div className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[#3C3C3B] group-hover:gap-4 transition-all">
                      Découvrir
                      <ArrowUpRight className="size-4 text-[#2CB8C5]" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ─── Community Contribution ─── */}
      <section className="container mx-auto max-w-6xl px-4 mt-24">
        <div className="bg-[#3C3C3B] rounded-[48px] p-12 md:p-16 text-white overflow-hidden relative group">
           <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-125 transition-transform duration-700">
               <Sparkles className="size-32 text-[#2CB8C5]" />
           </div>
           
           <div className="relative z-10 max-w-2xl">
              <h2 className="font-bricolage text-3xl md:text-5xl font-black mb-6">Un événement à proposer ?</h2>
              <p className="text-white/50 text-lg font-medium mb-10 leading-relaxed">
                Tu organises un meetup, une conférence ou une soirée alumni ? Fais-en profiter toute la communauté MDS.
              </p>
              
              <Link 
                href="mailto:events@mydigitalschool.com" 
                className="inline-flex items-center gap-3 bg-white text-black px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#2CB8C5] hover:text-white transition-all shadow-xl shadow-black/20"
              >
                Nous contacter
                <ArrowUpRight className="size-4" />
              </Link>
           </div>
        </div>
      </section>
    </div>
  );
}
