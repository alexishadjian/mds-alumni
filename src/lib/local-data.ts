/**
 * Fallback : read local JSON data (db-export/data/)
 * Used only if Supabase is unavailable.
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'db-export', 'data');

function load<T>(file: string): T[] {
  try {
    return JSON.parse(readFileSync(join(DATA_DIR, file), 'utf-8'));
  } catch {
    return [];
  }
}

const cache: Record<string, unknown[]> = {};

export const local = {
  profiles: () => (cache.profiles ??= load('profiles.json')),
  promotions: () => (cache.promotions ??= load('promotion_year.json')),
  educationExperiences: () => (cache.edu ??= load('education_experiences.json')),
  professionalExperiences: () => (cache.pro ??= load('professional_experiences.json')),
};
