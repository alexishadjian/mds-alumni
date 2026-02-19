import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Briefcase } from 'lucide-react';
import type { Profile } from '@/types';

type Props = { profile: Profile };

export const AlumniCard = ({ profile }: Props) => {
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Alumni';
  const initials = [profile.first_name?.[0], profile.last_name?.[0]]
    .filter(Boolean).join('').toUpperCase() || '?';

  return (
    <Link href={`/profile/${profile.id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-white border border-black/6 p-5 transition-all duration-300 hover:border-[#2CB8C5]/30 hover:shadow-xl hover:shadow-[#2CB8C5]/8 hover:-translate-y-1 h-full">
        {/* Accent gradient top bar */}
        <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-[#2CB8C5] to-[#662483] -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />

        {/* Subtle glow on hover */}
        <div className="absolute inset-0 bg-linear-to-br from-[#2CB8C5]/0 to-[#662483]/0 group-hover:from-[#2CB8C5]/2 group-hover:to-[#662483]/2 transition-all duration-300 rounded-2xl pointer-events-none" />

        <div className="relative flex items-start gap-3.5">
          <Avatar className="size-12 ring-2 ring-white shadow-md shrink-0">
            <AvatarImage src={profile.avatar_url ?? undefined} alt={name} />
            <AvatarFallback className="bg-linear-to-br from-[#2CB8C5]/20 to-[#662483]/20 text-[#3C3C3B] font-bold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="font-semibold text-[#3C3C3B] truncate text-sm group-hover:text-[#2CB8C5] transition-colors duration-200">
              {name}
            </h3>
            {profile.promotion_year && (
              <span className="text-xs font-medium text-[#2CB8C5]/80">{profile.promotion_year.label}</span>
            )}
          </div>
        </div>

        <div className="relative mt-3.5 space-y-1.5">
          {profile.programs && (
            <p className="text-xs font-semibold text-[#662483]/70 truncate tracking-wide uppercase">
              {profile.programs.name}
            </p>
          )}
          {(profile.current_job_title || profile.current_company) && (
            <div className="flex items-center gap-1.5 text-xs text-[#3C3C3B]/55">
              <Briefcase className="size-3 shrink-0 text-[#3C3C3B]/30" />
              <span className="truncate">{[profile.current_job_title, profile.current_company].filter(Boolean).join(' · ')}</span>
            </div>
          )}
          {(profile.location_city || profile.location_country) && (
            <div className="flex items-center gap-1.5 text-xs text-[#3C3C3B]/45">
              <MapPin className="size-3 shrink-0 text-[#3C3C3B]/25" />
              <span>{[profile.location_city, profile.location_country].filter(Boolean).join(', ')}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
