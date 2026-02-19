import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/** Bypasses RLS - use only for server-side reads (e.g. public directory) */
export const createAdminClient = () =>
  createClient(supabaseUrl, serviceRoleKey);
