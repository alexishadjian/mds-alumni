'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createPromotion, updatePromotion } from '@/lib/actions/promotions';

interface Promotion {
  id: number;
  year: number;
  label: string | null;
  created_at: string;
}

interface PromotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promotion: Promotion | null;
}

export function PromotionDialog({ open, onOpenChange, promotion }: PromotionDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const isEditing = !!promotion;

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    setError(null);

    const result = isEditing
      ? await updatePromotion(promotion.id, formData)
      : await createPromotion(formData);

    setIsPending(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Modifier la promotion ${promotion.year}` : 'Nouvelle promotion'}
          </DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label">Nom</Label>
            <Input
              id="label"
              name="label"
              type="text"
              placeholder="ex: Promo 2025, Bachelor 3e année…"
              defaultValue={promotion?.label ?? ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Année</Label>
            <Input
              id="year"
              name="year"
              type="number"
              min={2000}
              max={2100}
              defaultValue={promotion?.year ?? new Date().getFullYear()}
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Enregistrement…' : isEditing ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
