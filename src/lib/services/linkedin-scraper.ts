const VOYAGER_API = 'https://www.linkedin.com/voyager/api';
const GRAPHQL_QUERY_ID = 'voyagerIdentityDashProfiles.8ca6ef03f32147a4d49324ed99a3d978';

const DELAY_MS = { min: 400, max: 800 };
const DELAY_BETWEEN_PROFILES_MS = { min: 1500, max: 3000 };

const COUNTRY_CODES: Record<string, string> = {
  fr: 'France', us: 'États-Unis', gb: 'Royaume-Uni', de: 'Allemagne',
  es: 'Espagne', it: 'Italie', be: 'Belgique', ch: 'Suisse',
  ca: 'Canada', nl: 'Pays-Bas', pt: 'Portugal', lu: 'Luxembourg',
  ma: 'Maroc', tn: 'Tunisie', dz: 'Algérie', sn: 'Sénégal',
  ie: 'Irlande', at: 'Autriche', se: 'Suède', no: 'Norvège',
  dk: 'Danemark', fi: 'Finlande', pl: 'Pologne', cz: 'Tchéquie',
};

const EMPLOYMENT_TYPES: Record<string, string> = {
  '1': 'cdi', '2': 'cdd', '3': 'freelance',
  '4': 'freelance', '5': 'cdd', '6': 'stage',
  '7': 'alternance', '8': 'cdd',
  '9': 'cdi', '10': 'cdd',
  '19': 'alternance', '20': 'stage',
};

export interface LinkedInCredentials {
  liAt: string;
  jsessionId: string;
}

export interface LinkedInScrapedData {
  avatarUrl: string | null;
  avatarCandidates: string[];
  currentJobTitle: string | null;
  currentCompany: string | null;
  currentContractType: string | null;
  locationCity: string | null;
  locationCountry: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyJson = Record<string, any>;

// --- Utilities ---

function randomDelay(range: { min: number; max: number }): Promise<void> {
  const ms = range.min + Math.floor(Math.random() * (range.max - range.min));
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function delayBetweenProfiles(): Promise<void> {
  return randomDelay(DELAY_BETWEEN_PROFILES_MS);
}

export function isCriticalError(error: string): boolean {
  return error.includes('Cookie LinkedIn expiré') || error.includes('Rate limit');
}

function parseLocation(locationStr: string | null): { city: string | null; country: string | null } {
  if (!locationStr) return { city: null, country: null };
  const parts = locationStr.split(',').map((s) => s.trim());
  return {
    city: parts[0] || null,
    country: parts.length > 1 ? parts[parts.length - 1] : null,
  };
}

function checkResponse(res: Response): string | null {
  if (res.status === 301 || res.status === 302) return 'Cookie LinkedIn expiré ou invalide';
  if (res.status === 401 || res.status === 403) return 'Cookie LinkedIn expiré ou invalide';
  if (res.status === 429) return 'Rate limit LinkedIn atteint';
  if (!res.ok) return `LinkedIn HTTP ${res.status}`;
  return null;
}

// --- Auth helpers ---

function getLiAt(creds?: LinkedInCredentials): string {
  if (creds?.liAt) return creds.liAt;
  const v = process.env.LINKEDIN_LI_AT;
  if (!v) throw new Error('LINKEDIN_LI_AT non configuré');
  return v;
}

function getJsessionId(creds?: LinkedInCredentials): string {
  if (creds?.jsessionId) return creds.jsessionId;
  return process.env.LINKEDIN_JSESSIONID || 'ajax:0';
}

// --- Step 1: Public avatar (no auth) ---

function extractOgImage(html: string): string | null {
  const patterns = [
    /<meta[^>]+property="og:image"[^>]+content="([^"]+)"/,
    /<meta[^>]+content="([^"]+)"[^>]+property="og:image"/,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m?.[1]?.includes('licdn.com') && !m[1].includes('ghost') && !m[1].includes('company-logo')) {
      return m[1];
    }
  }
  return null;
}

