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
import { AlertTriangle } from 'lucide-react';
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

const fieldClass =
  'h-10 rounded-xl border border-black/8 bg-[#f8f9fc] px-3.5 text-sm text-[#3C3C3B] placeholder:text-[#3C3C3B]/30 outline-none transition-all focus:border-[#662483]/50 focus:bg-white focus:ring-4 focus:ring-[#662483]/10';

const labelClass = 'text-[10px] font-black uppercase tracking-[0.12em] text-[#3C3C3B]/45';

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
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#662483]">
            {isEditing ? 'Modifier' : 'Créer'}
          </p>
          <DialogTitle className="font-bricolage text-xl text-[#3C3C3B]">
            {isEditing ? `Promotion ${promotion.year}` : 'Nouvelle promotion'}
          </DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="label" className={labelClass}>
              Nom
            </Label>
            <Input
              id="label"
              name="label"
              type="text"
              placeholder="ex: Promo 2025, Bachelor 3e année…"
              defaultValue={promotion?.label ?? ''}
              className={fieldClass}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="year" className={labelClass}>
              Année
            </Label>
            <Input
              id="year"
              name="year"
              type="number"
              min={2000}
              max={2100}
              defaultValue={promotion?.year ?? new Date().getFullYear()}
              required
              className={fieldClass}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <DialogFooter className="pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="rounded-xl border-black/8"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-[#662483] font-semibold text-white hover:bg-[#662483]/90"
            >
              {isPending ? 'Enregistrement…' : isEditing ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
