'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, Search, Briefcase, MapPin, Globe, CheckCircle2, XCircle } from 'lucide-react';
import { JobDialog } from './job-dialog';
import { deleteJob, toggleJobActive } from '@/lib/actions/jobs';
import type { Job } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface JobsTableProps {
  jobs: Job[];
  search?: string;
}

const contractColors: Record<string, { bg: string, text: string }> = {
  cdi: { bg: 'bg-blue-50', text: 'text-blue-600' },
  cdd: { bg: 'bg-orange-50', text: 'text-orange-600' },
  freelance: { bg: 'bg-purple-50', text: 'text-purple-600' },
  stage: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  alternance: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
};

export function JobsTable({ jobs, search }: JobsTableProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(search ?? '');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Job | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchValue.trim()) params.set('q', searchValue.trim());
    router.push(`/admin/jobs?${params.toString()}`);
  };

  const handleCreate = () => {
    setEditingJob(null);
    setDialogOpen(true);
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const result = await deleteJob(deleteTarget.id);
    setIsDeleting(false);
    if (result.success) {
      setDeleteTarget(null);
      router.refresh();
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    await toggleJobActive(id, !current);
    router.refresh();
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#3C3C3B]/35" />
            <Input
              placeholder="Rechercher une offre…"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="h-9 w-72 rounded-xl border-black/8 bg-white pl-9 text-sm focus-visible:ring-[#2CB8C5]/15"
            />
          </div>
          <Button type="submit" size="sm" variant="outline" className="h-9 rounded-xl text-xs font-semibold">
            Rechercher
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#3C3C3B]/6 px-3 py-1 text-xs font-semibold text-[#3C3C3B]/55">
            {jobs.length} offre{jobs.length > 1 ? 's' : ''}
          </span>
          <Button
            onClick={handleCreate}
            size="sm"
            className="h-9 gap-1.5 rounded-xl bg-[#2CB8C5] text-xs font-bold text-white shadow-sm hover:bg-[#2CB8C5]/90"
          >
            <Plus className="size-3.5" />
            Nouvelle offre
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/6 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 bg-[#f8f9fc]">
              <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-[#3C3C3B]/40">Offre / Entreprise</th>
              <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-[#3C3C3B]/40">Détails</th>
              <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-[#3C3C3B]/40">Statut</th>
              <th className="px-6 py-3 text-right text-[10px] font-black uppercase tracking-widest text-[#3C3C3B]/40">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/4">
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-16 text-center">
                  <Briefcase className="mx-auto mb-3 size-8 text-[#3C3C3B]/15" />
                  <p className="text-sm text-[#3C3C3B]/40">Aucune offre trouvée.</p>
                </td>
              </tr>
            ) : (
              jobs.map((job) => {
                const colors = contractColors[job.contract_type as string] || { bg: 'bg-gray-50', text: 'text-gray-600' };
                return (
                  <tr key={job.id} className="group hover:bg-[#f8f9fc] transition-colors">
                    <td className="px-6 py-4">
                      <div className="min-w-0">
                        <p className="font-bold text-[#3C3C3B] truncate">{job.title}</p>
                        <p className="text-xs text-[#3C3C3B]/50 flex items-center gap-1.5 mt-0.5">
                          <Globe className="size-3" />
                          {job.company_name}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                           <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${colors.bg} ${colors.text}`}>
                            {job.contract_type}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-gray-100 text-gray-500">
                            {job.sector}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[#3C3C3B]/40">
                          <MapPin className="size-3" />
                          {job.location || 'N/C'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <button 
                          onClick={() => handleToggleActive(job.id, job.is_active || false)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                            job.is_active 
                              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                              : 'bg-red-50 text-red-600 hover:bg-red-100'
                          }`}
                        >
                          {job.is_active ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                          {job.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(job)} className="p-2 text-[#3C3C3B]/40 hover:text-[#2CB8C5] hover:bg-[#2CB8C5]/5 rounded-lg transition-colors">
                          <Pencil className="size-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(job)} className="p-2 text-[#3C3C3B]/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <JobDialog open={dialogOpen} onOpenChange={setDialogOpen} job={editingJob} />

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-bricolage text-xl">Supprimer l&apos;offre ?</DialogTitle>
            <DialogDescription>
              L&apos;offre <strong>{deleteTarget?.title}</strong> chez <strong>{deleteTarget?.company_name}</strong> sera définitivement supprimée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="rounded-xl">Annuler</Button>
            <Button onClick={handleDelete} disabled={isDeleting} className="rounded-xl bg-red-500 text-white hover:bg-red-600">
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
