import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { scrapeLinkedInProfile, delayBetweenProfiles, isCriticalError } from '@/lib/services/linkedin-scraper';
import { downloadAndUploadAvatar } from '@/lib/services/avatar-upload';

export const maxDuration = 300;

async function checkAuth(req: Request): Promise<{ ok: boolean; error?: string; status?: number }> {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return { ok: true };

  const { cookies } = await import('next/headers');
  const { createClient } = await import('@/utils/supabase/server');
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Non autorisé', status: 401 };

  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { ok: false, error: 'Accès admin requis', status: 403 };

  return { ok: true };
}

export async function POST(req: Request) {
  const auth = await checkAuth(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = createAdminClient();

  const { data: profiles, error: fetchError } = await admin
    .from('profiles')
    .select('id, first_name, last_name, linkedin_pseudo')
    .eq('is_scrapped', false)
    .not('linkedin_pseudo', 'is', null)
    .not('linkedin_pseudo', 'eq', '');

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ type: 'complete', total: 0, succeeded: 0, failed: 0 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(data: Record<string, unknown>) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      send({ type: 'start', total: profiles.length });

      const errors: string[] = [];
      let succeeded = 0;
      let failed = 0;

      for (let i = 0; i < profiles.length; i++) {
        const profile = profiles[i];
        const name = `${profile.first_name} ${profile.last_name}`;

        if (i > 0) await delayBetweenProfiles();

        send({ type: 'progress', current: i + 1, total: profiles.length, name });

        console.log(`[Scrape] Processing ${name} (${profile.linkedin_pseudo})...`);
        const result = await scrapeLinkedInProfile(profile.linkedin_pseudo!);
        const scraped = result.success ? result.data : result.partialData;

        if (!result.success) {
          console.error(`[Scrape] ${name}: ${result.error}`);
          errors.push(`${name}: ${result.error}`);

          if (isCriticalError(result.error)) {
            send({ type: 'error', name, error: result.error, critical: true });
            failed++;
            break;
          }
        }

        let avatarUrl: string | null = null;
        const candidates = scraped?.avatarCandidates || (scraped?.avatarUrl ? [scraped.avatarUrl] : []);
        for (const candidateUrl of candidates) {
          avatarUrl = await downloadAndUploadAvatar(profile.id, candidateUrl);
          if (avatarUrl) {
            console.log(`[Scrape] ${name}: avatar downloaded from candidate ${candidates.indexOf(candidateUrl) + 1}/${candidates.length}`);
            break;
          }
        }

        const updateData: Record<string, unknown> = {
          avatar_url: avatarUrl,
          current_job_title: scraped?.currentJobTitle || null,
          current_company: scraped?.currentCompany || null,
          current_contract_type: scraped?.currentContractType || null,
          location_city: scraped?.locationCity || null,
          location_country: scraped?.locationCountry || null,
          is_scrapped: true,
          updated_at: new Date().toISOString(),
        };

        const { error: updateError } = await admin
          .from('profiles')
          .update(updateData)
          .eq('id', profile.id);

        if (updateError) {
          errors.push(`${name}: DB - ${updateError.message}`);
          failed++;
          send({ type: 'done', name, status: 'error', current: i + 1, total: profiles.length });
        } else {
          succeeded++;
          send({
            type: 'done',
            name,
            status: result.success ? 'success' : 'partial',
            current: i + 1,
            total: profiles.length,
            data: {
              jobTitle: scraped?.currentJobTitle || null,
              company: scraped?.currentCompany || null,
              hasAvatar: !!avatarUrl,
            },
          });
        }
      }

      send({ type: 'complete', total: profiles.length, succeeded, failed, errors });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
