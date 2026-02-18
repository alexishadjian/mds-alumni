# Database Schema (Supabase/PostgreSQL)

```sql
-- Tables: events, jobs, profiles, programs, promotion_year, student_bonus

CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date timestamp with time zone NOT NULL,
  location text,
  type text CHECK (type = ANY (ARRAY['school'::text, 'alumni'::text])),
  image_url text,
  registration_link text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT events_pkey PRIMARY KEY (id)
);

CREATE TABLE public.jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  title text NOT NULL,
  company_name text NOT NULL,
  description text NOT NULL,
  contract_type text NOT NULL,
  location text,
  apply_url text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT jobs_pkey PRIMARY KEY (id),
  CONSTRAINT jobs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  first_name text,
  last_name text,
  avatar_url text,
  promotion_year_id bigint,
  program_id bigint,
  role text DEFAULT 'student',
  current_job_title text,
  current_company text,
  current_sector text,
  current_contract_type text,
  linkedin_url text,
  bio text,
  skills text[],
  location_city text,
  location_country text,
  is_mentor boolean DEFAULT false,
  mentor_topics text[],
  privacy_settings jsonb DEFAULT '{"email_visibility": "community", "phone_visibility": "private"}'::jsonb,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT profiles_promotion_year_id_fkey FOREIGN KEY (promotion_year_id) REFERENCES public.promotion_year(id),
  CONSTRAINT profiles_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id)
);

CREATE TABLE public.programs (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  CONSTRAINT programs_pkey PRIMARY KEY (id)
);

CREATE TABLE public.promotion_year (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  year integer NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT promotion_year_pkey PRIMARY KEY (id)
);

CREATE TABLE public.student_bonus (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  partner_name text NOT NULL,
  logo_url text,
  description text NOT NULL,
  promo_code text,
  claim_link text,
  expiration_date date,
  CONSTRAINT student_bonus_pkey PRIMARY KEY (id)
);
```
