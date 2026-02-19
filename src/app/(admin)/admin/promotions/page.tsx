import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { PromotionsTable } from '@/components/admin/promotions-table';

export default async function PromotionsPage() {
  const supabase = createClient(await cookies());
  const { data: promotions } = await supabase
    .from('promotion_year')
    .select('id, year, label, color, created_at')
    .order('year', { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-[#662483]">
          Administration
        </p>
        <h1 className="font-bricolage text-3xl font-bold text-[#3C3C3B]">Promotions</h1>
        <p className="mt-1 text-sm text-[#3C3C3B]/45">
          Gérez les années de promotion et cohortes.
        </p>
      </div>
      <PromotionsTable promotions={promotions ?? []} />
    </div>
  );
}
