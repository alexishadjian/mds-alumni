import { getStats } from '@/lib/actions/stats';
import { 
  Users, GraduationCap, Briefcase, TrendingUp, 
  Target, Award, Globe, ArrowUpRight, BarChart3
} from 'lucide-react';

export default async function StatsPage() {
  const stats = await getStats();

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-[#3C3C3B] overflow-hidden selection:bg-[#2CB8C5]/10">
      {/* ─── Light Ambient Background ─── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] size-[600px] rounded-full bg-[#2CB8C5]/5 blur-[120px]" />
        <div className="absolute bottom-[5%] right-[-5%] size-[500px] rounded-full bg-[#662483]/5 blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="container relative mx-auto max-w-7xl px-4 py-16 md:py-24">
        
        {/* ─── Header ─── */}
        <div className="mb-20 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-black/5 shadow-sm">
            <BarChart3 className="size-3.5 text-[#2CB8C5]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3C3C3B]/40">Observatoire Alumni</span>
          </div>
          <h1 className="font-bricolage text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-[#3C3C3B]">
            Statistiques <span className="bg-linear-to-r from-[#2CB8C5] to-[#662483] bg-clip-text text-transparent">de l&apos;école</span>
          </h1>
          <p className="text-[#3C3C3B]/50 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
            Découvrez l&apos;évolution de notre communauté et l&apos;excellence du parcours professionnel de nos diplômés My Digital School.
          </p>
        </div>

        {/* ─── Top Level KPIs ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Membres Actifs", value: stats.totalMembers, icon: Users, color: "text-[#2CB8C5]", bg: "bg-[#2CB8C5]/10" },
            { label: "Diplômés", value: stats.alumniCount, icon: GraduationCap, color: "text-[#662483]", bg: "bg-[#662483]/10" },
            { label: "Taux d'insertion", value: `${stats.insertionRate}%`, icon: Target, color: "text-emerald-500", bg: "bg-emerald-50" },
            { label: "Partenaires", value: "42", icon: Globe, color: "text-blue-500", bg: "bg-blue-50" },
          ].map((kpi, i) => (
            <div key={i} className="group relative bg-white border border-black/5 rounded-[32px] p-8 shadow-sm transition-all hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1">
              <div className={`size-12 ${kpi.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                <kpi.icon className={`size-6 ${kpi.color}`} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#3C3C3B]/30 mb-2">{kpi.label}</p>
              <h3 className="text-5xl font-black font-bricolage text-[#3C3C3B]">{kpi.value}</h3>
              <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-lg">
                <TrendingUp className="size-3" />
                +12.5% vs 2024
              </div>
            </div>
          ))}
        </div>

        {/* ─── Main Content ─── */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left: Contract Distribution */}
          <div className="lg:col-span-5 bg-white border border-black/5 rounded-[40px] p-10 shadow-sm flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-12">
                <h4 className="text-sm font-black uppercase tracking-[0.2em] text-[#3C3C3B]/40">Type de contrats</h4>
                <Briefcase className="size-5 text-[#2CB8C5]/40" />
            </div>
            
            <div className="relative size-64 mb-12">
              <svg className="size-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="transparent" stroke="#F3F4F6" strokeWidth="10" />
                <circle 
                  cx="50" cy="50" r="42" fill="transparent" 
                  stroke="#2CB8C5" strokeWidth="10" 
                  strokeDasharray="263.9" 
                  strokeDashoffset={263.9 * (1 - 0.72)} 
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                <circle 
                  cx="50" cy="50" r="42" fill="transparent" 
                  stroke="#662483" strokeWidth="10" 
                  strokeDasharray="263.9" 
                  strokeDashoffset={263.9 * (1 - 0.35)} 
                  strokeLinecap="round"
                  className="opacity-20"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black font-bricolage text-[#3C3C3B]">85%</span>
                <span className="text-[10px] font-black text-[#3C3C3B]/30 uppercase tracking-widest">En poste</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 w-full">
              {stats.contractDistribution.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-[#F8F9FB] border border-black/5 group hover:bg-white hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="size-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-bold text-[#3C3C3B]/70 uppercase tracking-wider">{item.label}</span>
                  </div>
                  <span className="font-black text-[#3C3C3B]">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Programs */}
          <div className="lg:col-span-7 bg-white border border-black/5 rounded-[40px] p-10 shadow-sm">
            <div className="flex items-center justify-between mb-12">
              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-[#3C3C3B]/40">Top Filières</h4>
              <Award className="size-5 text-[#662483]/40" />
            </div>

            <div className="space-y-8">
              {stats.programDistribution.map((prog, i) => (
                <div key={i} className="space-y-3 group">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-xl bg-[#F8F9FB] flex items-center justify-center text-xs font-black text-[#3C3C3B]/30 group-hover:bg-[#2CB8C5]/10 group-hover:text-[#2CB8C5] transition-colors">
                            0{i+1}
                        </div>
                        <p className="text-sm font-black text-[#3C3C3B] group-hover:translate-x-1 transition-transform">{prog.name}</p>
                    </div>
                    <span className="text-xl font-black font-bricolage text-[#3C3C3B]">{prog.percentage}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-[#F3F4F6] rounded-full overflow-hidden p-0.5">
                    <div 
                      className="h-full bg-linear-to-r from-[#2CB8C5] to-[#662483] rounded-full transition-all duration-1000 delay-300" 
                      style={{ width: `${prog.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 p-8 rounded-[32px] bg-[#3C3C3B] text-white flex items-center justify-between group cursor-pointer hover:bg-black transition-all shadow-xl shadow-black/10">
              <div className="flex items-center gap-5">
                <div className="size-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md group-hover:rotate-12 transition-transform">
                  <TrendingUp className="size-7 text-[#2CB8C5]" />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-widest text-[#2CB8C5]">Rapport Annuel</p>
                  <p className="text-lg text-white/70 font-medium">Analyse complète de l&apos;année 2025</p>
                </div>
              </div>
              <div className="size-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-[#2CB8C5] group-hover:border-[#2CB8C5] transition-all">
                <ArrowUpRight className="size-6 group-hover:text-black transition-colors" />
              </div>
            </div>
          </div>

        </div>

        {/* ─── Bottom History ─── */}
        <div className="mt-8 bg-white border border-black/5 rounded-[40px] p-10 shadow-sm">
          <div className="flex items-center gap-4 mb-12">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-[#3C3C3B]/40">Évolution des promotions</h4>
            <div className="h-px flex-1 bg-black/5" />
          </div>
          
          <div className="flex items-end justify-between h-48 gap-3 md:gap-6">
            {stats.promotionHistory.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                <div className="relative w-full">
                  <div 
                    className="w-full bg-[#F3F4F6] rounded-t-2xl group-hover:bg-[#2CB8C5]/20 transition-all duration-500 relative"
                    style={{ height: `${(item.count / 25) * 100}%` }}
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-[#2CB8C5] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black text-[#2CB8C5]">
                      {item.count}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-black text-[#3C3C3B]/30 group-hover:text-[#2CB8C5] transition-colors">{item.year}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
