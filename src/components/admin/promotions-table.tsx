'use client';

import { useState } from 'react';
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
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PromotionDialog } from './promotion-dialog';
import { deletePromotion } from '@/lib/actions/promotions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Promotion {
  id: number;
  year: number;
  label: string | null;
  created_at: string;
}

interface PromotionsTableProps {
  promotions: Promotion[];
}

export function PromotionsTable({ promotions }: PromotionsTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingPromotion(null);
    setDialogOpen(true);
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    const result = await deletePromotion(deleteTarget.id);
    setIsDeleting(false);
    if (!result.success) {
      setError(result.error);
    } else {
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Badge variant="secondary">{promotions.length} promotion{promotions.length > 1 ? 's' : ''}</Badge>
        <Button onClick={handleCreate} size="sm">
          <Plus className="mr-2 size-4" />
          Ajouter une promotion
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Année</TableHead>
              <TableHead>Date de création</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promotions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  Aucune promotion pour le moment.
                </TableCell>
              </TableRow>
            ) : (
              promotions.map((promotion) => (
                <TableRow key={promotion.id}>
                  <TableCell className="font-medium">
                    {promotion.label || <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>{promotion.year}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(promotion.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(promotion)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(promotion)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PromotionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        promotion={editingPromotion}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la promotion {deleteTarget?.year} ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Les profils liés à cette promotion ne seront pas supprimés.
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
