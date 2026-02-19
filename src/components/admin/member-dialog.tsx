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
import { createMember, updateMember } from '@/lib/actions/members';

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

interface MemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member | null;
  promotions: Promotion[];
}

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
          <DialogTitle>
            {isEditing ? 'Modifier le membre' : 'Nouveau membre'}
          </DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Prénom</Label>
              <Input
                id="first_name"
                name="first_name"
                defaultValue={member?.first_name ?? ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Nom</Label>
              <Input
                id="last_name"
                name="last_name"
                defaultValue={member?.last_name ?? ''}
              />
            </div>
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Select name="role" defaultValue={member?.role ?? 'student'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Étudiant</SelectItem>
                  <SelectItem value="alumni">Alumni</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="promotion_year_id">Promotion</Label>
              <Select
                name="promotion_year_id"
                defaultValue={member?.promotion_year?.id?.toString() ?? ''}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {promotions.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.label ?? p.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
