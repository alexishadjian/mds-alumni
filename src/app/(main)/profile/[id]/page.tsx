import { notFound } from 'next/navigation';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { getProfileById } from '@/lib/actions/profile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  MapPin, Briefcase, Mail, ExternalLink,
  GraduationCap, Pencil, Calendar,
} from 'lucide-react';
import type { EducationExperience, ProfessionalExperience } from '@/types';

type Props = { params: Promise<{ id: string }> };

/** Single timeline row for pro or education */
const TimelineItem = ({
  title, subtitle, period, description, color,
}: {
  title: string;
  subtitle?: string | null;
  period: string;
  description?: string | null;
  color: 'blue' | 'violet';
}) => (
  <div className="relative flex gap-4 pb-7 last:pb-0 group/item">
    <div className="flex flex-col items-center">
      <div className={`size-2.5 rounded-full mt-1 shrink-0 shadow-sm ring-4 ${
        color === 'blue'
          ? 'bg-[#2CB8C5] ring-[#2CB8C5]/15'
          : 'bg-[#662483] ring-[#662483]/15'
      }`} />
      <div className="w-px flex-1 bg-linear-to-b from-black/10 to-transparent mt-2" />
    </div>
    <div className="flex-1 min-w-0 -mt-0.5">
      <p className="font-semibold text-[#3C3C3B] text-sm leading-snug">{title}</p>
      {subtitle && <p className="text-sm text-[#3C3C3B]/60 mt-0.5">{subtitle}</p>}
      <div className="mt-1.5 flex items-center gap-1.5">
        <Calendar className="size-3 text-[#3C3C3B]/25 shrink-0" />
        <span className="text-xs text-[#3C3C3B]/40">{period}</span>
      </div>
      {description && (
        <p className="mt-2 text-sm text-[#3C3C3B]/55 leading-relaxed">{description}</p>
      )}
    </div>
  </div>
);

const formatDate = (d: string | null | undefined): string => {
  if (!d) return '?';
  const [y, m] = d.split('-');
  const months = ['jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sep.', 'oct.', 'nov.', 'déc.'];
  return m ? `${months[parseInt(m) - 1]} ${y}` : y;
};

