'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { cookies } from 'next/headers';
import { filterProfileByPrivacy } from '@/types';
import type { Profile } from '@/types';
import { local } from '@/lib/local-data';

type ActionResult = { success: boolean; error?: string };

export interface DirectoryFilters {
  search?: string;
  promotion?: string;
  program?: string;
  city?: string;
  country?: string;
}

export const getProfilesForDirectory = async (filters: DirectoryFilters = {}): Promise<Profile[]> => {
  try {
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

    if (filters.search?.trim()) {
      const s = `%${filters.search.trim()}%`;
      query = query.or(`first_name.ilike.${s},last_name.ilike.${s},current_job_title.ilike.${s},current_company.ilike.${s}`);
    }
    if (filters.promotion) query = query.eq('promotion_year_id', filters.promotion);
    if (filters.program) query = query.eq('program_id', filters.program);
    if (filters.city) query = query.ilike('location_city', filters.city);
    if (filters.country) query = query.ilike('location_country', filters.country);

    const { data, error } = await query;
    if (error) throw error;

    return (data ?? []).map((p) => filterProfileByPrivacy(p as Profile, isAuthenticated));
  } catch (e) {
    console.warn('[getProfilesForDirectory] Supabase indisponible, fallback local', e);
    return getProfilesFromLocal(filters);
  }
};

function getProfilesFromLocal(filters: DirectoryFilters): Profile[] {
  const promotions = local.promotions();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let rows = local.profiles() as any[];

  if (filters.search?.trim()) {
    const s = filters.search.trim().toLowerCase();
    rows = rows.filter((p) =>
      [p.first_name, p.last_name, p.current_job_title, p.current_company]
        .some((v) => v?.toLowerCase().includes(s))
    );
  }
  if (filters.promotion) rows = rows.filter((p) => String(p.promotion_year_id) === filters.promotion);
  if (filters.city) rows = rows.filter((p) => p.location_city?.toLowerCase() === filters.city!.toLowerCase());
  if (filters.country) rows = rows.filter((p) => p.location_country?.toLowerCase() === filters.country!.toLowerCase());

  return rows.map((p) => {
    const promo = promotions.find((pr: { id: number }) => pr.id === p.promotion_year_id);
    return filterProfileByPrivacy({
      ...p,
      promotion_year: promo ? { year: promo.year, label: promo.label } : null,
      programs: null,
    } as Profile, false);
  });
}

export const getDirectoryFilterOptions = async () => {
  try {
    const admin = createAdminClient();

    const [promotionsRes, programsRes, citiesRes, countriesRes] = await Promise.all([
      admin.from('promotion_year').select('id, year, label').order('year', { ascending: false }),
      admin.from('programs').select('id, name').order('name'),
      admin.from('profiles').select('location_city').neq('role', 'admin').not('location_city', 'is', null).not('location_city', 'eq', ''),
      admin.from('profiles').select('location_country').neq('role', 'admin').not('location_country', 'is', null).not('location_country', 'eq', ''),
    ]);

    if (promotionsRes.error) throw promotionsRes.error;

    const cities = [...new Set((citiesRes.data ?? []).map((p) => p.location_city as string))].sort();
    const countries = [...new Set((countriesRes.data ?? []).map((p) => p.location_country as string))].sort();

    return {
      promotions: (promotionsRes.data ?? []) as { id: number; year: number; label: string | null }[],
      programs: (programsRes.data ?? []) as { id: number; name: string }[],
      cities,
      countries,
    };
  } catch (e) {
    console.warn('[getDirectoryFilterOptions] Supabase indisponible, fallback local', e);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profiles = local.profiles() as any[];
    return {
      promotions: local.promotions().map((p: { id: number; year: number; label: string }) => ({ id: p.id, year: p.year, label: p.label })),
      programs: [] as { id: number; name: string }[],
      cities: [...new Set(profiles.map((p) => p.location_city).filter(Boolean) as string[])].sort(),
      countries: [...new Set(profiles.map((p) => p.location_country).filter(Boolean) as string[])].sort(),
    };
  }
};

export const getProfileById = async (id: string): Promise<Profile | null> => {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    const isAuthenticated = !!user;

    const { data, error } = await supabase
      .from('profiles')
      .select('*, promotion_year(year, label), programs(name, slug)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

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
  } catch (e) {
    console.warn('[getProfileById] Supabase indisponible, fallback local', e);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = (local.profiles() as any[]).find((pr) => pr.id === id);
    if (!p) return null;
    const promo = local.promotions().find((pr: { id: number }) => pr.id === p.promotion_year_id);
    return filterProfileByPrivacy({
      ...p,
      promotion_year: promo ? { year: promo.year, label: promo.label } : null,
      programs: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      education_experiences: (local.educationExperiences() as any[]).filter((e) => e.profile_id === id),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      professional_experiences: (local.professionalExperiences() as any[]).filter((e) => e.profile_id === id),
    } as Profile, false);
  }
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
