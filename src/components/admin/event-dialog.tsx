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
import { AlertTriangle, Calendar, MessageSquare } from 'lucide-react';
import { upsertPost } from '@/lib/actions/posts';
import type { Post } from '@/types';

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post | null;
  onSuccess?: () => void;
}

const fieldClass =
  'h-12 rounded-xl border border-black/8 bg-[#f8f9fc] px-4 text-sm font-medium text-[#3C3C3B] placeholder:text-[#3C3C3B]/30 outline-none transition-all focus:border-[#2CB8C5]/50 focus:bg-white focus:ring-4 focus:ring-[#2CB8C5]/10';

const labelClass = 'text-[10px] font-black uppercase tracking-[0.12em] text-[#3C3C3B]/45';

export function EventDialog({ open, onOpenChange, post, onSuccess }: EventDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const isEditing = !!post;

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    setError(null);

    const payload: Partial<Post> = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      type: formData.get('type') as 'event' | 'news',
      date: formData.get('date') ? new Date(formData.get('date') as string).toISOString() : null,
      location: formData.get('location') as string,
      image_url: formData.get('image_url') as string,
      is_published: formData.get('is_published') === 'on',
    };

    if (isEditing) {
      payload.id = post.id;
    }

    const result = await upsertPost(payload);
    setIsPending(false);
    
    if (!result.success) {
      setError(result.error || 'Une erreur est survenue');
      return;
    }
    
    if (onSuccess) onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[95vh] overflow-y-auto rounded-[40px] border-none shadow-2xl p-0">
        <div className="bg-[#3C3C3B] p-10 text-white relative">
            <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                {post?.type === 'news' ? <MessageSquare className="size-24" /> : <Calendar className="size-24" />}
            </div>
            <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2CB8C5] mb-2">
                    {isEditing ? 'Édition' : 'Création'}
                </p>
                <DialogTitle className="font-bricolage text-3xl font-black text-white">
                    {isEditing ? "Modifier l'article" : 'Publier un nouvel article'}
                </DialogTitle>
                <p className="text-white/40 text-sm font-medium mt-2">Détaillez votre événement ou actualité pour la communauté.</p>
            </div>
        </div>

        <form action={handleSubmit} className="p-10 space-y-8 bg-white">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-8 space-y-2">
              <Label htmlFor="title" className={labelClass}>Titre de l&apos;article *</Label>
              <Input id="title" name="title" required placeholder="Ex: Grand Gala Alumni 2026" defaultValue={post?.title ?? ''} className={fieldClass} />
            </div>
            <div className="col-span-12 md:col-span-4 space-y-2">
              <Label htmlFor="type" className={labelClass}>Catégorie *</Label>
              <Select name="type" defaultValue={post?.type ?? 'event'}>
                <SelectTrigger className="h-12 rounded-xl border-black/8 bg-[#f8f9fc] font-bold text-[#3C3C3B]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-black/5 shadow-xl">
                  <SelectItem value="event" className="rounded-xl font-bold py-3">Événement</SelectItem>
                  <SelectItem value="news" className="rounded-xl font-bold py-3">Actualité</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-6 space-y-2">
              <Label htmlFor="date" className={labelClass}>Date et heure (pour les évents)</Label>
              <Input 
                id="date" 
                name="date" 
                type="datetime-local" 
                defaultValue={post?.date ? new Date(new Date(post.date).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''} 
                className={fieldClass} 
              />
            </div>
            <div className="col-span-12 md:col-span-6 space-y-2">
              <Label htmlFor="location" className={labelClass}>Lieu (pour les évents)</Label>
              <Input id="location" name="location" placeholder="Ex: Campus MDS Paris / Zoom" defaultValue={post?.location ?? ''} className={fieldClass} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url" className={labelClass}>URL de l&apos;image de couverture</Label>
            <Input id="image_url" name="image_url" placeholder="https://images.unsplash.com/..." defaultValue={post?.image_url ?? ''} className={fieldClass} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className={labelClass}>Contenu de l&apos;article *</Label>
            <Textarea 
              id="content" 
              name="content" 
              required 
              rows={6} 
              placeholder="Décrivez votre événement ou partagez votre actualité..." 
              defaultValue={post?.content ?? ''} 
              className="rounded-2xl border border-black/8 bg-[#f8f9fc] focus:bg-white focus:ring-4 focus:ring-[#2CB8C5]/10 min-h-[120px] text-sm font-medium p-4" 
            />
          </div>

          <div className="flex items-center gap-4 py-4 px-6 bg-[#F8F9FB] rounded-2xl border border-black/5">
            <Switch id="is_published" name="is_published" defaultChecked={post ? post.is_published ?? true : true} />
            <div className="flex-1">
              <Label htmlFor="is_published" className="text-sm font-black text-[#3C3C3B] uppercase tracking-widest">Publier l&apos;article</Label>
              <p className="text-[10px] text-[#3C3C3B]/30 font-black uppercase tracking-widest">Sera immédiatement visible par tous les utilisateurs</p>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-500" />
              <p className="text-sm font-bold text-red-700">{error}</p>
            </div>
          )}

          <DialogFooter className="pt-2 border-t border-black/5 flex-col md:flex-row gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="rounded-xl border-black/8 h-12 px-8 font-black uppercase tracking-widest text-[10px] flex-1 md:flex-none"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-[#2CB8C5] px-10 h-12 font-black uppercase tracking-widest text-[10px] text-white shadow-lg shadow-[#2CB8C5]/20 hover:bg-[#2CB8C5]/90 transition-all hover:-translate-y-0.5 flex-1"
            >
              {isPending ? 'Enregistrement…' : isEditing ? 'Mettre à jour' : 'Publier l’article'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