export default async function ProfilePage({ params }: Props) {
  const { id } = await params;
  const profile = await getProfileById(id);
  if (!profile) notFound();

  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  const canEdit = user && (
    user.id === profile.id ||
    (await supabase.from('profiles').select('role').eq('id', user.id).single()).data?.role === 'admin'
  );

  const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Alumni';
  const initials = [profile.first_name?.[0], profile.last_name?.[0]]
    .filter(Boolean).join('').toUpperCase() || '?';

  const hasPro = (profile.professional_experiences?.length ?? 0) > 0;
  const hasEdu = (profile.education_experiences?.length ?? 0) > 0;

  const isRestricted = profile.visibility === 'private' || (profile.visibility === 'community' && !user);

  return (
    <div className="min-h-screen bg-gray-50/60">
      {/* Hero cover */}
      <div
        className="relative h-52 md:h-64 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #2CB8C5 0%, #1a9baa 35%, #662483 100%)',
        }}
      >
        {/* Dot grid pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* Edit button */}
        {canEdit && (
          <div className="absolute top-4 right-4 z-10">
            <Button asChild size="sm" variant="secondary" className="rounded-full gap-1.5 shadow-md">
              <Link href={user.id === profile.id ? '/profile/edit' : `/profile/edit?id=${profile.id}`}>
                <Pencil className="size-3.5" />
                Modifier le profil
              </Link>
            </Button>
          </div>
        )}
      </div>

      <div className="container mx-auto max-w-5xl px-4">
        {/* Identity strip */}
        <div className="relative -mt-14 mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
          <Avatar className="size-28 ring-4 ring-white shadow-xl sm:size-32 shrink-0">
            <AvatarImage src={profile.avatar_url ?? undefined} alt={name} />
            <AvatarFallback className="bg-linear-to-br from-[#2CB8C5] to-[#662483] text-white text-3xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 pb-1 sm:pb-2 min-w-0">
            <h1 className="font-bricolage text-2xl font-bold text-[#3C3C3B] sm:text-3xl truncate">{name}</h1>
            {(profile.current_job_title || profile.current_company) && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-[#3C3C3B]/60">
                <Briefcase className="size-3.5 shrink-0" />
                {[profile.current_job_title, profile.current_company].filter(Boolean).join(' · ')}
              </p>
            )}
            {(profile.location_city || profile.location_country) && (
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-[#3C3C3B]/45">
                <MapPin className="size-3.5 shrink-0" />
                {[profile.location_city, profile.location_country].filter(Boolean).join(', ')}
              </p>
            )}
          </div>

          {/* CTA links */}
          <div className="flex flex-wrap items-center gap-2 pb-1">
            {profile.email && (
              <Button variant="outline" size="sm" asChild className="rounded-full gap-1.5 border-black/10 hover:border-[#2CB8C5] hover:text-[#2CB8C5]">
                <a href={`mailto:${profile.email}`}>
                  <Mail className="size-3.5" />
                  Email
                </a>
              </Button>
            )}
            {profile.linkedin_url && (
              <Button size="sm" asChild className="rounded-full gap-1.5 bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white shadow-md shadow-[#0A66C2]/20">
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-3.5" />
                  LinkedIn
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="grid gap-6 pb-16 lg:grid-cols-3">
          {isRestricted && !canEdit ? (
            <div className="lg:col-span-3">
              <div className="rounded-3xl bg-white border border-black/6 p-12 text-center shadow-sm">
                <div className="mx-auto size-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 text-3xl">
                  🔒
                </div>
                <h2 className="text-xl font-bold text-[#3C3C3B] mb-2">Profil privé</h2>
                <p className="text-[#3C3C3B]/50 max-w-sm mx-auto">
                  {profile.visibility === 'private' 
                    ? "Cet utilisateur a choisi de garder son profil privé." 
                    : "Ce profil est réservé aux membres de la communauté My Digital School. Connectez-vous pour voir les détails."}
                </p>
                {profile.visibility === 'community' && !user && (
                  <Button asChild className="mt-6 rounded-full bg-[#2CB8C5] hover:bg-[#2CB8C5]/90">
                    <Link href="/login">Se connecter</Link>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Sidebar */}
              <div className="space-y-4 lg:col-span-1">
            {profile.bio && (
              <div className="rounded-2xl bg-white border border-black/6 p-5">
                <h2 className="font-semibold text-sm uppercase tracking-wider mb-3 text-[#3C3C3B]/50">
                  À propos
                </h2>
                <p className="text-sm text-[#3C3C3B]/65 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            <div className="rounded-2xl bg-white border border-black/6 p-5">
              <h2 className="font-semibold text-sm uppercase tracking-wider mb-4 text-[#3C3C3B]/50">
                Informations
              </h2>
              <div className="space-y-3.5">
                {profile.promotion_year && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="size-8 rounded-xl bg-[#2CB8C5]/10 flex items-center justify-center shrink-0">
                      <span className="text-base">🎓</span>
                    </div>
                    <div>
                      <p className="text-xs text-[#3C3C3B]/40">Promotion</p>
                      <p className="font-semibold text-[#3C3C3B]">{profile.promotion_year.label}</p>
                    </div>
                  </div>
                )}
                {profile.programs && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="size-8 rounded-xl bg-[#662483]/10 flex items-center justify-center shrink-0">
                      <span className="text-base">📚</span>
                    </div>
                    <div>
                      <p className="text-xs text-[#3C3C3B]/40">Programme</p>
                      <p className="font-semibold text-[#3C3C3B]">{profile.programs.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main — timelines */}
          <div className="space-y-5 lg:col-span-2">
            {hasPro && (
              <div className="rounded-2xl bg-white border border-black/6 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="size-9 rounded-xl bg-[#2CB8C5]/10 flex items-center justify-center shrink-0">
                    <Briefcase className="size-4 text-[#2CB8C5]" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-[#3C3C3B]">Expériences professionnelles</h2>
                    <p className="text-xs text-[#3C3C3B]/40">{profile.professional_experiences!.length} poste{profile.professional_experiences!.length > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="pl-1">
                  {profile.professional_experiences!.map((p: ProfessionalExperience) => (
                    <TimelineItem
                      key={p.id}
                      title={p.job_title}
                      subtitle={p.company_name}
                      period={`${formatDate(p.start_date)} – ${p.end_date ? formatDate(p.end_date) : 'Présent'}`}
                      description={p.description}
                      color="blue"
                    />
                  ))}
                </div>
              </div>
            )}

            {hasEdu && (
              <div className="rounded-2xl bg-white border border-black/6 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="size-9 rounded-xl bg-[#662483]/10 flex items-center justify-center shrink-0">
                    <GraduationCap className="size-4 text-[#662483]" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-[#3C3C3B]">Formation</h2>
                    <p className="text-xs text-[#3C3C3B]/40">{profile.education_experiences!.length} formation{profile.education_experiences!.length > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="pl-1">
                  {profile.education_experiences!.map((e: EducationExperience) => (
                    <TimelineItem
                      key={e.id}
                      title={e.school_name}
                      subtitle={e.program}
                      period={`${e.start_year ?? '?'} – ${e.end_year ?? 'Présent'}`}
                      description={e.description}
                      color="violet"
                    />
                  ))}
                </div>
              </div>
            )}

            {!hasPro && !hasEdu && (
              <div className="rounded-2xl bg-white border border-black/6 p-10 text-center">
                <p className="text-[#3C3C3B]/30 text-sm">Aucun parcours renseigné pour le moment.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  </div>
</div>
  );
}
