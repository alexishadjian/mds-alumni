import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { MembersTable } from '@/components/admin/members-table';

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function MembersPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const supabase = createClient(await cookies());

  let query = supabase
    .from('profiles')
    .select('*, promotion_year(id, year, label)')
    .neq('role', 'admin')
    .order('created_at', { ascending: false });

  if (q) {
    query = query.or(
      `first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`
    );
  }

  const { data: members } = await query;

  const { data: promotions } = await supabase
    .from('promotion_year')
    .select('id, year, label')
    .order('year', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Membres</h1>
        <p className="text-sm text-muted-foreground">
          Gérez les étudiants et alumni.
        </p>
      </div>
      <MembersTable
        members={members ?? []}
        promotions={promotions ?? []}
        search={q}
      />
    </div>
  );
}
