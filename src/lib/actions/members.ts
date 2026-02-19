'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

type MemberCsvRow = {
  firstname: string;
  lastname: string;
  promotion_name: string;
  promotion_year: string;
  role: string;
  email: string;
};

type CsvParsedRow = MemberCsvRow & {
  lineNumber: number;
};

type ValidatedCsvRow = CsvParsedRow & {
  normalizedPromotionYear: number;
  normalizedRole: 'student' | 'alumni';
  normalizedEmail: string;
};

type CsvPreviewData = {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  studentsFound: number;
  alumniFound: number;
  rowsWithoutPromotion: number;
  missingPromotionNames: string[];
  errors: string[];
};

const CSV_HEADERS: Array<keyof MemberCsvRow> = [
  'firstname',
  'lastname',
  'promotion_name',
  'promotion_year',
  'role',
  'email',
];

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase();
}

function parseMembersCsv(csvContent: string) {
  const content = csvContent.trim();

  if (!content) {
    return { success: false as const, error: 'Le fichier CSV est vide.' };
  }

  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return { success: false as const, error: 'Le CSV doit contenir un en-tête et au moins une ligne.' };
  }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const missingHeaders = CSV_HEADERS.filter((header) => !headers.includes(header));

  if (missingHeaders.length > 0) {
    return {
      success: false as const,
      error: `Colonnes manquantes: ${missingHeaders.join(', ')}`,
    };
  }

  const columnIndex = Object.fromEntries(
    CSV_HEADERS.map((header) => [header, headers.indexOf(header)])
  ) as Record<keyof MemberCsvRow, number>;

  const rows: CsvParsedRow[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const values = parseCsvLine(lines[i]);

    rows.push({
      lineNumber: i + 1,
      firstname: values[columnIndex.firstname]?.trim() ?? '',
      lastname: values[columnIndex.lastname]?.trim() ?? '',
      promotion_name: values[columnIndex.promotion_name]?.trim() ?? '',
      promotion_year: values[columnIndex.promotion_year]?.trim() ?? '',
      role: values[columnIndex.role]?.trim().toLowerCase() ?? '',
      email: values[columnIndex.email]?.trim().toLowerCase() ?? '',
    });
  }

  return {
    success: true as const,
    data: {
      totalRows: rows.length,
      rows,
    },
  };
}

function validateParsedRows(rows: CsvParsedRow[]) {
  const errors: string[] = [];
  const validRows: ValidatedCsvRow[] = [];

  for (const row of rows) {
    if (!row.email) {
      errors.push(`Ligne ${row.lineNumber}: email manquant.`);
      continue;
    }

    if (!['student', 'alumni'].includes(row.role)) {
      errors.push(`Ligne ${row.lineNumber}: role invalide (${row.role}). Valeurs autorisées: student, alumni.`);
      continue;
    }

    const promotionYear = Number.parseInt(row.promotion_year, 10);
    if (!Number.isFinite(promotionYear)) {
      errors.push(`Ligne ${row.lineNumber}: promotion_year invalide (${row.promotion_year}).`);
      continue;
    }

    validRows.push({
      ...row,
      normalizedPromotionYear: promotionYear,
      normalizedRole: row.role as 'student' | 'alumni',
      normalizedEmail: row.email.toLowerCase(),
    });
  }

  return { validRows, errors };
}

export async function getMembers(search?: string) {
  const supabase = createClient(await cookies());

  let query = supabase
    .from('profiles')
    .select('*, promotion_year(id, year, label)')
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data };
}

export async function createMember(formData: FormData) {
  const email = (formData.get('email') as string)?.trim();
  const firstName = (formData.get('first_name') as string)?.trim() || null;
  const lastName = (formData.get('last_name') as string)?.trim() || null;
  const role = (formData.get('role') as string) || 'student';
  const promotionYearId = formData.get('promotion_year_id')
    ? Number(formData.get('promotion_year_id'))
    : null;

  if (!email) {
    return { success: false as const, error: 'Email requis' };
  }

  try {
    const admin = createAdminClient();

    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.includes('already been registered')) {
        return { success: false as const, error: 'Cet email est déjà utilisé' };
      }
      return { success: false as const, error: authError.message };
    }

    const { error: profileError } = await admin.from('profiles').upsert({
      id: authUser.user.id,
      email,
      first_name: firstName,
      last_name: lastName,
      role,
      promotion_year_id: promotionYearId,
    });

    if (profileError) {
      return { success: false as const, error: profileError.message };
    }

    revalidatePath('/admin/members');
    return { success: true as const };
  } catch {
    return { success: false as const, error: 'SUPABASE_SERVICE_ROLE_KEY non configurée. Ajoutez-la dans .env' };
  }
}