async function fetchPublicAvatar(pseudo: string): Promise<string | null> {
  try {
    const res = await fetch(`https://www.linkedin.com/in/${pseudo}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
        Accept: 'text/html',
      },
      redirect: 'follow',
    });
    if (!res.ok) return null;
    return extractOgImage(await res.text());
  } catch {
    return null;
  }
}

function buildVectorImageUrl(v: AnyJson, artifact: AnyJson): string | null {
  const seg = artifact.fileIdentifyingUrlPathSegment;
  if (!seg) return null;
  const rootUrl = v.rootUrl;
  if (rootUrl) return `${rootUrl}${seg}`;
  return `https://media.licdn.com/dms/image/${seg}`;
}

function extractAllAvatarCandidates(entities: AnyJson[], logPrefix?: string): string[] {
  const candidates: string[] = [];
  const vectors = entities.filter(
    (e) => e.$type === 'com.linkedin.common.VectorImage' && Array.isArray(e.artifacts)
  );

  if (logPrefix) {
    const segSamples = vectors.flatMap((v) =>
      (v.artifacts || []).slice(0, 1).map((a: AnyJson) => a.fileIdentifyingUrlPathSegment?.substring(0, 60))
    ).filter(Boolean);
    console.log(`[Scrape] ${logPrefix} VectorImages: ${vectors.length}, sample segs: ${segSamples.join(' | ') || 'none'}`);
  }

  // Pass 1: any profile photo artifacts (displayphoto, framedphoto, etc.)
  const profilePhotoPatterns = ['profile-displayphoto', 'profile-framedphoto', 'profile-original'];
  for (const v of vectors) {
    const isProfilePhoto = v.artifacts?.some(
      (a: AnyJson) => profilePhotoPatterns.some((p) => a.fileIdentifyingUrlPathSegment?.includes(p))
    );
    if (!isProfilePhoto) continue;
    const sorted = [...(v.artifacts || [])]
      .filter((a: AnyJson) => a.width && a.height)
      .sort((a: AnyJson, b: AnyJson) => (b.width || 0) - (a.width || 0));
    for (const art of sorted) {
      const url = buildVectorImageUrl(v, art);
      if (url && !candidates.includes(url)) candidates.push(url);
    }
  }

  // Pass 2: square or near-square images >= 100px (excluding banner-like images)
  for (const v of vectors) {
    const arts = v.artifacts
      ?.filter((a: AnyJson) => {
        if (!a.width || !a.height) return false;
        const ratio = a.width / a.height;
        return ratio >= 0.8 && ratio <= 1.25 && a.width >= 100;
      })
      ?.sort((a: AnyJson, b: AnyJson) => (b.width || 0) - (a.width || 0)) || [];
    for (const art of arts) {
      const url = buildVectorImageUrl(v, art);
      if (url && !candidates.includes(url)) candidates.push(url);
    }
  }

  return candidates;
}

// --- Step 2: Authenticated HTML page (location + session setup) ---

function buildBrowserHeaders(creds?: LinkedInCredentials): Record<string, string> {
  return {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
    Cookie: `li_at=${getLiAt(creds)}; JSESSIONID="${getJsessionId(creds)}"; lang=v=2&lang=fr-fr`,
    'Sec-Ch-Ua': '"Chromium";v="136", "Not_A Brand";v="24", "Google Chrome";v="136"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"macOS"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
  };
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&quot;/g, '"').replace(/&#61;/g, '=')
    .replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function collectTypedEntities(obj: unknown, result: AnyJson[], depth = 0): void {
  if (!obj || typeof obj !== 'object' || depth > 10) return;
  if (Array.isArray(obj)) {
    for (const item of obj) collectTypedEntities(item, result, depth + 1);
    return;
  }
  const rec = obj as AnyJson;
  if (rec.$type) result.push(rec);
  for (const v of Object.values(rec)) collectTypedEntities(v, result, depth + 1);
}

function extractEntitiesFromHtml(html: string): AnyJson[] {
  const all: AnyJson[] = [];
  const re = /<code[^>]*>([\s\S]*?)<\/code>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    let c = m[1].trim();
    if (c.startsWith('<!--') && c.endsWith('-->')) c = c.slice(4, -3);
    c = decodeHtmlEntities(c);
    try { collectTypedEntities(JSON.parse(c), all); } catch { /* skip */ }
  }
  return all;
}

interface HtmlProfileData {
  avatarCandidates: string[];
  locationCity: string | null;
  locationCountry: string | null;
  headline: string | null;
}

function extractProfileDataFromHtml(html: string, pseudo: string): HtmlProfileData {
  const entities = extractEntitiesFromHtml(html);

  const geo = entities.find(
    (e) => e.$type === 'com.linkedin.voyager.dash.common.Geo' && e.defaultLocalizedNameWithoutCountryName
  );
  const geoStr = geo?.defaultLocalizedName || null;
  const { city, country } = parseLocation(geoStr);

  const countryFromIso = geo?.countryISOCode
    ? COUNTRY_CODES[geo.countryISOCode.toLowerCase()] || geo.countryISOCode
    : null;

  const profile = entities.find(
    (e) => e.$type === 'com.linkedin.voyager.dash.identity.profile.Profile' && e.publicIdentifier === pseudo
  );

  const avatarCandidates = extractAllAvatarCandidates(entities, pseudo);
  console.log(`[Scrape] ${pseudo} HTML entities: ${entities.length} entities, ${avatarCandidates.length} avatar candidates`);

  return {
    avatarCandidates,
    locationCity: city,
    locationCountry: country || countryFromIso,
    headline: profile?.headline || null,
  };
}

async function fetchAuthenticatedPage(
  pseudo: string,
  creds?: LinkedInCredentials
): Promise<{ html: string; error?: string } | { html?: undefined; error: string }> {
  const headers = buildBrowserHeaders(creds);
  const url = `https://www.linkedin.com/in/${pseudo}/`;
  const res = await fetch(url, { headers, redirect: 'manual' });

  if (res.status === 301 || res.status === 302) {
    const loc = res.headers.get('location') || '';
    if (loc.includes(`/in/${pseudo}`)) {
      const full = loc.startsWith('/') ? `https://www.linkedin.com${loc}` : loc;
      const r2 = await fetch(full, { headers, redirect: 'manual' });
      if (!r2.ok) return { error: `LinkedIn HTTP ${r2.status}` };
      return { html: await r2.text() };
    }
    return { error: 'Cookie LinkedIn expiré ou invalide' };
  }

  const err = checkResponse(res);
  if (err) return { error: err };
  return { html: await res.text() };
}

// --- Step 3 & 4: Voyager API calls ---

function buildVoyagerHeaders(pseudo: string, creds?: LinkedInCredentials): Record<string, string> {
  const jsid = getJsessionId(creds);
  return {
    Cookie: `li_at=${getLiAt(creds)}; JSESSIONID="${jsid}"; lang=v=2&lang=fr-fr`,
    'Csrf-Token': jsid,
    'X-Li-Lang': 'fr_FR',
    'X-Restli-Protocol-Version': '2.0.0',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
    Accept: 'application/vnd.linkedin.normalized+json+2.1',
    'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
    Referer: `https://www.linkedin.com/in/${pseudo}/`,
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'X-Li-Page-Instance': `urn:li:page:d_flagship3_profile_view_base;${pseudo}`,
  };
}

function extractAvatarCandidatesFromGraphQL(included: AnyJson[]): string[] {
  const candidates: string[] = [];

  // miniProfile with picture -> VectorImage
  const mini = included.find(
    (i) => i.$type === 'com.linkedin.voyager.identity.shared.MiniProfile' && i.picture
  );
  if (mini?.picture) {
    const pic = mini.picture;
    if (pic['com.linkedin.common.VectorImage']) {
      const vi = pic['com.linkedin.common.VectorImage'];
      if (vi.rootUrl && Array.isArray(vi.artifacts)) {
        const sorted = [...vi.artifacts]
          .filter((a: AnyJson) => a.width && a.height)
          .sort((a: AnyJson, b: AnyJson) => (b.width || 0) - (a.width || 0));
        for (const art of sorted) {
          if (art.fileIdentifyingUrlPathSegment) {
            const url = `${vi.rootUrl}${art.fileIdentifyingUrlPathSegment}`;
            if (!candidates.includes(url)) candidates.push(url);
          }
        }
      }
    }
  }

  // VectorImage entities in included with profile-displayphoto
  const vectors = included.filter(
    (i) => i.$type === 'com.linkedin.common.VectorImage' && Array.isArray(i.artifacts)
  );
  for (const v of vectors) {
    const isProfilePhoto = v.artifacts?.some(
      (a: AnyJson) => a.fileIdentifyingUrlPathSegment?.includes('profile-displayphoto')
    );
    if (!isProfilePhoto) continue;
    const sorted = [...(v.artifacts || [])]
      .filter((a: AnyJson) => a.width && a.height)
      .sort((a: AnyJson, b: AnyJson) => (b.width || 0) - (a.width || 0));
    for (const art of sorted) {
      const url = buildVectorImageUrl(v, art);
      if (url && !candidates.includes(url)) candidates.push(url);
    }
  }

  return candidates;
}

async function fetchPositionUrn(
  pseudo: string, headers: Record<string, string>
): Promise<{ positionUrn: string | null; avatarCandidates: string[]; error?: string }> {
  const url = `${VOYAGER_API}/graphql?queryId=${GRAPHQL_QUERY_ID}&includeWebMetadata=true&variables=(vanityName:${pseudo})`;
  const res = await fetch(url, { headers, redirect: 'manual' });
  const err = checkResponse(res);
  if (err) return { positionUrn: null, avatarCandidates: [], error: err };

  const json = await res.json();
  const included = (json.included || []) as AnyJson[];
  const prof = included.find(
    (i) => i.$type?.includes('Profile') && i.publicIdentifier === pseudo
  ) || included.find(
    (i) => i.$type?.includes('Profile') && i.firstName
  );

  const avatarCandidates = extractAvatarCandidatesFromGraphQL(included);
  console.log(`[Scrape] ${pseudo} GraphQL: ${included.length} included, ${avatarCandidates.length} avatar candidates`);

  return { positionUrn: prof?.profileTopPosition?.['*elements']?.[0] || null, avatarCandidates };
}

async function fetchPositionDetails(
  urn: string, headers: Record<string, string>
): Promise<{
  title: string | null; company: string | null;
  contractType: string | null; error?: string;
}> {
  const url = `${VOYAGER_API}/identity/dash/profilePositions/${encodeURIComponent(urn)}`;
  const res = await fetch(url, { headers, redirect: 'manual' });
  const err = checkResponse(res);
  if (err) return { title: null, company: null, contractType: null, error: err };

  const json = await res.json();
  const d = json.data || json;

  let contractType: string | null = null;
  const empUrn = d.employmentTypeUrn;
  if (empUrn) {
    const id = empUrn.split(':').pop();
    contractType = (id && EMPLOYMENT_TYPES[id]) || null;
    console.log(`[Scrape] employmentTypeUrn=${empUrn} id=${id} mapped=${contractType}`);
  } else {
    console.log(`[Scrape] No employmentTypeUrn in position response. Keys: ${Object.keys(d).join(', ')}`);
  }

  return {
    title: d.title || null,
    company: d.companyName || null,
    contractType,
  };
}

// --- Main scrape function ---

export async function scrapeLinkedInProfile(
  linkedinPseudo: string,
  creds?: LinkedInCredentials
): Promise<{ success: true; data: LinkedInScrapedData } | { success: false; error: string; partialData?: Partial<LinkedInScrapedData> }> {
  try {
    const allAvatarCandidates: string[] = [];

    // 1. Public avatar via og:image (no auth)
    const publicAvatar = await fetchPublicAvatar(linkedinPseudo);
    if (publicAvatar) allAvatarCandidates.push(publicAvatar);

    // 2. Authenticated HTML page (location + avatar from entities)
    const pageResult = await fetchAuthenticatedPage(linkedinPseudo, creds);
    if (pageResult.error && !pageResult.html) {
      return {
        success: false,
        error: pageResult.error,
        partialData: { avatarUrl: publicAvatar, avatarCandidates: allAvatarCandidates },
      };
    }

    const htmlData = extractProfileDataFromHtml(pageResult.html!, linkedinPseudo);
    for (const c of htmlData.avatarCandidates) {
      if (!allAvatarCandidates.includes(c)) allAvatarCandidates.push(c);
    }

    // 3. GraphQL call -> positionUrn + avatar candidates
    await randomDelay(DELAY_MS);
    const voyagerHeaders = buildVoyagerHeaders(linkedinPseudo, creds);
    const gql = await fetchPositionUrn(linkedinPseudo, voyagerHeaders);

    for (const c of gql.avatarCandidates) {
      if (!allAvatarCandidates.includes(c)) allAvatarCandidates.push(c);
    }

    const avatarUrl = allAvatarCandidates[0] || null;
    console.log(`[Scrape] ${linkedinPseudo} avatar: ${allAvatarCandidates.length} total candidates, best=${avatarUrl ? avatarUrl.substring(0, 60) + '...' : 'null'}`);

    if (gql.error && isCriticalError(gql.error)) {
      return {
        success: false,
        error: gql.error,
        partialData: {
          avatarUrl,
          avatarCandidates: allAvatarCandidates,
          currentJobTitle: htmlData.headline,
          locationCity: htmlData.locationCity,
          locationCountry: htmlData.locationCountry,
        },
      };
    }

    // 4. Position details -> title, company, contract type
    let posTitle: string | null = null;
    let posCompany: string | null = null;
    let contractType: string | null = null;

    if (gql.positionUrn) {
      await randomDelay(DELAY_MS);
      const pos = await fetchPositionDetails(gql.positionUrn, voyagerHeaders);

      if (pos.error && isCriticalError(pos.error)) {
        return {
          success: false,
          error: pos.error,
          partialData: {
            avatarUrl,
            avatarCandidates: allAvatarCandidates,
            currentJobTitle: htmlData.headline,
            locationCity: htmlData.locationCity,
            locationCountry: htmlData.locationCountry,
          },
        };
      }

      posTitle = pos.title;
      posCompany = pos.company;
      contractType = pos.contractType;
    }

    return {
      success: true,
      data: {
        avatarUrl,
        avatarCandidates: allAvatarCandidates,
        currentJobTitle: posTitle || htmlData.headline,
        currentCompany: posCompany,
        currentContractType: contractType,
        locationCity: htmlData.locationCity,
        locationCountry: htmlData.locationCountry,
      },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur inconnue' };
  }
}
