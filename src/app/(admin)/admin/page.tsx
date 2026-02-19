import Link from 'next/link';
import { cookies } from 'next/headers';
import { ArrowRight, CalendarDays, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/server';

interface DashboardMember {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  created_at: string;
}

const formatMemberName = (member: DashboardMember) => {
  if (member.first_name || member.last_name) {
    return [member.first_name, member.last_name].filter(Boolean).join(' ');
  }
  return member.email;
};

export default async function AdminPage() {
  const supabase = createClient(await cookies());

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
      .select('id, email, first_name, last_name, role, created_at')
      .neq('role', 'admin')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Vue d&apos;ensemble de la communauté et raccourcis d&apos;administration.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <section className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Membres (hors admins)</p>
          <p className="mt-1 text-2xl font-semibold">{membersCount ?? 0}</p>
        </section>
        <section className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Alumni</p>
          <p className="mt-1 text-2xl font-semibold">{alumniCount ?? 0}</p>
        </section>
        <section className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Étudiants</p>
          <p className="mt-1 text-2xl font-semibold">{studentsCount ?? 0}</p>
        </section>
        <section className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Promotions</p>
          <p className="mt-1 text-2xl font-semibold">{promotionsCount ?? 0}</p>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="rounded-lg border p-4 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium">Derniers membres ajoutés</h2>
            <Button asChild variant="secondary" size="sm">
              <Link href="/admin/members">
                Voir tous les membres
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="overflow-hidden rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Nom</th>
                  <th className="px-4 py-2 text-left font-medium">Rôle</th>
                  <th className="px-4 py-2 text-left font-medium">Inscription</th>
                </tr>
              </thead>
              <tbody>
                {(recentMembers ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
                      Aucun membre pour le moment.
                    </td>
                  </tr>
                ) : (
                  (recentMembers ?? []).map((member) => (
                    <tr key={member.id} className="border-t">
                      <td className="px-4 py-2.5 font-medium">{formatMemberName(member)}</td>
                      <td className="px-4 py-2.5">
                        <Badge variant={member.role === 'alumni' ? 'secondary' : 'outline'}>
                          {member.role === 'alumni' ? 'Alumni' : 'Étudiant'}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {new Date(member.created_at).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-lg border p-4">
          <h2 className="mb-4 text-lg font-medium">Actions rapides</h2>
          <div className="space-y-3">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/admin/members">
                <Users className="size-4" />
                Gérer les membres
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/admin/promotions">
                <CalendarDays className="size-4" />
                Gérer les promotions
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
