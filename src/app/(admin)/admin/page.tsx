import Link from 'next/link';
import { cookies } from 'next/headers';
import { ArrowRight, CalendarDays, GraduationCap, Users, UserCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/server';
import { getLinkedInTokenInfo } from '@/lib/actions/settings';

interface DashboardMember {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  created_at: string;
  promotion_year: { color: string | null } | { color: string | null }[] | null;
}

const getInitials = (member: DashboardMember) => {
  if (member.first_name && member.last_name) {
    return `${member.first_name[0]}${member.last_name[0]}`.toUpperCase();
  }
  return member.email.slice(0, 2).toUpperCase();
};

const formatMemberName = (member: DashboardMember) => {
  if (member.first_name || member.last_name) {
    return [member.first_name, member.last_name].filter(Boolean).join(' ');
  }
  return member.email;
};

const getPromotionColor = (member: DashboardMember): string | null => {
  const p = member.promotion_year;
  if (!p) return null;
  const obj = Array.isArray(p) ? p[0] : p;
  return obj?.color ?? null;
};

const getAvatarStyle = (member: DashboardMember) => {
  const color = getPromotionColor(member);
  if (!color) return { backgroundColor: 'rgba(156,163,175,0.12)', color: '#9ca3af' };
  return { backgroundColor: `${color}18`, color };
};

export default async function AdminPage() {
  const supabase = createClient(await cookies());

  const tokenInfo = await getLinkedInTokenInfo().catch(() => null);

  const [
    { count: membersCount },
    { count: alumniCount },
    { count: studentsCount },
    { count: promotionsCount },
    { data: recentMembers },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'alumni'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('promotion_year').select('*', { count: 'exact', head: true }),
    supabase
      .from('profiles')
      .select('id, email, first_name, last_name, role, created_at, promotion_year(color)')
      .neq('role', 'admin')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const stats = [
    {
      label: 'Membres',
      value: membersCount ?? 0,
      icon: Users,
      accent: '#2CB8C5',
      bg: 'bg-[#2CB8C5]/8',
      iconColor: 'text-[#2CB8C5]',
      border: 'border-l-[#2CB8C5]',
    },
    {
      label: 'Alumni',
      value: alumniCount ?? 0,
      icon: GraduationCap,
      accent: '#662483',
      bg: 'bg-[#662483]/8',
      iconColor: 'text-[#662483]',
      border: 'border-l-[#662483]',
    },
    {
      label: 'Étudiants',
      value: studentsCount ?? 0,
      icon: UserCheck,
      accent: '#2CB8C5',
      bg: 'bg-[#2CB8C5]/8',
      iconColor: 'text-[#2CB8C5]',
      border: 'border-l-[#2CB8C5]',
    },
    {
      label: 'Promotions',
      value: promotionsCount ?? 0,
      icon: CalendarDays,
      accent: '#662483',
      bg: 'bg-[#662483]/8',
      iconColor: 'text-[#662483]',
      border: 'border-l-[#662483]',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-[#2CB8C5]">
          Vue d&apos;ensemble
        </p>
        <h1 className="font-bricolage text-3xl font-bold text-[#3C3C3B]">Dashboard</h1>
        <p className="mt-1 text-sm text-[#3C3C3B]/45">
          Statistiques de la communauté et raccourcis d&apos;administration.
        </p>
      </div>

      {/* LinkedIn token alert */}
      {tokenInfo?.status === 'expired' && (
        <Link
          href="/admin/settings"
          className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 transition-colors hover:bg-red-100/60"
        >
          <AlertTriangle className="size-5 shrink-0 text-red-500" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-red-800">
              Tokens LinkedIn expirés
            </p>
            <p className="text-xs text-red-600">
              Le scraping est arrêté. Cliquez pour mettre à jour les tokens.
            </p>
          </div>
          <ArrowRight className="size-4 shrink-0 text-red-400" />
        </Link>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`group relative overflow-hidden rounded-2xl border border-black/6 bg-white border-l-4 ${stat.border} shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
          >
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#3C3C3B]/40">
                    {stat.label}
                  </p>
                  <p className="mt-2 font-bricolage text-3xl font-bold text-[#3C3C3B]">
                    {stat.value}
                  </p>
                </div>
                <div className={`rounded-xl p-2.5 ${stat.bg}`}>
                  <stat.icon className={`size-5 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Recent members */}
        <div className="overflow-hidden rounded-2xl border border-black/6 bg-white shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
            <div>
              <h2 className="font-bricolage text-base font-semibold text-[#3C3C3B]">
                Derniers membres
              </h2>
              <p className="text-xs text-[#3C3C3B]/40">Inscrits récemment</p>
            </div>
            <Button
              asChild
              size="sm"
              variant="ghost"
              className="gap-1.5 text-[#2CB8C5] hover:bg-[#2CB8C5]/8 hover:text-[#2CB8C5]"
            >
              <Link href="/admin/members">
                Voir tous
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>

          <div className="divide-y divide-black/4">
            {(recentMembers ?? []).length === 0 ? (
              <div className="px-6 py-10 text-center">
                <Users className="mx-auto mb-3 size-8 text-[#3C3C3B]/15" />
                <p className="text-sm text-[#3C3C3B]/40">Aucun membre pour le moment.</p>
              </div>
            ) : (
              (recentMembers ?? []).map((member) => {
                const avatarStyle = getAvatarStyle(member as unknown as DashboardMember);
                const isAlumni = member.role === 'alumni';
                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-[#f8f9fc]"
                  >
                    <div
                      className="flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold"
                      style={avatarStyle}
                    >
                      {getInitials(member as unknown as DashboardMember)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#3C3C3B]">
                        {formatMemberName(member as unknown as DashboardMember)}
                      </p>
                      <p className="truncate text-xs text-[#3C3C3B]/40">{member.email}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          isAlumni
                            ? 'bg-[#2CB8C5]/10 text-[#2CB8C5]'
                            : 'bg-[#662483]/10 text-[#662483]'
                        }`}
                      >
                        {isAlumni ? 'Alumni' : 'Étudiant'}
                      </span>
                      <span className="text-xs text-[#3C3C3B]/30">
                        {new Date(member.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-2xl border border-black/6 bg-white p-6 shadow-sm">
          <h2 className="mb-1 font-bricolage text-base font-semibold text-[#3C3C3B]">
            Actions rapides
          </h2>
          <p className="mb-5 text-xs text-[#3C3C3B]/40">Accès directs à la gestion</p>

          <div className="space-y-3">
            <Link
              href="/admin/members"
              className="group flex items-center gap-4 rounded-xl border border-black/6 bg-[#f8f9fc] p-4 transition-all duration-200 hover:border-[#2CB8C5]/30 hover:bg-[#2CB8C5]/5"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#2CB8C5]/10 transition-colors group-hover:bg-[#2CB8C5]/15">
                <Users className="size-4.5 text-[#2CB8C5]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#3C3C3B]">Gérer les membres</p>
                <p className="text-xs text-[#3C3C3B]/40">Ajouter, modifier, importer</p>
              </div>
              <ArrowRight className="ml-auto size-4 shrink-0 text-[#3C3C3B]/20 transition-colors group-hover:text-[#2CB8C5]" />
            </Link>

            <Link
              href="/admin/promotions"
              className="group flex items-center gap-4 rounded-xl border border-black/6 bg-[#f8f9fc] p-4 transition-all duration-200 hover:border-[#662483]/30 hover:bg-[#662483]/5"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#662483]/10 transition-colors group-hover:bg-[#662483]/15">
                <CalendarDays className="size-4.5 text-[#662483]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#3C3C3B]">Gérer les promotions</p>
                <p className="text-xs text-[#3C3C3B]/40">Années et cohortes</p>
              </div>
              <ArrowRight className="ml-auto size-4 shrink-0 text-[#3C3C3B]/20 transition-colors group-hover:text-[#662483]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
