import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostById } from '@/lib/actions/posts';
import { 
  ArrowLeft, Calendar, MapPin, Share2, 
  ArrowUpRight, Sparkles, MessageSquare, 
  Trophy, Globe, Zap, Heart, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = { params: Promise<{ id: string }> };

export default async function EventDetailsPage({ params }: Props) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) notFound();

  const formatDate = (date: string | null) => {
    if (!date) return 'Prochainement';
    const d = new Date(date);
    return {
      day: d.toLocaleDateString('fr-FR', { day: '2-digit' }),
      month: d.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase().replace('.', ''),
      full: d.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const dateInfo = formatDate(post.date);

  return (
    <div className="min-h-screen bg-white text-[#3C3C3B] selection:bg-[#2CB8C5] selection:text-white overflow-x-hidden">
      
      {/* ─── Artistic Hero Header ─── */}
      <section className="relative h-[85vh] flex flex-col justify-end overflow-hidden">
        
        {/* Abstract Background Engine */}
        <div className="absolute inset-0 z-0">
          {post.image_url ? (
            <div className="relative h-full w-full">
                <img 
                    src={post.image_url} 
                    alt={post.title} 
                    className="h-full w-full object-cover scale-105 blur-[2px] brightness-[0.85]" 
                />
                <div className="absolute inset-0 bg-linear-to-t from-white via-white/40 to-transparent" />
            </div>
          ) : (
            <div className="h-full w-full bg-[#F8F9FB]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[800px] rounded-full bg-linear-to-tr from-[#2CB8C5]/20 via-[#662483]/10 to-transparent blur-[120px] animate-pulse" />
                <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#3C3C3B 2px, transparent 2px)', backgroundSize: '40px 40px' }} />
            </div>
          )}
        </div>

        {/* Floating Brutalist Badge */}
        <div className="container mx-auto px-4 relative z-10 pb-12">
           <div className="flex flex-col items-start gap-8">
                <Link 
                    href="/events" 
                    className="group flex items-center gap-3 bg-white/80 backdrop-blur-xl border border-black/5 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-[#3C3C3B] hover:text-white transition-all shadow-xl shadow-black/5"
                >
                    <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                    Retour
                </Link>

                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#2CB8C5] text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-lg shadow-[#2CB8C5]/30">
                        <Sparkles className="size-3.5 fill-white" />
                        {post.type === 'event' ? 'MDS EVENT' : 'MDS INSIDE'}
                    </div>
                    
                    <h1 className="font-bricolage text-6xl md:text-8xl lg:text-[10rem] font-black leading-[0.85] tracking-tighter text-[#3C3C3B] break-words">
                        {post.title.split(' ').map((word, i) => (
                            <span key={i} className={i % 2 === 1 ? 'text-[#2CB8C5] block' : 'block'}>
                                {word}
                            </span>
                        ))}
                    </h1>
                </div>
           </div>
        </div>

        {/* Vertical Date Pillar */}
        <div className="absolute right-0 top-0 h-full w-32 border-l border-black/5 hidden lg:flex flex-col items-center justify-center gap-12 bg-white/30 backdrop-blur-md">
            <div className="rotate-90 origin-center whitespace-nowrap text-[10px] font-black uppercase tracking-[1em] text-[#3C3C3B]/20">
                MY DIGITAL SCHOOL ALUMNI
            </div>
            <div className="flex flex-col items-center">
                <span className="text-5xl font-black font-bricolage leading-none">{typeof dateInfo === 'object' ? dateInfo.day : ''}</span>
                <span className="text-xs font-black bg-[#3C3C3B] text-white px-2 py-1 mt-1 rounded-md">{typeof dateInfo === 'object' ? dateInfo.month : ''}</span>
            </div>
            <div className="h-32 w-px bg-linear-to-b from-[#2CB8C5] to-transparent" />
        </div>
      </section>

      {/* ─── Core Content ─── */}
      <section className="container mx-auto px-4 py-24 relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
            
            {/* Left: Metadata & Actions */}
            <div className="lg:col-span-4 space-y-12">
                <div className="bg-[#F8F9FB] rounded-[40px] p-10 border border-black/5 space-y-8">
                    <div className="space-y-6">
                        <div className="flex items-start gap-5">
                            <div className="size-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-black/5 shrink-0">
                                <Clock className="size-5 text-[#2CB8C5]" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#3C3C3B]/30 mb-1">Date & Heure</p>
                                <p className="text-sm font-bold text-[#3C3C3B] leading-relaxed capitalize">{typeof dateInfo === 'object' ? dateInfo.full : dateInfo}</p>
                            </div>
                        </div>

                        {post.location && (
                            <div className="flex items-start gap-5">
                                <div className="size-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-black/5 shrink-0">
                                    <MapPin className="size-5 text-[#662483]" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#3C3C3B]/30 mb-1">Localisation</p>
                                    <p className="text-sm font-bold text-[#3C3C3B] leading-relaxed">{post.location}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-start gap-5">
                            <div className="size-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-black/5 shrink-0">
                                <Globe className="size-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#3C3C3B]/30 mb-1">Visibilité</p>
                                <p className="text-sm font-bold text-[#3C3C3B] leading-relaxed">Ouvert à toute la communauté</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-black/5 flex flex-col gap-4">
                        <Button className="w-full h-14 rounded-2xl bg-[#3C3C3B] hover:bg-[#2CB8C5] text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-black/10 transition-all hover:-translate-y-1">
                            S&apos;inscrire à l&apos;événement
                            <ArrowUpRight className="ml-2 size-4" />
                        </Button>
                        <Button variant="outline" className="w-full h-14 rounded-2xl border-black/5 bg-white hover:bg-[#F8F9FB] text-[#3C3C3B] font-black uppercase tracking-widest text-[10px]">
                            Partager
                            <Share2 className="ml-2 size-4" />
                        </Button>
                    </div>
                </div>

                <div className="p-10 border-2 border-dashed border-black/5 rounded-[40px] text-center">
                    <Heart className="size-8 text-[#662483] mx-auto mb-4 animate-pulse" />
                    <p className="text-xs font-bold text-[#3C3C3B]/40 uppercase tracking-[0.2em] leading-relaxed">
                        Cet événement est organisé par l&apos;équipe alumni de My Digital School.
                    </p>
                </div>
            </div>

            {/* Right: Rich Description */}
            <div className="lg:col-span-8">
                <div className="relative">
                    {/* Decorative side accent */}
                    <div className="absolute -left-8 top-0 bottom-0 w-px bg-linear-to-b from-[#2CB8C5] via-[#662483] to-transparent opacity-20 hidden md:block" />
                    
                    <div className="space-y-12">
                        <div className="inline-flex items-center gap-4 group cursor-default">
                             <div className="size-3 rounded-full bg-[#2CB8C5] group-hover:scale-150 transition-transform" />
                             <h2 className="font-bricolage text-3xl font-black text-[#3C3C3B]">Présentation</h2>
                        </div>

                        <div className="prose prose-2xl prose-gray max-w-none">
                            <p className="text-[#3C3C3B] font-medium leading-[1.6] whitespace-pre-wrap first-letter:text-6xl first-letter:font-black first-letter:text-[#2CB8C5] first-letter:mr-3 first-letter:float-left">
                                {post.content}
                            </p>
                        </div>

                        {/* Extra Visual Section */}
                        <div className="grid md:grid-cols-2 gap-6 pt-12">
                            {[
                                { icon: Zap, label: "Networking", text: "Échangez avec des profils variés et experts." },
                                { icon: Trophy, label: "Inspiration", text: "Découvrez des parcours et des idées neuves." },
                            ].map((feature, i) => (
                                <div key={i} className="p-8 rounded-[32px] bg-white border border-black/5 hover:border-[#2CB8C5]/30 transition-all group">
                                    <feature.icon className="size-8 text-[#2CB8C5] mb-6 group-hover:rotate-12 transition-transform" />
                                    <h4 className="font-black uppercase tracking-widest text-sm mb-2">{feature.label}</h4>
                                    <p className="text-sm text-[#3C3C3B]/50 font-medium leading-relaxed">{feature.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </section>

      {/* ─── Artistic Footer Section ─── */}
      <section className="container mx-auto px-4 py-32 border-t border-black/5">
         <div className="flex flex-col md:flex-row items-center justify-between gap-12 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
             <div className="font-bricolage text-5xl font-black tracking-tighter">
                MDS <span className="text-[#2CB8C5]">ALUMNI</span>
             </div>
             <div className="flex flex-wrap justify-center gap-8">
                {['Facebook', 'LinkedIn', 'Instagram', 'Twitter'].map(social => (
                    <span key={social} className="text-[10px] font-black uppercase tracking-[0.3em] cursor-pointer hover:text-[#2CB8C5] transition-colors">
                        {social}
                    </span>
                ))}
             </div>
         </div>
      </section>

    </div>
  );
}
