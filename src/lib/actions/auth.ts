'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export const signIn = async (formData: FormData) => {
  const supabase = createClient(await cookies());
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  redirect('/');
};

export const signUp = async (formData: FormData) => {
  const supabase = createClient(await cookies());
  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });
  if (error) redirect(`/register?error=${encodeURIComponent(error.message)}`);
  redirect('/');
};

export const signOut = async () => {
  const supabase = createClient(await cookies());
  await supabase.auth.signOut();
  redirect('/login');
};
