export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          promotion_year_id: number | null;
          program_id: number | null;
          role: 'admin' | 'alumni' | 'student' | 'viewer' | null;
          current_job_title: string | null;
          current_company: string | null;
          current_sector: string | null;
          current_contract_type: string | null;
          linkedin_url: string | null;
          bio: string | null;
          skills: string[] | null;
          location_city: string | null;
          location_country: string | null;
          is_mentor: boolean | null;
          mentor_topics: string[] | null;
          privacy_settings: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
      };
      education_experiences: {
        Row: {
          id: string;
          profile_id: string;
          school_name: string;
          program: string | null;
          start_year: number | null;
          end_year: number | null;
          description: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
      };
      professional_experiences: {
        Row: {
          id: string;
          profile_id: string;
          job_title: string;
          company_name: string;
          start_date: string | null;
          end_date: string | null;
          description: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
      };
    };
  };
};
