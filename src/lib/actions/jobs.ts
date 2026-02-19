'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import type { Job } from '@/types';
import { SupabaseClient } from '@supabase/supabase-js';

type ActionResult<T = unknown> = { success: boolean; error?: string; data?: T };

const isAdmin = async (supabase: SupabaseClient) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  return data?.role === 'admin';
};

export const getJobById = async (id: string): Promise<Job | null> => {
  const supabase = createClient(await cookies());
  
  // Public users can see active jobs. Admins can see any job.
  const { data: { user } } = await supabase.auth.getUser();
  let isAdminUser = false;
  
  if (user) {
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    isAdminUser = data?.role === 'admin';
  }

  let query = supabase.from('jobs').select('*').eq('id', id).single();
  
  if (!isAdminUser) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;
  
  if (error || !data) return null;
  return data;
};

export const getJobs = async (filters?: { search?: string; contract_type?: string; sector?: string; adminView?: boolean }): Promise<Job[]> => {
  const supabase = createClient(await cookies());
  
  let query = supabase.from('jobs').select('*').order('created_at', { ascending: false });

  if (!filters?.adminView) {
    query = query.eq('is_active', true);
  }

  if (filters?.search) {
    const s = `%${filters.search}%`;
    query = query.or(`title.ilike.${s},company_name.ilike.${s},description.ilike.${s}`);
  }

  if (filters?.contract_type && filters.contract_type !== 'all') {
    query = query.eq('contract_type', filters.contract_type);
  }

  if (filters?.sector && filters.sector !== 'all') {
    query = query.eq('sector', filters.sector);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[getJobs]', error.message);
    return [];
  }
  return data || [];
};

export const upsertJob = async (job: Partial<Job>): Promise<ActionResult<Job>> => {
  const supabase = createClient(await cookies());
  if (!(await isAdmin(supabase))) return { success: false, error: 'Accès refusé' };

  const { data: { user } } = await supabase.auth.getUser();
  
  const payload = {
    ...job,
    user_id: job.id ? job.user_id : user?.id,
    // Ensure numeric fields are numbers or null
    salary_min: job.salary_min ? Number(job.salary_min) : null,
    salary_max: job.salary_max ? Number(job.salary_max) : null,
  };

  const { data, error } = await supabase.from('jobs').upsert(payload).select().single();

  if (error) return { success: false, error: error.message };
  
  revalidatePath('/jobs');
  revalidatePath('/admin/jobs');
  return { success: true, data };
};

export const deleteJob = async (id: string): Promise<ActionResult> => {
  const supabase = createClient(await cookies());
  if (!(await isAdmin(supabase))) return { success: false, error: 'Accès refusé' };

  const { error } = await supabase.from('jobs').delete().eq('id', id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/jobs');
  revalidatePath('/admin/jobs');
  return { success: true };
};

export const toggleJobActive = async (id: string, isActive: boolean): Promise<ActionResult> => {
    const supabase = createClient(await cookies());
    if (!(await isAdmin(supabase))) return { success: false, error: 'Accès refusé' };
  
    const { error } = await supabase.from('jobs').update({ is_active: isActive }).eq('id', id);
  
    if (error) return { success: false, error: error.message };
  
    revalidatePath('/jobs');
    revalidatePath('/admin/jobs');
    return { success: true };
  };
