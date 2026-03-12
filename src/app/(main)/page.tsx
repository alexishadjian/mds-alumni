import { createAdminClient } from '@/utils/supabase/admin';
import { HomePage } from '@/components/home/home-page';
import { local } from '@/lib/local-data';

export default async function Home() {
  let stats = { alumniCount: 0, promotionCount: 0, companyCount: 0 };

  try {
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

    if (alumniRes.error) throw alumniRes.error;

    const companies = new Set(
      (companyRes.data ?? []).map((p) => (p.current_company as string).toLowerCase())
    );

    stats = {
      alumniCount: alumniRes.count ?? 0,
      promotionCount: promotionRes.count ?? 0,
      companyCount: companies.size,
    };
  } catch (e) {
    console.warn('[Home] Supabase indisponible, fallback local', e);
    const profiles = local.profiles();
    stats = {
      alumniCount: profiles.length,
      promotionCount: local.promotions().length,
      companyCount: new Set(profiles.map((p) => p.current_company?.toLowerCase()).filter(Boolean)).size,
    };
  }

  return <HomePage stats={stats} />;
}
