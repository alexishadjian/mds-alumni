/**
 * Fallback : lecture des données JSON locales (db-export/data/)
 * Utilisé uniquement si Supabase est indisponible.
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'db-export', 'data');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function load(file: string): any[] {
  try {
    return JSON.parse(readFileSync(join(DATA_DIR, file), 'utf-8'));
  } catch {
    return [];
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache: Record<string, any[]> = {};

export const local = {
  profiles: () => (cache.profiles ??= load('profiles.json')),
  promotions: () => (cache.promotions ??= load('promotion_year.json')),
  educationExperiences: () => (cache.edu ??= load('education_experiences.json')),
  professionalExperiences: () => (cache.pro ??= load('professional_experiences.json')),
};
