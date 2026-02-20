import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { MembersTable } from '@/components/admin/members-table';

interface Props {
  searchParams: Promise<{
    q?: string;
    promotion?: string;
    role?: string;
  }>;
}

export default async function MembersPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = createClient(await cookies());

  let query = supabase
    .from('profiles')
    .select('*, promotion_year(id, year, label, color)')
    .neq('role', 'admin')
    .order('created_at', { ascending: false });

  if (params.q) {
    query = query.or(
      `first_name.ilike.%${params.q}%,last_name.ilike.%${params.q}%,email.ilike.%${params.q}%`
    );
  }
  if (params.promotion) {
    query = query.eq('promotion_year_id', params.promotion);
  }
  if (params.role) {
    query = query.eq('role', params.role);
  }

  const { data: members } = await query;

  const { data: promotions } = await supabase
    .from('promotion_year')
    .select('id, year, label, color')
    .order('year', { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-[#2CB8C5]">
          Administration
        </p>
        <h1 className="font-bricolage text-3xl font-bold text-[#3C3C3B]">Membres</h1>
        <p className="mt-1 text-sm text-[#3C3C3B]/45">
          Gérez les étudiants et alumni de la communauté.
        </p>
      </div>
      <MembersTable
        members={members ?? []}
        promotions={promotions ?? []}
        search={params.q}
        activePromotion={params.promotion}
        activeRole={params.role}
      />
    </div>
  );
}
