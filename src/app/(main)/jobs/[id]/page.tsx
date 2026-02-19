import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getJobById } from '@/lib/actions/jobs';
import { Button } from '@/components/ui/button';
import {
  Briefcase, MapPin, Calendar, ArrowLeft,
  Share2, ArrowUpRight, CheckCircle2,
  Coins, UserCircle, Home, Clock, Heart, Sparkles,
  Bookmark, Send
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

type Props = { params: Promise<{ id: string }> };

export default async function JobDetailsPage({ params }: Props) {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) notFound();

  const formatDate = (date: string | null) => {
    if (!date) return 'Récemment';
    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getContractLabel = (type: string) => {
    return type.toUpperCase();
  };

  const getRemoteLabel = (policy: string | null) => {
    if (policy === 'full') return '100% Télétravail';
    if (policy === 'hybrid') return 'Hybride';
    if (policy === 'on-site') return 'Sur site';
    return 'Non précisé';
  };

  const getExperienceLabel = (level: string | null) => {
    if (level === 'junior') return 'Junior (0-2 ans)';
    if (level === 'intermediate') return 'Confirmé (2-5 ans)';
    if (level === 'senior') return 'Senior (5+ ans)';
    return 'Tous profils';
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-24 selection:bg-[#2CB8C5]/20">
      {/* ─── Breadcrumbs & Actions ─── */}
      <div className="bg-white border-b border-black/5">
        <div className="container mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link 
            href="/jobs" 
            className="flex items-center gap-2 text-[#3C3C3B]/40 hover:text-[#3C3C3B] transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <ArrowLeft className="size-4" />
            Retour aux offres
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="rounded-xl h-9 gap-2 text-[#3C3C3B]/60 font-bold hover:bg-black/5">
              <Bookmark className="size-4" /> Sauvegarder
            </Button>
            <Button variant="ghost" size="sm" className="rounded-xl h-9 gap-2 text-[#3C3C3B]/60 font-bold hover:bg-black/5">
              <Share2 className="size-4" /> Partager
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 mt-8">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* ─── Main Content (Left) ─── */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Header Card */}
            <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-black/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Sparkles className="size-32 text-[#2CB8C5]" />
                </div>
                
                <div className="flex flex-col gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <Avatar className="size-16 rounded-2xl bg-gray-50 text-xl font-bold text-[#3C3C3B] shadow-inner border border-black/5">
                        <AvatarFallback className="bg-linear-to-br from-[#2CB8C5]/10 to-[#662483]/10">
                            {job.company_name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="font-bricolage text-xl font-bold text-[#3C3C3B]">{job.company_name}</h2>
                            <p className="text-sm text-[#2CB8C5] font-bold uppercase tracking-widest mt-0.5">{job.sector}</p>
                        </div>
                    </div>

                    <h1 className="font-bricolage text-4xl md:text-5xl lg:text-6xl font-black text-[#3C3C3B] leading-[1.1] tracking-tight">
                        {job.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                         <span className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-100">
                            {getContractLabel(job.contract_type)}
                        </span>
                        <span className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100">
                             {getRemoteLabel(job.remote_policy)}
                        </span>
                        <span className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-black/5 text-[#3C3C3B]/60 border border-black/5">
                            Publié le {formatDate(job.created_at)}
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. Key Info Grid (WTTG Style) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: Briefcase, label: "Contrat", value: getContractLabel(job.contract_type), color: "text-[#2CB8C5]" },
                    { icon: MapPin, label: "Lieu", value: job.exact_location || job.location || "Remote", color: "text-[#662483]" },
                    { icon: Coins, label: "Salaire", value: job.salary_min ? `${job.salary_min}-${job.salary_max}k€` : "N/C", color: "text-amber-500" },
                    { icon: UserCircle, label: "Expérience", value: getExperienceLabel(job.experience_level), color: "text-blue-500" },
                ].map((item, i) => (
                    <div key={i} className="bg-white rounded-[24px] p-5 border border-black/5 shadow-sm transition-all hover:shadow-md group">
                        <item.icon className={`size-5 ${item.color} mb-3 group-hover:scale-110 transition-transform`} />
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#3C3C3B]/30 mb-1">{item.label}</p>
                        <p className="text-sm font-bold text-[#3C3C3B] truncate">{item.value}</p>
                    </div>
                ))}
            </div>

            {/* 3. Description Section */}
            <div className="bg-white rounded-[40px] p-8 md:p-12 border border-black/5 shadow-sm">
                <div className="flex items-center gap-4 mb-10">
                    <div className="size-12 rounded-2xl bg-[#3C3C3B]/5 flex items-center justify-center">
                        <ArrowUpRight className="size-6 text-[#3C3C3B]" />
                    </div>
                    <h2 className="font-bricolage text-3xl font-black text-[#3C3C3B]">Le poste</h2>
                </div>
                
                <div className="prose prose-lg prose-gray max-w-none text-[#3C3C3B]/70 leading-relaxed font-medium">
                    {job.description}
                </div>
            </div>

             {/* 4. Benefits Section */}
             {job.benefits && job.benefits.length > 0 && (
                <div className="bg-white rounded-[40px] p-8 md:p-12 border border-black/5 shadow-sm">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="size-12 rounded-2xl bg-rose-50 flex items-center justify-center">
                            <Heart className="size-6 text-rose-500" />
                        </div>
                        <h2 className="font-bricolage text-3xl font-black text-[#3C3C3B]">Les avantages</h2>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                        {job.benefits.map((benefit: string, i: number) => (
                            <div key={i} className="flex items-center gap-4 p-5 rounded-[20px] bg-[#f8f9fc] border border-black/5 transition-all hover:bg-white hover:shadow-md hover:scale-[1.02]">
                                <div className="size-8 rounded-full bg-white flex items-center justify-center border border-black/5 text-[#2CB8C5] shadow-sm">
                                    <CheckCircle2 className="size-4" />
                                </div>
                                <span className="font-bold text-[#3C3C3B] text-sm">{benefit}</span>
                            </div>
                        ))}
                    </div>
                </div>
             )}
          </div>

          {/* ─── Sidebar (Right) ─── */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Sticky Application Card */}
            <div className="sticky top-8 space-y-6">
                <div className="bg-[#3C3C3B] rounded-[40px] p-8 text-white shadow-2xl shadow-black/20 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-125 transition-transform duration-700">
                        <Send className="size-24 text-[#2CB8C5]" />
                    </div>

                    <div className="relative z-10">
                        <h3 className="font-bricolage text-2xl font-black mb-2">Prêt(e) à postuler ?</h3>
                        <p className="text-white/50 text-sm font-medium mb-8 leading-relaxed">
                            Tes informations de profil MDS seront transmises si tu postules via la plateforme.
                        </p>

                        <div className="space-y-3">
                            <Button asChild className="w-full h-14 rounded-2xl bg-[#2CB8C5] hover:bg-[#2CB8C5]/90 text-white font-black uppercase tracking-widest text-xs transition-all hover:-translate-y-1 shadow-lg shadow-[#2CB8C5]/20">
                                <a href={job.apply_url || '#'} target="_blank" rel="noopener noreferrer">
                                    Envoyer ma candidature
                                    <ArrowUpRight className="ml-2 size-4" />
                                </a>
                            </Button>
                            <p className="text-center text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">Lien externe sécurisé</p>
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-white rounded-[32px] p-8 border border-black/5 shadow-sm">
                    <h4 className="font-bold text-[#3C3C3B] mb-6 flex items-center gap-2">
                        <Clock className="size-4 text-[#2CB8C5]" />
                        Détails du process
                    </h4>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="size-8 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 font-bold text-xs text-[#3C3C3B]/30">1</div>
                            <div>
                                <p className="text-sm font-bold text-[#3C3C3B]">Candidature</p>
                                <p className="text-xs text-[#3C3C3B]/40 mt-0.5">Tes infos sont envoyées au recruteur</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="size-8 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 font-bold text-xs text-[#3C3C3B]/30">2</div>
                            <div>
                                <p className="text-sm font-bold text-[#3C3C3B]">Entretien</p>
                                <p className="text-xs text-[#3C3C3B]/40 mt-0.5">Le recruteur te recontacte par mail</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-10 pt-8 border-t border-black/5 flex items-center gap-4 text-[#3C3C3B]/30">
                        <Home className="size-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Télétravail autorisé</span>
                    </div>
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
