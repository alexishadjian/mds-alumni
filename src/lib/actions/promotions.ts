'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function getPromotions() {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase
    .from('promotion_year')
    .select('*')
    .order('year', { ascending: false });

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export async function createPromotion(formData: FormData) {
  const year = Number(formData.get('year'));
  const label = (formData.get('label') as string)?.trim() || null;

  if (!year || year < 2000 || year > 2100) {
    return { success: false as const, error: 'Année invalide' };
  }

  const supabase = createClient(await cookies());
  const { error } = await supabase.from('promotion_year').insert({ year, label });

  if (error) {
    if (error.code === '23505') {
      return { success: false as const, error: 'Cette promotion existe déjà' };
    }
    return { success: false as const, error: error.message };
  }

  revalidatePath('/admin/promotions');
  return { success: true as const };
}

export async function updatePromotion(id: number, formData: FormData) {
  const year = Number(formData.get('year'));
  const label = (formData.get('label') as string)?.trim() || null;

  if (!year || year < 2000 || year > 2100) {
    return { success: false as const, error: 'Année invalide' };
  }

  const supabase = createClient(await cookies());
  const { error } = await supabase
    .from('promotion_year')
    .update({ year, label })
    .eq('id', id);

  if (error) {
    if (error.code === '23505') {
      return { success: false as const, error: 'Cette promotion existe déjà' };
    }
    return { success: false as const, error: error.message };
  }

  revalidatePath('/admin/promotions');
  return { success: true as const };
}

export async function deletePromotion(id: number) {
  const supabase = createClient(await cookies());
  const { error } = await supabase
    .from('promotion_year')
    .delete()
    .eq('id', id);

  if (error) return { success: false as const, error: error.message };

  revalidatePath('/admin/promotions');
  return { success: true as const };
}
