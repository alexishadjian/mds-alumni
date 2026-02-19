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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle } from 'lucide-react';
import { upsertJob } from '@/lib/actions/jobs';
import type { Job } from '@/types';

interface JobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job | null;
}

const fieldClass =
  'h-10 rounded-xl border border-black/8 bg-[#f8f9fc] px-3.5 text-sm text-[#3C3C3B] placeholder:text-[#3C3C3B]/30 outline-none transition-all focus:border-[#2CB8C5]/50 focus:bg-white focus:ring-4 focus:ring-[#2CB8C5]/10';

const labelClass = 'text-[10px] font-black uppercase tracking-[0.12em] text-[#3C3C3B]/45';

export function JobDialog({ open, onOpenChange, job }: JobDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const isEditing = !!job;

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    setError(null);
    
    // Process benefits (comma-separated string to array)
    const rawBenefits = formData.get('benefits') as string;
    const benefits = rawBenefits ? rawBenefits.split(',').map(s => s.trim()).filter(Boolean) : [];

    const payload: Partial<Job> = {
      title: formData.get('title') as string,
      company_name: formData.get('company_name') as string,
      sector: formData.get('sector') as string,
      contract_type: formData.get('contract_type') as any,
      location: formData.get('location') as string,
      exact_location: formData.get('exact_location') as string,
      apply_url: formData.get('apply_url') as string,
      description: formData.get('description') as string,
      is_active: formData.get('is_active') === 'on',
      // New fields
      salary_min: formData.get('salary_min') ? parseInt(formData.get('salary_min') as string) : null as any,
      salary_max: formData.get('salary_max') ? parseInt(formData.get('salary_max') as string) : null as any,
      remote_policy: formData.get('remote_policy') as string,
      experience_level: formData.get('experience_level') as string,
      benefits: benefits as any,
    };

    if (isEditing) {
      payload.id = job.id;
    }

    const result = await upsertJob(payload);
    setIsPending(false);
    
    if (!result.success) {
      setError(result.error || 'Une erreur est survenue');
      return;
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-[32px] border-none shadow-2xl">
        <DialogHeader className="pb-4 border-b border-black/5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2CB8C5] mb-1">
            {isEditing ? 'Édition' : 'Nouveau'}
          </p>
          <DialogTitle className="font-bricolage text-2xl font-black text-[#3C3C3B]">
            {isEditing ? "Modifier l'offre" : 'Créer une offre d’emploi'}
          </DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-6 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="title" className={labelClass}>Titre du poste *</Label>
              <Input id="title" name="title" required placeholder="ex: UI/UX Designer" defaultValue={job?.title ?? ''} className={fieldClass} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company_name" className={labelClass}>Entreprise *</Label>
              <Input id="company_name" name="company_name" required placeholder="ex: My Digital Agency" defaultValue={job?.company_name ?? ''} className={fieldClass} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="sector" className={labelClass}>Secteur *</Label>
              <Select name="sector" defaultValue={job?.sector ?? ''} required>
                <SelectTrigger className="h-10 rounded-xl border-black/8 bg-[#f8f9fc]">
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {['Tech', 'Design', 'Marketing', 'Data', 'Communication', 'Management', 'Autre'].map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contract_type" className={labelClass}>Contrat *</Label>
              <Select name="contract_type" defaultValue={job?.contract_type ?? 'cdi'}>
                <SelectTrigger className="h-10 rounded-xl border-black/8 bg-[#f8f9fc]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="cdi">CDI</SelectItem>
                  <SelectItem value="cdd">CDD</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                  <SelectItem value="stage">Stage</SelectItem>
                  <SelectItem value="alternance">Alternance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="experience_level" className={labelClass}>Expérience</Label>
              <Select name="experience_level" defaultValue={(job as any)?.experience_level ?? 'junior'}>
                <SelectTrigger className="h-10 rounded-xl border-black/8 bg-[#f8f9fc]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="junior">Junior (0-2 ans)</SelectItem>
                  <SelectItem value="intermediate">Intermédiaire (2-5 ans)</SelectItem>
                  <SelectItem value="senior">Senior (5+ ans)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
              <Label htmlFor="location" className={labelClass}>Ville / Ville (global)</Label>
              <Input id="location" name="location" placeholder="ex: Paris" defaultValue={job?.location ?? ''} className={fieldClass} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="exact_location" className={labelClass}>Adresse / Localisation exacte</Label>
              <Input id="exact_location" name="exact_location" placeholder="ex: 12 rue de la Paix, 75001" defaultValue={(job as any)?.exact_location ?? ''} className={fieldClass} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
             <div className="space-y-1.5">
              <Label htmlFor="remote_policy" className={labelClass}>Télétravail</Label>
              <Select name="remote_policy" defaultValue={(job as any)?.remote_policy ?? 'hybrid'}>
                <SelectTrigger className="h-10 rounded-xl border-black/8 bg-[#f8f9fc]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="on-site">Sur site</SelectItem>
                  <SelectItem value="hybrid">Hybride</SelectItem>
                  <SelectItem value="full">100% Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="salary_min" className={labelClass}>Salaire min (k€)</Label>
              <Input id="salary_min" name="salary_min" type="number" placeholder="35" defaultValue={(job as any)?.salary_min ?? ''} className={fieldClass} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="salary_max" className={labelClass}>Salaire max (k€)</Label>
              <Input id="salary_max" name="salary_max" type="number" placeholder="45" defaultValue={(job as any)?.salary_max ?? ''} className={fieldClass} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="benefits" className={labelClass}>Avantages (séparés par des virgules)</Label>
            <Input id="benefits" name="benefits" placeholder="Tickets restos, Mutuelle 100%, Gymlib..." defaultValue={(job as any)?.benefits?.join(', ') ?? ''} className={fieldClass} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="apply_url" className={labelClass}>URL de candidature</Label>
            <Input id="apply_url" name="apply_url" type="url" placeholder="https://..." defaultValue={job?.apply_url ?? ''} className={fieldClass} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className={labelClass}>Description de l&apos;offre *</Label>
            <Textarea 
              id="description" 
              name="description" 
              required 
              rows={8} 
              placeholder="Détaillez les missions, le profil recherché..." 
              defaultValue={job?.description ?? ''} 
              className="rounded-xl border border-black/8 bg-[#f8f9fc] focus:bg-white focus:ring-4 focus:ring-[#2CB8C5]/10 min-h-[160px] text-sm" 
            />
          </div>

          <div className="flex items-center gap-3 py-2 bg-[#f8f9fc] p-4 rounded-2xl border border-black/5">
            <Switch id="is_active" name="is_active" defaultChecked={job ? job.is_active ?? true : true} />
            <div className="flex-1">
              <Label htmlFor="is_active" className="text-sm font-bold text-[#3C3C3B]">Offre active</Label>
              <p className="text-[10px] text-[#3C3C3B]/40 uppercase font-black">Visible sur le job board alumni</p>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="rounded-xl border-black/8 h-11 px-6 font-bold"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-[#2CB8C5] px-8 h-11 font-black text-white shadow-lg shadow-[#2CB8C5]/20 hover:bg-[#2CB8C5]/90 transition-all hover:-translate-y-0.5"
            >
              {isPending ? 'Enregistrement…' : isEditing ? 'Mettre à jour' : 'Publier l’offre'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
