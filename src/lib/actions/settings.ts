'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export type SettingRow = {
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
};

export type LinkedInTokenStatus = 'valid' | 'expired' | 'not_configured' | 'unknown';

async function requireAdmin() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Non autorisé');

  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('Accès admin requis');
}

export async function getSettings(keys: string[]): Promise<SettingRow[]> {
  await requireAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin.from('app_settings').select('*').in('key', keys);
  if (error) throw new Error(error.message);
  return (data ?? []) as SettingRow[];
}

export async function updateSettings(
  settings: { key: string; value: string; description?: string }[]
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();

  for (const s of settings) {
    const { error } = await admin.from('app_settings').upsert(
      {
        key: s.key,
        value: s.value,
        ...(s.description ? { description: s.description } : {}),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );
    if (error) return { success: false, error: error.message };
  }

  revalidatePath('/admin/settings');
  return { success: true };
}

/**
 * Reads LinkedIn credentials from DB (admin client, bypasses RLS),
 * falling back to environment variables.
 */
export async function getLinkedInCredentials(): Promise<{
  liAt: string | null;
  jsessionId: string;
}> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('app_settings')
    .select('key, value')
    .in('key', ['linkedin_li_at', 'linkedin_jsessionid']);

  const map = new Map((data ?? []).map((r: { key: string; value: string }) => [r.key, r.value]));

  return {
    liAt: map.get('linkedin_li_at') || process.env.LINKEDIN_LI_AT || null,
    jsessionId: map.get('linkedin_jsessionid') || process.env.LINKEDIN_JSESSIONID || 'ajax:0',
  };
}

export async function getLinkedInTokenInfo(): Promise<{
  status: LinkedInTokenStatus;
  lastError: string | null;
  lastCheck: string | null;
  hasDbTokens: boolean;
  hasEnvTokens: boolean;
}> {
  await requireAdmin();
  const admin = createAdminClient();

  const { data } = await admin
    .from('app_settings')
    .select('key, value, updated_at')
    .in('key', [
      'linkedin_li_at',
      'linkedin_jsessionid',
      'linkedin_token_status',
      'linkedin_token_last_error',
      'linkedin_token_last_check',
    ]);

  const map = new Map(
    (data ?? []).map((r: { key: string; value: string; updated_at: string }) => [r.key, r])
  );

  const hasDbLiAt = !!map.get('linkedin_li_at')?.value;
  const hasEnvLiAt = !!process.env.LINKEDIN_LI_AT;

  const statusRaw = map.get('linkedin_token_status')?.value;
  let status: LinkedInTokenStatus = 'unknown';
  if (statusRaw === 'valid' || statusRaw === 'expired') {
    status = statusRaw;
  } else if (!hasDbLiAt && !hasEnvLiAt) {
    status = 'not_configured';
  }

  return {
    status,
    lastError: map.get('linkedin_token_last_error')?.value ?? null,
    lastCheck: map.get('linkedin_token_last_check')?.value ?? null,
    hasDbTokens: hasDbLiAt,
    hasEnvTokens: hasEnvLiAt,
  };
}

/**
 * Called by the scraper to update token status after a scrape attempt.
 * Uses admin client directly (no auth check — called from API route).
 */
export async function updateLinkedInTokenStatus(
  status: 'valid' | 'expired',
  error?: string
): Promise<void> {
  const admin = createAdminClient();

  const settings = [
    { key: 'linkedin_token_status', value: status },
    { key: 'linkedin_token_last_check', value: new Date().toISOString() },
  ];
  if (error) {
    settings.push({ key: 'linkedin_token_last_error', value: error });
  }

  for (const s of settings) {
    await admin
      .from('app_settings')
      .upsert({ ...s, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  }
}