export async function updateMember(id: string, formData: FormData) {
  const firstName = (formData.get('first_name') as string)?.trim() || null;
  const lastName = (formData.get('last_name') as string)?.trim() || null;
  const role = (formData.get('role') as string) || 'student';
  const promotionYearId = formData.get('promotion_year_id')
    ? Number(formData.get('promotion_year_id'))
    : null;

  const supabase = createClient(await cookies());
  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: firstName,
      last_name: lastName,
      role,
      promotion_year_id: promotionYearId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) return { success: false as const, error: error.message };

  revalidatePath('/admin/members');
  return { success: true as const };
}

export async function deleteMember(id: string) {
  try {
    const admin = createAdminClient();

    const { error: authError } = await admin.auth.admin.deleteUser(id);
    if (authError) return { success: false as const, error: authError.message };

    revalidatePath('/admin/members');
    return { success: true as const };
  } catch {
    return { success: false as const, error: 'SUPABASE_SERVICE_ROLE_KEY non configurée. Ajoutez-la dans .env' };
  }
}

export async function previewMembersCsv(csvContent: string) {
  const parsed = parseMembersCsv(csvContent);
  if (!parsed.success) {
    return parsed;
  }

  const { validRows, errors } = validateParsedRows(parsed.data.rows);

  try {
    const admin = createAdminClient();
    const { data: promotions, error: promotionsError } = await admin
      .from('promotion_year')
      .select('year');

    if (promotionsError) {
      return { success: false as const, error: promotionsError.message };
    }

    const existingYears = new Set((promotions ?? []).map((promotion) => promotion.year));
    const missingPromotionNamesSet = new Set<string>();

    for (const row of validRows) {
      if (!existingYears.has(row.normalizedPromotionYear)) {
        missingPromotionNamesSet.add(row.promotion_name || `Promotion ${row.normalizedPromotionYear}`);
      }
    }

    const rowsWithoutPromotion = validRows.filter(
      (row) => !existingYears.has(row.normalizedPromotionYear)
    ).length;

    const preview: CsvPreviewData = {
      totalRows: parsed.data.totalRows,
      validRows: validRows.length,
      invalidRows: parsed.data.totalRows - validRows.length,
      studentsFound: validRows.filter((row) => row.normalizedRole === 'student').length,
      alumniFound: validRows.filter((row) => row.normalizedRole === 'alumni').length,
      rowsWithoutPromotion,
      missingPromotionNames: Array.from(missingPromotionNamesSet).sort((a, b) =>
        a.localeCompare(b, 'fr')
      ),
      errors,
    };

    return { success: true as const, data: preview };
  } catch {
    return {
      success: false as const,
      error: 'SUPABASE_SERVICE_ROLE_KEY non configurée. Ajoutez-la dans .env',
    };
  }
}

export async function importMembersCsv(csvContent: string) {
  const parsed = parseMembersCsv(csvContent);
  if (!parsed.success) {
    return parsed;
  }

  const { validRows, errors: previewErrors } = validateParsedRows(parsed.data.rows);

  try {
    const admin = createAdminClient();
    const { data: promotions, error: promotionsError } = await admin
      .from('promotion_year')
      .select('id, year');

    if (promotionsError) {
      return { success: false as const, error: promotionsError.message };
    }

    const promotionIdByYear = new Map<number, number>(
      (promotions ?? []).map((promotion) => [promotion.year, promotion.id])
    );
    let imported = 0;
    let skipped = 0;
    let importedWithoutPromotion = 0;
    const errors: string[] = [...previewErrors];

    for (const row of validRows) {
      const lineNumber = row.lineNumber;
      const promotionId = promotionIdByYear.get(row.normalizedPromotionYear) ?? null;
      if (!promotionId) importedWithoutPromotion += 1;

      const { data: authUser, error: authError } = await admin.auth.admin.createUser({
        email: row.normalizedEmail,
        email_confirm: true,
      });

      if (authError || !authUser.user) {
        if (authError?.message.includes('already been registered')) {
          skipped += 1;
          errors.push(`Ligne ${lineNumber}: email déjà utilisé (${row.email}).`);
          continue;
        }

        errors.push(`Ligne ${lineNumber}: erreur création utilisateur (${authError?.message ?? 'inconnue'}).`);
        skipped += 1;
        continue;
      }

      const { error: profileError } = await admin.from('profiles').upsert({
        id: authUser.user.id,
        email: row.normalizedEmail,
        first_name: row.firstname || null,
        last_name: row.lastname || null,
        role: row.normalizedRole,
        promotion_year_id: promotionId,
      });

      if (profileError) {
        await admin.auth.admin.deleteUser(authUser.user.id);
        errors.push(`Ligne ${lineNumber}: erreur création profil (${profileError.message}).`);
        skipped += 1;
        continue;
      }

      imported += 1;
    }

    skipped += parsed.data.totalRows - validRows.length;

    revalidatePath('/admin/members');

    return {
      success: true as const,
      data: {
        totalRows: parsed.data.totalRows,
        imported,
        skipped,
        importedWithoutPromotion,
        errors,
      },
    };
  } catch {
    return {
      success: false as const,
      error: 'SUPABASE_SERVICE_ROLE_KEY non configurée. Ajoutez-la dans .env',
    };
  }
}
