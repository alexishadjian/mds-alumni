'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { Post } from '@/types';
import { revalidatePath } from 'next/cache';

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

const isAdmin = async (supabase: any) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  return data?.role === 'admin';
};

export const getPosts = async (type?: 'event' | 'news'): Promise<Post[]> => {
  const supabase = createClient(await cookies());
  let query = supabase.from('posts').select('*').order('date', { ascending: false });
  
  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;
  if (error) return [];
  return data;
};

export const getPostById = async (id: string): Promise<Post | null> => {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase.from('posts').select('*').eq('id', id).single();
  if (error) return null;
  return data;
};

export const upsertPost = async (post: Partial<Post>): Promise<ActionResult<Post>> => {
  const supabase = createClient(await cookies());
  if (!(await isAdmin(supabase))) return { success: false, error: 'Accès refusé' };

  const { data: { user } } = await supabase.auth.getUser();
  
  const payload = {
    ...post,
    user_id: post.id ? post.user_id : user?.id,
  };

  const { data, error } = await supabase
    .from('posts')
    .upsert(payload)
    .select()
    .single();

  if (error) {
    console.error('Upsert post error:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/events');
  revalidatePath('/admin/events');
  return { success: true, data };
};

export const deletePost = async (id: string): Promise<ActionResult<void>> => {
  const supabase = createClient(await cookies());
  if (!(await isAdmin(supabase))) return { success: false, error: 'Accès refusé' };

  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/events');
  revalidatePath('/admin/events');
  return { success: true, data: undefined };
};
