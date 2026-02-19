'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, CalendarDays, AlertTriangle } from 'lucide-react';
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
  color: string | null;
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
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-[#3C3C3B]/6 px-3 py-1 text-xs font-semibold text-[#3C3C3B]/55">
          {promotions.length} promotion{promotions.length > 1 ? 's' : ''}
        </span>
        <Button
          onClick={handleCreate}
          size="sm"
          className="h-9 gap-1.5 rounded-xl bg-[#662483] text-xs font-bold text-white shadow-sm shadow-[#662483]/20 hover:bg-[#662483]/90 hover:shadow-md hover:shadow-[#662483]/25"
        >
          <Plus className="size-3.5" />
          Ajouter une promotion
        </Button>
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-2xl border border-black/6 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 bg-[#f8f9fc]">
              <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-[0.1em] text-[#3C3C3B]/40">
                Nom
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.1em] text-[#3C3C3B]/40">
                Année
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.1em] text-[#3C3C3B]/40">
                Couleur
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.1em] text-[#3C3C3B]/40">
                Créée le
              </th>
              <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-[0.1em] text-[#3C3C3B]/40">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/4">
            {promotions.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <CalendarDays className="mx-auto mb-3 size-8 text-[#3C3C3B]/15" />
                  <p className="text-sm text-[#3C3C3B]/40">Aucune promotion pour le moment.</p>
                </td>
              </tr>
            ) : (
              promotions.map((promotion) => (
                <tr
                  key={promotion.id}
                  className="group transition-colors hover:bg-[#f8f9fc]"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      {/* Color swatch as avatar */}
                      <div
                        className="flex size-8 shrink-0 items-center justify-center rounded-xl text-white"
                        style={
                          promotion.color
                            ? { backgroundColor: promotion.color }
                            : { backgroundColor: '#e5e7eb' }
                        }
                      >
                        <CalendarDays
                          className="size-3.5"
                          style={
                            promotion.color
                              ? { color: 'rgba(255,255,255,0.85)' }
                              : { color: '#9ca3af' }
                          }
                        />
                      </div>
                      <span className="font-semibold text-[#3C3C3B]">
                        {promotion.label || <span className="font-normal text-[#3C3C3B]/30">—</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                      style={
                        promotion.color
                          ? {
                              backgroundColor: `${promotion.color}18`,
                              color: promotion.color,
                            }
                          : {
                              backgroundColor: 'rgba(156,163,175,0.15)',
                              color: '#6b7280',
                            }
                      }
                    >
                      {promotion.year}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {promotion.color ? (
                      <div className="flex items-center gap-2">
                        <div
                          className="size-5 rounded-md shadow-sm"
                          style={{ backgroundColor: promotion.color }}
                        />
                        <span className="font-mono text-xs text-[#3C3C3B]/50">
                          {promotion.color}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-[#3C3C3B]/25">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#3C3C3B]/40">
                    {new Date(promotion.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => handleEdit(promotion)}
                        className="flex size-8 items-center justify-center rounded-lg text-[#3C3C3B]/40 transition-colors hover:bg-[#662483]/10 hover:text-[#662483]"
                        title="Modifier"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(promotion)}
                        className="flex size-8 items-center justify-center rounded-lg text-[#3C3C3B]/40 transition-colors hover:bg-red-50 hover:text-red-500"
                        title="Supprimer"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PromotionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        promotion={editingPromotion}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-bricolage text-xl">
              Supprimer cette promotion ?
            </DialogTitle>
            <DialogDescription>
              La promotion <strong>{deleteTarget?.label ?? deleteTarget?.year}</strong> sera
              supprimée. Les profils liés ne seront pas affectés.
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
