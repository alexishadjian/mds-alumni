'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, Search, Upload, Users, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { MemberDialog } from './member-dialog';
import { deleteMember, importMembersCsv, previewMembersCsv } from '@/lib/actions/members';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Member {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  promotion_year: { id: number; year: number; label: string | null; color: string | null } | null;
  created_at: string;
}

interface Promotion {
  id: number;
  year: number;
  label: string | null;
  color: string | null;
}

interface MembersTableProps {
  members: Member[];
  promotions: Promotion[];
  search?: string;
}

const GREY = { bg: 'rgba(156,163,175,0.12)', text: '#9ca3af' };

function getPromotionStyle(member: Member) {
  const color = member.promotion_year?.color;
  if (!color) return GREY;
  return { bg: `${color}18`, text: color };
}

export function MembersTable({ members, promotions, search }: MembersTableProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(search ?? '');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPreviewingImport, setIsPreviewingImport] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [previewResult, setPreviewResult] = useState<{
    totalRows: number;
    validRows: number;
    invalidRows: number;
    studentsFound: number;
    alumniFound: number;
    rowsWithoutPromotion: number;
    missingPromotionNames: string[];
    errors: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchValue.trim()) params.set('q', searchValue.trim());
    router.push(`/admin/members?${params.toString()}`);
  };

  const handleCreate = () => {
    setEditingMember(null);
    setDialogOpen(true);
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    const result = await deleteMember(deleteTarget.id);
    setIsDeleting(false);
    if (!result.success) {
      setError(result.error);
    } else {
      setDeleteTarget(null);
    }
  };

  const handleImport = async () => {
    if (!csvFile || !previewResult) {
      setImportError('Veuillez sélectionner un fichier CSV.');
      return;
    }
    if (previewResult.validRows === 0) {
      setImportError('Aucune ligne valide à importer.');
      return;
    }
    setIsImporting(true);
    setImportError(null);
    setImportSuccess(null);
    const csvContent = await csvFile.text();
    const result = await importMembersCsv(csvContent);
    setIsImporting(false);
    if (!result.success) {
      setImportError(result.error);
      return;
    }
    let msg = `Import terminé : ${result.data.imported} importé(s), ${result.data.skipped} ignoré(s).`;
    if (result.data.importedWithoutPromotion > 0) {
      msg = `Import terminé : ${result.data.imported} importé(s), ${result.data.skipped} ignoré(s), ${result.data.importedWithoutPromotion} sans promotion.`;
    }
    setImportSuccess(msg);
    if (result.data.errors.length > 0) {
      setImportError(`Certaines lignes ont été ignorées. Exemple : ${result.data.errors[0]}`);
    }
    router.refresh();
  };

  const handleCsvSelection = async (file: File | null) => {
    setCsvFile(file);
    setImportError(null);
    setImportSuccess(null);
    setPreviewResult(null);
    if (!file) return;
    setIsPreviewingImport(true);
    const csvContent = await file.text();
    const result = await previewMembersCsv(csvContent);
    setIsPreviewingImport(false);
    if (!result.success) {
      setImportError(result.error);
      return;
    }
    setPreviewResult(result.data);
  };

  const displayName = (m: Member) => {
    if (m.first_name || m.last_name) {
      return [m.first_name, m.last_name].filter(Boolean).join(' ');
    }
    return m.email;
  };

  const getInitials = (m: Member) => {
    if (m.first_name && m.last_name) return `${m.first_name[0]}${m.last_name[0]}`.toUpperCase();
    return m.email.slice(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#3C3C3B]/35" />
            <Input
              placeholder="Rechercher par nom ou email…"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="h-9 w-72 rounded-xl border-black/8 bg-white pl-9 text-sm placeholder:text-[#3C3C3B]/30 focus-visible:border-[#2CB8C5]/50 focus-visible:ring-[#2CB8C5]/15"
            />
          </div>
          <Button
            type="submit"
            size="sm"
            variant="outline"
            className="h-9 rounded-xl border-black/8 bg-white text-xs font-semibold hover:border-[#2CB8C5]/40 hover:bg-[#2CB8C5]/5 hover:text-[#2CB8C5]"
          >
            Rechercher
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#3C3C3B]/6 px-3 py-1 text-xs font-semibold text-[#3C3C3B]/55">
            {members.length} membre{members.length > 1 ? 's' : ''}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportDialogOpen(true)}
            className="h-9 gap-1.5 rounded-xl border-black/8 bg-white text-xs font-semibold hover:border-[#662483]/40 hover:bg-[#662483]/5 hover:text-[#662483]"
          >
            <Upload className="size-3.5" />
            Import CSV
          </Button>
          <Button
            onClick={handleCreate}
            size="sm"
            className="h-9 gap-1.5 rounded-xl bg-[#2CB8C5] text-xs font-bold text-white shadow-sm shadow-[#2CB8C5]/20 hover:bg-[#2CB8C5]/90 hover:shadow-md hover:shadow-[#2CB8C5]/25"
          >
            <Plus className="size-3.5" />
            Ajouter un membre
          </Button>
        </div>
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-2xl border border-black/6 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 bg-[#f8f9fc]">
              <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-[0.1em] text-[#3C3C3B]/40">
                Membre
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.1em] text-[#3C3C3B]/40">
                Rôle
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.1em] text-[#3C3C3B]/40">
                Promotion
              </th>
              <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-[0.1em] text-[#3C3C3B]/40">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/4">
            {members.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-16 text-center">
                  <Users className="mx-auto mb-3 size-8 text-[#3C3C3B]/15" />
                  <p className="text-sm text-[#3C3C3B]/40">
                    {search ? 'Aucun résultat pour cette recherche.' : 'Aucun membre pour le moment.'}
                  </p>
                </td>
              </tr>
            ) : (
              members.map((member) => {
                const isAlumni = member.role === 'alumni';
                const { bg, text } = getPromotionStyle(member);
                return (
                  <tr
                    key={member.id}
                    className="group transition-colors hover:bg-[#f8f9fc]"
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex size-8 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold"
                          style={{ backgroundColor: bg, color: text }}
                        >
                          {getInitials(member)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#3C3C3B]">
                            {displayName(member)}
                          </p>
                          <p className="truncate text-xs text-[#3C3C3B]/40">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          isAlumni
                            ? 'bg-[#2CB8C5]/10 text-[#2CB8C5]'
                            : 'bg-[#662483]/10 text-[#662483]'
                        }`}
                      >
                        {isAlumni ? 'Alumni' : 'Étudiant'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {member.promotion_year ? (
                        <span className="text-sm text-[#3C3C3B]/70">
                          {member.promotion_year.label ?? member.promotion_year.year}
                        </span>
                      ) : (
                        <span className="text-sm text-[#3C3C3B]/25">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => handleEdit(member)}
                          className="flex size-8 items-center justify-center rounded-lg text-[#3C3C3B]/40 transition-colors hover:bg-[#2CB8C5]/10 hover:text-[#2CB8C5]"
                          title="Modifier"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(member)}
                          className="flex size-8 items-center justify-center rounded-lg text-[#3C3C3B]/40 transition-colors hover:bg-red-50 hover:text-red-500"
                          title="Supprimer"
                        >
                          <Trash2 className="size-3.5" />
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

      <MemberDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        member={editingMember}
        promotions={promotions}
      />

      {/* Import CSV dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-bricolage text-xl">Importer des membres</DialogTitle>
            <DialogDescription className="text-xs">
              Colonnes attendues :{' '}
              <code className="rounded bg-[#f8f9fc] px-1 py-0.5 font-mono text-[#662483]">
                firstname, lastname, promotion_name, promotion_year, role, email
              </code>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="members_csv" className="text-xs font-bold uppercase tracking-wider text-[#3C3C3B]/50">
                Fichier CSV
              </Label>
              <Input
                id="members_csv"
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => handleCsvSelection(e.target.files?.[0] ?? null)}
                className="cursor-pointer rounded-xl border-black/8 bg-[#f8f9fc] text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#2CB8C5]/10 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-[#2CB8C5]"
              />
              <p className="text-xs text-[#3C3C3B]/40">
                Rôles autorisés : <strong>student</strong>, <strong>alumni</strong>.
              </p>
            </div>

            {isPreviewingImport && (
              <div className="flex items-center gap-3 rounded-xl border border-black/6 bg-[#f8f9fc] p-4 text-sm text-[#3C3C3B]/50">
                <div className="size-4 animate-spin rounded-full border-2 border-[#2CB8C5]/30 border-t-[#2CB8C5]" />
                Analyse du fichier en cours…
              </div>
            )}

            {importError && (
              <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-500" />
                <p className="text-sm text-red-700">{importError}</p>
              </div>
            )}

            {importSuccess && (
              <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                <p className="text-sm text-emerald-700">{importSuccess}</p>
              </div>
            )}

            {previewResult && (
              <div className="space-y-3 rounded-xl border border-black/6 bg-[#f8f9fc] p-4 text-sm">
                <p className="font-semibold text-[#3C3C3B]">Prévisualisation</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Lignes détectées', value: previewResult.totalRows },
                    { label: 'Lignes valides', value: previewResult.validRows, color: 'text-emerald-600' },
                    { label: 'Lignes invalides', value: previewResult.invalidRows, color: previewResult.invalidRows > 0 ? 'text-red-600' : undefined },
                    { label: 'Alumni', value: previewResult.alumniFound, color: 'text-[#2CB8C5]' },
                    { label: 'Étudiants', value: previewResult.studentsFound, color: 'text-[#662483]' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center justify-between rounded-lg border border-black/5 bg-white px-3 py-2">
                      <span className="text-xs text-[#3C3C3B]/50">{label}</span>
                      <span className={`text-sm font-bold ${color ?? 'text-[#3C3C3B]'}`}>{value}</span>
                    </div>
                  ))}
                </div>

                {previewResult.rowsWithoutPromotion > 0 && (
                  <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">
                        {previewResult.rowsWithoutPromotion} membre(s) seront créés sans promotion.
                      </p>
                      <p className="mt-0.5 text-xs text-amber-700">
                        Introuvables : {previewResult.missingPromotionNames.join(', ')}.
                      </p>
                    </div>
                  </div>
                )}

                {previewResult.errors.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#3C3C3B]/50">
                      Erreurs de validation
                    </p>
                    <ul className="max-h-32 space-y-1 overflow-auto">
                      {previewResult.errors.map((item) => (
                        <li key={item} className="text-xs text-[#3C3C3B]/60">
                          · {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setImportDialogOpen(false);
                setImportError(null);
                setImportSuccess(null);
                setPreviewResult(null);
                setCsvFile(null);
              }}
              disabled={isImporting || isPreviewingImport}
              className="rounded-xl border-black/8"
            >
              Fermer
            </Button>
            <Button
              onClick={handleImport}
              disabled={
                isImporting ||
                isPreviewingImport ||
                !csvFile ||
                !previewResult ||
                previewResult.validRows === 0
              }
              className="rounded-xl bg-[#2CB8C5] font-semibold text-white hover:bg-[#2CB8C5]/90"
            >
              {isImporting
                ? 'Import en cours…'
                : previewResult?.rowsWithoutPromotion
                  ? 'Importer quand même'
                  : 'Importer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-bricolage text-xl">
              Supprimer ce membre ?
            </DialogTitle>
            <DialogDescription>
              <strong>{deleteTarget ? displayName(deleteTarget) : ''}</strong> sera supprimé
              définitivement. Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
              className="rounded-xl border-black/8"
            >
              Annuler
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-xl bg-red-500 font-semibold text-white hover:bg-red-600"
            >
              {isDeleting ? 'Suppression…' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
