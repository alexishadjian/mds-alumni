import { getLinkedInTokenInfo, getSettings } from '@/lib/actions/settings';
import { LinkedInSettingsForm } from '@/components/admin/linkedin-settings-form';

export default async function SettingsPage() {
  const [tokenInfo, settings] = await Promise.all([
    getLinkedInTokenInfo(),
    getSettings(['linkedin_li_at', 'linkedin_jsessionid']),
  ]);

  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-[#2CB8C5]">
          Configuration
        </p>
        <h1 className="font-bricolage text-3xl font-bold text-[#3C3C3B]">Réglages</h1>
        <p className="mt-1 text-sm text-[#3C3C3B]/45">
          Paramètres de l&apos;application et intégrations externes.
        </p>
      </div>

      <LinkedInSettingsForm
        initialLiAt={settingsMap['linkedin_li_at'] ?? ''}
        initialJsessionId={settingsMap['linkedin_jsessionid'] ?? ''}
        tokenInfo={tokenInfo}
      />
    </div>
  );
}
