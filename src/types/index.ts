import type { Database } from '@/lib/supabase';

export type Profile = Database['public']['Tables']['profiles']['Row'] & {
  promotion_year?: { year: number; label: string } | null;
  programs?: { name: string; slug: string } | null;
  education_experiences?: EducationExperience[];
  professional_experiences?: ProfessionalExperience[];
  visibility: VisibilityLevel;
};

export type EducationExperience =
  Database['public']['Tables']['education_experiences']['Row'];
export type ProfessionalExperience =
  Database['public']['Tables']['professional_experiences']['Row'];

export type Job = {
  id: string;
  user_id: string | null;
  title: string;
  company_name: string;
  description: string;
  contract_type: 'cdi' | 'cdd' | 'freelance' | 'stage' | 'alternance';
  location: string | null;
  exact_location: string | null;
  apply_url: string | null;
  is_active: boolean | null;
  created_at: string | null;
  sector: string | null;
  salary_min: number | null;
  salary_max: number | null;
  remote_policy: string | null;
  experience_level: string | null;
  benefits: string[] | null;
};

export type Post = {
  id: string;
  user_id: string | null;
  title: string;
  content: string;
  type: 'event' | 'news';
  date: string | null;
  location: string | null;
  image_url: string | null;
  is_published: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

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
  const globalVisibility = (profile.visibility as VisibilityLevel) || 'public';
  const settings = (profile.privacy_settings as PrivacySettings | null) ?? DEFAULT_PRIVACY;
  const out = { ...profile };

  // 1. Check global visibility
  // If private OR (community and not authenticated), we only keep name and job title.
  const isAuthorizedForCommunity = isAuthenticated; // In this app, being authenticated implies having a role
  const isGlobalPrivate = globalVisibility === 'private';
  const isGlobalRestricted = globalVisibility === 'community' && !isAuthorizedForCommunity;

  if (isGlobalPrivate || isGlobalRestricted) {
    // Keep ONLY name and job info (which are public by definition of this requirement)
    // Mask everything else
    out.email = null as never;
    out.linkedin_url = null as never;
    out.location_city = null as never;
    out.location_country = null as never;
    out.bio = null as never;
    out.skills = null as never;
    out.avatar_url = null as never;
    out.promotion_year = null as never;
    out.programs = null as never;
    
    // Experiences are also masked
    if (out.education_experiences) out.education_experiences = [] as never;
    if (out.professional_experiences) out.professional_experiences = [] as never;
    
    return out;
  }

  // 2. Apply granular privacy settings if global is public or authorized community
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
