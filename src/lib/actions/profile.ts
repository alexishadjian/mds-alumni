'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { cookies } from 'next/headers';
import { filterProfileByPrivacy } from '@/types';
import type { Profile } from '@/types';

type ActionResult = { success: boolean; error?: string };

export const getProfilesForDirectory = async (search?: string): Promise<Profile[]> => {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  const admin = createAdminClient();
  let query = admin
    .from('profiles')
    .select(`*, promotion_year(year, label), programs(name, slug)`)
    .neq('role', 'admin')
    .neq('role', 'viewer')
    .order('last_name');

  if (search?.trim()) {
    const s = `%${search.trim()}%`;
    query = query.or(`first_name.ilike.${s},last_name.ilike.${s},current_job_title.ilike.${s},current_company.ilike.${s}`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[getProfilesForDirectory]', error.message);
    return [];
  }
  const profiles = (data ?? []).map((p) => filterProfileByPrivacy(p as Profile, isAuthenticated));
  return profiles;
};

export const getProfileById = async (id: string): Promise<Profile | null> => {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  const { data, error } = await supabase
    .from('profiles')
    .select('*, promotion_year(year, label), programs(name, slug)')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  const { data: edu } = await supabase
    .from('education_experiences')
    .select('*')
    .eq('profile_id', id)
    .order('start_year', { ascending: false });

  const { data: pro } = await supabase
    .from('professional_experiences')
    .select('*')
    .eq('profile_id', id)
    .order('start_date', { ascending: false });

  const profile = {
    ...data,
    education_experiences: edu ?? [],
    professional_experiences: pro ?? [],
  } as Profile;

  return filterProfileByPrivacy(profile, isAuthenticated);
};

const canEditProfile = async (supabase: Awaited<ReturnType<typeof createClient>>, profileId: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  if (user.id === profileId) return true;
  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  return data?.role === 'admin';
};

export const updateProfile = async (profileId: string, data: Partial<Profile> | FormData): Promise<ActionResult> => {
  const payload: Record<string, unknown> =
    data instanceof FormData
      ? (() => {
          const SIMPLE = ['first_name', 'last_name', 'bio', 'current_job_title', 'current_company',
            'current_sector', 'current_contract_type', 'linkedin_url', 'location_city', 'location_country', 'avatar_url', 'visibility'];
          const out: Record<string, unknown> = Object.fromEntries(
            SIMPLE.map((k) => [k, (data.get(k) as string)?.trim() || null])
          );
          // Arrays — comma-separated textarea
          const skills = (data.get('skills_raw') as string)?.split(',').map(s => s.trim()).filter(Boolean);
          out.skills = skills?.length ? skills : null;
          // Mentor
          out.is_mentor = data.get('is_mentor') === 'on';
          return out;
        })()
      : data;
  const supabase = createClient(await cookies());
  if (!(await canEditProfile(supabase, profileId))) return { success: false, error: 'Non autorisé' };
  const { error } = await supabase.from('profiles').update(payload).eq('id', profileId);
  if (error) return { success: false, error: error.message };
  revalidatePath(`/profile/${profileId}`);
  revalidatePath('/');
  return { success: true };
};

export const createEducationExperience = async (profileId: string, data: { school_name: string; program?: string; start_year?: number; end_year?: number; description?: string }): Promise<ActionResult> => {
  const supabase = createClient(await cookies());
  if (!(await canEditProfile(supabase, profileId))) return { success: false, error: 'Non autorisé' };
  const { error } = await supabase.from('education_experiences').insert({ profile_id: profileId, ...data });
  if (error) return { success: false, error: error.message };
  revalidatePath(`/profile/${profileId}`);
  return { success: true };
};

export const updateEducationExperience = async (id: string, profileId: string, data: Partial<{ school_name: string; program: string; start_year: number; end_year: number; description: string }>): Promise<ActionResult> => {
  const supabase = createClient(await cookies());
  if (!(await canEditProfile(supabase, profileId))) return { success: false, error: 'Non autorisé' };
  const { error } = await supabase.from('education_experiences').update(data).eq('id', id).eq('profile_id', profileId);
  if (error) return { success: false, error: error.message };
  revalidatePath(`/profile/${profileId}`);
  return { success: true };
};

export const deleteEducationExperience = async (id: string, profileId: string): Promise<ActionResult> => {
  const supabase = createClient(await cookies());
  if (!(await canEditProfile(supabase, profileId))) return { success: false, error: 'Non autorisé' };
  const { error } = await supabase.from('education_experiences').delete().eq('id', id).eq('profile_id', profileId);
  if (error) return { success: false, error: error.message };
  revalidatePath(`/profile/${profileId}`);
  return { success: true };
};

export const createProfessionalExperience = async (profileId: string, data: { job_title: string; company_name: string; start_date?: string; end_date?: string; description?: string }): Promise<ActionResult> => {
  const supabase = createClient(await cookies());
  if (!(await canEditProfile(supabase, profileId))) return { success: false, error: 'Non autorisé' };
  const { error } = await supabase.from('professional_experiences').insert({ profile_id: profileId, ...data });
  if (error) return { success: false, error: error.message };
  revalidatePath(`/profile/${profileId}`);
  return { success: true };
};

export const updateProfessionalExperience = async (id: string, profileId: string, data: Partial<{ job_title: string; company_name: string; start_date: string; end_date: string; description: string }>): Promise<ActionResult> => {
  const supabase = createClient(await cookies());
  if (!(await canEditProfile(supabase, profileId))) return { success: false, error: 'Non autorisé' };
  const { error } = await supabase.from('professional_experiences').update(data).eq('id', id).eq('profile_id', profileId);
  if (error) return { success: false, error: error.message };
  revalidatePath(`/profile/${profileId}`);
  return { success: true };
};

export const deleteProfessionalExperience = async (id: string, profileId: string): Promise<ActionResult> => {
  const supabase = createClient(await cookies());
  if (!(await canEditProfile(supabase, profileId))) return { success: false, error: 'Non autorisé' };
  const { error } = await supabase.from('professional_experiences').delete().eq('id', id).eq('profile_id', profileId);
  if (error) return { success: false, error: error.message };
  revalidatePath(`/profile/${profileId}`);
  return { success: true };
};
