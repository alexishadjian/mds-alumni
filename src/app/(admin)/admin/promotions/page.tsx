import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { PromotionsTable } from '@/components/admin/promotions-table';

export default async function PromotionsPage() {
  const supabase = createClient(await cookies());
  const { data: promotions } = await supabase
    .from('promotion_year')
    .select('*')
    .order('year', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Promotions</h1>
        <p className="text-sm text-muted-foreground">
          Gérez les années de promotion.
        </p>
      </div>
      <PromotionsTable promotions={promotions ?? []} />
    </div>
  );
}
