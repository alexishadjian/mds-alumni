import { getJobs } from '@/lib/actions/jobs';
import { JobsTable } from '@/components/admin/jobs-table';

type Props = { searchParams: Promise<{ q?: string }> };

export default async function AdminJobsPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const jobs = await getJobs({ search: q, adminView: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bricolage text-2xl font-bold text-[#3C3C3B]">Gestion des offres</h1>
        <p className="text-sm text-[#3C3C3B]/50">Créez et gérez les opportunités de carrière pour les alumni.</p>
      </div>
      <JobsTable jobs={jobs} search={q} />
    </div>
  );
}
