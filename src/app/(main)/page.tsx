import { createAdminClient } from '@/utils/supabase/admin';
import { HomePage } from '@/components/home/home-page';

export default async function Home() {
  const admin = createAdminClient();

  const [alumniRes, promotionRes, companyRes] = await Promise.all([
    admin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .neq('role', 'admin')
      .neq('role', 'viewer'),
    admin.from('promotion_year').select('id', { count: 'exact', head: true }),
    admin
      .from('profiles')
      .select('current_company')
      .neq('role', 'admin')
      .not('current_company', 'is', null)
      .not('current_company', 'eq', ''),
  ]);

  const companies = new Set(
    (companyRes.data ?? []).map((p) => (p.current_company as string).toLowerCase())
  );

  return (
    <HomePage
      stats={{
        alumniCount: alumniRes.count ?? 0,
        promotionCount: promotionRes.count ?? 0,
        companyCount: companies.size,
      }}
    />
  );
}
