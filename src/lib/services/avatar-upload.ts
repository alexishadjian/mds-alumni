import { createAdminClient } from '@/utils/supabase/admin';

function buildDownloadHeaders(imageUrl: string): Record<string, string> {
  const headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
    Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
    Referer: 'https://www.linkedin.com/',
    Origin: 'https://www.linkedin.com',
    'Sec-Ch-Ua': '"Chromium";v="136", "Not_A Brand";v="24", "Google Chrome";v="136"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"macOS"',
    'Sec-Fetch-Dest': 'image',
    'Sec-Fetch-Mode': 'no-cors',
    'Sec-Fetch-Site': 'cross-site',
  };

  if (imageUrl.includes('licdn.com') || imageUrl.includes('linkedin.com')) {
    const liAt = process.env.LINKEDIN_LI_AT;
    const jsid = process.env.LINKEDIN_JSESSIONID || 'ajax:0';
    if (liAt) {
      headers.Cookie = `li_at=${liAt}; JSESSIONID="${jsid}"; lang=v=2&lang=fr-fr`;
    }
  }

  return headers;
}

async function tryDownload(imageUrl: string): Promise<Response | null> {
  const res = await fetch(imageUrl, { headers: buildDownloadHeaders(imageUrl) });
  if (res.ok) return res;

  // Retry without cookies -- some CDN URLs are public and cookies cause 403
  if (res.status === 403) {
    const minimalHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
      Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      Referer: 'https://www.linkedin.com/',
    };
    const retry = await fetch(imageUrl, { headers: minimalHeaders });
    if (retry.ok) return retry;
  }

  return null;
}

export async function downloadAndUploadAvatar(
  profileId: string,
  imageUrl: string
): Promise<string | null> {
  try {
    const res = await tryDownload(imageUrl);
    if (!res) {
      console.error(`Avatar download failed for ${profileId}: all attempts failed`);
      return null;
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await res.arrayBuffer());

    const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
    const path = `${profileId}.${ext}`;

    const admin = createAdminClient();

    const { error: uploadError } = await admin.storage
      .from('avatars')
      .upload(path, buffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error(`Avatar upload failed for ${profileId}:`, uploadError.message);
      return null;
    }

    const { data: urlData } = admin.storage.from('avatars').getPublicUrl(path);

    return urlData.publicUrl;
  } catch (err) {
    console.error(`Avatar download/upload failed for ${profileId}:`, err);
    return null;
  }
}
