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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle } from 'lucide-react';
import { createMember, updateMember } from '@/lib/actions/members';

interface Member {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  linkedin_pseudo: string | null;
  promotion_year: { id: number; year: number; label: string | null } | null;
  created_at: string;
}

interface Promotion {
  id: number;
  year: number;
  label: string | null;
}

interface MemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member | null;
  promotions: Promotion[];
}

const fieldClass =
  'h-10 rounded-xl border border-black/8 bg-[#f8f9fc] px-3.5 text-sm text-[#3C3C3B] placeholder:text-[#3C3C3B]/30 outline-none transition-all focus:border-[#2CB8C5]/50 focus:bg-white focus:ring-4 focus:ring-[#2CB8C5]/10';

const labelClass = 'text-[10px] font-black uppercase tracking-[0.12em] text-[#3C3C3B]/45';

export function MemberDialog({ open, onOpenChange, member, promotions }: MemberDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const isEditing = !!member;

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    setError(null);
    const result = isEditing
      ? await updateMember(member.id, formData)
      : await createMember(formData);
    setIsPending(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#2CB8C5]">
            {isEditing ? 'Modifier' : 'Créer'}
          </p>
          <DialogTitle className="font-bricolage text-xl text-[#3C3C3B]">
            {isEditing ? 'Modifier le membre' : 'Nouveau membre'}
          </DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="first_name" className={labelClass}>
                Prénom
              </Label>
              <Input
                id="first_name"
                name="first_name"
                placeholder="Marie"
                defaultValue={member?.first_name ?? ''}
                className={fieldClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="last_name" className={labelClass}>
                Nom
              </Label>
              <Input
                id="last_name"
                name="last_name"
                placeholder="Dupont"
                defaultValue={member?.last_name ?? ''}
                className={fieldClass}
              />
            </div>
          </div>

          {!isEditing && (
            <div className="space-y-1.5">
              <Label htmlFor="email" className={labelClass}>
                Adresse email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="marie.dupont@email.com"
                required
                className={fieldClass}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="role" className={labelClass}>
                Rôle
              </Label>
              <Select name="role" defaultValue={member?.role ?? 'student'}>
                <SelectTrigger className="h-10 rounded-xl border-black/8 bg-[#f8f9fc] text-sm text-[#3C3C3B] focus:border-[#2CB8C5]/50 focus:ring-[#2CB8C5]/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="student">
                    <span className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-[#662483]" />
                      Étudiant
                    </span>
                  </SelectItem>
                  <SelectItem value="alumni">
                    <span className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-[#2CB8C5]" />
                      Alumni
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="promotion_year_id" className={labelClass}>
                Promotion
              </Label>
              <Select
                name="promotion_year_id"
                defaultValue={member?.promotion_year?.id?.toString() ?? ''}
              >
                <SelectTrigger className="h-10 rounded-xl border-black/8 bg-[#f8f9fc] text-sm text-[#3C3C3B] focus:border-[#2CB8C5]/50 focus:ring-[#2CB8C5]/10">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {promotions.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.label ?? p.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="linkedin_pseudo" className={labelClass}>
              Pseudo LinkedIn
            </Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[#3C3C3B]/30 text-sm">
                linkedin.com/in/
              </span>
              <Input
                id="linkedin_pseudo"
                name="linkedin_pseudo"
                placeholder="marie-dupont"
                defaultValue={member?.linkedin_pseudo ?? ''}
                className={`${fieldClass} pl-[120px]`}
              />
            </div>
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
              className="rounded-xl bg-[#2CB8C5] font-semibold text-white hover:bg-[#2CB8C5]/90"
            >
              {isPending ? 'Enregistrement…' : isEditing ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
