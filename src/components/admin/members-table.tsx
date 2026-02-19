'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, Search, Upload } from 'lucide-react';
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
  promotion_year: { id: number; year: number; label: string | null } | null;
  created_at: string;
}

interface Promotion {
  id: number;
  year: number;
  label: string | null;
}

interface MembersTableProps {
  members: Member[];
  promotions: Promotion[];
  search?: string;
}

const ROLE_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  alumni: { label: 'Alumni', variant: 'secondary' },
  student: { label: 'Étudiant', variant: 'outline' },
};

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

    setImportSuccess(
      `Import terminé: ${result.data.imported} importé(s), ${result.data.skipped} ignoré(s).`
    );

    if (result.data.importedWithoutPromotion > 0) {
      setImportSuccess(
        `Import terminé: ${result.data.imported} importé(s), ${result.data.skipped} ignoré(s), ${result.data.importedWithoutPromotion} sans promotion.`
      );
    }

    if (result.data.errors.length > 0) {
      setImportError(
        `Certaines lignes ont été ignorées. Exemple: ${result.data.errors[0]}`
      );
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

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou email…"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-72 pl-9"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Rechercher
          </Button>
        </form>
        <div className="flex items-center gap-3">
          <Badge variant="secondary">
            {members.length} membre{members.length > 1 ? 's' : ''}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setImportDialogOpen(true)}>
            <Upload className="mr-2 size-4" />
            Import CSV
          </Button>
          <Button onClick={handleCreate} size="sm">
            <Plus className="mr-2 size-4" />
            Ajouter un membre
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Promotion</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  {search ? 'Aucun résultat.' : 'Aucun membre pour le moment.'}
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => {
                const roleInfo = ROLE_LABELS[member.role] ?? ROLE_LABELS.student;
                return (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{displayName(member)}</TableCell>
                    <TableCell className="text-muted-foreground">{member.email}</TableCell>
                    <TableCell>
                      <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>
                    </TableCell>
                    <TableCell>
                      {member.promotion_year
                        ? member.promotion_year.label ?? member.promotion_year.year
                        : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(member)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(member)}>
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <MemberDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        member={editingMember}
        promotions={promotions}
      />

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Importer des membres (CSV)</DialogTitle>
            <DialogDescription>
              Colonnes attendues: firstname, lastname, promotion_name, promotion_year, role, email
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="members_csv">Fichier CSV</Label>
              <Input
                id="members_csv"
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => handleCsvSelection(e.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-muted-foreground">
                Les rôles autorisés sont uniquement: student, alumni.
              </p>
            </div>

            {importError && <p className="text-sm text-destructive">{importError}</p>}
            {importSuccess && <p className="text-sm text-emerald-600">{importSuccess}</p>}

            {isPreviewingImport && (
              <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
                Analyse du fichier en cours…
              </div>
            )}

            {previewResult && (
              <div className="space-y-2 rounded-md border bg-muted/30 p-3 text-sm">
                <p className="font-medium">Prévisualisation</p>
                <p>
                  Lignes détectées: <strong>{previewResult.totalRows}</strong>
                </p>
                <p>
                  Lignes valides: <strong>{previewResult.validRows}</strong>
                </p>
                <p>
                  Lignes invalides: <strong>{previewResult.invalidRows}</strong>
                </p>
                <p>
                  Étudiants trouvés: <strong>{previewResult.studentsFound}</strong>
                </p>
                <p>
                  Alumni trouvés: <strong>{previewResult.alumniFound}</strong>
                </p>
                {previewResult.rowsWithoutPromotion > 0 && (
                  <div className="space-y-1 rounded-md border border-amber-200 bg-amber-50 p-2 text-amber-900">
                    <p className="font-medium">
                      Attention: {previewResult.rowsWithoutPromotion} membre(s) seront créés sans promotion.
                    </p>
                    <p className="text-xs">
                      Promotions introuvables (noms): {previewResult.missingPromotionNames.join(', ')}.
                    </p>
                    <p className="text-xs">
                      Vous pouvez poursuivre l&apos;import, ces membres auront une promotion vide.
                    </p>
                  </div>
                )}
                {previewResult.errors.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <p className="font-medium">Erreurs de validation:</p>
                    <ul className="max-h-40 list-disc space-y-1 overflow-auto pl-5 text-xs text-muted-foreground">
                      {previewResult.errors.map((item) => (
                        <li key={item}>{item}</li>
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

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer {deleteTarget ? displayName(deleteTarget) : ''} ?</DialogTitle>
            <DialogDescription>
              Cette action supprimera le compte et le profil de cet utilisateur. Elle est irréversible.
            </DialogDescription>
          </DialogHeader>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Suppression…' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
