import type { Database } from '@/lib/supabase';

export type Profile = Database['public']['Tables']['profiles']['Row'] & {
  promotion_year?: { year: number; label: string } | null;
  programs?: { name: string; slug: string } | null;
  education_experiences?: EducationExperience[];
  professional_experiences?: ProfessionalExperience[];
};

export type EducationExperience =
  Database['public']['Tables']['education_experiences']['Row'];
export type ProfessionalExperience =
  Database['public']['Tables']['professional_experiences']['Row'];

export type VisibilityLevel = 'public' | 'community' | 'private';

export type PrivacySettings = {
  email_visibility?: VisibilityLevel;
  phone_visibility?: VisibilityLevel;
  linkedin_visibility?: VisibilityLevel;
  city_visibility?: VisibilityLevel;
  company_visibility?: VisibilityLevel;
};

const DEFAULT_PRIVACY: PrivacySettings = {
  email_visibility: 'community',
  phone_visibility: 'private',
  linkedin_visibility: 'community',
  city_visibility: 'public',
  company_visibility: 'public',
};

/** Returns true if field should be visible based on privacy and auth status */
const isVisible = (
  level: VisibilityLevel | undefined,
  isAuthenticated: boolean,
): boolean => {
  if (!level || level === 'public') return true;
  if (level === 'private') return false;
  return isAuthenticated; // community
};

/** Filters profile fields by privacy settings. Returns a copy with hidden fields set to null. */
export const filterProfileByPrivacy = <T extends Partial<Profile>>(
  profile: T,
  isAuthenticated: boolean,
): T => {
  const settings = (profile.privacy_settings as PrivacySettings | null) ?? DEFAULT_PRIVACY;
  const out = { ...profile };

  if (!isVisible(settings.email_visibility, isAuthenticated)) out.email = null as never;
  if (!isVisible(settings.linkedin_visibility, isAuthenticated)) out.linkedin_url = null as never;
  if (!isVisible(settings.city_visibility, isAuthenticated)) {
    out.location_city = null as never;
    out.location_country = null as never;
  }
  if (!isVisible(settings.company_visibility, isAuthenticated)) {
    out.current_company = null as never;
    out.current_job_title = null as never;
  }

  return out;
};
