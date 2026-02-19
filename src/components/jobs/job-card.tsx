'use client';

import { Job } from '@/types';
import { MapPin, Globe, Calendar, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface JobCardProps {
  job: Job;
}

const contractConfig: Record<string, { label: string, color: string, bg: string, border: string }> = {
  cdi: { label: 'CDI', color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-200' },
  cdd: { label: 'CDD', color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-200' },
  freelance: { label: 'Freelance', color: 'text-purple-700', bg: 'bg-purple-100', border: 'border-purple-200' },
  stage: { label: 'Stage', color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-200' },
  alternance: { label: 'Alternance', color: 'text-indigo-700', bg: 'bg-indigo-100', border: 'border-indigo-200' },
};

export function JobCard({ job }: JobCardProps) {
  const config = contractConfig[job.contract_type as string] || { label: job.contract_type, color: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-200' };
  
  const formatDate = (date: string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  };

  return (
    <div className="group relative flex flex-col h-full rounded-[32px] bg-white border border-black/8 p-7 transition-all duration-500 hover:border-[#2CB8C5]/40 hover:shadow-[0_20px_50px_rgba(44,184,197,0.12)] hover:-translate-y-1.5">
      {/* Clickable Area Wrapper */}
      <Link href={`/jobs/${job.id}`} className="flex flex-col flex-1">
        {/* Top row: Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className={`px-3.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${config.bg} ${config.color} ${config.border}`}>
            {config.label}
          </span>
          {job.sector && (
            <span className="px-3.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-black/5 bg-[#3C3C3B]/5 text-[#3C3C3B]/60">
              {job.sector}
            </span>
          )}
        </div>

        {/* Main Info */}
        <div className="flex-1">
          <h3 className="font-bricolage text-xl font-bold text-[#3C3C3B] group-hover:text-[#2CB8C5] transition-colors leading-tight mb-2">
            {job.title}
          </h3>
          
          <div className="flex items-center gap-2 text-[#3C3C3B]/60 mb-4">
            <div className="size-8 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
              <Globe className="size-4" />
            </div>
            <span className="font-semibold text-sm">{job.company_name}</span>
          </div>

          <div className="space-y-2.5 mb-6">
            <div className="flex items-center gap-2 text-xs text-[#3C3C3B]/45">
              <MapPin className="size-3.5 text-[#2CB8C5]" />
              <span>{job.location || 'Localisation non précisée'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#3C3C3B]/45">
              <Calendar className="size-3.5 text-[#662483]" />
              <span>Publié le {formatDate(job.created_at)}</span>
            </div>
          </div>

          <p className="text-sm text-[#3C3C3B]/55 line-clamp-3 leading-relaxed mb-6">
            {job.description}
          </p>
        </div>
      </Link>

      {/* Footer */}
      <div className="pt-6 border-t border-black/5 mt-auto">
        <Button 
          asChild 
          className="w-full rounded-2xl bg-[#3C3C3B] hover:bg-[#2CB8C5] text-white font-bold h-11 transition-all group/btn shadow-md shadow-black/5"
        >
          <Link href={`/jobs/${job.id}`} className="flex items-center justify-center gap-2">
            Voir l&apos;offre
            <ArrowUpRight className="size-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </Link>
        </Button>
      </div>

      {/* Accent gradient bar */}
      <div className="absolute inset-x-8 -bottom-px h-px bg-linear-to-r from-transparent via-[#2CB8C5]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
